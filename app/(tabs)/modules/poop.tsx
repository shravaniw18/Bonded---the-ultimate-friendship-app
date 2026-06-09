import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

type PoopLog = {
  id:         string
  rating:     number
  notes:      string | null
  created_at: string
}

export default function PoopScreen() {
  const [myLogs, setMyLogs]           = useState<PoopLog[]>([])
  const [friendLogs, setFriendLogs]   = useState<PoopLog[]>([])
  const [tab, setTab]                 = useState<'me' | 'friend'>('me')
  const [showForm, setShowForm]       = useState(false)
  const [rating, setRating]           = useState(0)
  const [notes, setNotes]             = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [friendshipId, setFriendshipId] = useState<string | null>(null)
  const [myId, setMyId]               = useState<string | null>(null)
  const [friendName, setFriendName]   = useState('Friend')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyId(user.id)

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

      const { data: friendUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', friendId)
        .single()
      if (friendUser) setFriendName(friendUser.username)

      // This week's logs
      const weekStart = getWeekStart()

      const { data: logs } = await supabase
        .from('poop_logs')
        .select('id, user_id, rating, notes, created_at')
        .eq('friendship_id', friendship.id)
        .gte('created_at', weekStart)
        .order('created_at', { ascending: false })

      setMyLogs(    (logs ?? []).filter(l => l.user_id === user.id)  as PoopLog[])
      setFriendLogs((logs ?? []).filter(l => l.user_id === friendId) as PoopLog[])
    } finally {
      setLoading(false)
    }
  }

  async function logVisit() {
    if (rating === 0)  { Alert.alert('Missing', 'Give a rating first.'); return }
    if (!friendshipId || !myId) return

    setSaving(true)
    try {
      const { error } = await supabase.from('poop_logs').insert({
        user_id:       myId,
        friendship_id: friendshipId,
        rating,
        notes:         notes.trim() || null,
      })
      if (error) throw error
      setRating(0)
      setNotes('')
      setShowForm(false)
      await fetchData()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setSaving(false)
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!friendshipId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🚽</Text>
        <Text style={styles.emptyTitle}>No friend paired yet</Text>
        <Text style={styles.emptySub}>Invite a friend to start the league</Text>
      </View>
    )
  }

  const myScore     = myLogs.reduce((s, l) => s + l.rating, 0)
  const friendScore = friendLogs.reduce((s, l) => s + l.rating, 0)
  const logs        = tab === 'me' ? myLogs : friendLogs

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>🚽 Poop League</Text>
      <Text style={styles.sub}>May the best one win</Text>

      {/* Leaderboard */}
      <View style={styles.leaderboard}>
        <ScoreCard name="You"        score={myScore}     isLeading={myScore >= friendScore} />
        <View style={styles.vs}><Text style={styles.vsText}>VS</Text></View>
        <ScoreCard name={friendName} score={friendScore} isLeading={friendScore > myScore}  />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'me' && styles.tabActive]}
          onPress={() => setTab('me')}
        >
          <Text style={[styles.tabText, tab === 'me' && styles.tabTextActive]}>My Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'friend' && styles.tabActive]}
          onPress={() => setTab('friend')}
        >
          <Text style={[styles.tabText, tab === 'friend' && styles.tabTextActive]}>
            {friendName}'s Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Log list */}
      <View style={styles.card}>
        {logs.length === 0 ? (
          <Text style={styles.emptyList}>No logs this week yet</Text>
        ) : (
          logs.map((log, index) => (
            <View key={log.id}>
              <View style={styles.logRow}>
                <View style={styles.logLeft}>
                  <Text style={styles.logRating}>{getRatingEmoji(log.rating)}</Text>
                  <View>
                    <Text style={styles.logNotes}>{log.notes ?? '—'}</Text>
                    <Text style={styles.logTime}>{formatTime(log.created_at)}</Text>
                  </View>
                </View>
                <StarRating rating={log.rating} />
              </View>
              {index < logs.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>

      {/* Log form */}
      {tab === 'me' && (
        showForm ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log a Visit</Text>
            <Text style={styles.cardSub}>How was it?</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.star, rating >= star && styles.starActive]}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.gray400}
              value={notes}
              onChangeText={setNotes}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.gray100 }]}
                onPress={() => { setShowForm(false); setRating(0); setNotes('') }}
              >
                <Text style={[styles.formBtnText, { color: colors.gray700 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                onPress={logVisit}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={[styles.formBtnText, { color: colors.white }]}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => setShowForm(true)}>
            <Text style={styles.buttonText}>+ Log a Visit</Text>
          </TouchableOpacity>
        )
      )}
    </ScrollView>
  )
}

