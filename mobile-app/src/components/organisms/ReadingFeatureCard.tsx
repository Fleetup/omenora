import React from 'react'
import { View, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text, Button } from '../atoms'
import { Card } from './Card'
import { accent, text } from '../../design/tokens/colors'
import { space } from '../../design/tokens/spacing'

export interface ReadingFeatureCardProps {
  /**
   * "flagship" — Card variant "featured" (copper gradient). Reserved for archetype reading.
   * "standard" — Card variant "premium" (warm umber gradient). For other reading offerings.
   */
  variant:      'flagship' | 'standard'
  /** Eyebrow label above the headline, e.g. "FULL ARCHETYPE READING" */
  eyebrow:      string
  /** Serif benefit headline */
  title:        string
  /** Value-prop body copy */
  description:  string
  /** Pre-rendered icon/glyph node. The wrapper applies 0.16 opacity watermark treatment. */
  glyph:        React.ReactNode
  /** CTA button label. Defaults to "Unlock". */
  ctaLabel?:    string
  onUnlockPress: () => void
  /** Analytics placement identifier (unused at render — kept for future analytics work). */
  placement:    string
}

export const ReadingFeatureCard: React.FC<ReadingFeatureCardProps> = ({
  variant,
  eyebrow,
  title,
  description,
  glyph,
  ctaLabel = 'Unlock',
  onUnlockPress,
  placement: _placement,
}) => {
  const cardVariant = variant === 'flagship' ? 'featured' : 'premium'
  const eyebrowColor = variant === 'flagship' ? accent.primary : text.tertiary

  const handleUnlockPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onUnlockPress()
  }

  return (
    <Card variant={cardVariant} padding="premium">
      {/* Watermark glyph — absolutely positioned right, vertically centered, fixed 0.16 opacity */}
      <View style={styles.glyphWrap} pointerEvents="none">
        <View style={styles.glyphOpacity}>
          {glyph}
        </View>
      </View>

      {/* Text content layer */}
      <View style={styles.content}>
        <Text variant="subMicro" style={[styles.eyebrow, { color: eyebrowColor }]}>
          {eyebrow.toUpperCase()}
        </Text>
        <Text variant="display2" color="primary" style={styles.title}>
          {title}
        </Text>
        <Text variant="body" color="secondary" style={styles.description}>
          {description}
        </Text>
        <Button
          label={ctaLabel}
          variant="premium"
          fullWidth
          onPress={handleUnlockPress}
          style={styles.cta}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  glyphWrap: {
    position:       'absolute',
    right:          -space['4'],
    top:            0,
    bottom:         0,
    justifyContent: 'center',
  },
  glyphOpacity: {
    opacity: 0.16,
  },
  content: {
    // Reserves right space so text doesn't collide with glyph watermark
    paddingRight: space['12'],
  },
  eyebrow: {
    letterSpacing: 1.5,
  },
  title: {
    marginTop: space['3'],
  },
  description: {
    marginTop: space['2'],
  },
  cta: {
    marginTop: space['4'],
  },
})
