import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import StatusDot from '../atoms/StatusDot';
import ProgressBar from '../atoms/ProgressBar';

interface StepItemProps {
  title: string;
  description?: string;
  status: 'completed' | 'active' | 'pending' | 'warning';
  priority?: number; // 1-10
  dueDate?: string;
  isLast?: boolean;
}

export default function StepItem({ 
  title, 
  description, 
  status, 
  priority, 
  dueDate,
  isLast = false 
}: StepItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#1DB57C" />;
      case 'active':
        return <Clock size={20} color="#006CFF" />;
      case 'warning':
        return <AlertCircle size={20} color="#F5A623" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getStatusIcon()}
        {!isLast && <View style={styles.connector} />}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            status === 'completed' && styles.titleCompleted
          ]}>
            {title}
          </Text>
          
          <View style={styles.meta}>
            <StatusDot status={status} size="small" />
            {dueDate && (
              <Text style={styles.dueDate}>
                {formatDate(dueDate)}
              </Text>
            )}
          </View>
        </View>
        
        {description && (
          <Text style={[
            styles.description,
            status === 'completed' && styles.descriptionCompleted
          ]}>
            {description}
          </Text>
        )}
        
        {priority && priority > 0 && (
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Prioridade:</Text>
            <ProgressBar value={priority} maxValue={10} height={6} />
            <Text style={styles.priorityValue}>{priority}/10</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  titleCompleted: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  descriptionCompleted: {
    color: '#9CA3AF',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priorityLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#374151',
  },
  priorityValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#374151',
    minWidth: 32,
  },
}); 