import { geocodeCity } from '~~/server/utils/geocode'
import { calculateNatalChart, assignArchetypeFromChart } from '~~/app/utils/natalChart'
import { calculateLifePathNumber } from '~~/app/utils/lifePathNumber'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // ── Step 1: Validate inputs ──────────────────────────────────────────────

    const firstName         = sanitizeString(body.firstName, 50)
    const dateOfBirth       = sanitizeString(body.dateOfBirth, 10)
    const city              = sanitizeString(body.city, 100)
    const timeOfBirth       = body.timeOfBirth === null || body.timeOfBirth === undefined
      ? null
      : sanitizeString(body.timeOfBirth, 20)
    // UTC offset in minutes supplied by the client browser (e.g. -300 for EST).
    // Clamped server-side in calculateNatalChart; default 0 (UTC) if absent.
    const rawOffset         = Number(body.utcOffsetMinutes)
    const utcOffsetMinutes  = Number.isFinite(rawOffset) ? Math.max(-840, Math.min(840, rawOffset)) : 0

    if (!firstName) {
      return sendError(event, createError({ statusCode: 400, message: 'Invalid input', data: { field: 'firstName' } }))
    }
    if (!isValidDateOfBirth(dateOfBirth)) {
      return sendError(event, createError({ statusCode: 400, message: 'Invalid input', data: { field: 'dateOfBirth' } }))
    }
    if (!city) {
      return sendError(event, createError({ statusCode: 400, message: 'Invalid input', data: { field: 'city' } }))
    }

    // ── Step 2: Geocode city ─────────────────────────────────────────────────

    const { lat, lon } = await geocodeCity(city)
    const geocodeFailed = lat === 0 && lon === 0

    // ── Step 3: Calculate natal chart ────────────────────────────────────────

    const chart = calculateNatalChart({ dateOfBirth, timeOfBirth, utcOffsetMinutes, city, lat, lon })

    // ── Step 4: Assign archetype ─────────────────────────────────────────────

    const archetype = assignArchetypeFromChart(chart)

    // ── Step 5: Calculate Life Path Number ───────────────────────────────────

    const lifePathNumber = calculateLifePathNumber(dateOfBirth)

    // ── Step 6: Return response ──────────────────────────────────────────────

    return {
      archetype,
      lifePathNumber,
      geocodeFailed,
      chart: {
        sun:       chart.sun,
        moon:      chart.moon,
        mercury:   chart.mercury,
        venus:     chart.venus,
        mars:      chart.mars,
        jupiter:   chart.jupiter,
        saturn:    chart.saturn,
        ascendant: chart.ascendant,
      },
    }
  } catch (err: any) {
    console.error('[calculate-chart] FULL ERROR:', JSON.stringify({
      message: err?.message,
      code:    err?.code,
      stack:   err?.stack?.split('\n').slice(0, 5),
    }))
    return sendError(event, createError({
      statusCode:    500,
      statusMessage: 'Chart calculation failed',
      data:          { detail: err?.message },
    }))
  }
})
