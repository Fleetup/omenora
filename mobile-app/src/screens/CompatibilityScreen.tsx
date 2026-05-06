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
import { fonts } from '../theme/fonts';
import { ScreenHeader, GhostBadge, FeatureListItem } from '../components/ui';

// Screen-internal color constants
const MATCH_BAR_COLOR   = 'rgba(201, 169, 97, 0.60)';
const MATCH_LABEL_COLOR = 'rgba(200, 180, 255, 0.55)';
const LOCKED_FADE: [string, string, string] = ['transparent', 'rgba(5, 4, 16, 0.85)', colors.bone];
const UPGRADE_BTN_BORDER = 'rgba(201, 169, 97, 0.32)';

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

          <ScreenHeader
            onBack={() => navigation.goBack()}
            right={<GhostBadge label={hasAccess ? '✦ INCLUDED' : '🔒 LOCKED'} variant={hasAccess ? 'purple' : 'ghost'} />}
          />

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
                colors={LOCKED_FADE}
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
                  <FeatureListItem key={f} label={f} icon="♥" />
                ))}
              </View>
              <Text style={styles.upgradeNote}>Also included in Full Oracle · $12.99</Text>
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

  matchCard:          { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inkGhost, borderRadius: 10, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  matchHeader:        { borderBottomWidth: 1, borderBottomColor: colors.inkTrace, paddingVertical: 10, paddingHorizontal: 16 },
  matchHeaderText:    { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, color: colors.inkDim, textTransform: 'uppercase' },
  matchRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.inkTrace },
  matchRowLocked:     { },
  matchElement:       { fontFamily: fonts.inter, fontSize: 11, color: colors.inkFaint, width: 38, fontWeight: '500' },
  matchBarWrap:       { flex: 1, height: 3, backgroundColor: colors.inkTrace, borderRadius: 2, overflow: 'hidden', position: 'relative' },
  matchBar:           { height: '100%', backgroundColor: MATCH_BAR_COLOR, borderRadius: 2 },
  matchPct:           { fontFamily: fonts.inter, position: 'absolute', right: 4, top: -5, fontSize: 9, color: colors.goldDim },
  matchLabel:         { fontFamily: fonts.inter, fontSize: 10, color: MATCH_LABEL_COLOR, width: 68, textAlign: 'right', letterSpacing: 0.2 },
  matchFade:          { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },

  purchasedBox:       { alignItems: 'center', paddingTop: 8 },
  purchasedIcon:      { fontSize: 28, color: colors.goldDim, marginBottom: 14 },
  purchasedTitle:     { fontFamily: fonts.playfair, fontSize: 18, color: colors.ink, textAlign: 'center', marginBottom: 12 },
  purchasedDesc:      { fontFamily: fonts.inter, fontSize: 14, color: colors.inkFaint, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  reportBtn:          { borderWidth: 1, borderColor: colors.goldSubtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 28 },
  reportBtnText:      { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.goldDim },

  upgradeBox:         { paddingTop: 4 },
  upgradeTitle:       { fontFamily: fonts.playfair, fontSize: 22, color: colors.ink, marginBottom: 10 },
  upgradeDesc:        { fontFamily: fonts.inter, fontSize: 14, color: colors.inkFaint, lineHeight: 22, marginBottom: 20 },
  featureList:        { gap: 10, marginBottom: 24 },
  upgradeBtn:         { borderRadius: 3, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: UPGRADE_BTN_BORDER, backgroundColor: 'transparent', paddingVertical: 16, alignItems: 'center' },
  upgradeBtnGradient: { paddingVertical: 17, alignItems: 'center', width: '100%' },
  upgradeBtnText:     { fontFamily: fonts.inter, fontSize: 12, fontWeight: '400', color: colors.inkMid, letterSpacing: 1.5, textTransform: 'uppercase' },
  upgradeNote:        { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim, textAlign: 'center' },
});
