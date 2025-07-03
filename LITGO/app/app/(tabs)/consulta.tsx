import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type ConsultaTipo = 'chat' | 'video' | 'presencial';
type AreaDireito = 'civil' | 'penal' | 'trabalhista' | 'empresarial' | 'tributario' | 'familia' | 'consumidor' | 'digital';

interface ConsultaForm {
  titulo: string;
  descricao: string;
  area: AreaDireito;
  urgencia: 'baixa' | 'media' | 'alta';
  tipo: ConsultaTipo;
  documentos: boolean;
  localizacao: boolean;
  aceitaTermos: boolean;
}

export default function ConsultaScreen() {
  const [formData, setFormData] = useState<ConsultaForm>({
    titulo: '',
    descricao: '',
    area: 'civil',
    urgencia: 'media',
    tipo: 'chat',
    documentos: false,
    localizacao: false,
    aceitaTermos: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const areasDireito = [
    { id: 'civil', label: 'Direito Civil', icon: 'home-outline' },
    { id: 'penal', label: 'Direito Penal', icon: 'shield-outline' },
    { id: 'trabalhista', label: 'Direito Trabalhista', icon: 'briefcase-outline' },
    { id: 'empresarial', label: 'Direito Empresarial', icon: 'business-outline' },
    { id: 'tributario', label: 'Direito Tributário', icon: 'calculator-outline' },
    { id: 'familia', label: 'Direito de Família', icon: 'people-outline' },
    { id: 'consumidor', label: 'Direito do Consumidor', icon: 'card-outline' },
    { id: 'digital', label: 'Direito Digital', icon: 'laptop-outline' }
  ];

  const tiposConsulta = [
    { id: 'chat', label: 'Chat Online', icon: 'chatbubbles-outline', descricao: 'Conversa por texto com advogado' },
    { id: 'video', label: 'Vídeo Consulta', icon: 'videocam-outline', descricao: 'Atendimento por vídeo chamada' },
    { id: 'presencial', label: 'Presencial', icon: 'person-outline', descricao: 'Encontro no escritório' }
  ];

  const urgencias = [
    { id: 'baixa', label: 'Baixa', color: '#10B981', icon: 'time-outline' },
    { id: 'media', label: 'Média', color: '#F59E0B', icon: 'alert-outline' },
    { id: 'alta', label: 'Alta', color: '#EF4444', icon: 'warning-outline' }
  ];

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Consulta Enviada',
      'Sua consulta foi enviada com sucesso! Um advogado será designado em breve.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              titulo: '',
              descricao: '',
              area: 'civil',
              urgencia: 'media',
              tipo: 'chat',
              documentos: false,
              localizacao: false,
              aceitaTermos: false
            });
            setCurrentStep(1);
          }
        }
      ]
    );
  };

  const renderProgressBar = () => {
    const progress = (currentStep / totalSteps) * 100;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#667eea" />
          <Text style={styles.progressText}>
            Etapa {currentStep} de {totalSteps}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Descreva seu caso</Text>
      </View>
      <Text style={styles.stepDescription}>
        Forneça informações básicas sobre sua situação jurídica
      </Text>

      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Ionicons name="create-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Título do caso (ex: Rescisão de contrato)"
            value={formData.titulo}
            onChangeText={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.textAreaContainer}>
          <Ionicons name="document-text-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textArea}
            placeholder="Descreva detalhadamente sua situação jurídica..."
            value={formData.descricao}
            onChangeText={(text) => setFormData(prev => ({ ...prev, descricao: text }))}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.areaContainer}>
        <Text style={styles.areaTitle}>Área do Direito</Text>
        <View style={styles.areaGrid}>
          {areasDireito.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.areaChip,
                formData.area === area.id && styles.areaChipSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, area: area.id as AreaDireito }))}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={area.icon as any} 
                size={16} 
                color={formData.area === area.id ? '#FFFFFF' : '#667eea'} 
              />
              <Text style={[
                styles.areaText,
                formData.area === area.id && styles.areaTextSelected
              ]}>
                {area.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="settings-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Configurações da consulta</Text>
      </View>
      <Text style={styles.stepDescription}>
        Escolha o tipo de atendimento e nível de urgência
      </Text>

      <View style={styles.tipoContainer}>
        <Text style={styles.tipoTitle}>Tipo de Consulta</Text>
        <View style={styles.tipoGrid}>
          {tiposConsulta.map((tipo) => (
            <TouchableOpacity
              key={tipo.id}
              style={[
                styles.tipoCard,
                formData.tipo === tipo.id && styles.tipoCardSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, tipo: tipo.id as ConsultaTipo }))}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tipoIcon,
                formData.tipo === tipo.id && styles.tipoIconSelected
              ]}>
                <Ionicons 
                  name={tipo.icon as any} 
                  size={24} 
                  color={formData.tipo === tipo.id ? '#FFFFFF' : '#667eea'} 
                />
              </View>
              <Text style={[
                styles.tipoLabel,
                formData.tipo === tipo.id && styles.tipoLabelSelected
              ]}>
                {tipo.label}
              </Text>
              <Text style={[
                styles.tipoDescricao,
                formData.tipo === tipo.id && styles.tipoDescricaoSelected
              ]}>
                {tipo.descricao}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.urgenciaContainer}>
        <Text style={styles.urgenciaTitle}>Nível de Urgência</Text>
        <View style={styles.urgenciaGrid}>
          {urgencias.map((urgencia) => (
            <TouchableOpacity
              key={urgencia.id}
              style={[
                styles.urgenciaChip,
                formData.urgencia === urgencia.id && styles.urgenciaChipSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, urgencia: urgencia.id as 'baixa' | 'media' | 'alta' }))}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={urgencia.icon as any} 
                size={16} 
                color={formData.urgencia === urgencia.id ? '#FFFFFF' : urgencia.color} 
              />
              <Text style={[
                styles.urgenciaText,
                formData.urgencia === urgencia.id && styles.urgenciaTextSelected
              ]}>
                {urgencia.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#667eea" />
        <Text style={styles.sectionTitle}>Permissões e termos</Text>
      </View>
      <Text style={styles.stepDescription}>
        Configure permissões e aceite os termos para prosseguir
      </Text>

      <View style={styles.permissionsContainer}>
        <View style={styles.permissionItem}>
          <View style={styles.permissionInfo}>
            <Ionicons name="document-outline" size={20} color="#64748B" />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionLabel}>Compartilhar documentos</Text>
              <Text style={styles.permissionDescription}>
                Permite que o advogado acesse documentos relacionados ao caso
              </Text>
            </View>
          </View>
          <Switch
            value={formData.documentos}
            onValueChange={(value) => setFormData(prev => ({ ...prev, documentos: value }))}
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={formData.documentos ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.permissionItem}>
          <View style={styles.permissionInfo}>
            <Ionicons name="location-outline" size={20} color="#64748B" />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionLabel}>Compartilhar localização</Text>
              <Text style={styles.permissionDescription}>
                Ajuda a encontrar advogados próximos à sua região
              </Text>
            </View>
          </View>
          <Switch
            value={formData.localizacao}
            onValueChange={(value) => setFormData(prev => ({ ...prev, localizacao: value }))}
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={formData.localizacao ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={styles.termsContainer}>
        <View style={styles.switchContainer}>
          <Switch
            value={formData.aceitaTermos}
            onValueChange={(value) => setFormData(prev => ({ ...prev, aceitaTermos: value }))}
            trackColor={{ false: '#E2E8F0', true: '#667eea' }}
            thumbColor={formData.aceitaTermos ? '#FFFFFF' : '#FFFFFF'}
          />
          <Text style={styles.switchLabel}>
            Aceito os termos de uso e política de privacidade
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={24} color="#667eea" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            1. Sua consulta será analisada pela IA{'\n'}
            2. Um advogado especializado será designado{'\n'}
            3. Você receberá uma síntese preliminar gratuita{'\n'}
            4. Escolha o plano e inicie o atendimento
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.titulo.trim() !== '' && formData.descricao.trim() !== '';
      case 2:
        return true;
      case 3:
        return formData.aceitaTermos;
      default:
        return false;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Nova Consulta</Text>
            <Text style={styles.headerSubtitle}>
              Descreva sua situação jurídica para receber orientação especializada
            </Text>
          </View>
        </View>
      </LinearGradient>

      {renderProgressBar()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handlePrevStep}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#667eea" />
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              !canProceed() && styles.disabledButton
            ]} 
            onPress={handleNextStep}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === totalSteps ? 'Enviar Consulta' : 'Continuar'}
            </Text>
            <Ionicons 
              name={currentStep === totalSteps ? 'checkmark' : 'arrow-forward'} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  progressContainer: {
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    gap: 16,
    marginBottom: 24,
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
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textArea: {
    flex: 1,
    paddingBottom: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
  },
  areaContainer: {
    marginBottom: 24,
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  areaChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  areaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  areaTextSelected: {
    color: '#FFFFFF',
  },
  tipoContainer: {
    marginBottom: 24,
  },
  tipoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  tipoGrid: {
    gap: 12,
  },
  tipoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipoCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#F0F4FF',
  },
  tipoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipoIconSelected: {
    backgroundColor: '#667eea',
  },
  tipoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  tipoLabelSelected: {
    color: '#667eea',
  },
  tipoDescricao: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  tipoDescricaoSelected: {
    color: '#667eea',
  },
  urgenciaContainer: {
    marginBottom: 24,
  },
  urgenciaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  urgenciaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  urgenciaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  urgenciaChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  urgenciaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  urgenciaTextSelected: {
    color: '#FFFFFF',
  },
  permissionsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  termsContainer: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#F0F4FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#667eea',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
