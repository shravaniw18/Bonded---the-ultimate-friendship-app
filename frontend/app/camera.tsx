// frontend/app/camera.tsx
// Camera screen using expo-camera, allowing users to capture a moment, add a caption, and post it to Supabase.

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
// @ts-ignore
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { Button } from '../components/Button';
// @ts-ignore
import { supabase } from '../../backend/lib/supabase';
// @ts-ignore
import { uploadMoment } from '../../backend/lib/moments';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.permissionText}>we need camera access to post moments 📸</Text>
        <Button
          label="grant permission"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) setPreview(photo.uri);
    } catch (error: any) {
      Alert.alert('oops', 'failed to capture photo 😭');
    }
  };

  const onPostMoment = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not logged in');

      // Get friendship id
      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .single();

      if (friendshipError || !friendship) throw new Error('no friendship found');

      await uploadMoment(
        preview,
        friendship.id,
        user.id,
        caption
      );

      // Send push notification to friend (placeholder for now)
      console.log('moment posted! 📸');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('error posting moment', error.message || 'something went wrong 😭');
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={() => setPreview(null)} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>✕ retake</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewImageBox}>
          <Text style={styles.previewPlaceholder}>📸 photo captured!</Text>
        </View>

        <View style={styles.previewFooter}>
          <TextInput
            style={styles.captionInput}
            placeholder="add a caption..."
            placeholderTextColor={theme.colors.text.secondary}
            value={caption}
            onChangeText={setCaption}
            maxLength={150}
          />
          <Button
            label="post moment ✨"
            onPress={onPostMoment}
            loading={loading}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.topBarBtn}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFacing((f: CameraType) => f === 'back' ? 'front' : 'back')}
            activeOpacity={0.7}
          >
            <Text style={styles.topBarBtn}>🔄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.captureBtn} onPress={takePicture} activeOpacity={0.85}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  permissionText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    textTransform: 'lowercase',
  },
  permissionButton: {
    width: '80%',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 10,
  },
  topBarBtn: {
    fontSize: 28,
    color: theme.colors.white,
  },
  bottomBar: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
  },
  previewHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    height: 50,
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
    textTransform: 'lowercase',
  },
  previewImageBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.radius.xl,
    marginHorizontal: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.white,
  },
  previewFooter: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  captionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
  },
});
