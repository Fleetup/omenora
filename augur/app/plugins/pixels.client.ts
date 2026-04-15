export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const tiktokPixelId = config.public.tiktokPixelId as string
  const metaPixelId = config.public.metaPixelId as string

  // ─── TikTok Pixel ──────────────────────────────────────────────────────────
  if (tiktokPixelId) {
    ;(function (w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t
      const ttq: any = (w[t] = w[t] || [])
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug',
        'on', 'off', 'once', 'ready', 'alias', 'group',
        'enableCookie', 'disableCookie',
      ]
      ttq.setAndDefer = function (obj: any, method: string) {
        obj[method] = function () {
          obj.push([method].concat(Array.prototype.slice.call(arguments, 0)))
        }
      }
      ttq.methods.forEach((method: string) => ttq.setAndDefer(ttq, method))
      ttq.instance = function (t: string) {
        const inst = ttq._i[t] || []
        ttq.methods.forEach((method: string) => ttq.setAndDefer(inst, method))
        return inst
      }
      ttq.load = function (e: string, n: any) {
        const script = d.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + e + '&lib=' + t
        const firstScript = d.getElementsByTagName('script')[0]
        if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript)
        ttq._i = ttq._i || {}
        ttq._i[e] = []
        ttq._i[e]._u = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + e + '&lib=' + t
        ttq._t = ttq._t || {}
        ttq._t[e] = +new Date()
        ttq._o = ttq._o || {}
        ttq._o[e] = n || {}
      }
      ttq.load(tiktokPixelId)
      ttq.page()
    })(window, document, 'ttq')
  }

  // ─── Meta Pixel ────────────────────────────────────────────────────────────
  if (metaPixelId) {
    ;(function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = true
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode!.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    ;(window as any).fbq('init', metaPixelId)
    ;(window as any).fbq('track', 'PageView')
  }

  // ─── Auto PageView on every route change ───────────────────────────────────
  const router = useRouter()
  router.afterEach(() => {
    if (tiktokPixelId && (window as any).ttq) {
      ;(window as any).ttq.page()
    }
    if (metaPixelId && (window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }
  })

  // ─── Expose tracking helpers ────────────────────────────────────────────────
  return {
    provide: {
      trackViewContent: (params: {
        content_name: string
        content_id?: string
        value?: number
        currency?: string
      }) => {
        if (tiktokPixelId && (window as any).ttq) {
          ;(window as any).ttq.track('ViewContent', {
            content_name: params.content_name,
            content_category: 'Astrology',
            content_id: params.content_id || params.content_name,
            value: params.value,
            currency: params.currency || 'USD',
          })
        }
        if (metaPixelId && (window as any).fbq) {
          ;(window as any).fbq('track', 'ViewContent', {
            content_name: params.content_name,
            content_ids: [params.content_id || params.content_name],
            value: params.value,
            currency: params.currency || 'USD',
          })
        }
      },

      trackInitiateCheckout: (params: {
        value: number
        currency?: string
        content_name?: string
      }) => {
        if (tiktokPixelId && (window as any).ttq) {
          ;(window as any).ttq.track('InitiateCheckout', {
            value: params.value,
            currency: params.currency || 'USD',
            content_name: params.content_name || 'Destiny Reading',
          })
        }
        if (metaPixelId && (window as any).fbq) {
          ;(window as any).fbq('track', 'InitiateCheckout', {
            value: params.value,
            currency: params.currency || 'USD',
            num_items: 1,
          })
        }
      },

      trackPurchase: (params: {
        value: number
        currency?: string
        content_name?: string
      }) => {
        if (tiktokPixelId && (window as any).ttq) {
          ;(window as any).ttq.track('CompletePayment', {
            value: params.value,
            currency: params.currency || 'USD',
            content_name: params.content_name || 'Destiny Reading',
          })
        }
        if (metaPixelId && (window as any).fbq) {
          ;(window as any).fbq('track', 'Purchase', {
            value: params.value,
            currency: params.currency || 'USD',
            content_type: 'product',
          })
        }
      },
    },
  }
})
