// Screen-level atmospheric background. Renders 5 static layers (base gradient +
// primary glow + optional counter glow + optional grain + optional vignette) below
// children. Variant controls glow intensity. Token-only; never animate.

import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Defs, Rect, RadialGradient, Stop } from 'react-native-svg'

import { accent, surface } from '../../design/tokens'

export interface AtmosphericBackgroundProps {
  variant?:      'hero' | 'default' | 'muted'
  glowPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  counterGlow?:  boolean
  ctaLightPool?: boolean   // dedicated warm light pool sized to sit behind a CTA in the lower third
  buttonHalo?:   boolean   // tight warm halo positioned at lower-third center — sit a CTA in this for "lit object" effect
  grain?:        boolean
  vignette?:     'none' | 'bottom' | 'top'
  children?:     React.ReactNode
}

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

// Opacity stops per variant: [center, 0.35, 0.70, edge]
const GLOW_STOPS: Record<'hero' | 'default' | 'muted', [string, string, string, string]> = {
  hero:    ['0.55', '0.22', '0.06', '0'],
  default: ['0.25', '0.10', '0.03', '0'],
  muted:   ['0.12', '0.05', '0.02', '0'],
}

// Primary glow radius per variant (as fraction of SCREEN_W)
const GLOW_RADIUS: Record<'hero' | 'default' | 'muted', number> = {
  hero:    0.95,
  default: 0.75,
  muted:   0.55,
}

// Glow center coordinates as fraction of screen dimensions
const GLOW_COORDS: Record<
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  { cx: number; cy: number }
> = {
  'top-left':     { cx: SCREEN_W * 0.28, cy: SCREEN_H * 0.32 },
  'top-right':    { cx: SCREEN_W * 0.72, cy: SCREEN_H * 0.32 },
  'bottom-left':  { cx: SCREEN_W * 0.28, cy: SCREEN_H * 0.75 },
  'bottom-right': { cx: SCREEN_W * 0.72, cy: SCREEN_H * 0.75 },
}

// Opposite corner mapping for counter glow
const OPPOSITE_CORNER: Record<
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
> = {
  'top-left':     'bottom-right',
  'top-right':    'bottom-left',
  'bottom-left':  'top-right',
  'bottom-right': 'top-left',
}

export default function AtmosphericBackground({
  variant      = 'default',
  glowPosition = 'top-left',
  counterGlow  = false,
  ctaLightPool = false,
  buttonHalo   = false,
  grain        = true,
  vignette     = 'none',
  children,
}: AtmosphericBackgroundProps) {
  const stops       = GLOW_STOPS[variant]
  const glowRadius  = SCREEN_W * GLOW_RADIUS[variant]
  const primary     = GLOW_COORDS[glowPosition]
  const counterPos  = GLOW_COORDS[OPPOSITE_CORNER[glowPosition]]
  const counterR    = SCREEN_W * 0.55

  return (
    <>
      {/* Absolute layers — renders below children */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Layer 1 — Base linear gradient: surface.deep → base → deep, vertical */}
        <LinearGradient
          colors={[surface.deep, surface.base, surface.deep]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Layers 2–4 — Radial glows + optional grain via SVG */}
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            <RadialGradient
              id="atmGlowPrimary"
              cx={primary.cx}
              cy={primary.cy}
              rx={glowRadius}
              ry={glowRadius}
              fx={primary.cx}
              fy={primary.cy}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0"    stopColor={accent.primary} stopOpacity={stops[0]} />
              <Stop offset="0.35" stopColor={accent.primary} stopOpacity={stops[1]} />
              <Stop offset="0.7"  stopColor={accent.primary} stopOpacity={stops[2]} />
              <Stop offset="1"    stopColor={accent.primary} stopOpacity={stops[3]} />
            </RadialGradient>
            {counterGlow && (
              <RadialGradient
                id="atmGlowCounter"
                cx={counterPos.cx}
                cy={counterPos.cy}
                rx={counterR}
                ry={counterR}
                fx={counterPos.cx}
                fy={counterPos.cy}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0"   stopColor={accent.primary} stopOpacity="0.20" />
                <Stop offset="0.5" stopColor={accent.primary} stopOpacity="0.07" />
                <Stop offset="1"   stopColor={accent.primary} stopOpacity="0"    />
              </RadialGradient>
            )}
            {buttonHalo && (
              <RadialGradient
                id="glowButtonHalo"
                cx={SCREEN_W * 0.5}
                cy={SCREEN_H * 0.82}
                rx={SCREEN_W * 0.45}
                ry={SCREEN_H * 0.06}
                fx={SCREEN_W * 0.5}
                fy={SCREEN_H * 0.82}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0"   stopColor={accent.primary} stopOpacity="0.55" />
                <Stop offset="0.5" stopColor={accent.primary} stopOpacity="0.18" />
                <Stop offset="1"   stopColor={accent.primary} stopOpacity="0"    />
              </RadialGradient>
            )}
            {ctaLightPool && (
              <RadialGradient
                id="glowCTAPool"
                cx={SCREEN_W * 0.5}
                cy={SCREEN_H * 0.82}
                rx={SCREEN_W * 0.7}
                ry={SCREEN_H * 0.20}
                fx={SCREEN_W * 0.5}
                fy={SCREEN_H * 0.82}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0"   stopColor={accent.primary} stopOpacity="0.32" />
                <Stop offset="0.5" stopColor={accent.primary} stopOpacity="0.10" />
                <Stop offset="1"   stopColor={accent.primary} stopOpacity="0"    />
              </RadialGradient>
            )}
          </Defs>

          {/* Layer 2 — Primary glow */}
          <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#atmGlowPrimary)" />

          {/* Layer 3 — Counter glow (optional) */}
          {counterGlow && (
            <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#atmGlowCounter)" />
          )}

          {/* Layer 3b — CTA light pool (optional): wide elliptical warm pool at 82% screen height */}
          {ctaLightPool && (
            <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#glowCTAPool)" />
          )}

          {/* Layer 3c — Button halo (optional): tight bright ellipse hugging the CTA button */}
          {buttonHalo && (
            <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#glowButtonHalo)" />
          )}

          {/* Layer 4 — Film grain (optional) */}
          {grain && NOISE.map((n, i) => (
            <Circle
              key={i}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={`rgba(255,255,255,${n.opacity.toFixed(3)})`}
            />
          ))}
        </Svg>

        {/* Layer 5 — Vignette (optional) */}
        {vignette === 'bottom' && (
          <LinearGradient
            colors={['transparent', surface.deep]}
            locations={[0, 1]}
            style={[styles.vignette, styles.vignetteBottom]}
            pointerEvents="none"
          />
        )}
        {vignette === 'top' && (
          <LinearGradient
            colors={[surface.deep, 'transparent']}
            locations={[0, 1]}
            style={[styles.vignette, styles.vignetteTop]}
            pointerEvents="none"
          />
        )}
      </View>

      {/* Layer 6 — Children rendered on top of all atmosphere layers */}
      {children != null && (
        <View style={StyleSheet.absoluteFill}>
          {children}
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  vignette: {
    position: 'absolute',
    left:     0,
    right:    0,
    height:   SCREEN_H * 0.42,
  },
  vignetteBottom: {
    bottom: 0,
  },
  vignetteTop: {
    top: 0,
  },
})
