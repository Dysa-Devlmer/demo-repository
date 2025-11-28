/**
 * Analytics & Tracking Utilities
 *
 * Helper functions for Google Analytics 4, Facebook Pixel, and custom event tracking
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

// Plan types for tracking
export type PlanType = 'saas-multi' | 'saas-dedicated' | 'on-premise'

// Event categories
export type EventCategory =
  | 'engagement'
  | 'conversion'
  | 'navigation'
  | 'ecommerce'

/**
 * Track a page view
 */
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView')
  }
}

/**
 * Track when user clicks "Pide tu Demo" or similar CTA
 */
export const trackLeadGeneration = (source: string, value: number = 99990) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'CLP',
      value: value,
      source: source,
      event_category: 'conversion',
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      currency: 'CLP',
      value: value,
      content_name: source,
    })
  }

  console.log('📊 Lead tracked:', { source, value })
}

/**
 * Track when user starts checkout process
 */
export const trackBeginCheckout = (plan: PlanType, value: number) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'CLP',
      value: value,
      items: [
        {
          item_id: plan,
          item_name: getPlanName(plan),
          price: value,
          quantity: 1,
        },
      ],
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      currency: 'CLP',
      value: value,
      content_name: getPlanName(plan),
      content_ids: [plan],
    })
  }

  console.log('📊 Begin Checkout tracked:', { plan, value })
}

/**
 * Track when user selects a plan
 */
export const trackSelectPlan = (plan: PlanType, value: number) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'select_item', {
      currency: 'CLP',
      value: value,
      items: [
        {
          item_id: plan,
          item_name: getPlanName(plan),
          price: value,
        },
      ],
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      currency: 'CLP',
      value: value,
      content_name: getPlanName(plan),
      content_type: 'product',
    })
  }

  console.log('📊 Plan selected:', { plan, value })
}

/**
 * Track when user adds payment info
 */
export const trackAddPaymentInfo = (paymentMethod: string) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'add_payment_info', {
      payment_type: paymentMethod,
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      content_name: paymentMethod,
    })
  }

  console.log('📊 Payment info added:', { paymentMethod })
}

/**
 * Track successful purchase/conversion
 */
export const trackPurchase = (
  transactionId: string,
  plan: PlanType,
  value: number
) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'CLP',
      value: value,
      items: [
        {
          item_id: plan,
          item_name: getPlanName(plan),
          price: value,
          quantity: 1,
        },
      ],
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      currency: 'CLP',
      value: value,
      content_name: getPlanName(plan),
      content_ids: [plan],
    })
  }

  console.log('📊 Purchase tracked:', { transactionId, plan, value })
}

/**
 * Track registration/sign up
 */
export const trackSignUp = (method: string = 'email') => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
    })
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: method,
      status: 'completed',
    })
  }

  console.log('📊 Sign up tracked:', { method })
}

/**
 * Track form submission
 */
export const trackFormSubmit = (formName: string) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      form_name: formName,
      event_category: 'engagement',
    })
  }

  console.log('📊 Form submitted:', { formName })
}

/**
 * Track button/CTA click
 */
export const trackClick = (
  elementName: string,
  elementType: string = 'button'
) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'click', {
      element_name: elementName,
      element_type: elementType,
      event_category: 'engagement',
    })
  }

  console.log('📊 Click tracked:', { elementName, elementType })
}

/**
 * Track scroll depth
 */
export const trackScrollDepth = (percentage: number) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'scroll', {
      percent_scrolled: percentage,
      event_category: 'engagement',
    })
  }

  console.log('📊 Scroll depth:', { percentage })
}

/**
 * Track chat widget interaction
 */
export const trackChatInteraction = (action: 'open' | 'close' | 'message_sent') => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'chat_interaction', {
      action: action,
      event_category: 'engagement',
    })
  }

  console.log('📊 Chat interaction:', { action })
}

/**
 * Track video play
 */
export const trackVideoPlay = (videoName: string) => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'video_start', {
      video_title: videoName,
      event_category: 'engagement',
    })
  }

  console.log('📊 Video played:', { videoName })
}

/**
 * Track link click (external or internal)
 */
export const trackLinkClick = (url: string, type: 'internal' | 'external') => {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'click', {
      link_url: url,
      link_type: type,
      event_category: 'navigation',
    })
  }

  console.log('📊 Link clicked:', { url, type })
}

// Helper: Get plan name from ID
function getPlanName(plan: PlanType): string {
  const names = {
    'saas-multi': 'SaaS Multi-Tenant',
    'saas-dedicated': 'SaaS Dedicado',
    'on-premise': 'On-Premise',
  }
  return names[plan] || plan
}
