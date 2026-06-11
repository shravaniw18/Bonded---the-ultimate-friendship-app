// frontend/app/_layout.tsx
// Root layout for the Bonded application. Sets up SafeAreaProvider and Stack Navigation.

import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="pet/index" />
        <Stack.Screen name="pet/upgrade" />
      </Stack>
    </SafeAreaProvider>
  );
}
