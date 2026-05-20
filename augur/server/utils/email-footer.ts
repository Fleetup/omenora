// ── CAN-SPAM compliant email footer constants ─────────────────────────────────
// Single source of truth for brand identity, physical postal address, and
// unsubscribe footer blocks used across all transactional and marketing emails.
//
// NEVER embed the address as a literal string in any email template file.
// Import from here instead.

export const EMAIL_BRAND_LINE = 'OMENORA, a product of UNC Development'
export const EMAIL_ADDRESS_LINE = '1524 W Woodland Ave, Addison, IL 60101-1942'

// ── Plain-text footer builders ────────────────────────────────────────────────

/**
 * Plain-text footer for emails that have a tokenised unsubscribe URL
 * (abandonment sequence, founding confirmation, report delivery, etc.)
 */
export function emailFooterText(unsubUrl: string): string {
  return [
    `---`,
    EMAIL_BRAND_LINE,
    EMAIL_ADDRESS_LINE,
    `To unsubscribe: ${unsubUrl}`,
  ].join('\n')
}

/**
 * Plain-text footer for emails that use the mailto: unsubscribe pattern
 * (compatibility email, calendar email) — no tokenised URL available.
 */
export const EMAIL_FOOTER_TEXT_MAILTO = [
  `---`,
  EMAIL_BRAND_LINE,
  EMAIL_ADDRESS_LINE,
  `To unsubscribe, email unsubscribe@omenora.com`,
].join('\n')

// ── HTML footer builders ──────────────────────────────────────────────────────
// The visual style matches the existing dominant pattern in email-templates.ts:
// small font, low-contrast, centered, separated by a thin top border.

/**
 * HTML footer for emails that have a tokenised unsubscribe URL.
 * Matches the styling of the abandonment-sequence and founding-member footers.
 */
export function emailFooterHtml(unsubUrl: string): string {
  return `
          <!-- CAN-SPAM footer -->
          <tr>
            <td style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">
              <p style="margin:0 0 4px;font-size:11px;color:#444;font-family:sans-serif;line-height:1.6;">
                ${EMAIL_BRAND_LINE}
              </p>
              <p style="margin:0 0 4px;font-size:11px;color:#444;font-family:sans-serif;">
                ${EMAIL_ADDRESS_LINE}
              </p>
              <p style="margin:0;font-size:11px;color:#444;font-family:sans-serif;">
                <a href="${unsubUrl}" style="color:#555;">Unsubscribe</a>
              </p>
            </td>
          </tr>`
}

/**
 * HTML footer for emails that use the mailto: unsubscribe pattern.
 * Used by compatibility and calendar emails which do not have tokenised URLs.
 */
export const EMAIL_FOOTER_HTML_MAILTO = `
          <!-- CAN-SPAM footer -->
          <tr>
            <td style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">
              <p style="margin:0 0 4px;font-size:11px;color:#444;font-family:sans-serif;line-height:1.6;">
                ${EMAIL_BRAND_LINE}
              </p>
              <p style="margin:0 0 4px;font-size:11px;color:#444;font-family:sans-serif;">
                ${EMAIL_ADDRESS_LINE}
              </p>
              <p style="margin:0;font-size:11px;color:#444;font-family:sans-serif;">
                <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe" style="color:#555;">Unsubscribe</a>
              </p>
            </td>
          </tr>`

/**
 * HTML footer for div-based email layouts that use the mailto: unsubscribe
 * pattern. Matches the low-contrast dark colour scheme used in the calendar
 * and compatibility emails.
 */
export const EMAIL_FOOTER_HTML_DIV_MAILTO = `<p style="font-size:10px;color:rgba(255,255,255,0.15);font-family:sans-serif;margin:0 0 4px;">
        ${EMAIL_BRAND_LINE}
      </p>
      <p style="font-size:10px;color:rgba(255,255,255,0.07);font-family:sans-serif;margin:0 0 4px;">
        ${EMAIL_ADDRESS_LINE}
      </p>
      <p style="font-size:10px;color:rgba(255,255,255,0.10);font-family:sans-serif;margin:0;">
        <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe" style="color:rgba(255,255,255,0.15);text-decoration:underline;">Unsubscribe</a>
      </p>`

/**
 * HTML footer for div-based email layouts (report-email-builder).
 * Semantically equivalent to emailFooterHtml but uses block elements
 * instead of table rows, matching the existing div wrapper in that template.
 */
export function emailFooterHtmlDiv(unsubUrl: string): string {
  return `<p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.15);font-family:sans-serif;">
        ${EMAIL_BRAND_LINE}
      </p>
      <p style="margin:0 0 4px;font-size:10px;color:rgba(255,255,255,0.07);font-family:sans-serif;">
        ${EMAIL_ADDRESS_LINE}
      </p>
      <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.10);font-family:sans-serif;">
        <a href="${unsubUrl}" style="color:rgba(255,255,255,0.15);text-decoration:underline;">Unsubscribe</a>
      </p>`
}

/**
 * Minimal HTML footer for personal-style emails (testimonial request).
 * Intentionally subdued — satisfies CAN-SPAM without breaking the personal
 * letter feel of the email body. Uses white background to match that template.
 */
export function emailFooterHtmlMinimal(unsubUrl: string): string {
  return `<p style="margin:32px 0 0;font-size:10px;color:#bbb;line-height:1.6;font-family:sans-serif;">
${EMAIL_BRAND_LINE} &middot; ${EMAIL_ADDRESS_LINE}<br>
<a href="${unsubUrl}" style="color:#bbb;text-decoration:underline;">Unsubscribe</a>
</p>`
}
