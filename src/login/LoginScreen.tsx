import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../auth/AuthContext';
import {useTheme} from '../theme/ThemeContext';
import {APP_STRINGS} from '../constants';
import {AuthStackParamList} from '../navigation/types';
import {logUserLogin} from '../services/analyticsEvents';
import styles from './styles';

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
  return (
    <TextInput
      style={[
        styles.input,
        {borderColor: colors.mutedText, color: colors.text},
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedText}
      autoCapitalize="none"
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
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
    <Text style={[styles.error, {color: colors.danger}]}>
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
        {backgroundColor: colors.primary},
      ]}
      onPress={onPress}
      disabled={submitting}>
      <Text style={styles.buttonText}>
        {submitting ? APP_STRINGS.SIGNING_IN : APP_STRINGS.SIGN_IN}
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

export default function LoginScreen({navigation}: LoginScreenProps) {
  const {signIn} = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (submitting) {
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      logUserLogin('email');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.card, {backgroundColor: theme.colors.card}]}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          {APP_STRINGS.WELCOME}
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.mutedText}]}>
          {APP_STRINGS.SIGN_IN_TO_CONTINUE}
        </Text>

        {renderInput({
          colors: theme.colors,
          placeholder: APP_STRINGS.EMAIL,
          value: email,
          onChangeText: setEmail,
          keyboardType: 'email-address',
        })}

        {renderInput({
          colors: theme.colors,
          placeholder: APP_STRINGS.PASSWORD,
          value: password,
          onChangeText: setPassword,
          secureTextEntry: true,
        })}

        {renderErrorMessage(error, theme.colors)}

        {renderSubmitButton(theme.colors, submitting, handleLogin)}

        <View style={{marginTop: 20, alignItems: 'center'}}>
          <Text style={[{color: theme.colors.mutedText}]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={[{color: theme.colors.primary, fontWeight: 'bold'}]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
