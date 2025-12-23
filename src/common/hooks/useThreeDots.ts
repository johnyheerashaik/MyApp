import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

export function useThreeDots(isActive: boolean, duration = 400) {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;

    const mk = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {toValue: 1, duration, useNativeDriver: true}),
          Animated.timing(dot, {toValue: 0, duration, useNativeDriver: true}),
        ]),
      );

    const a1 = mk(d1, 0);
    const a2 = mk(d2, 150);
    const a3 = mk(d3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [isActive, duration, d1, d2, d3]);

  return {d1, d2, d3};
}
