import { StyleSheet, TouchableOpacity, ScrollView, View, Text, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  caracteristicas: string[];
  recomendado?: boolean;
}

export default function PlanosScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const planos: Plano[] = [
    {
      id: 'ato',
      nome: 'Consulta por Ato',
      descricao: 'Pagamento único por consulta específica',
      preco: 150,
      caracteristicas: [
        'Consulta única de 1 hora',
        'Orientação jurídica específica',
        'Relatório de atendimento',
        'Suporte por chat durante 7 dias'
      ]
    },
    {
      id: 'hora',
      nome: 'Consultoria por Hora',
      descricao: 'Cobrança por hora de atendimento utilizada',
      preco: 80,
      caracteristicas: [
        'R$ 80 por hora utilizada',
        'Mínimo de 30 minutos',
        'Chat ilimitado',
        'Agendamento flexível',
        'Documentos inclusos'
      ],
      recomendado: true
    },
    {
      id: 'exito',
      nome: 'Êxito/Resultado',
      descricao: 'Pagamento baseado no resultado obtido',
      preco: 0,
      caracteristicas: [
        'Sem custos iniciais',
        'Honorários sobre o resultado',
        'Avaliação prévia obrigatória',
        'Contrato de risco',
        'Acompanhamento completo'
      ]
    },
    {
      id: 'assinatura',
      nome: 'Plano Assinatura',
      descricao: 'Acesso ilimitado por período mensal',
      preco: 299,
      caracteristicas: [
        'Consultas ilimitadas no mês',
        'Chat 24/7 com advogado',
        'Videochamadas incluídas',
        'Análise de documentos',
        'Suporte prioritário'
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      Alert.alert('Erro', 'Por favor, selecione um plano para continuar.');
      return;
    }

    const plano = planos.find(p => p.id === selectedPlan);
    Alert.alert(
      'Confirmar Plano',
      `Você selecionou o plano "${plano?.nome}". Deseja prosseguir para o pagamento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => router.push('/pagamento') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Escolha seu Plano</ThemedText>
          <ThemedText style={styles.subtitle}>Etapa 3 de 3: Pagamento</ThemedText>
        </View>

        {/* Advogado Atribuído */}
        <ThemedView style={styles.lawyerCard}>
          <ThemedText style={styles.lawyerTitle}>Advogado Atribuído</ThemedText>
          <ThemedText style={styles.lawyerName}>Dr. João Silva</ThemedText>
          <ThemedText style={styles.lawyerSpecialty}>Especialista em Direito Civil</ThemedText>
          <ThemedText style={styles.lawyerOab}>OAB/SP 123.456</ThemedText>
          <ThemedText style={styles.lawyerMessage}>
            "Olá! Analisei sua consulta e estou pronto para ajudá-lo. Escolha o plano que melhor se adequa às suas necessidades."
          </ThemedText>
        </ThemedView>

        {/* Lista de Planos */}
        <ThemedView style={styles.plansSection}>
          <ThemedText style={styles.sectionTitle}>Planos Disponíveis</ThemedText>
          
          {planos.map((plano) => (
            <TouchableOpacity
              key={plano.id}
              style={[
                styles.planCard,
                selectedPlan === plano.id && styles.planCardSelected,
                plano.recomendado && styles.planCardRecommended
              ]}
              onPress={() => handleSelectPlan(plano.id)}
            >
              {plano.recomendado && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMENDADO</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <ThemedText style={styles.planName}>{plano.nome}</ThemedText>
                <View style={styles.planPrice}>
                  {plano.preco > 0 ? (
                    <>
                      <Text style={styles.planPriceValue}>R$ {plano.preco}</Text>
                      <Text style={styles.planPriceUnit}>
                        {plano.id === 'assinatura' ? '/mês' : plano.id === 'hora' ? '/hora' : ''}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.planPriceValue}>Sem custos iniciais</Text>
                  )}
                </View>
              </View>
              
              <ThemedText style={styles.planDescription}>{plano.descricao}</ThemedText>
              
              <View style={styles.planFeatures}>
                {plano.caracteristicas.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </View>
                ))}
              </View>
              
              {selectedPlan === plano.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓ Selecionado</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Botão de Ação */}
        <TouchableOpacity 
          style={[
            styles.proceedButton,
            !selectedPlan && styles.proceedButtonDisabled
          ]}
          onPress={handleProceedToPayment}
          disabled={!selectedPlan}
        >
          <Text style={styles.proceedButtonText}>
            Prosseguir para Pagamento
          </Text>
        </TouchableOpacity>

        {/* Garantias */}
        <ThemedView style={styles.guaranteesCard}>
          <ThemedText style={styles.guaranteesTitle}>Suas Garantias</ThemedText>
          <View style={styles.guaranteeItem}>
            <Text style={styles.guaranteeIcon}>🔒</Text>
            <ThemedText style={styles.guaranteeText}>Pagamento 100% seguro</ThemedText>
          </View>
          <View style={styles.guaranteeItem}>
            <Text style={styles.guaranteeIcon}>📋</Text>
            <ThemedText style={styles.guaranteeText}>Conformidade LGPD e OAB</ThemedText>
          </View>
          <View style={styles.guaranteeItem}>
            <Text style={styles.guaranteeIcon}>⭐</Text>
            <ThemedText style={styles.guaranteeText}>Satisfação garantida</ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 4,
  },
  lawyerCard: {
    backgroundColor: '#F0F7FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  lawyerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  lawyerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  lawyerSpecialty: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 2,
  },
  lawyerOab: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 12,
  },
  lawyerMessage: {
    fontSize: 14,
    color: Colors.light.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  planCardRecommended: {
    borderColor: '#FF6B35',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  planPriceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  planPriceUnit: {
    fontSize: 14,
    color: Colors.secondary,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureIcon: {
    color: '#4CAF50',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedIndicator: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  proceedButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guaranteesCard: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  guaranteesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guaranteeIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#388E3C',
  },
});
