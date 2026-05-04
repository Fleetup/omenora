import { renderCompatibilityCard } from '../utils/compat-card-renderer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const firstName          = sanitizeString(body.firstName          ?? '', 50)
  const partnerName        = sanitizeString(body.partnerName        ?? '', 50)
  const compatibilityScore = Number(body.compatibilityScore)         || 0
  const compatibilityTitle = sanitizeString(body.compatibilityTitle ?? '', 120)
  const challengeContent   = sanitizeString(body.challengeContent   ?? '', 500)

  assertInput(
    Number.isInteger(compatibilityScore) && compatibilityScore >= 0 && compatibilityScore <= 100,
    'compatibilityScore must be 0–100',
  )

  const buffer = await renderCompatibilityCard({
    firstName,
    partnerName,
    compatibilityScore,
    compatibilityTitle,
    challengeContent,
  })

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-compatibility-${firstName || 'reading'}.png"`,
  )

  return buffer
})
