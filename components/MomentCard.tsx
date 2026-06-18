import React, { useRef, useState, useEffect } from 'react'
import {
  View, Text, Image, StyleSheet,
  Animated, PanResponder, Pressable, Alert,
} from 'react-native'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'
import { supabase } from '@/lib/supabase'
import { ReactionPill } from './ReactionPill'

const SWIPE_THRESHOLD = 120
const SWIPE_OUT_DURATION = 200
const EMOJIS = ['❤️', '😂', '😮', '🔥', '😭', '🥹', '💀']

type Props = {
  id:        string
  imageUrl:  string
  caption?:  string
  timeAgo:   string
  username:  string
  onDismiss?: (id: string) => void
  onSaved?:   (id: string) => void
}

type ReactionCounts = Record<string, number>

export const MomentCard = ({
  id, imageUrl, caption, timeAgo, username, onDismiss, onSaved,
}: Props) => {
  const translateX = useRef(new Animated.Value(0)).current
  const opacity    = useRef(new Animated.Value(1)).current
  const [saving, setSaving]   = useState(false)
  const [counts, setCounts]   = useState<ReactionCounts>({})
  const [myReaction, setMyReaction] = useState<string | null>(null)
  const [myId, setMyId]       = useState<string | null>(null)

  useEffect(() => { loadReactions() }, [id])

  async function loadReactions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setMyId(user.id)

    const { data } = await supabase
      .from('reactions')
      .select('emoji, user_id')
      .eq('moment_id', id)

    const tally: ReactionCounts = {}
    let mine: string | null = null

    data?.forEach(r => {
      tally[r.emoji] = (tally[r.emoji] ?? 0) + 1
      if (user && r.user_id === user.id) mine = r.emoji
    })

    setCounts(tally)
    setMyReaction(mine)
  }

  async function handleReact(emoji: string) {
    if (!myId) return

    // Optimistic update
    const wasActive = myReaction === emoji
    const prevReaction = myReaction

    setCounts(prev => {
      const next = { ...prev }
      if (prevReaction) next[prevReaction] = Math.max(0, (next[prevReaction] ?? 1) - 1)
      if (!wasActive) next[emoji] = (next[emoji] ?? 0) + 1
      return next
    })
    setMyReaction(wasActive ? null : emoji)

    try {
      if (wasActive) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('moment_id', id)
          .eq('user_id', myId)
      } else {
        // Upsert — replaces existing reaction due to UNIQUE constraint
        await supabase
          .from('reactions')
          .upsert({ moment_id: id, user_id: myId, emoji }, { onConflict: 'moment_id,user_id' })
      }
    } catch (e) {
      // revert on failure
      loadReactions()
    }
  }

  // ── Swipe-to-dismiss ──────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dy) < 30,

      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx)
        opacity.setValue(1 - Math.abs(g.dx) / (SWIPE_THRESHOLD * 1.5))
      },

      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: g.dx > 0 ? 500 : -500,
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => onDismiss?.(id))
        } else {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start()
        }
      },
    })
  ).current

  // ── Save to Friendship Book ───────────────────────────────────────
  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('moments')
        .update({ expires_at: null })
        .eq('id', id)

      if (error) throw error
      onSaved?.(id)
      Alert.alert('Saved! 📖', 'Added to your Friendship Book.')
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save moment.')
    } finally {
      setSaving(false)
    }
  }

  const rotation = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-4deg', '0deg', '4deg'],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateX }, { rotate: rotation }], opacity },
      ]}
      {...panResponder.panHandlers}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.footer}>
        <View style={styles.meta}>
          <View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.time}>{timeAgo}</Text>
          </View>

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
            ]}
            accessibilityLabel="Save to Friendship Book"
          >
            <Text style={styles.saveIcon}>{saving ? '⏳' : '🔖'}</Text>
          </Pressable>
        </View>

        {caption && <Text style={styles.caption}>{caption}</Text>}

        <View style={styles.reactions}>
          {EMOJIS.map(emoji => (
            <ReactionPill
              key={emoji}
              emoji={emoji}
              count={counts[emoji] ?? 0}
              active={myReaction === emoji}
              onPress={() => handleReact(emoji)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius:    radius.lg,
    overflow:        'hidden',
    backgroundColor: colors.white,
    marginBottom:    spacing[4],
    ...shadow.md,
  },
  image: {
    width:      '100%',
    height:     300,
    resizeMode: 'cover',
  },
  footer: {
    padding: spacing[3],
    gap:     spacing[2],
  },
  meta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  username: {
    fontSize:   font.md,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  time: {
    fontSize:  font.xs,
    color:     colors.gray400,
    marginTop: 2,
  },
  caption: {
    fontSize: font.base,
    color:    colors.gray700,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
    marginTop:     spacing[1],
  },
  saveBtn: {
    padding:         spacing[2],
    borderRadius:    radius.full,
    backgroundColor: colors.gray50,
  },
  saveBtnPressed: {
    backgroundColor: colors.primaryLight,
  },
  saveIcon: {
    fontSize: font.lg,
  },
})