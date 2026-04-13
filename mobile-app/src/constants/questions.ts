export interface Question {
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'When someone you care about pulls away, what is your first instinct?',
    options: [
      { label: 'Trust they need space', value: 'trust' },
      { label: 'Wait for them to return', value: 'wait' },
      { label: 'Talk it through immediately', value: 'talk' },
      { label: 'Push harder to reconnect', value: 'push' },
    ],
  },
  {
    id: 'q2',
    text: 'Which version of yourself are you working toward right now?',
    options: [
      { label: 'Softer and more open', value: 'softer' },
      { label: 'Sharper and more focused', value: 'sharper' },
      { label: 'More ambitious and driven', value: 'ambitious' },
      { label: 'Less lost and more grounded', value: 'lost' },
    ],
  },
  {
    id: 'q3',
    text: 'In relationships, what fear shows up most often for you?',
    options: [
      { label: 'That they will leave', value: 'leaving' },
      { label: 'That I will be unseen', value: 'unseen' },
      { label: 'That I give more than I receive', value: 'giving' },
      { label: 'That I am too much', value: 'burden' },
    ],
  },
  {
    id: 'q4',
    text: 'What do you most want to feel in your life right now?',
    options: [
      { label: 'Capable and in control', value: 'capable' },
      { label: 'Less alone', value: 'alone' },
      { label: 'Like I matter', value: 'matters' },
      { label: 'Less overwhelmed', value: 'toomuch' },
    ],
  },
  {
    id: 'q5',
    text: 'How do people usually describe you in one word?',
    options: [
      { label: 'Strong', value: 'strong' },
      { label: 'Reliable', value: 'reliable' },
      { label: 'Intense', value: 'intense' },
      { label: 'Independent', value: 'independent' },
    ],
  },
  {
    id: 'q6',
    text: 'When you experience something beautiful, what do you usually do?',
    options: [
      { label: 'Enjoy it quietly alone', value: 'enjoy' },
      { label: 'Wonder if it will last', value: 'wonder' },
      { label: 'Share it with someone', value: 'share' },
      { label: 'Think about what comes next', value: 'next' },
    ],
  },
  {
    id: 'q7',
    text: 'What happens to you when you are emotionally overwhelmed?',
    options: [
      { label: 'I give up or shut down', value: 'givesup' },
      { label: 'I feel nothing at all', value: 'feelsnothing' },
      { label: 'I need others more than ever', value: 'needstoo' },
      { label: 'I push everyone away', value: 'pushesaway' },
    ],
  },
];

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const REGION_OPTIONS = [
  { value: 'western', label: 'Western' },
  { value: 'india',   label: 'Vedic'   },
  { value: 'china',   label: 'Chinese' },
  { value: 'latam',   label: 'Tarot'   },
];
