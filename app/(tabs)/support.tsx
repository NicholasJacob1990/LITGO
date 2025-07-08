import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { HelpCircle, Plus, MessageCircle, FileText, Star, Send } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock data para tickets de suporte
const mockTickets = [
  {
    id: '1',
    title: 'Problema com upload de documentos',
    description: 'Não consigo fazer upload de arquivos PDF',
    status: 'open',
    priority: 'medium',
    category: 'technical',
    created_at: '2024-07-07T14:30:00Z',
    updated_at: '2024-07-07T15:00:00Z',
    messages_count: 3
  },
  {
    id: '2',
    title: 'Dúvida sobre honorários',
    description: 'Como funciona o sistema de pagamento?',
    status: 'resolved',
    priority: 'low',
    category: 'billing',
    created_at: '2024-07-06T09:00:00Z',
    updated_at: '2024-07-06T16:30:00Z',
    messages_count: 5
  },
  {
    id: '3',
    title: 'Solicitar alteração de dados',
    description: 'Preciso alterar meu endereço no perfil',
    status: 'in_progress',
    priority: 'low',
    category: 'account',
    created_at: '2024-07-05T11:15:00Z',
    updated_at: '2024-07-07T10:00:00Z',
    messages_count: 2
  }
];

const categories = [
  { id: 'technical', label: 'Problema Técnico', icon: '🔧' },
  { id: 'billing', label: 'Financeiro', icon: '💳' },
  { id: 'account', label: 'Conta', icon: '👤' },
  { id: 'legal', label: 'Jurídico', icon: '⚖️' },
  { id: 'other', label: 'Outro', icon: '❓' }
];

export default function SupportScreen() {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState(mockTickets);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical'
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app this would fetch from Supabase
      setTimeout(() => {
        setTickets(mockTickets);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setIsLoading(false);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const ticket = {
      id: Date.now().toString(),
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: 'medium',
      category: newTicket.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages_count: 1
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({ title: '', description: '', category: 'technical' });
    setShowNewTicketForm(false);
    
    Alert.alert('Sucesso', 'Ticket criado com sucesso! Nossa equipe entrará em contato em breve.');
  };

  const handleTicketPress = (ticket: any) => {
    Alert.alert(
      ticket.title,
      `Status: ${getStatusLabel(ticket.status)}\nCategoria: ${getCategoryLabel(ticket.category)}\n\n${ticket.description}`,
      [
        { text: 'Ver Conversa', onPress: () => openTicketChat(ticket.id) },
        { text: 'Fechar', style: 'cancel' }
      ]
    );
  };

  const openTicketChat = (ticketId: string) => {
    Alert.alert('Chat de Suporte', 'Abrindo conversa do ticket...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#DC2626';
      case 'in_progress': return '#F59E0B';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.label : category;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '❓';
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

  if (showNewTicketForm) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Novo Ticket</Text>
            <Text style={styles.headerSubtitle}>
              Descreva seu problema ou dúvida
            </Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Título*</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Descreva brevemente o problema"
              value={newTicket.title}
              onChangeText={(text) => setNewTicket({ ...newTicket, title: text })}
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Categoria*</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      newTicket.category === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setNewTicket({ ...newTicket, category: category.id })}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      newTicket.category === category.id && styles.categoryTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Descrição*</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Descreva detalhadamente seu problema ou dúvida..."
              value={newTicket.description}
              onChangeText={(text) => setNewTicket({ ...newTicket, description: text })}
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {newTicket.description.length}/500 caracteres
            </Text>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowNewTicketForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateTicket}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Criar Ticket</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
          <Text style={styles.headerTitle}>Suporte</Text>
          <Text style={styles.headerSubtitle}>
            Precisa de ajuda? Estamos aqui para você!
          </Text>
          
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => setShowNewTicketForm(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.newButtonText}>Novo Ticket</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.quickHelp}>
          <Text style={styles.sectionTitle}>Ajuda Rápida</Text>
          <View style={styles.helpButtons}>
            <TouchableOpacity style={styles.helpButton}>
              <FileText size={24} color="#0D47A1" />
              <Text style={styles.helpButtonText}>FAQ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpButton}>
              <MessageCircle size={24} color="#0D47A1" />
              <Text style={styles.helpButtonText}>Chat Online</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpButton}>
              <Star size={24} color="#0D47A1" />
              <Text style={styles.helpButtonText}>Avaliar App</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>Meus Tickets</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando tickets...</Text>
            </View>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => handleTicketPress(ticket)}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketIcon}>{getCategoryIcon(ticket.category)}</Text>
                    <View style={styles.ticketTitleContainer}>
                      <Text style={styles.ticketTitle}>{ticket.title}</Text>
                      <Text style={styles.ticketCategory}>{getCategoryLabel(ticket.category)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.ticketMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(ticket.status)}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description}
                </Text>
                
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketDate}>
                    Criado em {formatDate(ticket.created_at)}
                  </Text>
                  <Text style={styles.messageCount}>
                    {ticket.messages_count} mensagem{ticket.messages_count !== 1 ? 's' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <HelpCircle size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>Nenhum ticket encontrado</Text>
              <Text style={styles.emptyStateDescription}>
                Você ainda não criou nenhum ticket de suporte. 
                Clique em "Novo Ticket" para começar.
              </Text>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  quickHelp: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
  },
  helpButtonText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 8,
  },
  ticketsSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  ticketCard: {
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  ticketIcon: {
    fontSize: 20,
  },
  ticketTitleContainer: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  ticketCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  ticketMeta: {
    alignItems: 'flex-end',
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
  ticketDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageCount: {
    fontSize: 12,
    color: '#0D47A1',
    fontWeight: '500',
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
    paddingHorizontal: 24,
  },
  // Form styles
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#0D47A1',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0D47A1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});