/**
 * Serves /.well-known/apple-app-site-association
 *
 * Required for iOS Universal Links. Nuxt's file-based routing skips
 * dot-prefixed directories in server/routes/ AND public/, so this
 * runs as middleware that intercepts the path explicitly.
 *
 * Must be served as application/json with no redirect.
 */
export default defineEventHandler((event) => {
  if (event.path !== '/.well-known/apple-app-site-association') {
    return
  }

  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return {
    applinks: {
      details: [
        {
          appIDs: ['FADWJ952AY.com.omenora.app'],
          components: [
            {
              '/': '/auth-callback',
              comment: 'Magic link verification — opens app instead of Safari',
            },
            {
              '/': '/account',
              '?': { token_hash: '?*' },
              comment: 'Magic link with token_hash query — opens app',
            },
          ],
        },
      ],
    },
  }
})
