import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReportScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const SECTION_ORDER = [
  'identity',
  'science',
  'forecast',
  'love',
  'purpose',
  'gift',
  'affirmation',
] as const;

const SECTION_ICONS: Record<string, string> = {
  identity:    '◉',
  science:     '◆',
  forecast:    '▲',
  love:        '♥',
  purpose:     '✦',
  gift:        '◇',
  affirmation: '★',
};

export const ReportScreen: React.FC<ReportScreenProps> = ({ navigation }) => {
  const store = useAnalysisStore();
  const report = store.report;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My OMENORA destiny archetype is ${report?.archetypeName ?? ''}. Discover yours at omenora.com`,
      });
    } catch {}
  };

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
          <View style={styles.centerContent}>
            <Text style={styles.brandSmall}>OMENORA</Text>
            <Text style={styles.fallbackTitle}>Your report is on its way.</Text>
            <Text style={styles.fallbackText}>
              Check the email address you provided — your complete reading has been sent there.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.backBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.brandSmall}>OMENORA</Text>
            <View style={styles.reportBadge}>
              <Text style={styles.reportBadgeText}>Complete Report</Text>
            </View>
          </View>

          {/* Hero archetype block */}
          <View style={styles.heroBlock}>
            <Text style={styles.archetypeEyebrow}>YOUR DESTINY ARCHETYPE</Text>
            <Text style={styles.archetypeSymbol}>{report.archetypeSymbol}</Text>
            <Text style={styles.archetypeName}>{report.archetypeName}</Text>
            <Text style={styles.archetypeMeta}>
              {report.element} · Life Path {store.lifePathNumber ?? ''}
            </Text>
            <View style={styles.traitsRow}>
              {report.powerTraits.map((trait, i) => (
                <View key={i} style={styles.traitPill}>
                  <Text style={styles.traitPillText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bundle / Oracle unlock banner */}
          {(store.bundlePurchased || store.oraclePurchased) && (
            <View style={styles.unlockBanner}>
              <Text style={styles.unlockBannerIcon}>✦</Text>
              <View style={styles.unlockBannerText}>
                <Text style={styles.unlockBannerTitle}>
                  {store.oraclePurchased ? 'Full Oracle unlocked' : 'Bundle unlocked'}
                </Text>
                <Text style={styles.unlockBannerDesc}>
                  {store.oraclePurchased
                    ? 'Calendar · Compatibility · Birth Chart · 30 Daily Insights — all included'
                    : 'Calendar · Compatibility Reading — included in your bundle'}
                </Text>
              </View>
            </View>
          )}

          {/* Report sections */}
          {SECTION_ORDER.map((key, idx) => {
            const section = report.sections[key];
            if (!section) return null;
            const isLast = idx === SECTION_ORDER.length - 1;
            const isAffirmation = key === 'affirmation';

            return (
              <View
                key={key}
                style={[styles.sectionWrapper, isLast && styles.sectionWrapperLast]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>{SECTION_ICONS[key]}</Text>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {isAffirmation ? (
                  <View style={styles.affirmationBox}>
                    <Text style={styles.affirmationText}>{section.content}</Text>
                  </View>
                ) : (
                  <Text style={styles.sectionContent}>{section.content}</Text>
                )}
              </View>
            );
          })}

          {/* Share CTA */}
          <View style={styles.shareSection}>
            <View style={styles.shareDivider} />
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share Your Archetype</Text>
            </TouchableOpacity>
            <Text style={styles.shareNote}>omenora.com</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: colors.background.main },
  gradient:            { flex: 1 },
  scrollContent:       { padding: 20, paddingBottom: 60 },

  centerContent:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  fallbackTitle:       { fontFamily: fonts.cormorant, fontSize: 28, fontWeight: '300', color: colors.text.primary, textAlign: 'center', marginBottom: 12, marginTop: 16 },
  fallbackText:        { fontFamily: fonts.inter, fontSize: 14, color: colors.text.tertiary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backBtn:             { borderWidth: 1, borderColor: colors.gold.subtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 32 },
  backBtnText:         { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: colors.gold.medium },

  topBar:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  brandSmall:          { fontFamily: fonts.inter, fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.22)' },
  reportBadge:         { borderWidth: 1, borderColor: colors.gold.subtle, borderRadius: 2, paddingVertical: 3, paddingHorizontal: 10 },
  reportBadgeText:     { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: colors.gold.medium },

  heroBlock:           { borderLeftWidth: 2, borderLeftColor: colors.gold.low, paddingLeft: 20, paddingVertical: 20, marginBottom: 32 },
  archetypeEyebrow:    { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: colors.gold.medium, marginBottom: 12 },
  archetypeSymbol:     { fontFamily: fonts.cormorant, fontSize: 40, opacity: 0.82, marginBottom: 8, color: colors.text.primary },
  archetypeName:       { fontFamily: fonts.cormorant, fontSize: 38, fontWeight: '300', color: 'rgba(255,255,255,0.92)', lineHeight: 44, marginBottom: 8, letterSpacing: -0.4 },
  archetypeMeta:       { fontFamily: fonts.inter, fontSize: 12, color: colors.purple.high, letterSpacing: 0.5, marginBottom: 16 },
  traitsRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  traitPill:           { borderWidth: 1, borderColor: colors.background.cardBorder, borderRadius: 2, paddingVertical: 4, paddingHorizontal: 10 },
  traitPillText:       { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: colors.text.muted },

  unlockBanner:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.purple.low, borderWidth: 1, borderColor: colors.purple.medium, borderRadius: 8, padding: 14, marginBottom: 24, gap: 12 },
  unlockBannerIcon:    { fontFamily: fonts.inter, fontSize: 16, color: colors.gold.medium, marginTop: 1 },
  unlockBannerText:    { flex: 1 },
  unlockBannerTitle:   { fontFamily: fonts.inter, fontSize: 13, fontWeight: '500', color: colors.text.primary, marginBottom: 4 },
  unlockBannerDesc:    { fontFamily: fonts.inter, fontSize: 12, color: colors.text.tertiary, lineHeight: 18 },

  sectionWrapper:      { paddingVertical: 28, borderBottomWidth: 1, borderBottomColor: colors.background.cardBorder },
  sectionWrapperLast:  { borderBottomWidth: 0 },
  sectionHeader:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIcon:         { fontFamily: fonts.inter, fontSize: 11, color: colors.gold.medium, opacity: 0.7 },
  sectionTitle:        { fontFamily: fonts.inter, fontSize: 11, fontWeight: '500', color: colors.gold.medium, textTransform: 'uppercase', letterSpacing: 2 },
  sectionContent:      { fontFamily: fonts.inter, fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 28, fontWeight: '300' },

  affirmationBox:      { backgroundColor: colors.purple.low, borderWidth: 1, borderColor: colors.purple.medium, borderRadius: 8, padding: 20 },
  affirmationText:     { fontFamily: fonts.cormorantItalic, fontSize: 16, color: colors.purpleLight.high, lineHeight: 26, textAlign: 'center' },

  shareSection:        { marginTop: 32, alignItems: 'center' },
  shareDivider:        { width: 40, height: 1, backgroundColor: colors.background.cardBorder, marginBottom: 24 },
  shareButton:         { borderWidth: 1, borderColor: colors.gold.subtle, borderRadius: 3, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 12 },
  shareButtonText:     { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: colors.gold.medium },
  shareNote:           { fontFamily: fonts.inter, fontSize: 11, color: colors.text.dim, letterSpacing: 1 },
});
