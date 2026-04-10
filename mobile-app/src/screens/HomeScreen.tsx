import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

// Orbital Mark Component
const OrbitalMark: React.FC = () => (
  <View style={styles.orbitalContainer}>
    <View style={styles.orbitOuter}>
      <View style={styles.orbitPlanet} />
    </View>
    <View style={styles.orbitInner} />
    <View style={styles.orbitCenter} />
  </View>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.cosmic}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Orbital Brand Mark */}
          <OrbitalMark />

          {/* Brand Name */}
          <Text style={styles.brandName}>OMENORA</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            AI decoded your destiny.{'\n'}Science explains why.
          </Text>

          {/* Threshold Separator */}
          <View style={styles.threshold}>
            <View style={styles.thresholdRule} />
            <Text style={styles.socialProof}>3.9M analyses complete</Text>
            <View style={styles.thresholdRule} />
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Analysis')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaLabel}>Begin Your Analysis</Text>
              <Text style={styles.ctaGlyph}>✦</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sub-label */}
          <Text style={styles.subLabel}>
            No login required · Results in 10 seconds
          </Text>

          {/* Feature Pills */}
          <View style={styles.featurePills}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>AI Birth Chart</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Life Path Number</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Love Compatibility</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>2026 Forecast</Text>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  // Orbital Mark Styles
  orbitalContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  orbitOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitPlanet: {
    position: 'absolute',
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  orbitInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(123, 97, 255, 0.5)',
  },
  orbitCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  // Brand Styles
  brandName: {
    fontSize: 42,
    fontWeight: '300',
    letterSpacing: 12,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  // Threshold Styles
  threshold: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
  },
  thresholdRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialProof: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  // CTA Styles
  ctaButton: {
    width: '100%',
    maxWidth: 300,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  ctaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: 8,
  },
  ctaGlyph: {
    fontSize: 16,
    color: colors.text.primary,
  },
  subLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: 40,
  },
  // Feature Pills
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  featurePillText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  // Legal Links
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 12,
    color: colors.text.muted,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: colors.text.muted,
    marginHorizontal: 8,
  },
});
