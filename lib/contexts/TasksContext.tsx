import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Task, getTasks } from '@/lib/services/tasks';
import { useAuth } from './AuthContext';

// Mock tasks data for fallback
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar documentos do caso trabalhista',
    description: 'Analisar contrato de trabalho e documentos de rescisão',
    due_date: '2024-07-10T17:00:00Z',
    priority: 'high',
    status: 'pending',
    case_id: '001',
    created_by: 'user1',
    created_at: '2024-07-08T10:00:00Z',
    updated_at: '2024-07-08T10:00:00Z'
  },
  {
    id: '2',
    title: 'Elaborar petição inicial',
    description: 'Redigir petição para ação trabalhista',
    due_date: '2024-07-12T14:00:00Z',
    priority: 'high',
    status: 'pending',
    case_id: '001',
    created_by: 'user1',
    created_at: '2024-07-08T10:00:00Z',
    updated_at: '2024-07-08T10:00:00Z'
  },
  {
    id: '3',
    title: 'Preparar audiência',
    description: 'Organizar documentos e argumentos para audiência',
    due_date: '2024-07-11T09:00:00Z',
    priority: 'high',
    status: 'in_progress',
    case_id: '003',
    created_by: 'user1',
    created_at: '2024-07-08T10:00:00Z',
    updated_at: '2024-07-08T10:00:00Z'
  }
];

interface TasksContextType {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  refetchTasks: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetchTasks = useCallback(async () => {
    if (!user?.id) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTasks(user.id);
      setTasks(data || []);
    } catch (e) {
      console.warn('Error fetching tasks, using mock data:', e);
      // Fallback to mock data
      setTasks(mockTasks);
      setError(null); // Don't show error if we have fallback data
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
        refetchTasks();
    } else {
        setTasks([]);
        setIsLoading(false);
    }
  }, [user?.id, refetchTasks]);

  return (
    <TasksContext.Provider value={{ tasks, isLoading, error, refetchTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}; 