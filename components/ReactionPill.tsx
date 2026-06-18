import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, spacing, radius, font } from '@/lib/theme'

type Props = {
  emoji:   string
  count:   number
  active:  boolean
  onPress: () => void
}

export const ReactionPill = ({ emoji, count, active, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      {count > 0 && (
        <Text style={[styles.count, active && styles.countActive]}>
          {count}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingVertical:   spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius:      radius.full,
    backgroundColor:   colors.gray100,
    borderWidth:       1,
    borderColor:       colors.gray200,
  },
  pillActive: {
    backgroundColor: colors.primaryLight,
    borderColor:     colors.primary,
  },
  emoji: {
    fontSize: font.sm,
  },
  count: {
    fontSize:   font.xs,
    fontWeight: font.medium,
    color:      colors.gray500,
  },
  countActive: {
    color: colors.primary,
  },
})