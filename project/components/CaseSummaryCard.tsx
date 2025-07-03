import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scale, Clock, TriangleAlert as AlertTriangle, FileText, CircleCheck as CheckCircle2, Eye, Share2, DollarSign } from 'lucide-react-native';

interface CaseSummary {
  id: string;
  legalArea: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  urgencyLevel: number;
  estimatedDeadline: string;
  requiredDocuments: string[];
  preliminaryAnalysis: string;
  recommendedActions: string[];
  potentialOutcomes: string[];
  estimatedCosts: {
    consultation: number;
    representation: number;
  };
  riskAssessment: string;
  generatedAt: string;
}

interface CaseSummaryCardProps {
  summary: CaseSummary;
  onViewDetails: () => void;
  onShare: () => void;
  showLawyerActions?: boolean;
}

export default function CaseSummaryCard({ 
  summary, 
  onViewDetails, 
  onShare,
  showLawyerActions = false 
}: CaseSummaryCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#D97706';
      case 'low':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle size={16} color="#FFFFFF" />;
      case 'high':
        return <Clock size={16} color="#FFFFFF" />;
      case 'medium':
        return <Scale size={16} color="#FFFFFF" />;
      case 'low':
        return <CheckCircle2 size={16} color="#FFFFFF" />;
      default:
        return <FileText size={16} color="#FFFFFF" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(summary.priority) }]}>
            {getPriorityIcon(summary.priority)}
            <Text style={styles.priorityText}>
              {summary.priority.charAt(0).toUpperCase() + summary.priority.slice(1)}
            </Text>
          </View>
          <Text style={styles.legalArea}>{summary.legalArea}</Text>
        </View>
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Share2 size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* AI Analysis Badge */}
      <View style={styles.aiBadge}>
        <LinearGradient
          colors={['#7C3AED', '#8B5CF6']}
          style={styles.aiGradient}
        >
          <Text style={styles.aiText}>Análise Preliminar por IA</Text>
          <Text style={styles.aiDisclaimer}>Sujeita a conferência humana</Text>
        </LinearGradient>
      </View>

      {/* Key Information */}
      <View style={styles.keyInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prazo Estimado:</Text>
          <Text style={styles.infoValue}>{summary.estimatedDeadline}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nível de Urgência:</Text>
          <View style={styles.urgencyBar}>
            <View 
              style={[
                styles.urgencyFill, 
                { 
                  width: `${(summary.urgencyLevel / 10) * 100}%`,
                  backgroundColor: getPriorityColor(summary.priority)
                }
              ]} 
            />
          </View>
          <Text style={styles.urgencyText}>{summary.urgencyLevel}/10</Text>
        </View>
      </View>

      {/* Preliminary Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análise Preliminar</Text>
        <Text style={styles.analysisText} numberOfLines={3}>
          {summary.preliminaryAnalysis}
        </Text>
      </View>

      {/* Required Documents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos Necessários</Text>
        <View style={styles.documentsList}>
          {summary.requiredDocuments.slice(0, 3).map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <FileText size={14} color="#059669" />
              <Text style={styles.documentText}>{doc}</Text>
            </View>
          ))}
          {summary.requiredDocuments.length > 3 && (
            <Text style={styles.moreDocuments}>
              +{summary.requiredDocuments.length - 3}  documentos adicionais
            </Text>
          )}
        </View>
      </View>

      {/* Cost Estimation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimativa de Custos</Text>
        <View style={styles.costsContainer}>
          <View style={styles.costItem}>
            <DollarSign size={16} color="#059669" />
            <Text style={styles.costLabel}>Consulta</Text>
            <Text style={styles.costValue}>
              {formatCurrency(summary.estimatedCosts.consultation)}
            </Text>
          </View>
          <View style={styles.costItem}>
            <DollarSign size={16} color="#1E40AF" />
            <Text style={styles.costLabel}>Representação</Text>
            <Text style={styles.costValue}>
              {formatCurrency(summary.estimatedCosts.representation)}
            </Text>
          </View>
        </View>
      </View>

      {/* Risk Assessment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliação de Risco</Text>
        <Text style={styles.riskText}>{summary.riskAssessment}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
          <Eye size={16} color="#1E40AF" />
          <Text style={styles.viewButtonText}>Ver Análise Completa</Text>
        </TouchableOpacity>
        
        {showLawyerActions && (
          <TouchableOpacity style={styles.acceptButton}>
            <LinearGradient
              colors={['#059669', '#10B981']}
              style={styles.acceptGradient}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Aceitar Caso</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Generation Timestamp */}
      <Text style={styles.timestamp}>
        Gerado em {new Date(summary.generatedAt).toLocaleString('pt-BR')}
      </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  legalArea: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
  },
  shareButton: {
    padding: 8,
  },
  aiBadge: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  aiText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  aiDisclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#E0E7FF',
  },
  keyInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    width: 120,
  },
  infoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  urgencyBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  urgencyFill: {
    height: '100%',
    borderRadius: 3,
  },
  urgencyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1F2937',
    width: 30,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  analysisText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  documentsList: {
    gap: 6,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  moreDocuments: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  costsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  costItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  costLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 4,
  },
  costValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1F2937',
  },
  riskText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 6,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  acceptButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});