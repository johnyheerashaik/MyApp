
const API_URL = 'http://localhost:5001/api/auth';

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
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Register API error:', error);
    throw new Error('Unable to connect to server');
  }
};

export const loginApi = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
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
};
