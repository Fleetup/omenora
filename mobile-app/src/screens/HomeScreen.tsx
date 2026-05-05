import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { HomeScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CTAButton, EditorialRule, ShortRule, LabelCaps, AnnotationText } from '../components/ui';

const { width: SW } = Dimensions.get('window');
const displaySize = SW < 375 ? 56 : SW < 420 ? 68 : 76;

// ── Animated orbital brand mark ───────────────────────────────────────────────
const AnimatedOrbitalMark: React.FC = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 18000, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={orbital.container}>
      <Animated.View style={[orbital.outer, { transform: [{ rotate: spin }] }]}>
        <View style={orbital.planet} />
      </Animated.View>
      <View style={orbital.inner} />
      <View style={orbital.center} />
    </View>
  );
};

const orbital = StyleSheet.create({
  container: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  outer:     { position: 'absolute', width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', justifyContent: 'center', alignItems: 'center' },
  planet:    { position: 'absolute', top: -2.5, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(201,168,76,0.85)', shadowColor: 'rgba(201,168,76,1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 5 },
  inner:     { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(140,110,255,0.18)' },
  center:    { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(200,180,255,0.85)', shadowColor: 'rgba(180,150,255,1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 7 },
});

// ── Trust strip items ─────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { num: '[01]', label: 'No subscription' },
  { num: '[02]', label: 'No account required' },
  { num: '[03]', label: 'Results in 60 seconds' },
  { num: '[04]', label: 'Full report optional' },
];

// ── Traditions ────────────────────────────────────────────────────────────────
const TRADITIONS = [
  { num: '01', name: 'Western Astrology' },
  { num: '02', name: 'Vedic' },
  { num: '03', name: 'BaZi' },
  { num: '04', name: 'Tarot' },
  { num: '05', name: 'Mayan' },
  { num: '06', name: 'Chinese' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <View style={styles.hero}>

          {/* Issue label */}
          <LabelCaps style={styles.issueLabel}>
            № 001 · Six Traditions · Swiss Ephemeris
          </LabelCaps>

          {/* Orbital mark */}
          <AnimatedOrbitalMark />

          {/* Wordmark: "Omen" italic + "ora" upright */}
          <View style={styles.wordmarkRow}>
            <Text style={[styles.wordmarkItalic, { fontSize: displaySize }]}>Omen</Text>
            <Text style={[styles.wordmarkUpright, { fontSize: displaySize }]}>ora</Text>
          </View>

          {/* Short decorative rule */}
          <ShortRule style={styles.shortRule} />

          {/* Pull quote */}
          <Text style={styles.pullQuote}>
            Six traditions. One reading.
          </Text>
          <Text style={styles.heroBody}>
            Built from your exact planetary positions at the minute you were born.
          </Text>

          {/* CTA buttons */}
          <View style={styles.ctaGroup}>
            <CTAButton
              label="Begin the reading"
              onPress={() => navigation.navigate('Analysis')}
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
              style={styles.ctaOutline}
            />
          </View>

          {/* Social proof */}
          <View style={styles.socialRow}>
            <Text style={styles.stars}>★★★★★</Text>
            <AnnotationText>4.9 · 47,823 readings</AnnotationText>
          </View>

        </View>

        {/* ── Trust strip ─────────────────────────────────────────────────── */}
        <View style={styles.trustStrip}>
          <EditorialRule style={styles.ruleNoMargin} />
          <View style={styles.trustGrid}>
            {TRUST_ITEMS.map((item) => (
              <View key={item.num} style={styles.trustItem}>
                <AnnotationText style={styles.trustNum}>{item.num}</AnnotationText>
                <Text style={styles.trustLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <EditorialRule style={styles.ruleNoMargin} />
        </View>

        {/* ── Six traditions ──────────────────────────────────────────────── */}
        <View style={styles.traditions}>
          <LabelCaps style={styles.traditionsEyebrow}>Six traditions. One chart.</LabelCaps>
          <Text style={styles.traditionsHeadline}>
            The most complete{'\n'}natal reading available.
          </Text>
          <ShortRule style={styles.shortRuleSection} />
          <View style={styles.traditionsGrid}>
            {TRADITIONS.map((t) => (
              <View key={t.num} style={styles.traditionItem}>
                <AnnotationText style={styles.traditionNum}>{t.num}</AnnotationText>
                <Text style={styles.traditionName}>{t.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <View style={styles.finalCta}>
          <EditorialRule style={styles.ruleNoMargin} />
          <View style={styles.finalCtaInner}>
            <Text style={styles.finalCtaHeadline}>Your chart is waiting.</Text>
            <CTAButton
              label="Begin the reading"
              onPress={() => navigation.navigate('Analysis')}
              variant="solid"
              arrow
            />
          </View>
          <EditorialRule style={styles.ruleNoMargin} />
        </View>

        {/* ── Legal footer ────────────────────────────────────────────────── */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <AnnotationText>Privacy</AnnotationText>
          </TouchableOpacity>
          <AnnotationText style={styles.legalDot}>·</AnnotationText>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <AnnotationText>Terms</AnnotationText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background.main },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    alignItems:       'center',
    paddingHorizontal: 28,
    paddingTop:        56,
    paddingBottom:     32,
  },

  issueLabel: {
    marginBottom: 28,
  },

  wordmarkRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    marginTop:     8,
  },

  wordmarkItalic: {
    fontFamily:    fonts.frauncesItalic,
    fontWeight:    '300',
    letterSpacing: -1.5,
    color:         'rgba(255, 255, 255, 0.93)',
  },

  wordmarkUpright: {
    fontFamily:    fonts.fraunces,
    fontWeight:    '300',
    letterSpacing: -1.5,
    color:         'rgba(255, 255, 255, 0.93)',
  },

  shortRule: {
    marginTop:    24,
    marginBottom: 24,
  },

  pullQuote: {
    fontFamily:  fonts.cormorantItalic,
    fontSize:    22,
    fontWeight:  '300',
    color:       'rgba(255, 255, 255, 0.72)',
    textAlign:   'center',
    lineHeight:  30,
    marginBottom: 10,
  },

  heroBody: {
    fontFamily:    fonts.cormorant,
    fontSize:      16,
    fontWeight:    '300',
    color:         'rgba(255, 255, 255, 0.42)',
    textAlign:     'center',
    lineHeight:    26,
    maxWidth:      300,
  },

  ctaGroup: {
    width:      '100%',
    marginTop:  32,
    gap:        10,
  },

  ctaOutline: {
    marginTop: 0,
  },

  socialRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginTop:     20,
  },

  stars: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    color:         'rgba(201, 168, 76, 0.6)',
    letterSpacing: 1,
  },

  // ── Trust strip ───────────────────────────────────────────────────────────
  trustStrip: {
    paddingHorizontal: 28,
    marginTop:         8,
  },

  ruleNoMargin: {
    marginVertical: 0,
  },

  trustGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    paddingVertical: 20,
    gap:            0,
  },

  trustItem: {
    width:         '50%',
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    paddingVertical: 10,
  },

  trustNum: {
    color: 'rgba(201, 168, 76, 0.45)',
  },

  trustLabel: {
    fontFamily: fonts.hanken,
    fontSize:   13,
    color:      'rgba(255, 255, 255, 0.55)',
  },

  // ── Six traditions ────────────────────────────────────────────────────────
  traditions: {
    paddingHorizontal: 28,
    paddingTop:        40,
    paddingBottom:     16,
  },

  traditionsEyebrow: {
    marginBottom: 16,
  },

  traditionsHeadline: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      34,
    fontWeight:    '300',
    letterSpacing: -0.5,
    color:         'rgba(255, 255, 255, 0.88)',
    lineHeight:    42,
  },

  shortRuleSection: {
    marginTop:    20,
    marginBottom: 28,
  },

  traditionsGrid: {
    gap: 0,
  },

  traditionItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },

  traditionNum: {
    minWidth: 28,
    color:    'rgba(201, 168, 76, 0.45)',
  },

  traditionName: {
    fontFamily: fonts.cormorant,
    fontSize:   18,
    fontWeight: '400',
    color:      'rgba(255, 255, 255, 0.65)',
  },

  // ── Final CTA ─────────────────────────────────────────────────────────────
  finalCta: {
    paddingHorizontal: 28,
    paddingTop:        40,
  },

  finalCtaInner: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 28,
    gap:            20,
    flexWrap:       'wrap',
  },

  finalCtaHeadline: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      30,
    fontWeight:    '300',
    letterSpacing: -0.5,
    color:         'rgba(255, 255, 255, 0.88)',
    flex:          1,
    minWidth:      160,
  },

  // ── Legal ─────────────────────────────────────────────────────────────────
  legalLinks: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     24,
    paddingBottom:  16,
    gap:            0,
  },

  legalDot: {
    marginHorizontal: 10,
  },
});
