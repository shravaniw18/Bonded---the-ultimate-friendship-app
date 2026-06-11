import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView,
  StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ProgressBar } from '@/components/ProgressBar'

type FriendStats = {
  friendship_id:   string
  username:        string
  friendship_days: number
  moments_total:   number
  moments_saved:   number
  study_hours:     number
  meals_logged:    number
  poop_total:      number
  closeness_score: number
}

export default function StatsScreen() {
  const [friends, setFriends]       = useState<FriendStats[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<string | null>(null)

  useEffect(() => { fetchAllStats() }, [])

  async function fetchAllStats() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // All friendships
      const { data: friendships } = await supabase
        .from('friendships')
        .select('id, user_a, user_b, created_at')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .not('user_b', 'is', null)

      if (!friendships?.length) { setLoading(false); return }

      const friendIds = friendships.map(f =>
        f.user_a === user.id ? f.user_b : f.user_a
      )

      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', friendIds)

      const stats = await Promise.all(
        friendships.map(async f => {
          const friendId = f.user_a === user.id ? f.user_b : f.user_a
          const u        = users?.find(u => u.id === friendId)

          const friendshipDays = Math.floor(
            (Date.now() - new Date(f.created_at).getTime()) / 86400000
          )

          // Moments
          const { data: moments } = await supabase
            .from('moments')
            .select('id, expires_at')
            .eq('friendship_id', f.id)

          const momentsTotal = moments?.length ?? 0
          const momentsSaved = moments?.filter(m => !m.expires_at).length ?? 0

          // Study
          const { data: studyLogs } = await supabase
            .from('study_logs')
            .select('duration_mins')
            .eq('friendship_id', f.id)

          const studyHours = Math.round(
            ((studyLogs?.reduce((s, l) => s + l.duration_mins, 0) ?? 0) / 60) * 10
          ) / 10

          // Diet
          const { data: dietLogs } = await supabase
            .from('diet_logs')
            .select('id')
            .eq('friendship_id', f.id)

          const mealsLogged = dietLogs?.length ?? 0

          // Poop
          const { data: poopLogs } = await supabase
            .from('poop_logs')
            .select('id')
            .eq('friendship_id', f.id)

          const poopTotal = poopLogs?.length ?? 0

          // Closeness score — weighted formula
          const closeness = Math.min(100, Math.round(
            momentsTotal * 4 +
            momentsSaved * 6 +
            studyHours   * 2 +
            mealsLogged  * 1 +
            poopTotal    * 1 +
            Math.min(friendshipDays, 30) * 0.5
          ))

          return {
            friendship_id:   f.id,
            username:        u?.username ?? 'Unknown',
            friendship_days: friendshipDays,
            moments_total:   momentsTotal,
            moments_saved:   momentsSaved,
            study_hours:     studyHours,
            meals_logged:    mealsLogged,
            poop_total:      poopTotal,
            closeness_score: closeness,
          } as FriendStats
        })
      )

      // Sort by closeness score descending
      stats.sort((a, b) => b.closeness_score - a.closeness_score)
      setFriends(stats)
      if (stats.length > 0) setSelected(stats[0].friendship_id)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (friends.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No stats yet</Text>
        <Text style={styles.emptySub}>Add friends and start sharing to see stats</Text>
      </View>
    )
  }

  const topFriend  = friends[0]
  const detailFriend = friends.find(f => f.friendship_id === selected) ?? friends[0]

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>📊 Stats</Text>
      <Text style={styles.sub}>Your friendship breakdown</Text>

      {/* Friend of the month */}
      <View style={[styles.card, styles.fotmCard]}>
        <Text style={styles.fotmEmoji}>🏆</Text>
        <View style={styles.fotmInfo}>
          <Text style={styles.fotmLabel}>Closest Friend</Text>
          <Text style={styles.fotmName}>@{topFriend.username}</Text>
          <Text style={styles.fotmSub}>
            {topFriend.moments_total} moments · {topFriend.friendship_days} days
          </Text>
        </View>
        <Text style={styles.fotmScore}>{topFriend.closeness_score}</Text>
      </View>

      {/* Closeness leaderboard */}
      <Text style={styles.sectionTitle}>Closeness Ranking</Text>
      <View style={styles.card}>
        {friends.map((f, index) => (
          <View key={f.friendship_id}>
            <View style={styles.rankRow}>
              <Text style={styles.rankNum}>#{index + 1}</Text>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>@{f.username}</Text>
                <ProgressBar
                  current={f.closeness_score}
                  goal={100}
                  color={index === 0 ? colors.warning : colors.primary}
                />
              </View>
              <Text style={styles.rankScore}>{f.closeness_score}</Text>
            </View>
            {index < friends.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Friend selector */}
      {friends.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>Detailed Stats</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {friends.map(f => (
              <TouchableOpacity
                key={f.friendship_id}
                style={[
                  styles.selectorBtn,
                  selected === f.friendship_id && styles.selectorBtnActive,
                ]}
                onPress={() => setSelected(f.friendship_id)}
              >
                <Text style={[
                  styles.selectorText,
                  selected === f.friendship_id && styles.selectorTextActive,
                ]}>
                  @{f.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Detailed stats for selected friend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>You & @{detailFriend.username}</Text>
        <Text style={styles.cardSub}>Friends for {detailFriend.friendship_days} days</Text>

        <View style={styles.statGrid}>
          <StatBox value={detailFriend.moments_total} label="Moments"     emoji="📸" />
          <StatBox value={detailFriend.moments_saved} label="Saved"       emoji="🔖" />
          <StatBox value={detailFriend.study_hours}   label="Study hrs"   emoji="📚" />
        </View>
        <View style={styles.statGrid}>
          <StatBox value={detailFriend.meals_logged}  label="Meals"       emoji="🥗" />
          <StatBox value={detailFriend.poop_total}    label="Poop logs"   emoji="🚽" />
          <StatBox value={detailFriend.closeness_score} label="Closeness" emoji="🔗" />
        </View>
      </View>

    </ScrollView>
  )
}

// ── Stat box ──────────────────────────────────────────────────────
function StatBox({ value, label, emoji }: {
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
  cardTitle:        { fontSize: font.md, fontWeight: font.semibold, color: colors.gray900 },
  cardSub:          { fontSize: font.sm, color: colors.gray500 },
  fotmCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warningLight, gap: spacing[3] },
  fotmEmoji:        { fontSize: 40 },
  fotmInfo:         { flex: 1, gap: spacing[1] },
  fotmLabel:        { fontSize: font.xs, fontWeight: font.semibold, color: colors.warning },
  fotmName:         { fontSize: font.lg, fontWeight: font.bold, color: colors.gray900 },
  fotmSub:          { fontSize: font.xs, color: colors.gray500 },
  fotmScore:        { fontSize: font['3xl'], fontWeight: font.bold, color: colors.warning },
  rankRow:          { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  rankNum:          { fontSize: font.md, fontWeight: font.bold, color: colors.gray400, width: 28 },
  rankInfo:         { flex: 1, gap: spacing[1] },
  rankName:         { fontSize: font.sm, fontWeight: font.semibold, color: colors.gray900 },
  rankScore:        { fontSize: font.md, fontWeight: font.bold, color: colors.primary },
  divider:          { height: 1, backgroundColor: colors.gray100, marginVertical: spacing[2] },
  selectorRow:      { gap: spacing[2], paddingVertical: spacing[1] },
  selectorBtn:      { paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
  selectorBtnActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  selectorText:     { fontSize: font.sm, fontWeight: font.medium, color: colors.gray500 },
  selectorTextActive:{ color: colors.white },
  statGrid:         { flexDirection: 'row', gap: spacing[2] },
  statBox:          { flex: 1, backgroundColor: colors.gray50, borderRadius: radius.md, padding: spacing[3], alignItems: 'center', gap: spacing[1] },
  statBoxEmoji:     { fontSize: font.lg },
  statBoxValue:     { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  statBoxLabel:     { fontSize: font.xs, color: colors.gray500, textAlign: 'center' },
})