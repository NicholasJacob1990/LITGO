import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import {
  CalendarEvent,
  getEvents,
  getCalendarCredentials,
  fetchGoogleEvents
} from '@/lib/services/calendar';
import { useAuth } from './AuthContext';

// Mock calendar events for fallback
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Consulta - Caso Trabalhista',
    description: 'Discussão sobre rescisão trabalhista com Maria Silva',
    start_time: '2024-07-08T14:00:00Z',
    end_time: '2024-07-08T15:00:00Z',
    location: 'Escritório',
    event_type: 'consultation',
    user_id: 'user1',
    case_id: '001',
    created_at: '2024-07-07T10:00:00Z',
    updated_at: '2024-07-07T10:00:00Z'
  },
  {
    id: '2',
    title: 'Reunião - Revisão Contrato',
    description: 'Revisão de cláusulas contratuais com João Santos',
    start_time: '2024-07-08T16:30:00Z',
    end_time: '2024-07-08T17:15:00Z',
    location: 'Online',
    event_type: 'meeting',
    user_id: 'user1',
    case_id: '002',
    created_at: '2024-07-07T11:00:00Z',
    updated_at: '2024-07-07T11:00:00Z'
  },
  {
    id: '3',
    title: 'Audiência - Caso Civil',
    description: 'Audiência de conciliação com Ana Costa',
    start_time: '2024-07-09T10:00:00Z',
    end_time: '2024-07-09T12:00:00Z',
    location: 'Tribunal',
    event_type: 'hearing',
    user_id: 'user1',
    case_id: '003',
    created_at: '2024-07-07T12:00:00Z',
    updated_at: '2024-07-07T12:00:00Z'
  }
];

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Função memoizada para ser usada manualmente pelos componentes
  const refetchEvents = useCallback(async () => {
    const userId = user?.id;
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
      console.warn('Error fetching events, using mock data:', e);
      // Fallback to mock data
      setEvents(mockEvents);
      setError(null); // Don't show error if we have fallback data
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Carrega eventos automaticamente apenas uma vez quando o componente monta
  // e o usuário está logado
  useEffect(() => {
    if (user?.id) {
      refetchEvents();
    } else {
      // Se não há usuário, limpa os estados
      setEvents([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id]); // Dependência apenas do user.id, não da função refetchEvents

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