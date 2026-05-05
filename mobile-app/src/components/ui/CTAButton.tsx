import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

interface CTAButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  arrow?: boolean;
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  label,
  onPress,
  variant = 'solid',
  arrow = false,
  full = false,
  disabled = false,
  loading = false,
  style,
  labelStyle,
}) => {
  const isSolid = variant === 'solid';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isSolid ? styles.solid : styles.outline,
        full && styles.full,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isSolid ? colors.bone : colors.ink}
        />
      ) : (
        <>
          <Text
            style={[
              styles.label,
              isSolid ? styles.labelSolid : styles.labelOutline,
              labelStyle,
            ]}
          >
            {label}
          </Text>
          {arrow && (
            <Text
              style={[
                styles.arrow,
                isSolid ? styles.arrowSolid : styles.arrowOutline,
              ]}
            >
              →
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              10,
    paddingVertical:  14,
    paddingHorizontal: 28,
    borderRadius:     0,
  },

  solid: {
    backgroundColor: colors.ink,
    borderWidth:     0,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     colors.inkFaint,
  },

  full: {
    width: '100%',
  },

  disabled: {
    opacity: 0.4,
  },

  label: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  labelSolid: {
    color: colors.bone,
  },

  labelOutline: {
    color: colors.ink,
  },

  arrow: {
    fontFamily: fonts.cormorant,
    fontSize:   18,
    lineHeight: 20,
    marginTop:  -1,
  },

  arrowSolid: {
    color: colors.bone,
  },

  arrowOutline: {
    color: colors.ink,
  },
});
