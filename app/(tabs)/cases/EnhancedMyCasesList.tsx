import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert, RefreshControl } from 'react-native';
import { useState, useRef, useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserCases, getCaseStats, CaseData } from '@/lib/services/cases';
import { getUnreadMessagesCount } from '@/lib/services/chat';
import CaseCard from '@/components/organisms/CaseCard';
import PreAnalysisCard from '@/components/organisms/PreAnalysisCard';
import CaseHeader from '@/components/organisms/CaseHeader';
import Badge from '@/components/atoms/Badge';
import FabNewCase from '@/components/layout/FabNewCase';
import EmptyState from '@/components/atoms/EmptyState';
import ErrorState from '@/components/atoms/ErrorState';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import SearchBar from '@/components/molecules/SearchBar';
import FilterModal from '@/components/molecules/FilterModal';
import { Briefcase, Plus, SortAsc, SortDesc } from 'lucide-react-native';

// Tipos para filtros
interface CaseFilters {
  status?: string[];
  priority?: string[];
  dateRange?: string;
  hasLawyer?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Dados mock com tipagem correta
const mockCases: CaseData[] = [
  {
    id: '001',
    client_id: 'client-1',
    lawyer_id: 'lawyer-1',
    status: 'in_progress',
    ai_analysis: {
      title: 'Rescisão Trabalhista',
      description: 'Demissão sem justa causa - Cálculo de verbas rescisórias',
      priority: 'high',
      client_type: 'PF'
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    lawyer: {
      name: 'Dr. Carlos Mendes',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      specialty: 'Direito Trabalhista'
    }
  },
  {
    id: '002',
    client_id: 'client-1',
    lawyer_id: 'lawyer-2',
    status: 'closed',
    ai_analysis: {
      title: 'Contrato Empresarial',
      description: 'Revisão de contrato de prestação de serviços B2B',
      priority: 'medium',
      client_type: 'PJ'
    },
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    lawyer: {
      name: 'Dra. Ana Paula Santos',
      avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
      specialty: 'Direito Empresarial'
    }
  },
  {
    id: '003',
    client_id: 'client-1',
    status: 'pending_assignment',
    ai_analysis: {
      title: 'Reclamação Consumidor',
      description: 'Produto com defeito - Reembolso e danos morais',
      priority: 'low',
      client_type: 'PF'
    },
    created_at: '2024-01-19T10:00:00Z',
    updated_at: '2024-01-19T10:00:00Z'
  }
];

const HEADER_HEIGHT = 280; // Altura ajustada para incluir busca

export default function EnhancedMyCasesList() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Estados principais
  const [cases, setCases] = useState<CaseData[]>([]);
  const [caseStats, setCaseStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de busca e filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CaseFilters>({
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Configuração dos filtros
  const filterSections = [
    {
      id: 'status',
      title: 'Status',
      type: 'multiple' as const,
      options: [
        { id: 'pending_assignment', label: 'Aguardando Atribuição' },
        { id: 'assigned', label: 'Atribuído' },
        { id: 'in_progress', label: 'Em Andamento' },
        { id: 'closed', label: 'Finalizado' },
        { id: 'cancelled', label: 'Cancelado' }
      ]
    },
    {
      id: 'priority',
      title: 'Prioridade',
      type: 'multiple' as const,
      options: [
        { id: 'high', label: 'Alta' },
        { id: 'medium', label: 'Média' },
        { id: 'low', label: 'Baixa' }
      ]
    },
    {
      id: 'hasLawyer',
      title: 'Com Advogado Atribuído',
      type: 'toggle' as const
    },
    {
      id: 'sortBy',
      title: 'Ordenar Por',
      type: 'single' as const,
      options: [
        { id: 'updated_at', label: 'Última Atualização' },
        { id: 'created_at', label: 'Data de Criação' },
        { id: 'priority', label: 'Prioridade' },
        { id: 'title', label: 'Título' }
      ]
    }
  ];

  useEffect(() => {
    if (user?.id) {
      loadCases();
    }
  }, [user?.id]);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [casesData, statsData] = await Promise.all([
        getUserCases(user?.id || ''),
        getCaseStats(user?.id || '')
      ]);

      // Enriquecer casos com contagem de mensagens não lidas
      const enrichedCases = await Promise.all(
        casesData.map(async (caseItem) => {
          try {
            const unreadCount = await getUnreadMessagesCount(caseItem.id, user?.id || '');
            return {
              ...caseItem,
              unread_messages: unreadCount
            };
          } catch (error) {
            console.warn('Error getting unread count for case:', caseItem.id, error);
            return caseItem;
          }
        })
      );

      setCases(enrichedCases);
      setCaseStats(statsData);
    } catch (error) {
      console.error('Error loading cases:', error);
      setError('Não foi possível carregar os casos');
      // Fallback para dados mock em caso de erro
      setCases(mockCases);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCases();
    setRefreshing(false);
  };

  // Filtrar e ordenar casos
  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases;

    // Aplicar busca por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(case_ => 
        case_.ai_analysis?.title?.toLowerCase().includes(query) ||
        case_.ai_analysis?.description?.toLowerCase().includes(query) ||
        case_.lawyer?.name?.toLowerCase().includes(query) ||
        case_.lawyer?.specialty?.toLowerCase().includes(query)
      );
    }

    // Aplicar filtros
    if (filters.status?.length) {
      filtered = filtered.filter(case_ => filters.status!.includes(case_.status));
    }

    if (filters.priority?.length) {
      filtered = filtered.filter(case_ => 
        filters.priority!.includes(case_.ai_analysis?.priority || 'medium')
      );
    }

    if (filters.hasLawyer !== undefined) {
      filtered = filtered.filter(case_ => 
        filters.hasLawyer ? !!case_.lawyer_id : !case_.lawyer_id
      );
    }

    // Aplicar ordenação
    const sortBy = filters.sortBy || 'updated_at';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.ai_analysis?.title || '';
          bValue = b.ai_analysis?.title || '';
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.ai_analysis?.priority as keyof typeof priorityOrder] || 2;
          bValue = priorityOrder[b.ai_analysis?.priority as keyof typeof priorityOrder] || 2;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default: // updated_at
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [cases, searchQuery, filters]);

  // Estatísticas para o header
  const headerStats = useMemo(() => {
    if (caseStats) {
      return [
        { key: 'triagem', label: 'Em Triagem', count: caseStats.pending_assignment },
        { key: 'atribuido', label: 'Atribuído', count: caseStats.assigned },
        { key: 'andamento', label: 'Em Andamento', count: caseStats.in_progress },
        { key: 'finalizado', label: 'Finalizado', count: caseStats.closed },
      ];
    }
    return [
      { key: 'triagem', label: 'Em Triagem', count: cases.filter(c => c.status === 'pending_assignment').length },
      { key: 'atribuido', label: 'Atribuído', count: cases.filter(c => c.status === 'assigned').length },
      { key: 'andamento', label: 'Em Andamento', count: cases.filter(c => c.status === 'in_progress').length },
      { key: 'finalizado', label: 'Finalizado', count: cases.filter(c => c.status === 'closed').length },
    ];
  }, [cases, caseStats]);

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

  const handleCasePress = (caseId: string) => {
    navigation.navigate('CaseDetail', { caseId });
  };

  const handleViewSummary = (caseId: string) => {
    navigation.navigate('AISummary', { caseId });
  };

  const handleChat = (caseId: string) => {
    navigation.navigate('CaseChat', { caseId });
  };

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
    setSearchQuery('');
  };

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LoadingSpinner 
          size="large" 
          text="Carregando casos..." 
          fullScreen 
        />
      </View>
    );
  }

  if (error && cases.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ErrorState
          title="Erro ao carregar casos"
          description={error}
          type="server"
          onRetry={loadCases}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Animated.View style={[
        styles.header, 
        { 
          transform: [{ translateY: headerTranslateY }], 
          opacity: headerOpacity 
        }
      ]}>
        {/* Header com estatísticas */}
        <CaseHeader caseStats={headerStats} totalCases={cases.length} />

        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Buscar casos, advogados..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => setShowFilterModal(true)}
            showFilter
            variant="rounded"
          />
        </View>

        {/* Controles de ordenação */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>
            {filteredAndSortedCases.length} caso(s) encontrado(s)
          </Text>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
            {filters.sortOrder === 'asc' ? (
              <SortAsc size={16} color="#006CFF" />
            ) : (
              <SortDesc size={16} color="#006CFF" />
            )}
            <Text style={styles.sortButtonText}>
              {filters.sortBy === 'title' ? 'A-Z' : 
               filters.sortBy === 'priority' ? 'Prioridade' : 'Data'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Lista de casos */}
      <Animated.ScrollView 
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 24 }}
      >
        {filteredAndSortedCases.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={searchQuery || Object.keys(filters).length > 2 ? 
              "Nenhum caso encontrado" : 
              "Nenhum caso ainda"
            }
            description={searchQuery || Object.keys(filters).length > 2 ? 
              "Tente ajustar sua busca ou filtros." : 
              "Você ainda não possui casos. Inicie uma nova consulta jurídica!"
            }
            actionText={searchQuery || Object.keys(filters).length > 2 ? 
              "Limpar filtros" : 
              "Novo caso"
            }
            onAction={searchQuery || Object.keys(filters).length > 2 ? 
              handleClearFilters : 
              undefined
            }
          />
        ) : (
          filteredAndSortedCases.map((case_) => (
            <View key={case_.id} style={styles.caseCardContainer}>
              <CaseCard
                {...case_}
                title={case_.ai_analysis?.title || 'Caso sem título'}
                description={case_.ai_analysis?.description || 'Descrição não disponível'}
                status={case_.status as any} // Conversão temporária para compatibilidade
                priority={case_.ai_analysis?.priority || 'medium'}
                clientType={case_.ai_analysis?.client_type || 'PF'}
                createdAt={case_.created_at}
                nextStep="Próximo passo"
                hasAiSummary={!!case_.ai_analysis}
                summarySharedAt={case_.updated_at}
                unreadMessages={(case_ as any).unread_messages || 0}
                onPress={() => handleCasePress(case_.id)}
                onViewSummary={() => handleViewSummary(case_.id)}
                onChat={() => handleChat(case_.id)}
              />
            </View>
          ))
        )}
      </Animated.ScrollView>

      {/* Modal de filtros */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        sections={filterSections}
        title="Filtrar Casos"
      />

      <FabNewCase />
    </View>
  );
}

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
    backgroundColor: '#F8FAFC',
    paddingBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sortLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  sortButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#006CFF',
  },
  content: {
    flex: 1,
  },
  caseCardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
}); 