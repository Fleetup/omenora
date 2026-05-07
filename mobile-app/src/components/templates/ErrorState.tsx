import React from 'react'
import { View, ViewStyle } from 'react-native'
import { AlertCircle } from 'lucide-react-native'
import { Text, Button } from '../atoms'
import { tokens, space, layout } from '../../design/tokens'

export interface ErrorStateProps {
  illustration?: React.ReactNode
  heading?: string
  body?: string
  actionLabel?: string
  onActionPress?: () => void
  style?: ViewStyle
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  illustration,
  heading = 'Something went wrong',
  body,
  actionLabel = 'Try again',
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
      {illustration ?? (
        <AlertCircle size={64} color={tokens.state.danger} strokeWidth={1.5} />
      )}
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
          <Button label={actionLabel} variant="primary" onPress={onActionPress} />
        </View>
      )}
    </View>
  )
}
