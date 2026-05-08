export default defineEventHandler((event) => {
  const aasa = {
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

  const res = event.node.res
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.statusCode = 200
  res.end(JSON.stringify(aasa, null, 2))
})
