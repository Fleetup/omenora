export const duration = {
  micro:      150,
  fast:       200,
  default:    250,
  transition: 300,
  hero:       500,
} as const

export const easing = {
  enter:      'easeOut',
  exit:       'easeIn',
  transition: 'easeInOut',
} as const

export const stagger = {
  child:      60,
  maxVisible: 4,
} as const
