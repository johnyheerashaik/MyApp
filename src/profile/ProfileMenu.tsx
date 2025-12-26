import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import styles from './styles';

type Props = {
  visible: boolean;
  initials: string;
  userName?: string | null;
  email?: string | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onClose: () => void;
  onPressSignIn: () => void;
  onPressSignOut: () => void;
};

export default function ProfileMenu({
  visible,
  initials,
  userName,
  email,
  isDarkMode,
  onToggleTheme,
  onClose,
  onPressSignIn,
  onPressSignOut,
}: Props) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClose}
      style={styles.menuOverlay}>
      <View style={[styles.menuCard, {backgroundColor: theme.colors.card}]}>
        <View style={styles.menuUserRow}>
          <View
            style={[
              styles.menuAvatar,
              {backgroundColor: theme.colors.primary},
            ]}>
            <Text style={styles.menuAvatarText}>{initials}</Text>
          </View>
          <View>
            <Text
              style={[styles.menuUserName, {color: theme.colors.text}]}>
              {userName ?? 'Guest'}
            </Text>
            {!!email && (
              <Text
                style={[
                  styles.menuUserEmail,
                  {color: theme.colors.mutedText},
                ]}>
                {email}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.menuDivider} />

        {/* theme toggle */}
        <View style={styles.menuItemRow}>
          <Text
            style={[
              styles.menuItemText,
              {color: theme.colors.text},
            ]}>
            Dark mode
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={onToggleTheme}
            thumbColor={theme.colors.white}
            trackColor={{false: theme.colors.mutedText, true: theme.colors.success}}
          />
        </View>

        {/* sign in / out */}
        {userName ? (
          <TouchableOpacity
            onPress={onPressSignOut}
            style={styles.menuItem}>
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.text},
              ]}>
              Sign out
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onPressSignIn}
            style={styles.menuItem}>
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.text},
              ]}>
              Sign in
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
