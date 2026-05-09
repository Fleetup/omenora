import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { OnboardingStep } from '../../components/templates'
import { Button } from '../../components/atoms'
import { TimeField, CityField } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { space } from '../../design/tokens'
import { RootStackParamList } from '../../navigation/types'
import type { Place } from '../../api/nominatim'

type BirthTimeLocationNavProp = NativeStackNavigationProp<RootStackParamList, 'BirthTimeLocation'>

const timeStringToDate = (s: string): Date | null => {
  if (!s) return null
  const parts = s.split(':')
  if (parts.length < 2) return null
  const d = new Date()
  d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0)
  return d
}

const dateToTimeString = (d: Date | null): string => {
  if (!d) return ''
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function BirthTimeLocationScreen() {
  const navigation = useNavigation<BirthTimeLocationNavProp>()

  const storedTime  = useProfileStore((s) => s.timeOfBirth)
  const city        = useProfileStore((s) => s.city)
  const setTimeOfBirth = useProfileStore((s) => s.setTimeOfBirth)
  const setCity        = useProfileStore((s) => s.setCity)

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(
    city.length > 0
      ? { id: '', name: city, country: '', countryCode: '', lat: 0, lon: 0, displayName: city }
      : null
  )

  const handleTimeChange = (date: Date | null) => {
    setTimeOfBirth(dateToTimeString(date))
  }

  const handleCityChange = (place: Place | null) => {
    setSelectedPlace(place)
    setCity(place != null ? place.displayName : '')
  }

  const canConfirm = city.length > 0

  return (
    <OnboardingStep
      onBack={() => navigation.goBack()}
      heading="Birth time & place"
      subheading="City is required. Birth time is optional but improves accuracy."
      footer={
        <Button
          label="Confirm"
          variant="primary"
          fullWidth
          disabled={!canConfirm}
          onPress={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.fields}>
        <TimeField
          label="Birth time"
          value={timeStringToDate(storedTime)}
          onChange={handleTimeChange}
          showUnknownToggle
        />

        <CityField
          label="City of birth"
          required
          value={selectedPlace}
          onChange={handleCityChange}
          placeholder="Search city..."
          style={styles.field}
        />
      </View>
    </OnboardingStep>
  )
}

const styles = StyleSheet.create({
  fields: {
    gap: space['6'],
  },
  field: {
    marginTop: 0,
  },
})
