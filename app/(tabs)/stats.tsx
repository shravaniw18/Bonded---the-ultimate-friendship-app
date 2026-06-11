import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ProgressBar } from '@/components/ProgressBar'
import { StreakBadge } from '@/components/StreakBadge'

type Stats = {
  // Friendship
  friendshipDays:  number
  friendName:      string

  // Moments
  totalMoments:    number
  savedMoments:    number
  momentsThisWeek: number

  // Study
  totalStudyHours: number
  studyThisWeek:   number
  studyStreak:     number

  // Diet
  mealsLogged:     number
  avgDailyCalories: number

  // Poop
  totalPoops:      number
  avgPoopRating:   number
  bestPoopRating:  number
}

export default function StatsScreen() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // ── Friendship ─────────────────────────────────────────────
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id, user_a, user_b, created_at')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .single()

      if (!friendship) { setLoading(false); return }

      const friendId = friendship.user_a === user.id
        ? friendship.user_b
        : friendship.user_a

      const friendshipDays = Math.floor(
        (Date.now() - new Date(friendship.created_at).getTime()) / 86400000
      )

      // ── Friend's name ──────────────────────────────────────────
      const { data: friendUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', friendId)
        .single()

      // ── Moments ────────────────────────────────────────────────
      const { data: allMoments } = await supabase
        .from('moments')
        .select('id, expires_at, created_at')
        .eq('friendship_id', friendship.id)

      const weekStart = getWeekStart()
      const totalMoments    = allMoments?.length ?? 0
      const savedMoments    = allMoments?.filter(m => !m.expires_at).length ?? 0
      const momentsThisWeek = allMoments?.filter(
        m => new Date(m.created_at) >= new Date(weekStart)
      ).length ?? 0

      // ── Study ──────────────────────────────────────────────────
      const { data: studyLogs } = await supabase
        .from('study_logs')
        .select('user_id, duration_mins, created_at')
        .eq('friendship_id', friendship.id)

      const totalStudyMins  = studyLogs?.reduce((s, l) => s + l.duration_mins, 0) ?? 0
      const weekStudyMins   = studyLogs
        ?.filter(l => new Date(l.created_at) >= new Date(weekStart))
        .reduce((s, l) => s + l.duration_mins, 0) ?? 0
      const myStudyLogs     = studyLogs?.filter(l => l.user_id === user.id) ?? []
      const studyStreak     = calcStreak(myStudyLogs)

      // ── Diet ───────────────────────────────────────────────────
      const { data: dietLogs } = await supabase
        .from('diet_logs')
        .select('calories, created_at')
        .eq('friendship_id', friendship.id)
        .eq('user_id', user.id)

      const mealsLogged = dietLogs?.length ?? 0
      const totalCals   = dietLogs?.reduce((s, l) => s + l.calories, 0) ?? 0

      // group by day to get avg daily calories
      const dayMap: Record<string, number> = {}
      dietLogs?.forEach(l => {
        const day = new Date(l.created_at).toDateString()
        dayMap[day] = (dayMap[day] ?? 0) + l.calories
      })
      const days = Object.values(dayMap)
      const avgDailyCalories = days.length
        ? Math.round(days.reduce((s, d) => s + d, 0) / days.length)
        : 0

      // ── Poop ───────────────────────────────────────────────────
      const { data: poopLogs } = await supabase
        .from('poop_logs')
        .select('rating')
        .eq('friendship_id', friendship.id)
        .eq('user_id', user.id)

      const totalPoops     = poopLogs?.length ?? 0
      const totalRating    = poopLogs?.reduce((s, l) => s + l.rating, 0) ?? 0
      const avgPoopRating  = totalPoops ? Math.round((totalRating / totalPoops) * 10) / 10 : 0
      const bestPoopRating = poopLogs?.reduce((max, l) => Math.max(max, l.rating), 0) ?? 0

      setStats({
        friendshipDays,
        friendName:       friendUser?.username ?? 'Friend',
        totalMoments,
        savedMoments,
        momentsThisWeek,
        totalStudyHours:  Math.round((totalStudyMins / 60) * 10) / 10,
        studyThisWeek:    Math.round((weekStudyMins  / 60) * 10) / 10,
        studyStreak,
        mealsLogged,
        avgDailyCalories,
        totalPoops,
        avgPoopRating,
        bestPoopRating,
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // ── No friendship ────────────────────────────────────────────────
  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No stats yet</Text>
        <Text style={styles.emptySub}>Pair with a friend to start tracking</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.heading}>📊 Stats</Text>
      <Text style={styles.sub}>You & {stats.friendName}</Text>

      {/* Friendship card */}
      <View style={[styles.card, styles.friendshipCard]}>
        <Text style={styles.friendshipEmoji}>🔗</Text>
        <View>
          <Text style={styles.friendshipTitle}>
            Friends for {stats.friendshipDays} days
          </Text>
          <Text style={styles.friendshipSub}>
            with {stats.friendName}
          </Text>
        </View>
      </View>

      {/* Moments */}
      <Text style={styles.sectionTitle}>📸 Moments</Text>
      <View style={styles.statGrid}>
        <StatBox value={stats.totalMoments}    label="Total"       emoji="📸" />
        <StatBox value={stats.savedMoments}    label="Saved"       emoji="🔖" />
        <StatBox value={stats.momentsThisWeek} label="This week"   emoji="🗓" />
      </View>

      {/* Study */}
      <Text style={styles.sectionTitle}>📚 Study</Text>
      <View style={styles.card}>
        <View style={styles.studyRow}>
          <View style={styles.studyStat}>
            <Text style={styles.studyValue}>{stats.totalStudyHours}h</Text>
            <Text style={styles.studyLabel}>Total hours</Text>
          </View>
          <View style={styles.studyDivider} />
          <View style={styles.studyStat}>
            <Text style={styles.studyValue}>{stats.studyThisWeek}h</Text>
            <Text style={styles.studyLabel}>This week</Text>
          </View>
          <View style={styles.studyDivider} />
          <View style={styles.studyStat}>
            <StreakBadge count={stats.studyStreak} size="sm" />
            <Text style={styles.studyLabel}>Streak</Text>
          </View>
        </View>
        <ProgressBar
          current={stats.studyThisWeek}
          goal={20}
          label={`${stats.studyThisWeek}h of 20h weekly goal`}
          color={colors.primary}
        />
      </View>

      {/* Diet */}
      <Text style={styles.sectionTitle}>🥗 Diet</Text>
      <View style={styles.statGrid}>
        <StatBox value={stats.mealsLogged}      label="Meals logged"   emoji="🍽" />
        <StatBox value={`${stats.avgDailyCalories}`} label="Avg kcal/day" emoji="🔥" />
      </View>

      {/* Poop */}
      <Text style={styles.sectionTitle}>🚽 Poop League</Text>
      <View style={styles.statGrid}>
        <StatBox value={stats.totalPoops}     label="Total visits"  emoji="🚽" />
        <StatBox value={stats.avgPoopRating}  label="Avg rating"    emoji="⭐" />
        <StatBox value={stats.bestPoopRating} label="Best rating"   emoji="💎" />
      </View>

    </ScrollView>
  )
}

