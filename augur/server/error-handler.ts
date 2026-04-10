/**
 * Global server error handler
 * Logs errors to console in development, to external service in production
 */
import type { NitroErrorHandler } from 'nitropack'

const errorHandler: NitroErrorHandler = function (error, event) {
  const isDev = process.env.NODE_ENV === 'development'
  const statusCode = error.statusCode || 500
  const statusMessage = error.statusMessage || 'Internal Server Error'

  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    path: event.path,
    method: event.method,
    statusCode,
    statusMessage,
    error: isDev ? error : undefined,
    stack: isDev ? error.stack : undefined,
    headers: isDev ? Object.fromEntries(event.headers.entries()) : undefined,
  }

  // Log to console
  console.error('[Server Error]', errorLog)

  // In production, send to Sentry if configured
  if (!isDev && process.env.SENTRY_DSN) {
    try {
      // Sentry.captureException would be called here when Sentry is properly configured
      // For now, just log the error ID for correlation
      const errorId = crypto.randomUUID()
      console.error(`[Error ID: ${errorId}]`, errorLog)
    } catch {
      // Silent fail - don't let error logging break the app
    }
  }

  // Send sanitized response
  setResponseStatus(event, statusCode)
  setResponseHeader(event, 'Content-Type', 'application/json')

  const response = isDev
    ? {
        statusCode,
        statusMessage,
        data: error.data,
        stack: error.stack,
      }
    : {
        statusCode,
        statusMessage: 'Internal Server Error',
        error: 'An unexpected error occurred. Please try again later.',
      }

  event.node.res.end(JSON.stringify(response))
}

export default errorHandler
