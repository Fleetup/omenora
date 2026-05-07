import React from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'
import { typeScale, text as textColors } from '../../design/tokens'

type TypeScaleKey = keyof typeof typeScale
type TextColorKey = keyof typeof textColors

export interface AppTextProps extends RNTextProps {
  variant?: TypeScaleKey
  color?: TextColorKey
}

export const Text: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...rest
}) => {
  const variantStyle = typeScale[variant]
  const resolvedColor = textColors[color]

  return (
    <RNText
      style={[variantStyle, { color: resolvedColor }, style]}
      {...rest}
    >
      {children}
    </RNText>
  )
}
