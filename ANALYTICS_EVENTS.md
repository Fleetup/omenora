# ANALYTICS EVENTS REGISTRY
**Source:** `augur/app/plugins/pixels.client.ts`  
**Last audited:** April 2026  
**Targets:** TikTok Pixel, Meta Pixel (via `safeTrack` wrapper)  
**PostHog:** To be added in Batch 2-B

---

## Section 1 — Event Registry

Each helper is provided by `pixels.client.ts` via `useNuxtApp()` injection.

### 1. `trackLandingView`
- **Canonical event name:** `landing_view`
- **pixels.client.ts function:** `trackLandingView()`
- **Parameters sent:**
  - `device_type` (desktop / mobile / tablet)
  - `utm_source`, `utm_campaign`, `utm_adset`, `utm_creative`, `utm_medium`, `utm_content` (when present in URL)

---

### 2. `trackAnalysisStart`
- **Canonical event name:** `analysis_start`
- **pixels.client.ts function:** `trackAnalysisStart()`
- **Parameters sent:**
  - `device_type`
  - UTM params

---

### 3. `trackStep1Complete`
- **Canonical event name:** `step1_complete`
- **pixels.client.ts function:** `trackStep1Complete(params)`
- **Parameters sent:**
  - `language`
  - `device_type`
  - UTM params

---

### 4. `trackQuestionAnswered`
- **Canonical event name:** `question_answered`
- **pixels.client.ts function:** `trackQuestionAnswered(params)`
- **Parameters sent:**
  - `question_id`
  - `answer`
  - `language`
  - `device_type`

---

### 5. `trackAnalysisSubmit`
- **Canonical event name:** `analysis_submit`
- **pixels.client.ts function:** `trackAnalysisSubmit(params)`
- **Parameters sent:**
  - `archetype`
  - `life_path_number`
  - `language`
  - `region`
  - `device_type`
  - UTM params

---

### 6. `trackPreviewLoadingStart`
- **Canonical event name:** `preview_loading_start`
- **pixels.client.ts function:** `trackPreviewLoadingStart()`
- **Parameters sent:**
  - `device_type`
  - UTM params

---

### 7. `trackPreviewLoaded`
- **Canonical event name:** `preview_loaded`
- **pixels.client.ts function:** `trackPreviewLoaded(params)`
- **Parameters sent:**
  - `archetype`
  - `life_path_number`
  - `tradition` (note: call site passes `store.region` into the `tradition` field)
  - `language`
  - `device_type`
  - UTM params

---

### 8. `trackPaywallView`
- **Canonical event name:** `paywall_view`
- **pixels.client.ts function:** `trackPaywallView(params)`
- **Parameters sent:**
  - `archetype`
  - `language`
  - `region`
  - `device_type`
  - UTM params

---

### 9. `trackViewContent`
- **Canonical event name:** `ViewContent` (standard pixel event — fires on TikTok and Meta natively, not via `safeTrack`)
- **pixels.client.ts function:** `trackViewContent(params)`
- **Parameters sent (TikTok):** `content_name`, `content_category`, `content_id`, `value`, `currency`
- **Parameters sent (Meta):** `content_name`, `content_ids`, `value`, `currency`

---

### 10. `trackTierSelected`
- **Canonical event name:** `tier_selected`
- **pixels.client.ts function:** `trackTierSelected(params)`
- **Parameters sent:**
  - `tier` (1 / 2 / 3)
  - `price`
  - `archetype`
  - `language`
  - `device_type`
  - UTM params

---

### 11. `trackInitiateCheckout`
- **Canonical event name:** `InitiateCheckout` (standard pixel event — fires on TikTok and Meta natively)
- **pixels.client.ts function:** `trackInitiateCheckout(params)`
- **Parameters sent (TikTok):** `value`, `currency`, `content_name`
- **Parameters sent (Meta):** `value`, `currency`, `num_items`

---

### 12. `trackPurchase`
- **Canonical event name:** `CompletePayment` (TikTok) / `Purchase` (Meta) / `checkout_complete` (safeTrack custom)
- **pixels.client.ts function:** `trackPurchase(params)`
- **Parameters sent (standard pixels):** `value`, `currency`, `content_name` / `content_type`
- **Parameters sent (safeTrack):**
  - `value`, `currency`
  - `tier`
  - `archetype`
  - `language`
  - `region`
  - `device_type`
  - UTM params

---

### 13. `trackUpsellViewed`
- **Canonical event name:** `upsell_viewed`
- **pixels.client.ts function:** `trackUpsellViewed(params)`
- **Parameters sent:**
  - `upsell_type` (compatibility / calendar / birthChart / bundle)
  - `archetype`
  - `language`
  - `device_type`
  - UTM params

---

### 14. `trackUpsellAccepted`
- **Canonical event name:** `upsell_accepted`
- **pixels.client.ts function:** `trackUpsellAccepted(params)`
- **Parameters sent:**
  - `upsell_type` (compatibility / calendar / birthChart / bundle)
  - `price`
  - `archetype`
  - `language`
  - `device_type`
  - UTM params

