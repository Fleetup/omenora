import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Svg, { Circle } from 'react-native-svg'

import { surface, accent, border, space, layout } from '../../design/tokens'
import { Text } from '../../components/atoms/Text'
import { Button } from '../../components/atoms/Button'
import { PhoenixLoader } from '../../components/ui/PhoenixLoader'
import { useAuth } from '../../context/useAuth'
import { RootStackParamList } from '../../navigation/types'

type WelcomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen')

const STARS = (() => {
  let seed = 0xcafebabe
  const result: Array<{ cx: number; cy: number; r: number; opacity: number }> = []
  for (let i = 0; i < 55; i++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cx = seed % SCREEN_W
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cy = seed % SCREEN_H
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    result.push({ cx, cy, r: 0.85, opacity: 0.05 + ((seed % 12) / 12) * 0.14 })
  }
  return result
})()

export default function WelcomeScreen() {
  const navigation  = useNavigation<WelcomeNavProp>()
  const { isAnonymous, profileHydrating, showAuthGate } = useAuth()
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false)
  const fadeAnim    = useRef(new Animated.Value(0)).current
  const slideAnim   = useRef(new Animated.Value(28)).current

  // Slide-up entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])

  // Route to MainTabs after sign-in AND profile hydration complete (or 5s timeout).
  useEffect(() => {
    if (isAnonymous) return
    if (!profileHydrating || hydrationTimedOut) {
      navigation.replace('MainTabs')
    }
  }, [isAnonymous, profileHydrating, hydrationTimedOut, navigation])

  // 5-second max wait for profile hydration after permanent sign-in.
  useEffect(() => {
    if (isAnonymous) return
    const timer = setTimeout(() => setHydrationTimedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [isAnonymous])

  return (
    <View style={styles.container}>
      {/* Star field */}
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {STARS.map((s, i) => (
          <Circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={`rgba(255,255,255,${s.opacity.toFixed(2)})`}
          />
        ))}
      </Svg>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Brand wordmark */}
        <View style={styles.topBar}>
          <Text variant="micro" color="secondary" style={styles.wordmark}>
            OMENORA
          </Text>
        </View>

        {/* Phoenix visual */}
        <View style={styles.visualZone}>
          <View style={styles.glow} />
          <PhoenixLoader size={144} duration={4800} />
        </View>

        {/* Copy + actions — slides up on mount */}
        <Animated.View
          style={[
            styles.bottomZone,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text variant="display2" color="primary" style={styles.headline}>
            {'Discover your\narchetype'}
          </Text>
          <Text variant="bodyLarge" color="secondary" style={styles.subheadline}>
            Your birth data unlocks a reading built only for you
          </Text>

          {!isAnonymous && profileHydrating && !hydrationTimedOut ? (
            <View style={styles.actions}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
            </View>
          ) : (
            <View style={styles.actions}>
              <Button
                label="Begin"
                variant="primary"
                fullWidth
                onPress={() => navigation.navigate('BirthInfo')}
              />

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text variant="micro" color="tertiary" style={styles.orLabel}>or</Text>
                <View style={styles.orLine} />
              </View>

              <Pressable
                onPress={() =>
                  showAuthGate({
                    title: 'Welcome back',
                    body: 'Sign in to access your readings and profile.',
                  })
                }
                style={({ pressed }) => [
                  styles.signInTap,
                  pressed && styles.signInTapPressed,
                ]}
              >
                <Text variant="label" color="secondary">Already have an account?</Text>
                <Text variant="label" style={styles.signInAccent}>{' '}Sign in</Text>
              </Pressable>
            </View>
          )}

          {/* Legal */}
          <View style={styles.legalRow}>
            <Text variant="caption" color="tertiary">By continuing you agree to our </Text>
            <Pressable
              onPress={() => navigation.navigate('Terms')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text variant="caption" style={styles.legalLink}>Terms</Text>
            </Pressable>
            <Text variant="caption" color="tertiary"> and </Text>
            <Pressable
              onPress={() => navigation.navigate('Privacy')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text variant="caption" style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: surface.base,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    alignItems:      'center',
    paddingTop:      space['5'],
  },
  wordmark: {
    letterSpacing: 6,
  },
  visualZone: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  glow: {
    position:        'absolute',
    width:           270,
    height:          270,
    borderRadius:    135,
    backgroundColor: accent.subtle,
  },
  bottomZone: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom:     space['4'],
  },
  headline: {
    textAlign:    'center',
    marginBottom: space['3'],
  },
  subheadline: {
    textAlign:    'center',
    marginBottom: space['8'],
  },
  actions: {
    gap:          space['2'],
    marginBottom: space['5'],
  },
  orRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginVertical: space['1'],
  },
  orLine: {
    flex:            1,
    height:          StyleSheet.hairlineWidth,
    backgroundColor: border.default,
  },
  orLabel: {
    marginHorizontal: space['3'],
    letterSpacing:    2,
  },
  signInTap: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      layout.tapTarget,
  },
  signInTapPressed: {
    opacity: 0.6,
  },
  signInAccent: {
    color: accent.primary,
  },
  legalRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    flexWrap:       'wrap',
    marginTop:      space['2'],
  },
  legalLink: {
    color:               'rgba(255,255,255,0.45)',
    textDecorationLine:  'underline',
  },
})
