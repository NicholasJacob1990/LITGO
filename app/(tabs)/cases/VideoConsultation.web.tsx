import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function VideoConsultation() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Videoconsulta</Text>
      </View>
      
      <View style={styles.content}>
        <AlertCircle size={64} color="#F59E0B" />
        <Text style={styles.title}>Videoconsulta não disponível na web</Text>
        <Text style={styles.description}>
          As videoconsultas estão disponíveis apenas na versão mobile do aplicativo. 
          {'\n\n'}
          Para participar da videoconsulta, por favor:
        </Text>
        <View style={styles.instructionsList}>
          <Text style={styles.instructionItem}>• Baixe o aplicativo mobile LITGO</Text>
          <Text style={styles.instructionItem}>• Ou acesse pelo navegador do seu celular</Text>
          <Text style={styles.instructionItem}>• Entre em contato com seu advogado para reagendar</Text>
        </View>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleGoBack}>
          <Text style={styles.contactButtonText}>Voltar para o Caso</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#E5E7EB',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 400,
  },
  instructionsList: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  instructionItem: {
    color: '#E5E7EB',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
  contactButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});