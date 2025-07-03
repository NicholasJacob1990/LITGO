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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { generateTriageAnalysis, ChatGPTMessage } from '@/lib/openai';
import AITypingIndicator from '@/components/AITypingIndicator';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatTriagemScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Mensagem inicial do assistente
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: '1',
      text: 'Olá! Sou o LEX-9000, seu assistente jurídico inteligente. Vou ajudá-lo a analisar sua situação jurídica através de algumas perguntas. Para começar, você pode me descrever qual é o problema jurídico que está enfrentando?',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const convertToChatGPTFormat = (messages: ChatMessage[]): ChatGPTMessage[] => {
    return messages
      .filter(msg => msg.id !== '1') // Remove mensagem inicial
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      // Converte mensagens para formato da API
      const chatHistory = convertToChatGPTFormat([...messages, {
        id: Date.now().toString(),
        text: userMessage,
        isUser: true,
        timestamp: new Date()
      }]);

      const response = await generateTriageAnalysis(chatHistory);

      if (response.isComplete) {
        // Análise completa
        setAnalysisResult(response.analysis);
        setIsComplete(true);
        addMessage(
          'Perfeito! Concluí a análise do seu caso. Com base nas informações coletadas, gerei uma síntese jurídica completa. Vou te mostrar os resultados...',
          false
        );
        
        // Aguarda um pouco e redireciona para síntese
        setTimeout(() => {
          Alert.alert(
            'Análise Concluída',
            'Sua triagem jurídica foi finalizada! Você será direcionado para visualizar a síntese completa.',
            [{ text: 'Ver Síntese', onPress: () => router.push('/sintese') }]
          );
        }, 2000);
      } else {
        // Próxima pergunta
        addMessage(response.nextQuestion, false);
      }
    } catch (error) {
      console.error('Erro na API:', error);
      addMessage(
        'Desculpe, tive um problema técnico. Pode repetir sua última resposta?',
        false
      );
    } finally {
      setIsLoading(false);
      // Scroll para o final
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage
      ]}
    >
      <View style={styles.messageHeader}>
        <View style={[styles.avatar, message.isUser ? styles.userAvatar : styles.botAvatar]}>
          {message.isUser ? (
            <User size={16} color="#FFFFFF" />
          ) : (
            <Bot size={16} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.messageAuthor}>
          {message.isUser ? 'Você' : 'LEX-9000'}
        </Text>
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, message.isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Triagem Inteligente</Text>
            <Text style={styles.headerSubtitle}>
              {isComplete ? 'Análise Concluída' : 'Conversando com IA'}
            </Text>
          </View>
          
          <View style={styles.statusIndicator}>
            <Bot size={20} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <AITypingIndicator />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      {!isComplete && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua resposta..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: '#10B981',
  },
  botAvatar: {
    backgroundColor: '#1E40AF',
  },
  messageAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#374151',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  loadingBubble: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: '85%',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
}); 