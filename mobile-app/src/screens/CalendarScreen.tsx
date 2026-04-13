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
import { CalendarScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const PREVIEW_BARS = [0.72, 0.45, 0.88, 0.55, 0.94, 0.63, 0.81, 0.5, 0.76, 0.42, 0.85, 0.68];
const LABELS = ['Peak', 'Rest', 'Peak', 'Build', 'Peak', 'Build', 'High', 'Rest', 'High', 'Rest', 'Peak', 'High'];

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const store = useAnalysisStore();
  const hasAccess = store.bundlePurchased || store.oraclePurchased;

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
                {hasAccess ? '✦ INCLUDED' : '🔒 LOCKED'}
              </Text>
            </View>
          </View>

          {/* Eyebrow */}
          <Text style={styles.eyebrow}>YOUR 2026 DESTINY CALENDAR</Text>
          <Text style={styles.heading}>Lucky Timing{'\n'}Forecast</Text>
          <Text style={styles.subheading}>
            {store.firstName ? `Calculated for ${store.firstName}` : 'Personalized to your birth data'}
          </Text>

          {/* Calendar preview (always shown, blurred overlay if locked) */}
          <View style={styles.calendarCard}>
            {MONTHS.map((month, i) => (
              <View key={month} style={styles.calRow}>
                <Text style={styles.calMonth}>{month}</Text>
                <View style={styles.calBarTrack}>
                  <View style={[styles.calBar, { width: `${PREVIEW_BARS[i] * 100}%`, opacity: hasAccess ? 1 : 0.3 }]} />
                </View>
                <Text style={[styles.calLabel, hasAccess ? null : styles.calLabelLocked]}>{LABELS[i]}</Text>
              </View>
            ))}

            {!hasAccess && (
              <LinearGradient
                colors={['transparent', 'rgba(5,4,16,0.82)', '#050410']}
                style={styles.calFade}
                pointerEvents="none"
              />
            )}
          </View>

          {hasAccess ? (
            /* ── Purchased state ── */
            <View style={styles.purchasedBox}>
              <Text style={styles.purchasedIcon}>✦</Text>
              <Text style={styles.purchasedTitle}>Your Calendar is Being Prepared</Text>
              <Text style={styles.purchasedDesc}>
                Your full 12-month lucky timing forecast for 2026 — including optimal windows for love, career, and finances — has been sent to your email. Check your inbox.
              </Text>
              <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('Report')}>
                <Text style={styles.reportBtnText}>← Back to Your Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Upgrade state ── */
            <View style={styles.upgradeBox}>
              <Text style={styles.upgradeTitle}>Unlock Your 2026 Calendar</Text>
              <Text style={styles.upgradeDesc}>
                Month-by-month lucky windows personalized to your archetype, life path, and birth city — for love, money, decisions, and rest.
              </Text>
              <View style={styles.featureList}>
                {['Optimal action windows by month', 'Love & relationship timing', 'Career & financial cycles', 'Rest & recovery periods'].map(f => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={styles.featureDot}>◉</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Preview')} activeOpacity={0.75}>
                <Text style={styles.upgradeBtnText}>Unlock with Bundle — $4.99  ✦</Text>
              </TouchableOpacity>
              <Text style={styles.upgradeNote}>Also included in Full Oracle · $12.99</Text>
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
  brand:              { fontFamily: fonts.inter, fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.22)' },
  accessBadge:        { borderWidth: 1, borderColor: 'rgba(140,110,255,0.35)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: 'rgba(140,110,255,0.07)' },
  accessBadgeText:    { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 1, color: 'rgba(140,110,255,0.8)' },
  lockBadge:          { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 9 },
  lockBadgeText:      { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 0.5, color: 'rgba(255,255,255,0.3)' },

  eyebrow:            { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: colors.gold.medium, marginBottom: 10 },
  heading:            { fontFamily: fonts.cormorant, fontSize: 36, fontWeight: '300', color: colors.text.primary, lineHeight: 44, marginBottom: 8 },
  subheading:         { fontFamily: fonts.cormorantItalic, fontSize: 13, color: colors.text.tertiary, marginBottom: 24 },

  calendarCard:       { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 24, overflow: 'hidden', position: 'relative' },
  calRow:             { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  calMonth:           { fontFamily: fonts.inter, fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.3)', width: 30, letterSpacing: 0.5 },
  calBarTrack:        { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  calBar:             { height: '100%', backgroundColor: colors.purple.full, borderRadius: 2 },
  calLabel:           { fontFamily: fonts.inter, fontSize: 9, color: colors.gold.medium, width: 32, textAlign: 'right', letterSpacing: 0.3 },
  calLabelLocked:     { opacity: 0.25 },
  calFade:            { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },

  purchasedBox:       { alignItems: 'center', paddingTop: 8 },
  purchasedIcon:      { fontSize: 24, color: colors.gold.medium, marginBottom: 14 },
  purchasedTitle:     { fontFamily: fonts.playfair, fontSize: 18, color: colors.text.primary, textAlign: 'center', marginBottom: 12 },
  purchasedDesc:      { fontFamily: fonts.inter, fontSize: 14, color: colors.text.tertiary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  reportBtn:          { borderWidth: 1, borderColor: colors.gold.subtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 28 },
  reportBtnText:      { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold.medium },

  upgradeBox:         { paddingTop: 4 },
  upgradeTitle:       { fontFamily: fonts.playfair, fontSize: 22, color: colors.text.primary, marginBottom: 10 },
  upgradeDesc:        { fontFamily: fonts.inter, fontSize: 14, color: colors.text.tertiary, lineHeight: 22, marginBottom: 20 },
  featureList:        { gap: 10, marginBottom: 24 },
  featureRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureDot:         { fontFamily: fonts.inter, fontSize: 10, color: colors.gold.medium, marginTop: 2 },
  featureText:        { fontFamily: fonts.inter, fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1, lineHeight: 20 },
  upgradeBtn:         { borderRadius: 3, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(201,168,76,0.32)', backgroundColor: 'transparent', paddingVertical: 16, alignItems: 'center' },
  upgradeBtnGradient: { paddingVertical: 17, alignItems: 'center', width: '100%' },
  upgradeBtnText:     { fontFamily: fonts.inter, fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.78)', letterSpacing: 1.5, textTransform: 'uppercase' },
  upgradeNote:        { fontFamily: fonts.inter, fontSize: 11, color: colors.text.dim, textAlign: 'center' },
});
