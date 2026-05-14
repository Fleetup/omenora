export const space = {
  '0.5': 2,  '1':  4,  '1.5': 6,
  '2':   8,  '3': 12,  '4':  16,
  '5':  20,  '6': 24,  '8':  32,
  '10': 40,  '12': 48, '16': 64,
  '20': 80,  '24': 96,
} as const

export const layout = {
  screenPadding:      20,
  cardPaddingCompact: 16,
  cardPaddingDefault: 20,
  cardPaddingPremium: 28,  // Cluster 15a: increased from 24 for premium hero card breathing room
  cardGap:            16,  // Cluster 15a: increased from 12 for inter-card breathing room
  sectionGap:         32,
  tapTarget:          44,
} as const
