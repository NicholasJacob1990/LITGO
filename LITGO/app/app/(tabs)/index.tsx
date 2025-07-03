import { StyleSheet, TouchableOpacity, ScrollView, View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section with Modern Gradient */}
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>LITGO</Text>
            <View style={styles.brandBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.brandBadgeText}>Plataforma Oficial</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Plataforma Jurídica Inteligente</Text>
          <Text style={styles.heroDescription}>
            Conecte-se à justiça com transparência total. Nossa IA realiza pré-análise do seu caso antes mesmo do pagamento, garantindo decisões informadas e confiança mútua.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryCTA} 
            onPress={() => router.push('/(tabs)/consulta')}
            activeOpacity={0.8}
          >
            <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryCTAText}>Iniciar Consulta Gratuita</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Trust Indicators - Redesigned */}
        <View style={styles.trustSection}>
          <View style={styles.trustCard}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="eye-outline" size={24} color="#667eea" />
            </View>
            <Text style={styles.trustNumber}>100%</Text>
            <Text style={styles.trustLabel}>Transparente</Text>
            <Text style={styles.trustDescription}>Síntese IA compartilhada com cliente e advogado</Text>
          </View>
          
          <View style={styles.trustCard}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="flash-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.trustNumber}>24h</Text>
            <Text style={styles.trustLabel}>Resposta Rápida</Text>
            <Text style={styles.trustDescription}>Atribuição automática de especialistas</Text>
          </View>
          
          <View style={styles.trustCard}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.trustNumber}>LGPD</Text>
            <Text style={styles.trustLabel}>Compliance Total</Text>
            <Text style={styles.trustDescription}>Conformidade OAB e proteção de dados</Text>
          </View>
        </View>

        {/* How it Works - Modern Cards */}
        <View style={styles.processSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Como Funciona</Text>
            <Text style={styles.sectionSubtitle}>
              Processo transparente e inteligente em 3 etapas principais
            </Text>
          </View>
          
          <View style={styles.processSteps}>
            <View style={styles.processStep}>
              <View style={styles.stepIconContainer}>
                <View style={styles.stepIcon}>
                  <Text style={styles.stepIconText}>1</Text>
                </View>
                <View style={styles.stepConnector} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Descrição do Caso</Text>
                <Text style={styles.stepDescription}>
                  Descreva sua questão jurídica através de texto ou voz. Nossa IA classifica automaticamente área e urgência.
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepIconContainer}>
                <View style={styles.stepIcon}>
                  <Text style={styles.stepIconText}>2</Text>
                </View>
                <View style={styles.stepConnector} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Análise Prévia por IA</Text>
                <Text style={styles.stepDescription}>
                  Receba uma síntese jurídica preliminar antes do pagamento. Transparência total desde o início.
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepIconContainer}>
                <View style={styles.stepIcon}>
                  <Text style={styles.stepIconText}>3</Text>
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Atendimento Especializado</Text>
                <Text style={styles.stepDescription}>
                  Advogado especialista assume o caso com base na análise prévia. Chat ou vídeo com IA assistente.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits Section - Modern Cards */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Por que Escolher LITGO?</Text>
          </View>
          
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name="analytics-outline" size={24} color="#667eea" />
              </View>
              <Text style={styles.benefitTitle}>Inteligência Artificial Jurídica</Text>
              <Text style={styles.benefitDescription}>
                Triagem automática e sugestões de jurisprudência em tempo real durante o atendimento.
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name="eye-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.benefitTitle}>Transparência Total</Text>
              <Text style={styles.benefitDescription}>
                Síntese do caso compartilhada simultaneamente com cliente e advogado antes do pagamento.
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name="lock-closed-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.benefitTitle}>Segurança e Compliance</Text>
              <Text style={styles.benefitDescription}>
                Conformidade total com LGPD, Provimento 205 OAB e criptografia de ponta a ponta.
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name="card-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.benefitTitle}>Pagamento Flexível</Text>
              <Text style={styles.benefitDescription}>
                Escolha entre modalidades: Ato, Hora, Êxito ou Assinatura. PIX e cartão aceitos.
              </Text>
            </View>
          </View>
        </View>

        {/* Final CTA - Modern Design */}
        <View style={styles.finalCTASection}>
          <LinearGradient 
            colors={['#10B981', '#059669']} 
            style={styles.finalCTAGradient}
          >
            <Text style={styles.finalCTATitle}>Pronto para Começar?</Text>
            <Text style={styles.finalCTADescription}>
              Obtenha sua análise jurídica preliminar gratuita em minutos
            </Text>
            
            <TouchableOpacity 
              style={styles.secondaryCTA} 
              onPress={() => router.push('/(tabs)/consulta')}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={18} color="#10B981" />
              <Text style={styles.secondaryCTAText}>Consultar Agora</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Legal Footer - Clean Design */}
        <View style={styles.legalFooter}>
          <View style={styles.legalHeader}>
            <Ionicons name="business-outline" size={20} color="#667eea" />
            <Text style={styles.legalTitle}>JACOBS ADVOGADOS ASSOCIADOS</Text>
          </View>
          <Text style={styles.legalText}>
            Esta plataforma é um canal oficial do escritório Jacobs Advogados Associados. 
            A análise preliminar gerada por inteligência artificial é sujeita à conferência 
            e validação por advogado qualificado, em conformidade com o art. 34, VII do EOAB.
          </Text>
          <Text style={styles.legalText}>
            Dados protegidos conforme LGPD. Retenção de 5 anos, posterior pseudonimização.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Hero Section
  heroGradient: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginRight: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  brandSubtitle: {
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    opacity: 0.95,
    paddingHorizontal: 10,
  },
  primaryCTA: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryCTAText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 20,
  },

  // Trust Section
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 40,
    gap: 12,
  },
  trustCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  trustIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  trustLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  trustDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Process Section
  processSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  processSteps: {
    gap: 32,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  stepConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 40,
  },
  benefitsGrid: {
    gap: 16,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  // Final CTA Section
  finalCTASection: {
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  finalCTAGradient: {
    padding: 40,
    alignItems: 'center',
  },
  finalCTATitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  finalCTADescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.95,
    lineHeight: 24,
  },
  secondaryCTA: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryCTAText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Legal Footer
  legalFooter: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 1,
    marginLeft: 8,
  },
  legalText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
});
