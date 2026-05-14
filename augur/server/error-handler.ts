/**
 * Global server error handler.
 * - Logs structured errors to console in both environments.
 * - Captures true 5xx errors in Sentry (production only).
 * - Never leaks stack traces or internal details to API consumers.
 */
import * as Sentry from '@sentry/nuxt'
import type { NitroErrorHandler } from 'nitropack'


const OPERATIONAL_CODES = new Set([400, 401, 402, 403, 404, 409, 422, 429])

const errorHandler: NitroErrorHandler = function (error, event) {
  const isDev       = process.env.NODE_ENV === 'development'
  const statusCode  = error.statusCode || 500
  const statusMessage = error.statusMessage || 'Internal Server Error'

  const errorLog = {
    timestamp:   new Date().toISOString(),
    path:        event.path,
    method:      event.method,
    statusCode,
    statusMessage,
    ...(isDev && { stack: error.stack, data: error.data }),
  }

  if (statusCode >= 500) {
    console.error('[Server Error]', errorLog)
  } else if (isDev) {
    console.warn('[Client Error]', errorLog)
  }

  // Capture 5xx errors in Sentry — skip operational 4xx responses to avoid noise
  if (!isDev && process.env.SENTRY_DSN && !OPERATIONAL_CODES.has(statusCode)) {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('path',   event.path ?? '')
        scope.setTag('method', event.method ?? '')
        scope.setExtra('statusCode', statusCode)
        Sentry.captureException(error.cause ?? error)
      })
    } catch {
      // Never let Sentry failure break the error response
    }
  }

  setResponseStatus(event, statusCode)
  setResponseHeader(event, 'Content-Type', 'application/json')

  const response = isDev
    ? { statusCode, statusMessage, data: error.data, stack: error.stack }
    : {
        statusCode,
        statusMessage: statusCode < 500 ? statusMessage : 'Internal Server Error',
        error: statusCode < 500
          ? statusMessage
          : 'An unexpected error occurred. Please try again later.',
      }

  event.node.res.end(JSON.stringify(response))
}

export default errorHandler
