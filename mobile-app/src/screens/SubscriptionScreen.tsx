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

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.brand}>OMENORA</Text>
            <View style={hasAccess ? styles.accessBadge : styles.lockBadge}>
              <Text style={hasAccess ? styles.accessBadgeText : styles.lockBadgeText}>
                {hasAccess ? '✦ ORACLE' : '🔒 LOCKED'}
              </Text>
            </View>
          </View>

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
                colors={['transparent', 'rgba(5,4,16,0.9)', '#050410']}
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
                  <View key={f} style={styles.featureRow}>
                    <Text style={styles.featureDot}>◉</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
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
  container:          { flex: 1, backgroundColor: colors.background.main },
  gradient:           { flex: 1 },
  scroll:             { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 56 },

  topBar:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn:            { padding: 6 },
  backArrow:          { fontSize: 22, color: colors.text.primary },
  brand:              { fontSize: 11, letterSpacing: 3, color: colors.text.muted },
  accessBadge:        { borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: 'rgba(201,168,76,0.07)' },
  accessBadgeText:    { fontSize: 9, letterSpacing: 1, color: 'rgba(201,168,76,0.8)' },
  lockBadge:          { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 9 },
  lockBadgeText:      { fontSize: 9, letterSpacing: 0.5, color: 'rgba(255,255,255,0.3)' },

  eyebrow:            { fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: colors.gold.medium, marginBottom: 10 },
  heading:            { fontSize: 36, fontWeight: '300', color: colors.text.primary, lineHeight: 44, marginBottom: 8 },
  subheading:         { fontSize: 13, color: colors.text.tertiary, marginBottom: 24, fontStyle: 'italic' },

  insightList:        { gap: 10, marginBottom: 24, position: 'relative' },
  insightCard:        { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 16 },
  insightCardLocked:  { opacity: 0.5 },
  insightTop:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  insightDay:         { fontSize: 10, fontWeight: '600', color: colors.gold.medium, letterSpacing: 0.5, textTransform: 'uppercase' },
  insightTagRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insightTag:         { fontSize: 9, color: 'rgba(200,180,255,0.6)', letterSpacing: 0.5 },
  energyTrack:        { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' },
  energyBar:          { height: '100%', backgroundColor: colors.purple.full, borderRadius: 1 },
  energyPct:          { fontSize: 9, color: colors.purple.high, fontWeight: '600' },
  insightText:        { fontSize: 14, color: colors.text.secondary, lineHeight: 22, fontStyle: 'italic' },
  listFade:           { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },

  purchasedBox:       { alignItems: 'center', paddingTop: 8 },
  purchasedIcon:      { fontSize: 24, color: colors.gold.medium, marginBottom: 14 },
  purchasedTitle:     { fontSize: 18, fontWeight: '400', color: colors.text.primary, textAlign: 'center', marginBottom: 12 },
  purchasedDesc:      { fontSize: 14, color: colors.text.tertiary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  reportBtn:          { borderWidth: 1, borderColor: colors.gold.subtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 28 },
  reportBtnText:      { fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold.medium },

  upgradeBox:         { paddingTop: 4 },
  upgradeTitle:       { fontSize: 22, fontWeight: '400', color: colors.text.primary, marginBottom: 10 },
  upgradeDesc:        { fontSize: 14, color: colors.text.tertiary, lineHeight: 22, marginBottom: 20 },
  featureList:        { gap: 10, marginBottom: 24 },
  featureRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureDot:         { fontSize: 10, color: colors.gold.medium, marginTop: 2 },
  featureText:        { fontSize: 13, color: colors.text.secondary, flex: 1, lineHeight: 20 },
  upgradeBtn:         { borderRadius: 8, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.07)' },
  upgradeBtnInner:    { paddingVertical: 17, alignItems: 'center' },
  upgradeBtnText:     { fontSize: 14, fontWeight: '500', color: 'rgba(201,168,76,0.92)', letterSpacing: 0.3 },
  upgradeNote:        { fontSize: 11, color: colors.text.dim, textAlign: 'center' },
});
