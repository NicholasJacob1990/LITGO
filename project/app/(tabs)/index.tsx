import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scale, Clock, Shield, Users, TrendingUp, Star, Bot, FileText, MessageCircle, Building2, UserCheck, Briefcase } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function HomeScreen() {
  const stats = [
    { icon: Users, label: 'Advogados Ativos', value: '1.2K+' },
    { icon: TrendingUp, label: 'Casos Resolvidos', value: '25K+' },
    { icon: Star, label: 'Avaliação Média', value: '4.9' },
  ];

  const services = [
    {
      title: 'Direito Trabalhista',
      description: 'Demissões, rescisões e direitos trabalhistas',
      color: '#059669',
      icon: Scale,
      cases: '8.5K',
    },
    {
      title: 'Direito Empresarial',
      description: 'Contratos, sociedades e compliance',
      color: '#7C3AED',
      icon: Building2,
      cases: '6.2K',
    },
    {
      title: 'Direito Civil',
      description: 'Contratos, responsabilidade civil e família',
      color: '#DC2626',
      icon: FileText,
      cases: '4.8K',
    },
    {
      title: 'Direito do Consumidor',
      description: 'Defesa e proteção dos direitos do consumidor',
      color: '#F59E0B',
      icon: Shield,
      cases: '3.1K',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'ai_summary',
      title: 'Pré-análise IA Concluída',
      description: 'Caso #2024-0156 - Questão Previdenciária',
      time: '15 min atrás',
      icon: Bot,
      color: '#7C3AED',
    },
    {
      id: '2',
      type: 'lawyer_assigned',
      title: 'Advogado Designado',
      description: 'Dr. Carlos Mendes - Caso #2024-0155',
      time: '1 hora atrás',
      icon: UserCheck,
      color: '#059669',
    },
    {
      id: '3',
      type: 'case_completed',
      title: 'Caso Finalizado',
      description: 'Revisão Contratual - Cliente satisfeito',
      time: '3 horas atrás',
      icon: FileText,
      color: '#1E40AF',
    },
  ];

  const quickActions = [
    {
      title: 'Pessoa Física',
      subtitle: 'Consulta individual',
      icon: Users,
      color: '#1E40AF',
      action: () => router.push('/onboarding?type=PF'),
    },
    {
      title: 'Pessoa Jurídica',
      subtitle: 'Consulta empresarial',
      icon: Building2,
      color: '#059669',
      action: () => router.push('/onboarding?type=PJ'),
    },
    {
      title: 'Seja Advogado',
      subtitle: 'Junte-se à nossa rede',
      icon: Briefcase,
      color: '#7C3AED',
      action: () => router.push('/lawyer-onboarding'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Bem-vindo ao</Text>
          <Text style={styles.logo}>LegalTech Pro</Text>
          <Text style={styles.subtitle}>
            Conectando você aos melhores advogados do Brasil
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <stat.icon size={24} color="#1E40AF" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como podemos ajudar?</Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <LinearGradient
                  colors={[action.color, `${action.color}CC`]}
                  style={styles.quickActionGradient}
                >
                  <action.icon size={28} color="#FFFFFF" />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI-Powered Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tecnologia Avançada</Text>
          
          <View style={styles.aiFeatureCard}>
            <LinearGradient
              colors={['#7C3AED', '#8B5CF6']}
              style={styles.aiFeatureGradient}
            >
              <Bot size={32} color="#FFFFFF" />
              <View style={styles.aiFeatureContent}>
                <Text style={styles.aiFeatureTitle}>Análise Jurídica com IA</Text>
                <Text style={styles.aiFeatureDescription}>
                  Nossa inteligência artificial analisa seu caso em segundos e gera uma 
                  pré-análise que é compartilhada simultaneamente com você e o advogado 
                  designado, agilizando todo o processo.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          
          {recentActivity.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: `${activity.color}15` }]}>
                <activity.icon size={20} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Áreas de Atuação</Text>
          
          {services.map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard}>
              <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
                <service.icon size={20} color={service.color} />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <Text style={styles.serviceCases}>{service.cases} casos resolvidos</Text>
              </View>
              <View style={[styles.serviceIndicator, { backgroundColor: service.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialHeader}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.testimonialAvatar}
            />
            <View>
              <Text style={styles.testimonialName}>Maria Silva</Text>
              <Text style={styles.testimonialRole}>Empresária - São Paulo</Text>
              <View style={styles.testimonialRating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.testimonialText}>
            "A pré-análise por IA me ajudou a entender meu caso antes mesmo de falar com o advogado. 
            Quando chegou a consulta, já tínhamos uma base sólida para trabalhar. Processo muito eficiente!"
          </Text>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>Segurança e Compliance</Text>
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <Shield size={24} color="#059669" />
              <Text style={styles.trustLabel}>LGPD</Text>
              <Text style={styles.trustSubtext}>Compliant</Text>
            </View>
            <View style={styles.trustItem}>
              <Scale size={24} color="#059669" />
              <Text style={styles.trustLabel}>OAB</Text>
              <Text style={styles.trustSubtext}>Regulamentado</Text>
            </View>
            <View style={styles.trustItem}>
              <Lock size={24} color="#059669" />
              <Text style={styles.trustLabel}>SSL</Text>
              <Text style={styles.trustSubtext}>Criptografado</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    marginTop: -16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    gap: 16,
  },
  quickActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  aiFeatureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aiFeatureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  aiFeatureContent: {
    marginLeft: 16,
    flex: 1,
  },
  aiFeatureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aiFeatureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  activityDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  serviceCases: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#059669',
  },
  serviceIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  testimonialName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  testimonialRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
  },
  testimonialText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  trustSection: {
    marginBottom: 32,
  },
  trustTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    marginTop: 8,
  },
  trustSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
});