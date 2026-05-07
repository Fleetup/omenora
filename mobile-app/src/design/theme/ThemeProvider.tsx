import React, { createContext, useEffect, useState, type ReactNode } from 'react'
import { AccessibilityInfo, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { tokens, type DesignTokens } from '../tokens'

export interface ThemeContextValue {
  tokens: DesignTokens
  reduceMotion: boolean
}

export const ThemeContext = createContext<ThemeContextValue>({
  tokens,
  reduceMotion: false,
})

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    let isMounted = true

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled)
    })

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (isMounted) setReduceMotion(enabled)
      },
    )

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ tokens, reduceMotion }}>
      <View style={styles.root}>
        <LinearGradient
          colors={['#050410', '#0a0a1a', '#050410']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </View>
    </ThemeContext.Provider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
})
