import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, font, spacing, radius } from '@/lib/theme'

type Props = {
  count: number
  size?: 'sm' | 'md'
}

export const StreakBadge = ({ count, size = 'md' }: Props) => {
  const isSmall = size === 'sm'

  return (
    <View style={[styles.badge, isSmall && styles.badgeSm]}>
      <Text style={[styles.flame, isSmall && styles.flameSm]}>🔥</Text>
      <Text style={[styles.count, isSmall && styles.countSm]}>{count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingVertical:   spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor:   colors.warningLight,
    borderRadius:      radius.full,
  },
  badgeSm: {
    paddingVertical:   2,
    paddingHorizontal: spacing[1],
  },
  flame: {
    fontSize: font.md,
  },
  flameSm: {
    fontSize: font.sm,
  },
  count: {
    fontSize:   font.md,
    fontWeight: font.bold,
    color:      colors.warningDark,
  },
  countSm: {
    fontSize: font.sm,
  },
})