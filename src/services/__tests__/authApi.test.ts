import type { AuthResponse } from '../authApi';

type AuthApiModule = typeof import('../authApi');

const apiCallMock = jest.fn();
const sanitizeEmailMock = jest.fn();

const requireAuthApiWithPlatform = (os: 'android' | 'ios'): AuthApiModule => {
    jest.resetModules();

    jest.doMock('react-native', () => ({
        Platform: { OS: os },
    }));

    jest.doMock('../api', () => ({
        __esModule: true,
        apiCall: apiCallMock,
    }));

    jest.doMock('../../utils/sanitization', () => ({
        __esModule: true,
        sanitizeEmail: sanitizeEmailMock,
    }));

    let mod!: AuthApiModule;

    jest.isolateModules(() => {
        mod = require('../authApi');
    });

    return mod;
};

describe('authApi.ts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerApi', () => {
        it('android: uses 10.0.2.2 base url and sends sanitized email', async () => {
            sanitizeEmailMock.mockReturnValue('sanitized@test.com');

            apiCallMock.mockResolvedValueOnce({
                data: { success: true, message: 'ok' } satisfies AuthResponse,
            });

            const { registerApi } = requireAuthApiWithPlatform('android');

            const input = {
                firstName: 'John',
                lastName: 'Doe',
                email: '  JOHN@TEST.COM ',
                password: 'pass123',
            };

            const result = await registerApi(input, 'http://10.0.2.2:5001/api/auth');

            expect(sanitizeEmailMock).toHaveBeenCalledWith(input.email);
            expect(apiCallMock).toHaveBeenCalledWith({
                url: 'http://10.0.2.2:5001/api/auth/register',
                method: 'POST',
                data: { ...input, email: 'sanitized@test.com' },
            });
            expect(result).toEqual({ success: true, message: 'ok' });
        });

        it('ios: uses localhost base url and sends sanitized email', async () => {
            sanitizeEmailMock.mockReturnValue('x@y.com');

            apiCallMock.mockResolvedValueOnce({
                data: { success: true, message: 'registered' } satisfies AuthResponse,
            });

            const { registerApi } = requireAuthApiWithPlatform('ios');

            const input = {
                firstName: 'A',
                lastName: 'B',
                email: 'X@Y.COM',
                password: 'pw',
            };

            const result = await registerApi(input, 'http://localhost:5001/api/auth');

            expect(apiCallMock).toHaveBeenCalledWith({
                url: 'http://localhost:5001/api/auth/register',
                method: 'POST',
                data: { ...input, email: 'x@y.com' },
            });
            expect(result).toEqual({ success: true, message: 'registered' });
        });
    });

    describe('loginApi', () => {
        it('android: success=true returns token + mapped user', async () => {
            apiCallMock.mockResolvedValueOnce({
                data: {
                    success: true,
                    message: 'ok',
                    token: 'token-123',
                    user: {
                        id: 'u1',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        email: 'jane@test.com',
                        createdAt: '2020-01-01',
                    },
                } satisfies AuthResponse,
            });

            const { loginApi } = requireAuthApiWithPlatform('android');

            const result = await loginApi('  jane@test.com  ', 'pw', 'http://10.0.2.2:5001/api/auth');

            expect(apiCallMock).toHaveBeenCalledWith({
                url: 'http://10.0.2.2:5001/api/auth/login',
                method: 'POST',
                data: { email: '  jane@test.com  ', password: 'pw' },
            });

            expect(result).toEqual({
                token: 'token-123',
                user: { id: 'u1', name: 'Jane Smith', email: 'jane@test.com' },
            });
        });

        it('ios: success=false throws server message when provided', async () => {
            apiCallMock.mockResolvedValueOnce({
                data: { success: false, message: 'Invalid credentials' } satisfies AuthResponse,
            });

            const { loginApi } = requireAuthApiWithPlatform('ios');

            await expect(loginApi('a@b.com', 'bad', 'http://localhost:5001/api/auth')).rejects.toThrow('Invalid credentials');

            expect(apiCallMock).toHaveBeenCalledWith({
                url: 'http://localhost:5001/api/auth/login',
                method: 'POST',
                data: { email: 'a@b.com', password: 'bad' },
            });
        });

        it('ios: success=false throws default message when message is empty string', async () => {
            apiCallMock.mockResolvedValueOnce({
                data: { success: false, message: '' } satisfies AuthResponse,
            });

            const { loginApi } = requireAuthApiWithPlatform('ios');

            await expect(loginApi('a@b.com', 'bad', 'http://localhost:5001/api/auth')).rejects.toThrow(
                'Invalid email or password',
            );
        });

        it('ios: success=false throws default message when message is missing/undefined', async () => {
            apiCallMock.mockResolvedValueOnce({
                data: { success: false } as AuthResponse,
            });

            const { loginApi } = requireAuthApiWithPlatform('ios');

            await expect(loginApi('a@b.com', 'bad', 'http://localhost:5001/api/auth')).rejects.toThrow(
                'Invalid email or password',
            );
        });
    });
});
