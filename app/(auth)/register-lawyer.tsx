import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase, { saveCVAnalysis } from '../../lib/supabase';
import { Eye, EyeOff, UploadCloud, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import storageService from '../../lib/storage';
import locationService from '../../components/LocationService';
import { extractTextFromFile } from '../../lib/downloadUtils';
import { analyzeLawyerCV, CVAnalysisResult } from '../../lib/openai';

const TOTAL_STEPS = 4;

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <View style={styles.stepperContainer}>
      {[...Array(TOTAL_STEPS)].map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        return (
          <React.Fragment key={step}>
            <View style={[styles.step, isActive && styles.stepActive, isCompleted && styles.stepCompleted]}>
              <Text style={[styles.stepText, (isActive || isCompleted) && styles.stepTextActive]}>{step}</Text>
            </View>
            {step < TOTAL_STEPS && <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default function RegisterLawyer() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [oabDocument, setOabDocument] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [cvDocument, setCvDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysisResult | null>(null);
  const [isProcessingCV, setIsProcessingCV] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
    password: '',
    // Step 2
    oab: '',
    oabState: '',
    specialties: '',
    // Endereço para geocodificação
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    // Step 3
    oabDocumentUrl: '',
    proofOfAddressUrl: '',
    cvUrl: '',
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(prev => prev + 1);
    } else {
      setLoading(true);
      setError(null);
      
      const { email, password, fullName, cpf, phone, oab, specialties, cep, street, number, neighborhood, city, state } = formData;

      // Geocodificar o endereço
      const fullAddress = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${cep}`;
      const location = await locationService.geocodeAddress(fullAddress);

      if (!location) {
          setLoading(false);
          setError('Endereço inválido ou não encontrado.');
          Alert.alert('Erro no Endereço', 'Não foi possível validar seu endereço. Por favor, verifique os dados e tente novamente.');
          return;
      }

      // Primeiro, cria o usuário para obter o ID
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            cpf,
            phone,
            user_type: 'LAWYER',
            role: 'lawyer_pending_approval',
            lat: location.latitude,
            lng: location.longitude,
          }
        }
      });
      
      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        Alert.alert('Erro na Habilitação', signUpError.message);
        return;
      }
      
      if (!user) {
        setLoading(false);
        setError('Não foi possível criar o usuário.');
        Alert.alert('Erro na Habilitação', 'Ocorreu um erro inesperado e não foi possível criar seu usuário.');
        return;
      }

      // Segundo, faz upload dos documentos
      let oabUrl = '';
      let addressUrl = '';
      let cvUrl = '';
      try {
        if (oabDocument?.base64) {
            oabUrl = await storageService.uploadBase64Image(oabDocument.base64, 'lawyer-documents', user.id);
        }
        if (proofOfAddress?.base64) {
            addressUrl = await storageService.uploadBase64Image(proofOfAddress.base64, 'lawyer-documents', user.id);
        }
        if (cvDocument?.uri) {
            // Para documentos PDF/TXT, usar upload direto do URI
            cvUrl = await storageService.uploadFile(cvDocument.uri, 'lawyer-documents', user.id, cvDocument.name);
        }
      } catch (uploadError) {
          setLoading(false);
          const message = uploadError instanceof Error ? uploadError.message : 'Erro desconhecido no upload.';
          setError(`Erro no upload: ${message}`);
          Alert.alert('Erro no Upload', `Não foi possível enviar seus documentos. Por favor, tente novamente. Detalhes: ${message}`);
          // Opcional: deletar o usuário criado se o upload falhar
          await supabase.auth.admin.deleteUser(user.id); 
          return;
      }

      // Terceiro, atualiza o usuário com os metadados completos
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          oab,
          specialties,
          oab_document_url: oabUrl,
          proof_of_address_url: addressUrl,
          cv_url: cvUrl,
        }
      });

      if (updateError) {
        // ... (tratamento de erro, talvez tentar de novo ou avisar o suporte)
      }

      // Quarto, se há análise de CV, salvar no banco de dados
      if (cvAnalysis && cvUrl) {
        try {
          await saveCVAnalysis(user.id, cvUrl, cvAnalysis);
        } catch (cvError) {
          console.error('Erro ao salvar análise de CV:', cvError);
          // Não bloquear o cadastro por erro na análise de CV
        }
      }

      setLoading(false);
      Alert.alert(
        'Habilitação Enviada',
        'Seus dados foram enviados para análise. Você receberá um e-mail de confirmação para ativar sua conta. Após a aprovação, você poderá acessar a plataforma.'
      );
      router.replace('/(auth)');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const handlePickImage = async (setter: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerAsset | null>>) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Desculpe, precisamos de acesso à galeria para isso funcionar!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setter(result.assets[0]);
    }
  };

  const handlePickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('Arquivo muito grande', 'O arquivo deve ter no máximo 5MB.');
          return;
        }

        setCvDocument(file);
        
        // Processar CV automaticamente
        await processCV(file);
      }
    } catch (error) {
      console.error('Erro ao selecionar CV:', error);
      Alert.alert('Erro', 'Erro ao selecionar arquivo de CV.');
    }
  };

  const processCV = async (file: DocumentPicker.DocumentPickerAsset) => {
    setIsProcessingCV(true);
    setError(null);

    try {
      // Extrair texto do arquivo
      const extractedText = await extractTextFromFile(file.uri, file.name);
      
      if (!extractedText || extractedText.trim().length < 100) {
        throw new Error('Não foi possível extrair texto suficiente do CV. Verifique se o arquivo está legível.');
      }

      // Analisar CV com IA
      const analysis = await analyzeLawyerCV(extractedText);
      setCvAnalysis(analysis);

      // Pré-preencher formulário com dados extraídos
      if (analysis.personalInfo) {
        const updates: any = {};
        if (analysis.personalInfo.name && !formData.fullName) {
          updates.fullName = analysis.personalInfo.name;
        }
        if (analysis.personalInfo.email && !formData.email) {
          updates.email = analysis.personalInfo.email;
        }
        if (analysis.personalInfo.phone && !formData.phone) {
          updates.phone = analysis.personalInfo.phone;
        }
        if (analysis.oabNumber && !formData.oab) {
          updates.oab = analysis.oabNumber;
        }
        if (analysis.practiceAreas && analysis.practiceAreas.length > 0 && !formData.specialties) {
          updates.specialties = analysis.practiceAreas.join(', ');
        }

        // Atualizar formulário
        setFormData(prev => ({ ...prev, ...updates }));
      }

      Alert.alert(
        'CV Processado com Sucesso!',
        'Suas informações foram extraídas e alguns campos foram preenchidos automaticamente. Você pode revisar e editar antes de continuar.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Erro ao processar CV:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar CV';
      setError(errorMessage);
      Alert.alert('Erro no Processamento', errorMessage);
    } finally {
      setIsProcessingCV(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>1. Informações Pessoais</Text>
            <TextInput style={styles.input} placeholder="Nome Completo" value={formData.fullName} onChangeText={v => handleInputChange('fullName', v)} />
            <TextInput style={styles.input} placeholder="CPF" value={formData.cpf} onChangeText={v => handleInputChange('cpf', v)} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Telefone" value={formData.phone} onChangeText={v => handleInputChange('phone', v)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="E-mail" value={formData.email} onChangeText={v => handleInputChange('email', v)} keyboardType="email-address" />
            <View style={styles.passwordContainer}>
                <TextInput
                style={styles.passwordInput}
                placeholder="Senha"
                value={formData.password}
                onChangeText={(val) => handleInputChange('password', val)}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                {isPasswordVisible ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>2. Dados Profissionais e Endereço</Text>
            <TextInput style={styles.input} placeholder="Nº da OAB (com UF, ex: 12345/SP)" value={formData.oab} onChangeText={v => handleInputChange('oab', v)} />
            <TextInput style={styles.input} placeholder="Principais áreas de atuação (separadas por vírgula)" value={formData.specialties} onChangeText={v => handleInputChange('specialties', v)} />
            
            <Text style={styles.sectionTitle}>Endereço Profissional</Text>
            <TextInput style={styles.input} placeholder="CEP" value={formData.cep} onChangeText={v => handleInputChange('cep', v)} keyboardType="numeric" maxLength={8} />
            <TextInput style={styles.input} placeholder="Rua / Logradouro" value={formData.street} onChangeText={v => handleInputChange('street', v)} />
            <View style={styles.row}>
                <TextInput style={[styles.input, styles.flex1]} placeholder="Número" value={formData.number} onChangeText={v => handleInputChange('number', v)} keyboardType="numeric" />
                <TextInput style={[styles.input, styles.flex2]} placeholder="Complemento (opcional)" value={formData.complement} onChangeText={v => handleInputChange('complement', v)} />
            </View>
            <TextInput style={styles.input} placeholder="Bairro" value={formData.neighborhood} onChangeText={v => handleInputChange('neighborhood', v)} />
            <View style={styles.row}>
                <TextInput style={[styles.input, styles.flex2]} placeholder="Cidade" value={formData.city} onChangeText={v => handleInputChange('city', v)} />
                <TextInput style={[styles.input, styles.flex1]} placeholder="UF" value={formData.state} onChangeText={v => handleInputChange('state', v)} maxLength={2} />
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>3. Documentos</Text>
            
            {/* Upload de CV - Novo campo */}
            <TouchableOpacity 
              style={[styles.uploadButton, styles.cvUploadButton]} 
              onPress={handlePickCV}
              disabled={isProcessingCV}
            >
              <View style={styles.uploadButtonContent}>
                <UploadCloud size={24} color={cvDocument ? '#10B981' : '#7C3AED'} />
                <Text style={[styles.uploadButtonText, styles.cvUploadText]}>
                  {isProcessingCV ? 'Processando CV...' : 
                   cvDocument ? 'CV Enviado e Processado' : 'Enviar Currículo (PDF/TXT)'}
                </Text>
                {cvDocument && !isProcessingCV && <CheckCircle size={24} color="#10B981" />}
                {isProcessingCV && <ActivityIndicator size={24} color="#7C3AED" />}
              </View>
              {cvDocument && <Text style={styles.fileName}>{cvDocument.name}</Text>}
              {cvAnalysis && (
                <View style={styles.cvAnalysisPreview}>
                  <Text style={styles.cvAnalysisText}>
                    ✓ {cvAnalysis.totalExperience} anos de experiência detectados
                  </Text>
                  <Text style={styles.cvAnalysisText}>
                    ✓ {cvAnalysis.practiceAreas.length} áreas de atuação identificadas
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.cvDescription}>
              📋 Opcional: Envie seu currículo para preenchimento automático do perfil. 
              Nossa IA extrairá informações como experiência, especialidades e formação.
            </Text>

            <TouchableOpacity style={styles.uploadButton} onPress={() => handlePickImage(setOabDocument)}>
              <View style={styles.uploadButtonContent}>
                <UploadCloud size={24} color={oabDocument ? '#10B981' : '#1E40AF'} />
                <Text style={styles.uploadButtonText}>
                  {oabDocument ? 'OAB Enviada' : 'Enviar Cópia da OAB'}
                </Text>
                {oabDocument && <CheckCircle size={24} color="#10B981" />}
              </View>
              {oabDocument && <Text style={styles.fileName}>{oabDocument.fileName || 'documento.jpg'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={() => handlePickImage(setProofOfAddress)}>
              <View style={styles.uploadButtonContent}>
                <UploadCloud size={24} color={proofOfAddress ? '#10B981' : '#1E40AF'} />
                <Text style={styles.uploadButtonText}>
                  {proofOfAddress ? 'Comprovante Enviado' : 'Enviar Comprovante de Residência'}
                </Text>
                {proofOfAddress && <CheckCircle size={24} color="#10B981" />}
              </View>
              {proofOfAddress && <Text style={styles.fileName}>{proofOfAddress.fileName || 'comprovante.jpg'}</Text>}
            </TouchableOpacity>
          </View>
        );
      case 4:
         return (
          <View>
            <Text style={styles.stepTitle}>4. Termos e Contrato</Text>
            <Text style={styles.termsText}>Ao clicar em &ldquo;Finalizar&rdquo;, você declara que leu e concorda com os Termos de Parceria e a Política de Privacidade da LITGO.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <Text style={styles.backButton}>Voltar</Text>
            </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <StepIndicator currentStep={step} />
            <Text style={styles.title}>Habilitação de Advogado</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {renderStepContent()}
        </ScrollView>
        <View style={styles.footer}>
            <TouchableOpacity style={[styles.nextButton, loading && styles.nextButtonDisabled]} onPress={handleNext} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.nextButtonText}>{step === TOTAL_STEPS ? 'Finalizar e Enviar' : 'Próximo'}</Text>
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  backButton: { color: '#1E40AF', fontFamily: 'Inter-SemiBold', fontSize: 16 },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'flex-start' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  step: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
  stepActive: { borderColor: '#3B82F6' },
  stepCompleted: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  stepText: { color: '#9CA3AF', fontFamily: 'Inter-Bold' },
  stepTextActive: { color: '#FFFFFF' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB' },
  stepLineCompleted: { backgroundColor: '#3B82F6' },
  title: { fontSize: 28, fontFamily: 'Inter-Bold', color: '#1F2937', marginBottom: 24 },
  stepTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 16 },
  input: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 8, fontSize: 16, fontFamily: 'Inter-Regular', color: '#1F2937', borderWidth: 1, borderColor: '#D1D5DB', marginBottom: 16 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: '#1F2937',
  },
  eyeIcon: {
      padding: 12,
  },
  uploadButton: { backgroundColor: '#E0E7FF', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#C7D2FE', borderStyle: 'dashed' },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    marginLeft: 12,
    marginRight: 'auto',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151'
  },
  fileName: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  termsText: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', lineHeight: 20 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  nextButton: { backgroundColor: '#1E40AF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#9DB2BF' },
  nextButtonText: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  errorText: { color: '#DC2626', fontFamily: 'Inter-Regular', textAlign: 'center', marginBottom: 16, alignSelf: 'center' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  cvUploadButton: {
    borderColor: '#DDD6FE',
    backgroundColor: '#F3F4F6',
  },
  cvUploadText: {
    color: '#7C3AED',
    fontFamily: 'Inter-Bold',
  },
  cvAnalysisPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cvAnalysisText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    marginBottom: 4,
  },
  cvDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
    paddingHorizontal: 8,
  },
}); 