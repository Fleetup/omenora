import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native'
import { ChatBubble, Header } from '../../components/organisms'
import { ScreenWrapper } from '../../components/templates'
import { Text, Button, TextInput } from '../../components/atoms'
import { useProfileStore } from '../../stores/profileStore'
import { usePurchases } from '../../context/usePurchases'
import { CounselDisclosureModal } from './CounselDisclosureModal'
import api from '../../api/endpoints'
import { detectCrisisKeywords } from '../../utils/crisis'
import { timeUntil } from '../../utils/time'
import { space, layout, tokens } from '../../design/tokens'
import type { CounselChatScreenProps } from '../../navigation/types'

// ── Local types ───────────────────────────────────────────────────────────────

interface ChatMessage {
  id:        string
  role:      'user' | 'assistant' | 'system'
  content:   string
  isCrisis?: boolean
}

interface UsageInfo {
  count:     number
  cap:       number
  period:    string
  resets_at: string
}

// ── Thinking bubble — self-contained opacity pulse ────────────────────────────

function ThinkingBubble() {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 750, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [pulseAnim])

  return (
    <Animated.View style={[styles.thinkingWrapper, { opacity: pulseAnim }]}>
      <ChatBubble variant="counsel" message="Reflecting…" />
    </Animated.View>
  )
}

// ── Unique id helper ──────────────────────────────────────────────────────────

