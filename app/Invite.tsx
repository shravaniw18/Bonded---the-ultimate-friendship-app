// app/invite.tsx
// ─────────────────────────────────────────────
// Friend Invite Flow
// Two screens in one:
//   1. Generate your invite code + share it
//   2. Enter a friend's code to join their friendship
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { colors, font, spacing, radius, shadow } from '@/lib/theme'

// ─── helpers ──────────────────────────────────

/** Generate a random 6-character uppercase invite code */
const generateCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ─── main component ───────────────────────────

export default function InviteScreen() {
  const [tab, setTab]                 = useState<'share' | 'join'>('share')
  const [myCode, setMyCode]           = useState<string>('')
  const [joinCode, setJoinCode]       = useState<string>('')
  const [loadingCode, setLoadingCode] = useState(true)
  const [joining, setJoining]         = useState(false)
  const [error, setError]             = useState('')

  // ── on mount: fetch or create the user's invite code ──
  useEffect(() => {
    initMyCode()
  }, [])

  const initMyCode = async () => {
    setLoadingCode(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // check if user already has a friendship (as user_a)
      const { data: existing } = await supabase
        .from('friendships')
        .select('invite_code')
        .eq('user_a', user.id)
        .is('user_b', null)   // pending — no friend joined yet
        .single()

      if (existing) {
        setMyCode(existing.invite_code)
      } else {
        // create a new pending friendship row with a fresh code
        const code = generateCode()
        await supabase.from('friendships').insert({
          user_a:      user.id,
          invite_code: code,
        })
        setMyCode(code)
      }
    } catch (e) {
      console.error('initMyCode error:', e)
    } finally {
      setLoadingCode(false)
    }
  }

  // ── share the code via native share sheet ──
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Bonded 🔗\nUse my invite code: ${myCode}`,
      })
    } catch (e) {
      console.error('Share error:', e)
    }
  }

  // ── join using a friend's code ──
  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 6) {
      setError('Enter a valid 6-character code')
      return
    }
    setError('')
    setJoining(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // find the friendship row with this invite code
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('invite_code', code)
        .is('user_b', null)   // must still be pending
        .single()

      if (fetchError || !friendship) {
        setError('Code not found or already used. Double-check with your friend.')
        setJoining(false)
        return
      }

      if (friendship.user_a === user.id) {
        setError("That's your own code! Share it with a friend.")
        setJoining(false)
        return
      }

      // claim the friendship — set user_b to current user
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ user_b: user.id })
        .eq('id', friendship.id)

      if (updateError) {
        setError('Something went wrong. Try again.')
        setJoining(false)
        return
      }

      // success — go to home
      Alert.alert("You're bonded! 🎉", "Your friendship is now active.", [
        { text: 'Let's go', onPress: () => router.replace('/') }
      ])
    } catch (e) {
      console.error('handleJoin error:', e)
      setError('Something went wrong. Try again.')
    } finally {
      setJoining(false)
    }
  }

  // ─── render ─────────────────────────────────

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* header */}
      <Text style={styles.heading}>Add a friend</Text>
      <Text style={styles.subheading}>
        Share your code or enter theirs — one of you goes first.
      </Text>

      {/* tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'share' && styles.tabActive]}
          onPress={() => setTab('share')}
        >
          <Text style={[styles.tabText, tab === 'share' && styles.tabTextActive]}>
            Share my code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'join' && styles.tabActive]}
          onPress={() => setTab('join')}
        >
          <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
            Enter a code
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB 1: share my code ── */}
      {tab === 'share' && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your invite code</Text>

          {loadingCode ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing[5] }} />
          ) : (
            <>
              <View style={styles.codeBox}>
                {myCode.split('').map((char, i) => (
                  <View key={i} style={styles.codeChar}>
                    <Text style={styles.codeCharText}>{char}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.codeHint}>
                Send this to your friend. It expires once someone uses it.
              </Text>
              <Button label="Share code" onPress={handleShare} style={{ marginTop: spacing[3] }} />
              <Button
                label="Regenerate"
                onPress={initMyCode}
                variant="secondary"
                style={{ marginTop: spacing[2] }}
              />
            </>
          )}
        </View>
      )}

      {/* ── TAB 2: enter a code ── */}
      {tab === 'join' && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Enter your friend's code</Text>
          <Input
            placeholder="e.g. A3BX9K"
            value={joinCode}
            onChangeText={(t) => {
              setJoinCode(t.toUpperCase())
              setError('')
            }}
            autoCapitalize="characters"
            error={error}
            style={{ marginTop: spacing[2] }}
          />
          <Button
            label="Join friendship"
            onPress={handleJoin}
            loading={joining}
            style={{ marginTop: spacing[2] }}
          />
        </View>
      )}

      {/* back link */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

// ─── styles ───────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  container: {
    padding:    spacing[5],
    paddingTop: spacing[10],
  },
  heading: {
    fontSize:   font['3xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
    marginBottom: spacing[1],
  },
  subheading: {
    fontSize:   font.base,
    color:      colors.gray500,
    lineHeight: font.normal * font.base,
    marginBottom: spacing[5],
  },

  // tabs
  tabRow: {
    flexDirection:   'row',
    backgroundColor: colors.gray100,
    borderRadius:    radius.md,
    padding:         3,
    marginBottom:    spacing[5],
  },
  tab: {
    flex:          1,
    paddingVertical: spacing[2],
    alignItems:    'center',
    borderRadius:  radius.md - 2,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadow.sm,
  },
  tabText: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray400,
  },
  tabTextActive: {
    color: colors.gray900,
  },

  // card
  card: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing[5],
    ...shadow.sm,
  },
  cardLabel: {
    fontSize:     font.sm,
    fontWeight:   font.semibold,
    color:        colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[3],
  },

  // code display
  codeBox: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            spacing[2],
    marginBottom:   spacing[3],
  },
  codeChar: {
    width:           44,
    height:          56,
    backgroundColor: colors.primaryLight,
    borderRadius:    radius.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  codeCharText: {
    fontSize:   font['2xl'],
    fontWeight: font.bold,
    color:      colors.primary,
  },
  codeHint: {
    fontSize:  font.sm,
    color:     colors.gray400,
    textAlign: 'center',
  },

  // back
  backLink: {
    marginTop:  spacing[6],
    alignItems: 'center',
  },
  backText: {
    fontSize: font.base,
    color:    colors.gray400,
  },
})