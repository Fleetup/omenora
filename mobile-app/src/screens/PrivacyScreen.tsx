import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrivacyScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => (
  <View style={styles.container}>
    <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.content}>
          Your privacy is important to us. This policy outlines how we collect, use, and protect your personal data.
        </Text>
      </ScrollView>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { padding: 20 },
  backLink: { color: colors.purple.full, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text.primary, marginBottom: 20 },
  content: { color: colors.text.secondary, lineHeight: 24 },
});
