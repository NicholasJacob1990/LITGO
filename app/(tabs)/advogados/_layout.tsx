import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const PRIMARY_COLOR = '#0D47A1';
const SECONDARY_COLOR = '#1E3A8A';

export default function LawyersLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: {
            backgroundColor: PRIMARY_COLOR,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: 'white',
            elevation: 0, // Remove a sombra no Android
            shadowOpacity: 0, // Remove a sombra no iOS
          },
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{ title: 'Busca Geral' }}
        />
        <MaterialTopTabs.Screen
          name="recomendacoes"
          options={{ title: 'Recomendações' }}
        />
      </MaterialTopTabs>
    </SafeAreaView>
  );
} 