import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import supabase from '../../lib/supabase';
import { Eye, EyeOff } from 'lucide-react-native';
import LogoJacob from '@/components/branding/LogoJacob';

const WelcomeView = ({ onLoginPress }: { onLoginPress: () => void }) => {
  const router = useRouter();
  return (
    <>
      <View style={styles.header}>
        <LogoJacob size="large" />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/role-selection')}>
          <Text style={styles.primaryButtonText}>Criar Nova Conta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onLoginPress}>
          <Text style={styles.secondaryButtonText}>Já tenho uma conta</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const LoginView = ({ onBackPress }: { onBackPress: () => void }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Erro no Login', error.message);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  return (
     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Acesse sua Conta</Text>
        <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
        />
        <View style={styles.passwordContainer}>
            <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                {isPasswordVisible ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#1E40AF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBackPress}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
     </KeyboardAvoidingView>
  );
};

export default function AuthIndex() {
  const [view, setView] = useState<'welcome' | 'login'>('welcome');

  return (
    <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {view === 'welcome' ? (
          <WelcomeView onLoginPress={() => setView('login')} />
        ) : (
          <LoginView onBackPress={() => setView('welcome')} />
        )}

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Ao continuar, você concorda com nossos <Text style={styles.linkText}>Termos de Serviço</Text> e <Text style={styles.linkText}>Política de Privacidade</Text>.
          </Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter-Black',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    marginTop: 8,
  },
  footer: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  termsContainer: {
     paddingBottom: 20,
     position: 'absolute',
     bottom: 0,
     left: 24,
     right: 24,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginBottom: 16,
  },
   passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
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
}); 