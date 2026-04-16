// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    ...(process.env.SENTRY_DSN ? ['@nuxtjs/sentry'] : []),
  ],

  runtimeConfig: {
    // Empty string defaults — Nitro reads the actual process.env at container
    // startup (runtime), not at Docker build time when secrets are not present.
    // Railway variable names stay exactly as set: ANTHROPIC_API_KEY, etc.
    anthropicApiKey: '',
    stripeSecretKey: '',
    resendApiKey: '',
    supabaseUrl: '',
    supabaseServiceKey: '',
    stripeDailyPriceId: '',
    emailJobSecret: '',
    stripeWebhookSecret: '',
    redisUrl: '',
    public: {
      stripePublishableKey: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      siteUrl: 'https://omenora.com',
      sentryDsn: '',
      tiktokPixelId: '',
      metaPixelId: '',
    },
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      wasm: true,
    },
    errorHandler: '~~/server/error-handler',
  },

  routeRules: {
    '/api/**': {
      cors: false,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    },
  },

  // @ts-expect-error - @nuxtjs/sentry module extends NuxtConfig type
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
    build: {
      sourcemap: false,
    },
  },

  app: {
    head: {
      titleTemplate: '%s | OMENORA',
      title: 'Free AI Astrology Reading & Destiny Report',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        {
          name: 'description',
          content:
            'Get your free AI-powered destiny analysis in 10 seconds. Personalized birth chart, life path number, love compatibility & 2026 astrology forecast — no login required. 3.9M+ readings.',
        },
        { name: 'theme-color', content: '#050410' },
        { name: 'msapplication-TileColor', content: '#050410' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'author', content: 'OMENORA' },
        { name: 'copyright', content: '© 2026 OMENORA. All rights reserved.' },
        { name: 'application-name', content: 'OMENORA' },
        { name: 'apple-mobile-web-app-title', content: 'OMENORA' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        // Open Graph defaults
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'OMENORA' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:url', content: 'https://omenora.com' },
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
        { property: 'og:image:type', content: 'image/png' },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@omenora' },
        { name: 'twitter:creator', content: '@omenora' },
        { name: 'twitter:title', content: 'Free AI Astrology Reading — OMENORA' },
        {
          name: 'twitter:description',
          content:
            'Personalized destiny report in 10 seconds. AI birth chart, life path number & 2026 forecast. Free, instant, no login required.',
        },
        { name: 'twitter:image', content: 'https://omenora.com/og-image.png' },
        { name: 'twitter:image:alt', content: 'OMENORA — AI Astrology & Destiny Analysis' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'sitemap', type: 'application/xml', href: 'https://omenora.com/sitemap.xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Performance: Preconnect to critical third-party domains
        { rel: 'preconnect', href: 'https://js.stripe.com' },
        { rel: 'preconnect', href: 'https://api.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://js.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://api.stripe.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': 'https://omenora.com/#website',
            url: 'https://omenora.com',
            name: 'OMENORA',
            description: 'AI-powered astrology and destiny analysis. Free birth chart, life path number, love compatibility & 2026 forecast.',
            inLanguage: 'en',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://omenora.com/analysis?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        },
      ],
    },
  },
})
