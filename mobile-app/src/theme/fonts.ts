/**
 * OMENORA Font System — mirrors web app design system.
 *
 * Web:
 *   'Fraunces'           — primary display face (hero titles, archetype names, large headings)
 *   'Cormorant Garamond' — serif body / secondary display
 *   'Hanken Grotesk'     — UI labels, buttons, annotations, caps
 *   'Inter'              — fallback UI / body text
 *
 * Usage:
 *   fontFamily: fonts.fraunces          // display serif italic (hero)
 *   fontFamily: fonts.frauncesItalic    // italic display
 *   fontFamily: fonts.cormorant         // light serif body
 *   fontFamily: fonts.cormorantItalic   // italic serif
 *   fontFamily: fonts.hanken            // UI label regular
 *   fontFamily: fonts.hankenMedium      // UI label medium
 *   fontFamily: fonts.hankenSemiBold    // UI caps buttons/annotations
 *   fontFamily: fonts.inter             // fallback UI body
 */
export const fonts = {
  // ── Display ──────────────────────────────────────────────────────────────
  fraunces:         'Fraunces_300Light',
  frauncesItalic:   'Fraunces_300Light_Italic',
  frauncesMedium:   'Fraunces_500Medium',

  // ── Serif body ───────────────────────────────────────────────────────────
  cormorant:        'CormorantGaramond_300Light',
  cormorantItalic:  'CormorantGaramond_300Light_Italic',
  cormorantMedium:  'CormorantGaramond_500Medium',
  playfair:         'PlayfairDisplay_400Regular',
  playfairItalic:   'PlayfairDisplay_400Regular_Italic',

  // ── Sans UI ──────────────────────────────────────────────────────────────
  hanken:           'HankenGrotesk_400Regular',
  hankenMedium:     'HankenGrotesk_500Medium',
  hankenSemiBold:   'HankenGrotesk_600SemiBold',
  inter:            'Inter_300Light',
  interRegular:     'Inter_400Regular',
  interMedium:      'Inter_500Medium',
} as const;

export type Fonts = typeof fonts;
