import type { CompatibilityQuizAnswers } from '~/stores/analysisStore'

// ── Option shape ─────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string
  label: string
  emoji?: string
}

// ── Step type shapes ─────────────────────────────────────────────────────────

export interface SingleSelectStep {
  stepNumber: number
  id: string
  type: 'single_select'
  storeKey?: keyof CompatibilityQuizAnswers
  headline: string
  subtext?: string
  options: QuizOption[]
}

export interface DateInputStep {
  stepNumber: number
  id: string
  type: 'date_input'
  storeTarget: 'userDob' | 'partnerDob'
  headline: string
  subtext?: string
  required: boolean
}

export interface TimeInputStep {
  stepNumber: number
  id: string
  type: 'time_input'
  storeTarget: 'userTime' | 'partnerTime'
  headline: string
  subtext?: string
  skipLabel: string
}

export interface CityInputStep {
  stepNumber: number
  id: string
  type: 'city_input'
  storeTarget: 'userCity' | 'partnerCity'
  headline: string
  subtext?: string
  skipLabel?: string
  required: boolean
}

export interface TextInputStep {
  stepNumber: number
  id: string
  type: 'text_input'
  storeTarget: 'partnerName' | 'firstName' | 'email'
  headline: string
  subtext?: string
  placeholder: string
  maxLength?: number
  inputType: 'text' | 'email'
  required: boolean
  disclaimerText?: string
}

export interface RewardStep {
  stepNumber: number
  id: string
  type: 'reward'
  emoji: string
  headline: string
  body: string
}

export type QuizStep =
  | SingleSelectStep
  | DateInputStep
  | TimeInputStep
  | CityInputStep
  | TextInputStep
  | RewardStep

// ── Schema (30 steps) ────────────────────────────────────────────────────────

