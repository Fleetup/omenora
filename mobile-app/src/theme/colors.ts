/**
 * OMENORA Design System - Colors
 * Matches the web app design exactly
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    main: '#7B61FF',
    light: '#9B8AFF',
    dark: '#5A43CC',
    gradient: ['#7B61FF', '#9B8AFF'],
  },

  // Background Colors
  background: {
    main: '#050410',
    secondary: '#0a0a1a',
    tertiary: '#0f0f24',
    card: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },

  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.85)',
    tertiary: 'rgba(255, 255, 255, 0.6)',
    muted: 'rgba(255, 255, 255, 0.4)',
  },

  // Accent Colors
  accent: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    cosmic: '#FF6B6B',
    mystic: '#4ECDC4',
  },

  // Semantic Colors
  semantic: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF5252',
    info: '#2196F3',
  },

  // Gradient Presets
  gradients: {
    cosmic: ['#050410', '#0a0a1a', '#050410'] as const,
    primary: ['#7B61FF', '#9B8AFF'] as const,
    dark: ['#0a0a1a', '#050410'] as const,
    card: ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)'] as const,
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },
} as const;

export type Colors = typeof colors;
