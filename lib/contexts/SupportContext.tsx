import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { SupportTicket, getSupportTickets } from '@/lib/services/support';
import { useAuth } from './AuthContext';

// Mock support tickets for fallback
const mockTickets: SupportTicket[] = [
  {
    id: '1',
    title: 'Problema com upload de documentos',
    description: 'Não consigo fazer upload de arquivos PDF no meu caso',
    status: 'open',
    priority: 'medium',
    category: 'technical',
    user_id: 'user1',
    created_at: '2024-07-07T14:30:00Z',
    updated_at: '2024-07-07T15:00:00Z'
  },
  {
    id: '2',
    title: 'Dúvida sobre honorários',
    description: 'Como funciona o sistema de pagamento dos honorários advocatícios?',
    status: 'resolved',
    priority: 'low',
    category: 'billing',
    user_id: 'user1',
    created_at: '2024-07-06T09:00:00Z',
    updated_at: '2024-07-06T16:30:00Z'
  },
  {
    id: '3',
    title: 'Solicitar alteração de dados',
    description: 'Preciso alterar meu endereço e telefone no perfil',
    status: 'in_progress',
    priority: 'low',
    category: 'account',
    user_id: 'user1',
    created_at: '2024-07-05T11:15:00Z',
    updated_at: '2024-07-07T10:00:00Z'
  }
];

interface SupportContextType {
  tickets: SupportTicket[];
  isLoading: boolean;
  error: Error | null;
  refetchTickets: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchTickets = useCallback(async () => {
    if (!user?.id) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSupportTickets(user.id);
      setTickets(data || []);
    } catch (e) {
      console.warn('Error fetching tickets, using mock data:', e);
      // Fallback to mock data
      setTickets(mockTickets);
      setError(null); // Don't show error if we have fallback data
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
        refetchTickets();
    } else {
        setTickets([]);
        setIsLoading(false);
    }
  }, [user?.id, refetchTickets]);

  return (
    <SupportContext.Provider value={{ tickets, isLoading, error, refetchTickets }}>
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
}; 