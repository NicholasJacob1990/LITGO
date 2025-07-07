import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, User, Users, CreditCard, Gift, Users2 } from 'lucide-react-native';
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
      {/* Aba Início - Visível para todos */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      
      {/* Aba Meus Casos - Visível para todos */}
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Meus Casos',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      
      {/* Aba Advogados - Apenas para clientes */}
      {role === 'client' && (
        <Tabs.Screen
          name="advogados"
          options={{
            title: 'Advogados',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
      )}
      
      {/* Aba Ofertas - Apenas para advogados */}
      {role === 'lawyer' && (
        <Tabs.Screen
          name="ofertas/index"
          options={{
            title: 'Ofertas',
            tabBarIcon: ({ color, size }) => <Gift color={color} size={size} />,
          }}
        />
      )}
      
      {/* Aba Financeiro - Apenas para clientes */}
      {role === 'client' && (
        <Tabs.Screen
          name="financeiro/index"
          options={{
            title: 'Financeiro',
            tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
          }}
        />
      )}
      
      {/* Aba Perfil - Visível para todos */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      
      {/* Aba Clientes - Apenas para advogados */}
      {role === 'lawyer' && (
        <Tabs.Screen
          name="clientes/index"
          options={{
            title: 'Clientes',
            tabBarIcon: ({ color, size }) => <Users2 color={color} size={size} />,
          }}
        />
      )}
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