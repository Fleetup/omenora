import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text } from '../../components/atoms'
import { ErrorState, ScreenWrapper } from '../../components/templates'
import { PhoenixLoader } from '../../components/ui/PhoenixLoader'
import { useProfileStore } from '../../stores/profileStore'
import { surface, fontFamily, space, layout } from '../../design/tokens'
import { api } from '../../api/endpoints'
import { RootStackParamList } from '../../navigation/types'

type CalculatingNavProp = NativeStackNavigationProp<RootStackParamList, 'Calculating'>

const LOADING_PHRASES = [
  'Reading your chart…',
  'Mapping the celestial sphere…',
  'Tracing your archetypes…',
  'Charting the planets…',
  'Unveiling your cosmic path…',
]

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

  const [localError,  setLocalError]  = useState<string | null>(null)
  const [retryBump,   setRetryBump]   = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

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
  }, [retryBump, firstName, dateOfBirth, timeOfBirth, city, lifePathNumber, languageOverride, setSunSign, setMoonSign, setRisingSign, setArchetype, navigation])

  if (localError != null) {
    return (
      <ScreenWrapper scroll={false} padded={false} background='base'>
        <View style={styles.centered} accessibilityLiveRegion="polite">
          <ErrorState
            heading="We couldn't read your chart"
            body={localError}
            actionLabel="Try again"
            onActionPress={() => setRetryBump((n) => n + 1)}
          />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <View style={styles.container}>
      <PhoenixLoader size={80} />
      <Text variant="display2" style={styles.label}>
        {LOADING_PHRASES[phraseIndex]}
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
  centered: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily:        fontFamily.displayItalic,
    marginTop:         space['8'],
    textAlign:         'center',
    paddingHorizontal: layout.screenPadding,
  },
})
