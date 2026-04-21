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
      posthogKey: '',
    },
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      wasm: true,
    },
    errorHandler: '~~/server/error-handler',
    // sweph is a native Node.js addon (node-gyp-build). Bundling it breaks the
    // __dirname-based prebuild resolution at runtime. Mark it external so Nitro
    // emits a real require('sweph') that resolves from node_modules at runtime.
    externals: {
      external: ['sweph'],
    },
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
      title: 'OMENORA — AI Personality & Astrology Reading',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        {
          name: 'description',
          content:
            'Discover your personality archetype through astrology, numerology, and ancient wisdom from six traditions. Free AI-generated reading in 60 seconds.',
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
          content: 'OMENORA — AI Personality & Astrology Reading',
        },
        {
          property: 'og:description',
          content:
            'Discover your personality archetype through astrology, numerology, and six ancient traditions. Free AI-generated reading in 60 seconds. No account required.',
        },
        { property: 'og:image', content: 'https://omenora.com/og-image.png' },
        { property: 'og:image:secure_url', content: 'https://omenora.com/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'OMENORA — AI Personality & Astrology Reading' },
        { property: 'og:image:type', content: 'image/png' },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@omenora' },
        { name: 'twitter:creator', content: '@omenora' },
        { name: 'twitter:title', content: 'OMENORA — AI Personality & Astrology Reading' },
        {
          name: 'twitter:description',
          content:
            'Discover your personality archetype using astrology and numerology. Free AI reading in 60 seconds. No account required.',
        },
        { name: 'twitter:image', content: 'https://omenora.com/og-image.png' },
        { name: 'twitter:image:alt', content: 'OMENORA — AI Personality & Astrology Reading' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
        { rel: 'icon', href: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { rel: 'icon', href: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'sitemap', type: 'application/xml', href: 'https://omenora.com/sitemap.xml' },
        // Self-hosted Inter font preloads — WOFF2 for optimal compression and browser support
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Inter-Regular.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Inter-Medium.woff2', crossorigin: '' },
        // Cormorant Garamond + Playfair Display — Google Fonts stylesheet (display fonts, non-blocking)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap' },
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
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': 'https://omenora.com/#website',
                url: 'https://omenora.com',
                name: 'OMENORA',
                description: 'AI-powered astrology and destiny analysis. Free birth chart, life path number, love compatibility & 2026 forecast.',
                inLanguage: 'en',
                publisher: { '@id': 'https://omenora.com/#organization' },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://omenora.com/analysis?q={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'Organization',
                '@id': 'https://omenora.com/#organization',
                name: 'OMENORA',
                legalName: 'United Northwest Carriers Inc.',
                alternateName: 'UNC Development',
                url: 'https://omenora.com',
                description: 'AI-powered destiny analysis and astrology platform. Personalized birth charts, life path numbers, love compatibility, and 2026 cosmic forecasts generated in seconds.',
                slogan: 'AI decoded your destiny. Science explains why.',
                logo: {
                  '@type': 'ImageObject',
                  '@id': 'https://omenora.com/#logo',
                  url: 'https://omenora.com/og-image.png',
                  width: 1200,
                  height: 630,
                  caption: 'OMENORA',
                },
                image: { '@id': 'https://omenora.com/#logo' },
                foundingDate: '2025',
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: 'support@omenora.com',
                  areaServed: 'Worldwide',
                  availableLanguage: ['English'],
                },
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Addison',
                  addressRegion: 'IL',
                  addressCountry: 'US',
                },
                knowsAbout: [
                  'Astrology',
                  'Numerology',
                  'Birth Charts',
                  'Life Path Numbers',
                  'Zodiac Compatibility',
                  'Horoscopes',
                  'Destiny Analysis',
                ],
                sameAs: [
                  'https://www.tiktok.com/@omenora',
                  // 'https://www.instagram.com/omenora',
                  // 'https://www.facebook.com/omenora',
                  // 'https://twitter.com/omenora',
                  // 'https://www.youtube.com/@omenora',
                  // 'https://www.linkedin.com/company/omenora',
                  // 'https://www.pinterest.com/omenora',
                ],
              },
            ],
          }),
        },
      ],
    },
  },
})
