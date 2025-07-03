import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { SupportTicket, getSupportTickets } from '@/lib/services/support';
import { useAuth } from './AuthContext';

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

  const fetchTickets = async () => {
    if (!user) {
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
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user?.id){
      fetchTickets();
    }
  }, [user?.id]);

  return (
    <SupportContext.Provider value={{ tickets, isLoading, error, refetchTickets: fetchTickets }}>
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