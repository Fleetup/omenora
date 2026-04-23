export default defineEventHandler((event) => {
  const today = new Date().toISOString().split('T')[0]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    '  <url>',
    '    <loc>https://omenora.com</loc>',
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://omenora.com"/>',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://omenora.com"/>',
    '  </url>',
    '  <url>',
    '    <loc>https://omenora.com/daily</loc>',
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>0.9</priority>',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://omenora.com/daily"/>',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://omenora.com/daily"/>',
    '  </url>',
    '  <url>',
    '    <loc>https://omenora.com/privacy</loc>',
    '    <lastmod>2026-04-10</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.4</priority>',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://omenora.com/privacy"/>',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://omenora.com/privacy"/>',
    '  </url>',
    '  <url>',
    '    <loc>https://omenora.com/terms</loc>',
    '    <lastmod>2026-04-10</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.4</priority>',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://omenora.com/terms"/>',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://omenora.com/terms"/>',
    '  </url>',
    '</urlset>',
  ].join('\n')

  const res = event.node.res
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.statusCode = 200
  res.end(xml)
})
