import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, User, Users, CreditCard, Gift } from 'lucide-react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const PRIMARY_COLOR = '#0D47A1';
const GREY_COLOR = '#64748B';

function AppTabs() {
  const { role } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: GREY_COLOR,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Meus Casos',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="advogados"
        options={{
          title: 'Advogados',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          href: role === 'lawyer' ? null : '/(tabs)/advogados',
        }}
      />
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
          href: role === 'client' ? '/(tabs)/financeiro' : null,
        }}
      />
      <Tabs.Screen
        name="ofertas"
        options={{
          title: 'Ofertas',
          tabBarIcon: ({ color, size }) => <Gift color={color} size={size} />,
          href: role === 'lawyer' ? '/(tabs)/ofertas' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />

      {/* Telas que não devem aparecer na barra de abas */}
      <Tabs.Screen name="recommendations" options={{ href: null }} />
      <Tabs.Screen name="contracts" options={{ href: null }} />
      <Tabs.Screen name="agenda-real" options={{ href: null }} />
      <Tabs.Screen name="agenda" options={{ href: null }} />
      <Tabs.Screen name="lawyer-details" options={{ href: null }} />
      <Tabs.Screen name="video-consultation" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  const { isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return <AppTabs />;
}