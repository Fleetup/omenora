import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrivacyScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'We collect your first name, date of birth, time of birth, city, and email address solely to generate your personal destiny report. Anonymous usage analytics help us improve the service.',
  },
  {
    title: 'How We Use Your Data',
    body: 'Your data is used exclusively to generate and deliver your destiny report. We do not sell, rent, or share your personal information with third parties for marketing purposes.',
  },
  {
    title: 'Data Storage & Security',
    body: 'Your data is stored securely using industry-standard encryption. Reports are retained for 12 months so you can reference them. We use 256-bit SSL on all data in transit.',
  },
  {
    title: 'Payment Information',
    body: 'All payments are processed by Stripe. We never store your credit card details. Stripe\'s privacy policy governs how payment data is handled.',
  },
  {
    title: 'Your Rights',
    body: 'You may request deletion of your data at any time by emailing privacy@omenora.com. We will process all deletion requests within 30 days in accordance with applicable law.',
  },
  {
    title: 'Contact',
    body: 'For any privacy concerns, contact us at privacy@omenora.com. Last updated: January 2026.',
  },
];

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>OMENORA</Text>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.eyebrow}>LEGAL</Text>
        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Effective January 2026</Text>

        <View style={styles.rule} />

        {SECTIONS.map(({ title, body }) => (
          <View key={title} style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionBody}>{body}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background.main },
  gradient:      { flex: 1 },
  scroll:        { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 56 },

  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backBtn:       { padding: 6 },
  backArrow:     { fontSize: 22, color: colors.text.primary },
  brand:         { fontFamily: fonts.inter, fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.22)' },
  spacer:        { width: 34 },

  eyebrow:       { fontFamily: fonts.inter, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: colors.gold.medium, marginBottom: 8 },
  heading:       { fontFamily: fonts.cormorant, fontSize: 32, fontWeight: '300', color: colors.text.primary, marginBottom: 6 },
  lastUpdated:   { fontFamily: fonts.cormorantItalic, fontSize: 12, color: colors.text.dim, marginBottom: 24 },
  rule:          { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 28 },

  section:       { marginBottom: 28 },
  sectionTitle:  { fontFamily: fonts.inter, fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  sectionBody:   { fontFamily: fonts.inter, fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 24 },
});
