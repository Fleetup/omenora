export default {
  content: ['./app/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        bone:     '#F2EBDD',
        ink:      '#1A1612',
        inkMid:   '#3D3530',
        inkFaint: 'rgba(26,22,18,0.45)',
        gold:     '#C9A961',
        goldDim:  'rgba(201,169,97,0.55)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        serif:   ['Cormorant Garamond', 'serif'],
        sans:    ['Hanken Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
    },
  },
}
