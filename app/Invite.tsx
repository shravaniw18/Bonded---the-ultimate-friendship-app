import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius } from '@/lib/theme'

export default function InviteScreen() {
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [myCode, setMyCode]     = useState<string | null>(null)
  const [tab, setTab]           = useState<'enter' | 'share'>('share')

  // load my invite code on mount
  useState(() => {
    async function loadMyCode() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('friendships')
        .select('invite_code')
        .eq('user_a', user.id)
        .single()

      if (data) setMyCode(data.invite_code)
    }
    loadMyCode()
  })

  async function joinWithCode() {
    if (!code.trim()) {
      Alert.alert('Enter a code', 'Please enter your friend\'s invite code')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // check code exists and user_b is null
      const { data: friendship, error: findError } = await supabase
        .from('friendships')
        .select('id, user_a')
        .eq('invite_code', code.trim().toUpperCase())
        .is('user_b', null)
        .single()

      if (findError || !friendship) throw new Error('Invalid code or already used')
      if (friendship.user_a === user.id) throw new Error("That's your own code!")

      // link user_b
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ user_b: user.id })
        .eq('invite_code', code.trim().toUpperCase())

      if (updateError) throw updateError

      Alert.alert('🎉 You\'re bonded!', 'You and your friend are now linked!', [
        { text: 'Let\'s go!', onPress: () => router.replace('/(tabs)') }
      ])

    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Bond Up 🔗</Text>
        <Text style={styles.subtitle}>Connect with your friend to get started</Text>
      </View>

      {/* tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'share' && styles.tabActive]}
          onPress={() => setTab('share')}
        >
          <Text style={[styles.tabText, tab === 'share' && styles.tabTextActive]}>
            My Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'enter' && styles.tabActive]}
          onPress={() => setTab('enter')}
        >
          <Text style={[styles.tabText, tab === 'enter' && styles.tabTextActive]}>
            Enter Code
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'share' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share this with your friend</Text>
          <Text style={styles.cardSub}>They enter this code to link up with you</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{myCode ?? '------'}</Text>
          </View>
          <Text style={styles.cardHint}>
            Once they enter your code, you'll both be bonded 🎉
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter your friend's code</Text>
          <Text style={styles.cardSub}>Ask them for their invite code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. A8B3KZ"
            placeholderTextColor={colors.gray400}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
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
      )}

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.gray50,
    padding:         spacing[5],
    paddingTop:      spacing[12],
  },
  header: {
    marginBottom: spacing[6],
    gap:          spacing[2],
  },
  title: {
    fontSize:   font['3xl'],
    fontWeight: font.bold,
    color:      colors.gray900,
  },
  subtitle: {
    fontSize: font.base,
    color:    colors.gray500,
  },
  tabs: {
    flexDirection:   'row',
    backgroundColor: colors.gray100,
    borderRadius:    radius.md,
    padding:         spacing[1],
    marginBottom:    spacing[4],
  },
  tabBtn: {
    flex:         1,
    padding:      spacing[2],
    alignItems:   'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray500,
  },
  tabTextActive: {
    color: colors.gray900,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing[5],
    gap:             spacing[4],
  },
  cardTitle: {
    fontSize:   font.lg,
    fontWeight: font.semibold,
    color:      colors.gray900,
  },
  cardSub: {
    fontSize: font.sm,
    color:    colors.gray500,
  },
  codeBox: {
    backgroundColor: colors.primaryLight,
    borderRadius:    radius.md,
    padding:         spacing[5],
    alignItems:      'center',
  },
  codeText: {
    fontSize:      font['3xl'],
    fontWeight:    font.bold,
    color:         colors.primary,
    letterSpacing: 8,
  },
  cardHint: {
    fontSize:  font.xs,
    color:     colors.gray400,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.gray100,
    color:           colors.gray900,
    padding:         spacing[4],
    borderRadius:    radius.md,
    fontSize:        font.xl,
    fontWeight:      font.bold,
    textAlign:       'center',
    letterSpacing:   8,
  },
  button: {
    backgroundColor: colors.primary,
    padding:         spacing[4],
    borderRadius:    radius.md,
    alignItems:      'center',
  },
  buttonText: {
    color:      colors.white,
    fontSize:   font.md,
    fontWeight: font.bold,
  },
  skipBtn: {
    alignItems: 'center',
    marginTop:  spacing[4],
  },
  skipText: {
    fontSize: font.sm,
    color:    colors.gray400,
  },
})