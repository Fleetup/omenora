export default defineEventHandler((event) => {
  const txt = [
    '# OMENORA Robots.txt',
    '# Last Updated: 2026-04-14',
    '',
    '# All crawlers',
    'User-agent: *',
    'Allow: /$',
    'Allow: /privacy',
    'Allow: /terms',
    'Disallow: /analysis',
    'Disallow: /preview',
    'Disallow: /report',
    'Disallow: /calendar',
    'Disallow: /compatibility',
    'Disallow: /subscription',
    'Disallow: /api/',
    '',
    '# AI crawlers',
    'User-agent: GPTBot',
    'Disallow: /',
    '',
    'User-agent: ChatGPT-User',
    'Disallow: /',
    '',
    'User-agent: PerplexityBot',
    'Disallow: /',
    '',
    '# Sitemap location',
    'Sitemap: https://omenora.com/sitemap.xml',
  ].join('\n')

  const res = event.node.res
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.statusCode = 200
  res.end(txt)
})
