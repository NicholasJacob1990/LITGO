import supabase from '@/lib/supabase';

export interface CaseData {
  id: string;
  status: 'pending_assignment' | 'assigned' | 'in_progress' | 'closed' | 'cancelled';
  ai_analysis?: any;
  client_id: string;
  lawyer_id?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  client_type?: 'PF' | 'PJ';
  unread_messages?: number;
  lawyer?: {
    name: string;
    avatar?: string;
    specialty?: string;
  };
  client?: {
    name: string;
    avatar?: string;
    type: 'PF' | 'PJ';
  };
}

/**
 * Busca os casos de um usuário usando a função RPC corrigida
 * @param userId - O ID do usuário
 */
export const getUserCases = async (userId: string): Promise<CaseData[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .rpc('get_user_cases', { p_user_id: userId });

  if (error) {
    console.error('Error fetching user cases:', error);
    throw error;
  }
  return data || [];
};

/**
 * Busca um caso específico por ID
 * @param caseId - O ID do caso
 */
export const getCaseById = async (caseId: string): Promise<CaseData | null> => {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      id,
      status,
      ai_analysis,
      client_id,
      lawyer_id,
      created_at,
      updated_at,
      profiles!cases_client_id_fkey (
        full_name,
        avatar_url,
        user_type
      ),
      profiles!cases_lawyer_id_fkey (
        full_name,
        avatar_url,
        specialization
      )
    `)
    .eq('id', caseId)
    .single();

  if (error) {
    console.error('Error fetching case by ID:', error);
    throw error;
  }

  return data;
};

/**
 * Atualiza o status de um caso
 * @param caseId - O ID do caso
 * @param status - O novo status
 */
export const updateCaseStatus = async (
  caseId: string, 
  status: CaseData['status']
): Promise<void> => {
  const { error } = await supabase
    .from('cases')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', caseId);

  if (error) {
    console.error('Error updating case status:', error);
    throw error;
  }
};

/**
 * Busca a análise de IA de um caso
 * @param caseId - O ID do caso
 */
export const getAIAnalysis = async (caseId: string): Promise<any> => {
  const { data, error } = await supabase
    .from('cases')
    .select('ai_analysis')
    .eq('id', caseId)
    .single();

  if (error) {
    console.error('Error fetching AI analysis:', error);
    throw error;
  }

  return data?.ai_analysis;
};

/**
 * Atualiza a análise de IA de um caso
 * @param caseId - O ID do caso
 * @param analysis - A análise de IA
 */
export const updateAIAnalysis = async (
  caseId: string, 
  analysis: any
): Promise<void> => {
  const { error } = await supabase
    .from('cases')
    .update({ ai_analysis: analysis, updated_at: new Date().toISOString() })
    .eq('id', caseId);

  if (error) {
    console.error('Error updating AI analysis:', error);
    throw error;
  }
};

/**
 * Busca estatísticas de casos de um usuário
 * @param userId - O ID do usuário
 */
export const getCaseStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('cases')
    .select('status')
    .or(`client_id.eq.${userId},lawyer_id.eq.${userId}`);

  if (error) {
    console.error('Error fetching case stats:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    pending_assignment: data.filter(c => c.status === 'pending_assignment').length,
    assigned: data.filter(c => c.status === 'assigned').length,
    in_progress: data.filter(c => c.status === 'in_progress').length,
    closed: data.filter(c => c.status === 'closed').length,
    cancelled: data.filter(c => c.status === 'cancelled').length,
  };

  return stats;
}; 