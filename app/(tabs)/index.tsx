import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, ArrowRight, LogOut } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The router.replace will be handled by the root _layout.tsx
  };
  
  const displayName = user?.user_metadata?.full_name || user?.email;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.background}
      />
      <View style={styles.header}>
        <View>
            {displayName && <Text style={styles.welcomeText}>Olá, {displayName.split(' ')[0]}</Text>}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Plataforma Oficial</Text>
        </View>
        <Text style={styles.title}>
          Seu Problema Jurídico, Resolvido com Inteligência
        </Text>
        <Text style={styles.subtitle}>
          Use nossa IA para uma pré-análise gratuita e seja conectado ao advogado certo para o seu caso.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/NewCase')}
          activeOpacity={0.8}
        >
          <Bot size={24} color="#1F2937" />
          <Text style={styles.ctaButtonText}>Iniciar Consulta com IA</Text>
          <ArrowRight size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 25,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
});