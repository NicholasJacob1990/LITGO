import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { useState } from 'react';
import { User, Settings, Bell, Shield, CreditCard, Star, FileText, LogOut, ChevronRight, Edit3 as EditIcon, Building2, Scale, BarChart2, CheckSquare } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/lib/contexts/AuthContext';

const ClientProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userType] = useState<'PF' | 'PJ'>('PF'); // This would come from user data

  const user = {
    name: userType === 'PF' ? 'Maria Silva Santos' : 'TechCorp Ltda.',
    email: userType === 'PF' ? 'maria.silva@email.com' : 'contato@techcorp.com.br',
    phone: '+55 (11) 99999-9999',
    avatar: userType === 'PF' 
      ? 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
      : 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    memberSince: '2024',
    totalCases: userType === 'PF' ? 5 : 12,
    rating: userType === 'PF' ? 4.8 : 4.9,
    // PJ specific fields
    cnpj: userType === 'PJ' ? '12.345.678/0001-90' : undefined,
    legalRepresentative: userType === 'PJ' ? 'João Silva' : undefined,
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Editar Perfil',
      subtitle: userType === 'PF' ? 'Atualize suas informações pessoais' : 'Atualize dados da empresa',
      icon: EditIcon,
      color: '#1E40AF',
    },
    {
      id: 'contracts',
      title: 'Meus Contratos',
      subtitle: 'Visualize e gerencie seus contratos',
      icon: CheckSquare,
      color: '#059669',
      href: '/(tabs)/contracts',
    },
    {
      id: 'payment-methods',
      title: 'Métodos de Pagamento',
      subtitle: 'Cartões e formas de pagamento',
      icon: CreditCard,
      color: '#059669',
    },
    {
      id: 'case-history',
      title: 'Histórico de Casos',
      subtitle: 'Todos os seus casos anteriores',
      icon: FileText,
      color: '#7C3AED',
    },
    {
      id: 'reviews',
      title: 'Minhas Avaliações',
      subtitle: 'Avaliações dos atendimentos',
      icon: Star,
      color: '#F59E0B',
    },
    {
      id: 'privacy',
      title: 'Privacidade e Segurança',
      subtitle: 'Configurações de dados e LGPD',
      icon: Shield,
      color: '#EF4444',
    },
    {
      id: 'settings',
      title: 'Configurações',
      subtitle: 'Preferências do aplicativo',
      icon: Settings,
      color: '#6B7280',
    },
  ];

  // Add PJ-specific menu items
  if (userType === 'PJ') {
    menuItems.splice(2, 0, {
      id: 'compliance',
      title: 'Compliance Empresarial',
      subtitle: 'LGPD, contratos e políticas',
      icon: Scale,
      color: '#7C3AED',
    });
  }

  const stats = [
    { label: 'Casos Ativos', value: userType === 'PF' ? '2' : '5' },
    { label: 'Casos Concluídos', value: userType === 'PF' ? '3' : '7' },
    { label: 'Avaliação Média', value: user.rating.toString() },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Profile Info */}
      <LinearGradient
        colors={userType === 'PF' ? ['#1E40AF', '#3B82F6'] : ['#059669', '#10B981']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <EditIcon size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.userTypeContainer}>
              {userType === 'PF' ? (
                <User size={16} color="#E0E7FF" />
              ) : (
                <Building2 size={16} color="#E0E7FF" />
              )}
              <Text style={styles.userType}>
                {userType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {userType === 'PJ' && (
              <>
                <Text style={styles.userCnpj}>CNPJ: {user.cnpj}</Text>
                <Text style={styles.legalRep}>Rep. Legal: {user.legalRepresentative}</Text>
              </>
            )}
            <Text style={styles.memberSince}>Membro desde {user.memberSince}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <FileText size={24} color="#059669" />
              </View>
              <Text style={styles.quickActionText}>Nova Consulta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Star size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionText}>Avaliar Advogado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
                <CreditCard size={24} color="#1E40AF" />
              </View>
              <Text style={styles.quickActionText}>Pagamentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Toggle */}
        <View style={styles.section}>
          <View style={styles.notificationToggle}>
            <View style={styles.notificationInfo}>
              <Bell size={24} color="#1E40AF" />
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>Notificações</Text>
                <Text style={styles.notificationSubtitle}>
                  Receber atualizações sobre seus casos
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          {menuItems.map((item) => {
            // Se for item com href, usar Link
            if (item.href) {
              return (
                <Link href={item.href as any} asChild key={item.id}>
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                      <item.icon size={20} color={item.color} />
                    </View>
                    
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                    
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </Link>
              );
            }
            
            // Se for o item de configurações, usar Link, caso contrário TouchableOpacity
            if (item.id === 'settings') {
              return (
                <Link href="/configuracoes" asChild key={item.id}>
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                      <item.icon size={20} color={item.color} />
                    </View>
                    
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                    
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </Link>
              );
            }
            
            return (
              <TouchableOpacity key={item.id} style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>LegalTech Pro v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 Todos os direitos reservados</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const LawyerProfileScreen = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const lawyerMenuItems = [
    {
      id: 'performance-dashboard',
      title: 'Meu Desempenho',
      subtitle: 'Visualize suas métricas e KPIs',
      icon: BarChart2,
      color: '#1E40AF',
      onPress: () => router.push('/(tabs)/profile/performance'),
    },
    {
      id: 'my-reviews',
      title: 'Minhas Avaliações',
      subtitle: 'Gerencie e responda às avaliações dos clientes',
      icon: Star,
      color: '#F59E0B',
      onPress: () => router.push('/(tabs)/profile/my-reviews'),
    },
    {
      id: 'platform-documents',
      title: 'Documentos da Plataforma',
      subtitle: 'Contratos, políticas e termos de uso',
      icon: FileText,
      color: '#059669',
      onPress: () => router.push('/(tabs)/profile/platform-documents'),
    },
    {
      id: 'availability-settings',
      title: 'Configurações de Disponibilidade',
      subtitle: 'Gerencie sua disponibilidade e limites de casos',
      icon: CheckSquare,
      color: '#10B981',
      onPress: () => router.push('/(tabs)/profile/availability-settings'),
    },
    {
      id: 'profile-settings',
      title: 'Configurações do Perfil',
      subtitle: 'Edite seu perfil público e dados de diversidade',
      icon: EditIcon,
      color: '#7C3AED',
      onPress: () => router.push('/(tabs)/profile/edit-lawyer'),
    },
    {
      id: 'account-settings',
      title: 'Configurações da Conta',
      subtitle: 'Preferências do aplicativo e segurança',
      icon: Settings,
      color: '#6B7280',
      onPress: () => router.push('/(tabs)/settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1F2937', '#4B5563']} style={styles.header}>
        <View style={styles.profileSection}>
          <Image source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Advogado(a)'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {lawyerMenuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <item.icon size={20} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
        
        {/* Botão de Logout para Advogado */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default function ProfileScreen() {
  const { user } = useAuth();
  
  // Usar user?.user_metadata?.user_type que é definido no momento do cadastro
  const userRole = user?.user_metadata?.user_type;

  if (!user) {
    // Tela de loading ou skeleton
    return <View style={styles.container} />;
  }
  
  // Renderiza a tela de perfil apropriada com base no papel do usuário
  return userRole === 'LAWYER' ? <LawyerProfileScreen /> : <ClientProfileScreen />;
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userType: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#E0E7FF',
    marginLeft: 4,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 2,
  },
  userCnpj: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 2,
  },
  legalRep: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 2,
  },
  memberSince: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#C7D2FE',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  appInfoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});