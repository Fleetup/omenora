<template>
  <div class="legal-page">
    <AppHeader />

    <div class="legal-masthead">
      <p class="label-caps legal-masthead__eyebrow">Omenora</p>
      <h1 class="legal-masthead__headline font-display-italic">Refund Policy</h1>
      <p class="annotation legal-masthead__date">Last Updated: May 19, 2026</p>
      <div class="editorial-rule" />
    </div>

    <div class="legal-body">
      <div class="toc">
        <p class="label-caps toc-label">Contents</p>
        <ol class="toc-list">
          <li><a href="#r1" class="toc-link">Founding Member Purchases ($20 one-time)</a></li>
          <li><a href="#r2" class="toc-link">Destiny Reading Reports ($2.99 one-time)</a></li>
          <li><a href="#r3" class="toc-link">Subscriptions ($4.99/month)</a></li>
          <li><a href="#r4" class="toc-link">Contact</a></li>
        </ol>
      </div>

      <p class="legal-intro">This policy applies to all purchases made on <strong>omenora.com</strong>. By completing a purchase you accept the terms of this refund policy. This policy may be updated at any time. Material changes will be communicated by email to active customers.</p>

      <section id="r1" class="legal-section">
        <h2 class="legal-section__heading">1. Founding Member Purchases ($20 one-time)</h2>
        <div class="legal-section__content">
          <p>A full refund is available within <strong>14 days of purchase</strong>, no questions asked. To request a refund, email <a href="mailto:support@omenora.com" class="contact-link">support@omenora.com</a> from the email address used at checkout with the subject line "Founding Member Refund."</p>
          <p>After 14 days, refunds are at OMENORA's discretion and will be considered in the following circumstances:</p>
          <ul>
            <li>Duplicate charge for the same purchase</li>
            <li>Technical failure to deliver promised founding-member benefits</li>
            <li>Service discontinuation before the paid-tier launch</li>
          </ul>
          <p>Refunds are processed to the original payment method within <strong>5–10 business days</strong> of approval.</p>
          <div class="notice-box">
            <p><strong>Please note:</strong> Refunding a founding-member purchase permanently forfeits the lifetime 50% discount, early-access benefits, founder badge, and credits listing. These benefits cannot be reinstated after a refund is issued.</p>
          </div>
        </div>
      </section>

      <section id="r2" class="legal-section">
        <h2 class="legal-section__heading">2. Destiny Reading Reports ($2.99 one-time)</h2>
        <div class="legal-section__content">
          <p>Due to the personalized, instantly delivered digital nature of these reports, <strong>all sales are final</strong> once the report has been generated and delivered to your email address.</p>
          <p>Refunds are available only in the following cases:</p>
          <ul>
            <li>Payment was processed but the report was never delivered</li>
            <li>A duplicate charge was made for the same report</li>
            <li>A technical failure prevented report generation entirely</li>
          </ul>
          <p>Refund requests must be submitted within <strong>30 days of purchase</strong> to <a href="mailto:support@omenora.com" class="contact-link">support@omenora.com</a>. Please include the email address used at checkout and any order or payment reference you have available.</p>
        </div>
      </section>

      <section id="r3" class="legal-section">
        <h2 class="legal-section__heading">3. Subscriptions ($4.99/month)</h2>
        <div class="legal-section__content">
          <p>You may cancel your subscription at any time from your <NuxtLink to="/account" class="inline-link">account page</NuxtLink>. Cancellation stops future billing but does not refund the current billing period. <strong>No partial refunds are issued for unused time within a billing period.</strong></p>
          <p>In the case of an accidental renewal — within 48 hours of the renewal date, with no usage of premium features in that period — a full refund of the most recent charge is available on request to <a href="mailto:support@omenora.com" class="contact-link">support@omenora.com</a>.</p>
          <p>Refunds for charges older than 48 hours are considered on a case-by-case basis.</p>
        </div>
      </section>

      <section id="r4" class="legal-section">
        <h2 class="legal-section__heading">4. Contact</h2>
        <div class="legal-section__content">
          <div class="contact-block">
            <p><strong>All refund requests:</strong> <a href="mailto:support@omenora.com" class="contact-link">support@omenora.com</a></p>
            <p><strong>Include:</strong> Your order ID or the email address used at checkout.</p>
            <p><strong>Response time:</strong> We aim to respond within 2 business days.</p>
          </div>
        </div>
      </section>

      <div class="legal-footer">
        <NuxtLink to="/terms" class="footer-legal-link label-caps">Terms of Service</NuxtLink>
        <span class="footer-sep">·</span>
        <NuxtLink to="/privacy" class="footer-legal-link label-caps">Privacy Policy</NuxtLink>
        <span class="footer-sep">·</span>
        <NuxtLink to="/" class="footer-legal-link label-caps">← Return to Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const SITE_URL = 'https://omenora.com'

useSeoMeta({
  title: 'Refund Policy — OMENORA',
  description: 'OMENORA refund policy for founding member purchases, destiny reading reports, and subscriptions. Full details on eligibility, timelines, and how to request a refund.',
  ogTitle: 'Refund Policy — OMENORA',
  ogDescription: 'Refund terms for OMENORA purchases including founding memberships, one-time reports, and monthly subscriptions.',
  ogUrl: `${SITE_URL}/refund-policy`,
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/refund-policy` }],
})
</script>

<style scoped>
.legal-page {
  background: var(--surface-base);
  min-height: 100vh;
}

.legal-masthead {
  padding: clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px) 0;
  max-width: 760px;
  margin: 0 auto;
}

.legal-masthead__eyebrow {
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.legal-masthead__headline {
  font-family: var(--font-sans);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 9vw, 72px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
  color: var(--text-primary);
}

.legal-masthead__date {
  color: var(--text-tertiary);
  margin-bottom: 32px;
}

.legal-body {
  padding: clamp(32px, 6vw, 56px) clamp(20px, 5vw, 48px) clamp(64px, 10vw, 120px);
  max-width: 760px;
  margin: 0 auto;
}

.legal-intro {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

/* ── TOC ── */
.toc {
  border: 1px solid var(--border-subtle);
  padding: 24px 28px;
  margin-bottom: 48px;
}

.toc-label {
  color: var(--text-tertiary);
  margin: 0 0 12px;
}

.toc-list {
  margin: 0;
  padding-left: 20px;
}

.toc-list li { margin-bottom: 6px; }

.toc-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s;
}

.toc-link:hover { color: var(--text-primary); }

/* ── Sections ── */
.legal-section {
  margin-bottom: clamp(32px, 5vw, 48px);
  scroll-margin-top: 24px;
}

.legal-section__heading {
  font-family: var(--font-sans);
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.legal-section__content p {
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

.legal-section__content p:last-child { margin-bottom: 0; }

.legal-section__content ul {
  margin: 0 0 14px 0;
  padding-left: 20px;
}

.legal-section__content ul li {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

/* ── Notice box ── */
.notice-box {
  border-left: 3px solid var(--text-secondary);
  padding: 14px 18px;
  margin-top: 16px;
  background: var(--border-faint);
}

.notice-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* ── Contact block ── */
.contact-block {
  border: 1px solid var(--border-subtle);
  padding: 20px 24px;
}

.contact-block p {
  margin-bottom: 10px;
  font-size: 14px;
}

.contact-block p:last-child { margin-bottom: 0; }

.contact-link,
.inline-link {
  color: var(--text-primary);
  text-underline-offset: 3px;
}

/* ── Footer ── */
.legal-footer {
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-legal-link {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-legal-link:hover { color: var(--text-primary); }

.footer-sep { color: var(--border-subtle); }
</style>
