export const surface = {
  deep:    '#0A0604',
  base:    '#120D08',
  raised:  '#1A130C',
  overlay: '#221A12',
  floating:'#2A2218',
  inverse: '#F5F0E8',
} as const

export const text = {
  primary:   'rgba(255,255,255,0.93)',
  secondary: 'rgba(255,255,255,0.68)',
  tertiary:  'rgba(255,255,255,0.45)',
  disabled:  'rgba(255,255,255,0.30)',
  inverse:   '#120D08',
  accent:    '#C9A961',
} as const

export const accent = {
  primary:  '#C9A961',
  emphasis: '#E0C078',
  subtle:   'rgba(201,169,97,0.10)',
  muted:    'rgba(201,169,97,0.04)',
} as const

export const border = {
  subtle:  'rgba(255,255,255,0.06)',
  default: 'rgba(255,255,255,0.10)',
  strong:  'rgba(255,255,255,0.18)',
  accent:  'rgba(201,169,97,0.40)',
  hairline:'rgba(255,255,255,0.04)',
  gold:    'rgba(201,169,97,0.22)',
} as const

export const state = {
  success: '#5EBE8A',
  warning: '#D9A24A',
  danger:  '#E07D7D',
  info:    '#7AA0E0',
} as const

export const specialty = {
  lockScrim:    'rgba(5,4,16,0.65)',
  lockBlur:     40,
  chatUser:     '#13122A',
  chatCounsel:  'rgba(201,169,97,0.10)',
  glassTint:    'rgba(255,255,255,0.10)',
  white:        '#FFFFFF',
  overlayScrim: 'rgba(0,0,0,0.60)',
} as const

export const tokens = { surface, text, accent, border, state, specialty } as const
export type DesignTokens = typeof tokens
