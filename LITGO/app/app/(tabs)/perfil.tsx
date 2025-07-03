import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type UserType = 'PF' | 'PJ';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  document: string; // CPF ou CNPJ
  address: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    shareLocation: boolean;
    allowMarketing: boolean;
  };
}

export default function PerfilScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    userType: 'PF',
    document: '123.456.789-00',
    address: 'São Paulo, SP',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    privacy: {
      shareLocation: false,
      allowMarketing: true,
    },
  });

  const handleSave = () => {
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => {
          Alert.alert('Logout', 'Você foi desconectado com sucesso.');
        }},
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão pseudonimizados conforme LGPD. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => {
          Alert.alert('Conta Excluída', 'Sua conta foi marcada para exclusão e será processada em até 5 anos conforme LGPD.');
        }},
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="person-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={20} 
            color={isEditing ? "#EF4444" : "#667eea"} 
          />
          <Text style={[styles.editButtonText, isEditing && styles.editButtonTextCancel]}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <LinearGradient 
          colors={['#667eea', '#764ba2']} 
          style={styles.avatarGradient}
        >
          <Text style={styles.avatarText}>
            {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Text>
        </LinearGradient>
        
        <View style={styles.profileInfo}>
          {isEditing ? (
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.name}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                  placeholder="Nome completo"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                  placeholder="E-mail"
                  keyboardType="email-address"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.phone}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                  placeholder="Telefone"
                  keyboardType="phone-pad"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.profilePhone}>{profile.phone}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Ionicons name="person-circle-outline" size={20} color="#667eea" />
          <Text style={styles.infoLabel}>Tipo</Text>
          <Text style={styles.infoValue}>
            {profile.userType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="card-outline" size={20} color="#667eea" />
          <Text style={styles.infoLabel}>Documento</Text>
          <Text style={styles.infoValue}>{profile.document}</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="location-outline" size={20} color="#667eea" />
          <Text style={styles.infoLabel}>Localização</Text>
          <Text style={styles.infoValue}>{profile.address}</Text>
        </View>
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="notifications-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Notificações</Text>
      </View>
      
      <View style={styles.switchCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="phone-portrait-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Text style={styles.switchDescription}>Receba alertas sobre seus casos</Text>
            </View>
          </View>
          <Switch
            value={profile.notifications.push}
            onValueChange={(value) => 
              setProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, push: value }
              }))
            }
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={profile.notifications.push ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="mail-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>E-mail</Text>
              <Text style={styles.switchDescription}>Relatórios e atualizações por e-mail</Text>
            </View>
          </View>
          <Switch
            value={profile.notifications.email}
            onValueChange={(value) => 
              setProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, email: value }
              }))
            }
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={profile.notifications.email ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="chatbubble-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>SMS</Text>
              <Text style={styles.switchDescription}>Notificações urgentes por SMS</Text>
            </View>
          </View>
          <Switch
            value={profile.notifications.sms}
            onValueChange={(value) => 
              setProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, sms: value }
              }))
            }
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={profile.notifications.sms ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="shield-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Privacidade</Text>
      </View>
      
      <View style={styles.switchCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="location-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Compartilhar Localização</Text>
              <Text style={styles.switchDescription}>Permitir acesso à localização para melhor atendimento</Text>
            </View>
          </View>
          <Switch
            value={profile.privacy.shareLocation}
            onValueChange={(value) => 
              setProfile(prev => ({ 
                ...prev, 
                privacy: { ...prev.privacy, shareLocation: value }
              }))
            }
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={profile.privacy.shareLocation ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="megaphone-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Marketing</Text>
              <Text style={styles.switchDescription}>Receber ofertas e novidades da plataforma</Text>
            </View>
          </View>
          <Switch
            value={profile.privacy.allowMarketing}
            onValueChange={(value) => 
              setProfile(prev => ({ 
                ...prev, 
                privacy: { ...prev.privacy, allowMarketing: value }
              }))
            }
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={profile.privacy.allowMarketing ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="help-circle-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Suporte</Text>
      </View>
      
      <View style={styles.supportCard}>
        <TouchableOpacity style={styles.supportItem} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={20} color="#667eea" />
          <Text style={styles.supportText}>Termos de Uso</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportItem} activeOpacity={0.7}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#667eea" />
          <Text style={styles.supportText}>Política de Privacidade</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportItem} activeOpacity={0.7}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#667eea" />
          <Text style={styles.supportText}>Fale Conosco</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="settings-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Ações</Text>
      </View>
      
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionItem} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={[styles.actionText, styles.actionTextDanger]}>Sair da Conta</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={[styles.actionText, styles.actionTextDanger]}>Excluir Conta</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.title}>Perfil</Text>
            <View style={styles.brandBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.brandBadgeText}>Oficial</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Gerencie suas informações e preferências</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {renderProfileSection()}
        {renderNotificationsSection()}
        {renderPrivacySection()}
        {renderSupportSection()}
        {renderActionsSection()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginRight: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 4,
  },
  editButtonTextCancel: {
    color: '#EF4444',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 20,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#64748B',
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  switchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  supportText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  actionTextDanger: {
    color: '#EF4444',
  },
});
