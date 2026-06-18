import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Image,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

type FriendRow = {
  friendship_id:  string
  username:       string
  latest_moment:  string | null   // image_url
  latest_time:    string | null
  unread:         boolean
  moment_count:   number
}

export default function MomentsScreen() {
  const [friends, setFriends]     = useState<FriendRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchFriends()

    const channel = supabase
      .channel('moments-index')
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'moments',
      }, () => fetchFriends())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchFriends() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: friendships } = await supabase
        .from('friendships')
        .select('id, user_a, user_b')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .not('user_b', 'is', null)

      if (!friendships?.length) { setLoading(false); setRefreshing(false); return }

      const friendIds = friendships.map(f =>
        f.user_a === user.id ? f.user_b : f.user_a
      )

      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', friendIds)

      const rows = await Promise.all(
        friendships.map(async f => {
          const friendId = f.user_a === user.id ? f.user_b : f.user_a
          const u = users?.find(u => u.id === friendId)

          const { data: moments } = await supabase
            .from('moments')
            .select('id, image_url, created_at, user_id')
            .eq('friendship_id', f.id)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })

          const latest      = moments?.[0] ?? null
          const momentCount = moments?.length ?? 0
          const unread = !!latest && latest.user_id !== user.id

          return {
            friendship_id: f.id,
            username:      u?.username ?? 'Unknown',
            latest_moment: latest?.image_url ?? null,
            latest_time:   latest?.created_at ?? null,
            unread,
            moment_count:  momentCount,
          } as FriendRow
        })
      )

      rows.sort((a, b) => {
        if (a.unread && !b.unread) return -1
        if (!a.unread && b.unread) return 1
        if (a.latest_time && b.latest_time)
          return new Date(b.latest_time).getTime() - new Date(a.latest_time).getTime()
        return 0
      })

      setFriends(rows)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function getTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moments</Text>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() => router.push('/camera')}
        >
          <Text style={styles.cameraBtnText}>📸</Text>
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptySub}>Add a friend to start sharing moments</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/invite')}
          >
            <Text style={styles.addBtnText}>+ Add a Friend</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={item => item.friendship_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchFriends() }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              {/* Tappable main area → moments feed */}
              <TouchableOpacity
                style={styles.friendRowMain}
                onPress={() => router.push({
                  pathname: '/(tabs)/moments/[friendshipId]',
                  params:   { friendshipId: item.friendship_id, username: item.username },
                })}
                activeOpacity={0.7}
              >
                <View style={styles.avatarWrap}>
                  {item.latest_moment ? (
                    <Image
                      source={{ uri: item.latest_moment }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {item.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {item.unread && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.friendInfo}>
                  <Text style={[
                    styles.friendName,
                    item.unread && styles.friendNameUnread,
                  ]}>
                    {item.username}
                  </Text>
                  <Text style={styles.friendSub}>
                    {item.moment_count === 0
                      ? 'No moments yet'
                      : item.latest_time
                        ? `${item.moment_count} moment${item.moment_count === 1 ? '' : 's'} · ${getTimeAgo(item.latest_time)}`
                        : `${item.moment_count} moments`
                    }
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Chat button → chat screen */}
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push({
                  pathname: '/(tabs)/moments/chat/[friendshipId]',
                  params:   { friendshipId: item.friendship_id, username: item.username },
                })}
              >
                <Text style={styles.chatBtnText}>💬</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: colors.gray50 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[5], paddingTop: spacing[12], paddingBottom: spacing[3], backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.gray200 },
  headerTitle:      { fontSize: font['2xl'], fontWeight: font.bold, color: colors.gray900 },
  cameraBtn:        { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cameraBtnText:    { fontSize: font.lg },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptyEmoji:       { fontSize: 48 },
  emptyTitle:       { fontSize: font.xl, fontWeight: font.bold, color: colors.gray900 },
  emptySub:         { fontSize: font.sm, color: colors.gray500, textAlign: 'center' },
  addBtn:           { backgroundColor: colors.primary, paddingVertical: spacing[3], paddingHorizontal: spacing[6], borderRadius: radius.md, marginTop: spacing[2] },
  addBtnText:       { color: colors.white, fontWeight: font.bold, fontSize: font.md },
  list:             { paddingVertical: spacing[2] },
  friendRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[3], backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.gray100, gap: spacing[2] },
  friendRowMain:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatarWrap:       { position: 'relative' },
  avatar:           { width: 56, height: 56, borderRadius: radius.full },
  avatarPlaceholder:{ backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:    { fontSize: font.xl, fontWeight: font.bold, color: colors.primary },
  unreadDot:        { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: radius.full, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.white },
  friendInfo:       { flex: 1, gap: spacing[1] },
  friendName:       { fontSize: font.md, fontWeight: font.medium, color: colors.gray700 },
  friendNameUnread: { fontWeight: font.bold, color: colors.gray900 },
  friendSub:        { fontSize: font.xs, color: colors.gray400 },
  chatBtn:          { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.gray50, alignItems: 'center', justifyContent: 'center' },
  chatBtnText:      { fontSize: font.lg },
})