// TODO(token-debt): FADE_COLORS hardcodes the legacy cold surface base
// (#050410, rgba(5,4,16,0.92)). After the warm surface palette landed in
// cluster 6, these values will produce a visible cold seam against the
// new warm canvas. Update to surface.deep / surface.base equivalents
// before any paywall surface ships visually.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

// Fade gradient colors — component-owned
const FADE_COLORS: [string, string, string] = ['transparent', 'rgba(5, 4, 16, 0.92)', '#050410'];

interface LockedPreviewProps {
  text: string;
  unlockLabel?: string;
}

export const LockedPreview: React.FC<LockedPreviewProps> = ({
  text,
  unlockLabel = '7 more sections in your full report',
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.text} numberOfLines={6}>{text}</Text>
    <LinearGradient colors={FADE_COLORS} style={styles.fade} pointerEvents="none" />
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>🔒</Text>
      <Text style={styles.badgeText}>{unlockLabel}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    position:    'relative',
    overflow:    'hidden',
    borderWidth: 1,
    borderColor: colors.inkGhost,
    marginBottom: 14,
  },
  text: {
    padding:    18,
    fontFamily: fonts.inter,
    fontSize:   14,
    color:      colors.inkFaint,
    lineHeight: 24,
  },
  fade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   80,
  },
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    paddingVertical: 10,
    borderTopWidth:  1,
    borderTopColor:  colors.inkTrace,
  },
  badgeIcon: {
    fontSize: 11,
  },
  badgeText: {
    fontFamily:    fonts.hanken,
    fontSize:      10,
    color:         colors.inkDim,
    letterSpacing: 0.5,
  },
});
