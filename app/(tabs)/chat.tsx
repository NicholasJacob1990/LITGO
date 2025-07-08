import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MessageCircle, Send, User, Clock, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock data para conversas
const mockChats = [
  {
    id: '1',
    type: 'case',
    title: 'Caso: Rescisão Trabalhista',
    participant: 'Dr. Carlos Mendes',
    lastMessage: 'Documentos recebidos, analisarei hoje.',
    lastMessageTime: '10:30',
    unreadCount: 2,
    isOnline: true,
    case_id: '001'
  },
  {
    id: '2',
    type: 'case',
    title: 'Caso: Revisão Contrato',
    participant: 'Dra. Ana Paula',
    lastMessage: 'Podemos agendar uma reunião?',
    lastMessageTime: '09:15',
    unreadCount: 0,
    isOnline: false,
    case_id: '002'
  },
  {
    id: '3',
    type: 'pre_hiring',
    title: 'Consulta Pré-Contratação',
    participant: 'Dr. Roberto Silva',
    lastMessage: 'Sim, posso ajudar com seu caso.',
    lastMessageTime: 'Ontem',
    unreadCount: 1,
    isOnline: true,
    lawyer_id: 'lawyer-003'
  },
  {
    id: '4',
    type: 'support',
    title: 'Suporte Técnico',
    participant: 'Equipe LITGO',
    lastMessage: 'Problema resolvido!',
    lastMessageTime: '2 dias',
    unreadCount: 0,
    isOnline: true,
    support_ticket_id: 'ticket-001'
  }
];

export default function ChatScreen() {
  const { user, role } = useAuth();
  const [chats, setChats] = useState(mockChats);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app this would fetch from Supabase
      setTimeout(() => {
        setChats(mockChats);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading chats:', error);
      setIsLoading(false);
    }
  };

  const handleChatPress = (chat: any) => {
    Alert.alert(
      chat.title,
      `Abrir conversa com ${chat.participant}`,
      [
        { text: 'Abrir', onPress: () => openChat(chat) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const openChat = (chat: any) => {
    if (chat.type === 'case') {
      Alert.alert('Chat do Caso', 'Navegando para chat do caso...');
    } else if (chat.type === 'pre_hiring') {
      Alert.alert('Chat Pré-Contratação', 'Navegando para chat pré-contratação...');
    } else if (chat.type === 'support') {
      Alert.alert('Chat de Suporte', 'Navegando para chat de suporte...');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'case': return '📋';
      case 'pre_hiring': return '💬';
      case 'support': return '🛠️';
      default: return '💬';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSubtitle}>
            {role === 'client' 
              ? 'Converse com seus advogados'
              : 'Gerencie suas conversas'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando conversas...</Text>
          </View>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => handleChatPress(chat)}
            >
              <View style={styles.chatHeader}>
                <View style={styles.chatInfo}>
                  <View style={styles.chatTitleContainer}>
                    <Text style={styles.chatIcon}>{getChatIcon(chat.type)}</Text>
                    <Text style={styles.chatTitle}>{chat.title}</Text>
                    {chat.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <Text style={styles.chatParticipant}>{chat.participant}</Text>
                </View>
                
                <View style={styles.chatMeta}>
                  <Text style={styles.chatTime}>{formatTime(chat.lastMessageTime)}</Text>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Text style={styles.lastMessage} numberOfLines={2}>
                {chat.lastMessage}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery 
                ? 'Tente uma busca diferente'
                : role === 'client'
                  ? 'Inicie uma consulta para começar a conversar com advogados.'
                  : 'Suas conversas com clientes aparecerão aqui.'}
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
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
  chatCard: {
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
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  chatIcon: {
    fontSize: 16,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  chatParticipant: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chatMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
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
});