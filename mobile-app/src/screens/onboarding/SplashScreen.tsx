import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Svg, { Circle } from 'react-native-svg'
import { Text } from '../../components/atoms'
import { surface } from '../../design/tokens'
import { RootStackParamList } from '../../navigation/types'

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const STAR_POSITIONS = (() => {
  const result: { cx: number; cy: number; r: number; opacity: number }[] = []
  let seed = 42
  for (let i = 0; i < 40; i++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cx = (seed % Math.floor(SCREEN_W - 20)) + 10
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cy = (seed % Math.floor(SCREEN_H - 24)) + 12
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const r  = (seed % 5 === 0) ? 2 : 1
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const opacity = 0.08 + ((seed % 10) / 10) * 0.17
    result.push({ cx, cy, r, opacity })
  }
  return result
})()

export default function SplashScreen() {
  const navigation = useNavigation<SplashNavProp>()
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeAnim   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue:         1,
      duration:        700,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigation.replace('Welcome')
    }, 1500)
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [navigation])

  return (
    <View style={styles.container}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {STAR_POSITIONS.map((s, i) => (
          <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={`rgba(255,255,255,${s.opacity.toFixed(2)})`} />
        ))}
      </Svg>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text variant="display2" style={styles.wordmark}>OMENORA</Text>
      </Animated.View>
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
  wordmark: {
    letterSpacing: 6,
  },
})