const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CounselChatScreen({ navigation, route }: CounselChatScreenProps) {
  const hasAcceptedCounselDisclosure = useProfileStore(
    (s) => s.hasAcceptedCounselDisclosure
  )
  const { isPremium } = usePurchases()

  const [disclosureVisible, setDisclosureVisible] = useState(
    !hasAcceptedCounselDisclosure || (route.params?.showDisclosure ?? false)
  )

  // Belt-and-suspenders: non-premium users should never reach this screen
  useEffect(() => {
    if (!isPremium) navigation.goBack()
  }, [isPremium, navigation])

  // ── Profile ────────────────────────────────────────────────────────────────
  const {
    firstName, archetype, lifePathNumber,
    sunSign, moonSign, risingSign, regionOverride, report,
  } = useProfileStore()

  const element     = report?.element     ?? ''
  const powerTraits = report?.powerTraits ?? []

  const profileReady = firstName.length > 0 && archetype !== null && report !== null

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [input,      setInput]      = useState('')
  const [isSending,  setIsSending]  = useState(false)
  const [usage,      setUsage]      = useState<UsageInfo | null>(null)

  const capReached = usage !== null && usage.count >= usage.cap
  const canSend    = input.trim().length > 0 && !isSending && !capReached && profileReady

  // ── Send handler ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isSending) return

    // 1. Crisis keyword detection — intercept before any API call
    if (detectCrisisKeywords(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id:       nextId('sys'),
          role:     'system' as const,
          content:  "If you're in crisis, please reach out for support. Tap below for resources.",
          isCrisis: true,
        },
      ])
      setInput('')
      return
    }

    // 2. Client-side daily cap check
    if (usage !== null && usage.count >= usage.cap) {
      setMessages((prev) => [
        ...prev,
        {
          id:      nextId('sys'),
          role:    'system' as const,
          content: `Daily limit reached. Resets in ${timeUntil(usage.resets_at)}.`,
        },
      ])
      setInput('')
      return
    }

    // 3. Capture prior history BEFORE appending the new user turn
    const priorHistory: Array<{ role: 'user' | 'assistant'; content: string }> =
      messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // 4. Optimistic user bubble
    setMessages((prev) => [
      ...prev,
      { id: nextId('user'), role: 'user' as const, content: text },
    ])
    setInput('')
    setIsSending(true)

    // 5. API call
    try {
      const result = await api.counselMessage({
        message:              text,
        conversation_history: priorHistory,
        chart_context: {
          firstName:      firstName,
          archetype:      archetype ?? '',
          element,
          lifePathNumber: lifePathNumber ?? 1,
          sunSign,
          moonSign,
          risingSign,
          powerTraits,
          tradition: regionOverride ?? 'western',
        },
      })
      setMessages((prev) => [
        ...prev,
        { id: nextId('asst'), role: 'assistant' as const, content: result.response },
      ])
      setUsage(result.usage)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : ''
      if (errMsg.includes('Too many requests')) {
        const resetsAt =
          usage?.resets_at ??
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        setMessages((prev) => [
          ...prev,
          {
            id:      nextId('sys'),
            role:    'system' as const,
            content: `Daily limit reached. Resets in ${timeUntil(resetsAt)}.`,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id:      nextId('sys'),
            role:    'system' as const,
            content: "Couldn't send message. Try again.",
          },
        ])
      }
    } finally {
      setIsSending(false)
    }
  }, [
    input, isSending, messages, usage,
    firstName, archetype, lifePathNumber,
    sunSign, moonSign, risingSign, regionOverride, report,
  ])

  // ── Render FlatList item (Steps D + E) ─────────────────────────────────────
  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => {
      if (item.role === 'system') {
        return (
          <View style={styles.systemItem}>
            <ChatBubble variant="system" message={item.content} />
            {item.isCrisis === true && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CrisisResources')}
                style={styles.crisisButton}
                accessibilityRole="button"
                accessibilityLabel="Open crisis resources"
              >
                <Text variant="caption" style={styles.crisisButtonText}>
                  Crisis resources →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      }
      return (
        <ChatBubble
          variant={item.role === 'user' ? 'user' : 'counsel'}
          message={item.content}
        />
      )
    },
    [navigation]
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper scroll={false} padded={false} background="base" keyboardBehavior="padding">
      <Header title="Counsel" onBack={() => navigation.goBack()} />

      {/* Usage counter — renders only when at least one message has been sent */}
      {usage !== null && usage.count > 0 && (
        <View style={styles.usageRow}>
          <Text variant="micro" color="tertiary">
            {usage.count} / {usage.cap} today
          </Text>
        </View>
      )}

      {/* Message list */}
      <FlatList<ChatMessage>
        data={[...messages].reverse()}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
      />

      {/* Thinking bubble — appears below the list while API call is in flight */}
      {isSending && <ThinkingBubble />}

      {/* Input footer */}
      <View style={styles.footer}>
        {!profileReady ? (
          <Text variant="caption" color="tertiary" style={styles.profilePrompt}>
            Complete your profile to use Counsel.
          </Text>
        ) : (
          <>
            <View style={styles.inputWrapper}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Counsel anything…"
                multiline
                maxLength={4000}
                editable={!isSending && !capReached}
                textAlignVertical="top"
                style={styles.chatInput}
              />
            </View>
            <Button
              variant="primary"
              label="Send"
              onPress={handleSend}
              disabled={!canSend}
            />
          </>
        )}
      </View>

      {/* ── Disclosure overlay — visible on first access or via MoreScreen ── */}
      <CounselDisclosureModal
        visible={disclosureVisible}
        onAccept={() => setDisclosureVisible(false)}
        onCrisisResources={() => navigation.navigate('CrisisResources')}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  usageRow: {
    alignItems:        'center',
    paddingVertical:   space['1'],
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.border.subtle,
  },
  messageList: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical:   space['4'],
  },
  thinkingWrapper: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom:     space['2'],
  },
  footer: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    paddingHorizontal: layout.screenPadding,
    paddingVertical:   space['3'],
    gap:               space['2'],
    borderTopWidth:    0.5,
    borderTopColor:    tokens.border.subtle,
  },
  inputWrapper: {
    flex: 1,
  },
  chatInput: {
    maxHeight: 120,
  },
  profilePrompt: {
    flex:      1,
    textAlign: 'center',
  },
  systemItem: {
    alignItems: 'center',
    marginVertical: space['1'],
  },
  crisisButton: {
    marginTop:     space['1'],
    paddingVertical: space['1'],
  },
  crisisButtonText: {
    color: tokens.accent.primary,
  },
})
