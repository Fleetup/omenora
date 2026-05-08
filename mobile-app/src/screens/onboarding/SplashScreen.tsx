import React, { useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Svg, { Circle } from 'react-native-svg'
import { Text } from '../../components/atoms'
import { surface } from '../../design/tokens'
import { RootStackParamList } from '../../navigation/types'

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>

const STAR_POSITIONS = (() => {
  const result: { cx: number; cy: number }[] = []
  let seed = 42
  for (let i = 0; i < 30; i++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cx = (seed % 370) + 10
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const cy = (seed % 820) + 12
    result.push({ cx, cy })
  }
  return result
})()

export default function SplashScreen() {
  const navigation = useNavigation<SplashNavProp>()
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
      >
        {STAR_POSITIONS.map((s, i) => (
          <Circle key={i} cx={s.cx} cy={s.cy} r={1} fill="rgba(255,255,255,0.04)" />
        ))}
      </Svg>
      <Text variant="display2" style={styles.wordmark}>OMENORA</Text>
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
