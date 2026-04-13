/**
 * App Configuration
 */

// API Configuration
export const API_BASE_URL = 'https://api.omenora.com';

// Stripe — publishable key (safe to embed in client, prefixed EXPO_PUBLIC)
// Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
// For local development, use your local IP:
// export const API_BASE_URL = 'http://192.168.1.X:3000';

// App Info
export const APP_NAME = 'OMENORA';
export const APP_VERSION = '1.0.0';
export const APP_STORE_URL = 'https://apps.apple.com/app/omenora';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.omenora.app';

// Feature Flags
export const FEATURES = {
  APPLE_SIGN_IN: true,
  GOOGLE_PAY: true,
  APPLE_PAY: true,
  PUSH_NOTIFICATIONS: true,
  DARK_MODE_ONLY: true,
} as const;

// Reading Types
export const READING_TYPES = {
  DESTINY: 'destiny',
  BIRTH_CHART: 'birth-chart',
  COMPATIBILITY: 'compatibility',
  CALENDAR: 'calendar',
  DAILY_INSIGHT: 'daily-insight',
} as const;

// Zodiac Signs
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

// Archetypes
export const ARCHETYPES = [
  'The Visionary', 'The Strategist', 'The Nurturer',
  'The Creator', 'The Explorer', 'The Harmonizer',
  'The Seeker', 'The Leader', 'The Sage'
] as const;

// Life Path Numbers
export const LIFE_PATH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
