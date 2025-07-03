import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, Mic, MicOff, VideoOff, Phone, MessageCircle, Settings, Users, Clock, Star } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

export default function VideoConsultationScreen() {
  const { lawyerId, caseId } = useLocalSearchParams<{ lawyerId: string, caseId: string }>();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Mock lawyer data
  const lawyer = {
    id: lawyerId,
    name: 'Dr. Carlos Mendes',
    specialty: 'Direito Trabalhista',
    rating: 4.8,
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  };

  useEffect(() => {
    // Timer para duração da chamada
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Aqui seria implementada a lógica do Daily para mute/unmute
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Aqui seria implementada a lógica do Daily para video on/off
  };

  const handleEndCall = () => {
    Alert.alert(
      'Encerrar Chamada',
      'Tem certeza que deseja encerrar a chamada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Encerrar', 
          style: 'destructive',
          onPress: () => {
            // Aqui seria implementada a lógica do Daily para encerrar
            router.replace('/(tabs)/chat');
          }
        }
      ]
    );
  };

  const handleSwitchToChat = () => {
    Alert.alert(
      'Mudar para Chat',
      'Deseja continuar a consulta por chat?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          onPress: () => router.replace('/(tabs)/chat')
        }
      ]
    );
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      Alert.alert(
        'Parar Gravação',
        'Deseja parar a gravação da consulta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Parar', 
            onPress: () => setIsRecording(false)
          }
        ]
      );
    } else {
      Alert.alert(
        'Iniciar Gravação',
        'A gravação será iniciada. Todos os participantes serão notificados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Iniciar', 
            onPress: () => setIsRecording(true)
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Video Container */}
      <View style={styles.videoContainer}>
        {/* Main Video (Lawyer) */}
        <View style={styles.mainVideo}>
          <View style={styles.videoPlaceholder}>
            <Video size={48} color="#FFFFFF" />
            <Text style={styles.videoPlaceholderText}>Dr. Carlos Mendes</Text>
          </View>
          
          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>GRAVANDO</Text>
            </View>
          )}
        </View>

        {/* Self Video (User) */}
        <View style={styles.selfVideo}>
          <View style={styles.selfVideoPlaceholder}>
            <Text style={styles.selfVideoText}>Você</Text>
          </View>
        </View>
      </View>

      {/* Call Info */}
      <View style={styles.callInfo}>
        <View style={styles.lawyerInfo}>
          <Text style={styles.lawyerName}>{lawyer.name}</Text>
          <Text style={styles.lawyerSpecialty}>{lawyer.specialty}</Text>
          <View style={styles.lawyerStats}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.lawyerRating}>{lawyer.rating}</Text>
          </View>
        </View>
        
        <View style={styles.callDuration}>
          <Clock size={16} color="#FFFFFF" />
          <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          {/* Mute Button */}
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
            onPress={handleToggleMute}
          >
            {isMuted ? <MicOff size={24} color="#FFFFFF" /> : <Mic size={24} color="#FFFFFF" />}
          </TouchableOpacity>

          {/* Video Button */}
          <TouchableOpacity 
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]} 
            onPress={handleToggleVideo}
          >
            {isVideoOff ? <VideoOff size={24} color="#FFFFFF" /> : <Video size={24} color="#FFFFFF" />}
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity 
            style={[styles.controlButton, styles.endCallButton]} 
            onPress={handleEndCall}
          >
            <Phone size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Switch to Chat */}
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handleSwitchToChat}
          >
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity style={styles.controlButton}>
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Recording Control */}
        <TouchableOpacity 
          style={[styles.recordingButton, isRecording && styles.recordingButtonActive]} 
          onPress={handleToggleRecording}
        >
          <Text style={[styles.recordingButtonText, isRecording && styles.recordingButtonTextActive]}>
            {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Copilot Indicator */}
      <View style={styles.aiCopilotIndicator}>
        <Text style={styles.aiCopilotText}>
          🤖 IA Copilot ativo - Sugerindo documentos e jurisprudência
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  mainVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 40,
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 12,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  recordingText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  selfVideo: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selfVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfVideoText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  callInfo: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 2,
  },
  lawyerSpecialty: {
    color: '#E5E7EB',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  lawyerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lawyerRating: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  callDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
    transform: [{ rotate: '135deg' }],
  },
  recordingButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordingButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  recordingButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  recordingButtonTextActive: {
    color: '#FFFFFF',
  },
  aiCopilotIndicator: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  aiCopilotText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
}); 