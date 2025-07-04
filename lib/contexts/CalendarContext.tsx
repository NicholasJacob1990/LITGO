import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import {
  CalendarEvent,
  getEvents,
  getCalendarCredentials,
  fetchGoogleEvents
} from '@/lib/services/calendar';
import { useAuth } from './AuthContext';

interface CalendarContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  refetchEvents: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Função memoizada para ser usada manualmente pelos componentes
  const refetchEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('ℹ️ Buscando eventos do banco de dados local...');
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const localEvents = await getEvents(userId, startDate, endDate);
      setEvents(localEvents || []);
    } catch (e) {
      console.error('Error fetching events:', e);
      setError(e as Error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Carrega eventos automaticamente quando o ID do usuário estiver disponível
  useEffect(() => {
    // Somente dispara quando userId mudar (inclusive de null -> valor)
    if (userId) {
      refetchEvents();
    } else {
      // Se o usuário ainda não estiver logado, limpa os estados para evitar loops
      setEvents([]);
      setIsLoading(false);
    }
  }, [userId, refetchEvents]);

  return (
    <CalendarContext.Provider value={{ events, isLoading, error, refetchEvents }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}; 