import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, FileText, Star, Clock } from 'lucide-react-native';
import Badge from '../atoms/Badge';
import MoneyTile from '../atoms/MoneyTile';

interface PreAnalysisCardProps {
  caseTitle: string;
  analysisDate: string;
  confidence: number; // 0-100
  estimatedCost?: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyPoints: string[];
  onViewFull?: () => void;
  onScheduleConsult?: () => void;
}

export default function PreAnalysisCard({
  caseTitle,
  analysisDate,
  confidence,
  estimatedCost,
  riskLevel,
  keyPoints,
  onViewFull,
  onScheduleConsult
}: PreAnalysisCardProps) {
  const getRiskBadgeIntent = () => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getRiskText = () => {
    switch (riskLevel) {
      case 'low':
        return 'Risco Baixo';
      case 'medium':
        return 'Risco Médio';
      case 'high':
        return 'Risco Alto';
      default:
        return 'Risco Indefinido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6C4DFF', '#8B5FFF', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bot size={24} color="#FFFFFF" />
            <View>
              <Text style={styles.title}>Pré-análise IA</Text>
              <Text style={styles.subtitle}>{caseTitle}</Text>
            </View>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Star size={16} color="#FFD700" />
            <Text style={styles.confidenceText}>{confidence}%</Text>
          </View>
        </View>

        {/* Analysis Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#E5E7EB" />
            <Text style={styles.metaText}>
              {formatDate(analysisDate)}
            </Text>
          </View>
          
          <Badge 
            label={getRiskText()}
            intent={getRiskBadgeIntent()}
            size="small"
          />
        </View>

        {/* Key Points */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsTitle}>Pontos Principais:</Text>
          {keyPoints.slice(0, 3).map((point, index) => (
            <View key={index} style={styles.pointItem}>
              <View style={styles.pointDot} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
          {keyPoints.length > 3 && (
            <Text style={styles.morePoints}>
              +{keyPoints.length - 3} pontos adicionais
            </Text>
          )}
        </View>

        {/* Cost Estimate */}
        {estimatedCost && (
          <View style={styles.costContainer}>
            <MoneyTile
              value={estimatedCost}
              label="Estimativa"
              size="medium"
              variant="secondary"
            />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onViewFull}
          >
            <FileText size={16} color="#6C4DFF" />
            <Text style={styles.actionButtonText}>Ver Análise Completa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={onScheduleConsult}
          >
            <Text style={styles.scheduleButtonText}>Agendar Consulta</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  confidenceText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#E5E7EB',
  },
  pointsContainer: {
    marginBottom: 16,
  },
  pointsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  pointDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  pointText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 18,
    flex: 1,
  },
  morePoints: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#C7D2FE',
    fontStyle: 'italic',
    marginTop: 4,
  },
  costContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#6C4DFF',
  },
  scheduleButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scheduleButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
}); 