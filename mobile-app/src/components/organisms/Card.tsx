import React, { useMemo } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import PlanetGraph from '../../../assets/svg-bg/Card-Graphs/Planet-Graph-Mobile.svg'
import StarGraph from '../../../assets/svg-bg/Card-Graphs/Star-Graph-Mobile.svg'
import SunGraph from '../../../assets/svg-bg/Card-Graphs/Sun-Graph-Mobile.svg'
import { cardTokens, radius, layout, tokens } from '../../design/tokens'

// Graph pools per card tier — picked randomly at mount, stable per instance
type GraphComponent = React.FC<{ width: number; height: number; fill: string; preserveAspectRatio: string }>
const SOLID_GRAPHS:    GraphComponent[] = [PlanetGraph as GraphComponent, StarGraph as GraphComponent]
const GRADIENT_GRAPHS: GraphComponent[] = [PlanetGraph as GraphComponent, StarGraph as GraphComponent, SunGraph as GraphComponent]
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!

export interface CardProps {
  /**
   * Visual tier of the card surface:
   * - content      — solid #18172A, hairline border, content list cards
   * - elevated     — solid #1F1E33, hairline border, featured content (DailyCard)
   * - premium      — cosmic deep blue-violet gradient #2E2B5F→#14152A, spotlight from top center
   * - featured     — warm copper gradient #A87850→#5A3A22, ad-hoc featured moments only
   * - accent-navy  — vertical gradient deep navy #2A2F5A→#1E2245
   * - accent-rust  — vertical gradient warm rust #C25A2E→#9A4520
   * - locked       — solid #18172A, no border
   *
   * Deprecated aliases (render as nearest new variant, remove in 15b):
   * - default → content
   * - raised  → elevated
   * - glass   → content
   * - accent  → accent-rust
   */
  variant?: 'content' | 'elevated' | 'premium' | 'featured' | 'accent-navy' | 'accent-rust' | 'locked'
    | 'default' | 'raised' | 'glass' | 'accent'
  padding?: 'compact' | 'default' | 'premium'
  children: React.ReactNode
  style?: ViewStyle
}

// Resolve deprecated variant aliases to canonical names
function resolveVariant(v: NonNullable<CardProps['variant']>): 'content' | 'elevated' | 'premium' | 'featured' | 'accent-navy' | 'accent-rust' | 'locked' {
  switch (v) {
    case 'default': return 'content'   // @deprecated
    case 'raised':  return 'elevated'  // @deprecated
    case 'glass':   return 'content'   // @deprecated
    case 'accent':  return 'accent-rust' // @deprecated
    default:        return v
  }
}

// ── Solid variant configs ─────────────────────────────────────────────────────
type SolidConfig = {
  kind:            'solid'
  backgroundColor: string
  borderWidth:     number
  borderColor:     string
  borderRadius:    number
}

const solidConfig: Record<'content' | 'elevated' | 'locked', SolidConfig> = {
  content: {
    kind:            'solid',
    backgroundColor: cardTokens.background.content,
    borderWidth:     1,
    borderColor:     cardTokens.border.content,
    borderRadius:    radius.lg,
  },
  elevated: {
    kind:            'solid',
    backgroundColor: cardTokens.background.elevated,
    borderWidth:     1,
    borderColor:     cardTokens.border.elevated,
    borderRadius:    radius.lg,
  },
  locked: {
    kind:            'solid',
    backgroundColor: cardTokens.background.locked,
    borderWidth:     0,
    borderColor:     cardTokens.border.locked,
    borderRadius:    radius.lg,
  },
}

// ── Gradient variant configs ──────────────────────────────────────────────────
type GradientConfig = {
  kind:         'gradient'
  colors:       [string, string]
  borderRadius: number
}

type GradientConfigFull = GradientConfig & {
  start: { x: number; y: number }
  end:   { x: number; y: number }
}

const gradientConfig: Record<'premium' | 'featured' | 'accent-navy' | 'accent-rust', GradientConfigFull> = {
  premium: {
    kind:         'gradient',
    colors:       cardTokens.background.premiumGradient,
    borderRadius: radius.lg,
    // Spotlight from top-center: slightly above the card top, converges at bottom
    // Produces a soft "light from above" luminance hierarchy even with LinearGradient
    start:        { x: 0.5, y: -0.15 },
    end:          { x: 0.5, y: 1 },
  },
  featured: {
    kind:         'gradient',
    colors:       cardTokens.background.featuredGradient,
    borderRadius: radius.lg,
    start:        { x: 0.5, y: -0.15 },
    end:          { x: 0.5, y: 1 },
  },
  'accent-navy': {
    kind:         'gradient',
    colors:       cardTokens.background.accentNavyGradient,
    borderRadius: radius.lg,
    start:        { x: 0, y: 0 },
    end:          { x: 0, y: 1 },
  },
  'accent-rust': {
    kind:         'gradient',
    colors:       cardTokens.background.accentRustGradient,
    borderRadius: radius.lg,
    start:        { x: 0, y: 0 },
    end:          { x: 0, y: 1 },
  },
}

const paddingMap = {
  compact: layout.cardPaddingCompact,
  default: layout.cardPaddingDefault,
  premium: layout.cardPaddingPremium,
} as const

export const Card: React.FC<CardProps> = ({
  variant = 'content',
  padding = 'default',
  children,
  style,
}) => {
  const canonical = resolveVariant(variant)
  const pad = paddingMap[padding]

  // Pick a random graph once at mount — stable for lifetime of this instance
  const GraphComponent = useMemo(
    () => pickRandom(canonical === 'locked' ? SOLID_GRAPHS : GRADIENT_GRAPHS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (canonical === 'premium' || canonical === 'featured' || canonical === 'accent-navy' || canonical === 'accent-rust') {
    const cfg = gradientConfig[canonical]
    const border = canonical === 'premium'
      ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }
      : {}
    const graphFill = canonical === 'accent-rust'
      ? tokens.accent.primary
      : '#ffffff'
    return (
      <View style={[{ borderRadius: cfg.borderRadius, overflow: 'hidden' }, border, style]}>
        <LinearGradient
          colors={cfg.colors}
          start={cfg.start}
          end={cfg.end}
          style={styles.shell}
        >
          <BlurView intensity={20} tint="dark" style={styles.fill}>
            <View style={styles.glassTint} />
            <View style={styles.graphOverlay} pointerEvents="none">
              <GraphComponent
                width={220}
                height={220}
                fill={graphFill}
                preserveAspectRatio="xMaxYMid meet"
              />
            </View>
            <View style={{ padding: pad }}>
              {children}
            </View>
          </BlurView>
        </LinearGradient>
      </View>
    )
  }

  const cfg = solidConfig[canonical]
  // locked variant gets no graph decoration
  const showGraph = canonical !== 'locked'
  return (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: cfg.backgroundColor,
          borderRadius:    cfg.borderRadius,
          borderWidth:     cfg.borderWidth,
          borderColor:     cfg.borderColor,
        },
        style,
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.fill}>
        <View style={styles.glassTint} />
        {showGraph && (
          <View style={styles.graphOverlay} pointerEvents="none">
            <GraphComponent
              width={220}
              height={220}
              fill={tokens.accent.primary}
              preserveAspectRatio="xMaxYMid meet"
            />
          </View>
        )}
        <View style={{ padding: pad }}>
          {children}
        </View>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',  // clips border-radius on child content
  },
  fill: {
    flex: 1,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.specialty.glassTint,
  },
  graphOverlay: {
    position: 'absolute',
    right:    -40,
    bottom:   -40,
    opacity:  0.09,
  },
})
