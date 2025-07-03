import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, Eye } from 'lucide-react-native';
import CaseHeader from '../molecules/CaseHeader';
import CaseMeta from '../molecules/CaseMeta';
import Badge from '../atoms/Badge';
import StatusDot from '../atoms/StatusDot';
import ProgressBar from '../atoms/ProgressBar';

interface CaseCardProps {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'completed' | 'summary_generated';
  priority: 'low' | 'medium' | 'high';
  clientType: 'PF' | 'PJ';
  createdAt: string;
  nextStep: string;
  hasAiSummary?: boolean;
  summarySharedAt?: string;
  unreadMessages?: number;
  lawyer?: {
    name: string;
    avatar?: string;
    specialty?: string;
  };
  onPress?: () => void;
  onViewSummary?: () => void;
  onChat?: () => void;
}

export default function CaseCard({
  id,
  title,
  description,
  status,
  priority,
  clientType,
  createdAt,
  nextStep,
  hasAiSummary = false,
  summarySharedAt,
  unreadMessages = 0,
  lawyer,
  onPress,
  onViewSummary,
  onChat
}: CaseCardProps) {
  const getStatusBadgeIntent = () => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'pending':
        return 'danger';
      case 'summary_generated':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Aguardando';
      case 'summary_generated':
        return 'Pré-análise Pronta';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityValue = () => {
    switch (priority) {
      case 'high':
        return 8;
      case 'medium':
        return 5;
      case 'low':
        return 2;
      default:
        return 0;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CaseHeader title={title} subtitle={description} />
        </View>
        
        <View style={styles.headerRight}>
          <StatusDot status={status} />
          <Badge 
            label={getStatusText()} 
            intent={getStatusBadgeIntent()} 
            size="small" 
          />
        </View>
      </View>

      {/* Priority Bar */}
      {priority !== 'low' && (
        <View style={styles.prioritySection}>
          <ProgressBar 
            value={getPriorityValue()} 
            maxValue={10} 
            height={4}
          />
        </View>
      )}

      {/* AI Summary Section */}
      {hasAiSummary && summarySharedAt && (
        <View style={styles.aiSummarySection}>
          <View style={styles.aiSummaryBadge}>
            <Bot size={16} color="#6C4DFF" />
            <View style={styles.aiSummaryContent}>
              <Badge label="IA" intent="primary" size="small" />
              <View style={styles.aiSummaryText}>
                <View style={styles.aiSummaryLine}>
                  <View style={styles.aiSummaryDot} />
                  <View style={styles.aiSummaryDot} />
                  <View style={styles.aiSummaryDot} />
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Meta Section */}
      <CaseMeta
        lawyer={lawyer}
        createdAt={createdAt}
        unreadMessages={unreadMessages}
        clientType={clientType}
        onMessagePress={onChat}
      />

      {/* Next Step */}
      <View style={styles.nextStepSection}>
        <View style={styles.nextStepIndicator} />
        <View style={styles.nextStepContent}>
          <Badge label="Próximo" intent="neutral" size="small" />
          <Text style={styles.nextStepText}>
            {nextStep}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
          <Eye size={16} color="#006CFF" />
          <Text style={styles.viewDetailsText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#006CFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  prioritySection: {
    marginBottom: 12,
  },
  aiSummarySection: {
    marginBottom: 12,
  },
  aiSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6C4DFF',
    gap: 8,
  },
  aiSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  aiSummaryText: {
    flex: 1,
  },
  aiSummaryLine: {
    flexDirection: 'row',
    gap: 4,
  },
  aiSummaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C4DFF',
  },
  nextStepSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  nextStepIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5A623',
    marginTop: 2,
  },
  nextStepContent: {
    flex: 1,
    gap: 4,
  },
  nextStepText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  viewDetailsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#006CFF',
  },
}); 