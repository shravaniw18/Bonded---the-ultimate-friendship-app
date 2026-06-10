// app/index.tsx
// Listens for auth state changes and redirects accordingly

import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors } from '@/lib/theme'

export default function Index() {
  useEffect(() => {
    // check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    })

    // listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    })

    // cleanup listener on unmount
    return () => subscription.unsubscribe()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  )
}