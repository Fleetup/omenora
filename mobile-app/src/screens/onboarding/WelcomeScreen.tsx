import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg'
import { MotiView } from 'moti'

import {
  surface,
  accent,
  space,
  layout,
  fontFamily,
  easings,
} from '../../design/tokens'
import { Text } from '../../components/atoms/Text'
import { Button } from '../../components/atoms/Button'
import { useAuth } from '../../context/useAuth'
import { useProfileStore } from '../../stores/profileStore'
import { RootStackParamList } from '../../navigation/types'

type WelcomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen')

// Deterministic film-grain noise — static, low-density tiny dots layered over
// the radial gradient atmosphere to suggest paper-stock texture.
const NOISE = (() => {
  let seed = 0xdeadbeef
  const out: Array<{ cx: number; cy: number; r: number; opacity: number }> = []
  for (let i = 0; i < 320; i++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cx = seed % SCREEN_W
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cy = seed % SCREEN_H
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    out.push({ cx, cy, r: 0.7, opacity: 0.018 + ((seed % 10) / 10) * 0.032 })
  }
  return out
})()

export default function WelcomeScreen() {
  const navigation  = useNavigation<WelcomeNavProp>()
  const { isAnonymous, profileHydrating, profileHydrated, showAuthGate } = useAuth()
  const archetype   = useProfileStore((s) => s.archetype)
  const dateOfBirth = useProfileStore((s) => s.dateOfBirth)
  const sunSign     = useProfileStore((s) => s.sunSign)
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false)

  // Route after sign-in based on profile completeness. Wait for hydration
  // to COMPLETE (profileHydrated=true) before evaluating the triple-check —
  // gating on profileHydrating=false alone has a race window between
  // SIGNED_IN firing and the hydration block setting hydrating=true.
  // Triple-check mirrors SplashScreen. Decision 8.
  useEffect(() => {
    if (isAnonymous) return
    if (profileHydrated || hydrationTimedOut) {
      const profileComplete = archetype !== null && dateOfBirth !== '' && sunSign !== null
      navigation.replace(profileComplete ? 'MainTabs' : 'BirthInfo')
    }
  }, [isAnonymous, profileHydrated, hydrationTimedOut, archetype, dateOfBirth, sunSign, navigation])

  // 5-second max wait for profile hydration after permanent sign-in.
  // Reset timeout state when user signs out so a subsequent sign-in
  // starts with a fresh 5s window, not a stale already-timed-out flag.
  useEffect(() => {
    if (isAnonymous) {
      setHydrationTimedOut(false)
      return
    }
    if (profileHydrated) return
    const timer = setTimeout(() => setHydrationTimedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [isAnonymous, profileHydrated])

  return (
    <View style={styles.container} testID="welcome-screen-root">
      {/* Atmospheric layered background — static. Never animate this stack. */}
      <LinearGradient
        colors={[surface.deep, surface.base, surface.deep]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <RadialGradient
            id="glowPrimary"
            cx={SCREEN_W * 0.28}
            cy={SCREEN_H * 0.32}
            rx={SCREEN_W * 0.78}
            ry={SCREEN_W * 0.78}
            fx={SCREEN_W * 0.28}
            fy={SCREEN_H * 0.32}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0"    stopColor={accent.primary} stopOpacity="0.22" />
            <Stop offset="0.35" stopColor={accent.primary} stopOpacity="0.10" />
            <Stop offset="0.7"  stopColor={accent.primary} stopOpacity="0.03" />
            <Stop offset="1"    stopColor={accent.primary} stopOpacity="0"    />
          </RadialGradient>
          <RadialGradient
            id="glowCounter"
            cx={SCREEN_W * 0.88}
            cy={SCREEN_H * 0.85}
            rx={SCREEN_W * 0.55}
            ry={SCREEN_W * 0.55}
            fx={SCREEN_W * 0.88}
            fy={SCREEN_H * 0.85}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0"   stopColor={accent.primary} stopOpacity="0.12" />
            <Stop offset="0.5" stopColor={accent.primary} stopOpacity="0.04" />
            <Stop offset="1"   stopColor={accent.primary} stopOpacity="0"    />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#glowPrimary)" />
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#glowCounter)" />
        {NOISE.map((n, i) => (
          <Circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={`rgba(255,255,255,${n.opacity.toFixed(3)})`}
          />
        ))}
      </Svg>

      {/* Bottom vignette anchors the CTA cluster against the gradient. */}
      <LinearGradient
        colors={['rgba(2,1,8,0)', 'rgba(2,1,8,0.55)']}
        locations={[0, 1]}
        style={styles.bottomVignette}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Brand wordmark — left-aligned editorial masthead */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...easings.transition, duration: 600 }}
          style={styles.topBar}
        >
          <Text variant="micro" color="secondary" style={styles.wordmark}>
            OMENORA
          </Text>
        </MotiView>

        {/* Headline cluster — upper third, asymmetric with right breathing room */}
        <View style={styles.headlineZone}>
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...easings.transition, duration: 800, delay: 200 }}
          >
            <Text variant="micro" color="tertiary" style={styles.eyebrow}>
              An invitation
            </Text>
            <Text variant="display1" color="primary" style={styles.headline}>
              {'Begin with the\nnight you were '}
              <Text
                variant="display1"
                color="primary"
                style={styles.headlineItalic}
              >
                born
              </Text>
            </Text>
          </MotiView>
        </View>

        {/* Bottom cluster — subhead + CTA + sign-in + legal */}
        <View style={styles.bottomZone}>
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...easings.transition, duration: 800, delay: 400 }}
          >
            <Text variant="readingBody" color="secondary" style={styles.subheadline}>
              Your birth, your hour, your hemisphere — the reading is shaped only by what is true for you.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...easings.transition, duration: 800, delay: 600 }}
          >
            {!isAnonymous && profileHydrating && !hydrationTimedOut ? (
              <View style={styles.actions}>
                <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
              </View>
            ) : (
              <View style={styles.actions}>
                <View testID="welcome-cta-primary">
                  <Button
                    label="Begin"
                    variant="primary"
                    fullWidth
                    onPress={() => navigation.navigate('BirthInfo')}
                  />
                </View>

                <Pressable
                  testID="welcome-cta-signin"
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

            <View style={styles.legalRow}>
              <Text variant="caption" color="tertiary">By continuing you agree to our </Text>
              <Pressable
                testID="welcome-link-terms"
                onPress={() => navigation.navigate('Terms')}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text variant="caption" style={styles.legalLink}>Terms</Text>
              </Pressable>
              <Text variant="caption" color="tertiary"> and </Text>
              <Pressable
                testID="welcome-link-privacy"
                onPress={() => navigation.navigate('Privacy')}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text variant="caption" style={styles.legalLink}>Privacy Policy</Text>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: surface.deep,
  },
  safe: {
    flex:              1,
    paddingHorizontal: layout.screenPadding,
  },
  bottomVignette: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   SCREEN_H * 0.42,
  },
  topBar: {
    paddingTop: space['5'],
  },
  wordmark: {
    letterSpacing: 6,
  },
  headlineZone: {
    flex:          1,
    paddingTop:    space['16'],
    paddingRight:  space['8'],
  },
  eyebrow: {
    letterSpacing: 4,
    marginBottom:  space['4'],
  },
  headline: {
    letterSpacing: -0.5,
  },
  headlineItalic: {
    fontFamily: fontFamily.displayItalic,
  },
  bottomZone: {
    paddingBottom: space['4'],
  },
  subheadline: {
    marginBottom: space['8'],
    paddingRight: space['6'],
  },
  actions: {
    gap:          space['3'],
    marginBottom: space['5'],
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
    flexDirection: 'row',
    flexWrap:      'wrap',
    marginTop:     space['2'],
  },
  legalLink: {
    color:              'rgba(255,255,255,0.45)',
    textDecorationLine: 'underline',
  },
})
