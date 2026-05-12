import * as Sentry from '@sentry/nuxt'

// Server config runs before Nuxt initialises — use process.env directly.
// Railway injects env vars at container startup; process.env is populated
// by the time this module is loaded via the --import flag.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    release: process.env.npm_package_name && process.env.npm_package_version
      ? `${process.env.npm_package_name}@${process.env.npm_package_version}`
      : undefined,

    tracesSampleRate: 0,
    sendDefaultPii: false,

    beforeSend(event) {
      // Scrub PII from user object
      if (event.user) {
        delete event.user.ip_address
        delete event.user.email
      }

      // Scrub user-agent from request headers
      if (event.request?.headers) {
        const headers = event.request.headers as Record<string, unknown>
        delete headers['user-agent']
        delete headers['User-Agent']
      }

      // Scrub PII and secrets from request body / extra / contexts
      const scrubObject = (obj: Record<string, unknown>) => {
        const PII_FIELDS = ['email', 'firstName', 'dateOfBirth', 'city', 'ip_address']
        const SECRET_PATTERN = /token|secret|key|password/i

        for (const field of PII_FIELDS) {
          if (field in obj) obj[field] = '[Filtered]'
        }
        for (const field of Object.keys(obj)) {
          if (SECRET_PATTERN.test(field)) obj[field] = '[Filtered]'
        }
      }

      if (event.request?.data && typeof event.request.data === 'object') {
        scrubObject(event.request.data as Record<string, unknown>)
      }
      if (event.extra && typeof event.extra === 'object') {
        scrubObject(event.extra as Record<string, unknown>)
      }

      return event
    },
  })
}
