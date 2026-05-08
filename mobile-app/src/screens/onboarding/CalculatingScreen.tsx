import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text } from '../../components/atoms'
import { ErrorState } from '../../components/templates'
import { PhoenixLoader } from '../../components/ui/PhoenixLoader'
import { useProfileStore } from '../../stores/profileStore'
import { surface } from '../../design/tokens'
import { api } from '../../api/endpoints'
import { RootStackParamList } from '../../navigation/types'

type CalculatingNavProp = NativeStackNavigationProp<RootStackParamList, 'Calculating'>

export default function CalculatingScreen() {
  const navigation = useNavigation<CalculatingNavProp>()

  const firstName        = useProfileStore((s) => s.firstName)
  const dateOfBirth      = useProfileStore((s) => s.dateOfBirth)
  const timeOfBirth      = useProfileStore((s) => s.timeOfBirth)
  const city             = useProfileStore((s) => s.city)
  const lifePathNumber   = useProfileStore((s) => s.lifePathNumber)
  const languageOverride = useProfileStore((s) => s.languageOverride)
  const setSunSign       = useProfileStore((s) => s.setSunSign)
  const setMoonSign      = useProfileStore((s) => s.setMoonSign)
  const setRisingSign    = useProfileStore((s) => s.setRisingSign)
  const setArchetype     = useProfileStore((s) => s.setArchetype)

  const [localError, setLocalError] = useState<string | null>(null)
  const [retryBump, setRetryBump]   = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    setLocalError(null)

    const language = languageOverride ?? 'en'

    ;(async () => {
      try {
        const { birthChart } = await api.generateBirthChart({
          firstName,
          dateOfBirth,
          timeOfBirth:    timeOfBirth    || undefined,
          city:           city           || undefined,
          lifePathNumber: lifePathNumber ?? 0,
          language,
        })

        if (!mountedRef.current) return

        setSunSign(birthChart.sunSign)
        setMoonSign(birthChart.moonSign)
        setRisingSign(birthChart.risingSign)
        setArchetype(birthChart.archetype)

        const archetypeName =
          `The ${birthChart.archetype.charAt(0).toUpperCase()}${birthChart.archetype.slice(1)}`

        navigation.replace('BigThreeReveal', {
          sunSign:  birthChart.sunSign,
          moonSign: birthChart.moonSign,
          risingSign: birthChart.risingSign,
          archetypeName,
        })
      } catch (err: unknown) {
        if (!mountedRef.current) return
        const message =
          err instanceof Error ? err.message : 'Please check your connection and try again'
        setLocalError(message)
      }
    })()

    return () => {
      mountedRef.current = false
    }
  }, [retryBump])

  if (localError != null) {
    return (
      <View style={styles.container}>
        <ErrorState
          heading="We couldn't read your chart"
          body={localError}
          actionLabel="Try again"
          onActionPress={() => setRetryBump((n) => n + 1)}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <PhoenixLoader size={80} />
      <Text variant="display2" style={styles.label}>
        Reading your chart…
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: surface.base,
    alignItems:      'center',
    justifyContent:  'center',
  },
  label: {
    fontStyle:  'italic',
    marginTop:  32,
    textAlign:  'center',
    paddingHorizontal: 24,
  },
})
