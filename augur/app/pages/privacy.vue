<template>
  <div class="legal-page">
    <AppHeader />

    <div class="legal-masthead">
      <p class="label-caps legal-masthead__eyebrow">Omenora</p>
      <h1 class="legal-masthead__headline font-display-italic">Privacy Policy</h1>
      <p class="annotation legal-masthead__date">Last Updated: April 20, 2026 · Effective Date: April 20, 2026</p>
      <div class="editorial-rule" />
    </div>

    <div class="legal-body">
      <div class="toc">
        <p class="label-caps toc-label">Contents</p>
        <ol class="toc-list">
          <li><a href="#s1" class="toc-link">Who We Are</a></li>
          <li><a href="#s2" class="toc-link">Data We Collect</a></li>
          <li><a href="#s3" class="toc-link">Legal Basis for Processing (GDPR)</a></li>
          <li><a href="#s4" class="toc-link">How We Use Your Data</a></li>
          <li><a href="#s5" class="toc-link">Cookies &amp; Tracking Technologies</a></li>
          <li><a href="#s6" class="toc-link">Sub-Processors &amp; Third-Party Services</a></li>
          <li><a href="#s7" class="toc-link">International Data Transfers</a></li>
          <li><a href="#s8" class="toc-link">Data Retention</a></li>
          <li><a href="#s9" class="toc-link">Data Security</a></li>
          <li><a href="#s10" class="toc-link">Your Rights</a></li>
          <li><a href="#s11" class="toc-link">California Privacy Rights (CCPA/CPRA)</a></li>
          <li><a href="#s12" class="toc-link">Children's Privacy</a></li>
          <li><a href="#s13" class="toc-link">Changes to This Policy</a></li>
          <li><a href="#s14" class="toc-link">Contact &amp; Data Controller</a></li>
        </ol>
      </div>

      <section id="s1" class="legal-section">
        <h2 class="legal-section__heading">1. Who We Are</h2>
        <div class="legal-section__content">
        <p>OMENORA ("OMENORA," "we," "our," or "us") operates the website <strong>omenora.com</strong> and provides AI-powered astrology, numerology, and destiny analysis services. For the purposes of the General Data Protection Regulation (GDPR) and other applicable privacy laws, OMENORA acts as the <strong>data controller</strong> in respect of the personal data it collects from users.</p>
        <p>This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and what rights you have regarding your data. By using our services, you acknowledge that you have read and understood this policy.</p>
        <p><strong>Contact:</strong> privacy@omenora.com</p>
        </div>
      </section>

      <section id="s2" class="legal-section">
        <h2 class="legal-section__heading">2. Data We Collect</h2>
        <div class="legal-section__content">

        <h3 class="legal-section__subheading">2.1 Data You Provide Directly</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Specific Data Points</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identity Data</td>
              <td>First name</td>
              <td>Personalise your report</td>
            </tr>
            <tr>
              <td>Birth Data</td>
              <td>Date of birth, time of birth, city of birth</td>
              <td>Generate astrological and numerological calculations</td>
            </tr>
            <tr>
              <td>Contact Data</td>
              <td>Email address</td>
              <td>Deliver your report; transactional communications</td>
            </tr>
            <tr>
              <td>Payment Data</td>
              <td>Payment method details (tokenised via Stripe); billing country</td>
              <td>Process purchases; fraud prevention</td>
            </tr>
            <tr>
              <td>Questionnaire Responses</td>
              <td>Optional answers provided during analysis flow (e.g. relationship status, personal goals)</td>
              <td>Improve report personalisation</td>
            </tr>
          </tbody>
        </table>
        <p class="table-note">We do not store raw card numbers or CVV codes at any point. Payment tokenisation is handled exclusively by Stripe, Inc.</p>

        <h3 class="legal-section__subheading">2.2 Data Collected Automatically</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Specific Data Points</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Device &amp; Technical Data</td>
              <td>IP address, browser type and version, operating system, device type, screen resolution</td>
              <td>Server logs; JavaScript SDK</td>
            </tr>
            <tr>
              <td>Usage Data</td>
              <td>Pages visited, time on page, click interactions, funnel progression, session duration</td>
              <td>First-party analytics; pixel events</td>
            </tr>
            <tr>
              <td>Geographic Data</td>
              <td>Country and approximate region (derived from IP)</td>
              <td>Automatic detection; used for language and pricing defaults</td>
            </tr>
            <tr>
              <td>Advertising Identifiers</td>
              <td>TikTok Click ID (ttclid), Meta Click ID (fbclid), cookie-based identifiers</td>
              <td>TikTok Pixel; Meta Pixel</td>
            </tr>
            <tr>
              <td>Transaction Events</td>
              <td>Purchase events, checkout initiations, content views (hashed email where applicable)</td>
              <td>TikTok Pixel; Meta Pixel</td>
            </tr>
          </tbody>
        </table>

        <h3 class="legal-section__subheading">2.3 A Note on Birth Data</h3>
        <p>Birth date, birth time, and birth city are used solely to perform astrological and numerological calculations. While this data does not fall within the special categories of data under GDPR Article 9 by definition, we treat it with elevated care given its personal nature. It is transmitted over TLS 1.3, stored in encrypted form, and is never sold to third parties or used for purposes beyond service delivery.</p>
        </div>
      </section>

      <section id="s3" class="legal-section">
        <h2 class="legal-section__heading">3. Legal Basis for Processing (GDPR)</h2>
        <div class="legal-section__content">
        <p>If you are located in the European Economic Area (EEA), the United Kingdom (UK), or Switzerland, we process your personal data on the following legal bases under GDPR Article 6:</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Processing Activity</th>
              <th>Legal Basis</th>
              <th>GDPR Article</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Generating your personality archetype reading using AI</td>
              <td>Performance of a contract (fulfilment of the service you requested)</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Processing payment and preventing fraud</td>
              <td>Performance of a contract; Legitimate interests</td>
              <td>Art. 6(1)(b), (f)</td>
            </tr>
            <tr>
              <td>Sending your report and transactional emails</td>
              <td>Performance of a contract</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>TikTok Pixel and Meta Pixel tracking (advertising)</td>
              <td>Consent (you may withdraw at any time)</td>
              <td>Art. 6(1)(a)</td>
            </tr>
            <tr>
              <td>Improving our AI models and service quality</td>
              <td>Legitimate interests (improving service accuracy for all users)</td>
              <td>Art. 6(1)(f)</td>
            </tr>
            <tr>
              <td>Complying with legal and tax obligations</td>
              <td>Legal obligation</td>
              <td>Art. 6(1)(c)</td>
            </tr>
            <tr>
              <td>Server log retention for security</td>
              <td>Legitimate interests (security and fraud prevention)</td>
              <td>Art. 6(1)(f)</td>
            </tr>
          </tbody>
        </table>
        <p>Where we rely on <strong>legitimate interests</strong>, we have conducted a balancing test and concluded that our interests do not override your fundamental rights. You may request a copy of our legitimate interests assessment by emailing privacy@omenora.com.</p>
        </div>
      </section>

      <section id="s4" class="legal-section">
        <h2 class="legal-section__heading">4. How We Use Your Data</h2>
        <div class="legal-section__content">
        <ul>
          <li><strong>Service Delivery:</strong> Generate your personalized AI astrology, numerology, and destiny analysis report using your birth data and responses.</li>
          <li><strong>Report Delivery:</strong> Email your completed report and any purchased upgrades to your provided email address.</li>
          <li><strong>Payment Processing:</strong> Facilitate secure payment transactions through Stripe and manage subscription billing where applicable.</li>
          <li><strong>Customer Support:</strong> Respond to support requests, billing inquiries, and data subject requests.</li>
          <li><strong>Advertising &amp; Retargeting:</strong> Where you consent, we use TikTok Pixel and Meta Pixel to measure ad performance, attribute conversions, and serve relevant advertisements on TikTok and Meta platforms.</li>
          <li><strong>Service Improvement:</strong> Analyse usage patterns (in aggregate and pseudonymised where possible) to improve report quality, fix bugs, and optimise the user experience.</li>
          <li><strong>Fraud &amp; Abuse Prevention:</strong> Detect and prevent fraudulent transactions, unauthorised access, and abuse of our platform.</li>
          <li><strong>Legal Compliance:</strong> Retain records as required by applicable law (e.g. tax, accounting, court orders).</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data, rent it, or share it with third parties for their own independent marketing purposes.</p>
        </div>
      </section>

      <section id="s5" class="legal-section">
        <h2 class="legal-section__heading">5. Cookies &amp; Tracking Technologies</h2>
        <div class="legal-section__content">
        <p>We use the following categories of cookies and tracking technologies:</p>

        <h3 class="legal-section__subheading">5.1 Strictly Necessary</h3>
        <p>Required for the website to function. Cannot be disabled. These include session management cookies and security tokens.</p>

        <h3 class="legal-section__subheading">5.2 Functional</h3>
        <p>Store your preferences (e.g. language selection, analysis progress) to improve your experience. Set by OMENORA's own servers.</p>

        <h3 class="legal-section__subheading">5.3 Analytics</h3>
        <p>We currently rely on server-side logging and pixel-based event tracking rather than a traditional analytics platform such as Google Analytics. All usage data is pseudonymised before storage.</p>

        <h3 class="legal-section__subheading">5.4 Advertising &amp; Marketing Pixels</h3>
        <p>We operate the following advertising pixels subject to your consent:</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Pixel</th>
              <th>Provider</th>
              <th>Data Sent</th>
              <th>Purpose</th>
              <th>Privacy Policy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TikTok Pixel</td>
              <td>TikTok Inc. (ByteDance Ltd.)</td>
              <td>Page views, checkout events, purchase events, hashed email, TikTok Click ID, IP address, browser fingerprint</td>
              <td>Ad attribution, conversion measurement, retargeting audiences</td>
              <td><a href="https://www.tiktok.com/legal/page/global/privacy-policy/en" target="_blank" rel="noopener noreferrer" class="external-link">TikTok Privacy Policy</a></td>
            </tr>
            <tr>
              <td>Meta Pixel</td>
              <td>Meta Platforms, Inc.</td>
              <td>Page views, checkout events, purchase events, hashed email, Meta Click ID, IP address, browser fingerprint</td>
              <td>Ad attribution, conversion measurement, retargeting audiences on Facebook and Instagram</td>
              <td><a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" class="external-link">Meta Privacy Policy</a></td>
            </tr>
          </tbody>
        </table>
        <p>The TikTok Pixel and Meta Pixel are loaded immediately on page load. If you are located in the EEA or UK and wish to withdraw consent for advertising tracking, please email privacy@omenora.com to opt out.</p>

        <h3 class="legal-section__subheading">5.5 Managing Cookies</h3>
        <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our service. For more information on managing cookies, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" class="external-link">allaboutcookies.org</a>.</p>
        </div>
      </section>

      <section id="s6" class="legal-section">
        <h2 class="legal-section__heading">6. Sub-Processors &amp; Third-Party Services</h2>
        <div class="legal-section__content">
        <p>We engage the following sub-processors to deliver our services. Each has been evaluated for data protection compliance and is contractually obligated to protect your data:</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Sub-Processor</th>
              <th>Role</th>
              <th>Data Shared</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Stripe, Inc.</strong></td>
              <td>Payment processing, subscription billing</td>
              <td>Payment method details, email, billing country, transaction amounts</td>
              <td>USA (EU SCC / UK IDTA in place)</td>
            </tr>
            <tr>
              <td><strong>Supabase, Inc.</strong></td>
              <td>Database and user data storage</td>
              <td>Birth data, email, name, report metadata, session data</td>
              <td>USA / EU (region-configurable)</td>
            </tr>
            <tr>
              <td><strong>Anthropic, PBC</strong></td>
              <td>AI model API — generates report text</td>
              <td>Birth date, birth time, birth city, name, questionnaire responses</td>
              <td>USA (EU SCC in place)</td>
            </tr>
            <tr>
              <td><strong>Resend, Inc.</strong></td>
              <td>Transactional email delivery</td>
              <td>Email address, report content, name</td>
              <td>USA (EU SCC in place)</td>
            </tr>
            <tr>
              <td><strong>TikTok Inc. (ByteDance)</strong></td>
              <td>Advertising pixel and conversion measurement</td>
              <td>Events data, hashed email, click IDs, IP address</td>
              <td>USA / Singapore</td>
            </tr>
            <tr>
              <td><strong>Meta Platforms, Inc.</strong></td>
              <td>Advertising pixel and conversion measurement</td>
              <td>Events data, hashed email, click IDs, IP address</td>
              <td>USA (EU-US Data Privacy Framework)</td>
            </tr>
            <tr>
              <td><strong>Railway Corp.</strong></td>
              <td>Cloud hosting and deployment infrastructure</td>
              <td>Server logs, application data in transit</td>
              <td>USA</td>
            </tr>
            <tr>
              <td><strong>Sentry (Functional Software, Inc.)</strong></td>
              <td>Error monitoring and performance tracking</td>
              <td>Anonymised error traces, browser/OS info (no personal data by default)</td>
              <td>USA (EU SCC in place)</td>
            </tr>
          </tbody>
        </table>
        <p>We do not authorise our sub-processors to use your personal data for their own independent purposes beyond what is necessary to provide services to us.</p>
        </div>
      </section>

      <section id="s7" class="legal-section">
        <h2 class="legal-section__heading">7. International Data Transfers</h2>
        <div class="legal-section__content">
        <p>OMENORA is based in the United States. When you use our services from the EEA, UK, or Switzerland, your personal data is transferred to the United States and potentially other countries that may not provide an equivalent level of data protection to your home jurisdiction.</p>
        <p>We rely on the following transfer mechanisms to protect your data:</p>
        <ul>
          <li><strong>Standard Contractual Clauses (SCCs)</strong> — approved by the European Commission under GDPR Article 46(2)(c) — with Stripe, Anthropic, Resend, Supabase, and Sentry.</li>
          <li><strong>EU–US Data Privacy Framework</strong> — for Meta Platforms, Inc., which is certified under this framework.</li>
          <li><strong>UK International Data Transfer Agreements (IDTAs)</strong> — where applicable for UK data subjects.</li>
        </ul>
        <p>You may request a copy of the relevant transfer safeguards by contacting privacy@omenora.com.</p>
        </div>
      </section>

      <section id="s8" class="legal-section">
        <h2 class="legal-section__heading">8. Data Retention</h2>
        <div class="legal-section__content">
        <p>We retain personal data only for as long as necessary for the purposes set out in this policy, or as required by law. Our retention schedule is as follows:</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Retention Period</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Birth data, name, report content</td>
              <td>2 years from last activity, or until deletion request</td>
              <td>Service delivery; re-access to reports</td>
            </tr>
            <tr>
              <td>Email address</td>
              <td>2 years from last activity, or until deletion request</td>
              <td>Report re-delivery; transactional communications</td>
            </tr>
            <tr>
              <td>Payment records (Stripe)</td>
              <td>7 years</td>
              <td>Legal and tax obligation</td>
            </tr>
            <tr>
              <td>Server logs (IP, browser, timestamps)</td>
              <td>90 days</td>
              <td>Security; fraud detection</td>
            </tr>
            <tr>
              <td>Advertising pixel event data</td>
              <td>Governed by TikTok / Meta retention policies (typically 180 days)</td>
              <td>Conversion attribution</td>
            </tr>
            <tr>
              <td>Error monitoring data (Sentry)</td>
              <td>90 days</td>
              <td>Bug fixing and performance monitoring</td>
            </tr>
          </tbody>
        </table>
        <p>After the applicable retention period, data is securely deleted or irreversibly anonymised. To request early deletion of your data, contact privacy@omenora.com.</p>
        </div>
      </section>

      <section id="s9" class="legal-section">
        <h2 class="legal-section__heading">9. Data Security</h2>
        <div class="legal-section__content">
        <p>We implement technical and organisational measures appropriate to the risk of processing your personal data, including:</p>
        <ul>
          <li><strong>Encryption in transit:</strong> All data is transmitted over TLS 1.3. HTTPS is enforced site-wide with HSTS preloading.</li>
          <li><strong>Encryption at rest:</strong> Database records stored via Supabase are encrypted at the storage layer.</li>
          <li><strong>Access controls:</strong> Production database access is restricted to authorised personnel only, with audit logging enabled.</li>
          <li><strong>Payment security:</strong> Card data is tokenised by Stripe (PCI DSS Level 1 certified). We never store raw card numbers or CVV codes.</li>
          <li><strong>Content Security Policy:</strong> A strict CSP header is enforced on all pages to mitigate XSS and injection attacks.</li>
          <li><strong>Rate limiting:</strong> API endpoints are protected against brute-force and abuse with sliding-window rate limiting.</li>
          <li><strong>Dependency monitoring:</strong> We monitor third-party dependencies for known vulnerabilities.</li>
        </ul>
        <p>In the event of a personal data breach that is likely to result in a high risk to your rights and freedoms, we will notify you without undue delay in accordance with GDPR Article 34.</p>
        </div>
      </section>

      <section id="s10" class="legal-section">
        <h2 class="legal-section__heading">10. Your Rights</h2>
        <div class="legal-section__content">
        <p>Depending on your location, you have the following rights regarding your personal data. To exercise any of these rights, email privacy@omenora.com with subject line "Data Subject Request." We will respond within 30 days (GDPR) or 45 days (CCPA).</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Right</th>
              <th>Description</th>
              <th>Applicable Jurisdiction</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right of Access</td>
              <td>Request a copy of the personal data we hold about you</td>
              <td>GDPR, CCPA, UK GDPR</td>
            </tr>
            <tr>
              <td>Right to Rectification</td>
              <td>Request correction of inaccurate personal data</td>
              <td>GDPR, UK GDPR, CCPA</td>
            </tr>
            <tr>
              <td>Right to Erasure</td>
              <td>Request deletion of your personal data ("right to be forgotten")</td>
              <td>GDPR, UK GDPR, CCPA</td>
            </tr>
            <tr>
              <td>Right to Restriction</td>
              <td>Request that we restrict processing of your data in certain circumstances</td>
              <td>GDPR, UK GDPR</td>
            </tr>
            <tr>
              <td>Right to Data Portability</td>
              <td>Receive your data in a structured, machine-readable format</td>
              <td>GDPR, UK GDPR</td>
            </tr>
            <tr>
              <td>Right to Object</td>
              <td>Object to processing based on legitimate interests or for direct marketing</td>
              <td>GDPR, UK GDPR</td>
            </tr>
            <tr>
              <td>Right to Withdraw Consent</td>
              <td>Withdraw consent at any time where processing is consent-based (e.g. advertising pixels)</td>
              <td>GDPR, UK GDPR, CCPA</td>
            </tr>
            <tr>
              <td>Right Not to Be Subject to Automated Decisions</td>
              <td>Request human review of decisions made solely by automated processing that significantly affect you</td>
              <td>GDPR, UK GDPR</td>
            </tr>
          </tbody>
        </table>
        <p>If you believe your rights have been violated, you have the right to lodge a complaint with your local supervisory authority (e.g. the ICO in the UK, or your national data protection authority in the EEA).</p>
        </div>
      </section>

      <section id="s11" class="legal-section">
        <h2 class="legal-section__heading">11. California Privacy Rights (CCPA / CPRA)</h2>
        <div class="legal-section__content">
        <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA).</p>

        <h3 class="legal-section__subheading">11.1 Categories of Personal Information Collected</h3>
        <p>In the preceding 12 months, we have collected the following categories of personal information (as defined by the CCPA):</p>
        <ul>
          <li><strong>Identifiers:</strong> Name, email address, IP address</li>
          <li><strong>Personal records:</strong> Date and time of birth, city of birth</li>
          <li><strong>Commercial information:</strong> Purchase history, transaction records</li>
          <li><strong>Internet or network activity:</strong> Browsing behaviour on our site, interactions with our content</li>
          <li><strong>Geolocation data:</strong> Approximate location derived from IP address</li>
          <li><strong>Inferences:</strong> Personality archetypes and personality profiles generated from birth data and questionnaire responses</li>
        </ul>

        <h3 class="legal-section__subheading">11.2 Do We Sell or Share Personal Information?</h3>
        <p>We do <strong>not sell</strong> your personal information for monetary consideration. However, under the CCPA's broad definition of "sharing," the operation of our TikTok Pixel and Meta Pixel may constitute "sharing" of personal information for cross-context behavioural advertising purposes. You have the right to opt out of this sharing.</p>
        <p>To opt out of the sharing of your personal information for advertising purposes, email privacy@omenora.com with the subject "CCPA Opt-Out."</p>

        <h3 class="legal-section__subheading">11.3 Sensitive Personal Information</h3>
        <p>We collect precise geolocation (city level, derived from your stated birth city) and may infer information relating to philosophical or spiritual beliefs from birth data and questionnaire responses. We do not use this sensitive personal information for purposes other than service delivery.</p>

        <h3 class="legal-section__subheading">11.4 Non-Discrimination</h3>
        <p>We will not discriminate against you for exercising any of your CCPA rights. We will not deny you goods or services, charge different prices, or provide a different level of service based solely on your exercise of privacy rights.</p>
        </div>
      </section>

      <section id="s12" class="legal-section">
        <h2 class="legal-section__heading">12. Children's Privacy</h2>
        <div class="legal-section__content">
        <p>Our services are intended for users who are <strong>18 years of age or older</strong>. We do not knowingly collect personal data from children under 13 (or under 16 in the EEA and UK). If you believe we have inadvertently collected data from a minor, please contact us immediately at privacy@omenora.com and we will delete it promptly.</p>
        </div>
      </section>

      <section id="s13" class="legal-section">
        <h2 class="legal-section__heading">13. Changes to This Policy</h2>
        <div class="legal-section__content">
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or service features. When we make material changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically.</p>
        <p>For significant changes affecting how we use your data, we will provide additional notice (e.g. by email to the address on file, or a prominent notice on our website).</p>
        </div>
      </section>

      <section id="s14" class="legal-section">
        <h2 class="legal-section__heading">14. Contact &amp; Data Controller</h2>
        <div class="legal-section__content">
        <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
        <div class="contact-block">
          <p><strong>Data Controller:</strong> OMENORA</p>
          <p><strong>Privacy Requests:</strong> <a href="mailto:privacy@omenora.com" class="contact-link">privacy@omenora.com</a></p>
          <p><strong>General Support:</strong> <a href="mailto:support@omenora.com" class="contact-link">support@omenora.com</a></p>
          <p><strong>Response Time:</strong> We aim to respond to all privacy requests within 5 business days and complete all requests within 30 days (GDPR) or 45 days (CCPA) of receipt.</p>
        </div>
        </div>
      </section>

      <div class="legal-footer">
        <NuxtLink to="/terms" class="footer-legal-link label-caps">Terms of Service</NuxtLink>
        <span class="footer-sep">·</span>
        <NuxtLink to="/" class="footer-legal-link label-caps">← Return to Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const SITE_URL = 'https://omenora.com'

