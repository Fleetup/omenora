export const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond entirely in English.',
  es: 'Responde completamente en español. Usa un tono cálido, poético y personal. Habla directamente a la persona.',
  pt: 'Responda completamente em português brasileiro. Use tom caloroso, poético e pessoal. Fale diretamente com a pessoa.',
  fr: 'Réponds entièrement en français.',
  de: 'Antworte vollständig auf Deutsch.',
  it: 'Rispondi completamente in italiano.',
  ru: 'Отвечай полностью на русском языке.',
  hi: 'पूरी तरह से हिंदी में जवाब दें। गर्म, काव्यात्मक और व्यक्तिगत स्वर का उपयोग करें।',
  ko: '전체적으로 한국어로 답변해 주세요. 따뜻하고 시적이며 개인적인 어조를 사용하세요.',
  zh: '完全用简体中文回答。使用温暖、诗意和个人化的语气。',
}

export function getLanguageInstruction(language: string | null | undefined): string {
  return LANGUAGE_INSTRUCTIONS[language ?? ''] ?? LANGUAGE_INSTRUCTIONS['en'] ?? ''
}

export type SupportedLanguageCode = keyof typeof LANGUAGE_INSTRUCTIONS
