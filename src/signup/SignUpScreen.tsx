import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAppSelector } from '../store/rtkHooks';
import { STRINGS } from '../common/strings';
import { ACCESSIBILITY_STRINGS } from '../common/accessibilityStrings';
import { logUserSignup, logError } from '../services/analytics';
import styles from './styles';
import { apiCall } from '../services/api';


type SignUpScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export default function SignUpScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const theme = useAppSelector(state => state.theme);



  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = STRINGS.FIRST_NAME_REQUIRED;
    }

    if (!lastName.trim()) {
      newErrors.lastName = STRINGS.LAST_NAME_REQUIRED;
    }

    if (!email.trim()) {
      newErrors.email = STRINGS.EMAIL_REQUIRED;
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = STRINGS.EMAIL_INVALID;
    }

    if (!password) {
      newErrors.password = STRINGS.PASSWORD_REQUIRED;
    } else if (password.length < 6) {
      newErrors.password = STRINGS.PASSWORD_MIN_LENGTH;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = STRINGS.CONFIRM_PASSWORD_REQUIRED;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = STRINGS.PASSWORDS_DO_NOT_MATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = Platform.OS === 'android'
        ? 'http://10.0.2.2:5001/api/auth/register'
        : 'http://localhost:5001/api/auth/register';
      const response = await apiCall<any>({
        url: apiUrl,
        method: 'POST',
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;

      if (data.success) {
        logUserSignup('email');
        Alert.alert(
          STRINGS.SUCCESS,
          STRINGS.ACCOUNT_CREATED,
          [
            {
              text: STRINGS.OK,
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert(
          STRINGS.REGISTRATION_FAILED,
          data.message || STRINGS.UNABLE_TO_CREATE_ACCOUNT
        );
      }
    } catch (error) {
      logError(error as any, 'Sign up error');
      Alert.alert(
        STRINGS.ERROR,
        STRINGS.UNABLE_TO_CONNECT
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{STRINGS.CREATE_ACCOUNT}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>{STRINGS.SIGN_UP_TO_GET_STARTED}</Text>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={STRINGS.FIRST_NAME}
              placeholderTextColor={theme.colors.mutedText}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: '' });
                }
              }}
              editable={!loading}
              accessibilityLabel={ACCESSIBILITY_STRINGS.FIRST_NAME_LABEL}
              accessibilityHint={ACCESSIBILITY_STRINGS.FIRST_NAME_HINT}
              returnKeyType="next"
              importantForAccessibility="yes"
            />
            {errors.firstName && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={STRINGS.LAST_NAME}
              placeholderTextColor={theme.colors.mutedText}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: '' });
                }
              }}
              editable={!loading}
              accessibilityLabel={ACCESSIBILITY_STRINGS.LAST_NAME_LABEL}
              accessibilityHint={ACCESSIBILITY_STRINGS.LAST_NAME_HINT}
              returnKeyType="next"
              importantForAccessibility="yes"
            />
            {errors.lastName && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.lastName}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={STRINGS.EMAIL}
              placeholderTextColor={theme.colors.mutedText}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel={ACCESSIBILITY_STRINGS.EMAIL_LABEL}
              accessibilityHint={ACCESSIBILITY_STRINGS.EMAIL_HINT}
              textContentType="emailAddress"
              returnKeyType="next"
              importantForAccessibility="yes"
            />
            {errors.email && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={STRINGS.PASSWORD}
              placeholderTextColor={theme.colors.mutedText}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password && text.length >= 6) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              secureTextEntry={true}
              autoComplete="off"
              textContentType="password"
              editable={!loading}
              accessibilityLabel={ACCESSIBILITY_STRINGS.PASSWORD_LABEL}
              accessibilityHint={ACCESSIBILITY_STRINGS.PASSWORD_HINT}
              returnKeyType="next"
              importantForAccessibility="yes"
            />
            {touched.password && errors.password && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={STRINGS.CONFIRM_PASSWORD}
              placeholderTextColor={theme.colors.mutedText}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword && text === password) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              secureTextEntry={true}
              autoComplete="off"
              textContentType="password"
              editable={!loading}
              accessibilityLabel={ACCESSIBILITY_STRINGS.CONFIRM_PASSWORD_LABEL}
              accessibilityHint={ACCESSIBILITY_STRINGS.CONFIRM_PASSWORD_HINT}
              returnKeyType="done"
              importantForAccessibility="yes"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleSignUp}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={ACCESSIBILITY_STRINGS.CREATE_ACCOUNT_LABEL}
            accessibilityHint={ACCESSIBILITY_STRINGS.CREATE_ACCOUNT_HINT}
            importantForAccessibility="yes"
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} accessibilityLabel={ACCESSIBILITY_STRINGS.LOADING_INDICATOR} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>{STRINGS.CREATE_ACCOUNT}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLinkRow}>
            <Text style={{ color: theme.colors.mutedText }}>
              {STRINGS.ALREADY_HAVE_ACCOUNT}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={ACCESSIBILITY_STRINGS.LOG_IN_LABEL}
              accessibilityHint={ACCESSIBILITY_STRINGS.LOG_IN_HINT}
              importantForAccessibility="yes"
            >
              <Text style={[styles.loginLinkText, { color: theme.colors.primary }]}>
                {STRINGS.LOG_IN}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}