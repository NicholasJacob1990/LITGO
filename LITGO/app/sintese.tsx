import { StyleSheet, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function SinteseScreen() {
  const router = useRouter();

  const sinteseData = {
    numeroProtocolo: 'LITGO-2025-0001',
    dataGeracao: new Date().toLocaleDateString('pt-BR'),
    area: 'Direito Civil',
    urgencia: 'Média',
    resumo: 'Questão relacionada a contratos e responsabilidade civil envolvendo prestação de serviços.',
    analiseCompleta: `
SÍNTESE JURÍDICA PRELIMINAR

1. RESUMO DOS FATOS:
   O cliente relatou questões contratuais relacionadas à prestação de serviços, 
   com possíveis vícios e necessidade de revisão dos termos acordados.

2. ÁREA JURÍDICA IDENTIFICADA:
   Direito Civil - Contratos e Responsabilidade Civil

3. POSSÍVEIS DIREITOS:
   - Revisão contratual
   - Indenização por danos
   - Rescisão por inadimplemento

4. DOCUMENTOS NECESSÁRIOS:
   - Contrato original
   - Comprovantes de pagamento
   - Correspondências trocadas
   - Evidências dos vícios alegados

5. PRÓXIMOS PASSOS:
   Análise detalhada por advogado especialista em Direito Civil para 
   elaboração de estratégia jurídica adequada.
    `,
    disclaimer: 'Esta análise preliminar foi gerada por IA e está sujeita à conferência humana por um advogado qualificado.'
  };

  const handleContinuar = () => {
    // Redirecionar para a escolha de planos
    router.push('/(tabs)/consulta'); // Por enquanto volta para consulta
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Síntese Jurídica</ThemedText>
          <ThemedText style={styles.subtitle}>Análise Concluída</ThemedText>
        </View>

        {/* Status Card */}
        <ThemedView style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>✓</Text>
          </View>
          <ThemedText style={styles.statusTitle}>Pré-análise Concluída</ThemedText>
          <ThemedText style={styles.statusText}>
            Sua consulta foi analisada e um advogado especialista será atribuído ao seu caso.
          </ThemedText>
        </ThemedView>

        {/* Protocolo */}
        <ThemedView style={styles.protocolCard}>
          <ThemedText style={styles.protocolLabel}>Número do Protocolo:</ThemedText>
          <ThemedText style={styles.protocolNumber}>{sinteseData.numeroProtocolo}</ThemedText>
          <ThemedText style={styles.protocolDate}>Gerado em: {sinteseData.dataGeracao}</ThemedText>
        </ThemedView>

        {/* Análise Resumida */}
        <ThemedView style={styles.analysisCard}>
          <ThemedText style={styles.cardTitle}>Resumo da Análise</ThemedText>
          
          <View style={styles.analysisItem}>
            <ThemedText style={styles.analysisLabel}>Área Jurídica:</ThemedText>
            <ThemedText style={styles.analysisValue}>{sinteseData.area}</ThemedText>
          </View>
          
          <View style={styles.analysisItem}>
            <ThemedText style={styles.analysisLabel}>Urgência:</ThemedText>
            <ThemedText style={styles.analysisValue}>{sinteseData.urgencia}</ThemedText>
          </View>
          
          <View style={styles.analysisItem}>
            <ThemedText style={styles.analysisLabel}>Resumo:</ThemedText>
            <ThemedText style={styles.analysisValue}>{sinteseData.resumo}</ThemedText>
          </View>
        </ThemedView>

        {/* Análise Completa */}
        <ThemedView style={styles.fullAnalysisCard}>
          <ThemedText style={styles.cardTitle}>Análise Detalhada</ThemedText>
          <View style={styles.analysisTextContainer}>
            <Text style={styles.analysisText}>{sinteseData.analiseCompleta}</Text>
          </View>
        </ThemedView>

        {/* Próximos Passos */}
        <ThemedView style={styles.nextStepsCard}>
          <ThemedText style={styles.cardTitle}>Próximos Passos</ThemedText>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <ThemedText style={styles.stepText}>
              Um advogado especialista será atribuído ao seu caso
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <ThemedText style={styles.stepText}>
              Você receberá uma mensagem de boas-vindas
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <ThemedText style={styles.stepText}>
              Escolha o plano de atendimento que melhor se adequa ao seu caso
            </ThemedText>
          </View>
        </ThemedView>

        {/* Botão de Ação */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinuar}>
          <Text style={styles.continueButtonText}>Continuar para Atribuição</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <ThemedView style={styles.disclaimer}>
          <ThemedText style={styles.disclaimerText}>
            {sinteseData.disclaimer}
          </ThemedText>
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
  statusCard: {
    backgroundColor: '#E8F5E8',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#388E3C',
    textAlign: 'center',
  },
  protocolCard: {
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    alignItems: 'center',
  },
  protocolLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  protocolNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
  },
  protocolDate: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 4,
  },
  analysisCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  analysisValue: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 2,
  },
  fullAnalysisCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  analysisTextContainer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  analysisText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  nextStepsCard: {
    backgroundColor: '#F0F7FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
});
