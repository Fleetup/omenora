import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../../components/atoms'
import { Card, LockedCard } from '../../components/organisms'
import { useProfileStore } from '../../stores/profileStore'
import { usePurchases } from '../../context/usePurchases'
import api from '../../api/endpoints'
import type { ReportStubResponse } from '../../api/endpoints'
import { tokens, space, layout } from '../../design/tokens'
import type { ReadingsScreenProps } from '../../navigation/types'

// ── Per-section async state ────────────────────────────────────────────────
interface SectionState {
  data:    ReportStubResponse | null
  loading: boolean
  error:   string | null
}

const INITIAL_SECTION: SectionState = { data: null, loading: false, error: null }

// ── Component ──────────────────────────────────────────────────────────────
export default function ReadingsScreen({ navigation: _navigation }: ReadingsScreenProps) {
  const { sunSign, moonSign, risingSign, archetype, report } = useProfileStore()
  const { isPremium, presentPaywall } = usePurchases()

  const [archetypeSection, setArchetypeSection] = useState<SectionState>(INITIAL_SECTION)
  const [natalSection,     setNatalSection]     = useState<SectionState>(INITIAL_SECTION)
  const [forecastSection,  setForecastSection]  = useState<SectionState>(INITIAL_SECTION)
  const abortRef = useRef<AbortController | null>(null)

  // ── Derived display values ─────────────────────────────────────────────
  const archetypeDisplayName = useMemo(() => {
    if (report?.archetypeName) return report.archetypeName
    if (archetype) return `The ${archetype.charAt(0).toUpperCase() + archetype.slice(1)}`
    return null
  }, [report, archetype])

  const identityTeaser = useMemo(
    () => report?.sections?.identity?.content ?? null,
    [report]
  )

  // ── Per-section fetch helpers ──────────────────────────────────────────
  const fetchArchetypeSection = useCallback(async (ctrl: AbortController) => {
    setArchetypeSection(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.getArchetypeReading()
      if (!ctrl.signal.aborted) setArchetypeSection({ data: res, loading: false, error: null })
    } catch (e: any) {
      if (!ctrl.signal.aborted) setArchetypeSection({ data: null, loading: false, error: e?.message ?? 'Failed to load' })
    }
  }, [])

  const fetchNatalSection = useCallback(async (ctrl: AbortController) => {
    setNatalSection(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.getNatalChart()
      if (!ctrl.signal.aborted) setNatalSection({ data: res, loading: false, error: null })
    } catch (e: any) {
      if (!ctrl.signal.aborted) setNatalSection({ data: null, loading: false, error: e?.message ?? 'Failed to load' })
    }
  }, [])

  const fetchForecastSection = useCallback(async (ctrl: AbortController) => {
    setForecastSection(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.getForecast()
      if (!ctrl.signal.aborted) setForecastSection({ data: res, loading: false, error: null })
    } catch (e: any) {
      if (!ctrl.signal.aborted) setForecastSection({ data: null, loading: false, error: e?.message ?? 'Failed to load' })
    }
  }, [])

  // Premium fetch: all 3 in parallel, single AbortController aborted on unmount
  useEffect(() => {
    if (!isPremium) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    Promise.allSettled([
      fetchArchetypeSection(ctrl),
      fetchNatalSection(ctrl),
      fetchForecastSection(ctrl),
    ])
    return () => ctrl.abort()
  }, [isPremium, fetchArchetypeSection, fetchNatalSection, fetchForecastSection])

  // ── Premium section body (loading → error → stub placeholder) ─────────
  const renderPremiumBody = (
    section: SectionState,
    retryCb: () => void,
  ): React.ReactElement => {
    if (section.loading) {
      return (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="small" color={tokens.accent.primary} />
        </View>
      )
    }
    if (section.error) {
      return (
        <Text variant="body" color="tertiary">
          {'Couldn\'t load reading. '}
          <Text variant="body" color="accent" onPress={retryCb}>Try again.</Text>
        </Text>
      )
    }
    // Currently all /api/reports/* endpoints return STUB responses.
    // When Phase 5 wires LLM content, check section.data?.note and render real prose here.
    return (
      <Text variant="body" color="secondary" style={styles.stubText}>
        Your full reading is being prepared. Real content lands in the next release.
      </Text>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Page header ─────────────────────────────────────────── */}
        <View style={styles.pageHeader}>
          <Text variant="display2" color="primary">Your Reading</Text>
          <Text variant="body" color="tertiary" style={styles.subtitle}>
            Personal to you
          </Text>
        </View>

        {/* ── 2. Big-Three Card ──────────────────────────────────────── */}
        <Card variant="premium" padding="default">
          <Text variant="micro" color="tertiary" style={styles.cardLabel}>Your Chart</Text>
          {[
            { glyph: '☉', label: 'Sun',    value: sunSign    },
            { glyph: '☽', label: 'Moon',   value: moonSign   },
            { glyph: '↑', label: 'Rising', value: risingSign },
          ].map(({ glyph, label, value }) => (
            <View key={label} style={styles.bigThreeRow}>
              <Text style={styles.glyph}>{glyph}</Text>
              <View style={styles.bigThreeText}>
                <Text variant="caption" color="tertiary">{label}</Text>
                <Text variant="heading2" color="primary">{value ?? '—'}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* ── 3. Archetype teaser ────────────────────────────────────── */}
        <Card variant="default" padding="default">
          {archetypeDisplayName != null ? (
            <>
              <Text variant="heading2" color="primary" style={styles.archetypeHeading}>
                {`You are ${archetypeDisplayName}`}
              </Text>
              <Text variant="body" color="secondary">
                {identityTeaser ?? 'Your archetype reading is being prepared\u2026'}
              </Text>
            </>
          ) : (
            <Text variant="body" color="secondary">
              Your reading is being prepared\u2026
            </Text>
          )}
        </Card>

        {/* ── 4. Full archetype reading — PREMIUM ────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            Full archetype reading
          </Text>
          {isPremium ? (
            <Card variant="default" padding="default">
              {renderPremiumBody(archetypeSection, () => {
                const ctrl = new AbortController()
                fetchArchetypeSection(ctrl)
              })}
            </Card>
          ) : (
            <LockedCard
              placement="feature_archetype"
              lockMessage="Unlock your full archetype reading"
              unlockCtaLabel="Unlock"
              onUnlockPress={async () => { await presentPaywall() }}
              preview={
                <Text variant="caption" color="tertiary">
                  {archetypeDisplayName
                    ? `The deeper psychological framework of ${archetypeDisplayName}`
                    : 'The deeper psychological framework of your archetype'}
                </Text>
              }
            >
              <Text variant="body" color="secondary" style={styles.stubText}>
                Your full archetype reading is being prepared.
              </Text>
            </LockedCard>
          )}
        </View>

        {/* ── 5. Full natal chart — PREMIUM ──────────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            Full natal chart
          </Text>
          {isPremium ? (
            <Card variant="default" padding="default">
              {renderPremiumBody(natalSection, () => {
                const ctrl = new AbortController()
                fetchNatalSection(ctrl)
              })}
            </Card>
          ) : (
            <LockedCard
              placement="feature_natal_chart"
              lockMessage="Unlock your complete natal chart"
              unlockCtaLabel="Unlock"
              onUnlockPress={async () => { await presentPaywall() }}
              preview={
                <Text variant="caption" color="tertiary">
                  All 10 planets, 12 houses, aspects, and dominant patterns
                </Text>
              }
            >
              <Text variant="body" color="secondary" style={styles.stubText}>
                Your natal chart is being prepared.
              </Text>
            </LockedCard>
          )}
        </View>

        {/* ── 6. 90-day forecast — PREMIUM ───────────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            90-day forecast
          </Text>
          {isPremium ? (
            <Card variant="default" padding="default">
              {renderPremiumBody(forecastSection, () => {
                const ctrl = new AbortController()
                fetchForecastSection(ctrl)
              })}
            </Card>
          ) : (
            <LockedCard
              placement="feature_forecast"
              lockMessage="Unlock your 90-day forecast"
              unlockCtaLabel="Unlock"
              onUnlockPress={async () => { await presentPaywall() }}
              preview={
                <Text variant="caption" color="tertiary">
                  What's coming, when, and how to meet it
                </Text>
              }
            >
              <Text variant="body" color="secondary" style={styles.stubText}>
                Your 90-day forecast is being prepared.
              </Text>
            </LockedCard>
          )}
        </View>

        {/*
         * TODO (Phase 5): Daily insight history
         * Depends on daily_user_insights table (not yet created).
         * Will show personalized daily insight streak and history.
         */}

        {/*
         * TODO (Phase 5): Transit timeline
         * Depends on transit calculation backend (not yet built).
         * Will show upcoming planetary transits affecting the user's chart.
         */}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: tokens.surface.base,
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['6'],
    paddingBottom:     space['10'],
    gap:               layout.cardGap,
  },
  pageHeader: {
    marginBottom: space['2'],
  },
  subtitle: {
    marginTop: space['1'],
  },
  cardLabel: {
    marginBottom: space['3'],
  },
  bigThreeRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             space['4'],
    paddingVertical: space['2'],
  },
  glyph: {
    fontSize:   22,
    lineHeight: 28,
    color:      tokens.text.accent,
    width:      28,
    textAlign:  'center',
  },
  bigThreeText: {
    flex: 1,
    gap:  space['0.5'],
  },
  archetypeHeading: {
    marginBottom: space['3'],
  },
  sectionHeading: {
    marginBottom: space['2'],
  },
  sectionLoader: {
    paddingVertical: space['4'],
    alignItems:      'center',
  },
  stubText: {
    fontStyle: 'italic',
  },
})
