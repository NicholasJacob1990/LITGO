import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { CreditCard, FileText, TrendingUp } from 'lucide-react-native';

const FinancialDashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Finanças</Text>
          <Text style={styles.subtitle}>Acompanhe suas faturas e pagamentos</Text>
        </View>

        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Saldo Devedor</Text>
            <Text style={styles.kpiValue}>R$ 1.250,00</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Próximo Vencimento</Text>
            <Text style={styles.kpiValue}>15/08/2025</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <View style={styles.actionCard}>
            <FileText size={24} color="#1E40AF" />
            <Text style={styles.actionText}>Ver Faturas</Text>
          </View>
          <View style={styles.actionCard}>
            <CreditCard size={24} color="#059669" />
            <Text style={styles.actionText}>Métodos de Pag.</Text>
          </View>
          <View style={styles.actionCard}>
            <TrendingUp size={24} color="#7C3AED" />
            <Text style={styles.actionText}>Histórico</Text>
          </View>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Gráficos e outras informações aparecerão aqui em breve.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 24,
    backgroundColor: '#1E3A8A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    marginTop: 4,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  kpiCard: {
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: 16,
  },
  actionCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '30%',
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default FinancialDashboardScreen; 