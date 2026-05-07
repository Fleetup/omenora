import React from 'react'
import { TextInput, type AppTextInputProps } from '../atoms'

const presetMap = {
  name: {
    autoCapitalize:  'words' as const,
    autoComplete:    'name' as const,
    textContentType: 'name' as const,
  },
  email: {
    keyboardType:    'email-address' as const,
    autoCapitalize:  'none' as const,
    autoComplete:    'email' as const,
    textContentType: 'emailAddress' as const,
    autoCorrect:     false,
  },
  phone: {
    keyboardType:    'phone-pad' as const,
    autoComplete:    'tel' as const,
    textContentType: 'telephoneNumber' as const,
  },
}

export interface TextFieldProps extends AppTextInputProps {
  required?: boolean
  type?: 'name' | 'email' | 'phone'
}

export const TextField: React.FC<TextFieldProps> = ({
  required = false,
  type,
  label,
  ...rest
}) => {
  const preset = type != null ? presetMap[type] : {}
  const resolvedLabel = required && label != null ? `${label} *` : label

  return (
    <TextInput
      label={resolvedLabel}
      {...preset}
      {...rest}
    />
  )
}
