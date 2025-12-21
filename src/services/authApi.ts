import { Platform } from 'react-native';
import {sanitizeEmail} from '../utils/sanitization';
import {apiCall} from './api';

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
  const sanitizedData = {
    ...data,
    email: sanitizeEmail(data.email),
  };
  const response = await apiCall<AuthResponse>({
    url: `${API_URL}/register`,
    method: 'POST',
    data: sanitizedData,
  });
  return response.data;
};

export const loginApi = async (email: string, password: string) => {
  const response = await apiCall<AuthResponse>({
    url: `${API_URL}/login`,
    method: 'POST',
    data: { email, password },
  });
  const result = response.data;
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
};
