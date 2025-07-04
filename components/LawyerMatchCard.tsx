import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Clock, Award, MessageCircle, Video, Users, CheckCircle, ArrowRight, Sparkles } from 'lucide-react-native';
import { LawyerSearchResult } from '@/lib/supabase';
import { getExplanation } from '@/lib/services/api';
import { Ionicons } from '@expo/vector-icons';
import ContractForm from './organisms/ContractForm';

interface LawyerMatchCardProps {
  lawyer: LawyerSearchResult;
  onSelect: () => void;
  caseId: string;
  caseTitle: string;
  onVideoCall?: () => void;
  onChat?: () => void;
}

const LawyerMatchCard: React.FC<LawyerMatchCardProps> = ({ lawyer, onSelect, caseId, caseTitle, onVideoCall, onChat }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);

  const handleExplainClick = async () => {
    if (explanation) {
      setExplanation(null);
      return;
    }

    if (!caseId) {
      Alert.alert('Erro', 'ID do caso não encontrado');
      return;
    }

    setIsLoadingExplanation(true);
    try {
      const result = await getExplanation(caseId, [lawyer.id]);
      if (result.explanations && result.explanations[lawyer.id]) {
        setExplanation(result.explanations[lawyer.id]);
      }
    } catch (error) {
      console.error('Erro ao carregar explicação:', error);
      Alert.alert('Erro', 'Não foi possível carregar a explicação');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleContractCreated = (contractId: string) => {
    Alert.alert(
      'Contrato Criado',
      'O contrato foi criado com sucesso. Você pode visualizá-lo na aba Contratos.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navegar para a tela de contratos ou detalhes do contrato
            // router.push(`/contract/${contractId}`);
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity onPress={onSelect} style={styles.card}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: lawyer.avatar_url || 'https://via.placeholder.com/60' }}
                  style={styles.avatar}
                />
                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
              </View>
              
              <View style={styles.basicInfo}>
                <Text style={styles.name}>{lawyer.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={styles.location}>{lawyer.location || 'Localização não informada'}</Text>
                </View>
                <View style={styles.specialtyRow}>
                  <Award size={14} color="#3b82f6" />
                  <Text style={styles.specialty}>{lawyer.specialty || 'Especialidade não informada'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{Math.round(lawyer.match_score * 100)}</Text>
                <Text style={styles.scoreLabel}>%</Text>
              </View>
              <Text style={styles.scoreSubtext}>Compatibilidade</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
              </View>
              <View>
                <Text style={styles.metricValue}>{lawyer.rating?.toFixed(1) || 'N/A'}</Text>
                <Text style={styles.metricLabel}>Avaliação</Text>
              </View>
            </View>

            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <CheckCircle size={16} color="#10b981" />
              </View>
              <View>
                <Text style={styles.metricValue}>{Math.round((lawyer.success_rate || 0) * 100)}%</Text>
                <Text style={styles.metricLabel}>Taxa de Êxito</Text>
              </View>
            </View>

            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <Clock size={16} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.metricValue}>{lawyer.response_time || 'N/A'}h</Text>
                <Text style={styles.metricLabel}>Resposta</Text>
              </View>
            </View>

            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <Users size={16} color="#8b5cf6" />
              </View>
              <View>
                <Text style={styles.metricValue}>{lawyer.cases_count || 0}</Text>
                <Text style={styles.metricLabel}>Casos</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.explainButton} 
            onPress={handleExplainClick}
            disabled={isLoadingExplanation}
          >
            <View style={styles.explainButtonContent}>
              {isLoadingExplanation ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Sparkles size={16} color="#3b82f6" />
              )}
              <Text style={styles.explainButtonText}>
                {isLoadingExplanation 
                  ? 'Gerando explicação...' 
                  : explanation 
                    ? 'Ocultar explicação' 
                    : 'Por que este advogado?'
                }
              </Text>
              {!isLoadingExplanation && !explanation && (
                <ArrowRight size={16} color="#3b82f6" />
              )}
            </View>
          </TouchableOpacity>

          {explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.contractButton]}
              onPress={() => setShowContractForm(true)}
            >
              <Ionicons name="document-text-outline" size={16} color="#fff" />
              <Text style={styles.contractButtonText}>Contratar</Text>
            </TouchableOpacity>

            {onChat && (
              <TouchableOpacity
                style={[styles.actionButton, styles.chatButton]}
                onPress={onChat}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#007bff" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            )}

            {onVideoCall && (
              <TouchableOpacity
                style={[styles.actionButton, styles.videoButton]}
                onPress={onVideoCall}
              >
                <Ionicons name="videocam-outline" size={16} color="#10b981" />
                <Text style={styles.videoButtonText}>Vídeo</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <ContractForm
        visible={showContractForm}
        onClose={() => setShowContractForm(false)}
        caseId={caseId}
        lawyerId={lawyer.id}
        lawyerName={lawyer.name}
        caseTitle={caseTitle}
        onContractCreated={handleContractCreated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialty: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1d4ed8',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    lineHeight: 14,
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  explainButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  explainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainButtonText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  explanationContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  contractButton: {
    backgroundColor: '#007bff',
  },
  contractButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  videoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  videoButtonText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default LawyerMatchCard;
    <TouchableOpacity onPress={onSelect} style={styles.card}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: lawyer.avatar_url || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {lawyer.is_available && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
            <Text style={styles.area}>{lawyer.primary_area}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>{lawyer.rating?.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.details}>
            <View style={styles.detailItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.detailText}>{lawyer.distance_km.toFixed(1)} km</Text>
            </View>
        </View>
        
      </LinearGradient>

      {!explanation && !isLoadingExplanation && (
        <TouchableOpacity onPress={handleExplainClick} style={styles.explainButton}>
          <Sparkles size={16} color="#1E40AF" />
          <Text style={styles.explainButtonText}>Entenda a recomendação</Text>
        </TouchableOpacity>
      )}

      {isLoadingExplanation && <ActivityIndicator style={{ marginTop: 12 }} />}

      {explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    area: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4B5563',
    },
    explainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
    },
    explainButtonText: {
        marginLeft: 8,
        color: '#1E40AF',
        fontWeight: '600',
    },
    explanationBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    explanationText: {
        color: '#374151',
        lineHeight: 20,
    }
});

export default LawyerMatchCard;

            {onVideoCall && (
              <TouchableOpacity
                style={[styles.actionButton, styles.videoButton]}
                onPress={onVideoCall}
              >
                <Ionicons name="videocam-outline" size={16} color="#10b981" />
                <Text style={styles.videoButtonText}>Vídeo</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <ContractForm
        visible={showContractForm}
        onClose={() => setShowContractForm(false)}
        caseId={caseId}
        lawyerId={lawyer.id}
        lawyerName={lawyer.name}
        caseTitle={caseTitle}
        onContractCreated={handleContractCreated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialty: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1d4ed8',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    lineHeight: 14,
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  explainButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  explainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainButtonText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  explanationContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  contractButton: {
    backgroundColor: '#007bff',
  },
  contractButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  videoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  videoButtonText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default LawyerMatchCard;
    <TouchableOpacity onPress={onSelect} style={styles.card}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: lawyer.avatar_url || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {lawyer.is_available && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
            <Text style={styles.area}>{lawyer.primary_area}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>{lawyer.rating?.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.details}>
            <View style={styles.detailItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.detailText}>{lawyer.distance_km.toFixed(1)} km</Text>
            </View>
        </View>
        
      </LinearGradient>

      {!explanation && !isLoadingExplanation && (
        <TouchableOpacity onPress={handleExplainClick} style={styles.explainButton}>
          <Sparkles size={16} color="#1E40AF" />
          <Text style={styles.explainButtonText}>Entenda a recomendação</Text>
        </TouchableOpacity>
      )}

      {isLoadingExplanation && <ActivityIndicator style={{ marginTop: 12 }} />}

      {explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    area: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4B5563',
    },
    explainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
    },
    explainButtonText: {
        marginLeft: 8,
        color: '#1E40AF',
        fontWeight: '600',
    },
    explanationBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    explanationText: {
        color: '#374151',
        lineHeight: 20,
    }
});

export default LawyerMatchCard;

            {onVideoCall && (
              <TouchableOpacity
                style={[styles.actionButton, styles.videoButton]}
                onPress={onVideoCall}
              >
                <Ionicons name="videocam-outline" size={16} color="#10b981" />
                <Text style={styles.videoButtonText}>Vídeo</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <ContractForm
        visible={showContractForm}
        onClose={() => setShowContractForm(false)}
        caseId={caseId}
        lawyerId={lawyer.id}
        lawyerName={lawyer.name}
        caseTitle={caseTitle}
        onContractCreated={handleContractCreated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialty: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1d4ed8',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    lineHeight: 14,
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  explainButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  explainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainButtonText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  explanationContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  contractButton: {
    backgroundColor: '#007bff',
  },
  contractButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  videoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  videoButtonText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default LawyerMatchCard;
    <TouchableOpacity onPress={onSelect} style={styles.card}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: lawyer.avatar_url || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {lawyer.is_available && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
            <Text style={styles.area}>{lawyer.primary_area}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>{lawyer.rating?.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.details}>
            <View style={styles.detailItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.detailText}>{lawyer.distance_km.toFixed(1)} km</Text>
            </View>
        </View>
        
      </LinearGradient>

      {!explanation && !isLoadingExplanation && (
        <TouchableOpacity onPress={handleExplainClick} style={styles.explainButton}>
          <Sparkles size={16} color="#1E40AF" />
          <Text style={styles.explainButtonText}>Entenda a recomendação</Text>
        </TouchableOpacity>
      )}

      {isLoadingExplanation && <ActivityIndicator style={{ marginTop: 12 }} />}

      {explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    area: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4B5563',
    },
    explainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
    },
    explainButtonText: {
        marginLeft: 8,
        color: '#1E40AF',
        fontWeight: '600',
    },
    explanationBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    explanationText: {
        color: '#374151',
        lineHeight: 20,
    }
});

export default LawyerMatchCard;

            {onVideoCall && (
              <TouchableOpacity
                style={[styles.actionButton, styles.videoButton]}
                onPress={onVideoCall}
              >
                <Ionicons name="videocam-outline" size={16} color="#10b981" />
                <Text style={styles.videoButtonText}>Vídeo</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <ContractForm
        visible={showContractForm}
        onClose={() => setShowContractForm(false)}
        caseId={caseId}
        lawyerId={lawyer.id}
        lawyerName={lawyer.name}
        caseTitle={caseTitle}
        onContractCreated={handleContractCreated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialty: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1d4ed8',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    lineHeight: 14,
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  explainButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  explainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainButtonText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  explanationContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  contractButton: {
    backgroundColor: '#007bff',
  },
  contractButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  videoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  videoButtonText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default LawyerMatchCard;
    <TouchableOpacity onPress={onSelect} style={styles.card}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: lawyer.avatar_url || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {lawyer.is_available && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
            <Text style={styles.area}>{lawyer.primary_area}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>{lawyer.rating?.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.details}>
            <View style={styles.detailItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.detailText}>{lawyer.distance_km.toFixed(1)} km</Text>
            </View>
        </View>
        
      </LinearGradient>

      {!explanation && !isLoadingExplanation && (
        <TouchableOpacity onPress={handleExplainClick} style={styles.explainButton}>
          <Sparkles size={16} color="#1E40AF" />
          <Text style={styles.explainButtonText}>Entenda a recomendação</Text>
        </TouchableOpacity>
      )}

      {isLoadingExplanation && <ActivityIndicator style={{ marginTop: 12 }} />}

      {explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    area: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4B5563',
    },
    explainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
    },
    explainButtonText: {
        marginLeft: 8,
        color: '#1E40AF',
        fontWeight: '600',
    },
    explanationBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    explanationText: {
        color: '#374151',
        lineHeight: 20,
    }
});

export default LawyerMatchCard;