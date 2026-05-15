import React from 'react'
import { View, ImageBackground, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '../atoms/Text'
import { ArchetypeIcon } from '../atoms/ArchetypeIcon'
import { ZodiacSymbol } from '../atoms/ZodiacSymbol'
import { accent, specialty, text } from '../../design/tokens/colors'
import { space } from '../../design/tokens/spacing'

const PHASE_IMAGES: Record<string, number> = {
  'New Moon':       require('../../../assets/hero/moon-phases/hero_new_moon.webp'),
  'Waxing Crescent':require('../../../assets/hero/moon-phases/hero_waxing_crescent.webp'),
  'First Quarter':  require('../../../assets/hero/moon-phases/hero_first_quarter.webp'),
  'Waxing Gibbous': require('../../../assets/hero/moon-phases/hero_waxing_gibbous.webp'),
  'Full Moon':      require('../../../assets/hero/moon-phases/hero_full_moon.webp'),
  'Waning Gibbous': require('../../../assets/hero/moon-phases/hero_waning_gibbous.webp'),
  'Last Quarter':   require('../../../assets/hero/moon-phases/hero_last_quarter.webp'),
  'Waning Crescent':require('../../../assets/hero/moon-phases/hero_waning_crescent.webp'),
}

const FALLBACK_IMAGE = PHASE_IMAGES['New Moon']

export interface MoonPhaseHeroProps {
  moonPhase:     string
  archetypeName: string
  signName:      string | null
  greeting:      string
  formattedDate: string
  style?:        ViewStyle
}

export default function MoonPhaseHero({
  moonPhase,
  archetypeName,
  signName,
  greeting,
  formattedDate,
  style,
}: MoonPhaseHeroProps) {
  const source = PHASE_IMAGES[moonPhase] ?? FALLBACK_IMAGE

  return (
    <View style={[styles.wrapper, style]}>
      {/* ── Fixed-height image container ── */}
      <View style={styles.outer}>
        <ImageBackground
          source={source}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />

        {/* Scrim: transparent top → semi-transparent bottom — does NOT go fully opaque */}
        <LinearGradient
          colors={[
            specialty.heroScrimTransparent,
            specialty.heroScrimTransparent,
            'rgba(21,17,13,0.55)',
          ]}
          locations={[0, 0.40, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Content layer */}
        <View style={[StyleSheet.absoluteFill, styles.content]}>

          {/* Moon phase caption — top-right */}
          <View style={styles.phaseCaption}>
            <Text variant="subMicro" style={styles.phaseCaptionText}>
              {moonPhase.toUpperCase()}
            </Text>
          </View>

          {/* Archetype icon — vertically centered in image */}
          <View style={styles.archetypeWrap}>
            <ArchetypeIcon
              archetype={archetypeName}
              size={120}
              fill={accent.primary}
              opacity={0.50}
            />
          </View>

          {/* Greeting + date — bottom-left */}
          <View style={styles.greetingBlock}>
            <View style={styles.greetingRow}>
              <Text variant="display2" style={styles.greetingText}>
                {greeting}
              </Text>
              {signName != null && (
                <ZodiacSymbol
                  sign={signName}
                  size={28}
                  opacity={0.65}
                  style={styles.zodiacSymbol}
                />
              )}
            </View>
            <Text variant="caption" style={styles.dateText}>
              {formattedDate}
            </Text>
          </View>

        </View>
      </View>

      {/* ── Bottom bleed: extends the fade seamlessly into content below ── */}
      <LinearGradient
        colors={['rgba(21,17,13,0.55)', specialty.heroScrim]}
        locations={[0, 1]}
        style={styles.bottomBleed}
        pointerEvents="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    // No overflow:hidden here — lets bottomBleed render below outer
  },
  outer: {
    height:   320,
    overflow: 'hidden',
  },
  bottomBleed: {
    height:      80,
    marginTop:   -1, // seam-seal against the outer bottom edge
  },
  content: {
    padding: 0,
  },
  phaseCaption: {
    position: 'absolute',
    top:      space['5'],
    right:    space['5'],
  },
  phaseCaptionText: {
    color:         accent.primary,
    opacity:       0.75,
    letterSpacing: 1.2,
  },
  archetypeWrap: {
    position:        'absolute',
    top:             0,
    bottom:          80,   // stay above greeting block
    left:            0,
    right:           0,
    alignItems:      'center',
    justifyContent:  'center',
  },
  greetingBlock: {
    position: 'absolute',
    bottom:   space['5'],
    left:     space['5'],
    right:    space['5'],
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  greetingText: {
    color: text.primary,
  },
  zodiacSymbol: {
    marginLeft: space['2'],
  },
  dateText: {
    color:     text.secondary,
    marginTop: space['1'],
  },
})
