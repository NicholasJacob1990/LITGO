import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MessageCircle } from 'lucide-react-native';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import StatusDot from '../atoms/StatusDot';

interface CaseMetaProps {
  lawyer?: {
    name: string;
    avatar?: string;
    specialty?: string;
  };
  createdAt: string;
  unreadMessages?: number;
  clientType?: 'PF' | 'PJ';
  onMessagePress?: () => void;
}

export default function CaseMeta({ 
  lawyer, 
  createdAt, 
  unreadMessages = 0, 
  clientType,
  onMessagePress 
}: CaseMetaProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.dateText}>
            {formatDate(createdAt)}
          </Text>
        </View>
        
        {clientType && (
          <View style={styles.clientTypeContainer}>
            <Badge
              label={clientType}
              intent={clientType === 'PJ' ? 'primary' : 'neutral'}
              size="small"
            />
            {clientType === 'PF' && (
              <StatusDot status="pending" size="small" />
            )}
          </View>
        )}
      </View>

      {lawyer && (
        <View style={styles.lawyerContainer}>
          <Avatar
            src={lawyer.avatar}
            name={lawyer.name}
            size="small"
          />
          <View style={styles.lawyerInfo}>
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            {lawyer.specialty && (
              <Text style={styles.lawyerSpecialty}>{lawyer.specialty}</Text>
            )}
          </View>
          
          {unreadMessages > 0 && (
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={onMessagePress}
            >
              <MessageCircle size={16} color="#006CFF" />
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  lawyerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  lawyerSpecialty: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  messageButton: {
    position: 'relative',
    padding: 4,
  },
  messageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E44C2E',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  messageBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  clientTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
}); 