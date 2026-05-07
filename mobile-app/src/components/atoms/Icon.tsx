import React from 'react'
import { View, ViewStyle } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { text as textColors, accent as accentColors } from '../../design/tokens'

type TextColorKey  = keyof typeof textColors
type AccentColorKey = keyof typeof accentColors

export interface IconProps {
  icon: LucideIcon
  size?: number
  color?: TextColorKey | AccentColorKey
  style?: ViewStyle
}

function resolveColor(color: TextColorKey | AccentColorKey): string {
  if (color in textColors) return textColors[color as TextColorKey]
  return accentColors[color as AccentColorKey]
}

export const Icon: React.FC<IconProps> = ({
  icon,
  size = 20,
  color = 'secondary',
  style,
}) => {
  const ResolvedIcon = icon
  const resolvedColor = resolveColor(color)

  return (
    <View style={style}>
      <ResolvedIcon size={size} color={resolvedColor} />
    </View>
  )
}
