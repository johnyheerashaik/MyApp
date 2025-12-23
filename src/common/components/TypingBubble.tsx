import React, {memo} from 'react';
import {View, Text, Animated} from 'react-native';

type Props = {
  styles: any;
  colors: any;
  mode: 'dark' | 'light';
  d1: Animated.Value;
  d2: Animated.Value;
  d3: Animated.Value;
};

function TypingBubbleBase({styles, colors, mode, d1, d2, d3}: Props) {
  const bg = mode === 'dark' ? 'rgba(203, 213, 225, 0.2)' : colors.inputBackground;

  return (
    <View style={[styles.messageBubble, styles.botBubble, {backgroundColor: bg}]}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={[styles.messageText, {color: colors.mutedText, marginRight: 8}]}>
          Thinking
        </Text>

        <View style={styles.typingIndicator}>
          {[d1, d2, d3].map((dot, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.typingDot,
                {
                  backgroundColor: colors.text,
                  opacity: dot,
                  transform: [
                    {
                      translateY: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default memo(TypingBubbleBase);
