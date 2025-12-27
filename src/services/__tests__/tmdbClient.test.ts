describe('tmdbFetch', () => {
    const mockApiCall = jest.fn();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

    const loadModule = async (token: string | undefined) => {
        jest.resetModules();
        mockApiCall.mockReset();
        warnSpy.mockClear();

        jest.doMock('react-native-config', () => ({
            __esModule: true,
            default: { TMDB_API_TOKEN: token },
        }));

        jest.doMock('../api', () => ({
            apiCall: (...args: any[]) => mockApiCall(...args),
        }));

        jest.doMock('../tmdbBaseUrl', () => ({
            getTmdbBaseUrl: () => 'https://api.themoviedb.org/3',
        }));

        return require('../tmdbClient') as typeof import('../tmdbClient');
    };

    afterAll(() => {
        warnSpy.mockRestore();
    });

    it('warns if TMDB_API_TOKEN is missing/empty', async () => {
        await loadModule(''); // empty token should trigger warning at module load
        expect(warnSpy).toHaveBeenCalledWith(
            '⚠️ TMDB_API_TOKEN not configured. Check your .env file.',
        );
    });

    it('calls apiCall with default baseUrl and Bearer token + returns data', async () => {
        const { tmdbFetch } = await loadModule('abc123');

        const fakeResponse = { data: { results: [1, 2, 3] } };
        mockApiCall.mockResolvedValueOnce(fakeResponse);

        const res = await tmdbFetch('/movie/popular');

        expect(mockApiCall).toHaveBeenCalledTimes(1);
        expect(mockApiCall).toHaveBeenCalledWith({
            url: 'https://api.themoviedb.org/3/movie/popular',
            method: 'GET',
            headers: {
                Authorization: 'Bearer abc123',
                'Content-Type': 'application/json;charset=utf-8',
            },
        });

        expect(res).toBe(fakeResponse);
    });

    it('uses provided baseUrl when passed', async () => {
        const { tmdbFetch } = await loadModule('token-x');

        const fakeResponse = { data: { ok: true } };
        mockApiCall.mockResolvedValueOnce(fakeResponse);

        await tmdbFetch('/search/movie?query=batman', 'http://custom-base');

        expect(mockApiCall).toHaveBeenCalledWith({
            url: 'http://custom-base/search/movie?query=batman',
            method: 'GET',
            headers: {
                Authorization: 'Bearer token-x',
                'Content-Type': 'application/json;charset=utf-8',
            },
        });
    });

    it('throws "TMDB API failed" when apiCall resolves to null/undefined', async () => {
        const { tmdbFetch } = await loadModule('abc123');

        mockApiCall.mockResolvedValueOnce(undefined);

        await expect(tmdbFetch('/movie/1')).rejects.toThrow('TMDB API failed');
    });
});
