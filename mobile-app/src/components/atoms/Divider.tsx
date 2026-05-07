import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { tokens, layout } from '../../design/tokens'

export interface DividerProps {
  variant?: 'default' | 'gold'
  inset?: number
  style?: ViewStyle
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'default',
  inset = 0,
  style,
}) => {
  const isGold = variant === 'gold'

  return (
    <View
      style={[
        styles.base,
        isGold ? styles.gold : styles.default,
        inset > 0 && { marginHorizontal: inset },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    height:           1,
    width:            '100%',
    marginVertical:   layout.cardGap,
  },
  default: {
    backgroundColor: tokens.border.subtle,
  },
  gold: {
    backgroundColor: tokens.accent.primary,
    opacity:         0.4,
  },
})
