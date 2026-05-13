import { ViewStyle } from 'react-native'

// Multi-layer shadow tokens. Each value is a complete ViewStyle fragment.
// iOS reads shadowColor/Offset/Opacity/Radius. Android reads elevation.
// For multi-layer iOS shadows, components compose nested Views — see PremiumCard usage.

type ElevationLevel = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>

export const elevation: Record<string, ElevationLevel> = {
  // Subtle resting state — list items, inactive cards
  cardSubtle: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius:  6,
    elevation:     2,
  },

  // Default card — primary card surfaces
  cardShadow: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius:  16,
    elevation:     6,
  },

  // Premium card — single-layer fallback; for true multi-layer effect, see cardShadowPremiumLayers
  cardShadowPremium: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 12 },
    shadowOpacity: 0.42,
    shadowRadius:  28,
    elevation:     12,
  },

  // Floating elements — bottom sheets, modals
  floating: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius:  36,
    elevation:     16,
  },
} as const

// Multi-layer shadow stacks for premium cards.
// iOS shadowColor is per-View; to layer shadows, wrap a card in nested Views,
// each applying one layer from this array. Android stacks via elevation alone.
// Usage example (in a component):
//   <View style={cardShadowPremiumLayers[0]}>
//     <View style={cardShadowPremiumLayers[1]}>
//       <View style={cardShadowPremiumLayers[2]}>
//         {cardContent}
//       </View>
//     </View>
//   </View>
export const cardShadowPremiumLayers: ElevationLevel[] = [
  // Layer 1 — far ambient cool shadow (atmospheric depth)
  {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 24 },
    shadowOpacity: 0.35,
    shadowRadius:  48,
    elevation:     0,
  },
  // Layer 2 — mid contact shadow
  {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius:  16,
    elevation:     0,
  },
  // Layer 3 — close tight shadow (defines edge)
  {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.40,
    shadowRadius:  4,
    elevation:     12,
  },
] as const

// Warm glow stack — for emphasis on premium CTA buttons and high-value surfaces.
// Uses a tinted shadow color (warm amber) at low opacity to suggest the surface is "lit".
export const warmGlow: ElevationLevel = {
  shadowColor:   '#C9A961',  // accent.primary
  shadowOffset:  { width: 0, height: 0 },
  shadowOpacity: 0.45,
  shadowRadius:  24,
  elevation:     0,
}
