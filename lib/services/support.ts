import supabase from '@/lib/supabase';

// Tipos para os dados de suporte
export interface SupportTicket {
    id?: string;
    creator_id: string;
    case_id?: string;
    subject: string;
    status?: 'open' | 'in_progress' | 'closed' | 'on_hold';
    priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SupportMessage {
    id?: string;
    ticket_id: string;
    sender_id: string;
    content: string;
}

/**
 * Busca todos os tickets de suporte criados por um usuário.
 * @param creatorId - O ID do usuário que criou os tickets.
 */
export const getSupportTickets = async (creatorId: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
  return data;
};

/**
 * Cria um novo ticket de suporte.
 * @param ticketData - Os dados do ticket.
 */
export const createSupportTicket = async (ticketData: SupportTicket) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([ticketData])
    .select()
    .single();

  if (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
  return data;
};

/**
 * Busca as mensagens de um ticket de suporte específico.
 * @param ticketId - O ID do ticket.
 */
export const getSupportMessages = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('support_messages')
    .select(`
      *,
      sender:profiles (full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching support messages:', error);
    throw error;
  }
  return data;
};

/**
 * Envia uma nova mensagem em um ticket.
 * @param messageData - Os dados da mensagem.
 */
export const sendSupportMessage = async (messageData: SupportMessage) => {
    const { data, error } = await supabase
      .from('support_messages')
      .insert([messageData])
      .select()
      .single();
  
    if (error) {
      console.error('Error sending support message:', error);
      throw error;
    }
    return data;
}; 