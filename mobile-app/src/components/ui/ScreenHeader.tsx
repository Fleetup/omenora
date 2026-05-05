import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface ScreenHeaderProps {
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ onBack, right, style }) => (
  <View style={[styles.bar, style]}>
    {onBack ? (
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.spacer} />
    )}

    <Text style={styles.brand}>OMENORA</Text>

    {right != null ? right : <View style={styles.spacer} />}
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   28,
  },
  backBtn: {
    padding:  6,
    minWidth: 34,
  },
  backArrow: {
    fontSize:   22,
    color:      colors.ink,
    lineHeight: 26,
  },
  brand: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color:         colors.inkDim,
  },
  spacer: {
    minWidth: 34,
  },
});
