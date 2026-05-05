import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PreviewScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { api, MobileProductType } from '../api/endpoints';
import { PhoenixLoader, LockedPreview, TraitPill, GhostBadge, ScreenHeader, ProgressBar, LabelCaps } from '../components/ui';

// Screen-internal color constants
const PROGRESS_FILL_COLOR    = 'rgba(140, 110, 255, 0.88)';
const ARCH_GLOW_COLOR        = 'rgba(201, 169, 97, 0.055)';
const ARCH_BORDER_COLOR      = 'rgba(201, 169, 97, 0.40)';
const ARCH_META_COLOR        = 'rgba(140, 110, 255, 0.65)';
const TIER_SEL_BASIC_BORDER  = 'rgba(255, 255, 255, 0.20)';
const TIER_POPULAR_BG        = 'rgba(140, 110, 255, 0.08)';
const TIER_POPULAR_BORDER    = 'rgba(140, 110, 255, 0.20)';
const TIER_POPULAR_LEFT      = 'rgba(201, 169, 97, 0.70)';
const TIER_SEL_POP_BORDER    = 'rgba(140, 110, 255, 0.50)';
const TIER_FEATURES_COLOR    = 'rgba(200, 180, 255, 0.70)';
const TIER_STRIKE_ORACLE_CLR = 'rgba(201, 169, 97, 0.25)';
const TIER_PRICE_POP_COLOR   = 'rgba(200, 180, 255, 1.00)';
const TIER_PRICE_NOTE_COLOR  = 'rgba(140, 110, 255, 0.60)';
const TIER_ORACLE_BG         = 'rgba(201, 169, 97, 0.04)';
const TIER_ORACLE_BORDER     = 'rgba(201, 169, 97, 0.20)';
const TIER_NAME_ORACLE_CLR   = 'rgba(255, 215, 130, 0.90)';
const TIER_FEAT_ORACLE_CLR   = 'rgba(201, 169, 97, 0.55)';
const TIER_PRICE_ORACLE_CLR  = 'rgba(201, 169, 97, 0.90)';
const EMAIL_BORDER_COLOR     = 'rgba(255, 255, 255, 0.12)';
const UNLOCK_ORACLE_TEXT     = 'rgba(201, 169, 97, 0.95)';
const SOCIAL_STARS_COLOR     = 'rgba(201, 169, 97, 0.72)';
const RETRY_BORDER_COLOR     = 'rgba(201, 169, 97, 0.35)';
const RETRY_TEXT_COLOR       = 'rgba(201, 169, 97, 0.78)';
const TRUST_DOT_COLOR        = 'rgba(255, 255, 255, 0.12)';
const UNLOCK_BASIC_GRADIENT: [string, string] = ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.06)'];
const UNLOCK_ORACLE_GRADIENT: [string, string] = ['rgba(201,169,97,0.12)', 'rgba(201,169,97,0.18)'];

const { width: SW } = Dimensions.get('window');


const LOADING_MESSAGES = [
  'Processing your profile...',
  'Mapping your patterns...',
  'Calculating your archetype...',
  'Generating your report...',
];


