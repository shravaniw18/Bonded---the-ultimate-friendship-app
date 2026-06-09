import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal,
  TextInput, Alert, Pressable,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressBar } from '@/components/ProgressBar'

const WEEKLY_GOAL = 20 // hours

type PlayerStats = {
  id:       string
  username: string
  hours:    number
  streak:   number
}

export default function StudyScreen() {
  const [me, setMe]               = useState<PlayerStats | null>(null)
  const [friend, setFriend]       = useState<PlayerStats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [modalVisible, setModal]  = useState(false)
  const [duration, setDuration]   = useState('')
  const [logging, setLogging]     = useState(false)
  const [friendshipId, setFriendshipId] = useState<string | null>(null)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // ── Get friendship ──────────────────────────────────────────
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id, user_a, user_b')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .single()

      if (!friendship) { setLoading(false); return }
      setFriendshipId(friendship.id)

      const friendId = friendship.user_a === user.id
        ? friendship.user_b
        : friendship.user_a

      // ── Get both usernames ──────────────────────────────────────
      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', [user.id, friendId])

      const meUser     = users?.find(u => u.id === user.id)
      const friendUser = users?.find(u => u.id === friendId)

      // ── Get this week's study logs ──────────────────────────────
      const weekStart = getWeekStart()

      const { data: logs } = await supabase
        .from('study_logs')
        .select('user_id, duration_mins, created_at')
        .eq('friendship_id', friendship.id)
        .gte('created_at', weekStart)

      const myLogs     = logs?.filter(l => l.user_id === user.id)     ?? []
      const friendLogs = logs?.filter(l => l.user_id === friendId)    ?? []

      const myHours     = minsToHours(myLogs.reduce((s, l) => s + l.duration_mins, 0))
      const friendHours = minsToHours(friendLogs.reduce((s, l) => s + l.duration_mins, 0))

      // ── Calculate streaks ───────────────────────────────────────
      const { data: allLogs } = await supabase
        .from('study_logs')
        .select('user_id, created_at')
        .eq('friendship_id', friendship.id)
        .order('created_at', { ascending: false })

      const myStreak     = calcStreak(allLogs?.filter(l => l.user_id === user.id)  ?? [])
      const friendStreak = calcStreak(allLogs?.filter(l => l.user_id === friendId) ?? [])

      setMe({
        id:       user.id,
        username: meUser?.username ?? 'You',
        hours:    myHours,
        streak:   myStreak,
      })
      setFriend({
        id:       friendId,
        username: friendUser?.username ?? 'Friend',
        hours:    friendHours,
        streak:   friendStreak,
      })
    } finally {
      setLoading(false)
    }
  }

  async function logSession() {
    const mins = parseInt(duration)
    if (!mins || mins <= 0) {
      Alert.alert('Invalid', 'Enter a valid number of minutes.')
      return
    }
    if (!friendshipId) return
    setLogging(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase.from('study_logs').insert({
        user_id:       user.id,
        friendship_id: friendshipId,
        duration_mins: mins,
      })

      if (error) throw error

      setModal(false)
      setDuration('')
      await fetchStats()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLogging(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // ── No friendship ──────────────────────────────────────────────
  if (!me || !friend) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyTitle}>No friend paired yet</Text>
        <Text style={styles.emptySub}>Invite a friend to start study battles</Text>
      </View>
    )
  }

  const totalHours = me.hours + friend.hours

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>📚 Study Battles</Text>
        <Text style={styles.sub}>Compete, grow, win together</Text>

        {/* Weekly goal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Goal</Text>
          <Text style={styles.cardSub}>
            {totalHours}h of {WEEKLY_GOAL}h together
          </Text>
          <ProgressBar
            current={totalHours}
            goal={WEEKLY_GOAL}
            color={colors.primary}
          />
        </View>

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.card}>
          <PlayerRow
            name={me.username}
            hours={me.hours}
            streak={me.streak}
            isLeading={me.hours >= friend.hours}
          />
          <View style={styles.divider} />
          <PlayerRow
            name={friend.username}
            hours={friend.hours}
            streak={friend.streak}
            isLeading={friend.hours > me.hours}
          />
        </View>

        {/* Log button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModal(true)}
        >
          <Text style={styles.buttonText}>+ Log Study Session</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Log session modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setModal(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Study Session</Text>
            <Text style={styles.modalSub}>How many minutes did you study?</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 60"
              placeholderTextColor={colors.gray400}
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
              maxLength={4}
            />

            {/* Quick picks */}
            <View style={styles.quickRow}>
              {[30, 60, 90, 120].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.quickBtn,
                    duration === String(m) && styles.quickBtnActive,
                  ]}
                  onPress={() => setDuration(String(m))}
                >
                  <Text style={[
                    styles.quickBtnText,
                    duration === String(m) && styles.quickBtnTextActive,
                  ]}>
                    {m}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, logging && { opacity: 0.6 }]}
              onPress={logSession}
              disabled={logging}
            >
              {logging
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.buttonText}>Save Session</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setModal(false); setDuration('') }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

// ── Player row ───────────────────────────────────────────────────
type PlayerRowProps = {
  name:      string
  hours:     number
  streak:    number
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

// ── Helpers ──────────────────────────────────────────────────────
function minsToHours(mins: number) {
  return Math.round((mins / 60) * 10) / 10
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()                        // 0 = Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Mon
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

function calcStreak(logs: { created_at: string }[]): number {
  if (logs.length === 0) return 0

  const days = [...new Set(
    logs.map(l => new Date(l.created_at).toDateString())
  )]

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (days.includes(d.toDateString())) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

// ── Styles ───────────────────────────────────────────────────────
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
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[3],
    padding:        spacing[6],
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize:   font.xl,
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  emptySub: {
    fontSize:  font.sm,
    color:     colors.gray500,
    textAlign: 'center',
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
  modalOverlay: {
    flex:            1,
    backgroundColor: colors.overlay,
    justifyContent:  'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius:  radius.xl,
    borderTopRightRadius: radius.xl,
    padding:         spacing[6],
    gap:             spacing[4],
  },
  modalTitle: {
    fontSize:   font.xl,
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  modalSub: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  input: {
    borderWidth:     1,
    borderColor:     colors.gray200,
    borderRadius:    radius.md,
    padding:         spacing[4],
    fontSize:        font.lg,
    color:           colors.gray900,
    textAlign:       'center',
  },
  quickRow: {
    flexDirection: 'row',
    gap:           spacing[2],
  },
  quickBtn: {
    flex:            1,
    borderWidth:     1,
    borderColor:     colors.gray200,
    borderRadius:    radius.md,
    padding:         spacing[3],
    alignItems:      'center',
  },
  quickBtnActive: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryLight,
  },
  quickBtnText: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray500,
  },
  quickBtnTextActive: {
    color: colors.primary,
  },
  cancelBtn: {
    alignItems: 'center',
    padding:    spacing[2],
  },
  cancelText: {
    fontSize: font.sm,
    color:    colors.gray400,
  },
})