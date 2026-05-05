import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { LabelCaps, ShortRule, AnnotationText } from '../components/ui';

// Screen-internal color constants
const COMPAT_BG     = 'rgba(201, 169, 97, 0.05)';
const COMPAT_BORDER = 'rgba(201, 169, 97, 0.18)';
const COMPAT_ICON   = 'rgba(201, 169, 97, 0.70)';
const CALENDAR_BG     = 'rgba(140, 110, 255, 0.05)';
const CALENDAR_BORDER = 'rgba(140, 110, 255, 0.18)';
const CALENDAR_ICON   = 'rgba(140, 110, 255, 0.65)';
const LOCK_COLOR    = colors.inkDim;

const FEATURES = [
  {
    key:         'compatibility',
    icon:        '◎',
    iconColor:   COMPAT_ICON,
    bg:          COMPAT_BG,
    border:      COMPAT_BORDER,
    eyebrow:     'Synastry Reading',
    title:       'Compatibility\nChart',
    description: 'Overlay two birth charts to reveal harmonic and tension points across all six traditions.',
    cta:         'Explore compatibility',
    screen:      'Compatibility' as const,
  },
  {
    key:         'calendar',
    icon:        '◈',
    iconColor:   CALENDAR_ICON,
    bg:          CALENDAR_BG,
    border:      CALENDAR_BORDER,
    eyebrow:     'Cosmic Calendar',
    title:       'Year\nForecast',
    description: 'See the astrological and numerological themes shaping each month of your year.',
    cta:         'Open forecast',
    screen:      'Calendar' as const,
  },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => (
  <SafeAreaView edges={['top']} style={styles.safe}>
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <LabelCaps>Explore</LabelCaps>
        <Text style={styles.heading}>
          Deepen your{'\n'}understanding.
        </Text>
        <ShortRule style={styles.rule} />
        <Text style={styles.sub}>
          Two premium readings built on the same six-tradition framework.
        </Text>
      </View>

      {/* ── Feature cards ──────────────────────────────────────────────── */}
      {FEATURES.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[styles.card, { backgroundColor: f.bg, borderColor: f.border }]}
          onPress={() => navigation.navigate(f.screen)}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.cardIcon, { color: f.iconColor }]}>{f.icon}</Text>
            <AnnotationText style={styles.cardEyebrow}>{f.eyebrow}</AnnotationText>
          </View>

          <Text style={styles.cardTitle}>{f.title}</Text>
          <Text style={styles.cardDesc}>{f.description}</Text>

          <View style={styles.cardFooter}>
            <Text style={[styles.cardCta, { color: f.iconColor }]}>{f.cta} →</Text>
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>Premium</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* ── Footer note ────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Premium features require a bundle or oracle purchase.
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Subscription')}>
          <Text style={styles.footerLink}>View plans →</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bone },
  scroll: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 48 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 32,
  },
  heading: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      34,
    fontWeight:    '300',
    letterSpacing: -0.5,
    color:         colors.inkHigh,
    lineHeight:    42,
    marginTop:     16,
  },
  rule: {
    marginTop:    20,
    marginBottom: 16,
  },
  sub: {
    fontFamily: fonts.cormorant,
    fontSize:   16,
    color:      colors.inkFaint,
    lineHeight: 24,
  },

  // ── Feature cards ─────────────────────────────────────────────────────────
  card: {
    borderWidth:   1,
    borderRadius:  10,
    padding:       24,
    marginBottom:  16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  16,
  },
  cardIcon: {
    fontFamily: fonts.hanken,
    fontSize:   20,
  },
  cardEyebrow: {
    color: colors.inkFaint,
  },
  cardTitle: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      30,
    fontWeight:    '300',
    letterSpacing: -0.5,
    color:         colors.inkHigh,
    lineHeight:    36,
    marginBottom:  14,
  },
  cardDesc: {
    fontFamily:  fonts.cormorant,
    fontSize:    16,
    color:       colors.inkFaint,
    lineHeight:  26,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  cardCta: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      12,
    letterSpacing: 0.4,
  },
  lockBadge: {
    borderWidth:     1,
    borderColor:     LOCK_COLOR,
    borderRadius:    3,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  lockText: {
    fontFamily:    fonts.hanken,
    fontSize:      9,
    color:         LOCK_COLOR,
    letterSpacing: 0.8,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingTop: 24,
    gap:        8,
  },
  footerText: {
    fontFamily: fonts.hanken,
    fontSize:   12,
    color:      colors.inkDim,
    lineHeight: 18,
  },
  footerLink: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      12,
    color:         colors.goldDim,
    letterSpacing: 0.3,
  },
});
