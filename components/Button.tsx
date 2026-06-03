import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { colors, font, spacing, radius } from '@/lib/theme'

type Props = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) => {
  const isPrimary = variant === 'primary'

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? colors.white : colors.primary}
        />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius:      radius.md,
    paddingVertical:   spacing[3],
    paddingHorizontal: spacing[5],
    alignItems:        'center',
    justifyContent:    'center',
    minHeight:         48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth:     1.5,
    borderColor:     colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize:   font.md,
    fontWeight: font.semibold,
  },
  labelPrimary: {
    color: colors.white,
  },
  labelSecondary: {
    color: colors.primary,
  },
})