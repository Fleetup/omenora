import React from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressBarProps {
  /** Animated.Value in 0–1 range. Creates internal interpolation. */
  animatedValue?: Animated.Value;
  /** Upper bound of the fill animation, e.g. '95%'. Default '100%'. */
  maxFill?: string;
  /** Static 0–1 value (used when animatedValue is not provided). */
  value?: number;
  /** Fill color. Default: colors.ink */
  fillColor?: string;
  /** Bar height in px. Default: 1 (hairline). */
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  animatedValue,
  maxFill = '100%',
  value,
  fillColor,
  height = 1,
  style,
}) => {
  const fill = fillColor ?? colors.ink;

  const animatedWidth = animatedValue?.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', maxFill],
  });

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View
        style={[
          styles.fill,
          { height, backgroundColor: fill },
          animatedWidth ? { width: animatedWidth } : { width: `${(value ?? 0) * 100}%` },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width:           '100%',
    backgroundColor: colors.inkGhost,
    overflow:        'hidden',
  },
  fill: {
    position: 'absolute',
    left:     0,
    top:      0,
  },
});