export const PreviewScreen: React.FC<PreviewScreenProps> = (_props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(2);
  const [email, setEmail] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [progressWidth] = useState(new Animated.Value(0));

  const store = useAnalysisStore();

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    Animated.timing(progressWidth, { toValue: 1, duration: 8000, useNativeDriver: false }).start();
  }, [isLoading]);

  useEffect(() => { generateReport(); }, []);

  const generateReport = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await api.generateReport({
        firstName: store.firstName,
        dateOfBirth: store.dateOfBirth,
        city: store.city,
        answers: store.answers,
        archetype: null,
        lifePathNumber: store.lifePathNumber || undefined,
        region: store.regionOverride || 'western',
        timeOfBirth: store.timeOfBirth || undefined,
        language: store.languageOverride || 'en',
      });
      if (response.success && response.report) {
        store.setReport(response.report);
        const tempId = `temp_${Date.now()}_${store.firstName}`;
        store.setTempId(tempId);
        try {
          await api.saveReport({ sessionId: tempId, report: response.report, firstName: store.firstName, archetype: response.report.archetypeName, lifePathNumber: store.lifePathNumber || 0, answers: store.answers, city: store.city, dateOfBirth: store.dateOfBirth, region: store.regionOverride || 'western', email: '' });
        } catch {}
      }
      setIsLoading(false);
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleRetry = () => generateReport();

  const handlePayment = async () => {
    if (isProcessingPayment || !email) return;
    setIsProcessingPayment(true);
    store.setEmail(email);

    const typeMap: Record<1 | 2 | 3, MobileProductType> = {
      1: 'report',
      2: 'bundle',
      3: 'oracle',
    };
    const productType = typeMap[selectedTier];

    try {
      // 1. Create a Stripe Checkout Session on the server
      const session = await api.createMobileCheckoutSession({
        type: productType,
        firstName: store.firstName,
        email,
        archetype: store.archetype ?? '',
        tempId: store.tempId,
        region: store.regionOverride ?? 'western',
        dateOfBirth: store.dateOfBirth,
        lifePathNumber: store.lifePathNumber ?? undefined,
        timeOfBirth: store.timeOfBirth || undefined,
      });

      if (!session.url) {
        Alert.alert('Error', 'Could not create payment session. Please try again.');
        setIsProcessingPayment(false);
        return;
      }

      // 2. Open Stripe-hosted checkout in Safari / Chrome
      //    The app will return via omenora://payment/success?session_id=...
      //    which is handled globally in App.tsx via Linking listener.
      await Linking.openURL(session.url);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <PhoenixLoader size={64} style={{ marginBottom: 20 }} />
            <LabelCaps style={{ marginBottom: 16 }}>OMENORA</LabelCaps>
            <Text key={currentMessageIndex} style={styles.loadingMessage}>{LOADING_MESSAGES[currentMessageIndex]}</Text>
            <ProgressBar animatedValue={progressWidth} maxFill="95%" fillColor={PROGRESS_FILL_COLOR} style={{ width: 160, marginTop: 24 }} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <PhoenixLoader size={64} style={{ marginBottom: 20 }} />
            <LabelCaps style={{ marginBottom: 16 }}>OMENORA</LabelCaps>
            <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const nameWidth = Math.min(SW - 80, 320);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <ScreenHeader right={<GhostBadge label="Report Ready" variant="purple" />} style={{ marginBottom: 20 }} />

          {/* Archetype hero */}
          <View style={styles.archetypeBlock}>
            <View style={styles.archetypeGlow} />
            <Text style={styles.archetypeLabel}>Your Destiny Archetype</Text>
            <Text style={styles.archetypeSymbol}>{store.report?.archetypeSymbol || '✦'}</Text>
            <Text style={[styles.archetypeName, { maxWidth: nameWidth }]}>{store.report?.archetypeName || 'The Visionary'}</Text>
            <Text style={styles.archetypeMeta}>{store.report?.element || 'Fire'} · Life Path {store.lifePathNumber || '7'}</Text>
            <View style={styles.traitsRow}>
              {(store.report?.powerTraits || ['Intuitive', 'Determined', 'Creative']).map((trait, i) => (
                <TraitPill key={i} label={trait} />
              ))}
            </View>
          </View>

          {/* Social proof bar */}
          <View style={styles.socialBar}>
            <Text style={styles.socialStars}>★★★★★</Text>
            <Text style={styles.socialText}>4.9 · 47,823 readings · Trusted worldwide</Text>
          </View>

          {/* Identity section preview + gradient-fade lock */}
          <LockedPreview text={store.report?.sections?.identity?.content || 'You possess a rare combination of intuition and determination that sets you apart from others. Your life path carries an extraordinary signature — one that blends visionary thinking with grounded purpose. The universe has written a very specific code into your birth data, and what follows reveals what most people never discover about themselves.'} />

          {/* ── Pricing ── */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Unlock Your Full Reading</Text>
            <Text style={styles.pricingSubtitle}>One-time payment · Delivered instantly to your email · Never expires</Text>

            <View style={styles.tierList}>

              {/* Tier 1 — Basic */}
              <TouchableOpacity
                style={[styles.tierCard, styles.tierBasic, selectedTier === 1 && styles.tierSelectedBasic]}
                onPress={() => setSelectedTier(1)}
                activeOpacity={0.8}
              >
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>Basic Report</Text>
                  <Text style={styles.tierDesc}>Core archetype analysis · 3 sections</Text>
                </View>
                <Text style={[styles.tierPrice, selectedTier === 1 && styles.tierPriceSelected]}>$1.99</Text>
              </TouchableOpacity>

              {/* Tier 2 — Popular (hero) */}
              <TouchableOpacity
                style={[styles.tierCard, styles.tierPopular, selectedTier === 2 && styles.tierSelectedPopular]}
                onPress={() => setSelectedTier(2)}
                activeOpacity={0.8}
              >
                <View style={styles.tierBadge}><Text style={styles.tierBadgeText}>★ MOST POPULAR</Text></View>
                <View style={styles.tierPopularInner}>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierNamePopular}>Popular Bundle</Text>
                    <Text style={styles.tierFeatures}>
                      {'✦ Full 10-section destiny report\n'}
                      {'✦ 2026 Lucky Timing Calendar\n'}
                      {'✦ Compatibility reading'}
                    </Text>
                  </View>
                  <View style={styles.tierPriceBlock}>
                    <Text style={styles.tierStrike}>$14</Text>
                    <Text style={styles.tierPricePopular}>$4.99</Text>
                    <Text style={styles.tierPriceNote}>save 65%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Tier 3 — Oracle */}
              <TouchableOpacity
                style={[styles.tierCard, styles.tierOracle, selectedTier === 3 && styles.tierSelectedOracle]}
                onPress={() => setSelectedTier(3)}
                activeOpacity={0.8}
              >
                <View style={styles.tierOracleInner}>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierNameOracle}>Full Oracle</Text>
                    <Text style={styles.tierFeaturesOracle}>
                      {'✦ Full 10-section destiny report\n'}
                      {'✦ 2026 Lucky Timing Calendar\n'}
                      {'✦ Compatibility reading\n'}
                      {'✦ Full birth chart\n'}
                      {'✦ 30 days daily insights'}
                    </Text>
                  </View>
                  <View style={styles.tierPriceBlock}>
                    <Text style={styles.tierStrikeOracle}>$47</Text>
                    <Text style={styles.tierPriceOracle}>$12.99</Text>
                    <Text style={styles.tierPriceNoteOracle}>save 72%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Email input */}
            <View style={styles.emailWrapper}>
              <Text style={styles.emailLabel}>Email for Delivery</Text>
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.inkDim}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              style={[
                styles.unlockButton,
                selectedTier === 1 && styles.unlockButtonBasic,
                selectedTier === 3 && styles.unlockButtonOracle,
                (!email || isProcessingPayment) && styles.unlockButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!email || isProcessingPayment}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={
                  selectedTier === 1
                    ? UNLOCK_BASIC_GRADIENT
                    : selectedTier === 3
                    ? UNLOCK_ORACLE_GRADIENT
                    : colors.gradients.primary
                }
                style={styles.unlockGradient}
              >
                {isProcessingPayment ? (
                  <ActivityIndicator color={selectedTier === 3 ? colors.goldDim : colors.ink} />
                ) : (
                  <Text style={[
                    styles.unlockButtonText,
                    selectedTier === 1 && styles.unlockButtonTextBasic,
                    selectedTier === 3 && styles.unlockButtonTextOracle,
                  ]}>
                    {selectedTier === 1
                      ? 'Unlock Basic Report  →'
                      : selectedTier === 2
                      ? 'Unlock Popular Bundle  ✦'
                      : 'Unlock Full Oracle  ✦'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.ctaSubNote}>
              {isProcessingPayment ? 'Opening secure payment...' : 'Opens in browser · Returns automatically after payment'}
            </Text>

            {/* Trust row */}
            <View style={styles.trustRow}>
              <Text style={styles.trustItem}>🔒 SSL secured</Text>
              <Text style={styles.trustDot}>·</Text>
              <Text style={styles.trustItem}>30-day refund</Text>
              <Text style={styles.trustDot}>·</Text>
              <Text style={styles.trustItem}>Stripe</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: colors.bone },
  gradient:             { flex: 1 },

  // Loading / Error
  loadingContainer:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  loadingMessage:       { fontFamily: fonts.cormorantItalic, fontSize: 16, fontWeight: '300', color: colors.inkFaint, textAlign: 'center', minHeight: 48, lineHeight: 24 },
  errorContainer:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  errorText:            { fontFamily: fonts.cormorantItalic, fontSize: 14, color: colors.inkFaint, textAlign: 'center', marginTop: 16, marginBottom: 24 },
  retryButton:          { borderWidth: 1, borderColor: RETRY_BORDER_COLOR, borderRadius: 3, paddingVertical: 12, paddingHorizontal: 32 },
  retryButtonText:      { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: RETRY_TEXT_COLOR },

  // Scroll
  scrollContent:        { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  // Archetype hero
  archetypeBlock:       { position: 'relative', borderLeftWidth: 2, borderLeftColor: ARCH_BORDER_COLOR, paddingVertical: 20, paddingLeft: 24, paddingRight: 12, marginBottom: 16, overflow: 'hidden' },
  archetypeGlow:        { position: 'absolute', top: 0, left: -60, width: 240, height: 160, backgroundColor: ARCH_GLOW_COLOR, borderRadius: 120 },
  archetypeLabel:       { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: colors.goldDim, marginBottom: 10 },
  archetypeSymbol:      { fontFamily: fonts.cormorant, fontSize: 36, marginBottom: 6, opacity: 0.85 },
  archetypeName:        { fontFamily: fonts.cormorant, fontSize: 36, fontWeight: '300', color: colors.ink, lineHeight: 44, marginBottom: 8, letterSpacing: -0.4 },
  archetypeMeta:        { fontFamily: fonts.inter, fontSize: 12, color: ARCH_META_COLOR, letterSpacing: 0.4 },
  traitsRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },

  // Social proof
  socialBar:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingHorizontal: 2 },
  socialStars:          { fontFamily: fonts.inter, fontSize: 10, color: SOCIAL_STARS_COLOR, letterSpacing: 1 },
  socialText:           { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim, letterSpacing: 0.2 },

  // Pricing
  pricingSection:       { marginTop: 24 },
  pricingTitle:         { fontFamily: fonts.playfair, fontSize: 22, fontWeight: '400', color: colors.inkHigh, marginBottom: 6 },
  pricingSubtitle:      { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim, lineHeight: 18, marginBottom: 20 },

  tierList:             { gap: 10 },
  tierCard:             { borderRadius: 8, padding: 14 },
  tierInfo:             { flex: 1 },

  // Basic
  tierBasic:            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inkGhost, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierSelectedBasic:    { borderColor: TIER_SEL_BASIC_BORDER, backgroundColor: colors.inkTrace },
  tierName:             { fontFamily: fonts.inter, fontSize: 13, fontWeight: '500', color: colors.inkMid, marginBottom: 3 },
  tierDesc:             { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim },
  tierPrice:            { fontFamily: fonts.cormorant, fontSize: 22, fontWeight: '300', color: colors.inkFaint },
  tierPriceSelected:    { color: colors.inkMid },

  // Popular
  tierPopular:          { backgroundColor: TIER_POPULAR_BG, borderWidth: 1, borderColor: TIER_POPULAR_BORDER, borderLeftWidth: 2, borderLeftColor: TIER_POPULAR_LEFT, paddingTop: 24 },
  tierSelectedPopular:  { borderColor: TIER_SEL_POP_BORDER, borderLeftColor: colors.gold, shadowColor: '#8C6EFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  tierBadge:            { position: 'absolute', top: -11, alignSelf: 'center', backgroundColor: colors.gold, borderRadius: 2, paddingVertical: 3, paddingHorizontal: 14 },
  tierBadgeText:        { fontFamily: fonts.inter, fontSize: 9, fontWeight: '700', color: colors.bone, letterSpacing: 1.2 },
  tierPopularInner:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tierNamePopular:      { fontFamily: fonts.playfair, fontSize: 14, color: colors.ink, marginBottom: 10 },
  tierFeatures:         { fontFamily: fonts.inter, fontSize: 12, color: TIER_FEATURES_COLOR, lineHeight: 22 },
  tierPriceBlock:       { alignItems: 'flex-end', paddingTop: 2 },
  tierStrike:           { fontFamily: fonts.inter, fontSize: 11, color: colors.inkDim, textDecorationLine: 'line-through', marginBottom: 1 },
  tierStrikeOracle:     { fontFamily: fonts.inter, fontSize: 11, color: TIER_STRIKE_ORACLE_CLR, textDecorationLine: 'line-through', marginBottom: 1 },
  tierPricePopular:     { fontFamily: fonts.cormorant, fontSize: 28, fontWeight: '300', color: TIER_PRICE_POP_COLOR },
  tierPriceNote:        { fontFamily: fonts.inter, fontSize: 10, color: TIER_PRICE_NOTE_COLOR, marginTop: 2, fontWeight: '500' },

  // Oracle
  tierOracle:           { backgroundColor: TIER_ORACLE_BG, borderWidth: 1, borderColor: TIER_ORACLE_BORDER, borderRadius: 8 },
  tierSelectedOracle:   { borderColor: colors.goldDim, shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
  tierOracleInner:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tierNameOracle:       { fontFamily: fonts.playfair, fontSize: 14, color: TIER_NAME_ORACLE_CLR, marginBottom: 10 },
  tierFeaturesOracle:   { fontFamily: fonts.inter, fontSize: 12, color: TIER_FEAT_ORACLE_CLR, lineHeight: 22 },
  tierPriceOracle:      { fontFamily: fonts.cormorant, fontSize: 26, fontWeight: '300', color: TIER_PRICE_ORACLE_CLR },
  tierPriceNoteOracle:  { fontFamily: fonts.inter, fontSize: 10, color: TIER_FEAT_ORACLE_CLR, marginTop: 2, fontWeight: '500' },

  // Email
  emailWrapper:         { marginTop: 18 },
  emailLabel:           { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: colors.inkDim, marginBottom: 8 },
  emailInput:           { fontFamily: fonts.inter, backgroundColor: colors.inkTrace, borderWidth: 1, borderColor: EMAIL_BORDER_COLOR, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 14, color: colors.ink, fontSize: 15 },

  // CTA
  unlockButton:         { borderRadius: 8, overflow: 'hidden', marginTop: 14 },
  unlockButtonBasic:    { },
  unlockButtonOracle:   { borderWidth: 1, borderColor: colors.goldDim },
  unlockButtonDisabled: { opacity: 0.45 },
  unlockGradient:       { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  unlockButtonText:     { fontFamily: fonts.inter, fontSize: 15, fontWeight: '500', color: colors.ink, letterSpacing: 0.4 },
  unlockButtonTextBasic:  { color: colors.inkMid, fontWeight: '400' },
  unlockButtonTextOracle: { color: UNLOCK_ORACLE_TEXT },
  ctaSubNote:           { fontFamily: fonts.inter, fontSize: 10, color: colors.inkDim, textAlign: 'center', marginTop: 10, letterSpacing: 0.2 },

  // Trust
  trustRow:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  trustItem:            { fontFamily: fonts.inter, fontSize: 10, color: colors.inkDim },
  trustDot:             { fontFamily: fonts.inter, fontSize: 10, color: TRUST_DOT_COLOR },
});
