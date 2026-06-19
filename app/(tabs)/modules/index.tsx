import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

const modules = [
  {
    emoji: '📚',
    title: 'Study Battles',
    sub:   'Log hours, track streaks, and compete on weekly leaderboards',
    color: colors.primaryLight,
    route: '/(tabs)/modules/study',
  },
  {
    emoji: '🐾',
    title: 'Shared Pet',
    sub:   'Feed, play, and bathe your gecko together',
    color: colors.accentLight,
    route: '/(tabs)/modules/pet',
  },
  {
    emoji: '🥗',
    title: 'Diet Sync',
    sub:   'Log meals and hit your shared calorie goals',
    color: colors.successLight,
    route: '/(tabs)/modules/diet',
  },
  {
    emoji: '🚽',
    title: 'Poop League',
    sub:   'Rate, log, and compete on the leaderboard',
    color: colors.warningLight,
    route: '/(tabs)/modules/poop',
  },
  {
    emoji: '☕',
    title: 'Cafe Finder',
    sub:   'Find your next hangout spot nearby',
    color: colors.primaryLight,
    route: '/(tabs)/modules/cafe',
  },
]

export default function ModulesScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Modules</Text>
      <Text style={styles.sub}>Everything you do together</Text>

      {modules.map((mod) => (
        <TouchableOpacity
          key={mod.title}
          style={styles.card}
          onPress={() => router.push(mod.route as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: mod.color }]}>
            <Text style={styles.emoji}>{mod.emoji}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{mod.title}</Text>
            <Text style={styles.cardSub}>{mod.sub}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.gray50,
  },
  content: {
    padding:    spacing[5],
    paddingTop: spacing[12],
    gap:        spacing[4],
    paddingBottom: spacing[8],
  },
  heading: {
    fontSize:   font['3xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  sub: {
    fontSize:     font.base,
    color:        colors.gray500,
    marginBottom: spacing[2],
  },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.white,
    borderRadius:    radius.xl,
    padding:         spacing[5],
    gap:             spacing[4],
    minHeight:       110,
    ...shadow.md,
  },
  iconBox: {
    width:          64,
    height:         64,
    borderRadius:   radius.lg,
    alignItems:     'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
    gap:  spacing[1],
  },
  cardTitle: {
    fontSize:   font.lg,
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  cardSub: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  chevron: {
    fontSize: font['2xl'],
    color:    colors.gray300,
  },
})