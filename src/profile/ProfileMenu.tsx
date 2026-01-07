import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/rtkHooks';
import FeedbackForm from '../feedback/FeedbackForm';
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
  const theme = useAppSelector(state => state.theme);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={[styles.menuOverlay, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { }}
          style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.menuUserRow}>
            <View
              style={[
                styles.menuAvatar,
                { backgroundColor: theme.colors.primary },
              ]}>
              <Text style={styles.menuAvatarText}>{initials}</Text>
            </View>
            <View>
              <Text
                style={[styles.menuUserName, { color: theme.colors.text }]}>
                {userName ?? 'Guest'}
              </Text>
              {!!email && (
                <Text
                  style={[
                    styles.menuUserEmail,
                    { color: theme.colors.mutedText },
                  ]}>
                  {email}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.menuDivider} />

          <View style={styles.menuItemRow}>
            <Text
              style={[
                styles.menuItemText,
                { color: theme.colors.text },
              ]}>
              Dark mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={onToggleTheme}
              thumbColor={theme.colors.white}
              trackColor={{ false: theme.colors.mutedText, true: theme.colors.success }}
            />
          </View>

          <TouchableOpacity
            onPress={() => setFeedbackVisible(true)}
            style={styles.menuItem}>
            <Text
              style={[
                styles.menuItemText,
                { color: theme.colors.text },
              ]}>
              Feedback
            </Text>
          </TouchableOpacity>

          {userName ? (
            <TouchableOpacity
              onPress={onPressSignOut}
              style={styles.menuItem}>
              <Text
                style={[
                  styles.menuItemText,
                  { color: theme.colors.text },
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
                  { color: theme.colors.text },
                ]}>
                Sign in
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      <FeedbackForm
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        userName={userName}
        userEmail={email}
      />
    </>
  );
}
