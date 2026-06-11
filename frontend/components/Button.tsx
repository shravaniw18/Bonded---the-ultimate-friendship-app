// frontend/components/Button.tsx
// Custom chunky button component styled with the design system tokens, supporting primary/secondary/ghost variants and loading/disabled states.

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../lib/theme';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  labelStyle,
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'ghost':
        return styles.ghostButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getLabelStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryLabel;
      case 'ghost':
        return styles.ghostLabel;
      case 'primary':
      default:
        return styles.primaryLabel;
    }
  };

  const isInteractionDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.baseButton, getButtonStyles(), isInteractionDisabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.baseLabel, getLabelStyles(), labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.muted,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  baseLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.black,
    textTransform: 'lowercase',
  },
  primaryLabel: {
    color: theme.colors.white,
  },
  secondaryLabel: {
    color: theme.colors.text.primary,
  },
  ghostLabel: {
    color: theme.colors.primary,
  },
});
