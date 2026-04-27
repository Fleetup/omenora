import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'https://omenora.com/api/generate-compatibility';
const OUTPUT_PATH = join(__dirname, 'sample-readings.json');
const DELAY_MS = 3000;

const pairings = [
  {
    label: 'Capricorn + Gemini',
    person1: { dob: '1985-01-19', city: 'Vrbas, Serbia' },
    person2: { dob: '1990-06-15', city: 'New York' },
  },
  {
    label: 'Aries + Scorpio',
    person1: { dob: '1988-03-21', city: 'Los Angeles' },
    person2: { dob: '1992-11-08', city: 'Chicago' },
  },
  {
    label: 'Cancer + Aquarius',
    person1: { dob: '1990-07-04', city: 'Miami' },
    person2: { dob: '1987-02-14', city: 'London' },
  },
  {
    label: 'Scorpio + Taurus',
    person1: { dob: '1983-10-23', city: 'New York' },
    person2: { dob: '1991-05-01', city: 'Paris' },
  },
  {
    label: 'Capricorn + Leo',
    person1: { dob: '1995-12-22', city: 'Toronto' },
    person2: { dob: '1989-08-11', city: 'Sydney' },
  },
  {
    label: 'Virgo + Taurus',
    person1: { dob: '1986-09-15', city: 'Berlin' },
    person2: { dob: '1993-04-20', city: 'Tokyo' },
  },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchReading(pairing) {
  const body = {
    firstName: '',
    dateOfBirth: pairing.person1.dob,
    partnerName: '',
    partnerDob: pairing.person2.dob,
    partnerCity: pairing.person2.city,
    language: 'en',
    previewMode: false,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

function extractResult(pairing, data) {
  const receipt = data.calculationReceipt ?? {};
  const p1Receipt = receipt.person1 ?? {};
  const p2Receipt = receipt.person2 ?? {};
  const sections = data.sections ?? {};

  return {
    pairing: pairing.label,
    person1: {
      dob: pairing.person1.dob,
      sunSign: p1Receipt.sunSign ?? null,
      lifePathNumber: p1Receipt.lifePathNumber ?? null,
      archetype: p1Receipt.archetype ?? null,
    },
    person2: {
      dob: pairing.person2.dob,
      sunSign: p2Receipt.sunSign ?? null,
      lifePathNumber: p2Receipt.lifePathNumber ?? null,
    },
    score: data.compatibilityScore ?? null,
    title: data.compatibilityTitle ?? null,
    challenge: sections.challenge?.content ?? null,
    bond: sections.bond?.content ?? null,
    advice: sections.advice?.content ?? null,
  };
}

async function main() {
  const results = [];

  for (let i = 0; i < pairings.length; i++) {
    const pairing = pairings[i];
    console.log(`\n[${i + 1}/${pairings.length}] Fetching: ${pairing.label} ...`);

    try {
      const data = await fetchReading(pairing);
      const result = extractResult(pairing, data);
      results.push(result);

      console.log(`  Score : ${result.score}`);
      console.log(`  Title : ${result.title}`);
      console.log(`  P1    : ${result.person1.sunSign} | LP ${result.person1.lifePathNumber} | ${result.person1.archetype}`);
      console.log(`  P2    : ${result.person2.sunSign} | LP ${result.person2.lifePathNumber}`);
      console.log(`  Challenge (preview): ${String(result.challenge ?? '').slice(0, 120)}...`);
    } catch (err) {
      console.error(`  ERROR for ${pairing.label}: ${err.message}`);
      results.push({ pairing: pairing.label, error: err.message });
    }

    if (i < pairings.length - 1) {
      console.log(`  Waiting ${DELAY_MS / 1000}s before next call...`);
      await delay(DELAY_MS);
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nDone. Results saved to: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
