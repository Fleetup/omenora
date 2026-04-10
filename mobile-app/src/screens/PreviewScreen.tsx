import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PreviewScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

export const PreviewScreen: React.FC<PreviewScreenProps> = () => {
  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.text}>Crafting your destiny report...</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.text.secondary, marginTop: 20 },
});
