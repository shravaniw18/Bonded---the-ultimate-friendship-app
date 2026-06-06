import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function RootLayout() {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      }
      setChecked(true)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
      }
    })
  }, [])

  if (!checked) return null

  return <Stack screenOptions={{ headerShown: false }} />
}