import React from 'react';
import { View, StyleSheet, SafeAreaView, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import LawyerMatchCard from '@/components/LawyerMatchCard';
import { Match } from '@/lib/services/api';
import { LawyerSearchResult } from '@/lib/supabase';

const MatchesPage = () => {
  const router = useRouter();
  const { matches: matchesString, caseId } = useLocalSearchParams<{ matches?: string, caseId?: string }>();
  
  const matches: Match[] = matchesString ? JSON.parse(matchesString) : [];

  const handleSelectLawyer = (lawyerId: string) => {
    // TODO: Navegar para a tela de detalhes do advogado, que já deve existir.
    // Usando uma rota de exemplo.
    router.push(`/lawyer-details?id=${lawyerId}`);
  };

  const renderMatchCard = ({ item }: { item: Match }) => {
    // Adapta o objeto 'Match' da nossa API para o que o 'LawyerMatchCard' espera.
    const lawyerForCard: LawyerSearchResult = {
      id: item.lawyer_id,
      name: item.nome,
      avatar_url: item.avatar_url || '',
      is_available: item.is_available,
      primary_area: item.primary_area,
      rating: item.rating || 0,
      distance_km: item.distance_km || 0,
      // Preenchendo campos obrigatórios de LawyerSearchResult com valores padrão
      oab_number: 'N/A',
      review_count: 0,
      experience: 0,
      lat: 0,
      lng: 0,
      response_time: 'N/A',
      success_rate: 0,
      hourly_rate: 0,
      consultation_fee: 0,
      next_availability: 'N/A',
      languages: [],
      consultation_types: [],
    };

    return <LawyerMatchCard lawyer={lawyerForCard} onSelect={() => handleSelectLawyer(item.lawyer_id)} caseId={caseId} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Advogados Recomendados</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item.lawyer_id}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum advogado compatível encontrado.</Text>
            <Text style={styles.emptySubText}>Tente refazer a triagem ou contate o suporte.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  }
});

export default MatchesPage; 