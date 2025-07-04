import supabase from '@/lib/supabase';

// Tipos para o serviço de vídeo
export interface VideoRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  expires_at: string;
  config: {
    max_participants: number;
    enable_recording: boolean;
    enable_chat: boolean;
    enable_screenshare: boolean;
  };
}

export interface VideoSession {
  id: string;
  room_id: string;
  case_id?: string;
  client_id: string;
  lawyer_id: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  recording_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomRequest {
  name: string;
  case_id?: string;
  client_id: string;
  lawyer_id: string;
  max_participants?: number;
  enable_recording?: boolean;
  enable_chat?: boolean;
  enable_screenshare?: boolean;
}

export interface JoinRoomRequest {
  room_id: string;
  user_id: string;
  user_name: string;
  is_owner?: boolean;
}

// Configurações da API Daily.co
const DAILY_API_URL = 'https://api.daily.co/v1';
const DAILY_API_KEY = process.env.EXPO_PUBLIC_DAILY_API_KEY || '';

// Headers padrão para requisições à API Daily.co
const getDailyHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${DAILY_API_KEY}`,
});

/**
 * Cria uma nova sala de vídeo no Daily.co
 */
export const createVideoRoom = async (request: CreateRoomRequest): Promise<VideoRoom> => {
  try {
    // 1. Criar sala no Daily.co
    const roomResponse = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: getDailyHeaders(),
      body: JSON.stringify({
        name: request.name,
        properties: {
          max_participants: request.max_participants || 2,
          enable_recording: request.enable_recording || false,
          enable_chat: request.enable_chat || true,
          enable_screenshare: request.enable_screenshare || true,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
        },
      }),
    });

    if (!roomResponse.ok) {
      const error = await roomResponse.json();
      throw new Error(`Erro ao criar sala: ${error.error || 'Erro desconhecido'}`);
    }

    const dailyRoom = await roomResponse.json();

    // 2. Salvar informações da sala no Supabase
    const { data: videoRoom, error: dbError } = await supabase
      .from('video_rooms')
      .insert([
        {
          id: dailyRoom.id,
          name: dailyRoom.name,
          url: dailyRoom.url,
          expires_at: new Date(dailyRoom.properties.exp * 1000).toISOString(),
          config: {
            max_participants: dailyRoom.properties.max_participants,
            enable_recording: dailyRoom.properties.enable_recording,
            enable_chat: dailyRoom.properties.enable_chat,
            enable_screenshare: dailyRoom.properties.enable_screenshare,
          },
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar sala no banco:', dbError);
      throw new Error('Erro ao salvar informações da sala');
    }

    // 3. Criar sessão de vídeo
    const { data: session, error: sessionError } = await supabase
      .from('video_sessions')
      .insert([
        {
          room_id: dailyRoom.id,
          case_id: request.case_id,
          client_id: request.client_id,
          lawyer_id: request.lawyer_id,
          status: 'scheduled',
        },
      ])
      .select()
      .single();

    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError);
      throw new Error('Erro ao criar sessão de vídeo');
    }

    return videoRoom;
  } catch (error) {
    console.error('Erro no createVideoRoom:', error);
    throw error;
  }
};

/**
 * Gera um token de acesso para um usuário entrar na sala
 */
export const generateRoomToken = async (request: JoinRoomRequest): Promise<string> => {
  try {
    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: getDailyHeaders(),
      body: JSON.stringify({
        properties: {
          room_name: request.room_id,
          user_name: request.user_name,
          is_owner: request.is_owner || false,
          exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 horas
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao gerar token: ${error.error || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Erro no generateRoomToken:', error);
    throw error;
  }
};

/**
 * Busca informações de uma sala de vídeo
 */
export const getVideoRoom = async (roomId: string): Promise<VideoRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('video_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Sala não encontrada
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro no getVideoRoom:', error);
    throw error;
  }
};

/**
 * Busca sessões de vídeo de um usuário
 */
export const getUserVideoSessions = async (userId: string): Promise<VideoSession[]> => {
  try {
    const { data, error } = await supabase
      .from('video_sessions')
      .select(`
        *,
        video_rooms (
          name,
          url,
          config
        )
      `)
      .or(`client_id.eq.${userId},lawyer_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro no getUserVideoSessions:', error);
    throw error;
  }
};

