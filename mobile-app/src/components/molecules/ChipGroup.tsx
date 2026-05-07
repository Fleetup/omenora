import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Chip } from '../atoms'
import { space } from '../../design/tokens'

export interface ChipOption {
  id: string
  label: string
}

type SingleSelectProps = {
  mode: 'single'
  options: ChipOption[]
  value: string | null
  onChange: (value: string | null) => void
  allowDeselect?: boolean
  style?: ViewStyle
}

type MultiSelectProps = {
  mode: 'multi'
  options: ChipOption[]
  value: string[]
  onChange: (value: string[]) => void
  style?: ViewStyle
}

export type ChipGroupProps = SingleSelectProps | MultiSelectProps

export const ChipGroup: React.FC<ChipGroupProps> = (props) => {
  const { options, style } = props

  const handlePress = (optionId: string) => {
    if (props.mode === 'single') {
      const allowDeselect = props.allowDeselect ?? false
      if (props.value === optionId) {
        if (allowDeselect) props.onChange(null)
      } else {
        props.onChange(optionId)
      }
    } else {
      const current = props.value
      if (current.includes(optionId)) {
        props.onChange(current.filter(id => id !== optionId))
      } else {
        props.onChange([...current, optionId])
      }
    }
  }

  const isSelected = (optionId: string): boolean => {
    if (props.mode === 'single') return props.value === optionId
    return props.value.includes(optionId)
  }

  return (
    <View style={[styles.container, style]}>
      {options.map(option => (
        <Chip
          key={option.id}
          variant="selection"
          label={option.label}
          selected={isSelected(option.id)}
          onPress={() => handlePress(option.id)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           space['2'],
  },
})
