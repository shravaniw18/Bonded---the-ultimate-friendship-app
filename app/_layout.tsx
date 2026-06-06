import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors } from '@/lib/theme'

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(true)
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
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

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {!ready && (
        <View style={{
          position:        'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: colors.gray50,
          justifyContent:  'center',
          alignItems:      'center',
        }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  )
}