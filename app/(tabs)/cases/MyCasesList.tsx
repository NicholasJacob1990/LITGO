import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import CaseCard from '@/components/organisms/CaseCard';
import PreAnalysisCard from '@/components/organisms/PreAnalysisCard';
import CaseHeader from '@/components/organisms/CaseHeader';
import Badge from '@/components/atoms/Badge';
import FabNewCase from '@/components/layout/FabNewCase';

// Sample data with proper typing
const mockCases = [
  {
    id: '001',
    title: 'Rescisão Trabalhista',
    description: 'Demissão sem justa causa - Cálculo de verbas rescisórias',
    status: 'active' as const,
    priority: 'high' as const,
    clientType: 'PF' as const,
    createdAt: '2024-01-15',
    nextStep: 'Aguardando documentos adicionais do cliente',
    hasAiSummary: true,
    summarySharedAt: '2024-01-15T10:30:00Z',
    unreadMessages: 12,
    lawyer: {
      name: 'Dr. Carlos Mendes',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      specialty: 'Direito Trabalhista'
    },
  },
  {
    id: '002',
    title: 'Contrato Empresarial',
    description: 'Revisão de contrato de prestação de serviços B2B',
    status: 'completed' as const,
    priority: 'medium' as const,
    clientType: 'PJ' as const,
    createdAt: '2024-01-10',
    nextStep: 'Caso finalizado com sucesso',
    hasAiSummary: true,
    summarySharedAt: '2024-01-10T14:20:00Z',
    unreadMessages: 0,
    lawyer: {
      name: 'Dra. Ana Paula Santos',
      avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
      specialty: 'Direito Empresarial'
    },
  },
  {
    id: '003',
    title: 'Reclamação Consumidor',
    description: 'Produto com defeito - Reembolso e danos morais',
    status: 'pending' as const,
    priority: 'low' as const,
    clientType: 'PF' as const,
    createdAt: '2024-01-19',
    nextStep: 'Aguardando atribuição de advogado especializado',
    hasAiSummary: true,
    summarySharedAt: '2024-01-19T09:15:00Z',
    unreadMessages: 0,
  },
  {
    id: '004',
    title: 'Compliance Empresarial',
    description: 'Adequação LGPD - Implementação de políticas de privacidade',
    status: 'summary_generated' as const,
    priority: 'medium' as const,
    clientType: 'PJ' as const,
    createdAt: '2024-01-20',
    nextStep: 'Pré-análise concluída - Aguardando atribuição',
    hasAiSummary: true,
    summarySharedAt: '2024-01-20T11:45:00Z',
    unreadMessages: 0,
  },
  {
    id: '005',
    title: 'Questão Previdenciária',
    description: 'Revisão de benefício INSS - Aposentadoria por tempo de contribuição',
    status: 'summary_generated' as const,
    priority: 'medium' as const,
    clientType: 'PF' as const,
    createdAt: '2024-01-20',
    nextStep: 'Análise IA disponível para revisão',
    hasAiSummary: true,
    summarySharedAt: '2024-01-20T11:45:00Z',
    unreadMessages: 0,
  },
];

// Sample pre-analysis data
const mockPreAnalysis = {
  caseTitle: 'Questão Previdenciária',
  analysisDate: '2024-01-20T11:45:00Z',
  confidence: 87,
  estimatedCost: 2500,
  riskLevel: 'medium' as const,
  keyPoints: [
    'Documentação completa e válida para aposentadoria',
    'Tempo de contribuição suficiente conforme legislação',
    'Possibilidade de revisão do valor do benefício',
    'Recomendação de acompanhamento jurídico especializado',
    'Prazo legal para contestação ainda válido'
  ]
};

const HEADER_HEIGHT = 220; // Approximate height of CaseHeader + Filters

export default function MyCasesList() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const filters = [
    { id: 'all', label: 'Todos', count: mockCases.length },
    { id: 'active', label: 'Ativos', count: mockCases.filter(c => c.status === 'active').length },
    { id: 'pending', label: 'Pendentes', count: mockCases.filter(c => c.status === 'pending').length },
    { id: 'summary_generated', label: 'Pré-análise', count: mockCases.filter(c => c.status === 'summary_generated').length },
    { id: 'completed', label: 'Concluídos', count: mockCases.filter(c => c.status === 'completed').length },
  ];

  const filteredCases = activeFilter === 'all' 
    ? mockCases 
    : mockCases.filter(case_ => case_.status === activeFilter);

  // Calculate case statistics for the header
  const caseStats = [
    { key: 'triagem', label: 'Em Triagem', count: mockCases.filter(c => c.status === 'summary_generated').length },
    { key: 'atribuido', label: 'Atribuído', count: mockCases.filter(c => c.status === 'active').length },
    { key: 'pagamento', label: 'Pagamento', count: 0 }, // No cases with this status in mock data
    { key: 'atendimento', label: 'Atendimento', count: mockCases.filter(c => c.status === 'pending').length },
    { key: 'finalizado', label: 'Finalizado', count: mockCases.filter(c => c.status === 'completed').length },
  ];

  const handleCasePress = (caseId: string) => {
    navigation.navigate('CaseDetail', { caseId });
  };

  const handleViewSummary = (caseId: string) => {
    console.log('View AI Summary for case:', caseId);
    // Navigate to summary screen or show modal
  };

  const handleChat = (caseId: string) => {
    console.log('Open chat for case:', caseId);
    // Navigate to chat screen
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }], opacity: headerOpacity }]}>
        {/* Enhanced Header */}
        <CaseHeader caseStats={caseStats} totalCases={mockCases.length} />

        {/* Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter.id && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
              <Badge
                label={filter.count.toString()}
                intent={activeFilter === filter.id ? 'primary' : 'neutral'}
                size="small"
              />
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* Cases List */}
      <Animated.ScrollView 
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 24 }} // Adjust paddingTop to account for absolute header
      >
        {/* AI Pre-Analysis Card (if any case has summary_generated status) */}
        {activeFilter === 'summary_generated' && (
          <PreAnalysisCard
            {...mockPreAnalysis}
            onViewFull={() => console.log('View full analysis')}
            onScheduleConsult={() => console.log('Schedule consultation')}
          />
        )}

        {/* Case Cards */}
        {filteredCases.map((case_) => (
          <CaseCard
            key={case_.id}
            {...case_}
            onPress={() => handleCasePress(case_.id)}
            onViewSummary={() => handleViewSummary(case_.id)}
            onChat={() => handleChat(case_.id)}
          />
        ))}

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum caso encontrado</Text>
            <Text style={styles.emptyStateDescription}>
              {activeFilter === 'all' 
                ? 'Você ainda não possui casos. Inicie uma nova consulta jurídica!' 
                : `Não há casos com status "${filters.find(f => f.id === activeFilter)?.label}".`}
            </Text>
          </View>
        )}
      </Animated.ScrollView>
      <FabNewCase />
    </View>
  );
}

// Export mockCases for use in other components
export { mockCases };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#F8FAFC', // Match container background
  },
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContainer: {
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: '#006CFF',
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
}); 