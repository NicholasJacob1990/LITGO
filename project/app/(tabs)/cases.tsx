import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Eye, MessageCircle, Calendar, Bot, FileText, Building2, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function CasesScreen() {
  const [activeFilter, setActiveFilter] = useState('all');

  const cases = [
    {
      id: '001',
      title: 'Rescisão Trabalhista',
      description: 'Demissão sem justa causa - Cálculo de verbas rescisórias',
      status: 'active',
      priority: 'high',
      clientType: 'PF',
      lawyer: {
        name: 'Dr. Carlos Mendes',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
        specialty: 'Direito Trabalhista'
      },
      createdAt: '2024-01-15',
      lastUpdate: '2024-01-18',
      nextStep: 'Aguardando documentos adicionais',
      messages: 12,
      hasAiSummary: true,
      summarySharedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '002',
      title: 'Contrato Empresarial',
      description: 'Revisão de contrato de prestação de serviços B2B',
      status: 'completed',
      priority: 'medium',
      clientType: 'PJ',
      lawyer: {
        name: 'Dra. Ana Paula Santos',
        avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
        specialty: 'Direito Empresarial'
      },
      createdAt: '2024-01-10',
      lastUpdate: '2024-01-17',
      nextStep: 'Caso finalizado',
      messages: 8,
      hasAiSummary: true,
      summarySharedAt: '2024-01-10T14:20:00Z',
    },
    {
      id: '003',
      title: 'Reclamação Consumidor',
      description: 'Produto com defeito - Reembolso e danos morais',
      status: 'pending',
      priority: 'low',
      clientType: 'PF',
      lawyer: null,
      createdAt: '2024-01-19',
      lastUpdate: '2024-01-19',
      nextStep: 'Aguardando atribuição de advogado',
      messages: 0,
      hasAiSummary: true,
      summarySharedAt: '2024-01-19T09:15:00Z',
    },
    {
      id: '004',
      title: 'Compliance Empresarial',
      description: 'Adequação LGPD - Implementação de políticas de privacidade',
      status: 'summary_generated',
      priority: 'medium',
      clientType: 'PJ',
      lawyer: null,
      createdAt: '2024-01-20',
      lastUpdate: '2024-01-20',
      nextStep: 'Pré-análise concluída - Aguardando atribuição',
      messages: 0,
      hasAiSummary: true,
      summarySharedAt: '2024-01-20T11:45:00Z',
    },
    {
      id: '005',
      title: 'Questão Previdenciária',
      description: 'Revisão de benefício INSS - Aposentadoria por tempo de contribuição',
      status: 'summary_generated',
      priority: 'medium',
      clientType: 'PF',
      lawyer: null,
      createdAt: '2024-01-20',
      lastUpdate: '2024-01-20',
      nextStep: 'Pré-análise concluída - Aguardando atribuição',
      messages: 0,
      hasAiSummary: true,
      summarySharedAt: '2024-01-20T11:45:00Z',
    },
  ];

  const filters = [
    { id: 'all', label: 'Todos', count: cases.length },
    { id: 'active', label: 'Ativos', count: cases.filter(c => c.status === 'active').length },
    { id: 'pending', label: 'Pendentes', count: cases.filter(c => c.status === 'pending').length },
    { id: 'summary_generated', label: 'Pré-análise', count: cases.filter(c => c.status === 'summary_generated').length },
    { id: 'completed', label: 'Concluídos', count: cases.filter(c => c.status === 'completed').length },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock size={16} color="#F59E0B" />;
      case 'completed':
        return <CheckCircle size={16} color="#10B981" />;
      case 'pending':
        return <AlertCircle size={16} color="#EF4444" />;
      case 'summary_generated':
        return <Bot size={16} color="#7C3AED" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#EF4444';
      case 'summary_generated':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Aguardando';
      case 'summary_generated':
        return 'Pré-análise Pronta';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const filteredCases = activeFilter === 'all' 
    ? cases 
    : cases.filter(case_ => case_.status === activeFilter);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Casos</Text>
        <Text style={styles.headerSubtitle}>
          Acompanhe o progresso de suas consultas jurídicas
        </Text>
      </View>

      {/* Filters */}
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
            <View style={[
              styles.filterBadge,
              activeFilter === filter.id && styles.filterBadgeActive
            ]}>
              <Text style={[
                styles.filterBadgeText,
                activeFilter === filter.id && styles.filterBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cases List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCases.map((case_) => (
          <TouchableOpacity key={case_.id} style={styles.caseCard}>
            <View style={styles.caseHeader}>
              <View style={styles.caseInfo}>
                <View style={styles.caseTitleRow}>
                  <Text style={styles.caseTitle}>{case_.title}</Text>
                  <View style={styles.caseTypeBadge}>
                    {case_.clientType === 'PJ' ? (
                      <Building2 size={12} color="#7C3AED" />
                    ) : (
                      <User size={12} color="#1E40AF" />
                    )}
                    <Text style={[
                      styles.caseTypeText,
                      { color: case_.clientType === 'PJ' ? '#7C3AED' : '#1E40AF' }
                    ]}>
                      {case_.clientType}
                    </Text>
                  </View>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(case_.priority) }]} />
                </View>
                <Text style={styles.caseDescription}>{case_.description}</Text>
              </View>
              <View style={styles.caseStatus}>
                {getStatusIcon(case_.status)}
                <Text style={[styles.statusText, { color: getStatusColor(case_.status) }]}>
                  {getStatusText(case_.status)}
                </Text>
              </View>
            </View>

            {/* AI Summary Badge */}
            {case_.hasAiSummary && (
              <View style={styles.aiSummaryBadge}>
                <Bot size={16} color="#7C3AED" />
                <Text style={styles.aiSummaryText}>
                  Pré-análise IA gerada em {formatDateTime(case_.summarySharedAt)}
                </Text>
                <TouchableOpacity style={styles.viewSummaryButton}>
                  <FileText size={14} color="#7C3AED" />
                  <Text style={styles.viewSummaryText}>Ver</Text>
                </TouchableOpacity>
              </View>
            )}

            {case_.lawyer && (
              <View style={styles.lawyerInfo}>
                <Image source={{ uri: case_.lawyer.avatar }} style={styles.lawyerAvatar} />
                <View style={styles.lawyerDetails}>
                  <Text style={styles.lawyerName}>{case_.lawyer.name}</Text>
                  <Text style={styles.lawyerSpecialty}>{case_.lawyer.specialty}</Text>
                </View>
                <TouchableOpacity style={styles.messageButton}>
                  <MessageCircle size={20} color="#1E40AF" />
                  {case_.messages > 0 && (
                    <View style={styles.messageBadge}>
                      <Text style={styles.messageBadgeText}>{case_.messages}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {!case_.lawyer && case_.status === 'summary_generated' && (
              <View style={styles.pendingAssignment}>
                <View style={styles.pendingIcon}>
                  <Bot size={20} color="#7C3AED" />
                </View>
                <View style={styles.pendingContent}>
                  <Text style={styles.pendingTitle}>Pré-análise Concluída</Text>
                  <Text style={styles.pendingDescription}>
                    Sua análise jurídica foi gerada e enviada para atribuição de advogado especializado
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.caseFooter}>
              <View style={styles.footerLeft}>
                <View style={styles.footerItem}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.footerText}>Criado em {formatDate(case_.createdAt)}</Text>
                </View>
                <Text style={styles.nextStep}>{case_.nextStep}</Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Eye size={16} color="#1E40AF" />
                <Text style={styles.viewButtonText}>Ver Detalhes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

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
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  },
  filterButtonActive: {
    backgroundColor: '#1E40AF',
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  filterBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1F2937',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  caseInfo: {
    flex: 1,
    marginRight: 16,
  },
  caseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  caseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    flex: 1,
  },
  caseTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 8,
  },
  caseTypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    marginLeft: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  caseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  caseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginLeft: 4,
  },
  aiSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
  aiSummaryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    marginLeft: 8,
  },
  viewSummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewSummaryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#7C3AED',
    marginLeft: 4,
  },
  lawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  lawyerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  lawyerSpecialty: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  messageButton: {
    position: 'relative',
    padding: 8,
  },
  messageBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  pendingAssignment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  pendingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    flex: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  nextStep: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1F2937',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 4,
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