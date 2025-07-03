import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Send, User, LifeBuoy } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SupportMessage, getSupportMessages, sendSupportMessage } from '@/lib/services/support';

export default function SupportTicketChatScreen() {
  const router = useRouter();
  const { ticketId } = useLocalSearchParams();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      setIsLoading(true);
      getSupportMessages(ticketId as string)
        .then(data => setMessages(data || []))
        .catch(error => console.error("Failed to fetch messages:", error))
        .finally(() => setIsLoading(false));
    }
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !ticketId) return;

    const userMessage = inputText.trim();
    setInputText('');

    const newMessage: SupportMessage = {
      ticket_id: ticketId as string,
      sender_id: user.id,
      content: userMessage,
    };
    
    // Adiciona a mensagem à UI otimisticamente
    setMessages(prev => [...prev, newMessage]);
    
    try {
      await sendSupportMessage(newMessage);
      // Opcional: recarregar mensagens para confirmar, mas a atualização otimista é geralmente suficiente
    } catch (error) {
      console.error('Failed to send message:', error);
      // Lógica para remover a mensagem otimista em caso de erro
      setMessages(prev => prev.slice(0, -1));
      alert('Erro ao enviar mensagem.');
    } finally {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = (message: SupportMessage) => {
    const isUser = message.sender_id === user?.id;
    return (
      <View
        key={message.id}
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}
      >
        <View style={styles.messageHeader}>
          <View style={[styles.avatar, isUser ? styles.userAvatar : styles.botAvatar]}>
            {isUser ? <User size={16} color="#FFFFFF" /> : <LifeBuoy size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.messageAuthor}>
            {isUser ? 'Você' : 'Suporte'}
          </Text>
        </View>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Ticket de Suporte</Text>
          <Text style={styles.headerSubtitle}>Ticket #{typeof ticketId === 'string' ? ticketId.substring(0, 8) : ''}</Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#1E293B" />
      ) : (
        <ScrollView ref={scrollViewRef} style={styles.chatContainer}>
          {messages.map(renderMessage)}
        </ScrollView>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Estilos adaptados do ChatTriagemScreen...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 16 },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2 },
    chatContainer: { flex: 1, padding: 16 },
    messageContainer: { marginBottom: 20 },
    messageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    userAvatar: { backgroundColor: '#10B981' },
    botAvatar: { backgroundColor: '#F59E0B' }, // Laranja para Suporte
    messageAuthor: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#374151' },
    messageBubble: { padding: 16, borderRadius: 16, maxWidth: '85%' },
    userMessage: { alignItems: 'flex-end' },
    botMessage: { alignItems: 'flex-start' },
    userBubble: { backgroundColor: '#10B981', borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
    messageText: { fontSize: 16, lineHeight: 24 },
    userText: { color: '#FFFFFF' },
    botText: { color: '#374151' },
    inputContainer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 24, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 8 },
    textInput: { flex: 1, fontSize: 16, color: '#374151', minHeight: 40, paddingVertical: 8 },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E40AF', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
    sendButtonDisabled: { backgroundColor: '#9CA3AF' },
}); 