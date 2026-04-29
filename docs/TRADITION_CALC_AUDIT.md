# TRADITION CALCULATION AUDIT
**Status:** Accepted approximations — no formula changes required  
**Decision date:** April 2026  
**Owner:** Founder  
**Restriction:** Vedic and BaZi traditions are restricted from paid ad creative until Phase 2

---

## 1. Vedic — Nakshatra Assignment

**File:** `augur/app/utils/vedic.ts` — `getNakshatra()`

### Formula in use

```ts
const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
const index = Math.floor(dayOfYear / 13.5) % 27
```

Assigns one of 27 Nakshatras based on the birth date's day-of-year, cycling
through the full sequence on a 13.5-day period (27 × 13.5 = 364.5 days ≈ 1 year).

### Traditional method

Classical Vedic astrology assigns the Nakshatra based on the **Moon's sidereal
longitude** at birth. The Moon completes a sidereal cycle in approximately
27.32 days, independent of the calendar year. This means the Moon's Nakshatra
on January 1 is not the same every year — it depends on where in its own cycle
the Moon happens to be on that date.

### Divergence from traditional

- Two people born exactly one year apart on the same calendar date will receive
  the **same Nakshatra** under this formula.
- Under traditional ephemeris calculation they would likely receive **different
  Nakshatras** (approximately 50% probability of difference, since 365 mod 27.32
  ≈ 13.7 days of drift per year).
- The distribution of Nakshatras across birth dates is uniform by this formula,
  which is approximately correct for a large population but not individually accurate.

### Decision

**Accepted as approximation.** The product does not claim to perform traditional
Vedic astrology. The Nakshatra is one element of a multi-tradition AI reading.
Individual accuracy at the ephemeris level is not required for the current scope.

**If traditional accuracy is required in a future version:**
- Replace with ephemeris-based Moon longitude using the `astronomia` npm package
  or a pre-computed static lookup table keyed on (year, day-of-year)
- Test vector: verify Jan 1, 1990 against a reference Vedic calculator

### Ad creative restriction

Vedic tradition is restricted from paid ad creative until Phase 2. This restriction
exists independently of the formula decision — it is a product-focus constraint,
not a quality-disqualification.

---

## 2. BaZi — Pillar Calculation

**File:** `augur/app/utils/bazi.ts` — `getBaziPillars()`

### Year Stem / Year Branch

```ts
const yearStemIndex = ((((year - 4) % 10) + 10) % 10)
const yearBranchIndex = ((((year - 4) % 12) + 12) % 12)
```

**Status: Standard and correct.** Formula `(year - 4) mod 10` is anchored to
year 4 CE (the 甲子 Jiǎzǐ cycle start) and is the conventional arithmetic for
deriving the Year Heavenly Stem. Verified against reference dates.

### Day Stem / Day Branch

```ts
const jdn = Math.floor((date.getTime() / 86400000) + 2440587.5)
const dayStemIndex = (((jdn - 11) % 10) + 10) % 10
const dayBranchIndex = (((jdn - 11) % 12) + 12) % 12
```

**Status: Standard and correct.** Julian Day Number offset `(JDN - 11) mod 10`
is the conventional BaZi Day Stem formula. The JDN calculation from Unix
timestamp is correct. Verified against reference dates.

### Month Stem / Month Branch

```ts
const monthStemIndex = (((year * 12 + month) % 10) + 10) % 10
const monthBranchIndex = (((month + 2) % 12) + 12) % 12
```

**Status: Linear approximation — NOT traditional.**

**Traditional method:** The Month Stem in classical BaZi is derived from a
lookup table keyed on `(yearStem % 5, solarMonth)` where `solarMonth` is
determined by the solar term (节气 jiéqì) boundaries, not the Gregorian calendar
month. The Year Stem group (0–4) determines the starting Month Stem for that year,
and each subsequent solar-term month advances by one Heavenly Stem.

**Divergence:** The formula `(year * 12 + month) % 10` is a mathematical
approximation that does not encode the Year Stem dependency. It will produce
incorrect Month Stems for a significant portion of birth dates when compared to
a traditional BaZi calculator such as bazi.guru.

**Month Branch:** The formula `(month + 2) % 12` maps Gregorian months to
Earthly Branches starting from Tiger (Yin, index 2) in January. This is a
calendar-month approximation. Traditional month branches are also solar-term
based, but the approximation is closer to correct than the Month Stem formula.

### Decision

**Accepted as approximation.** The Month Stem is a secondary element within
the BaZi pillar used for Dominant Element calculation (`getDominantElement`).
The Dominant Element output will be approximately correct in most cases.
Individual Month Stem precision at the solar-term level is not required for
the current scope.

**If traditional accuracy is required in a future version:**
- Replace `monthStemIndex` with a lookup table:
  ```
  monthStemTable[yearStem % 5][solarMonth]
  ```
  where `solarMonth` is determined by comparing birth date against a pre-computed
  table of solar term dates for the relevant year range (1900–2100)
- Test vector: verify Nov 15, 1985 against bazi.guru

### Ad creative restriction

BaZi tradition is restricted from paid ad creative until Phase 2. Same
constraint as Vedic — product-focus, not quality-disqualification.

---

## Summary

| Tradition | Element | Formula type | Accuracy | Decision |
|---|---|---|---|---|
| Vedic | Nakshatra | Day-of-year proxy | Approximate (~50% divergence from ephemeris per year) | Accepted |
| BaZi | Year Stem | Standard arithmetic | Correct | N/A |
| BaZi | Day Stem | JDN arithmetic | Correct | N/A |
| BaZi | Month Stem | Linear approximation | Approximate (diverges from solar-term calculation) | Accepted |
| BaZi | Month Branch | Calendar-month proxy | Close approximation | Accepted |

---

## Review schedule

Revisit these decisions at Phase 2 entry when BaZi and Vedic traditions are
considered for paid ad creative. At that point, ephemeris accuracy becomes a
brand trust question, not just a technical one.
