import React from 'react'
import { Platform, View, ViewStyle } from 'react-native'
import { Text } from '../atoms'
import { ScreenWrapper } from './ScreenWrapper'
import { space } from '../../design/tokens'

export interface OnboardingStepProps {
  progress?: React.ReactNode
  eyebrow?: string
  heading: string
  subheading?: string
  children: React.ReactNode
  footer?: React.ReactNode
  style?: ViewStyle
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  progress,
  eyebrow,
  heading,
  subheading,
  children,
  footer,
  style,
}) => {
  return (
    <ScreenWrapper
      scroll
      padded
      keyboardBehavior={Platform.OS === 'ios' ? 'padding' : 'none'}
      style={style}
    >
      {progress != null && (
        <View style={{ marginBottom: space['6'] }}>
          {progress}
        </View>
      )}
      {eyebrow != null && (
        <Text variant="micro" color="accent" style={{ marginBottom: space['2'] }}>
          {eyebrow}
        </Text>
      )}
      <Text variant="display2" color="primary">
        {heading}
      </Text>
      {subheading != null && (
        <Text variant="bodyLarge" color="secondary" style={{ marginTop: space['3'] }}>
          {subheading}
        </Text>
      )}
      <View style={{ marginTop: space['8'], flex: 1 }}>
        {children}
      </View>
      {footer != null && (
        <View style={{ marginTop: space['6'] }}>
          {footer}
        </View>
      )}
    </ScreenWrapper>
  )
}
