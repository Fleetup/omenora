import { geocodeCity } from '~~/server/utils/geocode'
import { calculateNatalChart, assignArchetypeFromChart } from '~~/app/utils/natalChart'
import { calculateLifePathNumber } from '~~/app/utils/lifePathNumber'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // ── Step 1: Validate inputs ──────────────────────────────────────────────

    const firstName   = sanitizeString(body.firstName, 50)
    const dateOfBirth = sanitizeString(body.dateOfBirth, 10)
    const city        = sanitizeString(body.city, 100)
    const timeOfBirth = body.timeOfBirth === null || body.timeOfBirth === undefined
      ? null
      : sanitizeString(body.timeOfBirth, 20)

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

    // ── Step 3: Calculate natal chart ────────────────────────────────────────

    const chart = calculateNatalChart({ dateOfBirth, timeOfBirth, city, lat, lon })

    // ── Step 4: Assign archetype ─────────────────────────────────────────────

    const archetype = assignArchetypeFromChart(chart)

    // ── Step 5: Calculate Life Path Number ───────────────────────────────────

    const lifePathNumber = calculateLifePathNumber(dateOfBirth)

    // ── Step 6: Return response ──────────────────────────────────────────────

    return {
      archetype,
      lifePathNumber,
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
      geocoded: { lat, lon },
    }
  } catch (err) {
    console.error('[calculate-chart]', err)
    return sendError(event, createError({ statusCode: 500, message: 'Chart calculation failed' }))
  }
})
