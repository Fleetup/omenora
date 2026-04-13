export const ARCHETYPES = [
  { id: 'phoenix',    name: 'The Phoenix',          symbol: '●', element: 'Fire'  },
  { id: 'architect',  name: 'The Silent Architect',  symbol: '◆', element: 'Earth' },
  { id: 'storm',      name: 'The Storm Caller',      symbol: '▲', element: 'Air'   },
  { id: 'lighthouse', name: 'The Lighthouse',        symbol: '◇', element: 'Water' },
  { id: 'wanderer',   name: 'The Wanderer',          symbol: '○', element: 'Air'   },
  { id: 'alchemist',  name: 'The Alchemist',         symbol: '⬡', element: 'Fire'  },
  { id: 'guardian',   name: 'The Guardian',          symbol: '□', element: 'Earth' },
  { id: 'visionary',  name: 'The Visionary',         symbol: '⬟', element: 'Fire'  },
  { id: 'mirror',     name: 'The Mirror',            symbol: '◉', element: 'Water' },
  { id: 'catalyst',   name: 'The Catalyst',          symbol: '✦', element: 'Air'   },
  { id: 'sage',       name: 'The Sage',              symbol: '▽', element: 'Earth' },
  { id: 'wildfire',   name: 'The Wildfire',          symbol: '★', element: 'Fire'  },
] as const;

/**
 * Assigns a frontend archetype hint based on the user's 7-question answers.
 * This is sent to the backend AI which uses it as context, then generates
 * the authoritative archetype in the report.
 */
export function assignArchetype(answers: Record<string, string>): string {
  const { q1, q2, q3, q4, q5 } = answers;

  if (q5 === 'intense'      && q1 === 'push')       return 'phoenix';
  if (q5 === 'strong'       && q2 === 'sharper')    return 'architect';
  if (q5 === 'intense'      && q4 === 'matters')    return 'storm';
  if (q1 === 'trust'        && q5 === 'reliable')   return 'lighthouse';
  if (q1 === 'wait'         && q4 === 'alone')      return 'wanderer';
  if (q2 === 'ambitious'    && q4 === 'capable')    return 'alchemist';
  if (q5 === 'strong'       && q3 === 'leaving')    return 'guardian';
  if (q2 === 'softer'       && q4 === 'alone')      return 'visionary';
  if (q1 === 'trust'        && q5 === 'strong')     return 'mirror';
  if (q5 === 'independent'  && q2 === 'sharper')    return 'catalyst';
  if (q1 === 'trust'        && q2 === 'softer')     return 'sage';

  return 'wildfire';
}
