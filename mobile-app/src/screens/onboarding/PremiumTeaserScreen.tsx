import React, { useEffect, useState } from 'react'
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text } from '../../components/atoms'
import { Button } from '../../components/atoms'
import { FeatureListItem } from '../../components/ui/FeatureListItem'
import { useProfileStore } from '../../stores/profileStore'
import { useAuth } from '../../context/useAuth'
import { usePurchases } from '../../context/usePurchases'
import { tokens, space, layout } from '../../design/tokens'
import { RootStackParamList } from '../../navigation/types'

type PremiumTeaserNavProp = NativeStackNavigationProp<RootStackParamList, 'PremiumTeaser'>

const BENEFITS = [
  { icon: '✦', label: 'Full archetype deep reading'  },
  { icon: '✦', label: 'Complete natal chart'          },
  { icon: '✦', label: '90-day personal forecast'      },
  { icon: '✦', label: 'Counsel — AI chat with your chart' },
]

export default function PremiumTeaserScreen() {
  const navigation = useNavigation<PremiumTeaserNavProp>()

  const archetype  = useProfileStore((s) => s.archetype)
  const archetypeName =
    archetype != null && archetype.length > 0
      ? `The ${archetype.charAt(0).toUpperCase()}${archetype.slice(1)}`
      : 'Your Archetype'

  const { isAnonymous, showAuthGate } = useAuth()
  const { presentPaywall }            = usePurchases()

  const [awaitingAuth, setAwaitingAuth] = useState(false)

  const proceedToPaywall = () => {
    presentPaywall().finally(() => navigation.replace('MainTabs'))
  }

  useEffect(() => {
    if (awaitingAuth && !isAnonymous) {
      setAwaitingAuth(false)
      proceedToPaywall()
    }
  }, [awaitingAuth, isAnonymous])

  const handleUnlock = () => {
    if (isAnonymous) {
      setAwaitingAuth(true)
      showAuthGate({
        title: 'Unlock your reading',
        body:  'Sign in to access your full chart and sync readings across devices.',
      })
    } else {
      proceedToPaywall()
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView>
          <View style={styles.hero}>
            <Text variant="micro" color="secondary" style={styles.heroEyebrow}>
              You are
            </Text>
            <Text variant="display1" color="primary" style={styles.heroName}>
              {archetypeName}
            </Text>
          </View>

          <Text variant="display2" color="primary" style={styles.heading}>
            Your full reading awaits
          </Text>

          <View style={styles.bullets}>
            {BENEFITS.map((b) => (
              <FeatureListItem key={b.label} icon={b.icon} label={b.label} />
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Unlock Premium"
          variant="primary"
          fullWidth
          onPress={handleUnlock}
        />
        <Button
          label="Maybe later"
          variant="tertiary"
          fullWidth
          onPress={() => navigation.replace('MainTabs')}
          style={styles.maybeLater}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: tokens.surface.base,
  },
  glow: {
    position:        'absolute',
    top:             -80,
    alignSelf:       'center',
    width:           360,
    height:          360,
    borderRadius:    180,
    backgroundColor: tokens.accent.primary,
    opacity:         0.07,
  },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['12'],
    paddingBottom:     space['8'],
  },
  hero: {
    alignItems:   'center',
    marginBottom: space['10'],
  },
  heroEyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom:  space['2'],
  },
  heroName: {
    textAlign: 'center',
  },
  heading: {
    textAlign:    'center',
    marginBottom: space['8'],
  },
  bullets: {
    gap: space['4'],
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom:     space['8'],
    gap:               space['3'],
  },
  maybeLater: {
    marginTop: 0,
  },
})
