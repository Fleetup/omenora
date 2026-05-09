import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CTAButton, ShortRule, LabelCaps, AnnotationText, PhoenixLoader } from '../components/ui';

const { width: SW } = Dimensions.get('window');
const WORDMARK_SIZE = SW < 375 ? 52 : SW < 420 ? 64 : 72;
const LOGO_SIZE     = SW < 375 ? 52 : SW < 420 ? 60 : 68;

const TRUST_ITEMS = [
  { num: '[01]', label: 'No subscription' },
  { num: '[02]', label: 'No account required' },
  { num: '[03]', label: 'Results in 60 seconds' },
  { num: '[04]', label: 'Full report optional' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => (
  <SafeAreaView edges={['top']} style={styles.safe}>
    <View style={styles.root}>

      {/* ── Top strip ──────────────────────────────────────────────────── */}
      <View style={styles.topStrip}>
        <LabelCaps>№ 001 · Six Traditions</LabelCaps>
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <AnnotationText>Privacy</AnnotationText>
          </TouchableOpacity>
          <AnnotationText style={styles.dot}>·</AnnotationText>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <AnnotationText>Terms</AnnotationText>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero cluster — fills remaining vertical space ───────────────── */}
      <View style={styles.hero}>
        <PhoenixLoader size={LOGO_SIZE} />

        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmarkItalic,  { fontSize: WORDMARK_SIZE }]}>Omen</Text>
          <Text style={[styles.wordmarkUpright, { fontSize: WORDMARK_SIZE }]}>ora</Text>
        </View>

        <ShortRule style={styles.rule} />

        <Text style={styles.pullQuote}>Six traditions. One reading.</Text>
        <Text style={styles.heroBody}>
          Built from your exact planetary positions{'\n'}at the minute you were born.
        </Text>

        <View style={styles.socialRow}>
          <Text style={styles.stars}>★★★★★</Text>
          <AnnotationText>4.9 · 47,823 readings</AnnotationText>
        </View>
      </View>

      {/* ── CTAs ────────────────────────────────────────────────────────── */}
      <View style={styles.ctaBlock}>
        <CTAButton
          label="Begin the reading"
          // Phase 2 bridge: redirects to onboarding entry. HomeScreen itself is deleted in Phase 3.
          onPress={() => navigation.navigate('BirthInfo')}
          variant="solid"
          arrow
          full
        />
        <CTAButton
          label="Check compatibility"
          onPress={() => navigation.navigate('Compatibility')}
          variant="outline"
          arrow
          full
        />
      </View>

      {/* ── Trust grid ──────────────────────────────────────────────────── */}
      <View style={styles.trustGrid}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.num} style={styles.trustItem}>
            <AnnotationText style={styles.trustNum}>{item.num}</AnnotationText>
            <Text style={styles.trustLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors.bone,
  },
  root: {
    flex:              1,
    paddingHorizontal: 28,
    paddingTop:        8,
    paddingBottom:     20,
  },

  // ── Top strip ─────────────────────────────────────────────────────────────
  topStrip: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   0,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  dot: {
    marginHorizontal: 8,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    marginTop:     10,
  },
  wordmarkItalic: {
    fontFamily:    fonts.frauncesItalic,
    fontWeight:    '300',
    letterSpacing: -1.5,
    color:         colors.ink,
  },
  wordmarkUpright: {
    fontFamily:    fonts.fraunces,
    fontWeight:    '300',
    letterSpacing: -1.5,
    color:         colors.ink,
  },
  rule: {
    marginTop:    20,
    marginBottom: 20,
  },
  pullQuote: {
    fontFamily:  fonts.cormorantItalic,
    fontSize:    21,
    fontWeight:  '300',
    color:       colors.inkMid,
    textAlign:   'center',
    lineHeight:  28,
    marginBottom: 8,
  },
  heroBody: {
    fontFamily: fonts.cormorant,
    fontSize:   15,
    fontWeight: '300',
    color:      colors.inkFaint,
    textAlign:  'center',
    lineHeight: 24,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     18,
  },
  stars: {
    fontFamily:    fonts.hanken,
    fontSize:      10,
    color:         colors.goldDim,
    letterSpacing: 1,
  },

  // ── CTAs ──────────────────────────────────────────────────────────────────
  ctaBlock: {
    width: '100%',
    gap:   10,
  },

  // ── Trust grid ────────────────────────────────────────────────────────────
  trustGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    marginTop:     16,
  },
  trustItem: {
    width:          '50%',
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    paddingVertical: 6,
  },
  trustNum: {
    color: colors.goldDim,
  },
  trustLabel: {
    fontFamily: fonts.hanken,
    fontSize:   12,
    color:      colors.inkMid,
  },
});
