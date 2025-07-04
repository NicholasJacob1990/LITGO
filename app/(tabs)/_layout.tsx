import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, MessageCircle, User, Users, Calendar, LifeBuoy, CheckSquare, ListTodo, Settings } from 'lucide-react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />

      {/* Aba Advogados - Apenas para clientes */}
      {role === 'client' && (
        <Tabs.Screen
          name="advogados"
          options={{
            title: 'Advogados',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
          }}
        />
      )}

      {/* Aba Casos - Para todos os usuários */}
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Casos',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="briefcase" color={color} />,
        }}
      />

      {/* Aba Contratos - Apenas para Advogados */}
      {role === 'lawyer' && (
        <Tabs.Screen
          name="contracts"
          options={{
            title: 'Contratos',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="file-text" color={color} />,
          }}
        />
      )}

      {/* Aba Agenda - Para todos os usuários */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar" color={color} />,
        }}
      />

      {/* Aba Chat - Para todos os usuários */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
        }}
      />

      {/* Aba Perfil - Para todos os usuários */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
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