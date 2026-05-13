import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Text } from '../atoms'
import { Card } from './Card'
import { space, text } from '../../design/tokens'

export interface TransitCardProps {
  symbol: string
  title: string
  body: string
  timing?: string
  style?: ViewStyle
}

export const TransitCard: React.FC<TransitCardProps> = ({
  symbol,
  title,
  body,
  timing,
  style,
}) => {
  return (
    <Card variant="default" padding="compact" style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space['3'] }}>
        <Text
          variant="display2"
          style={{ lineHeight: 32, minWidth: 28, textAlign: 'center', color: text.disabled }}
        >
          {symbol}
        </Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space['2'] }}>
            <Text variant="label" color="primary" style={{ flex: 1 }}>
              {title}
            </Text>
            {timing != null && (
              <Text variant="caption" color="tertiary">
                {timing}
              </Text>
            )}
          </View>
          <Text variant="body" color="secondary" style={{ marginTop: space['1'] }}>
            {body}
          </Text>
        </View>
      </View>
    </Card>
  )
}
