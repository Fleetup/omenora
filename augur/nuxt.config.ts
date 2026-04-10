// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/sentry'],

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    stripeDailyPriceId: process.env.STRIPE_DAILY_PRICE_ID,
    public: {
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      // Update NUXT_PUBLIC_SITE_URL in .env to match your production domain
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://omenora.com',
      sentryDsn: process.env.SENTRY_DSN,
    },
  },

  nitro: {
    experimental: {
      wasm: true,
    },
    errorHandler: '~/server/error-handler',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    publishRelease: {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    config: {
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.0,
      replaysOnErrorSampleRate: 1.0,
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ['canvas'],
    },
  },

  app: {
    head: {
      titleTemplate: '%s | OMENORA',
      title: 'Free AI Astrology Reading & Destiny Report',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Get your free AI-powered destiny analysis in 10 seconds. Personalized birth chart, life path number, love compatibility & 2026 astrology forecast — no login required. 3.9M+ readings.',
        },
        { name: 'theme-color', content: '#050410' },
        { name: 'robots', content: 'index, follow' },
        // Open Graph defaults
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'OMENORA' },
        { property: 'og:locale', content: 'en_US' },
        {
          property: 'og:title',
          content: 'Free AI Astrology Reading & Destiny Report | OMENORA',
        },
        {
          property: 'og:description',
          content:
            'Your personalized destiny report powered by AI. Free birth chart, life path number, love compatibility & 2026 forecast in 10 seconds.',
        },
        { property: 'og:image', content: 'https://omenora.com/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'OMENORA — AI Astrology & Destiny Analysis' },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@omenora' },
        { name: 'twitter:title', content: 'Free AI Astrology Reading — OMENORA' },
        {
          name: 'twitter:description',
          content:
            'Personalized destiny report in 10 seconds. AI birth chart, life path number & 2026 forecast. Free, no login.',
        },
        { name: 'twitter:image', content: 'https://omenora.com/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
})
