import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import styles from './styles';

type Props = {
  userName?: string | null;
  initials: string;
  onPressAvatar: () => void;
};

export default function HomeHeader({userName, initials, onPressAvatar}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.headerRow}>
      <Text style={[styles.welcomeText, {color: theme.colors.text}]}>
        Welcome {userName ?? 'Guest'}
      </Text>

      <TouchableOpacity
        style={[styles.avatar, {backgroundColor: theme.colors.primary}]}
        onPress={onPressAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </TouchableOpacity>
    </View>
  );
}