// ── Stat box ──────────────────────────────────────────────────────
function StatBox({
  value, label, emoji,
}: {
  value: string | number
  label: string
  emoji: string
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxEmoji}>{emoji}</Text>
      <Text style={styles.statBoxValue}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  )
}

// ── Helpers ───────────────────────────────────────────────────────
function getWeekStart() {
  const now  = new Date()
  const day  = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const mon  = new Date(now.setDate(diff))
  mon.setHours(0, 0, 0, 0)
  return mon.toISOString()
}

function calcStreak(logs: { created_at: string }[]): number {
  if (!logs.length) return 0
  const days = [...new Set(logs.map(l => new Date(l.created_at).toDateString()))]
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (days.includes(d.toDateString())) streak++
    else if (i > 0) break
  }
  return streak
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: colors.gray50 },
  content:          { padding: spacing[5], paddingTop: spacing[12], gap: spacing[4], paddingBottom: spacing[8] },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptyEmoji:       { fontSize: 48 },
  emptyTitle:       { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:         { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
  heading:          { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  sub:              { fontSize: font.sm, color: colors.gray500 },
  sectionTitle:     { fontSize: font.md, fontWeight: font.semibold, color: colors.gray700, marginTop: spacing[2] },
  card:             { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], ...shadow.sm },
  friendshipCard:   { flexDirection: 'row', alignItems: 'center', gap: spacing[4], backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing[4] },
  friendshipEmoji:  { fontSize: 40 },
  friendshipTitle:  { fontSize: font.lg, fontWeight: font.bold, color: colors.gray900 },
  friendshipSub:    { fontSize: font.sm, color: colors.gray500 },
  statGrid:         { flexDirection: 'row', gap: spacing[3] },
  statBox:          { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[3], alignItems: 'center', gap: spacing[1], ...shadow.sm },
  statBoxEmoji:     { fontSize: font.xl },
  statBoxValue:     { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  statBoxLabel:     { fontSize: font.xs, color: colors.gray500, textAlign: 'center' },
  studyRow:         { flexDirection: 'row', alignItems: 'center' },
  studyStat:        { flex: 1, alignItems: 'center', gap: spacing[1] },
  studyDivider:     { width: 1, height: 40, backgroundColor: colors.gray200 },
  studyValue:       { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  studyLabel:       { fontSize: font.xs, color: colors.gray500 },
})