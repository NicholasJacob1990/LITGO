import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LogoJacobCompact from '../branding/LogoJacobCompact';
import StatusProgressBar from '../molecules/StatusProgressBar';

interface CaseStat {
  key: string;
  label: string;
  count: number;
}

interface CaseHeaderProps {
  caseStats: CaseStat[];
  totalCases: number;
}

const statusColors: Record<string, string> = {
  triagem: '#F59E0B',
  atribuido: '#3B82F6',
  pagamento: '#F97316',
  atendimento: '#0d9488',
  finalizado: '#10B981',
};

export default function CaseHeader({ caseStats, totalCases }: CaseHeaderProps) {
  const data = caseStats.map((s) => ({
    ...s,
    color: statusColors[s.key] || '#6B7280',
  }));

  return (
    <LinearGradient
      colors={['#3b82f6', '#1d4ed8']}
      style={styles.container}
    >
      <View style={styles.row}>
        <LogoJacobCompact />
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.total}>{totalCases}</Text>
          <Text style={styles.totalLabel}>Casos Ativos</Text>
        </View>
      </View>
      <StatusProgressBar statuses={data} total={totalCases} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  total: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '800',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: -4,
  },
}); 