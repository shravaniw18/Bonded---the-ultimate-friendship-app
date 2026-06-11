import { supabase } from '@/lib/supabase'
import { sendPushNotification } from '@/lib/notifications'

export async function checkFriendOfMonth() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if we already sent one this month
    const { data: me } = await supabase
      .from('users')
      .select('last_fotm_notif, push_token')
      .eq('id', user.id)
      .single()

    if (me?.last_fotm_notif) {
      const lastSent = new Date(me.last_fotm_notif)
      const now      = new Date()
      const sameMonth =
        lastSent.getMonth()    === now.getMonth() &&
        lastSent.getFullYear() === now.getFullYear()
      if (sameMonth) return  // already sent this month
    }

    // Get all friendships
    const { data: friendships } = await supabase
      .from('friendships')
      .select('id, user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .not('user_b', 'is', null)

    if (!friendships?.length) return

    // Count moments per friendship this month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const counts = await Promise.all(
      friendships.map(async f => {
        const { count } = await supabase
          .from('moments')
          .select('id', { count: 'exact', head: true })
          .eq('friendship_id', f.id)
          .gte('created_at', monthStart.toISOString())

        const friendId = f.user_a === user.id ? f.user_b : f.user_a
        return { friendship_id: f.id, friendId, count: count ?? 0 }
      })
    )

    // Find the top friend
    const top = counts.sort((a, b) => b.count - a.count)[0]
    if (!top || top.count === 0) return  // no activity this month

    // Get top friend's username
    const { data: topUser } = await supabase
      .from('users')
      .select('username')
      .eq('id', top.friendId)
      .single()

    if (!topUser) return

    // Send notification to self
    if (me?.push_token) {
      await sendPushNotification(
        me.push_token,
        '🏆 Friend of the Month!',
        `@${topUser.username} — you shared ${top.count} moment${top.count === 1 ? '' : 's'} together this month!`,
      )
    }

    // Mark as sent
    await supabase
      .from('users')
      .update({ last_fotm_notif: new Date().toISOString() })
      .eq('id', user.id)

  } catch (e) {
    // fail silently — this is a background task
    console.log('FOTM check failed:', e)
  }
}