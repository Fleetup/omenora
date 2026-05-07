import React from 'react'
import { View, ViewStyle } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { Text, Button } from '../atoms'
import { tokens, space, layout } from '../../design/tokens'

const DefaultIllustration = () => (
  <Svg width={80} height={80} viewBox="0 0 80 80">
    <Circle
      cx={40}
      cy={40}
      r={36}
      stroke={tokens.accent.primary}
      strokeOpacity={0.3}
      strokeWidth={1}
      fill="none"
    />
    <Path
      d="M40 12 L70 60 L10 60 Z"
      stroke={tokens.accent.primary}
      strokeOpacity={0.4}
      strokeWidth={1}
      fill="none"
    />
  </Svg>
)

export interface EmptyStateProps {
  illustration?: React.ReactNode
  heading: string
  body?: string
  actionLabel?: string
  onActionPress?: () => void
  style?: ViewStyle
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  heading,
  body,
  actionLabel,
  onActionPress,
  style,
}) => {
  return (
    <View
      style={[
        { alignItems: 'center', justifyContent: 'center', padding: layout.screenPadding, flex: 1 },
        style,
      ]}
    >
      {illustration ?? <DefaultIllustration />}
      <Text variant="heading2" color="primary" style={{ marginTop: space['6'], textAlign: 'center' }}>
        {heading}
      </Text>
      {body != null && (
        <Text
          variant="body"
          color="secondary"
          style={{ marginTop: space['2'], textAlign: 'center', maxWidth: 320 }}
        >
          {body}
        </Text>
      )}
      {actionLabel != null && onActionPress != null && (
        <View style={{ marginTop: space['6'] }}>
          <Button label={actionLabel} variant="secondary" onPress={onActionPress} />
        </View>
      )}
    </View>
  )
}
