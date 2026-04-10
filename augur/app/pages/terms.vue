<template>
  <div class="legal-page">
    <div class="top-bar">
      <span class="brand-text">OMENORA</span>
    </div>

    <div class="content">
      <h1 class="title">Terms of Service</h1>
      <p class="last-updated">Last Updated: April 10, 2026</p>

      <div class="section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using OMENORA's services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
      </div>

      <div class="section">
        <h2>2. Description of Service</h2>
        <p>OMENORA provides AI-generated astrology, numerology, and destiny analysis reports for entertainment and personal insight purposes. Our reports are generated using artificial intelligence and should be treated as entertainment content, not professional advice.</p>
      </div>

      <div class="section">
        <h2>3. User Accounts and Data</h2>
        <h3>3.1 Account Creation</h3>
        <p>While you can access basic reports without an account, certain features require account creation through our authentication providers.</p>

        <h3>3.2 Data Accuracy</h3>
        <p>You are responsible for providing accurate birth information (date, time, and location) for personalized reports. Inaccurate information will result in incorrect calculations.</p>

        <h3>3.3 Prohibited Activities</h3>
        <ul>
          <li>Using automated systems to access our services</li>
          <li>Attempting to bypass security measures</li>
          <li>Reselling or redistributing our reports</li>
          <li>Using our services for illegal purposes</li>
          <li>Interfering with other users' access</li>
        </ul>
      </div>

      <div class="section">
        <h2>4. Payments and Refunds</h2>
        <h3>4.1 Pricing</h3>
        <p>All prices are displayed in USD and may be subject to change. Current pricing is always available on our website before purchase.</p>

        <h3>4.2 Payment Processing</h3>
        <p>Payments are processed securely through Stripe. We do not store your full credit card information.</p>

        <h3>4.3 Refund Policy</h3>
        <p>Due to the digital nature of our products, all sales are final. However, if you experience technical issues preventing report delivery, contact us at support@omenora.com within 7 days of purchase.</p>
      </div>

      <div class="section">
        <h2>5. Intellectual Property</h2>
        <p>All content, reports, designs, and software on OMENORA are owned by us or our licensors. You receive a personal, non-transferable license to use purchased reports for your own personal use. You may not:</p>
        <ul>
          <li>Resell or redistribute our content</li>
          <li>Use our branding without permission</li>
          <li>Create derivative works from our AI-generated content</li>
          <li>Scrape or systematically collect our data</li>
        </ul>
      </div>

      <div class="section">
        <h2>6. Disclaimer of Warranties</h2>
        <p>OMENORA reports are provided "as is" for entertainment purposes only. We do not guarantee:</p>
        <ul>
          <li>Accuracy of astrological or numerological interpretations</li>
          <li>Specific life outcomes based on reports</li>
          <li>Uninterrupted or error-free service</li>
          <li>Compatibility with all devices or browsers</li>
        </ul>
        <p>Our services should not replace professional advice from qualified counselors, financial advisors, or medical professionals.</p>
      </div>

      <div class="section">
        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, OMENORA shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
      </div>

      <div class="section">
        <h2>8. Modifications to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the updated terms.</p>
      </div>

      <div class="section">
        <h2>9. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
      </div>

      <div class="section">
        <h2>10. Contact Information</h2>
        <p>For questions about these Terms, please contact us at:<br>
        Email: legal@omenora.com</p>
      </div>

      <div class="back-link">
        <NuxtLink to="/" class="link">← Return to Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Service',
  description: 'OMENORA Terms of Service - Please read these terms carefully before using our services.',
  robots: 'index, follow',
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
