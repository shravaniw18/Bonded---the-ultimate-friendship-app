import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { ProgressBar } from '@/components/ProgressBar'

// ── Gecko variants ───────────────────────────────────────────────
const GECKO_OPTIONS = [
  { color: 'green', emoji: '🦎', label: 'Green Gecko',  bg: colors.successLight,  border: colors.success  },
  { color: 'pink',  emoji: '🩷', label: 'Pink Gecko',   bg: colors.accentLight,   border: colors.accent   },
  { color: 'blue',  emoji: '🫧', label: 'Blue Gecko',   bg: colors.primaryLight,  border: colors.primary  },
] as const

type GeckoColor = 'green' | 'pink' | 'blue'

type PetState = {
  name:        string
  color:       GeckoColor
  health:      number
  happiness:   number
  hunger:      number
  lastFed:     string
  lastPlayed:  string
  lastBathed:  string
}

type Owner = {
  name:       string
  isMe:       boolean
  lastSeen:   string
  checkedIn:  boolean
}

function getGecko(color: GeckoColor) {
  return GECKO_OPTIONS.find(g => g.color === color) ?? GECKO_OPTIONS[0]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getMood(health: number) {
  if (health > 70) return '😊 Happy and healthy!'
  if (health > 40) return '😐 Needs attention'
  return '😢 Not doing well!'
}

export default function PetScreen() {
  const [pet, setPet]                   = useState<PetState | null>(null)
  const [owners, setOwners]             = useState<Owner[]>([])
  const [loading, setLoading]           = useState(true)
  const [acting, setActing]             = useState<string | null>(null)
  const [friendshipId, setFriendshipId] = useState<string | null>(null)
  const [showPicker, setShowPicker]     = useState(false)
  const [myId, setMyId]                 = useState<string | null>(null)

  useEffect(() => { fetchPet() }, [])

  async function fetchPet() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyId(user.id)

      const { data: friendship } = await supabase
        .from('friendships')
        .select(`
          id, user_a, user_b,
          pet_name, pet_color,
          pet_health, pet_happiness, pet_hunger,
          pet_last_fed, pet_last_played, pet_last_bathed
        `)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .single()

      if (!friendship) { setLoading(false); return }
      setFriendshipId(friendship.id)

      const friendId = friendship.user_a === user.id
        ? friendship.user_b
        : friendship.user_a

      // Get both usernames + last activity via study_logs as proxy for "last seen"
      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', [user.id, friendId])

      const meUser     = users?.find(u => u.id === user.id)
      const friendUser = users?.find(u => u.id === friendId)

      setPet({
        name:       friendship.pet_name      ?? 'Gecko',
        color:      (friendship.pet_color    ?? 'green') as GeckoColor,
        health:     friendship.pet_health    ?? 100,
        happiness:  friendship.pet_happiness ?? 100,
        hunger:     friendship.pet_hunger    ?? 50,
        lastFed:    friendship.pet_last_fed,
        lastPlayed: friendship.pet_last_played,
        lastBathed: friendship.pet_last_bathed,
      })

      setOwners([
        {
          name:      meUser?.username ?? 'You',
          isMe:      true,
          checkedIn: true,
          lastSeen:  'Just now',
        },
        {
          name:      friendUser?.username ?? 'Friend',
          isMe:      false,
          checkedIn: false,
          lastSeen:  'Unknown',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function doAction(action: 'feed' | 'play' | 'bath') {
    if (!friendshipId) return
    setActing(action)

    // stat changes per action
    const updates: Record<string, any> = {
      feed: {
        pet_hunger:     Math.min(100, (pet?.hunger  ?? 50) + 30),
        pet_health:     Math.min(100, (pet?.health  ?? 80) + 5),
        pet_last_fed:   new Date().toISOString(),
      },
      play: {
        pet_happiness:  Math.min(100, (pet?.happiness ?? 80) + 20),
        pet_health:     Math.min(100, (pet?.health    ?? 80) + 5),
        pet_last_played: new Date().toISOString(),
      },
      bath: {
        pet_health:     Math.min(100, (pet?.health    ?? 80) + 15),
        pet_happiness:  Math.min(100, (pet?.happiness ?? 80) + 10),
        pet_last_bathed: new Date().toISOString(),
      },
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .update(updates[action])
        .eq('id', friendshipId)

      if (error) throw error
      await fetchPet()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setActing(null)
    }
  }

  async function chooseGecko(color: GeckoColor) {
    if (!friendshipId) return
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ pet_color: color })
        .eq('id', friendshipId)

      if (error) throw error
      setShowPicker(false)
      await fetchPet()
    } catch (e: any) {
      Alert.alert('Error', e.message)
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
  if (!pet) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🦎</Text>
        <Text style={styles.emptyTitle}>No friend paired yet</Text>
        <Text style={styles.emptySub}>Invite a friend to adopt a gecko together</Text>
      </View>
    )
  }

  const gecko = getGecko(pet.color)

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>🐾 Shared Pet</Text>
        <Text style={styles.sub}>Keep {pet.name} alive together</Text>

        {/* Pet card */}
        <View style={[styles.petCard, { backgroundColor: gecko.bg }]}>
          <Text style={styles.petEmoji}>{gecko.emoji}</Text>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petMood}>{getMood(pet.health)}</Text>
          <TouchableOpacity
            style={[styles.changeBtn, { borderColor: gecko.border }]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={[styles.changeBtnText, { color: gecko.border }]}>
              Change Gecko
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Health Stats</Text>
          <ProgressBar current={pet.health}    goal={100} label="Health"    color={colors.success} />
          <ProgressBar current={pet.happiness} goal={100} label="Happiness" color={colors.accent}  />
          <ProgressBar current={pet.hunger}    goal={100} label="Hunger"    color={colors.warning} />
        </View>

        {/* Last activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Activity</Text>
          <View style={styles.activityRow}>
            <Text style={styles.activityIcon}>🍖</Text>
            <View>
              <Text style={styles.activityLabel}>Last fed</Text>
              <Text style={styles.activityTime}>{timeAgo(pet.lastFed)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityRow}>
            <Text style={styles.activityIcon}>🎮</Text>
            <View>
              <Text style={styles.activityLabel}>Last played</Text>
              <Text style={styles.activityTime}>{timeAgo(pet.lastPlayed)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityRow}>
            <Text style={styles.activityIcon}>🛁</Text>
            <View>
              <Text style={styles.activityLabel}>Last bathed</Text>
              <Text style={styles.activityTime}>{timeAgo(pet.lastBathed)}</Text>
            </View>
          </View>
        </View>

        {/* Owners */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Owners</Text>
          {owners.map((owner) => (
            <View key={owner.name} style={styles.ownerRow}>
              <View style={styles.ownerLeft}>
                <View style={[
                  styles.dot,
                  { backgroundColor: owner.checkedIn ? colors.success : colors.gray300 },
                ]} />
                <Text style={styles.ownerName}>{owner.name}</Text>
              </View>
              <Text style={styles.ownerTime}>{owner.lastSeen}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {[
            { key: 'feed', emoji: '🍖', label: 'Feed', bg: colors.successLight, fg: colors.successDark },
            { key: 'play', emoji: '🎮', label: 'Play', bg: colors.accentLight,  fg: colors.accentDark  },
            { key: 'bath', emoji: '🛁', label: 'Bath', bg: colors.primaryLight, fg: colors.primaryDark },
          ].map(btn => (
            <TouchableOpacity
              key={btn.key}
              style={[styles.actionBtn, { backgroundColor: btn.bg, opacity: acting === btn.key ? 0.6 : 1 }]}
              onPress={() => doAction(btn.key as 'feed' | 'play' | 'bath')}
              disabled={!!acting}
            >
              {acting === btn.key
                ? <ActivityIndicator color={btn.fg} size="small" />
                : <Text style={styles.actionEmoji}>{btn.emoji}</Text>
              }
              <Text style={[styles.actionText, { color: btn.fg }]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Gecko picker modal ── */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowPicker(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Your Gecko</Text>
            <Text style={styles.modalSub}>Both owners will see the change</Text>

            <View style={styles.geckoRow}>
              {GECKO_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.color}
                  style={[
                    styles.geckoOption,
                    { backgroundColor: option.bg, borderColor: option.border },
                    pet.color === option.color && styles.geckoOptionActive,
                  ]}
                  onPress={() => chooseGecko(option.color)}
                >
                  <Text style={styles.geckoEmoji}>{option.emoji}</Text>
                  <Text style={[styles.geckoLabel, { color: option.border }]}>
                    {option.label}
                  </Text>
                  {pet.color === option.color && (
                    <Text style={styles.geckoCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  screen:             { flex: 1, backgroundColor: colors.gray50 },
  content:            { padding: spacing[5], paddingTop: spacing[12], gap: spacing[4] },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] },
  emptyEmoji:         { fontSize: 48 },
  emptyTitle:         { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:           { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
  heading:            { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  sub:                { fontSize: font.sm, color: colors.gray500 },
  petCard:            { borderRadius: radius.xl, padding: spacing[6], alignItems: 'center', gap: spacing[2] },
  petEmoji:           { fontSize: 80 },
  petName:            { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  petMood:            { fontSize: font.sm, color: colors.gray500 },
  changeBtn:          { marginTop: spacing[2], borderWidth: 1.5, borderRadius: radius.full, paddingVertical: spacing[1], paddingHorizontal: spacing[4] },
  changeBtnText:      { fontSize: font.xs, fontWeight: font.semibold },
  card:               { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], ...shadow.sm },
  cardTitle:          { fontSize: font.md, fontWeight: font.semibold, color: colors.gray900 },
  activityRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  activityIcon:       { fontSize: font.xl },
  activityLabel:      { fontSize: font.sm, fontWeight: font.medium, color: colors.gray700 },
  activityTime:       { fontSize: font.xs, color: colors.gray400 },
  divider:            { height: 1, backgroundColor: colors.gray200 },
  ownerRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownerLeft:          { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  dot:                { width: 8, height: 8, borderRadius: radius.full },
  ownerName:          { fontSize: font.md, fontWeight: font.medium, color: colors.gray900 },
  ownerTime:          { fontSize: font.xs, color: colors.gray400 },
  actions:            { flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] },
  actionBtn:          { flex: 1, borderRadius: radius.md, padding: spacing[3], alignItems: 'center', gap: spacing[1] },
  actionEmoji:        { fontSize: font.xl },
  actionText:         { fontSize: font.sm, fontWeight: font.semibold },

  // Modal
  modalOverlay:       { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard:          { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing[6], gap: spacing[4] },
  modalTitle:         { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  modalSub:           { fontSize: font.sm, color: colors.gray500 },
  geckoRow:           { flexDirection: 'row', gap: spacing[3] },
  geckoOption:        { flex: 1, borderRadius: radius.lg, borderWidth: 1.5, padding: spacing[3], alignItems: 'center', gap: spacing[2] },
  geckoOptionActive:  { borderWidth: 3 },
  geckoEmoji:         { fontSize: 36 },
  geckoLabel:         { fontSize: font.xs, fontWeight: font.semibold, textAlign: 'center' },
  geckoCheck:         { fontSize: font.sm, color: colors.success, fontWeight: font.bold },
  cancelBtn:          { alignItems: 'center', padding: spacing[2] },
  cancelText:         { fontSize: font.sm, color: colors.gray400 },
})