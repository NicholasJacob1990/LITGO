import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyCasesList from './MyCasesList';
import CaseDetail from './CaseDetail';
import NewCase from '../../NewCase';
import CaseDocuments from './CaseDocuments';

const Stack = createStackNavigator();

export default function ClientCasesScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyCasesList" component={MyCasesList} />
      <Stack.Screen name="CaseDetail" component={CaseDetail} />
      <Stack.Screen name="CaseDocuments" component={CaseDocuments} />
      <Stack.Screen name="NewCase" component={NewCase} />
    </Stack.Navigator>
  );
} 