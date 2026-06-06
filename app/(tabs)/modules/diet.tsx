import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ProgressBar } from '@/components/ProgressBar'

// ── mock data ─────────────────────────────────
const dailyGoal = 2000

const myMeals = [
  { id: '1', meal: 'Oats + banana',  calories: 320, time: '8:00 AM' },
  { id: '2', meal: 'Chicken rice',   calories: 550, time: '1:00 PM' },
]

const friendMeals = [
  { id: '1', meal: 'Avocado toast',  calories: 280, time: '9:00 AM' },
  { id: '2', meal: 'Pasta',          calories: 620, time: '2:00 PM' },
]

export default function DietScreen() {
  const [tab, setTab] = useState<'me' | 'friend'>('me')
  const [showForm, setShowForm] = useState(false)
  const [meal, setMeal] = useState('')
  const [calories, setCalories] = useState('')

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
      {/* header */}
      <Text style={styles.heading}>🥗 Diet Sync</Text>
      <Text style={styles.sub}>Log meals, hit goals together</Text>

      {/* shared progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Combined Today</Text>
        <Text style={styles.cardSub}>{myTotal + friendTotal} kcal of {dailyGoal * 2} kcal goal</Text>
        <ProgressBar
          current={myTotal + friendTotal}
          goal={dailyGoal * 2}
          color={colors.success}
        />
        <View style={styles.splitRow}>
          <View style={styles.splitItem}>
            <Text style={styles.splitName}>You</Text>
            <Text style={styles.splitCal}>{myTotal} kcal</Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <Text style={styles.splitName}>Friend</Text>
            <Text style={styles.splitCal}>{friendTotal} kcal</Text>
          </View>
        </View>
      </View>

      {/* tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'me' && styles.tabActive]}
          onPress={() => setTab('me')}
        >
          <Text style={[styles.tabText, tab === 'me' && styles.tabTextActive]}>My Meals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'friend' && styles.tabActive]}
          onPress={() => setTab('friend')}
        >
          <Text style={[styles.tabText, tab === 'friend' && styles.tabTextActive]}>Friend's Meals</Text>
        </TouchableOpacity>
      </View>

      {/* daily progress */}
      <View style={styles.card}>
        <ProgressBar
          current={total}
          goal={dailyGoal}
          label={`${total} / ${dailyGoal} kcal`}
          color={colors.primary}
        />
      </View>

      {/* meal list */}
      <View style={styles.card}>
        {meals.map((m) => (
          <View key={m.id}>
            <View style={styles.mealRow}>
              <View>
                <Text style={styles.mealName}>{m.meal}</Text>
                <Text style={styles.mealTime}>{m.time}</Text>
              </View>
              <Text style={styles.mealCal}>{m.calories} kcal</Text>
            </View>
            {meals.indexOf(m) < meals.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* add meal form */}
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
                onPress={() => setShowForm(false)}
              >
                <Text style={[styles.formBtnText, { color: colors.gray700 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowForm(false)}
              >
                <Text style={[styles.formBtnText, { color: colors.white }]}>Save</Text>
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
  splitRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     spacing[2],
  },
  splitItem: {
    flex:      1,
    alignItems: 'center',
    gap:        spacing[1],
  },
  splitDivider: {
    width:           1,
    height:          32,
    backgroundColor: colors.gray200,
  },
  splitName: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  splitCal: {
    fontSize:   font.md,
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  tabs: {
    flexDirection:   'row',
    backgroundColor: colors.gray100,
    borderRadius:    radius.md,
    padding:         spacing[1],
  },
  tabBtn: {
    flex:           1,
    padding:        spacing[2],
    alignItems:     'center',
    borderRadius:   radius.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadow.sm,
  },
  tabText: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray500,
  },
  tabTextActive: {
    color: colors.gray900,
  },
  mealRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: spacing[2],
  },
  mealName: {
    fontSize:   font.md,
    fontWeight: font.medium,
    color:      colors.gray900,
  },
  mealTime: {
    fontSize: font.xs,
    color:    colors.gray400,
  },
  mealCal: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.primary,
  },
  divider: {
    height:          1,
    backgroundColor: colors.gray200,
  },
  input: {
    backgroundColor: colors.gray100,
    color:           colors.gray900,
    padding:         spacing[3],
    borderRadius:    radius.md,
    fontSize:        font.base,
  },
  formActions: {
    flexDirection: 'row',
    gap:           spacing[3],
  },
  formBtn: {
    flex:           1,
    padding:        spacing[3],
    borderRadius:   radius.md,
    alignItems:     'center',
  },
  formBtnText: {
    fontSize:   font.sm,
    fontWeight: font.semibold,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    padding:         spacing[4],
    alignItems:      'center',
  },
  buttonText: {
    color:      colors.white,
    fontSize:   font.md,
    fontWeight: font.bold,
  },
})