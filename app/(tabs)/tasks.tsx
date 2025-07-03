import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useTasks } from '@/lib/contexts/TasksContext';
import { CheckSquare, Clock, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react-native';
import { deleteTask, updateTaskStatus, Task } from '@/lib/services/tasks';
import TaskForm from '@/components/organisms/TaskForm';

const TaskItem = ({ item, onEdit, onDelete, onToggleStatus }: { 
  item: any; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string, currentStatus: string) => void;
}) => {
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare size={18} color="#10B981" />;
      case 'overdue':
        return <AlertCircle size={18} color="#EF4444" />;
      default:
        return <Clock size={18} color="#F59E0B" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem prazo';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleLongPress = () => {
    Alert.alert(
      'Ações da Tarefa',
      'O que você deseja fazer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => onEdit(item) },
        { text: 'Excluir', onPress: () => onDelete(item.id), style: 'destructive' },
      ]
    );
  };

  const handlePress = () => {
    // Alternar status entre pendente/concluída
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    onToggleStatus(item.id, newStatus);
  };

  return (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <View style={styles.statusIcon}>{getStatusIndicator(item.status)}</View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.status === 'completed' && styles.completedTask]}>
          {item.title}
        </Text>
        <Text style={styles.taskCase}>Caso: {item.case?.title || 'Geral'}</Text>
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.taskFooter}>
          <Text style={styles.taskDueDate}>Prazo: {formatDate(item.due_date)}</Text>
          <View style={[styles.priorityBadge, {backgroundColor: item.priority > 7 ? '#FEE2E2' : (item.priority > 4 ? '#FEF3C7' : '#E0E7FF')}]}>
            <Text style={[styles.priorityText, {color: item.priority > 7 ? '#991B1B' : (item.priority > 4 ? '#92400E' : '#3730A3')}]}>
              Prioridade: {item.priority}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit(item)}
        >
          <Edit size={16} color="#64748B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function TasksScreen() {
  const { tasks, isLoading, error, refetchTasks } = useTasks();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalVisible(true);
  };

  const handleDelete = async (taskId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              await refetchTasks();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          }
        },
      ]
    );
  };

  const handleToggleStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus as Task['status']);
      await refetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTaskToEdit(null);
  };

  const handleNewTask = () => {
    setTaskToEdit(null);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarefas e Prazos</Text>
        <Text style={styles.headerSubtitle}>
          Toque para marcar como concluída • Pressione e segure para mais opções
        </Text>
      </View>

      {isLoading && <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.errorText}>Erro ao carregar tarefas: {error.message}</Text>}

      {!isLoading && !error && (
        <FlatList
          data={tasks}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <TaskItem 
              item={item} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CheckSquare size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Nenhuma tarefa encontrada.</Text>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleNewTask}>
        <Plus size={28} color="white" />
      </TouchableOpacity>

      <TaskForm 
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIcon: {
    marginRight: 15,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskCase: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  taskDescription: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#475569',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#0F172A',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
}); 