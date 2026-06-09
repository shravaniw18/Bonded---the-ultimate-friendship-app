import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius } from '@/lib/theme'
import { MomentCard } from '@/components/MomentCard'

type Moment = {
  id:         string
  image_url:  string
  caption:    string | null
  created_at: string
  expires_at: string
  users:      { username: string }
}

export default function MomentsScreen() {
  const [moments, setMoments]       = useState<Moment[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchMoments() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: friendship } = await supabase
      .from('friendships')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .single()

    if (!friendship) { setLoading(false); return }

    const { data } = await supabase
      .from('moments')
      .select('id, image_url, caption, created_at, expires_at, users(username)')
      .eq('friendship_id', friendship.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    setMoments((data as any[]) ?? [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchMoments()

    const channel = supabase
      .channel('moments-feed')
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'moments',
      }, () => fetchMoments())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

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

  if (moments.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Moments</Text>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => router.push('/camera')}
          >
            <Text style={styles.cameraBtnText}>📸</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📸</Text>
          <Text style={styles.emptyTitle}>No moments yet</Text>
          <Text style={styles.emptySub}>Post the first one!</Text>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => router.push('/camera')}
          >
            <Text style={styles.postBtnText}>Post a Moment</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moments</Text>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() => router.push('/camera')}
        >
          <Text style={styles.cameraBtnText}>📸</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchMoments() }}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <MomentCard
            imageUrl={item.image_url}
            caption={item.caption ?? undefined}
            timeAgo={getTimeAgo(item.created_at)}
            username={item.users?.username ?? 'Unknown'}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[12],
    paddingBottom:     spacing[3],
    backgroundColor:   colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize:   font['2xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  cameraBtn: {
    width:           44,
    height:          44,
    borderRadius:    radius.full,
    backgroundColor: colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cameraBtnText: {
    fontSize: font.lg,
  },
  list: {
    padding: spacing[4],
    gap:     spacing[4],
  },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[3],
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
    fontSize: font.sm,
    color:    colors.gray500,
  },
  postBtn: {
    backgroundColor:  colors.primary,
    paddingVertical:  spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius:     radius.md,
    marginTop:        spacing[2],
  },
  postBtnText: {
    color:      colors.white,
    fontWeight: font.bold,
    fontSize:   font.md,
  },
})