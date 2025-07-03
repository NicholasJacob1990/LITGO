import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Briefcase, MessageCircle, User, Users } from 'lucide-react-native';

const PRIMARY_COLOR = '#3B82F6';
const SECONDARY_COLOR = '#764ba2';
const GREY_COLOR = '#9CA3AF';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: GREY_COLOR,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopWidth: 1,
          borderTopColor: '#1F2937',
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Home size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Meus Casos',
          tabBarIcon: ({ color, focused }) => (
            <Briefcase size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle size={focused ? 26 : 24} color={color} />
          ),
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
       <Tabs.Screen
        name="advogados"
        options={{
          title: 'Advogados',
          tabBarIcon: ({ color, focused }) => (
            <Users size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lawyer-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="case-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="video-consultation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="legal-intake"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}