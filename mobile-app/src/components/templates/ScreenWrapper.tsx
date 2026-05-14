import React from 'react'
import { KeyboardAvoidingView, ScrollView, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AtmosphericBackground } from '../atmosphere'
import { tokens, layout } from '../../design/tokens'

export interface ScreenWrapperProps {
  children: React.ReactNode
  scroll?: boolean
  padded?: boolean
  background?: 'base' | 'transparent'
  keyboardBehavior?: 'padding' | 'height' | 'none'
  contentContainerStyle?: ViewStyle
  style?: ViewStyle
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scroll = true,
  padded = true,
  background: _background = 'transparent',
  keyboardBehavior = 'none',
  contentContainerStyle,
  style,
}) => {
  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor: tokens.surface.base,
  }

  const safeStyle: ViewStyle = { flex: 1 }

  const paddingStyle: ViewStyle = padded ? { paddingHorizontal: layout.screenPadding } : {}

  const inner = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[paddingStyle, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, paddingStyle]}>{children}</View>
  )

  return (
    <View style={[rootStyle, style]}>
      <AtmosphericBackground variant="standard" />
      <SafeAreaView edges={['top', 'bottom']} style={safeStyle}>
        {keyboardBehavior !== 'none' ? (
          <KeyboardAvoidingView
            behavior={keyboardBehavior as 'padding' | 'height'}
            style={{ flex: 1 }}
          >
            {inner}
          </KeyboardAvoidingView>
        ) : inner}
      </SafeAreaView>
    </View>
  )
}
