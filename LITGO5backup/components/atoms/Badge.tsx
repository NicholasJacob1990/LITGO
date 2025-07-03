import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  intent?: 'primary' | 'danger' | 'warning' | 'success' | 'neutral';
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({ label, intent = 'neutral', size = 'medium' }: BadgeProps) {
  const getBadgeStyles = () => {
    return [
      styles.badge,
      intent === 'primary' && styles.primary,
      intent === 'danger' && styles.danger,
      intent === 'warning' && styles.warning,
      intent === 'success' && styles.success,
      intent === 'neutral' && styles.neutral,
      size === 'small' && styles.small,
      size === 'large' && styles.large,
      size === 'medium' && styles.medium,
    ].filter(Boolean);
  };

  const getTextStyles = () => {
    return [
      styles.text,
      intent === 'primary' && styles.primaryText,
      intent === 'danger' && styles.dangerText,
      intent === 'warning' && styles.warningText,
      intent === 'success' && styles.successText,
      intent === 'neutral' && styles.neutralText,
      size === 'small' && styles.smallText,
      size === 'large' && styles.largeText,
      size === 'medium' && styles.mediumText,
    ].filter(Boolean);
  };

  return (
    <View style={getBadgeStyles()}>
      <Text style={getTextStyles()}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  // Sizes
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // Colors
  primary: {
    backgroundColor: '#EDE9FE',
  },
  danger: {
    backgroundColor: '#FEF2F2',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  neutral: {
    backgroundColor: '#F3F4F6',
  },
  // Text Colors
  primaryText: {
    color: '#6C4DFF',
  },
  dangerText: {
    color: '#E44C2E',
  },
  warningText: {
    color: '#F5A623',
  },
  successText: {
    color: '#1DB57C',
  },
  neutralText: {
    color: '#6B7280',
  },
  // Text Sizes
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
}); 