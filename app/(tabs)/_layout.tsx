import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, User, Users, CreditCard, Gift, Users2, Star } from 'lucide-react-native';
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      {[
        { name: 'index', title: 'Início', icon: Home },
        { name: 'cases', title: 'Meus Casos', icon: Briefcase },
        ...(role === 'client'
          ? [
              { name: 'recomendacoes', title: 'Recomendações', icon: Star },
              { name: 'advogados', title: 'Advogados', icon: Users },
              { name: 'financeiro/index', title: 'Financeiro', icon: CreditCard },
            ]
          : []),
        ...(role === 'lawyer'
          ? [
              { name: 'ofertas/index', title: 'Ofertas', icon: Gift },
            ]
          : []),
        { name: 'profile/index', title: 'Perfil', icon: User },
      ].map(({ name, title, icon: IconComponent }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <IconComponent color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabsLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return <AppTabs />;
}