export const QUIZ_SCHEMA: QuizStep[] = [
  // ── Step 1 — Q1 ────────────────────────────────────────────────────────────
  {
    stepNumber: 1,
    id: 'q1_intent',
    type: 'single_select',
    storeKey: 'q1_intent',
    headline: "Let's start here — what brought you here today?",
    options: [
      { id: 'specific_person', label: 'A specific person I want to understand' },
      { id: 'new_curiosity',   label: "A new connection I'm curious about" },
      { id: 'pattern',         label: 'A pattern I keep noticing in my relationships' },
      { id: 'exploring',       label: "I'm just exploring" },
    ],
  },

  // ── Step 2 — Q2 ────────────────────────────────────────────────────────────
  {
    stepNumber: 2,
    id: 'q2_feeling',
    type: 'single_select',
    storeKey: 'q2_feeling',
    headline: 'When you think about this person, what\'s the first feeling that comes up?',
    options: [
      { id: 'curiosity', label: 'Curiosity',                 emoji: '💭' },
      { id: 'hope',      label: 'Hope',                      emoji: '✨' },
      { id: 'confusion', label: 'Confusion',                 emoji: '🌫' },
      { id: 'longing',   label: 'Longing',                   emoji: '💫' },
      { id: 'unnamed',   label: "Something I can't quite name" },
    ],
  },

  // ── Step 3 — Q3 ────────────────────────────────────────────────────────────
  {
    stepNumber: 3,
    id: 'q3_duration',
    type: 'single_select',
    storeKey: 'q3_duration',
    headline: 'How long have they been on your mind?',
    options: [
      { id: 'recent', label: 'Just recently' },
      { id: 'weeks',  label: 'A few weeks' },
      { id: 'months', label: 'Months' },
      { id: 'long',   label: "Longer than I'll admit" },
    ],
  },

  // ── Step 4 — Q4 ────────────────────────────────────────────────────────────
  {
    stepNumber: 4,
    id: 'q4_approach',
    type: 'single_select',
    storeKey: 'q4_approach',
    headline: 'How do you usually show up when you fall for someone?',
    options: [
      { id: 'lead_feelings', label: 'I lead with my feelings' },
      { id: 'observe_first', label: 'I observe first, then open up' },
      { id: 'match_energy',  label: 'I match their energy' },
      { id: 'take_time',     label: "I'm careful — I take my time" },
    ],
  },

  // ── Step 5 — Q5 ────────────────────────────────────────────────────────────
  {
    stepNumber: 5,
    id: 'q5_communication',
    type: 'single_select',
    storeKey: 'q5_communication',
    headline: 'When something matters to you in a relationship, you usually:',
    options: [
      { id: 'direct',              label: 'Say it directly' },
      { id: 'show_through_action', label: 'Show it through what I do' },
      { id: 'wait_to_notice',      label: 'Wait for them to notice' },
      { id: 'write_first',         label: 'Write it before I speak it' },
    ],
  },

  // ── Step 6 — Q6 ────────────────────────────────────────────────────────────
  {
    stepNumber: 6,
    id: 'q6_closeness',
    type: 'single_select',
    storeKey: 'q6_closeness',
    headline: 'How do you like to feel close to someone?',
    options: [
      { id: 'crave',        label: 'I want a lot of closeness' },
      { id: 'need_space',   label: 'I need space to recharge' },
      { id: 'on_my_terms',  label: 'I like closeness on my own terms' },
      { id: 'figuring_out', label: "I'm still figuring this out" },
    ],
  },

  // ── Step 7 — Q7 ────────────────────────────────────────────────────────────
  {
    stepNumber: 7,
    id: 'q7_conflict',
    type: 'single_select',
    storeKey: 'q7_conflict',
    headline: "When there's tension in a relationship, what's your first instinct?",
    options: [
      { id: 'head_on',       label: 'Address it head-on' },
      { id: 'give_air',      label: 'Give it some air' },
      { id: 'middle_ground', label: 'Find the middle ground' },
      { id: 'wait_pass',     label: 'Wait and see if it passes' },
    ],
  },

  // ── Step 8 — Q8 ────────────────────────────────────────────────────────────
  {
    stepNumber: 8,
    id: 'q8_intimacy',
    type: 'single_select',
    storeKey: 'q8_intimacy',
    headline: 'Which feels more true for you?',
    options: [
      { id: 'known',      label: 'I want to be deeply known' },
      { id: 'understood', label: 'I want to be deeply understood' },
      { id: 'both',       label: 'Both, equally' },
      { id: 'neither',    label: 'Neither, mostly' },
    ],
  },

  // ── Step 9 — Q9 ────────────────────────────────────────────────────────────
  {
    stepNumber: 9,
    id: 'q9_value',
    type: 'single_select',
    storeKey: 'q9_value',
    headline: "In a connection that's working, what matters most to you?",
    options: [
      { id: 'trust',         label: 'Trust' },
      { id: 'excitement',    label: 'Excitement' },
      { id: 'steadiness',    label: 'Steadiness' },
      { id: 'mutual_growth', label: 'Mutual growth' },
      { id: 'being_seen',    label: 'Being seen' },
    ],
  },

  // ── Step 10 — REWARD SCREEN 1 ───────────────────────────────────────────────
  {
    stepNumber: 10,
    id: 'reward_1',
    type: 'reward',
    emoji: '✨',
    headline: "You're showing us something most people never name out loud.",
    body: "Most people don't notice the way they show up in connection. You just told us yours.",
  },

  // ── Step 11 — Q10 ──────────────────────────────────────────────────────────
  {
    stepNumber: 11,
    id: 'partnerName',
    type: 'text_input',
    storeTarget: 'partnerName',
    headline: 'What name should we use for them?',
    subtext: 'We only ask for a first name or initial — never a full name. This is your reading, not theirs.',
    placeholder: 'First name or initial',
    maxLength: 50,
    inputType: 'text',
    required: true,
  },

  // ── Step 12 — Q11 ──────────────────────────────────────────────────────────
  {
    stepNumber: 12,
    id: 'partnerDob',
    type: 'date_input',
    storeTarget: 'partnerDob',
    headline: "What's their date of birth?",
    subtext: 'We use this only to calculate astrological positions. Never stored under their name.',
    required: true,
  },

  // ── Step 13 — Q12 ──────────────────────────────────────────────────────────
  {
    stepNumber: 13,
    id: 'partnerTime',
    type: 'time_input',
    storeTarget: 'partnerTime',
    headline: 'Do you know their time of birth?',
    subtext: "Optional. We'll use noon if you skip — slightly less precise, but the reading still works.",
    skipLabel: "I don't know",
  },

  // ── Step 14 — Q13 ──────────────────────────────────────────────────────────
  {
    stepNumber: 14,
    id: 'partnerCity',
    type: 'city_input',
    storeTarget: 'partnerCity',
    headline: 'Where were they born?',
    subtext: 'This helps us calculate their chart positions accurately. Optional.',
    skipLabel: 'Skip',
    required: false,
  },

  // ── Step 15 — Q14 ──────────────────────────────────────────────────────────
  {
    stepNumber: 15,
    id: 'q14_descriptor',
    type: 'single_select',
    storeKey: 'q14_descriptor',
    headline: 'Describe the connection in one word.',
    options: [
      { id: 'magnetic',    label: 'Magnetic' },
      { id: 'confusing',   label: 'Confusing' },
      { id: 'intense',     label: 'Intense' },
      { id: 'easy',        label: 'Easy' },
      { id: 'healing',     label: 'Healing' },
      { id: 'challenging', label: 'Challenging' },
      { id: 'distant',     label: 'Distant' },
      { id: 'activating',  label: 'Activating' },
    ],
  },

  // ── Step 16 — Q15 ──────────────────────────────────────────────────────────
  {
    stepNumber: 16,
    id: 'q15_chapter',
    type: 'single_select',
    storeKey: 'q15_chapter',
    headline: 'Which chapter of this connection are you in?',
    options: [
      { id: 'new_unfolding',     label: 'New and unfolding' },
      { id: 'first_test',        label: 'In its first real test' },
      { id: 'long_steady',       label: 'In a long, steady season' },
      { id: 'confusing_between', label: 'In a confusing in-between' },
      { id: 'ending_shifting',   label: 'Ending or shifting' },
    ],
  },

  // ── Step 17 — Q16 ──────────────────────────────────────────────────────────
  {
    stepNumber: 17,
    id: 'q16_season',
    type: 'single_select',
    storeKey: 'q16_season',
    headline: 'If this connection were a season, which one is it right now?',
    options: [
      { id: 'spring', label: 'Spring', emoji: '🌱' },
      { id: 'summer', label: 'Summer', emoji: '☀️' },
      { id: 'autumn', label: 'Autumn', emoji: '🍂' },
      { id: 'winter', label: 'Winter', emoji: '❄️' },
    ],
  },

  // ── Step 18 — Q17 ──────────────────────────────────────────────────────────
  {
    stepNumber: 18,
    id: 'q17_pattern',
    type: 'single_select',
    storeKey: 'q17_pattern',
    headline: 'What pattern keeps showing up?',
    options: [
      { id: 'close_pull_back', label: 'We come close, then pull back' },
      { id: 'fast_slow',       label: 'We move fast, then slow' },
      { id: 'misunderstand',   label: 'We misunderstand each other often' },
      { id: 'sync_stuck',      label: "We're in sync but stuck" },
      { id: 'no_pattern',      label: "There's no clear pattern yet" },
    ],
  },

  // ── Step 19 — Q18 ──────────────────────────────────────────────────────────
  {
    stepNumber: 19,
    id: 'q18_trust_texture',
    type: 'single_select',
    storeKey: 'q18_trust_texture',
    headline: "What's the texture of trust between you?",
    options: [
      { id: 'stone', label: 'Stone — solid, weathered',        emoji: '🪨' },
      { id: 'water', label: "Water — fluid, finding its level", emoji: '💧' },
      { id: 'glass', label: 'Glass — clear but fragile',        emoji: '🪞' },
      { id: 'silk',  label: 'Silk — soft, present',             emoji: '🕊' },
    ],
  },

  // ── Step 20 — Q19 ──────────────────────────────────────────────────────────
  {
    stepNumber: 20,
    id: 'q19_curiosity',
    type: 'single_select',
    storeKey: 'q19_curiosity',
    headline: 'If you could understand one thing about this connection, what would it be?',
    options: [
      { id: 'why_feels',      label: 'Why it feels the way it does' },
      { id: 'what_become',    label: 'What it could become' },
      { id: 'whether_invest', label: 'Whether to keep investing' },
      { id: 'not_seeing',     label: "What I'm not seeing" },
    ],
  },

  // ── Step 21 — REWARD SCREEN 2 ───────────────────────────────────────────────
  {
    stepNumber: 21,
    id: 'reward_2',
    type: 'reward',
    emoji: '🌙',
    headline: "We're starting to see the shape of this connection.",
    body: "Most readings can't go this deep. Yours is going to.",
  },

  // ── Step 22 — Q20 ──────────────────────────────────────────────────────────
  {
    stepNumber: 22,
    id: 'userDob',
    type: 'date_input',
    storeTarget: 'userDob',
    headline: 'Your date of birth?',
    subtext: 'Used to calculate your chart positions. We never share birth data.',
    required: true,
  },

  // ── Step 23 — Q21 ──────────────────────────────────────────────────────────
  {
    stepNumber: 23,
    id: 'userTime',
    type: 'time_input',
    storeTarget: 'userTime',
    headline: 'Do you know your time of birth?',
    subtext: "Optional. We'll use noon if you skip.",
    skipLabel: "I don't know",
  },

  // ── Step 24 — Q22 ──────────────────────────────────────────────────────────
  {
    stepNumber: 24,
    id: 'userCity',
    type: 'city_input',
    storeTarget: 'userCity',
    headline: 'Where were you born?',
    subtext: "This sharpens your chart's accuracy.",
    required: true,
  },

  // ── Step 25 — REWARD SCREEN 3 ───────────────────────────────────────────────
  {
    stepNumber: 25,
    id: 'reward_3',
    type: 'reward',
    emoji: '✨',
    headline: "Now we're building a reading that's specifically yours.",
    body: "Both charts. The texture you described. The pattern you noticed. All of it.",
  },

  // ── Step 26 — Q23 ──────────────────────────────────────────────────────────
  {
    stepNumber: 26,
    id: 'q23_time_of_day',
    type: 'single_select',
    storeKey: 'q23_time_of_day',
    headline: 'What time of day does this connection feel most like?',
    options: [
      { id: 'dawn',  label: 'Dawn — something just beginning', emoji: '🌅' },
      { id: 'noon',  label: 'Noon — clear, present, visible',  emoji: '☀️' },
      { id: 'dusk',  label: 'Dusk — warm, ending, golden',     emoji: '🌆' },
      { id: 'night', label: 'Night — quiet, hidden, deep',     emoji: '🌙' },
    ],
  },

  // ── Step 27 — Q24 ──────────────────────────────────────────────────────────
  {
    stepNumber: 27,
    id: 'q24_helpfulness',
    type: 'single_select',
    storeKey: 'q24_helpfulness',
    headline: 'What would help you most right now?',
    options: [
      { id: 'clarity',      label: 'Clarity about this connection' },
      { id: 'self_insight', label: 'Insight about myself in it' },
      { id: 'possibility',  label: "A sense of what's possible" },
      { id: 'reflection',   label: 'Just to be reflected back' },
    ],
  },

  // ── Step 28 — Q25 ──────────────────────────────────────────────────────────
  {
    stepNumber: 28,
    id: 'q25_agency',
    type: 'single_select',
    storeKey: 'q25_agency',
    headline: 'Which feels more true right now?',
    options: [
      { id: 'happen_to_me', label: 'Things happen to me' },
      { id: 'i_make',       label: 'I make things happen' },
      { id: 'through_me',   label: 'Things happen through me' },
      { id: 'depends',      label: 'Depends on the day' },
    ],
  },

  // ── Step 29 — Q26 ──────────────────────────────────────────────────────────
  {
    stepNumber: 29,
    id: 'firstName',
    type: 'text_input',
    storeTarget: 'firstName',
    headline: 'What name should we put on your reading?',
    placeholder: 'Your first name',
    maxLength: 50,
    inputType: 'text',
    required: true,
  },

  // ── Step 30 — Q27 ──────────────────────────────────────────────────────────
  {
    stepNumber: 30,
    id: 'email',
    type: 'text_input',
    storeTarget: 'email',
    headline: 'Where should we send your reading?',
    placeholder: 'you@example.com',
    inputType: 'email',
    required: true,
    disclaimerText: 'By continuing, you agree to receive your reading and occasional astrology insights from OMENORA. You can unsubscribe anytime. We never share your data. This reading is for reflection and entertainment — it is not professional advice.',
  },
]
