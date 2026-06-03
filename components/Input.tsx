import React, { useState } from 'react'
import {
  TextInput,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { colors, font, spacing, radius } from '@/lib/theme'

type Props = {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  label?: string
  error?: string
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address' | 'numeric'
  style?: ViewStyle
}

export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  label,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  style,
}: Props) => {
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(secureTextEntry)

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputRow,
        focused && styles.inputFocused,
        !!error && styles.inputError,
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {/* show/hide toggle for password fields */}
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} style={styles.toggle}>
            <Text style={styles.toggleText}>{hidden ? 'show' : 'hide'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[3],
  },
  label: {
    fontSize:     font.sm,
    fontWeight:   font.medium,
    color:        colors.gray700,
    marginBottom: spacing[1],
  },
  inputRow: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     colors.gray200,
    borderRadius:    radius.md,
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing[3],
    minHeight:       48,
  },
  inputFocused: {
    borderColor:     colors.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex:      1,
    fontSize:  font.base,
    color:     colors.gray900,
    paddingVertical: spacing[3],
  },
  toggle: {
    paddingLeft: spacing[2],
    paddingVertical: spacing[2],
  },
  toggleText: {
    fontSize:  font.sm,
    color:     colors.primary,
    fontWeight: font.medium,
  },
  errorText: {
    fontSize:   font.xs,
    color:      colors.danger,
    marginTop:  spacing[1],
  },
})