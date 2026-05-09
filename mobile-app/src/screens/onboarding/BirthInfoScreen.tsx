import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MapPin } from 'lucide-react-native'
import { OnboardingStep } from '../../components/templates'
import { Button, Text } from '../../components/atoms'
import { TextField, DateField } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { tokens, space } from '../../design/tokens'
import { RootStackParamList } from '../../navigation/types'

type BirthInfoNavProp = NativeStackNavigationProp<RootStackParamList, 'BirthInfo'>

const dateStringToDate = (s: string): Date | null => {
  if (!s) return null
  const d = new Date(`${s}T00:00:00`)
  return isNaN(d.getTime()) ? null : d
}

const dateToISO = (d: Date | null): string => {
  if (!d) return ''
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export default function BirthInfoScreen() {
  const navigation = useNavigation<BirthInfoNavProp>()

  const firstName    = useProfileStore((s) => s.firstName)
  const dateOfBirth  = useProfileStore((s) => s.dateOfBirth)
  const timeOfBirth  = useProfileStore((s) => s.timeOfBirth)
  const city         = useProfileStore((s) => s.city)
  const setFirstName = useProfileStore((s) => s.setFirstName)
  const setDateOfBirth = useProfileStore((s) => s.setDateOfBirth)

  const canContinue = firstName.trim().length > 0 && dateOfBirth.length > 0 && city.length > 0

  const progressAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue:         1,
      duration:        500,
      useNativeDriver: false,
    }).start()
  }, [])

  const stepProgress = (
    <View style={styles.stepTrack}>
      <Animated.View
        style={[
          styles.stepFill,
          {
            width: progressAnim.interpolate({
              inputRange:  [0, 1],
              outputRange: ['0%', `${Math.round((1 / 7) * 100)}%`],
            }),
          },
        ]}
      />
    </View>
  )

  return (
    <OnboardingStep
      onBack={() => navigation.goBack()}
      progress={stepProgress}
      heading="When and where were you born?"
      subheading="Your name, birth date, and birthplace shape your reading"
      footer={
        <Button
          label="Continue"
          variant="primary"
          fullWidth
          disabled={!canContinue}
          onPress={() => {
            // Calculating screen lands in this same cluster — wired in Step F
            navigation.navigate('Calculating')
          }}
        />
      }
    >
      <View style={styles.fields}>
        <TextField
          label="First name"
          type="name"
          required
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Your first name"
        />

        <DateField
          label="Date of birth"
          required
          value={dateStringToDate(dateOfBirth)}
          onChange={(date) => setDateOfBirth(dateToISO(date))}
          maximumDate={new Date()}
          style={styles.field}
        />

        <Pressable
          onPress={() => navigation.navigate('BirthTimeLocation')}
          accessibilityRole="button"
          accessibilityLabel="Set birth time and location"
          accessibilityHint={city.length > 0 ? 'City confirmed. Tap to change.' : 'City is required to continue'}
          style={styles.locationRow}
        >
          <MapPin size={18} color={tokens.accent.primary} />
          <Text variant="body" color="accent" style={styles.locationLabel}>
            Set birth time & location
          </Text>
        </Pressable>

        {city.length === 0 && (
          <Text variant="caption" color="tertiary" style={styles.caption}>
            Location is required
          </Text>
        )}
        {timeOfBirth.length > 0 && city.length > 0 && (
          <Text variant="caption" color="secondary" style={styles.caption}>
            {timeOfBirth} · {city}
          </Text>
        )}
        {timeOfBirth.length === 0 && city.length > 0 && (
          <Text variant="caption" color="secondary" style={styles.caption}>
            {city}
          </Text>
        )}
      </View>
    </OnboardingStep>
  )
}

const styles = StyleSheet.create({
  fields: {
    gap: space['4'],
  },
  field: {
    marginTop: 0,
  },
  locationRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            space['2'],
    paddingVertical: space['3'],
  },
  locationLabel: {
    flex: 1,
  },
  caption: {
    marginTop: -space['2'],
  },
  stepTrack: {
    height:          2,
    backgroundColor: tokens.border.subtle,
    borderRadius:    1,
    overflow:        'hidden',
  },
  stepFill: {
    position:        'absolute',
    left:            0,
    top:             0,
    bottom:          0,
    backgroundColor: tokens.accent.primary,
  },
})
