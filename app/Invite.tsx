import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, FlatList,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

type Friend = {
  friendship_id: string
  username:      string
  created_at:    string
}

export default function InviteScreen() {
  const [tab, setTab]           = useState<'friends' | 'add'>('friends')
  const [myCode, setMyCode]     = useState('')
  const [enterCode, setEnterCode] = useState('')
  const [loading, setLoading]   = useState(false)
  const [friends, setFriends]   = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoadingFriends(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get or create my invite code (always user_a row with null user_b)
      let { data: myFriendship } = await supabase
        .from('friendships')
        .select('invite_code')
        .eq('user_a', user.id)
        .is('user_b', null)
        .single()

      if (!myFriendship) {
        const newCode = generateCode()
        const { data } = await supabase
          .from('friendships')
          .insert({ user_a: user.id, invite_code: newCode })
          .select('invite_code')
          .single()
        myFriendship = data
      }

      if (myFriendship) setMyCode(myFriendship.invite_code)

      // Get all friendships this user is part of
      const { data: friendships } = await supabase
        .from('friendships')
        .select('id, user_a, user_b, created_at')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .not('user_b', 'is', null)

      if (!friendships?.length) { setLoadingFriends(false); return }

      // Get all friend user IDs
      const friendIds = friendships.map(f =>
        f.user_a === user.id ? f.user_b : f.user_a
      )

      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', friendIds)

      const friendList: Friend[] = friendships.map(f => {
        const friendId = f.user_a === user.id ? f.user_b : f.user_a
        const u = users?.find(u => u.id === friendId)
        return {
          friendship_id: f.id,
          username:      u?.username ?? 'Unknown',
          created_at:    f.created_at,
        }
      })

      setFriends(friendList)
    } finally {
      setLoadingFriends(false)
    }
  }

  async function joinWithCode() {
    if (!enterCode.trim()) {
      Alert.alert('Enter a code', 'Please enter your friend\'s invite code')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { data: friendship, error } = await supabase
        .from('friendships')
        .select('id, user_a')
        .eq('invite_code', enterCode.trim().toUpperCase())
        .is('user_b', null)
        .single()

      if (error || !friendship) throw new Error('Invalid code or already used')
      if (friendship.user_a === user.id) throw new Error("That's your own code!")

      // Check not already friends
      const alreadyFriend = friends.some(f => f.friendship_id === friendship.id)
      if (alreadyFriend) throw new Error('You are already friends!')

      const { error: updateError } = await supabase
        .from('friendships')
        .update({ user_b: user.id })
        .eq('id', friendship.id)

      if (updateError) throw updateError

      // Create a fresh pending code for this user for future friends
      const newCode = generateCode()
      await supabase
        .from('friendships')
        .insert({ user_a: user.id, invite_code: newCode })

      Alert.alert('🎉 Bonded!', 'You and your friend are now linked!', [
        { text: "Let's go!", onPress: () => { setEnterCode(''); loadData(); setTab('friends') } }
      ])
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  function friendsSince(dateStr: string) {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days === 0) return 'Since today'
    if (days === 1) return 'Since yesterday'
    return `${days} days`
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends 🔗</Text>
        <Text style={styles.subtitle}>Manage your bonds</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'friends' && styles.tabActive]}
          onPress={() => setTab('friends')}
        >
          <Text style={[styles.tabText, tab === 'friends' && styles.tabTextActive]}>
            My Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'add' && styles.tabActive]}
          onPress={() => setTab('add')}
        >
          <Text style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>
            Add Friend
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'friends' ? (
        loadingFriends ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>No friends yet</Text>
            <Text style={styles.emptySub}>Share your code or enter a friend's code to bond up</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setTab('add')}
            >
              <Text style={styles.addBtnText}>+ Add a Friend</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={f => f.friendship_id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={() => setTab('add')}
              >
                <Text style={styles.addMoreText}>+ Add another friend</Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <View style={styles.friendCard}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{item.username}</Text>
                  <Text style={styles.friendSince}>
                    Friends for {friendsSince(item.created_at)}
                  </Text>
                </View>
                <Text style={styles.friendEmoji}>🔗</Text>
              </View>
            )}
          />
        )
      ) : (
        <View style={styles.addContent}>
          {/* My code */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Share your code</Text>
            <Text style={styles.cardSub}>Ask your friend to enter this</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{myCode || '------'}</Text>
            </View>
            <Text style={styles.cardHint}>
              Once they enter your code, you'll both be bonded 🎉
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Enter code */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter their code</Text>
            <Text style={styles.cardSub}>Type your friend's invite code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. A8B3KZ"
              placeholderTextColor={colors.gray400}
              value={enterCode}
              onChangeText={t => setEnterCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={joinWithCode}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.buttonText}>Bond Up 🔗</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.skipText}>Go to app</Text>
      </TouchableOpacity>
    </View>
  )
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: colors.gray50, paddingTop: spacing[12] },
  header:          { paddingHorizontal: spacing[5], marginBottom: spacing[5], gap: spacing[1] },
  title:           { fontSize: font['3xl'], fontWeight: font.bold, color: colors.gray900 },
  subtitle:        { fontSize: font.base, color: colors.gray500 },
  tabs:            { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing[1], marginHorizontal: spacing[5], marginBottom: spacing[4] },
  tabBtn:          { flex: 1, padding: spacing[2], alignItems: 'center', borderRadius: radius.sm },
  tabActive:       { backgroundColor: colors.white, ...shadow.sm },
  tabText:         { fontSize: font.sm, fontWeight: font.medium, color: colors.gray500 },
  tabTextActive:   { color: colors.gray900 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] },
  emptyEmoji:      { fontSize: 48 },
  emptyTitle:      { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:        { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
  addBtn:          { backgroundColor: colors.primary, paddingVertical: spacing[3], paddingHorizontal: spacing[6], borderRadius: radius.md, marginTop: spacing[2] },
  addBtnText:      { color: colors.white, fontWeight: font.bold, fontSize: font.md },
  list:            { padding: spacing[5], gap: spacing[3] },
  friendCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], ...shadow.sm },
  friendAvatar:    { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  friendAvatarText:{ fontSize: font.xl, fontWeight: font.bold, color: colors.primary },
  friendInfo:      { flex: 1, gap: spacing[1] },
  friendName:      { fontSize: font.md, fontWeight: font.semibold, color: colors.gray900 },
  friendSince:     { fontSize: font.xs, color: colors.gray400 },
  friendEmoji:     { fontSize: font.lg },
  addMoreBtn:      { alignItems: 'center', padding: spacing[4] },
  addMoreText:     { fontSize: font.sm, color: colors.primary, fontWeight: font.semibold },
  addContent:      { flex: 1, padding: spacing[5], gap: spacing[4] },
  card:            { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing[5], gap: spacing[3], ...shadow.sm },
  cardTitle:       { fontSize: font.lg, fontWeight: font.semibold, color: colors.gray900 },
  cardSub:         { fontSize: font.sm, color: colors.gray500 },
  codeBox:         { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing[5], alignItems: 'center' },
  codeText:        { fontSize: font['3xl'], fontWeight: font.bold, color: colors.primary, letterSpacing: 8 },
  cardHint:        { fontSize: font.xs, color: colors.gray400, textAlign: 'center' },
  dividerRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  dividerLine:     { flex: 1, height: 1, backgroundColor: colors.gray200 },
  dividerText:     { fontSize: font.sm, color: colors.gray400 },
  input:           { backgroundColor: colors.gray100, color: colors.gray900, padding: spacing[4], borderRadius: radius.md, fontSize: font.xl, fontWeight: font.bold, textAlign: 'center', letterSpacing: 8 },
  button:          { backgroundColor: colors.primary, padding: spacing[4], borderRadius: radius.md, alignItems: 'center' },
  buttonText:      { color: colors.white, fontSize: font.md, fontWeight: font.bold },
  skipBtn:         { alignItems: 'center', padding: spacing[4] },
  skipText:        { fontSize: font.sm, color: colors.gray400 },
})