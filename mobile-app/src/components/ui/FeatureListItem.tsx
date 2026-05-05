import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface FeatureListItemProps {
  label: string;
  icon?: string;
  style?: ViewStyle;
}

export const FeatureListItem: React.FC<FeatureListItemProps> = ({
  label,
  icon = '◉',
  style,
}) => (
  <View style={[styles.row, style]}>
    <Text style={styles.dot}>{icon}</Text>
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           10,
  },
  dot: {
    fontFamily: fonts.hanken,
    fontSize:   10,
    color:      colors.goldDim,
    marginTop:  2,
  },
  text: {
    flex:       1,
    fontFamily: fonts.inter,
    fontSize:   13,
    color:      colors.inkFaint,
    lineHeight: 20,
  },
});
