import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Text } from '../atoms'
import { tokens, space, radius } from '../../design/tokens'

export interface ChatBubbleProps {
  variant: 'user' | 'counsel' | 'system'
  message: string
  timestamp?: string
  style?: ViewStyle
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  variant,
  message,
  timestamp,
  style,
}) => {
  if (variant === 'system') {
    return (
      <View style={[styles.systemContainer, style]}>
        <Text variant="caption" color="tertiary" style={styles.systemText}>
          {message}
        </Text>
      </View>
    )
  }

  const isUser = variant === 'user'

  return (
    <View style={[isUser ? styles.userContainer : styles.counselContainer, style]}>
      <Text variant="body">
        {message}
      </Text>
      {timestamp != null && (
        <Text
          variant="micro"
          color="tertiary"
          style={isUser ? styles.userTimestamp : styles.counselTimestamp}
        >
          {timestamp}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  userContainer: {
    alignSelf:               'flex-end',
    maxWidth:                '80%',
    backgroundColor:         tokens.surface.overlay,
    borderRadius:            radius.lg,
    borderBottomRightRadius: radius.xs,
    paddingVertical:         space['3'],
    paddingHorizontal:       space['4'],
    marginVertical:          space['1'],
  },
  counselContainer: {
    alignSelf:              'flex-start',
    maxWidth:               '80%',
    backgroundColor:        tokens.accent.subtle,
    borderRadius:           radius.lg,
    borderBottomLeftRadius: radius.xs,
    paddingVertical:        space['3'],
    paddingHorizontal:      space['4'],
    marginVertical:         space['1'],
  },
  systemContainer: {
    alignSelf:      'center',
    maxWidth:       '85%',
    paddingVertical: space['2'],
    marginVertical:  space['1'],
  },
  systemText: {
    textAlign:  'center',
    fontStyle:  'italic',
  },
  userTimestamp: {
    marginTop: space['1'],
    textAlign: 'right',
  },
  counselTimestamp: {
    marginTop: space['1'],
    textAlign: 'left',
  },
})
