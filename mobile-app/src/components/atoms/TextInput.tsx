import React, { useState } from 'react'
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { tokens, typeScale, space, radius } from '../../design/tokens'
import { Text } from './Text'

export interface AppTextInputProps extends RNTextInputProps {
  label?: string
  error?: string
  hint?: string
  containerStyle?: ViewStyle
}

export const TextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...inputProps
}) => {
  const [focused, setFocused] = useState(false)

  const handleFocus = (e: Parameters<NonNullable<RNTextInputProps['onFocus']>>[0]) => {
    setFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: Parameters<NonNullable<RNTextInputProps['onBlur']>>[0]) => {
    setFocused(false)
    onBlur?.(e)
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label != null && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <BlurView
        intensity={20}
        tint="dark"
        style={[
          styles.inputShell,
          focused && styles.inputShellFocused,
          error != null && styles.inputShellError,
        ]}
      >
        <View style={styles.inputTint} />
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={tokens.text.disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />
      </BlurView>
      {error != null ? (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      ) : hint != null ? (
        <Text variant="caption" style={styles.hintText}>
          {hint}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color:        tokens.text.secondary,
    marginBottom: space['1'],
  },
  inputShell: {
    borderRadius: radius.md,
    overflow:     'hidden',
    borderWidth:  1,
    borderColor:  'transparent',
  },
  inputShellFocused: {
    borderColor: tokens.border.accent,
  },
  inputShellError: {
    borderColor: tokens.state.danger,
  },
  inputTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.specialty.glassTint,
  },
  input: {
    fontFamily:        typeScale.bodyLarge.fontFamily,
    fontSize:          typeScale.bodyLarge.fontSize,
    letterSpacing:     typeScale.bodyLarge.letterSpacing,
    color:             tokens.text.primary,
    paddingVertical:   space['3'],
    paddingHorizontal: space['4'],
    minHeight:         48,
    backgroundColor:   'transparent',
  },
  errorText: {
    color:     tokens.state.danger,
    marginTop: space['1'],
  },
  hintText: {
    color:     tokens.text.tertiary,
    marginTop: space['1'],
  },
})
