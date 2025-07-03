import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Tenta buscar credenciais do Google
      const credentials = await getCalendarCredentials(user.id, 'google');

      if (credentials?.access_token) {
        // 2. Se tiver token, busca eventos da API do Google
        console.log('✅ Buscando eventos da API do Google...');
        const googleEvents = await fetchGoogleEvents(credentials.access_token);
        setEvents(googleEvents);
      } else {
        // 3. Fallback: Se não tiver, busca eventos do nosso DB
        console.log('ℹ️ Buscando eventos do banco de dados local...');
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const localEvents = await getEvents(user.id, startDate, endDate);
        setEvents(localEvents || []);
      }
    } catch (e) {
      setError(e as Error);
      console.error('Falha ao buscar eventos, tentando fallback...', e);
      // Se a busca na API do Google falhar, tenta o fallback para o DB local
      try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const localEvents = await getEvents(user.id, startDate, endDate);
        setEvents(localEvents || []);
      } catch (fallbackError) {
        console.error('Falha no fallback também.', fallbackError);
        setError(fallbackError as Error);
      }

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  return (
    <CalendarContext.Provider value={{ events, isLoading, error, refetchEvents: fetchEvents }}>
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