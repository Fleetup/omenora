import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReportScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

export const ReportScreen: React.FC<ReportScreenProps> = ({ route }) => {
  const reportId = route.params?.reportId ?? '';

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Your Destiny Report</Text>
          <Text style={styles.reportId}>ID: {reportId}</Text>
          <Text style={styles.placeholder}>Report content will be displayed here...</Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary, marginBottom: 10 },
  reportId: { fontSize: 12, color: colors.text.muted, marginBottom: 20 },
  placeholder: { color: colors.text.tertiary },
});
