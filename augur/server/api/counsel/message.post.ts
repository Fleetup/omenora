import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { withAiRetry } from '~~/server/utils/ai-retry'

// ── Request schema ────────────────────────────────────────────────────────────

const ChartContextSchema = z.object({
  firstName:      z.string().min(1).max(50),
  archetype:      z.string().min(1).max(30),
  element:        z.string().min(1).max(20),
  lifePathNumber: z.number().int().min(1).max(9),
  sunSign:        z.string().nullable().default(null),
  moonSign:       z.string().nullable().default(null),
  risingSign:     z.string().nullable().default(null),
  powerTraits:    z.array(z.string().min(1)).max(7),
  tradition:      z.string().min(1).max(50),
})

const ConversationTurnSchema = z.object({
  role:    z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const CounselMessageRequestSchema = z.object({
  message:              z.string().min(1).max(4000),
  conversation_history: z.array(ConversationTurnSchema).max(50),
  chart_context:        ChartContextSchema,
})

/**
 * POST /api/counsel/message
 *
 * Multi-turn Counsel chat. Validates premium entitlement + daily cap (30/day).
 * Usage is incremented only on successful LLM generation — failed attempts do
 * not count against the cap.
 *
 * Request shape:  { message, conversation_history, chart_context }
 * Response shape: { success, response, usage: { count, cap, period, resets_at } }
 */
export default defineEventHandler(async (event) => {
  const ctx = await requirePremiumWithUsage(event, 'counsel')

  const config = useRuntimeConfig()

  const rawBody    = await readBody(event)
  const bodyResult = CounselMessageRequestSchema.safeParse(rawBody)
  if (!bodyResult.success) {
    throw createError({
      statusCode: 400,
      message:    bodyResult.error.issues.map((i) => i.message).join(', '),
    })
  }

  const { message, conversation_history, chart_context } = bodyResult.data
  const {
    firstName, archetype, element, lifePathNumber,
    sunSign, moonSign, risingSign, powerTraits, tradition,
  } = chart_context

  // ── System prompt (locked verbatim per Phase 5 spec) ─────────────────────
  const systemPrompt = `You are Counsel, an AI conversation partner from OMENORA, speaking with ${firstName}.

You know their chart deeply:
- Archetype: ${archetype}
- Element: ${element}
- Life path: ${lifePathNumber}
- Sun: ${sunSign ?? 'unknown'}, Moon: ${moonSign ?? 'unknown'}, Rising: ${risingSign ?? 'unknown'}
- Power traits: ${powerTraits.join(', ')}
- Tradition: ${tradition}

Your role:
- Help them sit with patterns, questions, and decisions
- Reference their chart when it's genuinely illuminating, not on every turn
- Be warm but direct. Honest, not flattering. B2 English, short sentences.
- Treat them as someone in mid-thought, not waiting for instructions

You must not:
- Provide medical, psychiatric, legal, or financial advice
- Predict specific dated events ("you will meet someone in March")
- Tell them what to do; ask what they want to be true
- Use AI-disclaimer phrasing or refer to yourself as a language model

If they signal crisis (suicidal ideation, self-harm, immediate danger), do not attempt counsel. Respond with concern, name what you're hearing, and ask if they'd like help finding crisis resources. The mobile app surfaces 988 and Crisis Text Line via a separate screen.

Length: most responses 100-300 words. Match their depth — short turns get short replies, deep questions get longer ones.`

  // ── Build full message chain: prior history + new user turn ──────────────
  const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...conversation_history,
    { role: 'user', content: message },
  ]

  const client = new Anthropic({ apiKey: config.anthropicApiKey as string })

  const aiResponse = await withAiRetry('counsel-message', () =>
    client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1000,
      system:     systemPrompt,
      messages:   conversationMessages,
    })
  )

  const firstContent = aiResponse.content[0]
  const assistantText = firstContent?.type === 'text' ? firstContent.text : ''

  if (!assistantText) {
    console.error('[counsel-message] Empty text response from Claude', {
      endpoint:  'counsel-message',
      timestamp: new Date().toISOString(),
      firstName,
      archetype,
    })
    throw createError({ statusCode: 500, message: 'Failed to generate counsel response' })
  }

  await incrementUsage(ctx.userId, ctx.feature, ctx.period)

  return {
    success:  true,
    response: assistantText,
    usage:    { count: ctx.count + 1, cap: ctx.cap, period: ctx.period, resets_at: ctx.resetsAt },
  }
})
