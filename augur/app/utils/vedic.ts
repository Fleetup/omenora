export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', symbol: 'Horse Head',
    deity: 'Ashwini Kumaras', quality: 'Swift beginnings, healing energy, pioneering spirit' },
  { id: 2, name: 'Bharani', symbol: 'Yoni',
    deity: 'Yama', quality: 'Transformation, responsibility, carrying burdens with grace' },
  { id: 3, name: 'Krittika', symbol: 'Razor',
    deity: 'Agni', quality: 'Sharp clarity, purification, the power to cut through illusion' },
  { id: 4, name: 'Rohini', symbol: 'Chariot',
    deity: 'Brahma', quality: 'Growth, beauty, fertile creativity, magnetic attraction' },
  { id: 5, name: 'Mrigashira', symbol: 'Deer Head',
    deity: 'Soma', quality: 'Gentle seeking, wandering curiosity, the eternal search' },
  { id: 6, name: 'Ardra', symbol: 'Teardrop',
    deity: 'Rudra', quality: 'Storms of transformation, destruction that renews' },
  { id: 7, name: 'Punarvasu', symbol: 'Quiver of Arrows',
    deity: 'Aditi', quality: 'Return to light, renewal, boundless possibility' },
  { id: 8, name: 'Pushya', symbol: 'Flower',
    deity: 'Brihaspati', quality: 'Nourishment, wisdom, the most auspicious energy' },
  { id: 9, name: 'Ashlesha', symbol: 'Coiled Serpent',
    deity: 'Nagas', quality: 'Kundalini power, sharp insight, mystical wisdom' },
  { id: 10, name: 'Magha', symbol: 'Royal Throne',
    deity: 'Pitris', quality: 'Royal authority, ancestral power, noble purpose' },
  { id: 11, name: 'Purva Phalguni', symbol: 'Hammock',
    deity: 'Bhaga', quality: 'Pleasure, creativity, the joy of being alive' },
  { id: 12, name: 'Uttara Phalguni', symbol: 'Bed',
    deity: 'Aryaman', quality: 'Patronage, contracts, loyal partnerships' },
  { id: 13, name: 'Hasta', symbol: 'Hand',
    deity: 'Savitar', quality: 'Skilled hands, craftsmanship, healing touch' },
  { id: 14, name: 'Chitra', symbol: 'Bright Jewel',
    deity: 'Vishwakarma', quality: 'Brilliant creativity, beauty, the architect of worlds' },
  { id: 15, name: 'Swati', symbol: 'Sword',
    deity: 'Vayu', quality: 'Independence, flexibility, the wind that bends but never breaks' },
  { id: 16, name: 'Vishakha', symbol: 'Triumphal Arch',
    deity: 'Indra-Agni', quality: 'Purposeful ambition, achieving goals through persistence' },
  { id: 17, name: 'Anuradha', symbol: 'Lotus',
    deity: 'Mitra', quality: 'Devotion, friendship, the lotus that rises through mud' },
  { id: 18, name: 'Jyeshtha', symbol: 'Circular Amulet',
    deity: 'Indra', quality: 'Seniority, protection, the eldest who carries responsibility' },
  { id: 19, name: 'Mula', symbol: 'Tied Roots',
    deity: 'Nirriti', quality: 'Getting to the root, dissolution, the power of endings' },
  { id: 20, name: 'Purva Ashadha', symbol: 'Elephant Tusk',
    deity: 'Apas', quality: 'Invincibility, purification, the power of water' },
  { id: 21, name: 'Uttara Ashadha', symbol: 'Elephant Tusk',
    deity: 'Vishvadevas', quality: 'Universal victory, final achievement, lasting success' },
  { id: 22, name: 'Shravana', symbol: 'Ear',
    deity: 'Vishnu', quality: 'Listening, learning, connecting all of existence' },
  { id: 23, name: 'Dhanishta', symbol: 'Drum',
    deity: 'Eight Vasus', quality: 'Abundance, rhythm, the beat that moves the world' },
  { id: 24, name: 'Shatabhisha', symbol: 'Empty Circle',
    deity: 'Varuna', quality: 'Healing, mystery, the thousand physicians of the sky' },
  { id: 25, name: 'Purva Bhadrapada', symbol: 'Sword',
    deity: 'Aja Ekapada', quality: 'Fierce transformation, the fire that purifies the soul' },
  { id: 26, name: 'Uttara Bhadrapada', symbol: 'Twins',
    deity: 'Ahir Budhnya', quality: 'Depth, wisdom, the serpent of the deep' },
  { id: 27, name: 'Revati', symbol: 'Fish',
    deity: 'Pushan', quality: 'Completion, nourishment, safe passage to new cycles' },
]

/**
 * ACCURACY SCOPE — Nakshatra assignment (accepted approximation, April 2026)
 *
 * This function assigns a Nakshatra based on the day-of-year of the birth date,
 * cycling through all 27 Nakshatras on a 13.5-day period (27 × 13.5 ≈ 365 days).
 *
 * Traditional Vedic astrology assigns the Nakshatra based on the Moon's sidereal
 * longitude at birth, which cycles independently every ~27.32 days regardless of
 * the calendar year. This implementation is a calendar-based approximation — two
 * people born one year apart on the same date will receive the same Nakshatra,
 * which is correct by this formula but diverges from traditional ephemeris results.
 *
 * This approximation is intentional and accepted for the current product scope.
 * Vedic tradition is restricted from paid ad creative until Phase 2.
 * See TRADITION_CALC_AUDIT.md for the full decision record.
 */
export function getNakshatra(dateOfBirth: string) {
  const date = new Date(dateOfBirth)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  const index = Math.floor(dayOfYear / 13.5) % 27
  const safeIndex = ((index % 27) + 27) % 27
  return NAKSHATRAS[safeIndex] ?? NAKSHATRAS[0]!
}

export function getVedicElement(lifePathNumber: number) {
  const elements: Record<number, string> = {
    1: 'Fire', 2: 'Earth', 3: 'Air', 4: 'Earth',
    5: 'Air', 6: 'Water', 7: 'Air', 8: 'Earth',
    9: 'Fire', 11: 'Air', 22: 'Earth', 33: 'Fire',
  }
  return elements[lifePathNumber] ?? 'Air'
}

export function getVedicPlanet(lifePathNumber: number) {
  const planets: Record<number, string> = {
    1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu',
    5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn',
    9: 'Mars', 11: 'Moon', 22: 'Saturn', 33: 'Jupiter',
  }
  return planets[lifePathNumber] ?? 'Mercury'
}
