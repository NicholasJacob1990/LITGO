import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, MessageCircle, User, Users, Calendar, LifeBuoy, CheckSquare } from 'lucide-react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const PRIMARY_COLOR = '#0F172A';
const SECONDARY_COLOR = '#1E293B';
const GREY_COLOR = '#64748B';

function AppTabs() {
  const { role } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: GREY_COLOR,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      
      {/* Aba Início - Para todos os usuários */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Home size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      {/* Aba Advogados - Apenas para clientes */}
      {role === 'client' && (
        <Tabs.Screen
          name="advogados"
          options={{
            title: 'Advogados',
            tabBarIcon: ({ color, focused }) => (
              <Users size={focused ? 26 : 24} color={color} />
            ),
          }}
        />
      )}

      {/* Aba Casos - Para todos os usuários */}
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Meus Casos',
          tabBarIcon: ({ color, focused }) => (
            <Briefcase size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      {/* Aba Agenda - Para todos os usuários */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <Calendar size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      {/* Aba Tarefas - Apenas para advogados */}
      {role === 'lawyer' && (
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tarefas',
            tabBarIcon: ({ color, focused }) => (
              <CheckSquare size={focused ? 26 : 24} color={color} />
            ),
          }}
        />
      )}

      {/* Aba Chat - Para todos os usuários */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      {/* Aba Suporte - Para todos os usuários */}
      <Tabs.Screen
        name="support"
        options={{
          title: 'Suporte',
          tabBarIcon: ({ color, focused }) => (
            <LifeBuoy size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      {/* Aba Perfil - Para todos os usuários */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 26 : 24} color={color} />
          ),
        }}
      />

      {/* Telas ocultas - não aparecem na navegação */}
      <Tabs.Screen name="lawyer-details" options={{ href: null }} />
      <Tabs.Screen name="video-consultation" options={{ href: null }} />
      <Tabs.Screen name="cases/CaseDetail" options={{ href: null }} />
      <Tabs.Screen name="cases/CaseDocuments" options={{ href: null }} />
      <Tabs.Screen name="cases/MyCasesList" options={{ href: null }} />
      <Tabs.Screen name="cases/ClientCasesScreen" options={{ href: null }} />
      <Tabs.Screen name="cases/LawyerCasesScreen" options={{ href: null }} />
      <Tabs.Screen name="support/[ticketId]" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
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