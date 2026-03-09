import * as Sentry from '@sentry/react-native';
import { getAuthBaseUrl } from './authBaseUrl';
import { sanitizeEmail } from '../utils/sanitization';
import { apiCall } from './api';
import { AxiosError } from 'axios';

let onAuthFailureCallback: (() => void) | null = null;

export const setAuthFailureHandler = (callback: () => void) => {
  onAuthFailureCallback = callback;
};

export const clearAuthFailureHandler = () => {
  onAuthFailureCallback = null;
};

export async function authApiCall<T = any>(config: any): Promise<T> {
  try {
    const response = await apiCall<T>(config);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;

    if (status === 401 || status === 403) {
      const errorMessage = axiosError.response?.data?.message || '';
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
        console.log('🔐 [AuthAPI] Token expired or invalid, logging out user automatically...');
        if (onAuthFailureCallback) {
          setTimeout(() => {
            onAuthFailureCallback?.();
          }, 100);
        }
      }
    }
    throw error;
  }
}



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


export const registerApi = async (
  data: RegisterData,
  baseUrl: string = getAuthBaseUrl()
): Promise<AuthResponse> => {
  try {
    const sanitizedData = {
      ...data,
      email: sanitizeEmail(data.email),
    };
    const response = await apiCall<AuthResponse>({
      url: `${baseUrl}/register`,
      method: 'POST',
      data: sanitizedData,
    });
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

export const loginApi = async (email: string, password: string, baseUrl: string = getAuthBaseUrl()) => {
  const response = await apiCall<AuthResponse>({
    url: `${baseUrl}/login`,
    method: 'POST',
    data: { email, password },
  });
  const result = response.data;
  if (!result.success) {
    Sentry.captureException(new Error(result.message || 'Invalid email or password'));
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
