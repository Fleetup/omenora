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
import { CompatibilityScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';

const SIGN_PAIRS = [
  { a: 'Fire',  b: 'Air',   pct: 94, label: 'Soul Mirrors' },
  { a: 'Earth', b: 'Water', pct: 88, label: 'Deep Roots' },
  { a: 'Fire',  b: 'Fire',  pct: 76, label: 'Twin Flames' },
  { a: 'Air',   b: 'Earth', pct: 62, label: 'Growth Bond' },
];

export const CompatibilityScreen: React.FC<CompatibilityScreenProps> = ({ navigation }) => {
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

          <Text style={styles.eyebrow}>LOVE COMPATIBILITY READING</Text>
          <Text style={styles.heading}>Who Is Your{'\n'}Perfect Match?</Text>
          <Text style={styles.subheading}>
            {store.report?.archetypeName
              ? `Calculated for ${store.report.archetypeName}`
              : 'Based on your destiny archetype'}
          </Text>

          {/* Match preview card */}
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchHeaderText}>ARCHETYPE COMPATIBILITY MAP</Text>
            </View>
            {SIGN_PAIRS.map((pair, i) => (
              <View key={i} style={[styles.matchRow, hasAccess ? null : styles.matchRowLocked]}>
                <Text style={styles.matchElement}>{pair.a}</Text>
                <View style={styles.matchBarWrap}>
                  <View style={[styles.matchBar, { width: `${pair.pct}%`, opacity: hasAccess ? 1 : 0.2 }]} />
                  <Text style={[styles.matchPct, hasAccess ? null : { opacity: 0 }]}>{pair.pct}%</Text>
                </View>
                <Text style={[styles.matchLabel, hasAccess ? null : { opacity: 0.15 }]}>{pair.label}</Text>
              </View>
            ))}
            {!hasAccess && (
              <LinearGradient
                colors={['transparent', 'rgba(5,4,16,0.85)', '#050410']}
                style={styles.matchFade}
                pointerEvents="none"
              />
            )}
          </View>

          {hasAccess ? (
            <View style={styles.purchasedBox}>
              <Text style={styles.purchasedIcon}>♥</Text>
              <Text style={styles.purchasedTitle}>Your Compatibility Reading is Ready</Text>
              <Text style={styles.purchasedDesc}>
                Your personalized love compatibility analysis — including your most compatible archetypes, relationship patterns, and timing for romance — has been sent to your email.
              </Text>
              <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('Report')}>
                <Text style={styles.reportBtnText}>← Back to Your Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.upgradeBox}>
              <Text style={styles.upgradeTitle}>Unlock Your Love Reading</Text>
              <Text style={styles.upgradeDesc}>
                Discover which archetypes align with yours, your romantic patterns, and the exact timing windows for meaningful connections in 2026.
              </Text>
              <View style={styles.featureList}>
                {[
                  'Most compatible destiny archetypes',
                  'Your love language pattern',
                  '2026 romance timing windows',
                  'Relationship red flags to watch',
                ].map(f => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={styles.featureDot}>♥</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Preview')}>
                <LinearGradient colors={colors.gradients.primary} style={styles.upgradeBtnGradient}>
                  <Text style={styles.upgradeBtnText}>Unlock with Bundle — $4.99  ✦</Text>
                </LinearGradient>
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
  brand:              { fontSize: 11, letterSpacing: 3, color: colors.text.muted },
  accessBadge:        { borderWidth: 1, borderColor: 'rgba(140,110,255,0.35)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: 'rgba(140,110,255,0.07)' },
  accessBadgeText:    { fontSize: 9, letterSpacing: 1, color: 'rgba(140,110,255,0.8)' },
  lockBadge:          { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 9 },
  lockBadgeText:      { fontSize: 9, letterSpacing: 0.5, color: 'rgba(255,255,255,0.3)' },

  eyebrow:            { fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: colors.gold.medium, marginBottom: 10 },
  heading:            { fontSize: 36, fontWeight: '300', color: colors.text.primary, lineHeight: 44, marginBottom: 8 },
  subheading:         { fontSize: 13, color: colors.text.tertiary, marginBottom: 24, fontStyle: 'italic' },

  matchCard:          { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  matchHeader:        { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, paddingHorizontal: 16 },
  matchHeaderText:    { fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' },
  matchRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  matchRowLocked:     { },
  matchElement:       { fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 38, fontWeight: '500' },
  matchBarWrap:       { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', position: 'relative' },
  matchBar:           { height: '100%', backgroundColor: 'rgba(201,168,76,0.6)', borderRadius: 2 },
  matchPct:           { position: 'absolute', right: 4, top: -5, fontSize: 9, color: colors.gold.medium },
  matchLabel:         { fontSize: 10, color: 'rgba(200,180,255,0.55)', width: 68, textAlign: 'right', letterSpacing: 0.2 },
  matchFade:          { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },

  purchasedBox:       { alignItems: 'center', paddingTop: 8 },
  purchasedIcon:      { fontSize: 28, color: 'rgba(201,168,76,0.7)', marginBottom: 14 },
  purchasedTitle:     { fontSize: 18, fontWeight: '400', color: colors.text.primary, textAlign: 'center', marginBottom: 12 },
  purchasedDesc:      { fontSize: 14, color: colors.text.tertiary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  reportBtn:          { borderWidth: 1, borderColor: colors.gold.subtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 28 },
  reportBtnText:      { fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold.medium },

  upgradeBox:         { paddingTop: 4 },
  upgradeTitle:       { fontSize: 22, fontWeight: '400', color: colors.text.primary, marginBottom: 10 },
  upgradeDesc:        { fontSize: 14, color: colors.text.tertiary, lineHeight: 22, marginBottom: 20 },
  featureList:        { gap: 10, marginBottom: 24 },
  featureRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureDot:         { fontSize: 12, color: 'rgba(201,168,76,0.55)', marginTop: 1 },
  featureText:        { fontSize: 13, color: colors.text.secondary, flex: 1, lineHeight: 20 },
  upgradeBtn:         { borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  upgradeBtnGradient: { paddingVertical: 17, alignItems: 'center' },
  upgradeBtnText:     { fontSize: 14, fontWeight: '600', color: colors.text.primary, letterSpacing: 0.3 },
  upgradeNote:        { fontSize: 11, color: colors.text.dim, textAlign: 'center' },
});
