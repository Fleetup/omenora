<template>
  <div class="legal-page">
    <div class="top-bar">
      <span class="brand-text">OMENORA</span>
    </div>

    <div class="content">
      <h1 class="title">Privacy Policy</h1>
      <p class="last-updated">Last Updated: April 10, 2026</p>

      <div class="section">
        <h2>1. Introduction</h2>
        <p>OMENORA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
      </div>

      <div class="section">
        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Information</h3>
        <ul>
          <li>Name and email address (for report delivery)</li>
          <li>Date of birth and time of birth (for astrology calculations)</li>
          <li>Location information (for regional customization)</li>
          <li>Payment information (processed securely by Stripe)</li>
        </ul>

        <h3>2.2 Usage Information</h3>
        <ul>
          <li>IP address and browser information</li>
          <li>Device information and operating system</li>
          <li>Pages visited and time spent on our platform</li>
          <li>Referral sources and interaction data</li>
        </ul>
      </div>

      <div class="section">
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>Generate personalized astrology and numerology reports</li>
          <li>Process payments and deliver purchased content</li>
          <li>Send transactional emails (report delivery, payment receipts)</li>
          <li>Improve our AI models and service quality</li>
          <li>Comply with legal obligations</li>
        </ul>
      </div>

      <div class="section">
        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures including:</p>
        <ul>
          <li>Encryption in transit (TLS 1.3) and at rest</li>
          <li>Secure payment processing through Stripe</li>
          <li>Regular security audits and penetration testing</li>
          <li>Limited access controls for staff</li>
        </ul>
      </div>

      <div class="section">
        <h2>5. Data Retention</h2>
        <p>We retain your data for as long as necessary to provide our services or as required by law. You can request deletion of your personal data by contacting us at privacy@omenora.com.</p>
      </div>

      <div class="section">
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have rights to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your data (right to be forgotten)</li>
          <li>Object to processing</li>
          <li>Data portability</li>
        </ul>
      </div>

      <div class="section">
        <h2>7. Third-Party Services</h2>
        <p>We use trusted third-party services:</p>
        <ul>
          <li>Stripe for payment processing</li>
          <li>Supabase for data storage</li>
          <li>Anthropic for AI report generation</li>
          <li>Resend for email delivery</li>
        </ul>
      </div>

      <div class="section">
        <h2>8. Contact Us</h2>
        <p>For privacy-related questions or data requests, contact us at:<br>
        Email: privacy@omenora.com<br>
        Address: OMENORA Privacy Team</p>
      </div>

      <div class="back-link">
        <NuxtLink to="/" class="link">← Return to Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const SITE_URL = 'https://omenora.com'

useSeoMeta({
  title: 'Privacy Policy | OMENORA - Data Protection & Privacy',
  description: 'OMENORA Privacy Policy - Learn how we collect, use, and protect your personal data including birth information, payment details, and usage data. GDPR compliant data practices.',
  ogTitle: 'Privacy Policy | OMENORA',
  ogDescription: 'Learn how OMENORA protects your personal data including birth information, payment details, and usage data. Transparent privacy practices.',
  ogUrl: `${SITE_URL}/privacy`,
  twitterTitle: 'Privacy Policy | OMENORA',
  twitterDescription: 'Learn how OMENORA protects your personal data. Transparent privacy practices.',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large',
  keywords: 'privacy policy, data protection, GDPR, personal data, data security, privacy rights',
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/privacy` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/privacy#webpage`,
            url: `${SITE_URL}/privacy`,
            name: 'Privacy Policy | OMENORA',
            isPartOf: { '@id': `${SITE_URL}/#website` },
            description: 'OMENORA Privacy Policy - Learn how we protect and handle your personal data.',
            datePublished: '2026-04-10T00:00:00+00:00',
            dateModified: '2026-04-10T00:00:00+00:00',
            inLanguage: 'en',
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Privacy Policy',
                item: `${SITE_URL}/privacy`,
              },
            ],
          },
        ],
      }),
    },
  ],
})
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #050410;
  color: rgba(255, 255, 255, 0.85);
}

.top-bar {
  padding: 20px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.brand-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.6);
}

.content {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 28px 80px;
}

.title {
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.93);
  margin-bottom: 8px;
}

.last-updated {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 48px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 400;
  color: rgba(201, 168, 76, 0.9);
  margin-bottom: 16px;
}

.section h3 {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin: 24px 0 12px;
}

.section p {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 16px;
}

.section ul {
  margin: 16px 0;
  padding-left: 24px;
}

.section li {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
}

.back-link {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.link {
  color: rgba(201, 168, 76, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.link:hover {
  color: rgba(201, 168, 76, 1);
}
</style>
