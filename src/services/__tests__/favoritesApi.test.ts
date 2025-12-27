describe('favoritesApi', () => {
    const mockApiCall = jest.fn();

    const requireModuleWithOS = (os: 'android' | 'ios') => {
        jest.resetModules();

        jest.doMock('react-native', () => ({
            Platform: { OS: os },
        }));

        jest.doMock('../api', () => ({
            apiCall: (...args: any[]) => mockApiCall(...args),
        }));

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('../favoritesApi') as typeof import('../favoritesApi');
    };

    beforeEach(() => {
        mockApiCall.mockReset();
    });

    describe('getFavorites', () => {
        it('android: calls correct URL + maps favorites (releaseDate split year)', async () => {
            const { getFavorites } = requireModuleWithOS('android');

            mockApiCall.mockResolvedValueOnce({
                data: {
                    success: true,
                    favorites: [
                        {
                            movieId: 11,
                            title: 'Interstellar',
                            posterPath: '/p.jpg',
                            releaseDate: '2014-11-07',
                            voteAverage: 8.6,
                            overview: 'space',
                            reminderEnabled: true,
                            reminderSent: true,
                        },
                    ],
                },
            });

            const result = await getFavorites('TOKEN', 'http://10.0.2.2:5001/api/favorites');

            expect(mockApiCall).toHaveBeenCalledTimes(1);
            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://10.0.2.2:5001/api/favorites',
                method: 'GET',
                headers: {
                    Authorization: 'Bearer TOKEN',
                    'Content-Type': 'application/json',
                },
            });

            expect(result).toEqual([
                {
                    id: 11,
                    title: 'Interstellar',
                    poster: '/p.jpg',
                    year: '2014',
                    releaseDate: '2014-11-07',
                    rating: 8.6,
                    overview: 'space',
                    reminderEnabled: true,
                    reminderSent: true,
                },
            ]);
        });

        it('ios: uses localhost URL + maps year fallback when releaseDate has no "-"', async () => {
            const { getFavorites } = requireModuleWithOS('ios');

            mockApiCall.mockResolvedValueOnce({
                data: {
                    success: true,
                    favorites: [
                        {
                            movieId: 22,
                            title: 'Old Movie',
                            posterPath: '/x.jpg',
                            releaseDate: '1999',
                            voteAverage: 7.1,
                            overview: 'classic',
                        },
                    ],
                },
            });

            const result = await getFavorites('TOK', 'http://localhost:5001/api/favorites');

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://localhost:5001/api/favorites',
                method: 'GET',
                headers: {
                    Authorization: 'Bearer TOK',
                    'Content-Type': 'application/json',
                },
            });

            expect(result).toEqual([
                {
                    id: 22,
                    title: 'Old Movie',
                    poster: '/x.jpg',
                    year: '1999',
                    releaseDate: '1999',
                    rating: 7.1,
                    overview: 'classic',
                    reminderEnabled: false,
                    reminderSent: false,
                },
            ]);
        });

        it('maps year to "N/A" when releaseDate is missing', async () => {
            const { getFavorites } = requireModuleWithOS('ios');

            mockApiCall.mockResolvedValueOnce({
                data: {
                    success: true,
                    favorites: [
                        {
                            movieId: 33,
                            title: 'Unknown date',
                            posterPath: '/u.jpg',
                            releaseDate: undefined,
                            voteAverage: 5.5,
                            overview: '',
                        },
                    ],
                },
            });

            const result = await getFavorites('T', 'http://localhost:5001/api/favorites');
            expect(result[0].year).toBe('N/A');
        });

        it('throws when success=false and message provided', async () => {
            const { getFavorites } = requireModuleWithOS('android');

            mockApiCall.mockResolvedValueOnce({
                data: { success: false, message: 'Nope' },
            });

            await expect(getFavorites('TOKEN', 'http://10.0.2.2:5001/api/favorites')).rejects.toThrow('Nope');
        });

        it('throws default error when success=false and message missing', async () => {
            const { getFavorites } = requireModuleWithOS('android');

            mockApiCall.mockResolvedValueOnce({
                data: { success: false },
            });

            await expect(getFavorites('TOKEN', 'http://10.0.2.2:5001/api/favorites')).rejects.toThrow('Failed to fetch favorites');
        });
    });

    describe('addFavorite', () => {
        it('POSTs correct payload and succeeds when success=true', async () => {
            const { addFavorite } = requireModuleWithOS('ios');

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            const movie = {
                id: 9,
                title: 'Dune',
                poster: '/d.jpg',
                year: '2021',
                releaseDate: '2021-10-22',
                rating: 8.1,
                overview: 'sand',
                reminderEnabled: false,
                reminderSent: false,
            };

            await addFavorite('TOK', movie as any, 'http://localhost:5001/api/favorites');

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://localhost:5001/api/favorites',
                method: 'POST',
                headers: {
                    Authorization: 'Bearer TOK',
                    'Content-Type': 'application/json',
                },
                data: {
                    movieId: 9,
                    title: 'Dune',
                    posterPath: '/d.jpg',
                    releaseDate: '2021-10-22',
                    voteAverage: 8.1,
                    overview: 'sand',
                },
            });
        });

        it('POST uses movie.year if movie.releaseDate is missing + overview default', async () => {
            const { addFavorite } = requireModuleWithOS('ios');

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            const movie = {
                id: 10,
                title: 'No Date',
                poster: '/n.jpg',
                year: '2000',
                releaseDate: undefined,
                rating: 6.0,
                overview: undefined,
            };

            await addFavorite('TOK', movie as any, 'http://localhost:5001/api/favorites');

            expect(mockApiCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        releaseDate: '2000',
                        overview: '',
                    }),
                }),
            );
        });

        it('throws message when success=false', async () => {
            const { addFavorite } = requireModuleWithOS('android');

            mockApiCall.mockResolvedValueOnce({ data: { success: false, message: 'bad add' } });

            await expect(addFavorite('T', { id: 1, title: 'x' } as any, 'http://10.0.2.2:5001/api/favorites')).rejects.toThrow('bad add');
        });

        it('throws default when success=false and message missing', async () => {
            const { addFavorite } = requireModuleWithOS('android');

            mockApiCall.mockResolvedValueOnce({ data: { success: false } });

            await expect(addFavorite('T', { id: 1, title: 'x' } as any, 'http://10.0.2.2:5001/api/favorites')).rejects.toThrow(
                'Failed to add favorite',
            );
        });
    });

    describe('removeFavorite', () => {
        it('DELETEs correct URL and succeeds when success=true', async () => {
            const { removeFavorite } = requireModuleWithOS('android');

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await removeFavorite('TOK', 777, 'http://10.0.2.2:5001/api/favorites');

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://10.0.2.2:5001/api/favorites/777',
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer TOK',
                    'Content-Type': 'application/json',
                },
            });
        });

        it('throws message when success=false', async () => {
            const { removeFavorite } = requireModuleWithOS('ios');

            mockApiCall.mockResolvedValueOnce({ data: { success: false, message: 'bad remove' } });

            await expect(removeFavorite('TOK', 1, 'http://localhost:5001/api/favorites')).rejects.toThrow('bad remove');
        });

        it('throws default when success=false and message missing', async () => {
            const { removeFavorite } = requireModuleWithOS('ios');

            mockApiCall.mockResolvedValueOnce({ data: { success: false } });

            await expect(removeFavorite('TOK', 1, 'http://localhost:5001/api/favorites')).rejects.toThrow('Failed to remove favorite');
        });
    });
});
