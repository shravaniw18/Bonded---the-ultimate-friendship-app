import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function RootLayout() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FF6B6B" />
      </View>
    )
  }

  return <Stack screenOptions={{ headerShown: false }} />
}