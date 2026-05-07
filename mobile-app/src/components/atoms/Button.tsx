import React from 'react'
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import type { LucideIcon } from 'lucide-react-native'
import { tokens, space, layout, radius } from '../../design/tokens'
import { Text } from './Text'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'

export interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: LucideIcon
  style?: ViewStyle
}

const variantStyles = {
  primary: {
    container: { backgroundColor: tokens.accent.primary, borderWidth: 0 },
    label:     { color: tokens.text.inverse },
    indicator:  tokens.text.inverse,
  },
  secondary: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: tokens.border.default },
    label:     { color: tokens.text.primary },
    indicator:  tokens.text.primary,
  },
  tertiary: {
    container: { backgroundColor: 'transparent', borderWidth: 0 },
    label:     { color: tokens.accent.primary },
    indicator:  tokens.accent.primary,
  },
  danger: {
    container: { backgroundColor: tokens.state.danger, borderWidth: 0 },
    label:     { color: '#FFFFFF' },
    indicator:  '#FFFFFF',
  },
} as const

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const vs = variantStyles[variant]

  const handlePress = () => {
    if (disabled || loading) return
    if (variant === 'primary' || variant === 'secondary') {
      Haptics.selectionAsync()
    }
    onPress()
  }

  const IconComponent = icon

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        vs.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.indicator} />
      ) : (
        <View style={styles.inner}>
          {IconComponent != null && (
            <IconComponent size={16} color={vs.label.color} />
          )}
          <Text
            variant="label"
            style={vs.label}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical:   space['3'],
    paddingHorizontal: space['5'],
    minHeight:         layout.tapTarget,
    borderRadius:      radius.md,
    alignItems:        'center',
    justifyContent:    'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  inner: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           space['2'],
  },
})
