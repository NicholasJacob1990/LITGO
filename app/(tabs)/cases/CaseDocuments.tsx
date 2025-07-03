import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import TopBar from '@/components/layout/TopBar';
import DocumentsList from '@/components/organisms/DocumentsList';
import { mockDetailedData } from './MyCasesList';

export default function CaseDocuments() {
  const route = useRoute<any>();
  const { caseId } = route.params;
  
  const detailedData = mockDetailedData[caseId as keyof typeof mockDetailedData];
  const documents = detailedData?.documents || [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <TopBar 
        title="Documentos do Caso" 
        showBack 
        subtitle={detailedData?.preAnalysis.caseTitle}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {documents.length > 0 ? (
          <DocumentsList files={documents} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum Documento</Text>
            <Text style={styles.emptyStateDescription}>
              Não há documentos anexados a este caso ainda.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    flex: 1,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
}); 