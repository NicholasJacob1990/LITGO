import React from 'react';
import { Stack } from 'expo-router';

export default function CasesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" redirect />
      <Stack.Screen name="MyCasesList" />
      <Stack.Screen name="CaseDetail" />
      <Stack.Screen name="CaseDocuments" />
      <Stack.Screen name="CaseChat" />
      <Stack.Screen name="AISummary" />
      <Stack.Screen name="DetailedAnalysis" />
      <Stack.Screen name="ScheduleConsult" />
      <Stack.Screen name="NewCase" />
    </Stack>
  );
} 