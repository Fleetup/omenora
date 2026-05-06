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
import { useProfileStore } from '../stores/profileStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { ScreenHeader, GhostBadge, TraitPill, SectionBlock, LabelCaps } from '../components/ui';

// Screen-internal color constant
const ARCHETYPE_META_COLOR = 'rgba(140, 110, 255, 0.55)';

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
  const store = useProfileStore();
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
            <LabelCaps>OMENORA</LabelCaps>
            <Text style={styles.fallbackTitle}>Your report is on its way.</Text>
            <Text style={styles.fallbackText}>
              Check the email address you provided — your complete reading has been sent there.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
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
          <ScreenHeader right={<GhostBadge label="Complete Report" variant="gold" />} />

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
                <TraitPill key={i} label={trait} />
              ))}
            </View>
          </View>


          {SECTION_ORDER.map((key, idx) => {
            const section = report.sections[key];
            if (!section) return null;
            return (
              <SectionBlock
                key={key}
                icon={SECTION_ICONS[key]}
                title={section.title}
                content={section.content}
                isLast={idx === SECTION_ORDER.length - 1}
                isAffirmation={key === 'affirmation'}
              />
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
  container:           { flex: 1, backgroundColor: colors.bone },
  gradient:            { flex: 1 },
  scrollContent:       { padding: 20, paddingBottom: 60 },

  centerContent:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  fallbackTitle:       { fontFamily: fonts.cormorant, fontSize: 28, fontWeight: '300', color: colors.ink, textAlign: 'center', marginBottom: 12, marginTop: 16 },
  fallbackText:        { fontFamily: fonts.inter, fontSize: 14, color: colors.inkFaint, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backBtn:             { borderWidth: 1, borderColor: colors.goldSubtle, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 32 },
  backBtnText:         { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: colors.goldDim },

  heroBlock:           { borderLeftWidth: 2, borderLeftColor: colors.goldDim, paddingLeft: 20, paddingVertical: 20, marginBottom: 32 },
  archetypeEyebrow:    { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: colors.goldDim, marginBottom: 12 },
  archetypeSymbol:     { fontFamily: fonts.cormorant, fontSize: 40, opacity: 0.82, marginBottom: 8, color: colors.ink },
  archetypeName:       { fontFamily: fonts.cormorant, fontSize: 38, fontWeight: '300', color: colors.inkHigh, lineHeight: 44, marginBottom: 8, letterSpacing: -0.4 },
  archetypeMeta:       { fontFamily: fonts.inter, fontSize: 12, color: ARCHETYPE_META_COLOR, letterSpacing: 0.5, marginBottom: 16 },
  traitsRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  shareSection:        { marginTop: 32, alignItems: 'center' },
  shareDivider:        { width: 40, height: 1, backgroundColor: colors.inkGhost, marginBottom: 24 },
  shareButton:         { borderWidth: 1, borderColor: colors.goldSubtle, borderRadius: 3, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 12 },
  shareButtonText:     { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: colors.goldDim },
  shareNote:           { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim, letterSpacing: 1 },
});
