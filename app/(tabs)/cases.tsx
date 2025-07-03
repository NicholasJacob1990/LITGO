import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyCasesList from './cases/MyCasesList';
import CaseDetail from './cases/CaseDetail';
import NewCase from '../NewCase';
import CaseDocuments from './cases/CaseDocuments';

const Stack = createStackNavigator();

export default function CasesScreen() {
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