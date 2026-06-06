import { supabase } from './supabase'
import * as FileSystem from 'expo-file-system'

// Upload a photo to Supabase Storage and save to moments table
export async function uploadMoment(
  imageUri: string,
  friendshipId: string,
  userId: string,
  caption?: string
) {
  // Read the image as base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  // Create a unique filename
  const fileName = `${friendshipId}/${userId}/${Date.now()}.jpg`

  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('moments')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
    })

  if (storageError) throw storageError

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('moments')
    .getPublicUrl(fileName)

  const imageUrl = urlData.publicUrl

  // Set expiry to 24 hours from now
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  // Save to moments table
  const { data, error } = await supabase.from('moments').insert({
    friendship_id: friendshipId,
    user_id: userId,
    image_url: imageUrl,
    caption: caption || null,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw error
  return data
}

// Get all active moments for a friendship (not expired)
export async function getMoments(friendshipId: string) {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('friendship_id', friendshipId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Subscribe to real-time moments updates
export function subscribeMoments(
  friendshipId: string,
  onNewMoment: (moment: any) => void
) {
  return supabase
    .channel(`moments:${friendshipId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'moments',
        filter: `friendship_id=eq.${friendshipId}`,
      },
      (payload) => onNewMoment(payload.new)
    )
    .subscribe()
}

// Helper to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}