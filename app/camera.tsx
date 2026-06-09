import { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'

import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { colors, font, spacing, radius } from '@/lib/theme'

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing]             = useState<CameraType>('back')
  const [preview, setPreview]           = useState<string | null>(null)
  const [caption, setCaption]           = useState('')
  const [uploading, setUploading]       = useState(false)
  const cameraRef                       = useRef<CameraView>(null)

  // ── no permission yet ────────────────────────
  if (!permission) {
    return <View style={styles.screen} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionText}>We need camera access to post moments</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── capture photo ────────────────────────────
  async function takePicture() {
    if (!cameraRef.current) return
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
    if (photo) setPreview(photo.uri)
  }

  // ── upload to supabase ───────────────────────
  async function postMoment() {
    if (!preview) return
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // get friendship id
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .single()

      if (!friendship) throw new Error('No friendship found')

      // upload photo
      const fileName  = `${user.id}-${Date.now()}.jpg`
      const response  = await fetch(preview)
      const blob      = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(fileName, blob, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      // get public url
      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(fileName)

      // insert moment row
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      await supabase.from('moments').insert({
        user_id:       user.id,
        friendship_id: friendship.id,
        image_url:     publicUrl,
        caption:       caption || null,
        expires_at:    expiresAt,
      })

      Alert.alert('Posted!', 'Your moment is live 📸')
      router.replace('/(tabs)')

    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setUploading(false)
    }
  }

  // ── preview screen ───────────────────────────
  if (preview) {
    return (
      <View style={styles.screen}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={() => setPreview(null)}>
            <Text style={styles.backBtn}>✕ Retake</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewImageBox}>
          <Text style={styles.previewPlaceholder}>📸 Photo captured!</Text>
        </View>

        <View style={styles.previewFooter}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption..."
            placeholderTextColor={colors.gray400}
            value={caption}
            onChangeText={setCaption}
            maxLength={150}
          />
          <TouchableOpacity
            style={[styles.postBtn, uploading && { opacity: 0.6 }]}
            onPress={postMoment}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.postBtnText}>Post Moment ✨</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── camera view ──────────────────────────────
  return (
    <View style={styles.screen}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.topBarBtn}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() =>
            setFacing(f => f === 'back' ? 'front' : 'back')
          }>
            <Text style={styles.topBarBtn}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* capture button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    padding:        spacing[5],
    paddingTop:     spacing[12],
  },
  topBarBtn: {
    fontSize: font.xl,
    color:    colors.white,
  },
  bottomBar: {
    position:       'absolute',
    bottom:         spacing[10],
    left:           0,
    right:          0,
    alignItems:     'center',
  },
  captureBtn: {
    width:           80,
    height:          80,
    borderRadius:    radius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     colors.white,
  },
  captureInner: {
    width:           60,
    height:          60,
    borderRadius:    radius.full,
    backgroundColor: colors.white,
  },
  permissionScreen: {
    flex:            1,
    backgroundColor: colors.gray50,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing[6],
    gap:             spacing[4],
  },
  permissionText: {
    fontSize:  font.md,
    color:     colors.gray700,
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    padding:         spacing[4],
    borderRadius:    radius.md,
  },
  permissionBtnText: {
    color:      colors.white,
    fontWeight: font.bold,
    fontSize:   font.md,
  },
  previewHeader: {
    padding:    spacing[5],
    paddingTop: spacing[12],
  },
  backBtn: {
    fontSize: font.md,
    color:    colors.white,
  },
  previewImageBox: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  previewPlaceholder: {
    fontSize: 48,
  },
  previewFooter: {
    padding: spacing[5],
    gap:     spacing[3],
  },
  captionInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color:           colors.white,
    padding:         spacing[4],
    borderRadius:    radius.md,
    fontSize:        font.base,
  },
  postBtn: {
    backgroundColor: colors.primary,
    padding:         spacing[4],
    borderRadius:    radius.md,
    alignItems:      'center',
  },
  postBtnText: {
    color:      colors.white,
    fontSize:   font.md,
    fontWeight: font.bold,
  },
})