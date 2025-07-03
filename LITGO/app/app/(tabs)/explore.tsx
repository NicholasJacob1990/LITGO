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

type Categoria = 'todas' | 'civil' | 'penal' | 'trabalhista' | 'empresarial' | 'tributario' | 'familia' | 'consumidor' | 'digital';

interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  preco: number;
  duracao: string;
  popular: boolean;
  icone: string;
}

export default function ExploreScreen() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria>('todas');
  const [refreshing, setRefreshing] = useState(false);

  const categorias = [
    { id: 'todas', label: 'Todas', icon: 'apps-outline' },
    { id: 'civil', label: 'Civil', icon: 'home-outline' },
    { id: 'penal', label: 'Penal', icon: 'shield-outline' },
    { id: 'trabalhista', label: 'Trabalhista', icon: 'briefcase-outline' },
    { id: 'empresarial', label: 'Empresarial', icon: 'business-outline' },
    { id: 'tributario', label: 'Tributário', icon: 'calculator-outline' },
    { id: 'familia', label: 'Família', icon: 'people-outline' },
    { id: 'consumidor', label: 'Consumidor', icon: 'card-outline' },
    { id: 'digital', label: 'Digital', icon: 'laptop-outline' }
  ];

  const servicos: Servico[] = [
    {
      id: '1',
      titulo: 'Consulta Jurídica Online',
      descricao: 'Atendimento personalizado com advogado especializado via chat ou vídeo',
      categoria: 'todas',
      preco: 89.90,
      duracao: '30 min',
      popular: true,
      icone: 'chatbubbles-outline'
    },
    {
      id: '2',
      titulo: 'Análise de Contratos',
      descricao: 'Revisão e análise detalhada de contratos com relatório jurídico',
      categoria: 'civil',
      preco: 149.90,
      duracao: '2h',
      popular: false,
      icone: 'document-text-outline'
    },
    {
      id: '3',
      titulo: 'Defesa Trabalhista',
      descricao: 'Representação em processos trabalhistas e orientação sobre direitos',
      categoria: 'trabalhista',
      preco: 299.90,
      duracao: 'Pacote',
      popular: true,
      icone: 'briefcase-outline'
    },
    {
      id: '4',
      titulo: 'Consultoria Empresarial',
      descricao: 'Orientação jurídica para empresas e startups',
      categoria: 'empresarial',
      preco: 199.90,
      duracao: '1h',
      popular: false,
      icone: 'business-outline'
    },
    {
      id: '5',
      titulo: 'Planejamento Tributário',
      descricao: 'Otimização fiscal e planejamento tributário personalizado',
      categoria: 'tributario',
      preco: 399.90,
      duracao: '2h',
      popular: false,
      icone: 'calculator-outline'
    },
    {
      id: '6',
      titulo: 'Divórcio Consensual',
      descricao: 'Acompanhamento completo do processo de divórcio',
      categoria: 'familia',
      preco: 599.90,
      duracao: 'Pacote',
      popular: true,
      icone: 'people-outline'
    },
    {
      id: '7',
      titulo: 'Defesa do Consumidor',
      descricao: 'Proteção de direitos do consumidor e ações contra empresas',
      categoria: 'consumidor',
      preco: 129.90,
      duracao: '1h',
      popular: false,
      icone: 'card-outline'
    },
    {
      id: '8',
      titulo: 'Compliance Digital',
      descricao: 'Adequação à LGPD e proteção de dados digitais',
      categoria: 'digital',
      preco: 249.90,
      duracao: '1h',
      popular: false,
      icone: 'laptop-outline'
    }
  ];

  const servicosFiltrados = categoriaSelecionada === 'todas' 
    ? servicos 
    : servicos.filter(servico => servico.categoria === categoriaSelecionada);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Atualizado', 'Catálogo de serviços atualizado!');
    }, 1000);
  };

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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
          <Text style={styles.headerTitle}>Explore Serviços</Text>
          <Text style={styles.headerSubtitle}>
            Encontre a solução jurídica ideal para sua necessidade
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderCategorias = () => (
    <View style={styles.categoriasContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriasScroll}
      >
        {categorias.map((categoria) => (
          <TouchableOpacity
            key={categoria.id}
            style={[
              styles.categoriaChip,
              categoriaSelecionada === categoria.id && styles.categoriaChipSelected
            ]}
            onPress={() => setCategoriaSelecionada(categoria.id as Categoria)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={categoria.icon as any} 
              size={16} 
              color={categoriaSelecionada === categoria.id ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[
              styles.categoriaText,
              categoriaSelecionada === categoria.id && styles.categoriaTextSelected
            ]}>
              {categoria.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderServicoCard = (servico: Servico) => (
    <TouchableOpacity 
      key={servico.id} 
      style={styles.servicoCard}
      activeOpacity={0.7}
      onPress={() => Alert.alert('Serviço', `Detalhes do serviço: ${servico.titulo}`)}
    >
      {servico.popular && (
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}
      
      <View style={styles.servicoHeader}>
        <View style={styles.servicoIcon}>
          <Ionicons name={servico.icone as any} size={24} color="#667eea" />
        </View>
        <View style={styles.servicoInfo}>
          <Text style={styles.servicoTitulo}>{servico.titulo}</Text>
          <Text style={styles.servicoDescricao}>{servico.descricao}</Text>
        </View>
      </View>

      <View style={styles.servicoFooter}>
        <View style={styles.servicoMeta}>
          <View style={styles.duracaoChip}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.duracaoText}>{servico.duracao}</Text>
          </View>
          <Text style={styles.servicoPreco}>{formatarPreco(servico.preco)}</Text>
        </View>
        
        <TouchableOpacity style={styles.contratarButton} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          <Text style={styles.contratarText}>Contratar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDestaques = () => (
    <View style={styles.destaquesContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="star-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Serviços em Destaque</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.destaquesScroll}
      >
        {servicos.filter(s => s.popular).map((servico) => (
          <TouchableOpacity 
            key={servico.id} 
            style={styles.destaqueCard}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Destaque', `Serviço em destaque: ${servico.titulo}`)}
          >
            <LinearGradient 
              colors={['#667eea', '#764ba2']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.destaqueGradient}
            >
              <View style={styles.destaqueIcon}>
                <Ionicons name={servico.icone as any} size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.destaqueTitulo}>{servico.titulo}</Text>
              <Text style={styles.destaquePreco}>{formatarPreco(servico.preco)}</Text>
              <TouchableOpacity style={styles.destaqueButton} activeOpacity={0.8}>
                <Text style={styles.destaqueButtonText}>Saiba Mais</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEstatisticas = () => (
    <View style={styles.estatisticasContainer}>
      <Text style={styles.estatisticasTitle}>Nossos Números</Text>
      <View style={styles.estatisticasGrid}>
        <View style={styles.estatisticaCard}>
          <Ionicons name="people-outline" size={24} color="#667eea" />
          <Text style={styles.estatisticaValor}>10k+</Text>
          <Text style={styles.estatisticaLabel}>Clientes Atendidos</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
          <Text style={styles.estatisticaValor}>98%</Text>
          <Text style={styles.estatisticaLabel}>Satisfação</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <Ionicons name="time-outline" size={24} color="#F59E0B" />
          <Text style={styles.estatisticaValor}>24h</Text>
          <Text style={styles.estatisticaLabel}>Resposta Média</Text>
        </View>
        
        <View style={styles.estatisticaCard}>
          <Ionicons name="star-outline" size={24} color="#EF4444" />
          <Text style={styles.estatisticaValor}>4.9</Text>
          <Text style={styles.estatisticaLabel}>Avaliação</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
      <Text style={styles.emptyText}>
        Não encontramos serviços na categoria selecionada. Tente outra categoria.
      </Text>
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => setCategoriaSelecionada('todas')}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Ver Todos os Serviços</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderCategorias()}
      
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
        {renderDestaques()}
        {renderEstatisticas()}
        
        <View style={styles.servicosContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={24} color="#667eea" />
            <Text style={styles.sectionTitle}>
              {categoriaSelecionada === 'todas' ? 'Todos os Serviços' : `Serviços - ${categorias.find(c => c.id === categoriaSelecionada)?.label}`}
            </Text>
          </View>
          
          {servicosFiltrados.length > 0 ? (
            <View style={styles.servicosList}>
              {servicosFiltrados.map(renderServicoCard)}
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriasContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoriasScroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  categoriaChip: {
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
  categoriaChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  categoriaTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  destaquesContainer: {
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  destaquesScroll: {
    gap: 16,
  },
  destaqueCard: {
    width: 200,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  destaqueGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destaqueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  destaqueTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  destaquePreco: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  destaqueButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  destaqueButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  estatisticasContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  estatisticasTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  estatisticasGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  estatisticaCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  estatisticaValor: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  servicosContainer: {
    padding: 24,
  },
  servicosList: {
    gap: 16,
  },
  servicoCard: {
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
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  servicoHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  servicoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  servicoInfo: {
    flex: 1,
  },
  servicoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  servicoDescricao: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  servicoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  duracaoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  duracaoText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  servicoPreco: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
  },
  contratarButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contratarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
