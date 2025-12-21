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
import { useTheme } from '../theme/ThemeContext';
import { APP_STRINGS } from '../constants';
import { logUserSignup, logError } from '../services/analytics';
import styles from '../login/styles';
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
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
          'Success!',
          'Account created successfully. Please login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          data.message || 'Unable to create account. Please try again.'
        );
      }
    } catch (error) {
      logError(error as any, 'Sign up error');
      Alert.alert(
        'Error',
        'Unable to connect to server. Please check your connection.'
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>Sign up to get started</Text>

          {/* First Name */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder="First name"
              placeholderTextColor={theme.colors.mutedText}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: '' });
                }
              }}
              autoCapitalize="words"
              editable={!loading}
            />
            {errors.firstName && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder="Last name"
              placeholderTextColor={theme.colors.mutedText}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: '' });
                }
              }}
              autoCapitalize="words"
              editable={!loading}
            />
            {errors.lastName && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.lastName}</Text>
            )}
          </View>

          {/* Email */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={APP_STRINGS.EMAIL}
              placeholderTextColor={theme.colors.mutedText}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder={APP_STRINGS.PASSWORD}
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
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              editable={!loading}
            />
            {touched.password && errors.password && (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.mutedText, color: theme.colors.text, backgroundColor: theme.colors.card }]}
              placeholder="Confirm password"
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
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              editable={!loading}
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
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.mutedText }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}