import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ProgressBar } from '@/components/ProgressBar'

// ── mock data ─────────────────────────────────
const pet = {
  name:        'Gecko',
  emoji:       '🦎',
  health:      72,
  happiness:   85,
  hunger:      40,
  lastFed:     '2 hours ago',
  lastPlayed:  '5 hours ago',
}

const owners = [
  { name: 'You',    checkedIn: true,  lastSeen: 'Just now' },
  { name: 'Friend', checkedIn: false, lastSeen: '3 hours ago' },
]

export default function PetScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <Text style={styles.heading}>🐾 Shared Pet</Text>
      <Text style={styles.sub}>Keep {pet.name} alive together</Text>

      {/* pet display */}
      <View style={styles.petCard}>
        <Text style={styles.petEmoji}>{pet.emoji}</Text>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petMood}>
          {pet.health > 70 ? '😊 Happy and healthy!' : pet.health > 40 ? '😐 Needs attention' : '😢 Not doing well!'}
        </Text>
      </View>

      {/* stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Stats</Text>
        <ProgressBar
          current={pet.health}
          goal={100}
          label="Health"
          color={colors.success}
        />
        <ProgressBar
          current={pet.happiness}
          goal={100}
          label="Happiness"
          color={colors.accent}
        />
        <ProgressBar
          current={pet.hunger}
          goal={100}
          label="Hunger"
          color={colors.warning}
        />
      </View>

      {/* last activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last Activity</Text>
        <View style={styles.activityRow}>
          <Text style={styles.activityIcon}>🍖</Text>
          <View>
            <Text style={styles.activityLabel}>Last fed</Text>
            <Text style={styles.activityTime}>{pet.lastFed}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.activityRow}>
          <Text style={styles.activityIcon}>🎮</Text>
          <View>
            <Text style={styles.activityLabel}>Last played</Text>
            <Text style={styles.activityTime}>{pet.lastPlayed}</Text>
          </View>
        </View>
      </View>

      {/* owners */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Owners</Text>
        {owners.map((owner) => (
          <View key={owner.name} style={styles.ownerRow}>
            <View style={styles.ownerLeft}>
              <View style={[styles.dot, { backgroundColor: owner.checkedIn ? colors.success : colors.gray300 }]} />
              <Text style={styles.ownerName}>{owner.name}</Text>
            </View>
            <Text style={styles.ownerTime}>{owner.lastSeen}</Text>
          </View>
        ))}
      </View>

      {/* action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.successLight }]}>
          <Text style={styles.actionEmoji}>🍖</Text>
          <Text style={[styles.actionText, { color: colors.successDark }]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accentLight }]}>
          <Text style={styles.actionEmoji}>🎮</Text>
          <Text style={[styles.actionText, { color: colors.accentDark }]}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.actionEmoji}>🛁</Text>
          <Text style={[styles.actionText, { color: colors.primaryDark }]}>Bath</Text>
        </TouchableOpacity>
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
  petCard: {
    backgroundColor: colors.accentLight,
    borderRadius:    radius.xl,
    padding:         spacing[6],
    alignItems:      'center',
    gap:             spacing[2],
  },
  petEmoji: {
    fontSize: 80,
  },
  petName: {
    fontSize:   font['2xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  petMood: {
    fontSize: font.sm,
    color:    colors.gray500,
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
  activityRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  activityIcon: {
    fontSize: font.xl,
  },
  activityLabel: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray700,
  },
  activityTime: {
    fontSize: font.xs,
    color:    colors.gray400,
  },
  divider: {
    height:          1,
    backgroundColor: colors.gray200,
  },
  ownerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  ownerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: radius.full,
  },
  ownerName: {
    fontSize:   font.md,
    fontWeight: font.medium,
    color:      colors.gray900,
  },
  ownerTime: {
    fontSize: font.xs,
    color:    colors.gray400,
  },
  actions: {
    flexDirection: 'row',
    gap:           spacing[3],
    marginTop:     spacing[2],
  },
  actionBtn: {
    flex:           1,
    borderRadius:   radius.md,
    padding:        spacing[3],
    alignItems:     'center',
    gap:            spacing[1],
  },
  actionEmoji: {
    fontSize: font.xl,
  },
  actionText: {
    fontSize:   font.sm,
    fontWeight: font.semibold,
  },
})