useSeoMeta({
  title: 'Privacy Policy | OMENORA — GDPR & CCPA Compliant Data Protection',
  description: 'OMENORA Privacy Policy — How we collect, use, and protect your personal data including birth information and payment details. GDPR Article 13/14, CCPA/CPRA compliant.',
  ogTitle: 'Privacy Policy | OMENORA',
  ogDescription: 'Transparent data practices for our AI astrology platform. GDPR, CCPA, and CPRA compliant. Read how we protect your birth data, payment info, and privacy rights.',
  ogUrl: `${SITE_URL}/privacy`,
  twitterTitle: 'Privacy Policy | OMENORA',
  twitterDescription: 'How OMENORA collects, protects, and uses your data. Full GDPR & CCPA disclosure.',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large',
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
            dateModified: '2026-04-20T00:00:00+00:00',
            inLanguage: 'en',
            publisher: { '@id': `${SITE_URL}/#organization` },
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
  background: var(--color-bone);
  min-height: 100vh;
}

.legal-masthead {
  padding: clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px) 0;
  max-width: 760px;
  margin: 0 auto;
}

.legal-masthead__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.legal-masthead__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 9vw, 72px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
  color: var(--color-ink);
}

.legal-masthead__date {
  color: var(--color-ink-faint);
  margin-bottom: 32px;
}

