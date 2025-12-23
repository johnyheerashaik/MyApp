import React, {memo} from 'react';
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

function QuickActionsGridBase({title = 'Quick picks:', actions, mode, colors, styles, onPick}: Props) {
  const isDark = mode === 'dark';

  const bg = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(0,0,0,0.05)';
  const border = isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(0,0,0,0.1)';

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
