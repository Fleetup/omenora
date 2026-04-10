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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PreviewScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { api } from '../api/endpoints';

const { width } = Dimensions.get('window');

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

const BlurredContent: React.FC = () => (
  <View style={blurStyles.container}>
    <View style={[blurStyles.fakeLine, { width: '90%' }]} />
    <View style={[blurStyles.fakeLine, { width: '75%' }]} />
    <View style={[blurStyles.fakeLine, { width: '85%' }]} />
    <View style={[blurStyles.fakeLine, { width: '60%' }]} />
    <View style={[blurStyles.fakeLine, { width: '80%' }]} />
  </View>
);

const blurStyles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 6 },
  fakeLine: { height: 7, backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 4, marginBottom: 9 },
});

export const PreviewScreen: React.FC<PreviewScreenProps> = ({ navigation }) => {
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
    setTimeout(() => {
      store.setPaymentComplete(true);
      if (selectedTier === 2) store.setBundlePurchased(true);
      if (selectedTier === 3) store.setOraclePurchased(true);
      setIsProcessingPayment(false);
      navigation.navigate('Report', { reportId: store.report?.archetypeName || 'default' });
    }, 1500);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Text style={styles.brandTextSmall}>OMENORA</Text>
            <View style={styles.reportBadge}><Text style={styles.reportBadgeText}>Behavioral Report</Text></View>
          </View>

          <View style={styles.archetypeBlock}>
            <View style={styles.archetypeGlow} />
            <Text style={styles.archetypeLabel}>Your Destiny Archetype</Text>
            <Text style={styles.archetypeSymbol}>{store.report?.archetypeSymbol || '✦'}</Text>
            <Text style={styles.archetypeName}>{store.report?.archetypeName || 'The Visionary'}</Text>
            <Text style={styles.archetypeMeta}>{store.report?.element || 'Fire'} · Life Path {store.lifePathNumber || '7'}</Text>
            <View style={styles.traitsRow}>
              {(store.report?.powerTraits || ['Intuitive', 'Determined', 'Creative']).map((trait, i) => (
                <View key={i} style={styles.traitPill}><Text style={styles.traitPillText}>{trait}</Text></View>
              ))}
            </View>
          </View>

          <Text style={styles.previewText}>{store.report?.sections?.identity?.content || 'You possess a rare combination of intuition and determination that sets you apart.'}</Text>

          <View style={styles.lockedWrapper}>
            <BlurredContent />
            <Text style={styles.lockedLabel}>🔒 8 more sections included</Text>
          </View>

          <View style={styles.pricingSection}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Choose Your Reading</Text>
              <Text style={styles.pricingSubtitle}>Your destiny has been calculated</Text>
            </View>

            <View style={styles.tierList}>
              <TouchableOpacity style={[styles.tierCard, styles.tierBasic, selectedTier === 1 && styles.tierSelectedBasic]} onPress={() => setSelectedTier(1)} activeOpacity={0.8}>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>Basic Report</Text>
                  <Text style={styles.tierDesc}>Core archetype analysis only</Text>
                </View>
                <Text style={styles.tierPrice}>$1.99</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tierCard, styles.tierPopular, selectedTier === 2 && styles.tierSelectedPopular]} onPress={() => setSelectedTier(2)} activeOpacity={0.8}>
                <View style={styles.tierBadge}><Text style={styles.tierBadgeText}>★ MOST POPULAR</Text></View>
                <View style={styles.tierPopularInner}>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierNamePopular}>Popular Bundle</Text>
                    <Text style={styles.tierFeatures}>❆ Full 10-section report{'\n'}❆ Lucky calendar 2026{'\n'}❆ Compatibility reading</Text>
                  </View>
                  <View style={styles.tierPriceBlock}><Text style={styles.tierPricePopular}>$4.99</Text><Text style={styles.tierPriceNote}>one-time</Text></View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tierCard, styles.tierOracle, selectedTier === 3 && styles.tierSelectedOracle]} onPress={() => setSelectedTier(3)} activeOpacity={0.8}>
                <View style={styles.tierOracleInner}>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierNameOracle}>Full Oracle</Text>
                    <Text style={styles.tierFeaturesOracle}>✦ Full 10-section report{'\n'}✦ Lucky calendar 2026{'\n'}✦ Compatibility reading{'\n'}✦ Full birth chart{'\n'}✦ 30 days daily insights</Text>
                  </View>
                  <View style={styles.tierPriceBlock}><Text style={styles.tierPriceOracle}>$12.99</Text><Text style={styles.tierPriceNoteOracle}>save $8</Text></View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.emailWrapper}>
              <Text style={styles.emailLabel}>Email for Delivery</Text>
              <TextInput style={styles.emailInput} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.text.muted} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <TouchableOpacity style={[styles.unlockButton, selectedTier === 1 && styles.unlockButtonBasic, selectedTier === 3 && styles.unlockButtonOracle, (!email || isProcessingPayment) && styles.unlockButtonDisabled]} onPress={handlePayment} disabled={!email || isProcessingPayment} activeOpacity={0.8}>
              <LinearGradient colors={selectedTier === 1 ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)'] : selectedTier === 3 ? ['transparent', 'transparent'] : colors.gradients.primary} style={styles.unlockGradient}>
                {isProcessingPayment ? <ActivityIndicator color={selectedTier === 1 ? colors.text.tertiary : colors.text.primary} /> : <Text style={[styles.unlockButtonText, selectedTier === 1 && styles.unlockButtonTextBasic, selectedTier === 3 && styles.unlockButtonTextOracle]}>{selectedTier === 1 ? 'Unlock Basic' : selectedTier === 2 ? 'Unlock Popular Bundle ✦' : 'Unlock Full Oracle'}</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.trustNote}>Your reading will be emailed to you and never expires</Text>
            <Text style={styles.trustSecure}>Secured by Stripe</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  brandTextSmall: { fontSize: 11, letterSpacing: 3, color: 'rgba(255, 255, 255, 0.25)', marginBottom: 16 },
  loadingMessage: { fontSize: 16, fontWeight: '300', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.48)', textAlign: 'center', minHeight: 48, lineHeight: 24 },
  progressTrack: { width: 160, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginTop: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary.main },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  errorText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', marginTop: 16, marginBottom: 24 },
  retryButton: { borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.35)', borderRadius: 3, paddingVertical: 12, paddingHorizontal: 32 },
  retryButtonText: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(201, 168, 76, 0.78)' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  reportBadge: { borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.22)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 10 },
  reportBadgeText: { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(201, 168, 76, 0.6)' },
  archetypeBlock: { position: 'relative', borderLeftWidth: 2, borderLeftColor: 'rgba(201, 168, 76, 0.38)', padding: 24, paddingLeft: 28, marginBottom: 24, overflow: 'hidden' },
  archetypeGlow: { position: 'absolute', top: '50%', left: -80, width: 280, height: 200, backgroundColor: 'rgba(201, 168, 76, 0.06)', borderRadius: 140, transform: [{ translateY: -100 }] },
  archetypeLabel: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(201, 168, 76, 0.62)', marginBottom: 12 },
  archetypeSymbol: { fontSize: 36, marginBottom: 8, opacity: 0.8 },
  archetypeName: { fontSize: 42, fontWeight: '300', color: 'rgba(255, 255, 255, 0.95)', lineHeight: 48, marginBottom: 8 },
  archetypeMeta: { fontSize: 12, color: 'rgba(140, 110, 255, 0.58)', letterSpacing: 0.5 },
  traitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
  traitPill: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: 'transparent' },
  traitPillText: { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.35)' },
  previewText: { fontSize: 15, color: 'rgba(255, 255, 255, 0.58)', lineHeight: 26, marginBottom: 20 },
  lockedWrapper: { marginBottom: 24 },
  lockedLabel: { fontSize: 11, color: 'rgba(255, 255, 255, 0.32)', textAlign: 'center', marginTop: 10 },
  pricingSection: { marginTop: 24 },
  pricingHeader: { alignItems: 'center', marginBottom: 20 },
  pricingTitle: { fontSize: 26, fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)', marginBottom: 6 },
  pricingSubtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.27)' },
  tierList: { gap: 10 },
  tierCard: { borderRadius: 8, padding: 14 },
  tierBasic: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.07)', flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.62 },
  tierSelectedBasic: { opacity: 1, borderColor: 'rgba(255, 255, 255, 0.14)' },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 13, fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', marginBottom: 2 },
  tierDesc: { fontSize: 11, color: 'rgba(255, 255, 255, 0.22)' },
  tierPrice: { fontSize: 22, fontWeight: '300', color: 'rgba(255, 255, 255, 0.42)' },
  tierPopular: { backgroundColor: 'rgba(140, 110, 255, 0.07)', borderWidth: 1, borderColor: 'rgba(140, 110, 255, 0.18)', borderLeftWidth: 2, borderLeftColor: 'rgba(201, 168, 76, 0.65)', paddingTop: 22, position: 'relative' },
  tierSelectedPopular: { borderColor: 'rgba(140, 110, 255, 0.45)', borderLeftColor: 'rgba(201, 168, 76, 0.95)', shadowColor: 'rgba(140, 110, 255, 0.22)', shadowOffset: { width: 0, height: 0 }, shadowRadius: 22, elevation: 8 },
  tierBadge: { position: 'absolute', top: -10, left: '50%', transform: [{ translateX: -50 }], backgroundColor: 'rgba(201, 168, 76, 0.92)', borderRadius: 2, paddingVertical: 3, paddingHorizontal: 14 },
  tierBadgeText: { fontSize: 9, fontWeight: '600', color: '#050410', letterSpacing: 1 },
  tierPopularInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierNamePopular: { fontSize: 13, fontWeight: '600', color: 'rgba(255, 255, 255, 0.92)', marginBottom: 8 },
  tierFeatures: { fontSize: 11, color: 'rgba(200, 180, 255, 0.6)', lineHeight: 20 },
  tierPriceBlock: { alignItems: 'flex-end' },
  tierPricePopular: { fontSize: 30, fontWeight: '300', color: 'rgba(200, 180, 255, 0.95)' },
  tierPriceNote: { fontSize: 10, color: 'rgba(140, 110, 255, 0.42)', marginTop: 2 },
  tierOracle: { backgroundColor: 'rgba(201, 168, 76, 0.04)', borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.18)', borderRadius: 10 },
  tierSelectedOracle: { borderColor: 'rgba(201, 168, 76, 0.32)', shadowColor: 'rgba(201, 168, 76, 0.14)', shadowOffset: { width: 0, height: 0 }, shadowRadius: 18, elevation: 6 },
  tierOracleInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierNameOracle: { fontSize: 13, fontWeight: '500', color: 'rgba(255, 215, 130, 0.78)', marginBottom: 8 },
  tierFeaturesOracle: { fontSize: 11, color: 'rgba(201, 168, 76, 0.42)', lineHeight: 20 },
  tierPriceOracle: { fontSize: 26, fontWeight: '300', color: 'rgba(201, 168, 76, 0.62)' },
  tierPriceNoteOracle: { fontSize: 10, color: 'rgba(201, 168, 76, 0.38)', marginTop: 2 },
  emailWrapper: { marginTop: 16 },
  emailLabel: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.22)', marginBottom: 8 },
  emailInput: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 6, padding: 13, color: 'rgba(255, 255, 255, 0.88)', fontSize: 14 },
  unlockButton: { borderRadius: 6, overflow: 'hidden', marginTop: 12 },
  unlockButtonBasic: { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  unlockButtonOracle: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(201, 168, 76, 0.5)' },
  unlockButtonDisabled: { opacity: 0.5 },
  unlockGradient: { paddingVertical: 17, alignItems: 'center' },
  unlockButtonText: { fontSize: 14, fontWeight: '500', color: colors.text.primary, letterSpacing: 0.5 },
  unlockButtonTextBasic: { color: 'rgba(255, 255, 255, 0.5)' },
  unlockButtonTextOracle: { color: 'rgba(201, 168, 76, 0.88)' },
  trustNote: { fontSize: 10, color: 'rgba(255, 255, 255, 0.22)', textAlign: 'center', marginTop: 12 },
  trustSecure: { fontSize: 10, color: 'rgba(255, 255, 255, 0.14)', textAlign: 'center', marginTop: 4 },
});
