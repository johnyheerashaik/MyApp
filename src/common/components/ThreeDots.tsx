import React, {memo} from 'react';
import {Animated, TextStyle, StyleSheet} from 'react-native';

type Props = {
  d1: Animated.Value;
  d2: Animated.Value;
  d3: Animated.Value;
  color: string;
  style?: TextStyle;
};

function ThreeDotsBase({d1, d2, d3, color, style}: Props) {
  return (
    <>
      <Animated.Text style={[styles.dot, {opacity: d1, color}, style]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, {opacity: d2, color}, style]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, {opacity: d3, color}, style]}>.</Animated.Text>
    </>
  );
}

const styles = StyleSheet.create({
  dot: {
  },
});

export default memo(ThreeDotsBase);
