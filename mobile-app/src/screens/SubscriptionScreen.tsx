import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = () => (
  <View style={styles.container}>
    <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Cosmic Insights</Text>
        <Text style={styles.subtitle}>Subscription coming soon...</Text>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
  subtitle: { color: colors.text.tertiary, marginTop: 10 },
});
