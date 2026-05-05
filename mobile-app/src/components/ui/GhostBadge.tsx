import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fonts } from '../../theme/fonts';

// Badge palette — component-owned color constants
const BADGE_COLORS = {
  gold:   { border: 'rgba(201, 169, 97, 0.35)',  bg: 'rgba(201, 169, 97, 0.07)', text: 'rgba(201, 169, 97, 0.80)' },
  purple: { border: 'rgba(140, 110, 255, 0.35)', bg: 'rgba(140, 110, 255, 0.07)', text: 'rgba(140, 110, 255, 0.80)' },
  ghost:  { border: 'rgba(255, 255, 255, 0.10)', bg: 'transparent',               text: 'rgba(255, 255, 255, 0.30)' },
} as const;

export type GhostBadgeVariant = keyof typeof BADGE_COLORS;

interface GhostBadgeProps {
  label: string;
  variant?: GhostBadgeVariant;
  style?: ViewStyle;
}

export const GhostBadge: React.FC<GhostBadgeProps> = ({ label, variant = 'ghost', style }) => {
  const c = BADGE_COLORS[variant];
  return (
    <View style={[styles.badge, { borderColor: c.border, backgroundColor: c.bg }, style]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth:       1,
    borderRadius:      2,
    paddingVertical:   3,
    paddingHorizontal: 9,
  },
  label: {
    fontFamily:    fonts.hanken,
    fontSize:      9,
    letterSpacing: 1,
  },
});
