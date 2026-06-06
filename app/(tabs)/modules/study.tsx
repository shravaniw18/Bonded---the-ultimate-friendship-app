import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressBar } from '@/components/ProgressBar'

// ── mock data (replace with Supabase later) ──
const myStats = { name: 'You', hours: 4.5, streak: 7 }
const friendStats = { name: 'Friend', hours: 3.2, streak: 5 }
const weeklyGoal = 20

export default function StudyScreen() {
  const totalHours = myStats.hours + friendStats.hours

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <Text style={styles.heading}>📚 Study Battles</Text>
      <Text style={styles.sub}>Compete, grow, win together</Text>

      {/* weekly goal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Goal</Text>
        <Text style={styles.cardSub}>{totalHours}h of {weeklyGoal}h together</Text>
        <ProgressBar
          current={totalHours}
          goal={weeklyGoal}
          color={colors.primary}
        />
      </View>

      {/* leaderboard */}
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.card}>
        <PlayerRow
          name={myStats.name}
          hours={myStats.hours}
          streak={myStats.streak}
          isLeading={myStats.hours >= friendStats.hours}
        />
        <View style={styles.divider} />
        <PlayerRow
          name={friendStats.name}
          hours={friendStats.hours}
          streak={friendStats.streak}
          isLeading={friendStats.hours > myStats.hours}
        />
      </View>

      {/* log button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Log Study Session</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

// ── player row ────────────────────────────────
type PlayerRowProps = {
  name: string
  hours: number
  streak: number
  isLeading: boolean
}

function PlayerRow({ name, hours, streak, isLeading }: PlayerRowProps) {
  return (
    <View style={styles.playerRow}>
      <View style={styles.playerLeft}>
        <Text style={styles.playerName}>{name}</Text>
        {isLeading && <Text style={styles.leadBadge}>👑 Leading</Text>}
      </View>
      <View style={styles.playerRight}>
        <StreakBadge count={streak} size="sm" />
        <Text style={styles.hours}>{hours}h</Text>
      </View>
    </View>
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
  },
  heading: {
    fontSize:   font['2xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  sub: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  sectionTitle: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray700,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing[4],
    gap:             spacing[3],
    ...shadow.sm,
  },
  cardTitle: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  cardSub: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  divider: {
    height:          1,
    backgroundColor: colors.gray200,
  },
  playerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  playerLeft: {
    gap: spacing[1],
  },
  playerName: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  leadBadge: {
    fontSize: font.xs,
    color:    colors.warning,
  },
  playerRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  hours: {
    fontSize:   font.lg,
    fontWeight: font.bold,
    color:      colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    padding:         spacing[4],
    alignItems:      'center',
    marginTop:       spacing[2],
  },
  buttonText: {
    color:      colors.white,
    fontSize:   font.md,
    fontWeight: font.bold,
  },
})