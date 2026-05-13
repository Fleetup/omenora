import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { tokens, gradient, radius, layout, elevation } from '../../design/tokens'

export interface CardProps {
  variant?: 'default' | 'raised' | 'premium' | 'glass'
  padding?: 'compact' | 'default' | 'premium'
  children: React.ReactNode
  style?: ViewStyle
}

const solidVariantMap = {
  default: {
    backgroundColor: tokens.surface.raised,
    borderColor:     tokens.border.subtle,
    borderWidth:     1,
  },
  raised: {
    backgroundColor: tokens.surface.overlay,
    borderColor:     tokens.border.default,
    borderWidth:     1,
  },
  premium: {
    backgroundColor: tokens.surface.raised,
    borderColor:     tokens.border.accent,
    borderWidth:     1,
  },
} as const

const paddingMap = {
  compact: layout.cardPaddingCompact,
  default: layout.cardPaddingDefault,
  premium: layout.cardPaddingPremium,
} as const

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'default',
  children,
  style,
}) => {
  const pad = paddingMap[padding]

  if (variant === 'glass') {
    return (
      <View style={[styles.glassShadow, style]}>
        <LinearGradient
          colors={gradient.cardGlass}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.glassBase, { padding: pad }]}
        >
          {children}
        </LinearGradient>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.base,
        solidVariantMap[variant],
        elevation.cardSubtle,
        { padding: pad },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
  glassShadow: {
    borderRadius:  radius.xl,
    ...elevation.cardShadow,
  },
  glassBase: {
    borderRadius: radius.xl,
    overflow:     'hidden',
  },
})
