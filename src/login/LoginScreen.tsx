import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/rtkHooks';
import { STRINGS } from '../common/strings';
import { ACCESSIBILITY_STRINGS } from '../common/accessibilityStrings';
import { AuthStackParamList } from '../navigation/types';
import { logUserLogin } from '../services/analytics';
import styles from './styles';
import { useAppDispatch } from '../store/rtkHooks';
import { signInThunk } from '../store/auth/authSlice';

type RenderInputProps = {
  colors: {
    background: string;
    text: string;
    mutedText: string;
    primary: string;
    card: string;
    inputBackground: string;
    danger: string;
  };
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
};

function renderInput({
  colors,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
}: RenderInputProps) {
  let accessibilityLabel = '';
  let accessibilityHint = '';
  switch (placeholder) {
    case STRINGS.EMAIL:
      accessibilityLabel = ACCESSIBILITY_STRINGS.EMAIL_LABEL;
      accessibilityHint = ACCESSIBILITY_STRINGS.EMAIL_HINT;
      break;
    case STRINGS.PASSWORD:
      accessibilityLabel = ACCESSIBILITY_STRINGS.PASSWORD_LABEL;
      accessibilityHint = ACCESSIBILITY_STRINGS.PASSWORD_HINT;
      break;
    default:
      accessibilityLabel = placeholder;
      accessibilityHint = `Enter your ${placeholder.toLowerCase()}`;
  }
  return (
    <TextInput
      style={[
        styles.input,
        { borderColor: colors.mutedText, color: colors.text },
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedText}
      autoCapitalize="none"
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      importantForAccessibility="yes"
    />
  );
}

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
  const theme = useAppSelector(state => state.theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
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
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {STRINGS.WELCOME}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
          {STRINGS.SIGN_IN_TO_CONTINUE}
        </Text>

        {renderInput({
          colors: theme.colors,
          placeholder: STRINGS.EMAIL,
          value: email,
          onChangeText: setEmail,
          keyboardType: 'email-address',
        })}

        {renderInput({
          colors: theme.colors,
          placeholder: STRINGS.PASSWORD,
          value: password,
          onChangeText: setPassword,
          secureTextEntry: true,
        })}

        {renderErrorMessage(error, theme.colors)}

        {renderSubmitButton(theme.colors, submitting, handleLogin)}

        <View style={styles.signUpRow}>
          <Text style={{ color: theme.colors.mutedText }}>
            {STRINGS.DONT_HAVE_ACCOUNT}{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="button"
            accessibilityLabel={ACCESSIBILITY_STRINGS.SIGN_UP_LABEL}
            accessibilityHint={ACCESSIBILITY_STRINGS.SIGN_UP_HINT}
            importantForAccessibility="yes"
          >
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {STRINGS.SIGN_UP}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
