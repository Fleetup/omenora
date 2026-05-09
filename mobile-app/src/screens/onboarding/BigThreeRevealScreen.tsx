import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MotiView } from 'moti'
import { Button, Text } from '../../components/atoms'
import { tokens, space, layout } from '../../design/tokens'
import { RootStackParamList } from '../../navigation/types'

type BigThreeRevealNavProp   = NativeStackNavigationProp<RootStackParamList, 'BigThreeReveal'>
type BigThreeRevealRouteProp = RouteProp<RootStackParamList, 'BigThreeReveal'>

const CARD_DURATION = 400
const CARD_STAGGER  = 60
const ARCHETYPE_DELAY = 700

const PLACEMENTS = (sunSign: string, moonSign: string, risingSign: string) => [
  { symbol: '☉', label: 'Sun',    sign: sunSign    },
  { symbol: '☽', label: 'Moon',   sign: moonSign   },
  { symbol: '↑', label: 'Rising', sign: risingSign },
]

export default function BigThreeRevealScreen() {
  const navigation = useNavigation<BigThreeRevealNavProp>()
  const route      = useRoute<BigThreeRevealRouteProp>()
  const { sunSign, moonSign, risingSign, archetypeName } = route.params
  const insets = useSafeAreaInsets()

  const cards = PLACEMENTS(sunSign, moonSign, risingSign)

  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />

      <SafeAreaView style={styles.content} edges={['top']}>
        <View style={styles.cards}>
          {cards.map((card, i) => (
            <MotiView
              key={card.label}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: CARD_DURATION, delay: CARD_STAGGER * i }}
              style={styles.card}
              accessible={true}
              accessibilityLabel={`${card.label} sign: ${card.sign}`}
            >
              <Text variant="heading2" style={styles.symbol}>
                {card.symbol}
              </Text>
              <View>
                <Text variant="caption" color="secondary" style={styles.cardLabel}>
                  {card.label}
                </Text>
                <Text variant="heading1" color="primary">
                  {card.sign}
                </Text>
              </View>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: ARCHETYPE_DELAY }}
          style={styles.archetypeBlock}
        >
          <Text variant="micro" color="secondary" style={styles.eyebrow}>
            You are
          </Text>
          <Text variant="display1" color="primary" style={styles.archetypeName} accessibilityRole="header">
            {archetypeName}
          </Text>
        </MotiView>
      </SafeAreaView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 300, delay: ARCHETYPE_DELAY + 400 }}
        style={[styles.footer, { paddingBottom: Math.max(space['8'], insets.bottom + space['4']) }]}
      >
        <Button
          label="Continue to deeper reading"
          variant="primary"
          fullWidth
          onPress={() => navigation.navigate('OptionalQuestions')}
        />
      </MotiView>
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
    top:             -60,
    alignSelf:       'center',
    width:           340,
    height:          340,
    borderRadius:    170,
    backgroundColor: tokens.accent.primary,
    opacity:         0.07,
  },
  content: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: layout.screenPadding,
  },
  cards: {
    width:    '100%',
    gap:      space['4'],
    maxWidth: 400,
  },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             space['5'],
    backgroundColor: tokens.surface.raised,
    borderRadius:    12,
    paddingVertical:   space['4'],
    paddingHorizontal: space['5'],
    borderWidth:     1,
    borderColor:     tokens.border.subtle,
  },
  symbol: {
    color:    tokens.accent.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  cardLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom:  space['0.5'],
  },
  archetypeBlock: {
    alignItems: 'center',
    marginTop:  space['10'],
  },
  eyebrow: {
    marginBottom: space['2'],
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  archetypeName: {
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
  },
})
