export const fontFamily = {
  display:            'Fraunces_300Light',
  displayItalic:      'Fraunces_300Light_Italic',
  displayMedium:      'Fraunces_500Medium',
  ui:                 'Poppins_400Regular',
  uiMedium:           'Poppins_500Medium',
  uiSemiBold:         'Poppins_600SemiBold',
  readingSerif:       'CormorantGaramond_300Light',
  readingSerifItalic: 'CormorantGaramond_300Light_Italic',
} as const

export const typeScale = {
  hero:          { fontFamily: fontFamily.display,           fontSize: 56, lineHeight: 64, letterSpacing: -0.6 },
  display1:      { fontFamily: fontFamily.display,           fontSize: 40, lineHeight: 48, letterSpacing: -0.5 },
  display2:      { fontFamily: fontFamily.display,           fontSize: 32, lineHeight: 40, letterSpacing: -0.4 },
  displayItalic: { fontFamily: fontFamily.displayItalic,     fontSize: 32, lineHeight: 40, letterSpacing: -0.3 },
  heading1:      { fontFamily: fontFamily.displayMedium,     fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  title2:        { fontFamily: fontFamily.displayMedium,     fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  heading2:      { fontFamily: fontFamily.uiSemiBold,        fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
  readingBody:   { fontFamily: fontFamily.readingSerif,      fontSize: 18, lineHeight: 30, letterSpacing: 0 },
  bodyLarge:     { fontFamily: fontFamily.ui,                fontSize: 17, lineHeight: 26, letterSpacing: 0 },
  labelLarge:    { fontFamily: fontFamily.uiMedium,          fontSize: 17, lineHeight: 24, letterSpacing: 0 },
  body:          { fontFamily: fontFamily.ui,                fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  label:         { fontFamily: fontFamily.uiMedium,          fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  caption:       { fontFamily: fontFamily.ui,                fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  micro:         { fontFamily: fontFamily.uiSemiBold,        fontSize: 11, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  subMicro:      { fontFamily: fontFamily.uiSemiBold,        fontSize: 10, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' as const },
} as const
