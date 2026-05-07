import React from 'react'
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import { tokens, space, layout, radius } from '../../design/tokens'
import { Text } from './Text'

type SelectionChipProps = {
  variant: 'selection'
  label: string
  selected: boolean
  onPress: () => void
  style?: ViewStyle
}

type LabelChipProps = {
  variant: 'label'
  label: string
  style?: ViewStyle
}

export type ChipProps = SelectionChipProps | LabelChipProps

export const Chip: React.FC<ChipProps> = (props) => {
  if (props.variant === 'selection') {
    const { label, selected, onPress, style } = props

    const handlePress = () => {
      Haptics.selectionAsync()
      onPress()
    }

    return (
      <Pressable
        onPress={handlePress}
        style={[
          styles.base,
          selected ? styles.selectionSelected : styles.selectionDefault,
          style,
        ]}
      >
        <Text
          variant="label"
          style={selected ? styles.selectionTextSelected : styles.selectionTextDefault}
        >
          {label}
        </Text>
      </Pressable>
    )
  }

  return (
    <View style={[styles.base, styles.labelChip, props.style]}>
      <Text variant="label" style={styles.labelText}>
        {props.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical:   space['2'],
    paddingHorizontal: space['3'],
    borderRadius:      radius.pill,
    alignItems:        'center',
    justifyContent:    'center',
  },
  selectionDefault: {
    minHeight:       layout.tapTarget,
    backgroundColor: tokens.surface.raised,
    borderWidth:     1,
    borderColor:     tokens.border.default,
  },
  selectionSelected: {
    minHeight:       layout.tapTarget,
    backgroundColor: tokens.accent.subtle,
    borderWidth:     1,
    borderColor:     tokens.border.accent,
  },
  selectionTextDefault: {
    color: tokens.text.secondary,
  },
  selectionTextSelected: {
    color: tokens.text.accent,
  },
  labelChip: {
    backgroundColor: tokens.surface.overlay,
  },
  labelText: {
    color: tokens.text.tertiary,
  },
})
