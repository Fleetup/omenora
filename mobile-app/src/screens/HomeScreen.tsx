import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { HomeScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const { width: SW } = Dimensions.get('window');
const brandFontSize  = SW < 375 ? 52 : SW < 420 ? 64 : 72;
const taglineFontSize = SW < 375 ? 14 : 17;

const AnimatedOrbitalMark: React.FC = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 18000, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={orbital.container}>
      <Animated.View style={[orbital.outer, { transform: [{ rotate: spin }] }]}>
        <View style={orbital.planet} />
      </Animated.View>
      <View style={orbital.inner} />
      <View style={orbital.center} />
    </View>
  );
};

const orbital = StyleSheet.create({
  container: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  outer:     { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', justifyContent: 'center', alignItems: 'center' },
  planet:    { position: 'absolute', top: -3, width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(201,168,76,0.85)', shadowColor: 'rgba(201,168,76,1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6 },
  inner:     { position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(140,110,255,0.22)' },
  center:    { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(200,180,255,0.9)', shadowColor: 'rgba(180,150,255,1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8 },
});

const FEATURE_PILLS = [
  'Destiny Archetype',
  'Life Path Number',
  'Love Pattern',
  '2026 Forecast',
  'Hidden Gift',
  'Birth Chart',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Atmospheric glow */}
        <View style={styles.nebulaGlow} pointerEvents="none" />
        <View style={styles.nebulaGlowSecondary} pointerEvents="none" />

        {/* Orbital brand mark */}
        <AnimatedOrbitalMark />

        {/* Brand name */}
        <Text style={[styles.brandName, { fontSize: brandFontSize }]}>OMENORA</Text>

        {/* Tagline */}
        <Text style={[styles.tagline, { fontSize: taglineFontSize }]}>
          AI decoded your destiny.{'\n'}Science explains why.
        </Text>

        {/* Threshold separator */}
        <View style={styles.threshold}>
          <View style={styles.thresholdRule} />
          <Text style={styles.socialProof}>3.9M ANALYSES COMPLETE</Text>
          <View style={styles.thresholdRule} />
        </View>

        {/* CTA Button — transparent gold-border, matching web */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Analysis')}
          activeOpacity={0.75}
        >
          <Text style={styles.ctaLabel}>Begin Your Analysis</Text>
          <Text style={styles.ctaGlyph}>✦</Text>
        </TouchableOpacity>

        {/* Sub-label */}
        <Text style={styles.subLabel}>No login required · Results in 10 seconds</Text>

        {/* Star rating */}
        <View style={styles.starRow}>
          <Text style={styles.starGold}>★★★★★</Text>
          <Text style={styles.starLabel}>4.9 · 47,823 readings</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.featurePills}>
          {FEATURE_PILLS.map((label) => (
            <View key={label} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Legal links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <Text style={styles.legalLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.legalLink}>Terms</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: colors.background.main },

  scrollContent:        { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 48 },

  // Atmospheric glows (simulate web nebula)
  nebulaGlow:           { position: 'absolute', top: '30%', left: '50%', width: 320, height: 260, borderRadius: 160, backgroundColor: 'rgba(140,110,255,0.06)', transform: [{ translateX: -160 }, { translateY: -130 }] },
  nebulaGlowSecondary:  { position: 'absolute', top: '38%', left: '48%', width: 190, height: 140, borderRadius: 95, backgroundColor: 'rgba(201,168,76,0.035)', transform: [{ translateX: -95 }, { translateY: -70 }] },

  // Brand name — Cormorant Garamond 300, letter-spacing 0.14em — exact web match
  brandName:            { fontFamily: fonts.cormorant, fontWeight: '300', letterSpacing: 10, color: 'rgba(255,255,255,0.93)', marginTop: 10, marginBottom: 0, textAlign: 'center' },

  // Tagline — Cormorant Garamond italic 300 — exact web match
  tagline:              { fontFamily: fonts.cormorantItalic, fontWeight: '300', color: 'rgba(255,255,255,0.48)', letterSpacing: 0.2, lineHeight: 26, textAlign: 'center', marginTop: 16, marginBottom: 0 },

  // Threshold separator
  threshold:            { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 28, width: '100%', maxWidth: 320 },
  thresholdRule:        { flex: 1, height: 1, backgroundColor: colors.gold.ghost },
  socialProof:          { fontFamily: fonts.inter, fontSize: 10, color: colors.gold.medium, letterSpacing: 1.5, textTransform: 'uppercase' },

  // CTA — transparent background, gold border, rounded=3, uppercase Inter 12px — exact web match
  ctaButton:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.gold.low, borderRadius: 3, paddingVertical: 16, paddingHorizontal: 44, width: '100%', maxWidth: 360 },
  ctaLabel:             { fontFamily: fonts.inter, fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.78)', letterSpacing: 1.5, textTransform: 'uppercase' },
  ctaGlyph:             { fontFamily: fonts.inter, fontSize: 10, color: colors.gold.medium },

  subLabel:             { fontFamily: fonts.inter, fontSize: 11, color: colors.text.dim, marginTop: 14, letterSpacing: 0.3 },
  starRow:              { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  starGold:             { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(201,168,76,0.65)', letterSpacing: 1 },
  starLabel:            { fontFamily: fonts.inter, fontSize: 11, color: colors.text.dim, letterSpacing: 0.2 },

  // Feature pills — square corners (borderRadius 2), very subtle — exact web match
  featurePills:         { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 24, maxWidth: 360 },
  featurePill:          { borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 2, paddingVertical: 4, paddingHorizontal: 10 },
  featurePillText:      { fontFamily: fonts.inter, fontSize: 9, color: 'rgba(255,255,255,0.16)', letterSpacing: 0.8, textTransform: 'uppercase' },

  // Legal
  legalLinks:           { flexDirection: 'row', alignItems: 'center', marginTop: 32 },
  legalLink:            { fontFamily: fonts.inter, fontSize: 11, color: colors.text.dim },
  legalDot:             { fontFamily: fonts.inter, fontSize: 11, color: colors.text.dim, marginHorizontal: 8 },
});
