import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { tokens, radius, layout } from '../../design/tokens'

export interface CardProps {
  variant?: 'default' | 'raised' | 'premium'
  padding?: 'compact' | 'default' | 'premium'
  children: React.ReactNode
  style?: ViewStyle
}

const variantMap = {
  default: {
    backgroundColor: tokens.surface.raised,
    borderColor:     tokens.border.subtle,
  },
  raised: {
    backgroundColor: tokens.surface.overlay,
    borderColor:     tokens.border.default,
  },
  premium: {
    backgroundColor: tokens.surface.raised,
    borderColor:     tokens.border.accent,
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
  return (
    <View
      style={[
        styles.base,
        variantMap[variant],
        { padding: paddingMap[padding] },
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
    borderWidth:  1,
  },
})
