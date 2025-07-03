import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView className="p-6 bg-white">
        {/* Header */}
        <View className="items-center mb-8">
          <ThemedText className="text-4xl font-bold text-primary mb-2">
            LITGO
          </ThemedText>
          <ThemedText className="text-lg text-secondary text-center">
            Plataforma Jurídica Digital
          </ThemedText>
        </View>

        {/* Main Content */}
        <ThemedView className="bg-white">
          <ThemedText className="text-2xl font-bold text-primary mb-4">
            Consulta Jurídica Inicial
          </ThemedText>
          <ThemedText className="text-base text-text mb-6">
            Preencha o formulário abaixo para que nossa IA faça a triagem inicial do seu caso jurídico.
          </ThemedText>

          {/* Form */}
          <View className="space-y-4">
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor={Colors.secondary}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              keyboardType="email-address"
              placeholderTextColor={Colors.secondary}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva seu caso jurídico detalhadamente"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={Colors.secondary}
            />
            
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>
                Enviar para Análise por IA
              </Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Legal Disclaimer */}
        <ThemedView className="mt-8 p-4 bg-accent rounded-lg">
          <ThemedText className="text-xs text-text text-center leading-4">
            Esta plataforma é um canal de contato para o escritório JACOBS ADVOGADOS ASSOCIADOS. 
            A triagem inicial realizada por inteligência artificial não substitui a análise e o 
            conselho de um advogado qualificado.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 48,
    borderColor: Colors.secondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
