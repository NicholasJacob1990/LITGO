import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService, AvailabilitySettings } from '../../../lib/services/availability';

const AvailabilitySettingsScreen = () => {
  const queryClient = useQueryClient();

  const { data: availability, isLoading, isError } = useQuery({
    queryKey: ['availabilitySettings'],
    queryFn: availabilityService.getSettings,
  });

  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (availability) {
      setIsEnabled(availability.availability_status === 'available');
    }
  }, [availability]);

  const mutation = useMutation<void, Error, AvailabilitySettings>({
    mutationFn: availabilityService.updateSettings,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Sua disponibilidade foi atualizada.');
      queryClient.invalidateQueries({ queryKey: ['availabilitySettings'] });
    },
    onError: (error) => {
      Alert.alert('Erro', `Não foi possível atualizar: ${error.message}`);
    },
  });

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const handleSave = () => {
    const newStatus = isEnabled ? 'available' : 'busy';
    mutation.mutate({ availability_status: newStatus });
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }
  
  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Erro ao carregar as configurações.</Text>
        <Text style={styles.errorDetails}>Por favor, tente novamente mais tarde.</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão de Disponibilidade</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Disponível para novos casos</Text>
        <Switch
          trackColor={{ false: "#D1D5DB", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#1E40AF" : "#f4f3f4"}
          ios_backgroundColor="#E5E7EB"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (mutation.isPending || isLoading) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={mutation.isPending || isLoading}
      >
        <Text style={styles.buttonText}>
          {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#F8FAFC' 
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#374151',
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 4,
    fontSize: 14,
    color: '#4B5563',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 24, 
    color: '#111827' 
  },
  switchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: { 
    fontSize: 16, 
    color: '#374151',
    fontWeight: '500'
  },
  button: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: { 
    backgroundColor: '#9DB2BF' 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AvailabilitySettingsScreen; 