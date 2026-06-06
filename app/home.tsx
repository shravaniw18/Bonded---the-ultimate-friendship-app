import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, spacing, radius } from '@/lib/theme'

export default function HomeScreen() {
  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 You're in!</Text>
      <Text style={styles.sub}>Home screen coming soon...</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.gray50,
    justifyContent:  'center',
    alignItems:      'center',
  },
  text: {
    fontSize:     32,
    color:        colors.gray900,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize:     16,
    color:        colors.gray500,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor:  colors.danger,
    padding:          spacing.md,
    borderRadius:     radius.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color:      colors.white,
    fontWeight: 'bold',
  },
})