/**
 * OMENORA Font System — mirrors web app exactly.
 *
 * Web:
 *   'Cormorant Garamond' — display/brand (large titles, archetype names, numbers)
 *   'Playfair Display'   — section headings
 *   'Inter'              — UI body, labels, buttons
 *
 * Usage:
 *   fontFamily: fonts.cormorant       // light serif display
 *   fontFamily: fonts.cormorantItalic // italic variant
 *   fontFamily: fonts.playfair        // heading serif
 *   fontFamily: fonts.inter           // body / UI
 */
export const fonts = {
  cormorant:        'CormorantGaramond_300Light',
  cormorantItalic:  'CormorantGaramond_300Light_Italic',
  cormorantMedium:  'CormorantGaramond_500Medium',
  playfair:         'PlayfairDisplay_400Regular',
  playfairItalic:   'PlayfairDisplay_400Regular_Italic',
  inter:            'Inter_300Light',
  interRegular:     'Inter_400Regular',
  interMedium:      'Inter_500Medium',
} as const;

export type Fonts = typeof fonts;
