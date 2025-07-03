import { StyleSheet, TouchableOpacity, ScrollView, View, Text, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface TriagemQuestion {
  id: string;
  question: string;
  options: string[];
}

export default function TriagemScreen() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [questions, setQuestions] = useState<TriagemQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState({
    area: '',
    urgencia: '',
    resumo: ''
  });

  // Simula análise IA inicial
  useEffect(() => {
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        area: 'Direito Civil',
        urgencia: 'Média',
        resumo: 'Questão relacionada a contratos e responsabilidade civil.'
      });
      setQuestions([
        {
          id: '1',
          question: 'Há quanto tempo o problema ocorreu?',
          options: ['Menos de 30 dias', '1-6 meses', '6 meses - 1 ano', 'Mais de 1 ano']
        },
        {
          id: '2',
          question: 'Você possui documentos relacionados ao caso?',
          options: ['Sim, todos', 'Sim, alguns', 'Não tenho', 'Não sei quais preciso']
        },
        {
          id: '3',
          question: 'Já procurou orientação jurídica antes?',
          options: ['Nunca', 'Consulta informal', 'Advogado particular', 'Defensoria Pública']
        }
      ]);
    }, 3000);
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleFinishTriagem = () => {
    // Simula finalização da triagem e geração da síntese
    Alert.alert(
      'Triagem Concluída', 
      'Síntese jurídica gerada com sucesso! Você será direcionado para visualizar os resultados.',
      [{ text: 'OK', onPress: () => router.push('/sintese') }]
    );
  };

  if (isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingTitle}>Analisando seu caso...</ThemedText>
        <ThemedText style={styles.loadingText}>
          Nossa IA está processando as informações e classificando sua consulta.
        </ThemedText>
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingDots}>● ● ●</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Triagem Inteligente</ThemedText>
          <ThemedText style={styles.subtitle}>Etapa 2 de 3</ThemedText>
        </View>

        {/* Análise Inicial */}
        <ThemedView style={styles.analysisCard}>
          <ThemedText style={styles.cardTitle}>Análise Preliminar</ThemedText>
          <View style={styles.analysisItem}>
            <ThemedText style={styles.analysisLabel}>Área identificada:</ThemedText>
            <ThemedText style={styles.analysisValue}>{analysisResult.area}</ThemedText>
          </View>
          <View style={styles.analysisItem}>
            <ThemedText style={styles.analysisLabel}>Nível de urgência:</ThemedText>
            <ThemedText style={styles.analysisValue}>{analysisResult.urgencia}</ThemedText>
          </View>
          <View style={styles.analysisItem}>
            <ThemedText style={styles.analysisLabel}>Resumo:</ThemedText>
            <ThemedText style={styles.analysisValue}>{analysisResult.resumo}</ThemedText>
          </View>
        </ThemedView>

        {/* Perguntas Dinâmicas */}
        <ThemedView style={styles.questionsSection}>
          <ThemedText style={styles.sectionTitle}>
            Perguntas Complementares
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Para uma análise mais precisa, responda algumas perguntas adicionais:
          </ThemedText>

          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <ThemedText style={styles.questionText}>
                {index + 1}. {question.question}
              </ThemedText>
              <View style={styles.optionsContainer}>
                {question.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      answers[question.id] === option && styles.optionButtonSelected
                    ]}
                    onPress={() => handleAnswer(question.id, option)}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[question.id] === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ThemedView>

        {/* Botão de Finalização */}
        <TouchableOpacity 
          style={[
            styles.finishButton,
            Object.keys(answers).length < questions.length && styles.finishButtonDisabled
          ]}
          onPress={handleFinishTriagem}
          disabled={Object.keys(answers).length < questions.length}
        >
          <Text style={styles.finishButtonText}>
            Gerar Síntese Jurídica
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <ThemedView style={styles.disclaimer}>
          <ThemedText style={styles.disclaimerText}>
            Esta análise preliminar é gerada por IA e está sujeita à conferência humana por um advogado qualificado.
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
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingIndicator: {
    alignItems: 'center',
  },
  loadingDots: {
    fontSize: 24,
    color: Colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 4,
  },
  analysisCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  analysisValue: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 2,
  },
  questionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  questionText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  finishButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  finishButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
});
