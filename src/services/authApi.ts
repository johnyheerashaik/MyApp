import { getAuthBaseUrl } from './authBaseUrl';
import { sanitizeEmail } from '../utils/sanitization';
import { apiCall } from './api';



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


export const registerApi = async (data: RegisterData, baseUrl: string = getAuthBaseUrl()): Promise<AuthResponse> => {
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
};

export const loginApi = async (email: string, password: string, baseUrl: string = getAuthBaseUrl()) => {
  const response = await apiCall<AuthResponse>({
    url: `${baseUrl}/login`,
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
