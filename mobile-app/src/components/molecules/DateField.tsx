import React, { useState } from 'react'
import { Modal, Platform, Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Calendar } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text, Button } from '../atoms'
import { tokens, space, layout, radius } from '../../design/tokens'

export interface DateFieldProps {
  label: string
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  minimumDate?: Date
  maximumDate?: Date
  error?: string
  hint?: string
  required?: boolean
  style?: ViewStyle
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  error,
  hint,
  required = false,
  style,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [tempValue, setTempValue] = useState<Date>(value ?? new Date())

  const resolvedLabel = required ? `${label} *` : label
  const borderColor = error != null ? tokens.state.danger : tokens.border.default

  const handleTap = () => {
    Haptics.selectionAsync()

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: value ?? new Date(),
        minimumDate,
        maximumDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date != null) {
            onChange(date)
          }
        },
      })
    } else {
      setTempValue(value ?? new Date())
      setShowModal(true)
    }
  }

  const handleDone = () => {
    onChange(tempValue)
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  const formattedValue = value != null
    ? value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <View style={style}>
      <Text variant="label" style={styles.label}>
        {resolvedLabel}
      </Text>
      <Pressable
        onPress={handleTap}
        style={[styles.field, { borderColor }]}
      >
        <Text
          variant="bodyLarge"
          style={[styles.displayText, { color: formattedValue != null ? tokens.text.primary : tokens.text.disabled }]}
        >
          {formattedValue ?? placeholder}
        </Text>
        <Calendar size={20} color={tokens.text.secondary} />
      </Pressable>
      {error != null ? (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      ) : hint != null ? (
        <Text variant="caption" style={styles.hintText}>
          {hint}
        </Text>
      ) : null}

      {Platform.OS !== 'android' && (
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={false}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Button variant="tertiary" label="Cancel" onPress={handleCancel} />
              <Button variant="tertiary" label="Done" onPress={handleDone} />
            </View>
            <DateTimePicker
              value={tempValue}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={(_event: DateTimePickerEvent, date?: Date) => {
                if (date != null) setTempValue(date)
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    color:        tokens.text.secondary,
    marginBottom: space['1'],
  },
  field: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   space['3'],
    paddingHorizontal: space['4'],
    backgroundColor:   tokens.surface.raised,
    borderRadius:      radius.md,
    borderWidth:       1,
    minHeight:         layout.tapTarget,
  },
  displayText: {
    flex: 1,
  },
  errorText: {
    color:     tokens.state.danger,
    marginTop: space['1'],
  },
  hintText: {
    color:     tokens.text.tertiary,
    marginTop: space['1'],
  },
  modalContainer: {
    flex:            1,
    backgroundColor: tokens.surface.raised,
    padding:         layout.screenPadding,
  },
  modalHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   space['4'],
  },
})
