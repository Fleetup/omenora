import React, { useState, useEffect, useRef } from 'react'
import { ScrollView, Alert, StyleSheet } from 'react-native'
import { ScreenWrapper } from '../../components/templates'
import { Header } from '../../components/organisms'
import { Button } from '../../components/atoms'
import { TextField, DateField, TimeField, CityField } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { useAuth } from '../../context/useAuth'
import { ProfileSaveError } from '../../services/profileService'
import { layout, space } from '../../design/tokens'
import type { Place } from '../../api/nominatim'
import type { ProfileScreenProps } from '../../navigation/types'

// ── Date ↔ string helpers (inlined from DateOfBirthScreen) ────────────────────

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

// ── Time ↔ string helpers (inlined from BirthTimeScreen) ──────────────────────

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

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, isAnonymous, showAuthGate } = useAuth()

  // ── Store values (read-only baseline) ────────────────────────
  const storeFirstName   = useProfileStore((s) => s.firstName)
  const storeDateOfBirth = useProfileStore((s) => s.dateOfBirth)
  const storeTimeOfBirth = useProfileStore((s) => s.timeOfBirth)
  const storeCity        = useProfileStore((s) => s.city)

  // ── Store setters ─────────────────────────────────────────────────────────
  const setFirstName         = useProfileStore((s) => s.setFirstName)
  const setDateOfBirth       = useProfileStore((s) => s.setDateOfBirth)
  const setTimeOfBirth       = useProfileStore((s) => s.setTimeOfBirth)
  const setCity              = useProfileStore((s) => s.setCity)
  const setReport            = useProfileStore((s) => s.setReport)
  const setArchetypeReading  = useProfileStore((s) => s.setArchetypeReading)
  const setNatalChartReading = useProfileStore((s) => s.setNatalChartReading)
  const setForecastReading   = useProfileStore((s) => s.setForecastReading)
  const setCalendarData           = useProfileStore((s) => s.setCalendarData)
  const commitProfileToServer     = useProfileStore((s) => s.commitProfileToServer)

  // ── Local field state ─────────────────────────────────────────────────────
  const [firstName,   setLocalFirstName]   = useState(storeFirstName)
  const [dateOfBirth, setLocalDateOfBirth] = useState(storeDateOfBirth)
  const [timeOfBirth, setLocalTimeOfBirth] = useState(storeTimeOfBirth)
  const [localPlace,  setLocalPlace]       = useState<Place | null>(
    storeCity.length > 0
      ? { id: '', name: storeCity, country: '', countryCode: '', lat: 0, lon: 0, displayName: storeCity }
      : null
  )

  // ── Commit state ────────────────────────────────────────────
  const [saving, setSaving]   = useState(false)
  // Prevent the beforeRemove dirty-check from blocking navigation mid-commit.
  const committingRef         = useRef(false)

  // ── Dirty tracking ────────────────────────────────────────
  const firstNameDirty = firstName !== storeFirstName
  const dobDirty       = dateOfBirth !== storeDateOfBirth
  const tobDirty       = timeOfBirth !== storeTimeOfBirth
  const cityDirty      = (localPlace?.displayName ?? '') !== storeCity
  const isAnyDirty     = firstNameDirty || dobDirty || tobDirty || cityDirty

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid =
    firstName.trim().length > 0 &&
    dateOfBirth.length > 0 &&
    (localPlace?.displayName?.length ?? 0) > 0

  // ── Back-navigation intercept ─────────────────────────────────
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!isAnyDirty || committingRef.current) return
      e.preventDefault()
      Alert.alert(
        'Discard changes?',
        'Your edits will be lost.',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      )
    })
    return unsub
  }, [navigation, isAnyDirty])

  // ── Save helpers ─────────────────────────────────────────────
  const commitWithCacheClear = async () => {
    if (isAnonymous || !user?.id) {
      showAuthGate()
      return
    }
    committingRef.current = true
    setSaving(true)
    if (firstNameDirty) setFirstName(firstName)
    setDateOfBirth(dateOfBirth)
    if (tobDirty) setTimeOfBirth(timeOfBirth)
    if (cityDirty) setCity(localPlace?.displayName ?? '')
    try {
      await commitProfileToServer(user.id)
      setReport(null)
      setArchetypeReading(null)
      setNatalChartReading(null)
      setForecastReading(null)
      setCalendarData(null)
      navigation.goBack()
    } catch (err: any) {
      committingRef.current = false
      setSaving(false)
      if (err instanceof ProfileSaveError && err.kind === 'network') {
        Alert.alert(
          "Couldn't save changes",
          "Your changes are saved locally. Tap Retry to try again.",
          [
            { text: 'Retry', onPress: () => void commitWithCacheClear() },
            { text: 'Done', style: 'cancel', onPress: () => { committingRef.current = true; navigation.goBack() } },
          ]
        )
      } else {
        Alert.alert('Save failed', 'Please try again or contact support@omenora.com.')
      }
    }
  }

  const commitFieldsOnly = async () => {
    if (isAnonymous || !user?.id) {
      showAuthGate()
      return
    }
    committingRef.current = true
    setSaving(true)
    if (firstNameDirty) setFirstName(firstName)
    if (tobDirty) setTimeOfBirth(timeOfBirth)
    if (cityDirty) setCity(localPlace?.displayName ?? '')
    try {
      await commitProfileToServer(user.id)
      navigation.goBack()
    } catch (err: any) {
      committingRef.current = false
      setSaving(false)
      if (err instanceof ProfileSaveError && err.kind === 'network') {
        Alert.alert(
          "Couldn't save changes",
          "Your changes are saved locally. Tap Retry to try again.",
          [
            { text: 'Retry', onPress: () => void commitFieldsOnly() },
            { text: 'Done', style: 'cancel', onPress: () => { committingRef.current = true; navigation.goBack() } },
          ]
        )
      } else {
        Alert.alert('Save failed', 'Please try again or contact support@omenora.com.')
      }
    }
  }

  const handleSave = () => {
    if (dobDirty) {
      Alert.alert(
        'Birth date change clears your readings.',
        'Your destiny report, archetype reading, natal chart, forecast, and calendar will regenerate the next time you open them. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', style: 'destructive', onPress: () => void commitWithCacheClear() },
        ]
      )
    } else {
      void commitFieldsOnly()
    }
  }

  return (
    <ScreenWrapper scroll={false} padded={false} background="base">
      <Header title="Profile" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="First name"
          type="name"
          required
          value={firstName}
          onChangeText={setLocalFirstName}
          placeholder="Your first name"
        />

        <DateField
          label="Date of birth"
          required
          value={dateStringToDate(dateOfBirth)}
          onChange={(date) => setLocalDateOfBirth(dateToISO(date))}
          maximumDate={new Date()}
        />

        <TimeField
          label="Birth time"
          value={timeStringToDate(timeOfBirth)}
          onChange={(date) => setLocalTimeOfBirth(dateToTimeString(date))}
          showUnknownToggle
        />

        <CityField
          label="City of birth"
          required
          value={localPlace}
          onChange={(place) => setLocalPlace(place)}
          placeholder="Search city..."
        />

        <Button
          label={saving ? 'Saving…' : 'Save'}
          variant="primary"
          fullWidth
          disabled={!isValid || !isAnyDirty || saving}
          onPress={handleSave}
        />
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['4'],
    paddingBottom:     space['8'],
    gap:               space['5'],
  },
})
