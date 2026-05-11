import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Moon, Briefcase, Heart, Sparkles, MessageCircle, BookOpen } from 'lucide-react-native'
import { Text } from '../../components/atoms'
import { Card, DailyCard, LockedCard } from '../../components/organisms'
import { ErrorState } from '../../components/templates/ErrorState'
import { ListItem } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { useAuth } from '../../context/useAuth'
import { usePurchases } from '../../context/usePurchases'
import api from '../../api/endpoints'
import type { GetDailyCacheResponse } from '../../api/endpoints'
import { tokens, space, layout } from '../../design/tokens'
import type { TodayScreenProps } from '../../navigation/types'

export default function TodayScreen({ navigation }: TodayScreenProps) {
  const { firstName, archetype, sunSign, languageOverride } = useProfileStore()
  const { displayName } = useAuth()
  const { isPremium, presentPaywall } = usePurchases()

  const [data, setData]           = useState<GetDailyCacheResponse | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const today = useMemo(() => new Date(), [])

  const greeting = useMemo(() => {
    const hour = today.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [today])

  // Use profileStore.firstName first (already in memory), then fall back to
  // displayName from auth context which covers provider metadata until the
  // server profile hydration completes after a re-authentication.
  const nameForGreeting = firstName || displayName
  const greetingLine = nameForGreeting ? `${greeting}, ${nameForGreeting}` : greeting

  const formattedDate = useMemo(() =>
    today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    [today]
  )

  const fetchDailyCache = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const dateStr = today.toISOString().split('T')[0]
      const response = await api.getDailyCache({
        date:     dateStr,
        language: languageOverride ?? 'en',
      })
      if (!controller.signal.aborted) {
        setData(response)
      }
    } catch (err: any) {
      if (controller.signal.aborted) return
      setError(err?.message ?? "Could not load today's reading")
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [languageOverride, today])

  useEffect(() => {
    fetchDailyCache()
    return () => { abortRef.current?.abort() }
  }, [fetchDailyCache])

  // ── Content selection ──────────────────────────────────────────────────────
  const archetypeContent = useMemo(() => {
    if (!data?.archetypes) return null
    const key = archetype?.toLowerCase() ?? ''
    if (data.archetypes[key]) return data.archetypes[key]
    const keys = Object.keys(data.archetypes)
    if (keys.length > 0) {
      console.warn(`[TodayScreen] archetype '${key}' not in cache — falling back to '${keys[0]}'`)
      return data.archetypes[keys[0]]
    }
    return null
  }, [data, archetype])

  const zodiacContent = useMemo(() => {
    if (!data?.zodiac) return null
    const key = sunSign?.toLowerCase() ?? ''
    return data.zodiac[key] ?? null
  }, [data, sunSign])

  // ── Paragraph split ────────────────────────────────────────────────────────
  const insightParagraphs = useMemo(
    () => (archetypeContent?.insight ?? '').split('\n\n'),
    [archetypeContent]
  )
  const insightP1     = insightParagraphs[0] ?? ''
  const insightDeeper = insightParagraphs.slice(1).join('\n\n')

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={tokens.accent.primary} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  // ── Error / missing content state ──────────────────────────────────────────
  if (error || !archetypeContent) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ErrorState
          heading="Couldn't load today"
          body={error ?? undefined}
          actionLabel="Try again"
          onActionPress={() => fetchDailyCache()}
        />
      </SafeAreaView>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDailyCache(true)}
            tintColor={tokens.accent.primary}
          />
        }
      >
        {/* ── 1. Greeting block ──────────────────────────────────────── */}
        <View style={styles.greeting}>
          <Text variant="display2" color="primary">{greetingLine}</Text>
          <Text variant="caption" color="tertiary" style={styles.dateLine}>
            {formattedDate}
          </Text>
          {archetypeContent.moon_phase.length > 0 && (
            <View style={styles.moonRow}>
              <Moon size={12} color={tokens.text.accent} strokeWidth={1.5} />
              <Text variant="caption" style={styles.moonText}>
                {archetypeContent.moon_phase}
              </Text>
            </View>
          )}
        </View>

        {/* ── 2. DailyCard — free, paragraph 1 only ─────────────────── */}
        <DailyCard
          title={archetypeContent.theme}
          date={today}
          body={insightP1}
          moonPhase={archetypeContent.moon_phase}
        />

        {/* ── 3. Reflection Card — free ──────────────────────────────── */}
        <Card variant="default" padding="default">
          <Text variant="micro" color="tertiary" style={styles.sectionLabel}>
            Reflection
          </Text>
          <Text variant="body" color="secondary" style={styles.reflectionText}>
            {archetypeContent.reflection}
          </Text>
        </Card>

        {/* ── 4. Planetary weather — free (only if zodiac available) ─── */}
        {zodiacContent != null && (
          <Card variant="default" padding="compact">
            <Text variant="micro" color="tertiary" style={styles.sectionLabel}>
              Today's cosmic stage
            </Text>
            <Text variant="body" color="secondary">
              {zodiacContent.planetary_weather}
            </Text>
          </Card>
        )}

        {/* ── 5. Premium-only CTAs ───────────────────────────────────── */}
        {isPremium && (
          <Card variant="default" padding="compact">
            <ListItem
              label="Ask Counsel about today"
              icon={MessageCircle}
              showChevron
              onPress={() => navigation.navigate('CounselTab')}
            />
            <ListItem
              label="What's coming next"
              icon={BookOpen}
              showChevron
              onPress={() => navigation.navigate('ReadingsTab')}
            />
          </Card>
        )}

        {/* ── 6. Deeper insight — PREMIUM ───────────────────────────── */}
        <LockedCard
          placement="feature_archetype_today"
          lockMessage="Unlock the full daily reading"
          unlockCtaLabel="Unlock"
          onUnlockPress={async () => { await presentPaywall() }}
          preview={
            <Text variant="caption" color="tertiary">Today's deeper insight…</Text>
          }
        >
          <Text variant="body" color="secondary">{insightDeeper}</Text>
        </LockedCard>

        {/* ── 7. Today's Dimensions — PREMIUM (only if zodiac) ──────── */}
        {zodiacContent != null && (
          <LockedCard
            placement="feature_dimensions_today"
            lockMessage="Unlock today's life dimensions"
            unlockCtaLabel="Unlock"
            onUnlockPress={async () => { await presentPaywall() }}
            preview={
              <Text variant="caption" color="tertiary">Career · Love · Wellbeing</Text>
            }
          >
            <View style={styles.dimensions}>
              <View style={styles.dimensionRow}>
                <Briefcase size={16} color={tokens.text.accent} strokeWidth={1.5} />
                <View style={styles.dimensionText}>
                  <Text variant="label" color="primary">Career</Text>
                  <Text variant="body" color="secondary">{zodiacContent.job}</Text>
                </View>
              </View>
              <View style={styles.dimensionRow}>
                <Heart size={16} color={tokens.text.accent} strokeWidth={1.5} />
                <View style={styles.dimensionText}>
                  <Text variant="label" color="primary">Love</Text>
                  <Text variant="body" color="secondary">{zodiacContent.love}</Text>
                </View>
              </View>
              <View style={styles.dimensionRow}>
                <Sparkles size={16} color={tokens.text.accent} strokeWidth={1.5} />
                <View style={styles.dimensionText}>
                  <Text variant="label" color="primary">Wellbeing</Text>
                  <Text variant="body" color="secondary">{zodiacContent.health}</Text>
                </View>
              </View>
            </View>
          </LockedCard>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: tokens.surface.base,
  },
  center: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['6'],
    paddingBottom:     space['10'],
    gap:               layout.cardGap,
  },
  greeting: {
    marginBottom: space['2'],
  },
  dateLine: {
    marginTop: space['1'],
  },
  moonRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           space['1'],
    marginTop:     space['2'],
  },
  moonText: {
    color: tokens.text.accent,
  },
  sectionLabel: {
    marginBottom: space['2'],
  },
  reflectionText: {
    fontStyle: 'italic',
  },
  dimensions: {
    gap: space['4'],
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           space['3'],
  },
  dimensionText: {
    flex: 1,
    gap:  space['1'],
  },
})
