import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STRINGS } from '../common/strings';
import { ACCESSIBILITY_STRINGS } from '../common/accessibilityStrings';
import { AuthStackParamList } from '../navigation/types';
import { logUserLogin } from '../services/analytics';
import styles from './styles';
import { useAppDispatch, useAppSelector } from '../store/rtkHooks';
import { signInThunk } from '../store/auth/authSlice';

type ThemeColors = {
  background: string;
  text: string;
  mutedText: string;
  primary: string;
  card: string;
  inputBackground: string;
  danger: string;
};

function renderErrorMessage(error: string, colors: ThemeColors) {
  if (!error) return null;

  return (
    <Text style={[styles.error, { color: colors.danger }]}>
      {error}
    </Text>
  );
}

function renderSubmitButton(
  colors: ThemeColors,
  submitting: boolean,
  onPress: () => void,
) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary },
      ]}
      onPress={onPress}
      disabled={submitting}
      accessibilityRole="button"
      accessibilityLabel={ACCESSIBILITY_STRINGS.SIGN_IN_LABEL}
      accessibilityHint={ACCESSIBILITY_STRINGS.SIGN_IN_HINT}
      importantForAccessibility="yes"
    >
      <Text style={styles.buttonText}>
        {submitting ? STRINGS.SIGNING_IN : STRINGS.SIGN_IN}
      </Text>
    </TouchableOpacity>
  );
}

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const themeColors = useAppSelector(state => state.theme.colors);
  const themeMutedText = useAppSelector(state => state.theme.colors.mutedText);
  const themeText = useAppSelector(state => state.theme.colors.text);
  const themePrimary = useAppSelector(state => state.theme.colors.primary);
  const themeCard = useAppSelector(state => state.theme.colors.card);
  const themeBackground = useAppSelector(state => state.theme.colors.background);
  const themeDanger = useAppSelector(state => state.theme.colors.danger);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const handleLogin = useCallback(async () => {
    if (submitting) return;

    setError('');
    setSubmitting(true);

    try {
      await dispatch(signInThunk({ email, password })).unwrap();
      logUserLogin('email');
    } catch (e: any) {
      setError(e?.message || String(e) || STRINGS.LOGIN_FAILED);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, dispatch, email, password]);

  const inputStyle = useMemo(() => [
    styles.input,
    { borderColor: themeMutedText, color: themeText },
  ], [themeMutedText, themeText]);

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: themeBackground },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.card, { backgroundColor: themeCard }]}>
        <Text style={[styles.title, { color: themeText }]}>
          {STRINGS.WELCOME}
        </Text>
        <Text style={[styles.subtitle, { color: themeMutedText }]}>
          {STRINGS.SIGN_IN_TO_CONTINUE}
        </Text>

        <TextInput
          style={inputStyle}
          placeholder={STRINGS.EMAIL}
          placeholderTextColor={themeMutedText}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          accessibilityLabel={ACCESSIBILITY_STRINGS.EMAIL_LABEL}
          accessibilityHint={ACCESSIBILITY_STRINGS.EMAIL_HINT}
          importantForAccessibility="yes"
        />

        <TextInput
          style={inputStyle}
          placeholder={STRINGS.PASSWORD}
          placeholderTextColor={themeMutedText}
          autoCapitalize="none"
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
          accessibilityLabel={ACCESSIBILITY_STRINGS.PASSWORD_LABEL}
          accessibilityHint={ACCESSIBILITY_STRINGS.PASSWORD_HINT}
          importantForAccessibility="yes"
        />

        {renderErrorMessage(error, { background: themeBackground, text: themeText, mutedText: themeMutedText, primary: themePrimary, card: themeCard, inputBackground: '', danger: themeDanger })}

        {renderSubmitButton({ background: themeBackground, text: themeText, mutedText: themeMutedText, primary: themePrimary, card: themeCard, inputBackground: '', danger: themeDanger }, submitting, handleLogin)}

        <View style={styles.signUpRow}>
          <Text style={{ color: themeMutedText }}>
            {STRINGS.DONT_HAVE_ACCOUNT}{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="button"
            accessibilityLabel={ACCESSIBILITY_STRINGS.SIGN_UP_LABEL}
            accessibilityHint={ACCESSIBILITY_STRINGS.SIGN_UP_HINT}
            importantForAccessibility="yes"
          >
            <Text style={{ color: themePrimary, fontWeight: 'bold' }}>
              {STRINGS.SIGN_UP}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
