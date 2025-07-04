import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
import ClientCasesScreen from './cases/ClientCasesScreen';
import LawyerCasesScreen from './cases/LawyerCasesScreen';

export default function CasesRouter() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return role === 'lawyer' ? <LawyerCasesScreen /> : <ClientCasesScreen />;
}