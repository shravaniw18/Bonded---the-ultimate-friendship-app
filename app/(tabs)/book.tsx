import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Image,
  StyleSheet, ActivityIndicator, Dimensions,
  TouchableOpacity, Modal, Pressable,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

const SCREEN_WIDTH = Dimensions.get('window').width
const TILE_SIZE    = (SCREEN_WIDTH - spacing[4] * 2 - spacing[2]) / 2

type SavedMoment = {
  id:         string
  image_url:  string
  caption:    string | null
  created_at: string
  users:      { username: string }
}

export default function BookScreen() {
  const [moments, setMoments] = useState<SavedMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SavedMoment | null>(null)

  useEffect(() => {
    fetchBook()
  }, [])

  async function fetchBook() {
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
      .select('id, image_url, caption, created_at, users(username)')
      .eq('friendship_id', friendship.id)
      .is('expires_at', null)              // ← only permanent / saved moments
      .order('created_at', { ascending: false })

    setMoments((data as any[]) ?? [])
    setLoading(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    })
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (moments.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friendship Book</Text>
          <Text style={styles.headerSub}>Your permanent memories</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>
            Tap 🔖 on any moment to save it here forever
          </Text>
        </View>
      </View>
    )
  }

  // ── Grid ─────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friendship Book</Text>
        <Text style={styles.headerSub}>{moments.length} memories saved</Text>
      </View>

      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tile}
            onPress={() => setSelected(item)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.image_url }} style={styles.tileImage} />
            <View style={styles.tileFooter}>
              <Text style={styles.tileUser} numberOfLines={1}>
                {item.users?.username ?? 'Unknown'}
              </Text>
              <Text style={styles.tileDate}>{formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ── Lightbox modal ── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setSelected(null)} />

          <View style={styles.modalCard}>
            {selected && (
              <>
                <Image
                  source={{ uri: selected.image_url }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={styles.modalFooter}>
                  <View style={styles.modalMeta}>
                    <Text style={styles.modalUser}>
                      {selected.users?.username ?? 'Unknown'}
                    </Text>
                    <Text style={styles.modalDate}>
                      {formatDate(selected.created_at)}
                    </Text>
                  </View>
                  {selected.caption && (
                    <Text style={styles.modalCaption}>{selected.caption}</Text>
                  )}
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.gray50,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[12],
    paddingBottom:     spacing[4],
    backgroundColor:   colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
    gap:               spacing[1],
  },
  headerTitle: {
    fontSize:   font['2xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  headerSub: {
    fontSize: font.sm,
    color:    colors.gray400,
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
  grid: {
    padding: spacing[4],
    gap:     spacing[2],
  },
  row: {
    gap: spacing[2],
  },
  tile: {
    width:           TILE_SIZE,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    backgroundColor: colors.white,
    ...shadow.sm,
  },
  tileImage: {
    width:  TILE_SIZE,
    height: TILE_SIZE,
  },
  tileFooter: {
    padding: spacing[2],
    gap:     2,
  },
  tileUser: {
    fontSize:   font.xs,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  tileDate: {
    fontSize: font.xs,
    color:    colors.gray400,
  },

  // Lightbox
  modalOverlay: {
    flex:            1,
    backgroundColor: colors.overlay,
    alignItems:      'center',
    justifyContent:  'center',
  },
  modalDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width:           SCREEN_WIDTH - spacing[8],
    borderRadius:    radius.xl,
    overflow:        'hidden',
    backgroundColor: colors.white,
    ...shadow.lg,
  },
  modalImage: {
    width:  '100%',
    height: SCREEN_WIDTH - spacing[8],
  },
  modalFooter: {
    padding: spacing[4],
    gap:     spacing[2],
  },
  modalMeta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  modalUser: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  modalDate: {
    fontSize: font.xs,
    color:    colors.gray400,
  },
  modalCaption: {
    fontSize: font.base,
    color:    colors.gray700,
  },
  modalClose: {
    marginTop:       spacing[4],
    width:           44,
    height:          44,
    borderRadius:    radius.full,
    backgroundColor: colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    ...shadow.md,
  },
  modalCloseText: {
    fontSize:   font.md,
    color:      colors.gray700,
    fontWeight: font.bold,
  },
})