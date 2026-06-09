import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ProgressBar } from '@/components/ProgressBar'

const DAILY_GOAL = 2000

type Meal = {
  id:         string
  meal:       string
  calories:   number
  created_at: string
}

export default function DietScreen() {
  const [myMeals, setMyMeals]         = useState<Meal[]>([])
  const [friendMeals, setFriendMeals] = useState<Meal[]>([])
  const [tab, setTab]                 = useState<'me' | 'friend'>('me')
  const [showForm, setShowForm]       = useState(false)
  const [meal, setMeal]               = useState('')
  const [calories, setCalories]       = useState('')
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

      // Get friend's username
      const { data: friendUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', friendId)
        .single()
      if (friendUser) setFriendName(friendUser.username)

      // Today's logs only
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: logs } = await supabase
        .from('diet_logs')
        .select('id, user_id, meal, calories, created_at')
        .eq('friendship_id', friendship.id)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: true })

      setMyMeals(    (logs ?? []).filter(l => l.user_id === user.id)   as Meal[])
      setFriendMeals((logs ?? []).filter(l => l.user_id === friendId)  as Meal[])
    } finally {
      setLoading(false)
    }
  }

  async function logMeal() {
    const kcal = parseInt(calories)
    if (!meal.trim())      { Alert.alert('Missing', 'Enter a meal name.');   return }
    if (!kcal || kcal <= 0){ Alert.alert('Missing', 'Enter valid calories.'); return }
    if (!friendshipId || !myId) return

    setSaving(true)
    try {
      const { error } = await supabase.from('diet_logs').insert({
        user_id:       myId,
        friendship_id: friendshipId,
        meal:          meal.trim(),
        calories:      kcal,
      })
      if (error) throw error
      setMeal('')
      setCalories('')
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
      hour:   'numeric',
      minute: '2-digit',
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
        <Text style={styles.emptyEmoji}>🥗</Text>
        <Text style={styles.emptyTitle}>No friend paired yet</Text>
        <Text style={styles.emptySub}>Invite a friend to sync diets</Text>
      </View>
    )
  }

  const myTotal     = myMeals.reduce((s, m) => s + m.calories, 0)
  const friendTotal = friendMeals.reduce((s, m) => s + m.calories, 0)
  const meals       = tab === 'me' ? myMeals : friendMeals
  const total       = tab === 'me' ? myTotal : friendTotal

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>🥗 Diet Sync</Text>
      <Text style={styles.sub}>Log meals, hit goals together</Text>

      {/* Combined progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Combined Today</Text>
        <Text style={styles.cardSub}>
          {myTotal + friendTotal} kcal of {DAILY_GOAL * 2} kcal goal
        </Text>
        <ProgressBar
          current={myTotal + friendTotal}
          goal={DAILY_GOAL * 2}
          color={colors.success}
        />
        <View style={styles.splitRow}>
          <View style={styles.splitItem}>
            <Text style={styles.splitName}>You</Text>
            <Text style={styles.splitCal}>{myTotal} kcal</Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <Text style={styles.splitName}>{friendName}</Text>
            <Text style={styles.splitCal}>{friendTotal} kcal</Text>
          </View>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'me' && styles.tabActive]}
          onPress={() => setTab('me')}
        >
          <Text style={[styles.tabText, tab === 'me' && styles.tabTextActive]}>
            My Meals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'friend' && styles.tabActive]}
          onPress={() => setTab('friend')}
        >
          <Text style={[styles.tabText, tab === 'friend' && styles.tabTextActive]}>
            {friendName}'s Meals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personal progress */}
      <View style={styles.card}>
        <ProgressBar
          current={total}
          goal={DAILY_GOAL}
          label={`${total} / ${DAILY_GOAL} kcal`}
          color={colors.primary}
        />
      </View>

      {/* Meal list */}
      <View style={styles.card}>
        {meals.length === 0 ? (
          <Text style={styles.emptyList}>No meals logged yet today</Text>
        ) : (
          meals.map((m, index) => (
            <View key={m.id}>
              <View style={styles.mealRow}>
                <View>
                  <Text style={styles.mealName}>{m.meal}</Text>
                  <Text style={styles.mealTime}>{formatTime(m.created_at)}</Text>
                </View>
                <Text style={styles.mealCal}>{m.calories} kcal</Text>
              </View>
              {index < meals.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>

      {/* Log form */}
      {tab === 'me' && (
        showForm ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log a Meal</Text>
            <TextInput
              style={styles.input}
              placeholder="Meal name"
              placeholderTextColor={colors.gray400}
              value={meal}
              onChangeText={setMeal}
            />
            <TextInput
              style={styles.input}
              placeholder="Calories"
              placeholderTextColor={colors.gray400}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.gray100 }]}
                onPress={() => { setShowForm(false); setMeal(''); setCalories('') }}
              >
                <Text style={[styles.formBtnText, { color: colors.gray700 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                onPress={logMeal}
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
            <Text style={styles.buttonText}>+ Log a Meal</Text>
          </TouchableOpacity>
        )
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: colors.gray50 },
  content:          { padding: spacing[5], paddingTop: spacing[12], gap: spacing[4] },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] },
  emptyEmoji:       { fontSize: 48 },
  emptyTitle:       { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:         { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
  emptyList:        { fontSize: font.sm, color: colors.gray400, textAlign: 'center', paddingVertical: spacing[2] },
  heading:          { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  sub:              { fontSize: font.sm, color: colors.gray500 },
  card:             { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], ...shadow.sm },
  cardTitle:        { fontSize: font.md, fontWeight: font.semibold, color: colors.gray900 },
  cardSub:          { fontSize: font.sm, color: colors.gray500 },
  splitRow:         { flexDirection: 'row', alignItems: 'center', marginTop: spacing[2] },
  splitItem:        { flex: 1, alignItems: 'center', gap: spacing[1] },
  splitDivider:     { width: 1, height: 32, backgroundColor: colors.gray200 },
  splitName:        { fontSize: font.sm, color: colors.gray500 },
  splitCal:         { fontSize: font.md, fontWeight: font.bold, color: colors.gray900 },
  tabs:             { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing[1] },
  tabBtn:           { flex: 1, padding: spacing[2], alignItems: 'center', borderRadius: radius.sm },
  tabActive:        { backgroundColor: colors.white, ...shadow.sm },
  tabText:          { fontSize: font.sm, fontWeight: font.medium, color: colors.gray500 },
  tabTextActive:    { color: colors.gray900 },
  mealRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] },
  mealName:         { fontSize: font.md, fontWeight: font.medium, color: colors.gray900 },
  mealTime:         { fontSize: font.xs, color: colors.gray400 },
  mealCal:          { fontSize: font.md, fontWeight: font.semibold, color: colors.primary },
  divider:          { height: 1, backgroundColor: colors.gray200 },
  input:            { backgroundColor: colors.gray100, color: colors.gray900, padding: spacing[3], borderRadius: radius.md, fontSize: font.base },
  formActions:      { flexDirection: 'row', gap: spacing[3] },
  formBtn:          { flex: 1, padding: spacing[3], borderRadius: radius.md, alignItems: 'center' },
  formBtnText:      { fontSize: font.sm, fontWeight: font.semibold },
  button:           { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing[4], alignItems: 'center' },
  buttonText:       { color: colors.white, fontSize: font.md, fontWeight: font.bold },
})