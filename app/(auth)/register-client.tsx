import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import supabase from '../../lib/supabase'; // Import Supabase client

type UserType = 'PF' | 'PJ';

export default function RegisterClient() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('PF');
  const [formData, setFormData] = useState({
    // PF
    fullName: '',
    cpf: '',
    // PJ
    companyName: '',
    cnpj: '',
    // Common
    email: '',
    phone: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    const { email, password, fullName, cpf, companyName, cnpj, phone } = formData;

    if (!email || !password) {
        setError("E-mail e senha são obrigatórios.");
        setLoading(false);
        return;
    }

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userType === 'PF' ? fullName : companyName,
          cpf: userType === 'PF' ? cpf : undefined,
          cnpj: userType === 'PJ' ? cnpj : undefined,
          phone: phone,
          user_type: userType, // PF or PJ
          role: 'client' // Custom claim
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      Alert.alert('Erro no Cadastro', signUpError.message);
    } else if (user) {
      Alert.alert(
        'Cadastro Quase Completo', 
        'Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada para ativar sua conta.'
      );
      router.replace('/(auth)'); // Go back to login/welcome screen
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Crie sua Conta de Cliente</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo para começar.</Text>

          {/* Seletor PF/PJ */}
          <View style={styles.selectorContainer}>
            <TouchableOpacity 
              style={[styles.selectorButton, userType === 'PF' && styles.selectorActive]} 
              onPress={() => setUserType('PF')}>
              <Text style={[styles.selectorText, userType === 'PF' && styles.selectorTextActive]}>Pessoa Física</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.selectorButton, userType === 'PJ' && styles.selectorActive]} 
              onPress={() => setUserType('PJ')}>
              <Text style={[styles.selectorText, userType === 'PJ' && styles.selectorTextActive]}>Pessoa Jurídica</Text>
            </TouchableOpacity>
          </View>

          {/* Formulário Condicional */}
          {userType === 'PF' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                value={formData.fullName}
                onChangeText={(val) => handleInputChange('fullName', val)}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.input}
                placeholder="CPF"
                value={formData.cpf}
                onChangeText={(val) => handleInputChange('cpf', val)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Razão Social"
                value={formData.companyName}
                onChangeText={(val) => handleInputChange('companyName', val)}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.input}
                placeholder="CNPJ"
                value={formData.cnpj}
                onChangeText={(val) => handleInputChange('cnpj', val)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          {/* Campos Comuns */}
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={formData.email}
            onChangeText={(val) => handleInputChange('email', val)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={formData.phone}
            onChangeText={(val) => handleInputChange('phone', val)}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />
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

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={[styles.registerButton, loading && styles.registerButtonDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.registerButtonText}>{loading ? 'Criando Conta...' : 'Criar Conta'}</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    selectorContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        padding: 4,
        marginBottom: 24,
    },
    selectorButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
    },
    selectorActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    selectorText: {
        textAlign: 'center',
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#4B5563',
    },
    selectorTextActive: {
        color: '#1E40AF',
    },
    input: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginBottom: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginBottom: 24,
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
    registerButton: {
        backgroundColor: '#1E40AF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    registerButtonDisabled: {
        backgroundColor: '#9DB2BF',
    },
    registerButtonText: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: '#FFFFFF',
    },
    errorText: {
        color: '#DC2626',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginBottom: 16,
    }
}); 