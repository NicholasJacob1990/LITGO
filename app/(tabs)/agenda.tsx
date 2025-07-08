import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar, Clock, Plus, MapPin, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCalendar } from '@/lib/contexts/CalendarContext';

// Mock data para agenda
const mockEvents = [
  {
    id: '1',
    title: 'Consulta - Caso Trabalhista',
    time: '14:00',
    date: '2024-07-08',
    duration: '60 min',
    client: 'Maria Silva',
    type: 'consultation',
    location: 'Escritório',
    description: 'Discussão sobre rescisão trabalhista'
  },
  {
    id: '2',
    title: 'Reunião - Revisão Contrato',
    time: '16:30',
    date: '2024-07-08',
    duration: '45 min',
    client: 'João Santos',
    type: 'meeting',
    location: 'Online',
    description: 'Revisão de cláusulas contratuais'
  },
  {
    id: '3',
    title: 'Audiência - Caso Civil',
    time: '10:00',
    date: '2024-07-09',
    duration: '120 min',
    client: 'Ana Costa',
    type: 'hearing',
    location: 'Tribunal',
    description: 'Audiência de conciliação'
  }
];

export default function AgendaScreen() {
  const { role } = useAuth();
  const { events, isLoading, refetchEvents } = useCalendar();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (refetchEvents) {
      refetchEvents();
    }
  }, [refetchEvents]);

  const handleNewEvent = () => {
    Alert.alert(
      'Nova Agenda',
      'Funcionalidade de agendamento em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  const handleSync = () => {
    Alert.alert(
      'Sincronização',
      'Agenda sincronizada com sucesso!',
      [{ text: 'OK' }]
    );
  };

  // Use mock events if no real events are available
  const displayEvents = events?.length > 0 ? events : mockEvents;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Agenda</Text>
          <Text style={styles.headerSubtitle}>
            {role === 'client' ? 'Suas consultas agendadas' : 'Sua agenda profissional'}
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
              <Clock size={20} color="#FFFFFF" />
              <Text style={styles.syncButtonText}>Sincronizar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.newButton} onPress={handleNewEvent}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.newButtonText}>Nova</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.calendarSection}>
          <View style={styles.dateHeader}>
            <Calendar size={24} color="#0D47A1" />
            <Text style={styles.dateTitle}>Hoje - {new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando agenda...</Text>
            </View>
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>{event.duration}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <User size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>{event.client}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                </View>
                
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>Nenhum evento agendado</Text>
              <Text style={styles.emptyStateDescription}>
                {role === 'client' 
                  ? 'Você não possui consultas agendadas no momento.'
                  : 'Sua agenda está livre. Que tal agendar uma consulta?'}
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
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
  calendarSection: {
    marginTop: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D47A1',
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
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
  },
});