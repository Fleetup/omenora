export const ARCHETYPES = [
  { id: 'phoenix', name: 'The Phoenix', symbol: '●', element: 'Fire' },
  { id: 'architect', name: 'The Silent Architect', symbol: '◆', element: 'Earth' },
  { id: 'storm', name: 'The Storm Caller', symbol: '▲', element: 'Air' },
  { id: 'lighthouse', name: 'The Lighthouse', symbol: '◇', element: 'Water' },
  { id: 'wanderer', name: 'The Wanderer', symbol: '○', element: 'Air' },
  { id: 'alchemist', name: 'The Alchemist', symbol: '⬡', element: 'Fire' },
  { id: 'guardian', name: 'The Guardian', symbol: '□', element: 'Earth' },
  { id: 'visionary', name: 'The Visionary', symbol: '⬟', element: 'Fire' },
  { id: 'mirror', name: 'The Mirror', symbol: '◉', element: 'Water' },
  { id: 'catalyst', name: 'The Catalyst', symbol: '✦', element: 'Air' },
  { id: 'sage', name: 'The Sage', symbol: '▽', element: 'Earth' },
  { id: 'wildfire', name: 'The Wildfire', symbol: '★', element: 'Fire' },
]

export function assignArchetype(answers: Record<string, string>): string {
  // Simple assignment logic based on answer combinations
  const { q1, q2, q3, q4, q5 } = answers

  if (q1 === 'gut' && q5 === 'intense') return 'phoenix'
  if (q1 === 'logic' && q5 === 'driven') return 'architect'
  if (q1 === 'gut' && q4 === 'irrelevance') return 'storm'
  if (q3 === 'giver' && q5 === 'warm') return 'lighthouse'
  if (q2 === 'night' && q4 === 'loneliness') return 'wanderer'
  if (q1 === 'logic' && q4 === 'failure') return 'alchemist'
  if (q3 === 'protector' && q5 === 'calm') return 'guardian'
  if (q1 === 'gut' && q2 === 'morning') return 'visionary'
  if (q3 === 'giver' && q5 === 'calm') return 'mirror'
  if (q1 === 'logic' && q5 === 'intense') return 'catalyst'
  if (q2 === 'morning' && q5 === 'driven') return 'sage'
  return 'wildfire'
}