function ScoreCard({ name, score, isLeading }: { name: string; score: number; isLeading: boolean }) {
  return (
    <View style={[styles.scoreCard, isLeading && styles.scoreCardLeading]}>
      {isLeading && <Text style={styles.crown}>👑</Text>}
      <Text style={styles.scoreName}>{name}</Text>
      <Text style={styles.scoreValue}>{score}</Text>
      <Text style={styles.scoreLabel}>pts</Text>
    </View>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ fontSize: 12, opacity: s <= rating ? 1 : 0.3 }}>⭐</Text>
      ))}
    </View>
  )
}

function getRatingEmoji(rating: number) {
  if (rating >= 5) return '💎'
  if (rating >= 4) return '✨'
  if (rating >= 3) return '👍'
  if (rating >= 2) return '😐'
  return '💀'
}

function getWeekStart() {
  const now  = new Date()
  const day  = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const mon  = new Date(now.setDate(diff))
  mon.setHours(0, 0, 0, 0)
  return mon.toISOString()
}

const styles = StyleSheet.create({
  screen:            { flex: 1, backgroundColor: colors.gray50 },
  content:           { padding: spacing[5], paddingTop: spacing[12], gap: spacing[4] },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] },
  emptyEmoji:        { fontSize: 48 },
  emptyTitle:        { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:          { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
  emptyList:         { fontSize: font.sm, color: colors.gray400, textAlign: 'center', paddingVertical: spacing[2] },
  heading:           { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  sub:               { fontSize: font.sm, color: colors.gray500 },
  leaderboard:       { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  scoreCard:         { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', gap: spacing[1], ...shadow.sm },
  scoreCardLeading:  { backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.primary },
  crown:             { fontSize: font.lg },
  scoreName:         { fontSize: font.sm, fontWeight: font.medium, color: colors.gray500 },
  scoreValue:        { fontSize: font['3xl'], fontWeight: font.bold, color: colors.gray900 },
  scoreLabel:        { fontSize: font.xs, color: colors.gray400 },
  vs:                { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' },
  vsText:            { fontSize: font.xs, fontWeight: font.bold, color: colors.gray500 },
  tabs:              { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing[1] },
  tabBtn:            { flex: 1, padding: spacing[2], alignItems: 'center', borderRadius: radius.sm },
  tabActive:         { backgroundColor: colors.white, ...shadow.sm },
  tabText:           { fontSize: font.sm, fontWeight: font.medium, color: colors.gray500 },
  tabTextActive:     { color: colors.gray900 },
  card:              { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], ...shadow.sm },
  cardTitle:         { fontSize: font.md, fontWeight: font.semibold, color: colors.gray900 },
  cardSub:           { fontSize: font.sm, color: colors.gray500 },
  logRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] },
  logLeft:           { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  logRating:         { fontSize: font.xl },
  logNotes:          { fontSize: font.md, fontWeight: font.medium, color: colors.gray900 },
  logTime:           { fontSize: font.xs, color: colors.gray400 },
  stars:             { flexDirection: 'row', gap: 2 },
  divider:           { height: 1, backgroundColor: colors.gray200 },
  ratingRow:         { flexDirection: 'row', gap: spacing[2] },
  star:              { fontSize: 28, opacity: 0.3 },
  starActive:        { opacity: 1 },
  input:             { backgroundColor: colors.gray100, color: colors.gray900, padding: spacing[3], borderRadius: radius.md, fontSize: font.base },
  formActions:       { flexDirection: 'row', gap: spacing[3] },
  formBtn:           { flex: 1, padding: spacing[3], borderRadius: radius.md, alignItems: 'center' },
  formBtnText:       { fontSize: font.sm, fontWeight: font.semibold },
  button:            { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing[4], alignItems: 'center' },
  buttonText:        { color: colors.white, fontSize: font.md, fontWeight: font.bold },
})