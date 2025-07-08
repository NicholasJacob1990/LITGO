import React, { useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Daily, { DailyCall } from '@daily-co/react-native-daily-js';
import { 
  DailyProvider, 
  useLocalParticipant, 
  useParticipant, 
  useMeetingState,
  useCallObject
} from '@daily-co/daily-react';

import { CasesStackParamList } from '@/lib/types/cases';
import VideoCallUI from '@/components/organisms/VideoCallUI';

type VideoConsultationRouteProp = RouteProp<CasesStackParamList, 'VideoConsultation'>;

const ParticipantTile = ({ sessionId, isLocal }: { sessionId: string; isLocal: boolean }) => {
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
  const callObject = useCallObject() as any;
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

  if ((meetingState as string) === 'joining' || (meetingState as string) === 'loading' || !localParticipant) {
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
  const navigation = useNavigation();
  const route = useRoute<VideoConsultationRouteProp>();
  const { roomUrl, token } = route.params;

  const [callObject, setCallObject] = React.useState<DailyCall | null>(null);

  useEffect(() => {
    const co = Daily.createCallObject();
    setCallObject(co);
    
    const events: string[] = ['left-meeting', 'error'];
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
      if (co && !co.isDestroyed) {
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
}); 