/**
 * Atualiza o status de uma sessão de vídeo
 */
export const updateVideoSessionStatus = async (
  sessionId: string,
  status: VideoSession['status'],
  metadata?: { duration_minutes?: number; recording_url?: string }
): Promise<void> => {
  try {
    const updates: any = { status, updated_at: new Date().toISOString() };

    if (status === 'active' && !metadata?.duration_minutes) {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'ended') {
      updates.ended_at = new Date().toISOString();
      if (metadata?.duration_minutes) {
        updates.duration_minutes = metadata.duration_minutes;
      }
      if (metadata?.recording_url) {
        updates.recording_url = metadata.recording_url;
      }
    }

    const { error } = await supabase
      .from('video_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro no updateVideoSessionStatus:', error);
    throw error;
  }
};

/**
 * Deleta uma sala de vídeo (tanto no Daily.co quanto no banco)
 */
export const deleteVideoRoom = async (roomId: string): Promise<void> => {
  try {
    // 1. Deletar no Daily.co
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: getDailyHeaders(),
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      console.warn(`Aviso ao deletar sala do Daily.co: ${error.error || 'Erro desconhecido'}`);
    }

    // 2. Deletar do banco (mesmo que falhe no Daily.co)
    const { error: dbError } = await supabase
      .from('video_rooms')
      .delete()
      .eq('id', roomId);

    if (dbError) {
      console.error('Erro ao deletar sala do banco:', dbError);
      throw new Error('Erro ao deletar sala do banco de dados');
    }
  } catch (error) {
    console.error('Erro no deleteVideoRoom:', error);
    throw error;
  }
};

/**
 * Busca sessão de vídeo por ID
 */
export const getVideoSession = async (sessionId: string): Promise<VideoSession | null> => {
  try {
    const { data, error } = await supabase
      .from('video_sessions')
      .select(`
        *,
        video_rooms (
          name,
          url,
          config
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro no getVideoSession:', error);
    throw error;
  }
};

/**
 * Cria uma consulta de vídeo entre cliente e advogado
 */
export const createVideoConsultation = async (
  clientId: string,
  lawyerId: string,
  caseId?: string
): Promise<{ room: VideoRoom; session: VideoSession; clientToken: string; lawyerToken: string }> => {
  try {
    // 1. Buscar dados do cliente e advogado
    const [clientData, lawyerData] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', clientId).single(),
      supabase.from('profiles').select('full_name').eq('id', lawyerId).single(),
    ]);

    if (clientData.error || lawyerData.error) {
      throw new Error('Erro ao buscar dados dos participantes');
    }

    // 2. Criar sala
    const roomName = `consulta-${Date.now()}`;
    const room = await createVideoRoom({
      name: roomName,
      case_id: caseId,
      client_id: clientId,
      lawyer_id: lawyerId,
      max_participants: 2,
      enable_recording: true,
      enable_chat: true,
      enable_screenshare: true,
    });

    // 3. Gerar tokens para ambos os participantes
    const [clientToken, lawyerToken] = await Promise.all([
      generateRoomToken({
        room_id: room.id,
        user_id: clientId,
        user_name: clientData.data.full_name || 'Cliente',
        is_owner: false,
      }),
      generateRoomToken({
        room_id: room.id,
        user_id: lawyerId,
        user_name: lawyerData.data.full_name || 'Advogado',
        is_owner: true,
      }),
    ]);

    // 4. Buscar sessão criada
    const { data: session, error: sessionError } = await supabase
      .from('video_sessions')
      .select('*')
      .eq('room_id', room.id)
      .single();

    if (sessionError) {
      throw new Error('Erro ao buscar sessão criada');
    }

    return {
      room,
      session,
      clientToken,
      lawyerToken,
    };
  } catch (error) {
    console.error('Erro no createVideoConsultation:', error);
    throw error;
  }
}; 