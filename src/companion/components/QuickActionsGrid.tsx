import React, {memo} from 'react';
import { STRINGS } from '../../common/strings';
import {View, Text, TouchableOpacity} from 'react-native';

type QuickAction = {emoji: string; text: string; prompt: string};

type Props = {
  title?: string;
  actions: QuickAction[];
  mode: 'dark' | 'light';
  colors: any;
  styles: any;
  onPick: (prompt: string) => void;
};

function QuickActionsGridBase({title = STRINGS.QUICK_PICKS_TITLE, actions, mode, colors, styles, onPick}: Props) {
  const isDark = mode === 'dark';

  const bg = isDark ? colors.chatBotBubble : colors.inputBackground;
  const border = isDark ? colors.border : colors.borderDark;

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.quickActionsTitle, {color: colors.mutedText}]}>{title}</Text>

      <View style={styles.quickActionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={`${action.text}-${index}`}
            style={[styles.quickActionButton, {backgroundColor: bg, borderColor: border}]}
            onPress={() => onPick(action.prompt)}>
            <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
            <Text style={[styles.quickActionText, {color: colors.text}]}>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default memo(QuickActionsGridBase);