---

### 15. `trackReportViewed`
- **Canonical event name:** `report_viewed`
- **pixels.client.ts function:** `trackReportViewed(params)`
- **Parameters sent:**
  - `archetype`
  - `life_path_number`
  - `language`
  - `region`
  - `device_type`
  - UTM params

---

### 16. `trackShareCardOpened`
- **Canonical event name:** `share_card_opened`
- **pixels.client.ts function:** `trackShareCardOpened()`
- **Parameters sent:**
  - `device_type`

---

### 17. `trackShareCardDownloaded`
- **Canonical event name:** `share_card_downloaded`
- **pixels.client.ts function:** `trackShareCardDownloaded()`
- **Parameters sent:**
  - `device_type`

---

### 18. `trackEmailCaptureSuccess`
- **Canonical event name:** `email_capture_success`
- **pixels.client.ts function:** `trackEmailCaptureSuccess(params)`
- **Parameters sent:**
  - `source` (paywall / report / opt-in)
  - `language`
  - `device_type`
  - UTM params

---

## Section 2 — Call-Site Audit Table

> **Methodology:** Each page file was grepped for the exact injected function name. A call is marked YES only if the literal function call was found in the file. Line numbers reference the file as of April 2026.

| Event name | pixels.client.ts function | Expected page | Call found | Line |
|---|---|---|---|---|
| `landing_view` | `trackLandingView` | `index.vue` | YES | 68 |
| `analysis_start` | `trackAnalysisStart` | `index.vue` | YES | 33 |
| `step1_complete` | `trackStep1Complete` | `analysis.vue` | YES | 752 |
| `question_answered` | `trackQuestionAnswered` | `analysis.vue` | YES | 643 |
| `analysis_submit` | `trackAnalysisSubmit` | `analysis.vue` | YES | 774 |
| `preview_loading_start` | `trackPreviewLoadingStart` | `preview.vue` | YES | 351 |
| `preview_loaded` | `trackPreviewLoaded` | `preview.vue` | YES | 402 |
| `paywall_view` | `trackPaywallView` | `preview.vue` | YES | 408 |
| `ViewContent` | `trackViewContent` | `preview.vue` | YES | 396 |
| `tier_selected` | `trackTierSelected` | `preview.vue` | YES | 560 |
| `InitiateCheckout` | `trackInitiateCheckout` | `preview.vue` | YES | 566 |
| `checkout_complete` / `Purchase` | `trackPurchase` | `report.vue` | YES | 1239 |
| `upsell_viewed` (bundle) | `trackUpsellViewed` | `report.vue` | YES | 1250 |
| `upsell_viewed` (compatibility) | `trackUpsellViewed` | `report.vue` | YES | 1359 |
| `upsell_viewed` (calendar) | `trackUpsellViewed` | `report.vue` | YES | 1398 |
| `upsell_viewed` (birthChart) | `trackUpsellViewed` | `report.vue` | YES | 1467 |
| `upsell_accepted` (bundle) | `trackUpsellAccepted` | `report.vue` | YES | 1271 |
| `upsell_accepted` (compatibility) | `trackUpsellAccepted` | `report.vue` | YES | 1385 |
| `upsell_accepted` (calendar) | `trackUpsellAccepted` | `report.vue` | YES | 1415 |
| `upsell_accepted` (birthChart) | `trackUpsellAccepted` | `report.vue` | YES | 1486 |
| `report_viewed` | `trackReportViewed` | `report.vue` | YES | 1019, 1053, 1147, 1170 |
| `share_card_opened` | `trackShareCardOpened` | `report.vue` | YES | 1312 |
| `share_card_downloaded` | `trackShareCardDownloaded` | `report.vue` | YES | 1341 |
| `email_capture_success` | `trackEmailCaptureSuccess` | `preview.vue` | YES | 531 |

### Missing call sites — resolved in Batch 2-B

All 5 missing call sites were added in Batch 2-B (April 2026). No open gaps remain.

| # | Event | Fixed at | Line |
|---|---|---|---|
| M-1 | `upsell_viewed` (calendar) | `buyCalendar()` entry | 1398 |
| M-2 | `upsell_viewed` (birthChart) | `buyBirthChart()` entry (after already-purchased guard) | 1467 |
| M-3 | `upsell_accepted` (compatibility) | inside `if (url)` before redirect | 1385 |
| M-4 | `upsell_accepted` (calendar) | inside `if (url)` before redirect | 1415 |
| M-5 | `upsell_accepted` (birthChart) | inside `if (url)` before redirect | 1486 |

---

## Notes

- `trackUpsellAccepted` for compatibility cannot be placed after redirect (`window.location.href = url`) because the browser navigates away immediately. It must fire **before** the redirect, matching the pattern used for bundle (`report.vue:1271`).
- `upsell_viewed` for calendar and birthChart are missing because `buyCalendar()` and `buyBirthChart()` do not call any tracking helper on entry.
- All 5 missing call sites will be added in Batch 2-B after PostHog integration is complete, so PostHog also receives these events from day one.
