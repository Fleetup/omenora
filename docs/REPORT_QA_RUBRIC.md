# REPORT QA RUBRIC
**Version:** 1.0  
**Created:** April 2026  
**Purpose:** Structured pass/fail scoring for OMENORA AI report quality. Used by the B-1 QA review (200-report minimum sample).  
**Log file:** `REPORT_QA_LOG.csv`

---

## Scoring Criteria

Score each criterion as PASS, FAIL, or N/A (where permitted). Record results in `REPORT_QA_LOG.csv`.

---

### 1. SPECIFICITY

**Definition:** Does the report content reference the user's specific behavioral answers, not just the archetype label?

**PASS:** Content references at least 2 of the user's specific answer values by their behavioral meaning (not just the archetype label). Example: a report for a user who answered "gut instinct" to decision-making and "burnout" to energy patterns should mention these specific behavioral traits by their meaning.

**FAIL:** Content could apply to any user who shares the same archetype regardless of their 7 answers. Generic archetype description with no behavioral grounding.

**How to check:** Compare the report against the user's 7 behavioral answers stored in the `answers` column. Identify at least 2 places where the answer content, not just the archetype, drove the output. If you cannot find 2, mark FAIL.

---

### 2. EMOTIONAL RESONANCE

**Definition:** Does the Identity section opening sentence recognize this specific user, or define the archetype generically?

**PASS:** The Identity section opening sentence makes a specific behavioral claim about this user — not a general description of the archetype. Recognition pattern: "You've rebuilt things..." / "You process the world through..." / "There's a version of you that..."

**FAIL:** Opening sentence is a definition ("The Phoenix is a person who...") or describes the archetype in third person or general terms, rather than directly addressing the user's lived experience.

**How to check:** Read the first sentence of `sections.identity.content`. Does it speak directly to the user ("you") with a specific behavioral claim? Or does it define the archetype abstractly?

---

### 3. INTERNAL CONSISTENCY

**Definition:** Do all sections cohere, or do they contradict each other?

**PASS:** No section contradicts another. The Career section does not describe traits that directly conflict with the Love section. Emotional patterns described in Identity are consistent with those in Career and Purpose.

**FAIL:** Two or more sections contain contradictory statements about the same trait or pattern. Example: Identity says "you avoid conflict" while Love says "you thrive in intense confrontational relationships." These cannot both be true of the same person.

**How to check:** Read all 7 sections. Flag any statements about the same trait (decision-making, relationships, energy, avoidance patterns) that directly contradict each other. One contradiction = FAIL.

---

### 4. NON-GENERICITY

**Definition:** Is this report specific to this user, or could it describe almost anyone?

**PASS:** Fewer than 30% of users with different answer inputs would receive content this specific. The report contains concrete, particular language about this user's behavioral profile.

**FAIL:** The content is applicable to any user regardless of their archetype or answers. Generic self-improvement language, fortune-cookie phrasing, or content that would be equally valid for any of the 12 archetypes. Example failures: "You are capable of great things," "Trust your instincts," "Balance is important for you."

**How to check:** Read the forecast and love sections. Ask: could this be published word-for-word in a mass horoscope column? If yes, mark FAIL.

---

### 5. UPSELL READINESS

**Definition:** Do the locked/blurred section teasers create genuine curiosity, or do they repeat what's already visible?

**PASS:** The blurred/locked section teasers reference something specific that was NOT covered in the two visible (unlocked) sections — creates genuine curiosity about what's inside.

**FAIL:** Teasers repeat what the visible sections already said, or use generic "unlock to see more" language without specificity. Example failure: a teaser that says "discover your deeper patterns" when the visible section already discussed patterns.

**How to check:** Read the two visible sections fully. Then read the teaser text for each locked section. Does the teaser reference a concept, named trait, or specific claim not already covered? If not, mark FAIL.

---

### 6. TRADITION COHERENCE

**Definition:** For non-Western traditions, does the report reference tradition-specific calculated data?

**PASS (Vedic):** Nakshatra or Dasha period is referenced by name in at least one section. The specific Nakshatra name calculated for this user (e.g. "Ashwini," "Rohini") appears in the report.

**PASS (BaZi):** Day Master element or dominant element is referenced by name in at least one section (e.g. "Yang Wood," "Yin Fire," or the dominant element such as "Water" or "Metal").

**PASS (Tarot):** Soul Card is referenced by name in at least one section.

**PASS (Western):** Mark as N/A. N/A counts as PASS for overall scoring purposes.

**FAIL:** Tradition-specific calculated data is absent from the report despite the tradition being set to non-Western in the user's session metadata. The report reads as a generic Western reading regardless of the tradition selected.

**N/A:** Western tradition only. Do not apply to Vedic, BaZi, or Tarot reports.

**How to check:** Check the `region` / tradition field. If non-Western, search the report for the expected tradition-specific term. If absent, mark FAIL.

---

## Overall Pass/Fail

A report receives **overall_pass = TRUE** if and only if:

- Specificity = PASS
- Emotional Resonance = PASS
- Internal Consistency = PASS
- Non-Genericity = PASS
- Upsell Readiness = PASS
- Tradition Coherence = PASS or N/A

A single FAIL on any criterion = **overall_pass = FALSE**.

**Target:** ≥ 85% of sampled reports receive overall_pass = TRUE before Phase 1 launch.

---

## Appendix — Sampling Matrix

Minimum sample sizes for the B-1 QA review. Pull reports from the Supabase `reports` table ordered by `created_at DESC`.

### By Archetype (top 8 by frequency — minimum 10 each)
- Phoenix
- Architect (Silent Architect)
- Storm (Storm Caller)
- Lighthouse
- Wanderer
- Alchemist
- Guardian
- Visionary

### By Archetype (remaining 4 — minimum 5 each)
- Mirror
- Catalyst
- Sage
- Wildfire

### By Language (minimum 10 each active language)
- English (`en`)
- Spanish (`es`)
- Portuguese (`pt`)
- Hindi (`hi`)
- Korean (`ko`)
- Chinese (`zh`)

### By Tradition / Region
- Western: minimum 15 reports
- India (Vedic): minimum 10 reports
- China (BaZi): minimum 10 reports
- LATAM: minimum 10 reports
- Korea: minimum 5 reports
- Middle East: minimum 5 reports

### By Time-of-Birth
- Time of birth present: minimum 15 reports
- Time of birth absent: minimum 15 reports

### By Name Input
- Include varied name inputs across genders and cultures (minimum 5 non-Western names in the sample)

### Total minimum sample
**200 reports** — pull enough to satisfy all matrix requirements simultaneously. Some reports will count toward multiple categories (e.g. a Hindi + India + time-of-birth-present report satisfies 3 rows).

---

## Reviewer Notes

- Record each review in `REPORT_QA_LOG.csv` on the day it is reviewed (`reviewed_date`).
- Add specific failure notes in the `failure_notes` column — do not leave it blank on a FAIL.
- Aggregate results weekly. If overall_pass rate drops below 80% in any language or tradition bucket, escalate immediately — do not wait for the full 200-report review to complete.
- Do not score the same `report_id` twice.
