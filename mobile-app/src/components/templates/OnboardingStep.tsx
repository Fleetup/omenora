import React from 'react'
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { Text } from '../atoms'
import { ScreenWrapper } from './ScreenWrapper'
import { space, layout, tokens } from '../../design/tokens'

export interface OnboardingStepProps {
  onBack?: () => void
  progress?: React.ReactNode
  eyebrow?: string
  heading: string
  subheading?: string
  children: React.ReactNode
  footer?: React.ReactNode
  style?: ViewStyle
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  onBack,
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
      {onBack != null && (
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={12}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={tokens.text.secondary} />
        </Pressable>
      )}
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
      <Text variant="display2" color="primary" accessibilityRole="header">
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

const styles = StyleSheet.create({
  backButton: {
    alignSelf:      'flex-start',
    minWidth:       layout.tapTarget,
    minHeight:      layout.tapTarget,
    alignItems:     'flex-start',
    justifyContent: 'center',
    marginBottom:   space['2'],
  },
})
