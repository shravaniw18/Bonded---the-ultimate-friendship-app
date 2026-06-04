// app/(tabs)/stats.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, font } from '@/lib/theme'

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📊</Text>
      <Text style={styles.title}>Stats</Text>
      <Text style={styles.sub}>Friendship stats and history — coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji:     { fontSize: 40, marginBottom: 12 },
  title:     { fontSize: font.xl, fontWeight: font.bold, color: colors.text, marginBottom: 8 },
  sub:       { fontSize: font.sm, color: colors.textSecondary, textAlign: 'center' },
})