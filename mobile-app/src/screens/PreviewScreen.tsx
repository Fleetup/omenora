import React, { useState, useEffect, useRef } from 'react';
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

const { width: SW } = Dimensions.get('window');


const LOADING_MESSAGES = [
  'Processing your profile...',
  'Mapping your patterns...',
  'Calculating your archetype...',
  'Generating your report...',
];

const AnimatedOrbitalMark: React.FC = () => {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 18000, useNativeDriver: true })
    );
    animation.start();
    return () => animation.stop();
  }, []);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={orbitalStyles.container}>
      <Animated.View style={[orbitalStyles.orbitOuter, { transform: [{ rotate: spin }] }]}>
        <View style={orbitalStyles.orbitPlanet} />
      </Animated.View>
      <View style={orbitalStyles.orbitInner} />
      <View style={orbitalStyles.orbitCenter} />
    </View>
  );
};

const orbitalStyles = StyleSheet.create({
  container: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  orbitOuter: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.3)', justifyContent: 'center', alignItems: 'center' },
  orbitPlanet: { position: 'absolute', top: -3, width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(201, 168, 76, 0.85)' },
  orbitInner: { position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(140, 110, 255, 0.2)' },
  orbitCenter: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(200, 180, 255, 0.9)' },
});

const LockedPreview: React.FC<{ text: string }> = ({ text }) => (
  <View style={lockStyles.wrapper}>
    <Text style={lockStyles.text} numberOfLines={6}>{text}</Text>
    <LinearGradient
      colors={['transparent', 'rgba(5,4,16,0.92)', '#050410']}
      style={lockStyles.fade}
      pointerEvents="none"
    />
    <View style={lockStyles.badge}>
      <Text style={lockStyles.badgeIcon}>🔒</Text>
      <Text style={lockStyles.badgeText}>7 more sections in your full report</Text>
    </View>
  </View>
);

const lockStyles = StyleSheet.create({
  wrapper:   { position: 'relative', overflow: 'hidden', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  text:      { padding: 18, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 24 },
  fade:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  badge:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  badgeIcon: { fontSize: 11 },
  badgeText: { fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: 0.5 },
});

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
            <AnimatedOrbitalMark />
            <Text style={styles.brandTextSmall}>OMENORA</Text>
            <Text key={currentMessageIndex} style={styles.loadingMessage}>{LOADING_MESSAGES[currentMessageIndex]}</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '95%'] }) }]} />
            </View>
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
            <AnimatedOrbitalMark />
            <Text style={styles.brandTextSmall}>OMENORA</Text>
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

          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.brandTextSmall}>OMENORA</Text>
            <View style={styles.reportBadge}>
              <Text style={styles.reportBadgeText}>Report Ready</Text>
            </View>
          </View>

          {/* Archetype hero */}
          <View style={styles.archetypeBlock}>
            <View style={styles.archetypeGlow} />
            <Text style={styles.archetypeLabel}>Your Destiny Archetype</Text>
            <Text style={styles.archetypeSymbol}>{store.report?.archetypeSymbol || '✦'}</Text>
            <Text style={[styles.archetypeName, { maxWidth: nameWidth }]}>{store.report?.archetypeName || 'The Visionary'}</Text>
            <Text style={styles.archetypeMeta}>{store.report?.element || 'Fire'} · Life Path {store.lifePathNumber || '7'}</Text>
            <View style={styles.traitsRow}>
              {(store.report?.powerTraits || ['Intuitive', 'Determined', 'Creative']).map((trait, i) => (
                <View key={i} style={styles.traitPill}><Text style={styles.traitPillText}>{trait}</Text></View>
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
                placeholderTextColor={colors.text.muted}
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
                    ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.06)']
                    : selectedTier === 3
                    ? ['rgba(201,168,76,0.12)', 'rgba(201,168,76,0.18)']
                    : colors.gradients.primary
                }
                style={styles.unlockGradient}
              >
                {isProcessingPayment ? (
                  <ActivityIndicator color={selectedTier === 3 ? colors.gold.medium : colors.text.primary} />
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
  container:            { flex: 1, backgroundColor: colors.background.main },
  gradient:             { flex: 1 },

  // Loading / Error
  loadingContainer:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  brandTextSmall:       { fontFamily: fonts.inter, fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.22)', marginBottom: 16 },
  loadingMessage:       { fontFamily: fonts.cormorantItalic, fontSize: 16, fontWeight: '300', color: 'rgba(255,255,255,0.48)', textAlign: 'center', minHeight: 48, lineHeight: 24 },
  progressTrack:        { width: 160, height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 24, overflow: 'hidden' },
  progressFill:         { height: '100%', backgroundColor: colors.purple.full },
  errorContainer:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  errorText:            { fontFamily: fonts.cormorantItalic, fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 16, marginBottom: 24 },
  retryButton:          { borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', borderRadius: 3, paddingVertical: 12, paddingHorizontal: 32 },
  retryButtonText:      { fontFamily: fonts.inter, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(201,168,76,0.78)' },

  // Scroll
  scrollContent:        { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  // Top bar
  topBar:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  reportBadge:          { borderWidth: 1, borderColor: 'rgba(140,110,255,0.3)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 10, backgroundColor: 'rgba(140,110,255,0.07)' },
  reportBadgeText:      { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(140,110,255,0.7)' },

  // Archetype hero
  archetypeBlock:       { position: 'relative', borderLeftWidth: 2, borderLeftColor: 'rgba(201,168,76,0.4)', paddingVertical: 20, paddingLeft: 24, paddingRight: 12, marginBottom: 16, overflow: 'hidden' },
  archetypeGlow:        { position: 'absolute', top: 0, left: -60, width: 240, height: 160, backgroundColor: 'rgba(201,168,76,0.055)', borderRadius: 120 },
  archetypeLabel:       { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(201,168,76,0.62)', marginBottom: 10 },
  archetypeSymbol:      { fontFamily: fonts.cormorant, fontSize: 36, marginBottom: 6, opacity: 0.85 },
  archetypeName:        { fontFamily: fonts.cormorant, fontSize: 36, fontWeight: '300', color: 'rgba(255,255,255,0.95)', lineHeight: 44, marginBottom: 8, letterSpacing: -0.4 },
  archetypeMeta:        { fontFamily: fonts.inter, fontSize: 12, color: 'rgba(140,110,255,0.65)', letterSpacing: 0.4 },
  traitsRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  traitPill:            { borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 2, paddingVertical: 4, paddingHorizontal: 10 },
  traitPillText:        { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' },

  // Social proof
  socialBar:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingHorizontal: 2 },
  socialStars:          { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(201,168,76,0.72)', letterSpacing: 1 },
  socialText:           { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.2 },

  // Pricing
  pricingSection:       { marginTop: 24 },
  pricingTitle:         { fontFamily: fonts.playfair, fontSize: 22, fontWeight: '400', color: 'rgba(255,255,255,0.92)', marginBottom: 6 },
  pricingSubtitle:      { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 18, marginBottom: 20 },

  tierList:             { gap: 10 },
  tierCard:             { borderRadius: 8, padding: 14 },
  tierInfo:             { flex: 1 },

  // Basic
  tierBasic:            { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierSelectedBasic:    { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)' },
  tierName:             { fontFamily: fonts.inter, fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.65)', marginBottom: 3 },
  tierDesc:             { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.28)' },
  tierPrice:            { fontFamily: fonts.cormorant, fontSize: 22, fontWeight: '300', color: 'rgba(255,255,255,0.45)' },
  tierPriceSelected:    { color: 'rgba(255,255,255,0.72)' },

  // Popular
  tierPopular:          { backgroundColor: 'rgba(140,110,255,0.08)', borderWidth: 1, borderColor: 'rgba(140,110,255,0.2)', borderLeftWidth: 2, borderLeftColor: 'rgba(201,168,76,0.7)', paddingTop: 24 },
  tierSelectedPopular:  { borderColor: 'rgba(140,110,255,0.5)', borderLeftColor: colors.gold.high, shadowColor: '#8C6EFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  tierBadge:            { position: 'absolute', top: -11, alignSelf: 'center', backgroundColor: 'rgba(201,168,76,0.95)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 14 },
  tierBadgeText:        { fontFamily: fonts.inter, fontSize: 9, fontWeight: '700', color: '#050410', letterSpacing: 1.2 },
  tierPopularInner:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tierNamePopular:      { fontFamily: fonts.playfair, fontSize: 14, color: 'rgba(255,255,255,0.95)', marginBottom: 10 },
  tierFeatures:         { fontFamily: fonts.inter, fontSize: 12, color: 'rgba(200,180,255,0.7)', lineHeight: 22 },
  tierPriceBlock:       { alignItems: 'flex-end', paddingTop: 2 },
  tierStrike:           { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.2)', textDecorationLine: 'line-through', marginBottom: 1 },
  tierStrikeOracle:     { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(201,168,76,0.25)', textDecorationLine: 'line-through', marginBottom: 1 },
  tierPricePopular:     { fontFamily: fonts.cormorant, fontSize: 28, fontWeight: '300', color: 'rgba(200,180,255,1)' },
  tierPriceNote:        { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(140,110,255,0.6)', marginTop: 2, fontWeight: '500' },

  // Oracle
  tierOracle:           { backgroundColor: 'rgba(201,168,76,0.04)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: 8 },
  tierSelectedOracle:   { borderColor: 'rgba(201,168,76,0.45)', shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
  tierOracleInner:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tierNameOracle:       { fontFamily: fonts.playfair, fontSize: 14, color: 'rgba(255,215,130,0.9)', marginBottom: 10 },
  tierFeaturesOracle:   { fontFamily: fonts.inter, fontSize: 12, color: 'rgba(201,168,76,0.55)', lineHeight: 22 },
  tierPriceOracle:      { fontFamily: fonts.cormorant, fontSize: 26, fontWeight: '300', color: 'rgba(201,168,76,0.9)' },
  tierPriceNoteOracle:  { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(201,168,76,0.55)', marginTop: 2, fontWeight: '500' },

  // Email
  emailWrapper:         { marginTop: 18 },
  emailLabel:           { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 },
  emailInput:           { fontFamily: fonts.inter, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 14, color: 'rgba(255,255,255,0.9)', fontSize: 15 },

  // CTA
  unlockButton:         { borderRadius: 8, overflow: 'hidden', marginTop: 14 },
  unlockButtonBasic:    { },
  unlockButtonOracle:   { borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)' },
  unlockButtonDisabled: { opacity: 0.45 },
  unlockGradient:       { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  unlockButtonText:     { fontFamily: fonts.inter, fontSize: 15, fontWeight: '500', color: colors.text.primary, letterSpacing: 0.4 },
  unlockButtonTextBasic:  { color: 'rgba(255,255,255,0.55)', fontWeight: '400' },
  unlockButtonTextOracle: { color: 'rgba(201,168,76,0.95)' },
  ctaSubNote:           { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 10, letterSpacing: 0.2 },

  // Trust
  trustRow:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  trustItem:            { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(255,255,255,0.22)' },
  trustDot:             { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(255,255,255,0.12)' },
});
