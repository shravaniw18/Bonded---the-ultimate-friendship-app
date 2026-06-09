import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'

// Controls how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
    shouldShowBanner: true,   // ← add
    shouldShowList:   true,   // ← add
  }),
})

// Request permission + save token to Supabase
export async function registerForPushNotifications() {
  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  const { data: token } = await Notifications.getExpoPushTokenAsync()

  // Android needs a channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:      'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  // Save token to the logged-in user's row
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', user.id)
  }

  return token
}

// Send a push to a single Expo token
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to:    expoPushToken,
      title,
      body,
      sound: 'default',
    }),
  })
}