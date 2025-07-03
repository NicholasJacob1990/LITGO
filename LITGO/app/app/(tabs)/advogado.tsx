import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Step = 'intro' | 'pre-cadastro' | 'dados-profissionais' | 'documentos' | 'questionario-etica' | 'contrato' | 'revisao';

export default function AdvogadoScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [formData, setFormData] = useState({
    // Pré-cadastro
    email: '',
    senha: '',
    confirmaSenha: '',
    aceitaTermos: false,
    
    // Dados profissionais
    nomeCompleto: '',
    numeroOAB: '',
    seccional: '',
    cpf: '',
    especialidades: [] as string[],
    
    // Questionário de ética
    temImpedimentos: false,
    temConflitos: false,
    ehPEP: false,
    detalhesEtica: '',
    
    // Status
    statusValidacaoOAB: 'pending'
  });

  const especialidadesDisponiveis = [
    'Direito Civil', 'Direito Penal', 'Direito Trabalhista', 
    'Direito Empresarial', 'Direito Tributário', 'Direito de Família',
    'Direito Imobiliário', 'Direito do Consumidor', 'Direito Digital'
  ];

  const steps = ['intro', 'pre-cadastro', 'dados-profissionais', 'documentos', 'questionario-etica', 'contrato', 'revisao'];
  const stepNames = ['Introdução', 'Pré-cadastro', 'Dados Profissionais', 'Documentos', 'Ética', 'Contrato', 'Revisão'];

  const handleNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as Step);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as Step);
    }
  };

  const validateOAB = async () => {
    Alert.alert('Validação OAB', 'Validando situação junto ao CNA...');
    setTimeout(() => {
      setFormData(prev => ({ ...prev, statusValidacaoOAB: 'valid' }));
      Alert.alert('Sucesso', 'OAB validada com sucesso! Situação regular confirmada.');
    }, 2000);
  };

  const toggleEspecialidade = (esp: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter(e => e !== esp)
        : [...prev.especialidades, esp]
    }));
  };

  const renderProgressBar = () => {
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" />
          <Text style={styles.progressText}>
            Etapa {currentIndex + 1} de {steps.length}: {stepNames[currentIndex]}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <LinearGradient 
        colors={['#3B82F6', '#8B5CF6']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.introGradient}
      >
        <View style={styles.brandContainer}>
          <Text style={styles.introTitle}>Torne-se Parceiro LITGO</Text>
          <View style={styles.brandBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.brandBadgeText}>Oficial</Text>
          </View>
        </View>
        <Text style={styles.introSubtitle}>
          Faça parte da primeira plataforma jurídica inteligente do Brasil
        </Text>
      </LinearGradient>
      
      <View style={styles.benefitsContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={24} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Por que se associar?</Text>
        </View>
        
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="rocket-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.benefitTitle}>Mais Clientes</Text>
            <Text style={styles.benefitText}>Acesso a novos clientes pré-qualificados pela IA</Text>
          </View>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="analytics-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.benefitTitle}>IA Assistente</Text>
            <Text style={styles.benefitText}>Triagem automática e sugestões de jurisprudência</Text>
          </View>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="card-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.benefitTitle}>Repasse Garantido</Text>
            <Text style={styles.benefitText}>98% dos pagamentos automáticos em 24h</Text>
          </View>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#EF4444" />
            </View>
            <Text style={styles.benefitTitle}>Compliance Total</Text>
            <Text style={styles.benefitText}>Conformidade OAB e LGPD garantidas</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} activeOpacity={0.8}>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Iniciar Cadastro</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreCadastroStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="person-add-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Pré-cadastro</Text>
      </View>
      <Text style={styles.stepDescription}>
        Crie sua conta para começar o processo de habilitação
      </Text>
      
      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail profissional"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#94A3B8"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={formData.senha}
            onChangeText={(text) => setFormData(prev => ({ ...prev, senha: text }))}
            secureTextEntry
            placeholderTextColor="#94A3B8"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            value={formData.confirmaSenha}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmaSenha: text }))}
            secureTextEntry
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>
      
      <View style={styles.switchContainer}>
        <Switch
          value={formData.aceitaTermos}
          onValueChange={(value) => setFormData(prev => ({ ...prev, aceitaTermos: value }))}
          trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
          thumbColor={formData.aceitaTermos ? '#FFFFFF' : '#FFFFFF'}
        />
        <Text style={styles.switchLabel}>
          Aceito os termos de adesão e declaro intenção de me associar
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, !formData.aceitaTermos && styles.disabledButton]} 
          onPress={handleNextStep}
          disabled={!formData.aceitaTermos}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDadosProfissionaisStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="briefcase-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Dados Profissionais</Text>
      </View>
      <Text style={styles.stepDescription}>
        Informe seus dados profissionais para validação OAB
      </Text>
      
      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={formData.nomeCompleto}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nomeCompleto: text }))}
            placeholderTextColor="#94A3B8"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="card" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Número OAB"
            value={formData.numeroOAB}
            onChangeText={(text) => setFormData(prev => ({ ...prev, numeroOAB: text }))}
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seccional"
            value={formData.seccional}
            onChangeText={(text) => setFormData(prev => ({ ...prev, seccional: text }))}
            placeholderTextColor="#94A3B8"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="card" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={formData.cpf}
            onChangeText={(text) => setFormData(prev => ({ ...prev, cpf: text }))}
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.especialidadesContainer}>
        <Text style={styles.especialidadesTitle}>Especialidades</Text>
        <View style={styles.especialidadesGrid}>
          {especialidadesDisponiveis.map((esp) => (
            <TouchableOpacity
              key={esp}
              style={[
                styles.especialidadeChip,
                formData.especialidades.includes(esp) && styles.especialidadeChipSelected
              ]}
              onPress={() => toggleEspecialidade(esp)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.especialidadeText,
                formData.especialidades.includes(esp) && styles.especialidadeTextSelected
              ]}>
                {esp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDocumentosStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Documentos</Text>
      </View>
      <Text style={styles.stepDescription}>
        Envie os documentos necessários para validação
      </Text>
      
      <View style={styles.documentosGrid}>
        <TouchableOpacity style={styles.documentoCard} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={32} color="#3B82F6" />
          <Text style={styles.documentoTitle}>Carteira OAB</Text>
          <Text style={styles.documentoSubtitle}>Frente e verso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.documentoCard} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={32} color="#3B82F6" />
          <Text style={styles.documentoTitle}>RG/CNH</Text>
          <Text style={styles.documentoSubtitle}>Documento de identidade</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.documentoCard} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={32} color="#3B82F6" />
          <Text style={styles.documentoTitle}>Comprovante Residência</Text>
          <Text style={styles.documentoSubtitle}>Últimos 3 meses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.documentoCard} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={32} color="#3B82F6" />
          <Text style={styles.documentoTitle}>Currículo</Text>
          <Text style={styles.documentoSubtitle}>PDF ou Word</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuestionarioEticaStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Questionário de Ética</Text>
      </View>
      <Text style={styles.stepDescription}>
        Responda as perguntas para garantir conformidade ética
      </Text>
      
      <View style={styles.eticaContainer}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="warning-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Possui impedimentos éticos?</Text>
              <Text style={styles.switchDescription}>Suspensões, cassações ou processos disciplinares</Text>
            </View>
          </View>
          <Switch
            value={formData.temImpedimentos}
            onValueChange={(value) => setFormData(prev => ({ ...prev, temImpedimentos: value }))}
            trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
            thumbColor={formData.temImpedimentos ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="alert-circle-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Possui conflitos de interesse?</Text>
              <Text style={styles.switchDescription}>Representação de partes opostas</Text>
            </View>
          </View>
          <Switch
            value={formData.temConflitos}
            onValueChange={(value) => setFormData(prev => ({ ...prev, temConflitos: value }))}
            trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
            thumbColor={formData.temConflitos ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Ionicons name="person-outline" size={20} color="#64748B" />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>É Pessoa Exposta Politicamente (PEP)?</Text>
              <Text style={styles.switchDescription}>Cargos públicos ou políticos</Text>
            </View>
          </View>
          <Switch
            value={formData.ehPEP}
            onValueChange={(value) => setFormData(prev => ({ ...prev, ehPEP: value }))}
            trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
            thumbColor={formData.ehPEP ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContratoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Contrato de Associação</Text>
      </View>
      <Text style={styles.stepDescription}>
        Leia e aceite o contrato de associação ao escritório
      </Text>
      
      <View style={styles.contratoCard}>
        <Ionicons name="document-text" size={48} color="#3B82F6" />
        <Text style={styles.contratoTitle}>Contrato de Associação</Text>
        <Text style={styles.contratoText}>
          Este contrato estabelece os termos de associação ao escritório Jacobs Advogados Associados, 
          incluindo direitos, obrigações e comissões conforme regulamentação OAB.
        </Text>
        <TouchableOpacity style={styles.contratoButton} activeOpacity={0.7}>
          <Ionicons name="eye-outline" size={20} color="#3B82F6" />
          <Text style={styles.contratoButtonText}>Ler Contrato Completo</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.switchContainer}>
        <Switch
          value={formData.aceitaTermos}
          onValueChange={(value) => setFormData(prev => ({ ...prev, aceitaTermos: value }))}
          trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
          thumbColor={formData.aceitaTermos ? '#FFFFFF' : '#FFFFFF'}
        />
        <Text style={styles.switchLabel}>
          Aceito os termos do contrato de associação
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, !formData.aceitaTermos && styles.disabledButton]} 
          onPress={handleNextStep}
          disabled={!formData.aceitaTermos}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRevisaoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Revisão Final</Text>
      </View>
      <Text style={styles.stepDescription}>
        Revise seus dados antes do envio final
      </Text>
      
      <View style={styles.revisaoCard}>
        <View style={styles.revisaoItem}>
          <Ionicons name="mail" size={20} color="#64748B" />
          <Text style={styles.revisaoLabel}>E-mail:</Text>
          <Text style={styles.revisaoValue}>{formData.email}</Text>
        </View>
        
        <View style={styles.revisaoItem}>
          <Ionicons name="person" size={20} color="#64748B" />
          <Text style={styles.revisaoLabel}>Nome:</Text>
          <Text style={styles.revisaoValue}>{formData.nomeCompleto}</Text>
        </View>
        
        <View style={styles.revisaoItem}>
          <Ionicons name="card" size={20} color="#64748B" />
          <Text style={styles.revisaoLabel}>OAB:</Text>
          <Text style={styles.revisaoValue}>{formData.numeroOAB}/{formData.seccional}</Text>
        </View>
        
        <View style={styles.revisaoItem}>
          <Ionicons name="briefcase" size={20} color="#64748B" />
          <Text style={styles.revisaoLabel}>Especialidades:</Text>
          <Text style={styles.revisaoValue}>{formData.especialidades.join(', ')}</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('Sucesso', 'Cadastro enviado com sucesso!')} activeOpacity={0.8}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Enviar Cadastro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntroStep();
      case 'pre-cadastro':
        return renderPreCadastroStep();
      case 'dados-profissionais':
        return renderDadosProfissionaisStep();
      case 'documentos':
        return renderDocumentosStep();
      case 'questionario-etica':
        return renderQuestionarioEticaStep();
      case 'contrato':
        return renderContratoStep();
      case 'revisao':
        return renderRevisaoStep();
      default:
        return renderIntroStep();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {currentStep !== 'intro' && renderProgressBar()}
      {renderCurrentStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  stepContainer: {
    flex: 1,
  },
  introGradient: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  introTitle: {
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
  introSubtitle: {
    fontSize: 18,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  benefitsContainer: {
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
  benefitsGrid: {
    gap: 16,
  },
  benefitCard: {
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
  benefitText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
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
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  inputGroup: {
    padding: 24,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  especialidadesContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  especialidadesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  especialidadesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  especialidadeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  especialidadeChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  especialidadeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  especialidadeTextSelected: {
    color: '#FFFFFF',
  },
  documentosGrid: {
    padding: 24,
    gap: 16,
  },
  documentoCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  documentoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
  },
  documentoSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  eticaContainer: {
    padding: 24,
    gap: 16,
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
  contratoCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contratoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
  },
  contratoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contratoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F0F4FF',
  },
  contratoButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  revisaoCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginHorizontal: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  revisaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  revisaoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 12,
    marginRight: 8,
  },
  revisaoValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
});
