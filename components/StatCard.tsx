import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, font, spacing, radius } from '@/lib/theme'
//hello
type Props = {
  current: number
  goal: number
  label?: string
  color?: string
}

export const ProgressBar = ({ current, goal, label, color = colors.primary }: Props) => {
  const percent = Math.min((current / goal) * 100, 100)

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.values}>{current} / {goal}</Text>
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  labelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  label: {
    fontSize:   font.sm,
    fontWeight: font.medium,
    color:      colors.gray700,
  },
  values: {
    fontSize: font.xs,
    color:    colors.gray400,
  },
  track: {
    height:          8,
    borderRadius:    radius.full,
    backgroundColor: colors.gray200,
    overflow:        'hidden',
  },
  fill: {
    height:       '100%',
    borderRadius: radius.full,
  },
})