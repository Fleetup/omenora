import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { ScreenHeader, GhostBadge, FeatureListItem } from '../components/ui';

// Screen-internal color constants
const INSIGHT_TAG_COLOR  = 'rgba(200, 180, 255, 0.60)';
const ENERGY_BAR_COLOR   = 'rgba(140, 110, 255, 0.88)';
const ENERGY_PCT_COLOR   = 'rgba(140, 110, 255, 0.55)';
const LOCKED_FADE: [string, string, string] = ['transparent', 'rgba(5, 4, 16, 0.90)', colors.bone];
const UPGRADE_BTN_BORDER = 'rgba(201, 169, 97, 0.42)';
const UPGRADE_BTN_TEXT   = 'rgba(201, 169, 97, 0.92)';

const SAMPLE_INSIGHTS = [
  {
    day: 'Today',
    energy: 94,
    title: 'A door is opening — you will know it by the unexpected invite.',
    tag: 'Career',
  },
  {
    day: 'Tomorrow',
    energy: 71,
    title: 'Mercury aligns with your life path. Creative work flows effortlessly.',
    tag: 'Creativity',
  },
  {
    day: 'Day 3',
    energy: 55,
    title: 'Rest. The universe is consolidating your recent gains.',
    tag: 'Energy',
  },
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const store = useAnalysisStore();
  const hasAccess = store.oraclePurchased;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <ScreenHeader
            onBack={() => navigation.goBack()}
            right={<GhostBadge label={hasAccess ? '✦ ORACLE' : '🔒 LOCKED'} variant={hasAccess ? 'gold' : 'ghost'} />}
          />

          <Text style={styles.eyebrow}>30 DAYS OF DAILY INSIGHTS</Text>
          <Text style={styles.heading}>Your Cosmic{'\n'}Daily Compass</Text>
          <Text style={styles.subheading}>
            {store.firstName ? `Tuned to ${store.firstName}'s energy field` : 'Tuned to your birth energy'}
          </Text>

          {/* Sample insight cards */}
          <View style={styles.insightList}>
            {SAMPLE_INSIGHTS.map((item, i) => (
              <View
                key={i}
                style={[styles.insightCard, i > 0 && !hasAccess && styles.insightCardLocked]}
              >
                <View style={styles.insightTop}>
                  <Text style={styles.insightDay}>{item.day}</Text>
                  <View style={styles.insightTagRow}>
                    <Text style={styles.insightTag}>{item.tag}</Text>
                    <View style={styles.energyTrack}>
                      <View style={[styles.energyBar, { width: `${item.energy}%` }]} />
                    </View>
                    <Text style={styles.energyPct}>{item.energy}</Text>
                  </View>
                </View>
                <Text style={[styles.insightText, i > 0 && !hasAccess && { opacity: 0.2 }]}>
                  {item.title}
                </Text>
              </View>
            ))}
            {!hasAccess && (
              <LinearGradient
                colors={LOCKED_FADE}
                style={styles.listFade}
                pointerEvents="none"
              />
            )}
          </View>

          {hasAccess ? (
            <View style={styles.purchasedBox}>
              <Text style={styles.purchasedIcon}>◉</Text>
              <Text style={styles.purchasedTitle}>Your 30-Day Compass is Active</Text>
              <Text style={styles.purchasedDesc}>
                Your personalized daily insights — aligned with your archetype and life path — are being delivered to your email each morning for the next 30 days. Check your inbox.
              </Text>
              <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('Report')}>
                <Text style={styles.reportBtnText}>← Back to Your Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.upgradeBox}>
              <Text style={styles.upgradeTitle}>Unlock 30 Days of Guidance</Text>
              <Text style={styles.upgradeDesc}>
                Every morning, a personalized cosmic insight calibrated to your archetype, life path, and current planetary cycles — delivered to your email.
              </Text>
              <View style={styles.featureList}>
                {[
                  'Daily energy level forecast',
                  'Personalized action guidance',
                  'Optimal timing for decisions',
                  '30 consecutive days of insight',
                ].map(f => (
                  <FeatureListItem key={f} label={f} />
                ))}
              </View>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Preview')}>
                <View style={styles.upgradeBtnInner}>
                  <Text style={styles.upgradeBtnText}>Unlock with Full Oracle — $12.99  ✦</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.upgradeNote}>Exclusive to Full Oracle · save 72% vs separately</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.bone },
  gradient:           { flex: 1 },
  scroll:             { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 56 },

  eyebrow:            { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: colors.goldDim, marginBottom: 10 },
  heading:            { fontFamily: fonts.cormorant, fontSize: 36, fontWeight: '300', color: colors.ink, lineHeight: 44, marginBottom: 8 },
  subheading:         { fontFamily: fonts.cormorantItalic, fontSize: 13, color: colors.inkFaint, marginBottom: 24 },

  insightList:        { gap: 10, marginBottom: 24, position: 'relative' },
  insightCard:        { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inkGhost, borderRadius: 10, padding: 16 },
  insightCardLocked:  { opacity: 0.5 },
  insightTop:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  insightDay:         { fontFamily: fonts.inter, fontSize: 10, fontWeight: '600', color: colors.goldDim, letterSpacing: 0.5, textTransform: 'uppercase' },
  insightTagRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insightTag:         { fontFamily: fonts.inter, fontSize: 9, color: INSIGHT_TAG_COLOR, letterSpacing: 0.5 },
  energyTrack:        { width: 40, height: 2, backgroundColor: colors.inkGhost, borderRadius: 1, overflow: 'hidden' },
  energyBar:          { height: '100%', backgroundColor: ENERGY_BAR_COLOR, borderRadius: 1 },
  energyPct:          { fontFamily: fonts.inter, fontSize: 9, color: ENERGY_PCT_COLOR, fontWeight: '600' },
  insightText:        { fontFamily: fonts.cormorantItalic, fontSize: 14, color: colors.inkMid, lineHeight: 22 },
  listFade:           { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },

  purchasedBox:       { alignItems: 'center', paddingTop: 8 },
  purchasedIcon:      { fontSize: 24, color: colors.goldDim, marginBottom: 14 },
  purchasedTitle:     { fontFamily: fonts.playfair, fontSize: 18, color: colors.ink, textAlign: 'center', marginBottom: 12 },
  purchasedDesc:      { fontFamily: fonts.inter, fontSize: 14, color: colors.inkFaint, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  reportBtn:          { borderWidth: 1, borderColor: colors.goldSubtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 28 },
  reportBtnText:      { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.goldDim },

  upgradeBox:         { paddingTop: 4 },
  upgradeTitle:       { fontFamily: fonts.playfair, fontSize: 22, color: colors.ink, marginBottom: 10 },
  upgradeDesc:        { fontFamily: fonts.inter, fontSize: 14, color: colors.inkFaint, lineHeight: 22, marginBottom: 20 },
  featureList:        { gap: 10, marginBottom: 24 },
  upgradeBtn:         { borderRadius: 3, marginBottom: 12, borderWidth: 1, borderColor: UPGRADE_BTN_BORDER, backgroundColor: colors.goldSubtle, paddingVertical: 16, alignItems: 'center' },
  upgradeBtnInner:    { paddingVertical: 17, alignItems: 'center', width: '100%' },
  upgradeBtnText:     { fontFamily: fonts.inter, fontSize: 12, fontWeight: '400', color: UPGRADE_BTN_TEXT, letterSpacing: 1.5, textTransform: 'uppercase' },
  upgradeNote:        { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim, textAlign: 'center' },
});
