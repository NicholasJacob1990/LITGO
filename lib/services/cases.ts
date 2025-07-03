import supabase from '@/lib/supabase';

/**
 * Busca os casos de um usuário (advogado ou cliente).
 * Esta função pode ser mais elaborada no futuro, mas por enquanto
 * busca os casos onde o usuário é o advogado.
 * @param userId - O ID do usuário (advogado).
 */
export const getUserCases = async (userId: string) => {
  const { data, error } = await supabase
    .from('cases')
    .select('id, status, ai_analysis, client_id, lawyer_id, created_at, updated_at') // Colunas que existem
    .eq('lawyer_id', userId) 
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user cases:', error);
    throw error;
  }
  return data;
}; 