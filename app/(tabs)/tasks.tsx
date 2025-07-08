import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CheckSquare, Plus, Calendar, Clock, User, Filter } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTasks } from '@/lib/contexts/TasksContext';

// Mock data para tarefas
const mockTasks = [
  {
    id: '1',
    title: 'Revisar documentos do caso trabalhista',
    description: 'Analisar contrato de trabalho e documentos de rescisão',
    due_date: '2024-07-10T17:00:00Z',
    priority: 'high' as const,
    status: 'pending' as const,
    case_id: '001',
    case_title: 'Rescisão Trabalhista Indevida',
    client_name: 'Maria Silva'
  },
  {
    id: '2',
    title: 'Elaborar petição inicial',
    description: 'Redigir petição para ação trabalhista',
    due_date: '2024-07-12T14:00:00Z',
    priority: 'high' as const,
    status: 'pending' as const,
    case_id: '001',
    case_title: 'Rescisão Trabalhista Indevida',
    client_name: 'Maria Silva'
  },
  {
    id: '3',
    title: 'Analisar proposta de acordo',
    description: 'Avaliar proposta apresentada pela parte contrária',
    due_date: '2024-07-09T16:00:00Z',
    priority: 'medium' as const,
    status: 'in_progress' as const,
    case_id: '002',
    case_title: 'Revisão de Contrato',
    client_name: 'João Santos'
  },
  {
    id: '4',
    title: 'Preparar audiência',
    description: 'Organizar documentos e argumentos para audiência',
    due_date: '2024-07-11T09:00:00Z',
    priority: 'high' as const,
    status: 'pending' as const,
    case_id: '003',
    case_title: 'Ação Civil',
    client_name: 'Ana Costa'
  },
];

export default function TasksScreen() {
  const { role } = useAuth();
  const { tasks, isLoading, refetchTasks } = useTasks();
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (refetchTasks) {
      refetchTasks();
    }
  }, [refetchTasks]);

  // Use mock tasks if no real tasks are available
  const displayTasks = tasks?.length > 0 ? tasks : mockTasks;

  const handleNewTask = () => {
    Alert.alert(
      'Nova Tarefa',
      'Funcionalidade de criação de tarefas em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  const handleTaskPress = (task: any) => {
    Alert.alert(
      task.title,
      task.description || 'Detalhes da tarefa',
      [
        { text: 'Marcar como Concluída', onPress: () => markTaskComplete(task.id) },
        { text: 'Editar', onPress: () => editTask(task.id) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const markTaskComplete = (taskId: string) => {
    Alert.alert('Sucesso', 'Tarefa marcada como concluída!');
  };

  const editTask = (taskId: string) => {
    Alert.alert('Editar', 'Funcionalidade de edição em desenvolvimento');
  };

  const filteredTasks = displayTasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return task.status === 'pending';
    if (activeFilter === 'in_progress') return task.status === 'in_progress';
    if (activeFilter === 'completed') return task.status === 'completed';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#DC2626';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'pending': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Only show for lawyers
  if (role !== 'lawyer') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Acesso Restrito</Text>
            <Text style={styles.headerSubtitle}>
              Esta funcionalidade é exclusiva para advogados
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.restrictedContent}>
          <CheckSquare size={48} color="#9CA3AF" />
          <Text style={styles.restrictedTitle}>Área Restrita</Text>
          <Text style={styles.restrictedDescription}>
            O gerenciamento de tarefas está disponível apenas para advogados.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tarefas e Prazos</Text>
          <Text style={styles.headerSubtitle}>
            Gerencie suas tarefas e prazos processuais
          </Text>
          
          <TouchableOpacity style={styles.newButton} onPress={handleNewTask}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.newButtonText}>Nova Tarefa</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'in_progress', label: 'Em Andamento' },
            { id: 'completed', label: 'Concluídas' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter.id && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando tarefas...</Text>
          </View>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleTaskPress(task)}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskBadges}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                      <Text style={styles.statusText}>{task.status}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {task.description && (
                <Text style={styles.taskDescription}>{task.description}</Text>
              )}
              
              <View style={styles.taskDetails}>
                <View style={styles.taskDetail}>
                  <Calendar size={16} color="#6B7280" />
                  <Text style={styles.taskDetailText}>
                    Vencimento: {formatDate(task.due_date)}
                  </Text>
                </View>
                
                {task.case_title && (
                  <View style={styles.taskDetail}>
                    <User size={16} color="#6B7280" />
                    <Text style={styles.taskDetailText}>
                      {task.case_title} - {task.client_name}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <CheckSquare size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Nenhuma tarefa encontrada</Text>
            <Text style={styles.emptyStateDescription}>
              {activeFilter === 'all' 
                ? 'Você não possui tarefas no momento.'
                : `Nenhuma tarefa ${activeFilter === 'pending' ? 'pendente' : activeFilter === 'in_progress' ? 'em andamento' : 'concluída'}.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 24,
    textAlign: 'center',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D47A1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#0D47A1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  taskDetails: {
    gap: 8,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  restrictedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});