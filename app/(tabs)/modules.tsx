import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

const modules = [
  {
    emoji:    '📚',
    title:    'Study Battles',
    sub:      'Log hours, track streaks',
    color:    colors.primaryLight,
    route:    '/(tabs)/modules/study',
  },
  {
    emoji:    '🐾',
    title:    'Shared Pet',
    sub:      'Keep your pet alive together',
    color:    colors.accentLight,
    route:    '/(tabs)/modules/pet',
  },
  {
    emoji:    '🥗',
    title:    'Diet Sync',
    sub:      'Log meals, hit shared goals',
    color:    colors.successLight,
    route:    '/(tabs)/modules/diet',
  },
  {
    emoji:    '🚽',
    title:    'Poop League',
    sub:      'Rate and compete',
    color:    '#F5EDE4',
    route:    '/(tabs)/modules/poop',
  },
  {
    emoji:    '☕',
    title:    'Cafe Finder',
    sub:      'Find your next hangout spot',
    color:    colors.warningLight,
    route:    '/(tabs)/modules/cafe',
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

      <View style={styles.grid}>
        {modules.map((mod) => (
          <TouchableOpacity
            key={mod.title}
            style={styles.card}
            onPress={() => router.push(mod.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: mod.color }]}>
              <Text style={styles.emoji}>{mod.emoji}</Text>
            </View>
            <Text style={styles.cardTitle}>{mod.title}</Text>
            <Text style={styles.cardSub}>{mod.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  },
  heading: {
    fontSize:     font['3xl'],
    fontWeight:   font.bold,
    color:        colors.gray900,
    marginBottom: spacing[1],
  },
  sub: {
    fontSize:     font.base,
    color:        colors.gray500,
    marginBottom: spacing[6],
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[4],
  },
  card: {
    width:           '47%',
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing[4],
    ...shadow.sm,
  },
  iconBox: {
    width:          52,
    height:         52,
    borderRadius:   radius.md,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   spacing[3],
  },
  emoji: {
    fontSize: font.xl,
  },
  cardTitle: {
    fontSize:     font.md,
    fontWeight:   font.semibold,
    color:        colors.gray900,
    marginBottom: spacing[1],
  },
  cardSub: {
    fontSize: font.xs,
    color:    colors.gray500,
  },
})