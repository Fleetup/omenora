/**
 * Ad card generator — run locally to produce example compatibility cards
 * for use in social media campaigns.
 *
 * Usage (from the augur/ directory):
 *   npx tsx scripts/generate-ad-cards.ts
 *
 * Output:  augur/scripts/ad-output/*.png  (gitignored)
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderCompatibilityCard, type CompatCardData } from '../server/utils/compat-card-renderer'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'ad-output')

// ── Example cards ─────────────────────────────────────────────────────────────
// Each represents a distinct compatibility story: high, mid, and tension ranges.
// Vary score, title, and challenge copy to showcase the full visual range.
const EXAMPLES: Array<{ fileName: string } & CompatCardData> = [
  {
    fileName:           '01-sofia-marco-92pct.png',
    firstName:          'Sofia',
    partnerName:        'Marco',
    compatibilityScore: 92,
    compatibilityTitle: 'Twin Flames',
    challengeContent:   'You each carry an intensity that amplifies the other — learn when to cool the flame before it consumes what it loves.',
  },
  {
    fileName:           '02-emma-james-74pct.png',
    firstName:          'Emma',
    partnerName:        'James',
    compatibilityScore: 74,
    compatibilityTitle: 'The Magnetic Pull',
    challengeContent:   'Your rhythms are different. One plans, one improvises. The friction is not a problem — it is the invitation to grow.',
  },
  {
    fileName:           '03-isabella-liam-88pct.png',
    firstName:          'Isabella',
    partnerName:        'Liam',
    compatibilityScore: 88,
    compatibilityTitle: 'Soulbound',
    challengeContent:   'Closeness can blur where one ends and the other begins. Hold space for your individuality — it is what protects the bond.',
  },
  {
    fileName:           '04-ava-noah-58pct.png',
    firstName:          'Ava',
    partnerName:        'Noah',
    compatibilityScore: 58,
    compatibilityTitle: 'Beautiful Friction',
    challengeContent:   'You speak different love languages. What reads as distance is simply difference. Translation is the real work here.',
  },
  {
    fileName:           '05-charlotte-oliver-67pct.png',
    firstName:          'Charlotte',
    partnerName:        'Oliver',
    compatibilityScore: 67,
    compatibilityTitle: 'The Dance of Opposites',
    challengeContent:   'The very qualities that drew you together are the ones creating the most friction. Learn to lead and follow in turns.',
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`Generating ${EXAMPLES.length} compatibility ad cards...`)
  console.log(`Output → ${OUTPUT_DIR}\n`)

  for (const { fileName, ...cardData } of EXAMPLES) {
    const outPath = join(OUTPUT_DIR, fileName)
    process.stdout.write(`  ${fileName} ... `)

    const buffer = await renderCompatibilityCard(cardData)
    writeFileSync(outPath, buffer)

    console.log('done')
  }

  console.log(`\nAll ${EXAMPLES.length} cards saved. Open the ad-output folder to review them.`)
}

main().catch((err: unknown) => {
  console.error('\nError generating cards:')
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
