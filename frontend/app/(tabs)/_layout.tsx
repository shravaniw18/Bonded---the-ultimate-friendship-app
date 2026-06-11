// frontend/app/(tabs)/_layout.tsx
// Bottom tab bar navigation configuring active/inactive colors, tab bar height, and custom emoji icons.

import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { theme } from '../../lib/theme';

export default function TabLayout() {
  const renderTabIcon = (emoji: string) => () => (
    <View style={styles.iconContainer}>
      <Text style={styles.iconText}>{emoji}</Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          height: 68, // slightly taller to comfortably fit labels + emojis
          borderTopWidth: 2,
          borderTopColor: theme.colors.surface,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSizes.xs,
          fontWeight: theme.fontWeights.black,
          textTransform: 'lowercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          tabBarIcon: renderTabIcon('🏠'),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'study',
          tabBarIcon: renderTabIcon('📚'),
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          title: 'pet',
          tabBarIcon: renderTabIcon('🦎'),
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: 'diet',
          tabBarIcon: renderTabIcon('🥗'),
        }}
      />
      <Tabs.Screen
        name="poop"
        options={{
          title: 'poop',
          tabBarIcon: renderTabIcon('💩'),
        }}
      />
      <Tabs.Screen
        name="cafe"
        options={{
          title: 'cafe',
          tabBarIcon: renderTabIcon('☕'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
  },
  iconText: {
    fontSize: 20,
  },
});
