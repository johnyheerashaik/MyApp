import type { Movie } from '../../store/movies/types';

type ModuleType = typeof import('../companionApi');

const apiCallMock = jest.fn();
const trackOperationMock = jest.fn();

const requireWithEnv = (opts: { os: 'android' | 'ios'; dev: boolean }) => {
    jest.resetModules();

    jest.doMock('react-native', () => ({
        Platform: { OS: opts.os },
    }));

    jest.doMock('../api', () => ({
        __esModule: true,
        apiCall: apiCallMock,
    }));

    jest.doMock('../performance', () => ({
        __esModule: true,
        trackOperation: trackOperationMock.mockImplementation(
            async (_name: string, fn: () => Promise<any>) => fn(),
        ),
    }));

    Object.defineProperty(globalThis, '__DEV__', {
        value: opts.dev,
        configurable: true,
    });

    let mod!: ModuleType;
    jest.isolateModules(() => {
        mod = require('../companionApi');
    });

    return mod;
};

describe('companionApi', () => {
    const favorites: Movie[] = [{ id: 1 } as Movie];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('BASE_URL selection', () => {
        it('dev + android uses http://10.0.2.2:4000', async () => {
            const { askCompanion } = requireWithEnv({ os: 'android', dev: true });

            apiCallMock.mockResolvedValueOnce({ data: { answer: 'ok' } });

            await askCompanion('Q', favorites, 'Johny');

            expect(apiCallMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://10.0.2.2:4000/companion',
                }),
            );
        });

        it('dev + ios uses http://localhost:4000', async () => {
            const { askCompanion } = requireWithEnv({ os: 'ios', dev: true });

            apiCallMock.mockResolvedValueOnce({ data: { answer: 'ok' } });

            await askCompanion('Q', favorites, 'Johny');

            expect(apiCallMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://localhost:4000/companion',
                }),
            );
        });

        it('prod (dev=false) uses https://your-production-backend-url.com', async () => {
            const { getMovieDataForAI } = requireWithEnv({ os: 'ios', dev: false });

            apiCallMock.mockResolvedValueOnce({
                data: { popular: [], nowPlaying: [], upcoming: [], topRated: [] },
            });

            await getMovieDataForAI();

            expect(apiCallMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://your-production-backend-url.com/movies/all',
                }),
            );
        });
    });

    describe('askCompanion', () => {
        it('calls trackOperation + posts to /companion and returns answer (userId default guest)', async () => {
            const { askCompanion } = requireWithEnv({ os: 'ios', dev: true });

            apiCallMock.mockResolvedValueOnce({ data: { answer: 'Hello!' } });

            const result = await askCompanion('What to watch?', favorites, 'Johny');

            expect(trackOperationMock).toHaveBeenCalledTimes(1);
            expect(trackOperationMock).toHaveBeenCalledWith(
                'ai_companion_chat',
                expect.any(Function),
            );

            expect(apiCallMock).toHaveBeenCalledTimes(1);
            expect(apiCallMock).toHaveBeenCalledWith({
                url: 'http://localhost:4000/companion',
                method: 'POST',
                data: {
                    question: 'What to watch?',
                    favorites,
                    userName: 'Johny',
                    userId: 'guest',
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            expect(result).toBe('Hello!');
        });

        it('uses provided userId when passed', async () => {
            const { askCompanion } = requireWithEnv({ os: 'android', dev: true });

            apiCallMock.mockResolvedValueOnce({ data: { answer: 'Yo' } });

            await askCompanion('Hi', favorites, 'Johny', 'user-123');

            expect(apiCallMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user-123',
                    }),
                }),
            );
        });

        it('throws when API returns no answer', async () => {
            const { askCompanion } = requireWithEnv({ os: 'ios', dev: true });

            apiCallMock.mockResolvedValueOnce({ data: {} });

            await expect(
                askCompanion('Hi', favorites, 'Johny'),
            ).rejects.toThrow('Companion API failed');
        });
    });

    describe('getMovieDataForAI', () => {
        it('calls trackOperation + GET /movies/all and returns payload', async () => {
            const { getMovieDataForAI } = requireWithEnv({ os: 'android', dev: true });

            const payload = {
                popular: [{ id: 10 } as Movie],
                nowPlaying: [{ id: 20 } as Movie],
                upcoming: [{ id: 30 } as Movie],
                topRated: [{ id: 40 } as Movie],
            };

            apiCallMock.mockResolvedValueOnce({ data: payload });

            const result = await getMovieDataForAI();

            expect(trackOperationMock).toHaveBeenCalledTimes(1);
            expect(trackOperationMock).toHaveBeenCalledWith(
                'getMovieDataForAI',
                expect.any(Function),
            );

            expect(apiCallMock).toHaveBeenCalledWith({
                url: 'http://10.0.2.2:4000/movies/all',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            expect(result).toEqual(payload);
        });

        it('throws when data is falsy', async () => {
            const { getMovieDataForAI } = requireWithEnv({ os: 'ios', dev: true });

            apiCallMock.mockResolvedValueOnce({ data: null });

            await expect(getMovieDataForAI()).rejects.toThrow(
                'Failed to fetch movie data',
            );
        });
    });
});
