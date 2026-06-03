import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { colors, font, radius } from '@/lib/theme'

type Props = {
  imageUrl?: string
  name: string
  size?: number
}

export const Avatar = ({ imageUrl, name, size = 40 }: Props) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return imageUrl ? (
    <Image
      source={{ uri: imageUrl }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
    />
  ) : (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  initials: {
    color:      colors.primary,
    fontWeight: font.semibold,
  },
})