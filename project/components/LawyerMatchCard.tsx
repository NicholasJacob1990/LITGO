import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Clock, Award, MessageCircle, Video, CircleCheck as CheckCircle2 } from 'lucide-react-native';

interface Lawyer {
  id: string;
  name: string;
  oabNumber: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  experience: number;
  avatar: string;
  distance: number;
  responseTime: string;
  successRate: number;
  hourlyRate: number;
  consultationFee: number;
  isOnline: boolean;
  nextAvailability: string;
  matchScore: number;
}

interface LawyerMatchCardProps {
  lawyer: Lawyer;
  onSelectLawyer: () => void;
  onViewProfile: () => void;
  onStartChat: () => void;
  onScheduleCall: () => void;
}

export default function LawyerMatchCard({
  lawyer,
  onSelectLawyer,
  onViewProfile,
  onStartChat,
  onScheduleCall
}: LawyerMatchCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return '#059669';
    if (score >= 80) return '#D97706';
    if (score >= 70) return '#DC2626';
    return '#6B7280';
  };

  return (
    <View style={styles.container}>
      {/* Match Score Badge */}
      <View style={[styles.matchBadge, { backgroundColor: getMatchScoreColor(lawyer.matchScore) }]}>
        <Text style={styles.matchText}>{lawyer.matchScore}% Match</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: lawyer.avatar }} style={styles.avatar} />
          {lawyer.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.lawyerInfo}>
          <Text style={styles.lawyerName}>{lawyer.name}</Text>
          <Text style={styles.oabNumber}>OAB {lawyer.oabNumber}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{lawyer.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({lawyer.reviewCount} avaliações)</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.specialtiesContainer}>
        {lawyer.specialties.slice(0, 2).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {lawyer.specialties.length > 2 && (
          <Text style={styles.moreSpecialties}>
            +{lawyer.specialties.length - 2} áreas
          </Text>
        )}
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Award size={16} color="#059669" />
          <Text style={styles.metricValue}>{lawyer.experience} anos</Text>
          <Text style={styles.metricLabel}>Experiência</Text>
        </View>
        
        <View style={styles.metric}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.metricValue}>{lawyer.distance.toFixed(1)} km</Text>
          <Text style={styles.metricLabel}>Distância</Text>
        </View>
        
        <View style={styles.metric}>
          <Clock size={16} color="#D97706" />
          <Text style={styles.metricValue}>{lawyer.responseTime}</Text>
          <Text style={styles.metricLabel}>Resposta</Text>
        </View>
        
        <View style={styles.metric}>
          <CheckCircle2 size={16} color="#059669" />
          <Text style={styles.metricValue}>{lawyer.successRate}%</Text>
          <Text style={styles.metricLabel}>Sucesso</Text>
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.pricingContainer}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Consulta</Text>
          <Text style={styles.priceValue}>{formatCurrency(lawyer.consultationFee)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Por hora</Text>
          <Text style={styles.priceValue}>{formatCurrency(lawyer.hourlyRate)}</Text>
        </View>
      </View>

      {/* Availability */}
      <View style={styles.availabilityContainer}>
        <View style={styles.availabilityInfo}>
          {lawyer.isOnline ? (
            <>
              <View style={styles.onlineDot} />
              <Text style={styles.availabilityText}>Disponível agora</Text>
            </>
          ) : (
            <>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.availabilityText}>
                Próxima disponibilidade: {lawyer.nextAvailability}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onViewProfile}>
          <Text style={styles.secondaryButtonText}>Ver Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.chatButton} onPress={onStartChat}>
          <MessageCircle size={16} color="#1E40AF" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.videoButton} onPress={onScheduleCall}>
          <Video size={16} color="#059669" />
          <Text style={styles.videoButtonText}>Vídeo</Text>
        </TouchableOpacity>
      </View>

      {/* Select Button */}
      <TouchableOpacity style={styles.selectButton} onPress={onSelectLawyer}>
        <LinearGradient
          colors={['#1E40AF', '#3B82F6']}
          style={styles.selectGradient}
        >
          <Text style={styles.selectButtonText}>Selecionar Advogado</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  matchText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lawyerInfo: {
    flex: 1,
    paddingRight: 60,
  },
  lawyerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 2,
  },
  oabNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#1E40AF',
  },
  moreSpecialties: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  priceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
  },
  priceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1F2937',
  },
  availabilityContainer: {
    marginBottom: 16,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  availabilityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#4B5563',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 4,
  },
  videoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  videoButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
  },
  selectButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  selectButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});