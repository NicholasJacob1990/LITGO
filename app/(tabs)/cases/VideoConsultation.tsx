import React, { useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// Platform-specific imports
const Daily = Platform.OS !== 'web' ? require('@daily-co/react-native-daily-js').default : null;
const DailyReactHooks = Platform.OS !== 'web' ? require('@daily-co/daily-react') : {};

const { 
  DailyProvider, 
  useLocalParticipant, 
  useParticipant, 
  useMeetingState,
  useCallObject
} = DailyReactHooks;

import { CasesStackParamList } from '@/lib/types/cases';
import VideoCallUI from '@/components/organisms/VideoCallUI';

type VideoConsultationRouteProp = RouteProp<CasesStackParamList, 'VideoConsultation'>;

// Web fallback component
const WebVideoConsultation = () => {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>Videoconsulta não disponível na web</Text>
        <Text style={styles.webText}>
          Use o aplicativo mobile para videoconsultas.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.webButton}>
          <Text style={styles.webButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ParticipantTile = ({ sessionId, isLocal }: { sessionId: string; isLocal: boolean }) => {
  if (Platform.OS === 'web' || !useParticipant) return null;
  
  const participant = useParticipant(sessionId);

  if (!participant) return null;

  return (
    <View style={styles.tile}>
      {participant.video ? (
        <Daily.DailyMediaView
          videoTrack={participant.tracks.video.persistentTrack}
          audioTrack={participant.tracks.audio.persistentTrack}
          style={styles.video}
          objectFit="cover"
          mirror={isLocal}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{participant.user_name?.charAt(0) || '?'}</Text>
        </View>
      )}
      <Text style={styles.participantName}>{participant.user_name}</Text>
    </View>
  );
};

const CallView = () => {
  const callObject = useCallObject();
  const meetingState = useMeetingState();
  const localParticipant = useLocalParticipant();

  const handleLeave = useCallback(() => {
    callObject?.leave();
  }, [callObject]);

  const handleToggleCamera = useCallback(() => {
    if (!callObject) return;
    callObject.setLocalVideo(!callObject.localVideo());
  }, [callObject]);

  const handleToggleMic = useCallback(() => {
    if (!callObject) return;
    callObject.setLocalAudio(!callObject.localAudio());
  }, [callObject]);

  if (meetingState === 'joining' || meetingState === 'loading' || !localParticipant) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Entrando na chamada...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.callContainer}>
      <ParticipantTile sessionId={localParticipant.session_id} isLocal />
      <VideoCallUI
        onLeave={handleLeave}
        onToggleCamera={handleToggleCamera}
        onToggleMic={handleToggleMic}
        isCameraOn={callObject?.localVideo() ?? false}
        isMicOn={callObject?.localAudio() ?? false}
      />
    </SafeAreaView>
  );
};

export default function VideoConsultation() {
  // On web, return the web fallback component
  if (Platform.OS === 'web') {
    return <WebVideoConsultation />;
  }

  const navigation = useNavigation();
  const route = useRoute<VideoConsultationRouteProp>();
  const { roomUrl, token } = route.params;

  const [callObject, setCallObject] = React.useState<any | null>(null);

  useEffect(() => {
    if (!Daily) return;
    
    const co = Daily.createCallObject();
    setCallObject(co);
    
    const events: DailyEvent[] = ['left-meeting', 'error'];
    const handleEvent = () => {
      co.destroy();
      navigation.goBack();
    };
    
    events.forEach((event) => co.on(event, handleEvent));

    co.join({ url: roomUrl, token }).catch((err) => {
      console.error('Falha ao entrar na chamada:', err);
      Alert.alert('Erro', 'Não foi possível se conectar à videochamada.', [{ text: 'OK', onPress: () => handleEvent() }]);
    });

    return () => {
      events.forEach((event) => co.off(event, handleEvent));
      if (co.meetingState() !== 'left-meeting') {
        co.destroy();
      }
    };
  }, [roomUrl, token, navigation]);
  

  return (
    <View style={styles.container}>
      {callObject ? (
        <DailyProvider callObject={callObject}>
          <CallView />
        </DailyProvider>
      ) : (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Preparando videochamada...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  callContainer: {
    flex: 1,
    position: 'relative',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },
  tile: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  participantName: {
    position: 'absolute',
    bottom: 120,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1F2937',
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  webText: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  webButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  webButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 