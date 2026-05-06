import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReadingScreenProps } from '../navigation/types';
import { useProfileStore } from '../stores/profileStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { LabelCaps, AnnotationText, ShortRule, CTAButton, PhoenixLoader } from '../components/ui';

// Screen-internal color constants
const CARD_BG_EMPTY    = colors.surface;
const CARD_BORDER_EMPTY = colors.inkGhost;
const ARCHETYPE_COLOR  = 'rgba(201, 169, 97, 0.88)';
const HINT_COLOR = 'rgba(140, 110, 255, 0.65)';

export const ReadingScreen: React.FC<ReadingScreenProps> = ({ navigation }) => {
  const { firstName, reportId } = useProfileStore();

  const hasStarted   = Boolean(firstName && !reportId);
  const isNew        = !firstName;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <LabelCaps>Your Reading</LabelCaps>
        </View>

        <Text style={styles.heading}>
          Begin your destiny analysis.
        </Text>
        <ShortRule style={styles.rule} />

        {/* ── State card ───────────────────────────────────────────────── */}
        {hasStarted && (
          <View style={[styles.card, { backgroundColor: CARD_BG_EMPTY, borderColor: CARD_BORDER_EMPTY }]}>
            <AnnotationText style={styles.cardEyebrow}>In Progress</AnnotationText>
            <Text style={styles.cardHeadline}>Continue your analysis.</Text>
            <Text style={styles.cardSub}>
              Pick up where you left off, {firstName}.
            </Text>
            <CTAButton
              label="Continue analysis"
              onPress={() => navigation.navigate('Analysis')}
              variant="outline"
              arrow
              full
              style={styles.cardCta}
            />
          </View>
        )}

        {isNew && (
          <View style={styles.emptyState}>
            <PhoenixLoader size={56} style={styles.emptyLogo} />
            <Text style={styles.emptyHeadline}>No reading yet.</Text>
            <Text style={styles.emptySub}>
              Your natal chart is built from six traditions using Swiss Ephemeris data.
              It takes about 60 seconds.
            </Text>
            <CTAButton
              label="Begin the reading"
              onPress={() => navigation.navigate('Analysis')}
              variant="solid"
              arrow
              full
              style={styles.emptyCta}
            />
          </View>
        )}

        {/* ── What's included ────────────────────────────────────────────── */}
        <View style={styles.includes}>
          <LabelCaps style={styles.includesLabel}>What's included</LabelCaps>
          {[
            'Archetype identity & element',
            'Power traits from 6 traditions',
            'Life path & purpose section',
            'Love & relationship forecast',
            'Cosmic gift & shadow side',
            'Daily affirmation',
          ].map((item) => (
            <View key={item} style={styles.includeRow}>
              <Text style={styles.includeDot}>◉</Text>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── Start fresh ──────────────────────────────────────────────── */}
        {hasStarted && (
          <TouchableOpacity
            style={styles.resetRow}
            onPress={() => navigation.navigate('Analysis')}
          >
            <Text style={styles.resetText}>Start a new reading →</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bone },
  scroll: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 48 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 16,
  },
  heading: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      34,
    fontWeight:    '300',
    letterSpacing: -0.5,
    color:         colors.inkHigh,
    lineHeight:    42,
  },
  rule: {
    marginTop:    20,
    marginBottom: 28,
  },

  // ── State card ────────────────────────────────────────────────────────────
  card: {
    borderWidth:  1,
    borderRadius: 8,
    padding:      24,
    marginBottom: 28,
  },
  cardEyebrow: {
    color:        ARCHETYPE_COLOR,
    marginBottom: 8,
  },
  cardEyebrowHint: {
    color:        HINT_COLOR,
    marginBottom: 8,
  },
  archetypeName: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      28,
    fontWeight:    '300',
    letterSpacing: -0.5,
    color:         colors.inkHigh,
    marginBottom:  6,
  },
  cardHeadline: {
    fontFamily:    fonts.cormorantItalic,
    fontSize:      22,
    fontWeight:    '300',
    color:         colors.inkMid,
    marginBottom:  10,
  },
  cardSub: {
    fontFamily: fonts.hanken,
    fontSize:   13,
    color:      colors.inkFaint,
    lineHeight: 20,
    marginBottom: 20,
  },
  cardCta: {
    marginTop: 0,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems:    'center',
    paddingTop:    8,
    paddingBottom: 28,
  },
  emptyLogo: {
    marginBottom: 20,
  },
  emptyHeadline: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      26,
    fontWeight:    '300',
    color:         colors.inkHigh,
    marginBottom:  12,
    textAlign:     'center',
  },
  emptySub: {
    fontFamily: fonts.cormorant,
    fontSize:   16,
    color:      colors.inkFaint,
    textAlign:  'center',
    lineHeight: 26,
    maxWidth:   280,
    marginBottom: 28,
  },
  emptyCta: {
    width: '100%',
  },

  // ── Includes ──────────────────────────────────────────────────────────────
  includes: {
    borderTopWidth: 1,
    borderTopColor: colors.inkGhost,
    paddingTop:     24,
    marginBottom:   8,
  },
  includesLabel: {
    marginBottom: 20,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkTrace,
  },
  includeDot: {
    fontFamily: fonts.hanken,
    fontSize:   10,
    color:      colors.goldDim,
  },
  includeText: {
    fontFamily: fonts.cormorant,
    fontSize:   17,
    color:      colors.inkMid,
  },

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetRow: {
    alignItems:  'center',
    paddingTop:  28,
  },
  resetText: {
    fontFamily: fonts.hanken,
    fontSize:   12,
    color:      colors.inkDim,
    letterSpacing: 0.3,
  },
});
