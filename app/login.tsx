import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, spacing, radius } from '@/lib/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAuth() {
    setLoading(true)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { Alert.alert('Error', error.message); setLoading(false); return }

      const user = data.user
      if (user) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        await supabase.from('users').insert({ id: user.id, username })
        await supabase.from('friendships').insert({
          user_a: user.id,
          invite_code: code,
          status: 'pending',
        })
        Alert.alert('Account created!', `Your invite code is: ${code}\nShare it with your friend!`)
        router.replace('/(tabs)')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { Alert.alert('Error', error.message); setLoading(false); return }
      router.replace('/(tabs)')
    }

    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>bonded</Text>
      <Text style={styles.subtitle}>
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </Text>

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.gray400}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.gray400}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.gray400}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggle}>
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.gray50,
    justifyContent:  'center',
    padding:         spacing.lg,
  },
  title: {
    fontSize:     48,
    fontWeight:   'bold',
    color:        colors.primary,
    textAlign:    'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize:     16,
    color:        colors.gray500,
    textAlign:    'center',
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.gray100,
    color:           colors.gray900,
    padding:         spacing.md,
    borderRadius:    radius.md,
    marginBottom:    spacing.md,
    fontSize:        16,
  },
  button: {
    backgroundColor: colors.primary,
    padding:         spacing.md,
    borderRadius:    radius.md,
    alignItems:      'center',
    marginBottom:    spacing.md,
  },
  buttonText: {
    color:      colors.white,
    fontWeight: 'bold',
    fontSize:   16,
  },
  toggle: {
    color:     colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})