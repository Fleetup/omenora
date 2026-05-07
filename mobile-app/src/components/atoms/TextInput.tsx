import React, { useState } from 'react'
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native'
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

  const borderColor = error != null
    ? tokens.state.danger
    : focused
    ? tokens.border.accent
    : tokens.border.default

  return (
    <View style={[styles.container, containerStyle]}>
      {label != null && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor={tokens.text.disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...inputProps}
      />
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
  input: {
    ...typeScale.bodyLarge,
    color:             tokens.text.primary,
    paddingVertical:   space['3'],
    paddingHorizontal: space['4'],
    backgroundColor:   tokens.surface.raised,
    borderRadius:      radius.md,
    borderWidth:       1,
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
