import * as Keychain from 'react-native-keychain';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

export const secureStore = async (key: string, value: string): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    });
    return true;
  } catch (error) {
    console.error(`Failed to store ${key}:`, error);
    return false;
  }
};

export const secureRetrieve = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`Failed to retrieve ${key}:`, error);
    return null;
  }
};

export const secureRemove = async (key: string): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({ service: key });
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
    return false;
  }
};

export const storeAuthToken = async (token: string): Promise<boolean> => {
  return secureStore(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return secureRetrieve(STORAGE_KEYS.AUTH_TOKEN);
};

export const storeUserData = async (userData: object): Promise<boolean> => {
  return secureStore(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
};

export const getUserData = async (): Promise<any | null> => {
  const data = await secureRetrieve(STORAGE_KEYS.USER_DATA);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  return null;
};

export const clearAuthData = async (): Promise<void> => {
  await secureRemove(STORAGE_KEYS.AUTH_TOKEN);
  await secureRemove(STORAGE_KEYS.USER_DATA);
};

