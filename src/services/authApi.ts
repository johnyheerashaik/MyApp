import { Platform } from 'react-native';
import {sanitizeEmail} from '../utils/sanitization';
import {trackOperation, perfFetch} from './performance';

const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001/api/auth'
    : 'http://localhost:5001/api/auth';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  errors?: Array<{ msg: string; param: string }>;
}

export const registerApi = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const sanitizedData = {
      ...data,
      email: sanitizeEmail(data.email),
    };
    
    const response = await perfFetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Register API error:', error);
    throw new Error('Unable to connect to server');
  }
};

export const loginApi = async (email: string, password: string) => {
  return trackOperation('user_login_api', async () => {
    try {
      const response = await perfFetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: AuthResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Invalid email or password');
      }

      return {
        token: result.token!,
        user: {
          id: result.user!.id,
          name: `${result.user!.firstName} ${result.user!.lastName}`,
          email: result.user!.email,
        },
      };
    } catch (error) {
      console.error('Login API error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to connect to server');
    }
  });
};
