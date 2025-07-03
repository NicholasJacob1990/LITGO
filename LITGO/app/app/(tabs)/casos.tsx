import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type CasoStatus = 'aguardando' | 'em_analise' | 'em_andamento' | 'concluido' | 'cancelado';

interface Caso {
  id: string;
  titulo: string;
  area: string;
  status: CasoStatus;
  dataCriacao: string;
  ultimaAtualizacao: string;
  advogado?: string;
  urgencia: 'baixa' | 'media' | 'alta';
  valor?: number;
}

export default function CasosScreen() {
  const [casos, setCasos] = useState<Caso[]>([
    {
      id: '001',
      titulo: 'Contrato de Trabalho - Rescisão',
      area: 'Direito Trabalhista',
      status: 'em_andamento',
      dataCriacao: '2024-01-15',
      ultimaAtualizacao: '2024-01-20',
      advogado: 'Dr. Silva',
      urgencia: 'alta',
      valor: 1500.00
    },
    {
      id: '002',
      titulo: 'Divórcio Consensual',
      area: 'Direito de Família',
      status: 'aguardando',
      dataCriacao: '2024-01-18',
      ultimaAtualizacao: '2024-01-18',
      urgencia: 'media'
    },
    {
      id: '003',
      titulo: 'Cobrança Indevida - Cartão de Crédito',
      area: 'Direito do Consumidor',
      status: 'em_analise',
      dataCriacao: '2024-01-10',
      ultimaAtualizacao: '2024-01-19',
      advogado: 'Dra. Santos',
      urgencia: 'baixa',
      valor: 800.00
    },
    {
      id: '004',
      titulo: 'Contrato de Compra e Venda',
      area: 'Direito Civil',
      status: 'concluido',
      dataCriacao: '2023-12-20',
      ultimaAtualizacao: '2024-01-15',
      advogado: 'Dr. Oliveira',
      urgencia: 'media',
      valor: 2500.00
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState<CasoStatus | 'todos'>('todos');
  const [refreshing, setRefreshing] = useState(false);

  const statusConfig = {
    aguardando: { label: 'Aguardando', color: '#F59E0B', icon: 'time-outline' },
    em_analise: { label: 'Em Análise', color: '#667eea', icon: 'analytics-outline' },
    em_andamento: { label: 'Em Andamento', color: '#10B981', icon: 'play-outline' },
    concluido: { label: 'Concluído', color: '#059669', icon: 'checkmark-circle-outline' },
    cancelado: { label: 'Cancelado', color: '#EF4444', icon: 'close-circle-outline' }
  };

  const urgenciaConfig = {
    baixa: { label: 'Baixa', color: '#10B981', icon: 'time-outline' },
    media: { label: 'Média', color: '#F59E0B', icon: 'alert-outline' },
    alta: { label: 'Alta', color: '#EF4444', icon: 'warning-outline' }
  };

  const casosFiltrados = filtroStatus === 'todos' 
    ? casos 
    : casos.filter(caso => caso.status === filtroStatus);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Atualizado', 'Lista de casos atualizada!');
    }, 1000);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusColor = (status: CasoStatus) => {
    return statusConfig[status].color;
  };

  const getStatusIcon = (status: CasoStatus) => {
    return statusConfig[status].icon;
  };

  const getUrgenciaColor = (urgencia: 'baixa' | 'media' | 'alta') => {
    return urgenciaConfig[urgencia].color;
  };

  const getUrgenciaIcon = (urgencia: 'baixa' | 'media' | 'alta') => {
    return urgenciaConfig[urgencia].icon;
  };

  const renderHeader = () => (
    <LinearGradient 
      colors={['#667eea', '#764ba2']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Meus Casos</Text>
          <Text style={styles.headerSubtitle}>
            {casosFiltrados.length} caso{casosFiltrados.length !== 1 ? 's' : ''} encontrado{casosFiltrados.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.novoCasoButton} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.novoCasoText}>Novo</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderFiltros = () => (
    <View style={styles.filtrosContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosScroll}
      >
        <TouchableOpacity
          style={[
            styles.filtroChip,
            filtroStatus === 'todos' && styles.filtroChipSelected
          ]}
          onPress={() => setFiltroStatus('todos')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="apps-outline" 
            size={16} 
            color={filtroStatus === 'todos' ? '#FFFFFF' : '#64748B'} 
          />
          <Text style={[
            styles.filtroText,
            filtroStatus === 'todos' && styles.filtroTextSelected
          ]}>
            Todos
          </Text>
        </TouchableOpacity>

        {Object.entries(statusConfig).map(([status, config]) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filtroChip,
              filtroStatus === status && styles.filtroChipSelected
            ]}
            onPress={() => setFiltroStatus(status as CasoStatus)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={config.icon as any} 
              size={16} 
              color={filtroStatus === status ? '#FFFFFF' : config.color} 
            />
            <Text style={[
              styles.filtroText,
              filtroStatus === status && styles.filtroTextSelected
            ]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCasoCard = (caso: Caso) => (
    <TouchableOpacity 
      key={caso.id} 
      style={styles.casoCard}
      activeOpacity={0.7}
      onPress={() => Alert.alert('Caso', `Detalhes do caso: ${caso.titulo}`)}
    >
      <View style={styles.casoHeader}>
        <View style={styles.casoInfo}>
          <Text style={styles.casoTitulo}>{caso.titulo}</Text>
          <View style={styles.casoMeta}>
            <View style={styles.areaChip}>
              <Ionicons name="briefcase-outline" size={12} color="#667eea" />
              <Text style={styles.areaText}>{caso.area}</Text>
            </View>
            <View style={[
              styles.urgenciaChip,
              { backgroundColor: `${getUrgenciaColor(caso.urgencia)}20` }
            ]}>
              <Ionicons 
                name={getUrgenciaIcon(caso.urgencia) as any} 
                size={12} 
                color={getUrgenciaColor(caso.urgencia)} 
              />
              <Text style={[
                styles.urgenciaText,
                { color: getUrgenciaColor(caso.urgencia) }
              ]}>
                {urgenciaConfig[caso.urgencia].label}
              </Text>
            </View>
          </View>
        </View>
        <View style={[
          styles.statusChip,
          { backgroundColor: `${getStatusColor(caso.status)}20` }
        ]}>
          <Ionicons 
            name={getStatusIcon(caso.status) as any} 
            size={16} 
            color={getStatusColor(caso.status)} 
          />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(caso.status) }
          ]}>
            {statusConfig[caso.status].label}
          </Text>
        </View>
      </View>

      <View style={styles.casoDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            Criado em {formatarData(caso.dataCriacao)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            Atualizado em {formatarData(caso.ultimaAtualizacao)}
          </Text>
        </View>

        {caso.advogado && (
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              Advogado: {caso.advogado}
            </Text>
          </View>
        )}

        {caso.valor && (
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              Valor: {formatarValor(caso.valor)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.casoActions}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="chatbubbles-outline" size={16} color="#667eea" />
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={16} color="#667eea" />
          <Text style={styles.actionText}>Documentos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#64748B" />
          <Text style={styles.actionText}>Mais</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>Nenhum caso encontrado</Text>
      <Text style={styles.emptyText}>
        {filtroStatus === 'todos' 
          ? 'Você ainda não possui casos cadastrados.'
          : `Nenhum caso com status "${statusConfig[filtroStatus as CasoStatus]?.label}" encontrado.`
        }
      </Text>
      <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Criar Primeiro Caso</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEstatisticas = () => (
    <View style={styles.estatisticasContainer}>
      <Text style={styles.estatisticasTitle}>Resumo</Text>
      <View style={styles.estatisticasGrid}>
        <View style={styles.estatisticaCard}>
          <View style={styles.estatisticaIcon}>
            <Ionicons name="time-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.estatisticaValor}>
            {casos.filter(c => c.status === 'aguardando').length}
          </Text>
          <Text style={styles.estatisticaLabel}>Aguardando</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <View style={styles.estatisticaIcon}>
            <Ionicons name="analytics-outline" size={24} color="#667eea" />
          </View>
          <Text style={styles.estatisticaValor}>
            {casos.filter(c => c.status === 'em_analise').length}
          </Text>
          <Text style={styles.estatisticaLabel}>Em Análise</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <View style={styles.estatisticaIcon}>
            <Ionicons name="play-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.estatisticaValor}>
            {casos.filter(c => c.status === 'em_andamento').length}
          </Text>
          <Text style={styles.estatisticaLabel}>Em Andamento</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <View style={styles.estatisticaIcon}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#059669" />
          </View>
          <Text style={styles.estatisticaValor}>
            {casos.filter(c => c.status === 'concluido').length}
          </Text>
          <Text style={styles.estatisticaLabel}>Concluídos</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFiltros()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {casosFiltrados.length > 0 ? (
          <>
            {renderEstatisticas()}
            <View style={styles.casosList}>
              {casosFiltrados.map(renderCasoCard)}
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  novoCasoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  novoCasoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  filtrosContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtrosScroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  filtroChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filtroText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  filtroTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  estatisticasContainer: {
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  estatisticasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  estatisticasGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  estatisticaCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  estatisticaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  estatisticaValor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  casosList: {
    padding: 24,
    gap: 16,
  },
  casoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  casoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  casoInfo: {
    flex: 1,
    marginRight: 12,
  },
  casoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  casoMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    gap: 4,
  },
  areaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#667eea',
  },
  urgenciaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  urgenciaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  casoDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  casoActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
