import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useSupport } from '../../lib/contexts/SupportContext';
import { createSupportTicket } from '../../lib/services/support';
import Badge from '../../components/atoms/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SupportScreen() {
  const { user } = useAuth();
  const { tickets, isLoading, refetchTickets } = useSupport();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o assunto do ticket');
      return;
    }

    setIsSubmitting(true);
         try {
       if (!user) throw new Error('User not authenticated');
       
       await createSupportTicket({
         creator_id: user.id,
         subject: newTicketSubject,
         priority: newTicketPriority,
       });
      
      setNewTicketSubject('');
      setNewTicketPriority('medium');
      setShowNewTicketForm(false);
      Alert.alert('Sucesso', 'Ticket criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      Alert.alert('Erro', 'Falha ao criar ticket. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#ef4444';
      case 'in_progress':
        return '#f59e0b';
      case 'closed':
        return '#10b981';
      case 'on_hold':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Andamento';
      case 'closed':
        return 'Fechado';
      case 'on_hold':
        return 'Em Espera';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Crítica';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetchTickets} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Suporte</Text>
        <TouchableOpacity
          style={styles.newTicketButton}
          onPress={() => setShowNewTicketForm(!showNewTicketForm)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.newTicketButtonText}>Novo Ticket</Text>
        </TouchableOpacity>
      </View>

      {showNewTicketForm && (
        <View style={styles.newTicketForm}>
          <Text style={styles.formTitle}>Criar Novo Ticket</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Assunto do problema"
            value={newTicketSubject}
            onChangeText={setNewTicketSubject}
            maxLength={100}
          />
          
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Prioridade:</Text>
            <View style={styles.priorityButtons}>
              {['low', 'medium', 'high', 'critical'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    newTicketPriority === priority && styles.priorityButtonActive
                  ]}
                  onPress={() => setNewTicketPriority(priority as any)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    newTicketPriority === priority && styles.priorityButtonTextActive
                  ]}>
                    {getPriorityText(priority)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowNewTicketForm(false);
                setNewTicketSubject('');
                setNewTicketPriority('medium');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.formButton, styles.submitButton]}
              onPress={handleCreateTicket}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Criando...' : 'Criar Ticket'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.ticketsList}>
        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>
              Nenhum ticket de suporte encontrado
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Crie um novo ticket para relatar problemas ou fazer perguntas
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{ticket.subject}</Text>
                                 <View style={styles.ticketBadges}>
                   <Badge
                     label={getStatusText(ticket.status || 'open')}
                     intent="danger"
                   />
                   <Badge
                     label={getPriorityText(ticket.priority || 'medium')}
                     intent="warning"
                   />
                 </View>
              </View>
              
                             <View style={styles.ticketFooter}>
                 <Text style={styles.ticketDate}>
                   {format(new Date(), 'dd/MM/yyyy HH:mm', {
                     locale: ptBR,
                   })}
                 </Text>
                <TouchableOpacity style={styles.viewTicketButton}>
                  <Text style={styles.viewTicketButtonText}>Ver Detalhes</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  newTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  newTicketButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  newTicketForm: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#3b82f6',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  ticketsList: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  ticketBadges: {
    gap: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewTicketButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
}); 