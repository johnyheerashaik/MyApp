import React, {memo} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';

type Props = {
  styles: any;
  colors: any;
  mode: 'dark' | 'light';
  d1: Animated.Value;
  d2: Animated.Value;
  d3: Animated.Value;
};

function TypingBubbleBase({styles, colors, mode, d1, d2, d3}: Props) {
  const bg = mode === 'dark' ? colors.chatBotBubble : colors.inputBackground;

  return (
    <View style={[styles.messageBubble, styles.botBubble, {backgroundColor: bg}]}> 
      <View style={localStyles.row}> 
        <Text style={[styles.messageText, localStyles.thinkingText, {color: colors.mutedText}]}> 
          Thinking 
        </Text>

        <View style={styles.typingIndicator}> 
          {[
            {dot: d1, key: 'typing-dot-1'},
            {dot: d2, key: 'typing-dot-2'},
            {dot: d3, key: 'typing-dot-3'},
          ].map(({dot, key}) => (
            <Animated.View
              key={key}
              style={[
                styles.typingDot,
                localStyles.typingDot,
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

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingText: {
    marginRight: 8,
  },
  typingDot: {
  },
});

export default memo(TypingBubbleBase);
