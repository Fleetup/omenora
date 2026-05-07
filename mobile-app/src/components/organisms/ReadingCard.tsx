import React from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text, Icon } from '../atoms'
import { Card } from './Card'
import { space } from '../../design/tokens'

export interface ReadingCardProps {
  title: string
  meta?: string
  body: string
  icon?: LucideIcon
  symbol?: string
  onPress?: () => void
  style?: ViewStyle
}

export const ReadingCard: React.FC<ReadingCardProps> = ({
  title,
  meta,
  body,
  icon,
  symbol,
  onPress,
  style,
}) => {
  const handlePress = () => {
    Haptics.selectionAsync()
    onPress?.()
  }

  const content = (
    <Card variant="default" padding="default" style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space['3'] }}>
        {icon != null ? (
          <Icon icon={icon} size={24} color="accent" />
        ) : symbol != null ? (
          <Text variant="display2" color="accent" style={{ lineHeight: 32 }}>
            {symbol}
          </Text>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text variant="heading2" color="primary">
            {title}
          </Text>
          {meta != null && (
            <Text variant="caption" color="tertiary" style={{ marginTop: space['0.5'] }}>
              {meta}
            </Text>
          )}
          <Text variant="body" color="secondary" style={{ marginTop: space['2'] }}>
            {body}
          </Text>
        </View>
      </View>
    </Card>
  )

  if (onPress != null) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {content}
      </Pressable>
    )
  }

  return content
}
