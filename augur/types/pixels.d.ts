declare global {
  interface Window {
    ttq: any
    fbq: any
    _fbq: any
    TiktokAnalyticsObject: string
  }
}

interface PixelTrackViewContentParams {
  content_name: string
  content_id?: string
  value?: number
  currency?: string
}

interface PixelTrackCheckoutParams {
  value: number
  currency?: string
  content_name?: string
}

declare module '#app' {
  interface NuxtApp {
    $trackViewContent: (params: PixelTrackViewContentParams) => void
    $trackInitiateCheckout: (params: PixelTrackCheckoutParams) => void
    $trackPurchase: (params: PixelTrackCheckoutParams) => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $trackViewContent: (params: PixelTrackViewContentParams) => void
    $trackInitiateCheckout: (params: PixelTrackCheckoutParams) => void
    $trackPurchase: (params: PixelTrackCheckoutParams) => void
  }
}

export {}
