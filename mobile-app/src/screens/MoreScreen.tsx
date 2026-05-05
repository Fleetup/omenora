import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { LabelCaps, ShortRule, AnnotationText } from '../components/ui';

// Screen-internal color constants
const SUB_CARD_BG      = 'rgba(201, 169, 97, 0.05)';
const SUB_CARD_BORDER  = 'rgba(201, 169, 97, 0.18)';
const CHEVRON_COLOR    = colors.inkDim;
const DIVIDER_COLOR    = colors.inkGhost;
const BADGE_FREE_BG    = colors.inkTrace;
const BADGE_FREE_BORDER = colors.inkGhost;

type MenuItem = {
  label:  string;
  sub?:   string;
  onPress: () => void;
};

export const MoreScreen: React.FC<MoreScreenProps> = ({ navigation }) => {
  const { firstName, bundlePurchased, oraclePurchased } = useAnalysisStore();

  const planLabel =
    oraclePurchased  ? 'Oracle Plan'  :
    bundlePurchased  ? 'Bundle Plan'  :
                       'Free';

  const menuItems: MenuItem[] = [
    {
      label:   'Subscription Plans',
      sub:     'Upgrade to unlock all features',
      onPress: () => navigation.navigate('Subscription'),
    },
    {
      label:   'Privacy Policy',
      onPress: () => navigation.navigate('Privacy'),
    },
    {
      label:   'Terms of Use',
      onPress: () => navigation.navigate('Terms'),
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <LabelCaps>Account</LabelCaps>
          <Text style={styles.heading}>
            {firstName ? `Hello, ${firstName}.` : 'Your account.'}
          </Text>
          <ShortRule style={styles.rule} />
        </View>

        {/* ── Plan card ──────────────────────────────────────────────── */}
        <View style={[styles.planCard, { backgroundColor: SUB_CARD_BG, borderColor: SUB_CARD_BORDER }]}>
          <View style={styles.planRow}>
            <View>
              <AnnotationText style={styles.planEyebrow}>Current Plan</AnnotationText>
              <Text style={styles.planName}>{planLabel}</Text>
            </View>
            {planLabel === 'Free' && (
              <View style={[styles.freeBadge, { backgroundColor: BADGE_FREE_BG, borderColor: BADGE_FREE_BORDER }]}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            )}
          </View>
          {planLabel === 'Free' && (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.75}
            >
              <Text style={styles.upgradeBtnText}>Upgrade plan →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Menu items ─────────────────────────────────────────────── */}
        <View style={styles.menuSection}>
          <LabelCaps style={styles.sectionLabel}>Settings</LabelCaps>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: DIVIDER_COLOR },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
              </View>
              <Text style={[styles.menuChevron, { color: CHEVRON_COLOR }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── App info ───────────────────────────────────────────────── */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Omenora</Text>
          <Text style={styles.appMeta}>Six traditions · Swiss Ephemeris · v1.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bone },
  scroll: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 48 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 24,
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
    marginBottom: 0,
  },

  // ── Plan card ─────────────────────────────────────────────────────────────
  planCard: {
    borderWidth:  1,
    borderRadius: 8,
    padding:      20,
    marginBottom: 32,
  },
  planRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  planEyebrow: {
    color:        colors.goldDim,
    marginBottom: 4,
  },
  planName: {
    fontFamily:    fonts.cormorantMedium,
    fontSize:      22,
    color:         colors.inkHigh,
    letterSpacing: 0.2,
  },
  freeBadge: {
    borderWidth:       1,
    borderRadius:      3,
    paddingVertical:   3,
    paddingHorizontal: 8,
  },
  freeBadgeText: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      9,
    color:         colors.inkFaint,
    letterSpacing: 0.8,
  },
  upgradeBtn: {
    marginTop:     14,
    paddingTop:    14,
    borderTopWidth: 1,
    borderTopColor: colors.inkGhost,
  },
  upgradeBtnText: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      12,
    color:         colors.goldDim,
    letterSpacing: 0.3,
  },

  // ── Menu ──────────────────────────────────────────────────────────────────
  menuSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flex: 1,
    gap:  4,
  },
  menuLabel: {
    fontFamily: fonts.cormorant,
    fontSize:   18,
    color:      colors.inkMid,
  },
  menuSub: {
    fontFamily: fonts.hanken,
    fontSize:   12,
    color:      colors.inkDim,
  },
  menuChevron: {
    fontFamily: fonts.hanken,
    fontSize:   20,
    marginLeft: 12,
  },

  // ── App info ──────────────────────────────────────────────────────────────
  appInfo: {
    alignItems:    'center',
    paddingTop:    24,
    borderTopWidth: 1,
    borderTopColor: colors.inkTrace,
    gap:            6,
  },
  appName: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      16,
    color:         colors.inkDim,
    letterSpacing: 0.5,
  },
  appMeta: {
    fontFamily: fonts.hanken,
    fontSize:   11,
    color:      colors.inkTrace,
    letterSpacing: 0.3,
  },
});
