// app/(tabs)/_layout.tsx
// ─────────────────────────────────────────────
// Bottom tab navigator
// Tabs: Moments, Modules, Stats
// ─────────────────────────────────────────────

import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { colors, font } from '@/lib/theme'

// ─── custom tab icon ──────────────────────────
type TabIconProps = {
  emoji: string
  label: string
  focused: boolean
}

const TabIcon = ({ emoji, label, focused }: TabIconProps) => (
  <View style={styles.iconWrap}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={[styles.label, focused && styles.labelActive]}>
      {label}
    </Text>
  </View>
)

// ─── layout ───────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,        // we render our own label inside TabIcon
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📸" label="Moments" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✦" label="Modules" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" label="Stats" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

// ─── styles ───────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  colors.surface,
    borderTopColor:   'rgba(255,255,255,0.08)',
    borderTopWidth:   0.5,
    height:           64,
    paddingBottom:    8,
  },
  iconWrap: {
    alignItems:  'center',
    justifyContent: 'center',
    paddingTop:  6,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize:   font.xs,
    color:      colors.textMuted,
    marginTop:  3,
    fontWeight: font.medium,
  },
  labelActive: {
    color: colors.primary,
  },
})