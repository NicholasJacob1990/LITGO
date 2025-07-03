import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useState } from 'react';
import { Send, Paperclip, Video, Phone, MoveVertical as MoreVertical, CheckCheck, Star, FileText } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Olá! Sou o Dr. Carlos Mendes, advogado especialista em Direito Trabalhista. Vou ajudá-lo com sua questão sobre rescisão contratual.',
      sender: 'lawyer',
      timestamp: '09:30',
      read: true,
    },
    {
      id: '2',
      text: 'Obrigado, doutor. Tenho algumas dúvidas sobre as verbas rescisórias que deverei receber.',
      sender: 'user',
      timestamp: '09:32',
      read: true,
    },
    {
      id: '3',
      text: 'Perfeito! Vou explicar detalhadamente. Com base nas informações que você forneceu na triagem, você tem direito a:\n\n• Saldo de salário\n• Aviso prévio indenizado\n• 13º salário proporcional\n• Férias proporcionais + 1/3\n• FGTS + 40% de multa',
      sender: 'lawyer',
      timestamp: '09:35',
      read: true,
    },
    {
      id: '4',
      text: 'Isso é muito esclarecedor! Quanto tempo a empresa tem para fazer o pagamento?',
      sender: 'user',
      timestamp: '09:37',
      read: true,
    },
    {
      id: '5',
      text: 'Excelente pergunta! A empresa tem até 10 dias corridos a partir da demissão para efetuar o pagamento de todas as verbas rescisórias. Caso não cumpra esse prazo, deverá pagar multa equivalente ao seu salário.',
      sender: 'lawyer',
      timestamp: '09:40',
      read: false,
    },
  ]);

  const lawyer = {
    name: 'Dr. Carlos Mendes',
    specialty: 'Direito Trabalhista',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    online: true,
    rating: '4.5',
    experience: '10',
  };

  const router = useRouter();

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate lawyer typing and response
    setTimeout(() => {
      const lawyerResponse = {
        id: (Date.now() + 1).toString(),
        text: 'Entendi sua dúvida. Vou verificar essa informação e te responder em alguns minutos com todos os detalhes.',
        sender: 'lawyer',
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: false,
      };
      setMessages(prev => [...prev, lawyerResponse]);
    }, 2000);
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Iniciar Vídeo',
      'Deseja iniciar uma consulta por vídeo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Iniciar', 
          onPress: () => router.push('/(tabs)/video-consultation')
        }
      ]
    );
  };

  const handleViewCaseDetails = () => {
    router.push({
      pathname: '/(tabs)/case-details',
      params: { caseId: 'case-001' }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: lawyer.avatar }} style={styles.avatar} />
            {lawyer.online && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            <Text style={styles.lawyerSpecialty}>{lawyer.specialty}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Phone size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Video size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lawyer Info */}
      <View style={styles.lawyerInfo}>
        <Image source={{ uri: lawyer.avatar }} style={styles.lawyerAvatar} />
        
        <View style={styles.lawyerDetails}>
          <Text style={styles.lawyerName}>{lawyer.name}</Text>
          <Text style={styles.lawyerSpecialty}>{lawyer.specialty}</Text>
          <View style={styles.lawyerStats}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.lawyerRating}>{lawyer.rating}</Text>
            <Text style={styles.lawyerExperience}>{lawyer.experience} anos</Text>
          </View>
        </View>

        <View style={styles.lawyerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
            <Video size={20} color="#059669" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleViewCaseDetails}>
            <FileText size={20} color="#1E40AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageContainer,
              msg.sender === 'user' ? styles.userMessageContainer : styles.lawyerMessageContainer
            ]}
          >
            {msg.sender === 'lawyer' && (
              <Image source={{ uri: lawyer.avatar }} style={styles.messageAvatar} />
            )}
            
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessageBubble : styles.lawyerMessageBubble
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.lawyerMessageText
                ]}
              >
                {msg.text}
              </Text>
              
              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.messageTime,
                    msg.sender === 'user' ? styles.userMessageTime : styles.lawyerMessageTime
                  ]}
                >
                  {msg.timestamp}
                </Text>
                {msg.sender === 'user' && (
                  <CheckCheck 
                    size={16} 
                    color={msg.read ? "#10B981" : "#9CA3AF"} 
                    style={styles.readIndicator}
                  />
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Digite sua mensagem..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color={message.trim() ? "#FFFFFF" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lawyerSpecialty: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E0E7FF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  lawyerMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#1E40AF',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  lawyerMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  lawyerMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  userMessageTime: {
    color: '#E0E7FF',
  },
  lawyerMessageTime: {
    color: '#9CA3AF',
  },
  readIndicator: {
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 12,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  lawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  lawyerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lawyerRating: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 4,
  },
  lawyerExperience: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
  lawyerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});