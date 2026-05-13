import React, { useState } from 'react'
import { Modal, Platform, Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Calendar } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text, Button } from '../atoms'
import { tokens, space, layout, radius } from '../../design/tokens'

export interface DateFieldProps {
  label?: string
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

  const resolvedLabel = label != null ? (required ? `${label} *` : label) : undefined

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
      {resolvedLabel != null && (
        <Text variant="label" style={styles.label}>
          {resolvedLabel}
        </Text>
      )}
      <Pressable onPress={handleTap}>
        <BlurView intensity={20} tint="dark" style={[
          styles.field,
          error != null && styles.fieldError,
        ]}>
          <View style={styles.fieldTint} />
          <Text
            variant="bodyLarge"
            style={[styles.displayText, { color: formattedValue != null ? tokens.text.primary : tokens.text.disabled }]}
          >
            {formattedValue ?? placeholder}
          </Text>
          <Calendar size={20} color={tokens.text.secondary} />
        </BlurView>
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
          animationType="fade"
          transparent={true}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalBackdrop}>
            <BlurView intensity={24} tint="dark" style={styles.modalCard}>
              <View style={styles.modalTint} />
              <View style={styles.modalHeader}>
                <Button variant="tertiary" label="Cancel" onPress={handleCancel} />
                <Button variant="tertiary" label="Done" onPress={handleDone} />
              </View>
              <DateTimePicker
                value={tempValue}
                mode="date"
                display="spinner"
                themeVariant="dark"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
                onChange={(_event: DateTimePickerEvent, date?: Date) => {
                  if (date != null) setTempValue(date)
                }}
              />
            </BlurView>
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
    borderRadius:      radius.md,
    overflow:          'hidden',
    borderWidth:       1,
    borderColor:       'transparent',
    minHeight:         layout.tapTarget,
  },
  fieldError: {
    borderColor: tokens.state.danger,
  },
  fieldTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.specialty.glassTint,
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
  modalBackdrop: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: tokens.specialty.overlayScrim,
  },
  modalCard: {
    width:             '85%',
    borderRadius:      24,
    overflow:          'hidden',
    paddingVertical:   space['4'],
    paddingHorizontal: space['2'],
    borderWidth:       1,
    borderColor:       tokens.border.subtle,
  },
  modalTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.specialty.glassTint,
  },
  picker: {
    backgroundColor: 'transparent',
  },
  modalHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   space['4'],
  },
})
