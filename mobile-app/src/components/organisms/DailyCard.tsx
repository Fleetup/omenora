import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Moon } from 'lucide-react-native'
import { Text, Icon, Divider } from '../atoms'
import { Card } from './Card'
import { space } from '../../design/tokens'

export interface DailyCardProps {
  title: string
  date: Date
  body: string
  moonPhase?: string
  style?: ViewStyle
}

export const DailyCard: React.FC<DailyCardProps> = ({
  title,
  date,
  body,
  moonPhase,
  style,
}) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })

  return (
    <Card variant="raised" padding="default" style={style}>
      <Text variant="micro" color="tertiary">
        {formattedDate}
      </Text>
      <Text variant="heading1" color="primary" style={{ marginTop: space['2'] }}>
        {title}
      </Text>
      <Divider variant="default" inset={0} />
      <Text variant="body" color="secondary" style={{ marginTop: space['1'] }}>
        {body}
      </Text>
      {moonPhase != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space['4'], gap: space['2'] }}>
          <Icon icon={Moon} size={16} color="accent" />
          <Text variant="caption" color="tertiary">
            {moonPhase}
          </Text>
        </View>
      )}
    </Card>
  )
}