.legal-body {
  padding: clamp(32px, 6vw, 56px) clamp(20px, 5vw, 48px) clamp(64px, 10vw, 120px);
  max-width: 760px;
  margin: 0 auto;
}

/* ── TOC ── */
.toc {
  border: 1px solid var(--color-ink-ghost);
  padding: 24px 28px;
  margin-bottom: 48px;
}

.toc-label {
  color: var(--color-ink-faint);
  margin: 0 0 12px;
}

.toc-list {
  margin: 0;
  padding-left: 20px;
}

.toc-list li {
  margin-bottom: 6px;
}

.toc-link {
  color: var(--color-ink-mid);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s;
}

.toc-link:hover { color: var(--color-ink); }

/* ── Sections ── */
.legal-section {
  margin-bottom: clamp(32px, 5vw, 48px);
}

.legal-section__heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-ink-ghost);
}

.legal-section__subheading {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-ink);
  margin: 24px 0 10px;
  text-transform: uppercase;
}

.legal-section__content {
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-ink-mid);
}

.legal-section__content p { margin-bottom: 16px; }

.legal-section__content ul,
.legal-section__content ol {
  padding-left: 20px;
  margin-bottom: 16px;
}

.legal-section__content li { margin-bottom: 8px; }

.legal-section__content a {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.legal-section__content strong {
  font-weight: 600;
  color: var(--color-ink);
}

/* ── Tables ── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 8px;
  font-size: 13px;
}

.data-table th {
  text-align: left;
  padding: 10px 12px;
  background: rgba(26, 22, 18, 0.04);
  color: var(--color-ink-faint);
  font-weight: 600;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-ink-ghost);
  font-family: 'Hanken Grotesk', sans-serif;
}

.data-table td {
  padding: 10px 12px;
  color: var(--color-ink-mid);
  line-height: 1.6;
  border-bottom: 1px solid var(--color-ink-ghost);
  vertical-align: top;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(26, 22, 18, 0.02); }

.table-note {
  font-size: 12px;
  color: var(--color-ink-faint);
  font-style: italic;
  margin-top: 8px;
}

.external-link,
.contact-link {
  color: var(--color-ink);
  text-underline-offset: 3px;
}

/* ── Contact block ── */
.contact-block {
  border: 1px solid var(--color-ink-ghost);
  padding: 20px 24px;
  margin-top: 16px;
}

.contact-block p {
  margin-bottom: 10px;
  font-size: 14px;
}

.contact-block p:last-child { margin-bottom: 0; }

/* ── Footer ── */
.legal-footer {
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink-ghost);
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-legal-link {
  color: var(--color-ink-faint);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-legal-link:hover { color: var(--color-ink); }

.footer-sep { color: var(--color-ink-ghost); }

@media (max-width: 640px) {
  .data-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
