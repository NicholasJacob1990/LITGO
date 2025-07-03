import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CaseHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'detailed';
}

export default function CaseHeader({ title, subtitle, variant = 'default' }: CaseHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={[
        styles.title,
        variant === 'detailed' && styles.titleDetailed
      ]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[
          styles.subtitle,
          variant === 'detailed' && styles.subtitleDetailed
        ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    lineHeight: 24,
  },
  titleDetailed: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 4,
  },
  subtitleDetailed: {
    fontSize: 16,
    lineHeight: 22,
  },
}); 