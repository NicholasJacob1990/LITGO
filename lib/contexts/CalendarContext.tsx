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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 3. Fallback: busca eventos do nosso DB (simplificado para evitar erros)
      console.log('ℹ️ Buscando eventos do banco de dados local...');
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const localEvents = await getEvents(user.id, startDate, endDate);
      setEvents(localEvents || []);
    } catch (e) {
      console.error('Error fetching events:', e);
      setError(e as Error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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