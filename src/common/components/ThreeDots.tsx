import React, {memo} from 'react';
import {Animated, TextStyle} from 'react-native';

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
      <Animated.Text style={[{opacity: d1, color}, style]}>.</Animated.Text>
      <Animated.Text style={[{opacity: d2, color}, style]}>.</Animated.Text>
      <Animated.Text style={[{opacity: d3, color}, style]}>.</Animated.Text>
    </>
  );
}

export default memo(ThreeDotsBase);
