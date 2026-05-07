import React, { useState } from 'react'
import { Modal, Platform, Pressable, Switch, View, StyleSheet, ViewStyle } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Clock } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text, Button } from '../atoms'
import { tokens, space, layout, radius } from '../../design/tokens'

export interface TimeFieldProps {
  label: string
  value: Date | null
  onChange: (time: Date | null) => void
  showUnknownToggle?: boolean
  unknownToggleLabel?: string
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  style?: ViewStyle
}

export const TimeField: React.FC<TimeFieldProps> = ({
  label,
  value,
  onChange,
  showUnknownToggle = false,
  unknownToggleLabel = "I don't know my birth time",
  placeholder = 'Select time',
  error,
  hint,
  required = false,
  style,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [tempValue, setTempValue] = useState<Date>(value ?? new Date())
  const [unknownEnabled, setUnknownEnabled] = useState(showUnknownToggle && value === null)

  const resolvedLabel = required ? `${label} *` : label
  const borderColor = error != null ? tokens.state.danger : tokens.border.default

  const handleTap = () => {
    if (unknownEnabled) return
    Haptics.selectionAsync()

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'time',
        value: value ?? new Date(),
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

  const handleToggle = (enabled: boolean) => {
    Haptics.selectionAsync()
    setUnknownEnabled(enabled)
    if (enabled) {
      onChange(null)
    }
  }

  const formattedValue = value != null
    ? value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null

  return (
    <View style={style}>
      <Text variant="label" style={styles.label}>
        {resolvedLabel}
      </Text>
      <Pressable
        onPress={handleTap}
        style={[styles.field, { borderColor }, unknownEnabled && styles.fieldDisabled]}
      >
        {unknownEnabled ? (
          <Text variant="bodyLarge" style={styles.unknownText}>
            Unknown
          </Text>
        ) : (
          <Text
            variant="bodyLarge"
            style={[styles.displayText, { color: formattedValue != null ? tokens.text.primary : tokens.text.disabled }]}
          >
            {formattedValue ?? placeholder}
          </Text>
        )}
        <Clock size={20} color={tokens.text.secondary} />
      </Pressable>

      {showUnknownToggle && (
        <View style={styles.toggleRow}>
          <Switch
            value={unknownEnabled}
            onValueChange={handleToggle}
            trackColor={{ true: tokens.accent.primary, false: tokens.border.default }}
            thumbColor="#FFFFFF"
          />
          <Text variant="body" style={styles.toggleLabel}>
            {unknownToggleLabel}
          </Text>
        </View>
      )}

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
              mode="time"
              display="spinner"
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
  fieldDisabled: {
    opacity: 0.5,
  },
  displayText: {
    flex: 1,
  },
  unknownText: {
    flex:      1,
    color:     tokens.text.tertiary,
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           space['3'],
    marginTop:     space['2'],
  },
  toggleLabel: {
    flex:  1,
    color: tokens.text.secondary,
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
