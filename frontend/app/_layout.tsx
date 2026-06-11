// frontend/app/_layout.tsx
// Root layout for the Bonded application. Sets up SafeAreaProvider, Stack Navigation, and authentication state listener redirects.

import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// @ts-ignore
import { supabase } from '../../backend/lib/supabase';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }).catch(() => {
      router.replace('/login');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' || session) {
        router.replace('/(tabs)');
      } else if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
