import React from 'react'
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import type { LucideIcon } from 'lucide-react-native'
import {
  tokens,
  space,
  layout,
  radius,
  text,
  fontFamily,
} from '../../design/tokens'
import { Text } from './Text'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'premium'

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

// Internal component — not exported. 2-layer warm-tinted shadow stack wraps a
// Pressable with a 3-stop LinearGradient fill for maximum OLED luminance range.
const PremiumButtonShell: React.FC<{
  onPress:   () => void
  disabled:  boolean
  loading:   boolean
  fullWidth: boolean
  icon?:     LucideIcon
  label:     string
}> = ({ onPress, disabled, loading, fullWidth, icon, label }) => {
  const IconComponent = icon
  // Shadow-bearing outer View: NO borderRadius, NO overflow — these would clip the shadow on iOS.
  // Clipping (borderRadius + overflow:hidden) lives on the Pressable below, which is safe.
  return (
    <View style={[styles.premiumShadowOuter, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.premiumButton,
          (disabled || loading) && styles.disabled,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* Premium button gradient — intentional 3-stop for wider luminance range
            top: brighter than accent.emphasis (highlight)
            mid: accent.primary base
            bottom: deeper for bottom-edge contact suggestion
            Hard-coded because this is the premium variant's signature treatment;
            not generalizable to other variants. */}
        <LinearGradient
          colors={['#EBCC8C', '#C9A961', '#B8975A']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.premiumHighlight} />
        {loading ? (
          <ActivityIndicator size="small" color={text.inverse} />
        ) : (
          <View style={styles.premiumInner}>
            {IconComponent != null && (
              <IconComponent size={16} color={text.inverse} />
            )}
            <Text style={styles.premiumLabel}>{label}</Text>
          </View>
        )}
      </Pressable>
    </View>
  )
}

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
  const handlePress = () => {
    if (disabled || loading) return
    if (variant === 'primary' || variant === 'secondary' || variant === 'premium') {
      Haptics.selectionAsync()
    }
    onPress()
  }

  // Premium variant branches to its own multi-layer render path
  if (variant === 'premium') {
    return (
      <PremiumButtonShell
        onPress={handlePress}
        disabled={disabled}
        loading={loading}
        fullWidth={fullWidth}
        icon={icon}
        label={label}
      />
    )
  }

  const vs = variantStyles[variant]
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
  premiumShadowOuter: {
    // Black edge shadow — defines contact with surface. Warm glow is provided by
    // AtmosphericBackground buttonHalo layer rendered behind the button.
    // CRITICAL: no borderRadius, no overflow, no backgroundColor — these clip iOS shadows.
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius:  8,
    elevation:     6,
  },
  premiumButton: {
    // Clipping container — safe to have borderRadius + overflow here because
    // it is a child of premiumShadowOuter, not an ancestor that would clip it.
    paddingVertical:   space['4'],
    paddingHorizontal: space['6'],
    minHeight:         52,
    borderRadius:      radius.lg,
    overflow:          'hidden',
    alignItems:        'center',
    justifyContent:    'center',
    elevation:         6,
  },
  premiumHighlight: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    zIndex:          1,
  },
  premiumInner: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           space['2'],
    zIndex:        1,
  },
  premiumLabel: {
    fontFamily:    fontFamily.display,
    fontSize:      16,
    letterSpacing: 0.3,
    color:         text.inverse,
  },
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
