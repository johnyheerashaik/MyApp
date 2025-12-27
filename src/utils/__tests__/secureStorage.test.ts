/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Keychain from 'react-native-keychain';

import {
    secureStore,
    secureRetrieve,
    secureRemove,
    storeAuthToken,
    getAuthToken,
    storeUserData,
    getUserData,
    clearAuthData,
} from '../secureStorage';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(),
    resetGenericPassword: jest.fn(),
    ACCESSIBLE: {
        AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    },
}));

describe('secureStorage', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('secureStore', () => {
        it('returns true when Keychain.setGenericPassword succeeds', async () => {
            (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

            const ok = await secureStore('some_key', 'some_value');

            expect(ok).toBe(true);
            expect(Keychain.setGenericPassword).toHaveBeenCalledWith('some_key', 'some_value', {
                service: 'some_key',
                accessible: (Keychain as any).ACCESSIBLE.AFTER_FIRST_UNLOCK,
            });
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('returns false when Keychain.setGenericPassword throws', async () => {
            (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            const ok = await secureStore('k', 'v');

            expect(ok).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('secureRetrieve', () => {
        it('returns password when credentials exist', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
                username: 'k',
                password: 'secret',
            });

            const value = await secureRetrieve('k');

            expect(value).toBe('secret');
            expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: 'k' });
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('returns null when credentials are null/falsey', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

            const value = await secureRetrieve('k');

            expect(value).toBeNull();
            expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: 'k' });
        });

        it('returns null when Keychain.getGenericPassword throws', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('boom'));

            const value = await secureRetrieve('k');

            expect(value).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('secureRemove', () => {
        it('returns true when Keychain.resetGenericPassword succeeds', async () => {
            (Keychain.resetGenericPassword as jest.Mock).mockResolvedValueOnce(true);

            const ok = await secureRemove('k');

            expect(ok).toBe(true);
            expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({ service: 'k' });
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('returns false when Keychain.resetGenericPassword throws', async () => {
            (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            const ok = await secureRemove('k');

            expect(ok).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('storeAuthToken / getAuthToken', () => {
        it('storeAuthToken delegates to secureStore with auth_token', async () => {
            (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

            const ok = await storeAuthToken('tok');

            expect(ok).toBe(true);
            expect(Keychain.setGenericPassword).toHaveBeenCalledWith('auth_token', 'tok', {
                service: 'auth_token',
                accessible: (Keychain as any).ACCESSIBLE.AFTER_FIRST_UNLOCK,
            });
        });

        it('getAuthToken delegates to secureRetrieve with auth_token', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
                username: 'auth_token',
                password: 'tok',
            });

            const tok = await getAuthToken();

            expect(tok).toBe('tok');
            expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: 'auth_token' });
        });
    });

    describe('storeUserData / getUserData', () => {
        it('storeUserData stringifies and stores user_data', async () => {
            (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

            const ok = await storeUserData({ id: 1, name: 'A' });

            expect(ok).toBe(true);
            expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
                'user_data',
                JSON.stringify({ id: 1, name: 'A' }),
                {
                    service: 'user_data',
                    accessible: (Keychain as any).ACCESSIBLE.AFTER_FIRST_UNLOCK,
                },
            );
        });

        it('getUserData returns parsed JSON when stored', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
                username: 'user_data',
                password: JSON.stringify({ id: 2 }),
            });

            const data = await getUserData();

            expect(data).toEqual({ id: 2 });
        });

        it('getUserData returns null when nothing stored', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

            const data = await getUserData();

            expect(data).toBeNull();
        });

        it('getUserData returns null when JSON.parse fails', async () => {
            (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
                username: 'user_data',
                password: '{bad json',
            });

            const data = await getUserData();

            expect(data).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to parse user data:',
                expect.any(Error),
            );
        });
    });

    describe('clearAuthData', () => {
        it('removes both auth_token and user_data', async () => {
            (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

            await clearAuthData();

            expect(Keychain.resetGenericPassword).toHaveBeenNthCalledWith(1, { service: 'auth_token' });
            expect(Keychain.resetGenericPassword).toHaveBeenNthCalledWith(2, { service: 'user_data' });
        });
    });
});
