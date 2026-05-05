import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

// Banner decorative colors — component-owned
const BANNER_BG     = 'rgba(140, 110, 255, 0.08)';
const BANNER_BORDER = 'rgba(140, 110, 255, 0.22)';

interface InfoBannerProps {
  icon?: string;
  title: string;
  body: string;
  style?: ViewStyle;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  icon = '✦',
  title,
  body,
  style,
}) => (
  <View style={[styles.banner, style]}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.textBlock}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    backgroundColor: BANNER_BG,
    borderWidth:     1,
    borderColor:     BANNER_BORDER,
    padding:         14,
    gap:             12,
    marginBottom:    24,
  },
  icon: {
    fontFamily: fonts.inter,
    fontSize:   16,
    color:      colors.goldDim,
    marginTop:  1,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily:   fonts.interMedium,
    fontSize:     13,
    color:        colors.ink,
    marginBottom: 4,
  },
  body: {
    fontFamily: fonts.inter,
    fontSize:   12,
    color:      colors.inkFaint,
    lineHeight: 18,
  },
});
