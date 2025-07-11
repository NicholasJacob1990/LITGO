import { useEffect } from 'react';
import { Stack , SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CalendarProvider } from '@/lib/contexts/CalendarContext';
import { TasksProvider } from '@/lib/contexts/TasksContext';
import { SupportProvider } from '@/lib/contexts/SupportContext';
import { QueryProvider } from '@/lib/contexts/QueryProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { testEnvironmentVariables } from '@/lib/env-test';
// import { usePushNotifications } from '@/hooks/usePushNotifications';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Teste de variáveis de ambiente na inicialização
if (__DEV__) {
  testEnvironmentVariables();
}

function AppSetup() {
  // Comentado temporariamente para evitar erro do NativeEventEmitter
  // usePushNotifications();
  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <CalendarProvider>
            <TasksProvider>
              <SupportProvider>
                <AppSetup />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                  <Stack.Screen name="lawyer-onboarding" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </SupportProvider>
            </TasksProvider>
          </CalendarProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}