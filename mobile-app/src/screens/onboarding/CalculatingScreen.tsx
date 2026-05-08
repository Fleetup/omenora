import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text } from '../../components/atoms'
import { ErrorState } from '../../components/templates'
import { PhoenixLoader } from '../../components/ui/PhoenixLoader'
import { useProfileStore } from '../../stores/profileStore'
import { surface } from '../../design/tokens'
import apiClient from '../../api/client'
import { RootStackParamList } from '../../navigation/types'

type CalculatingNavProp = NativeStackNavigationProp<RootStackParamList, 'Calculating'>

interface BirthChartResponse {
  success:      boolean
  noonFallback: boolean
  birthChart: {
    risingSign:     string
    sunSign:        string
    moonSign:       string
    dominantPlanet: string
    powerHouse:     string
    chartTitle:     string
    reading:        string
    forecast2026:   string
  }
}

export default function CalculatingScreen() {
  const navigation = useNavigation<CalculatingNavProp>()

  const firstName      = useProfileStore((s) => s.firstName)
  const dateOfBirth    = useProfileStore((s) => s.dateOfBirth)
  const timeOfBirth    = useProfileStore((s) => s.timeOfBirth)
  const city           = useProfileStore((s) => s.city)
  const lifePathNumber = useProfileStore((s) => s.lifePathNumber)
  const languageOverride = useProfileStore((s) => s.languageOverride)
  const setSunSign     = useProfileStore((s) => s.setSunSign)
  const setMoonSign    = useProfileStore((s) => s.setMoonSign)
  const setRisingSign  = useProfileStore((s) => s.setRisingSign)
  const setArchetype   = useProfileStore((s) => s.setArchetype)

  const [localError, setLocalError] = useState<string | null>(null)
  const [retryBump, setRetryBump]   = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setLocalError(null)

    const controller = new AbortController()
    abortRef.current = controller

    const language = languageOverride ?? 'en'

    ;(async () => {
      try {
        const response = await apiClient.post<BirthChartResponse>(
          '/api/generate-birth-chart',
          {
            firstName,
            dateOfBirth,
            timeOfBirth: timeOfBirth || undefined,
            city:        city || undefined,
            lifePathNumber: lifePathNumber ?? 0,
            language,
          },
          { signal: controller.signal },
        )

        const { birthChart } = response.data

        setSunSign(birthChart.sunSign)
        setMoonSign(birthChart.moonSign)
        setRisingSign(birthChart.risingSign)
        // TODO (Cluster C): endpoint does not return a discrete archetype name.
        // Using chartTitle as proxy until the API contract is extended.
        setArchetype(birthChart.chartTitle ?? '')

        // BigThreeReveal is not registered until Cluster C — reaching this in a
        // Cluster B device test will produce an expected unhandled-route warning.
        navigation.replace('BigThreeReveal', {
          sunSign:       birthChart.sunSign,
          moonSign:      birthChart.moonSign,
          risingSign:    birthChart.risingSign,
          archetypeName: birthChart.chartTitle ?? '',
        })
      } catch (err: unknown) {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error ? err.message : 'Please check your connection and try again'
        setLocalError(message)
      }
    })()

    return () => {
      controller.abort()
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
