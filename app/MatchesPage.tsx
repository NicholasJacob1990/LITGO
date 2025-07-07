import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

import LawyerMatchCard from '@/components/LawyerMatchCard';
import PresetSelector from '@/components/molecules/PresetSelector';
import { Match, getMatchesForCase, getPersistedMatches } from '@/lib/services/api';
import { LawyerSearchResult } from '@/lib/supabase';

type Preset = 'balanced' | 'fast' | 'expert' | 'economic';

const MatchesPage = () => {
  const router = useRouter();
  const { caseId, fromRecs } = useLocalSearchParams<{ caseId?: string, fromRecs?: string }>();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Preset>('balanced');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [area, setArea] = useState<string>('');
  const [subarea, setSubarea] = useState<string>('');

  const legalAreas = [
    'Direito de Família',
    'Direito Trabalhista',
    'Direito Tributário',
    'Direito Civil',
    'Direito Empresarial',
  ];

  const subareasMap: Record<string, string[]> = {
    'Direito de Família': ['Divórcio', 'Partilha de Bens', 'Pensão Alimentícia'],
    'Direito Trabalhista': ['Rescisão', 'Assédio Moral'],
    'Direito Tributário': ['Impostos Federais', 'Impostos Municipais'],
  };

  const isFromRecs = fromRecs === 'true';

  const fetchMatches = useCallback(async (preset: Preset, options: { exclude_ids?: string[] } = {}) => {
    if (!caseId) {
      setError('ID do caso não encontrado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response: any;
      if (isFromRecs) {
        response = await getPersistedMatches(caseId as string);
      } else {
        response = await getMatchesForCase(
          caseId as string,
          preset,
          5,
          {
            area: area || undefined,
            subarea: subarea || undefined,
            radius_km: radiusKm,
            exclude_ids: options.exclude_ids,
          }
        );
      }
      
      const arr = response?.matches ?? response?.lawyers ?? [];
      setMatches(arr);
    } catch (e) {
      setError('Falha ao buscar os advogados recomendados. Tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [caseId, isFromRecs, area, subarea, radiusKm]);

  useEffect(() => {
    fetchMatches(selectedPreset);
  }, [fetchMatches, selectedPreset, area, subarea, radiusKm]);

  const handleSelectLawyer = (lawyerId: string, matchData: Match) => {
    router.push({
      pathname: '/(tabs)/lawyer-details',
      params: { 
        lawyerId: lawyerId,
        matchData: JSON.stringify(matchData)
      },
    });
  };

  const handleRefresh = () => {
    if (matches.length === 0) return;
    const currentIds = matches.map(m => m.lawyer_id);
    fetchMatches(selectedPreset, { exclude_ids: currentIds });
  };

  const renderMatchCard = ({ item }: { item: Match }) => {
    const lawyerForCard: LawyerSearchResult = {
      id: item.lawyer_id,
      name: item.nome,
      avatar_url: item.avatar_url || '',
      is_available: item.is_available,
      primary_area: item.primary_area,
      rating: item.rating || 0,
      distance_km: item.distance_km || 0,
      oab_number: 'N/A',
      specialties: [],
      is_approved: true,
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
  
    return <LawyerMatchCard lawyer={lawyerForCard} onSelect={() => handleSelectLawyer(item.lawyer_id, item)} caseId={caseId as string} matchData={item} caseTitle="" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#1F2937" style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchMatches(selectedPreset)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={matches}
        keyExtractor={(item) => item.lawyer_id}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          !isLoading && matches.length > 0 ? (
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <RefreshCw size={18} color="#1F2937" />
              <Text style={styles.refreshButtonText}>Ver outras opções</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Nenhum advogado compatível encontrado.</Text>
          </View>
        }
      />
    );
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
      
      {!isFromRecs && (
        <View style={styles.selectorContainer}>
          <PresetSelector selectedPreset={selectedPreset} onSelectPreset={setSelectedPreset} />

          {/* Raio */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Raio de busca: {radiusKm} km</Text>
            <Slider
              style={{ width: '100%' }}
              minimumValue={20}
              maximumValue={200}
              step={10}
              value={radiusKm}
              onValueChange={setRadiusKm}
              minimumTrackTintColor="#1F2937"
              maximumTrackTintColor="#9CA3AF"
            />
          </View>

          {/* Área */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Área do Direito</Text>
            <Picker
              selectedValue={area}
              onValueChange={(v: string) => {
                setArea(v);
                setSubarea('');
              }}>
              <Picker.Item label="(Escolha...)" value="" />
              {legalAreas.map((a) => (
                <Picker.Item key={a} label={a} value={a} />
              ))}
            </Picker>
          </View>

          {/* Subárea */}
          {area !== '' && (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Subárea</Text>
              <Picker
                selectedValue={subarea}
                onValueChange={(val: string) => setSubarea(val)}>
                <Picker.Item label="(Todas)" value="" />
                {(subareasMap[area] || []).map((s) => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
          )}
        </View>
      )}
      
      {renderContent()}
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
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  selectorContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  listContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controlGroup: { marginTop: 16 },
  controlLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#374151' },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  }
});

export default MatchesPage; 