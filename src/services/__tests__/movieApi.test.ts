import {
    fetchMoviesFromEndpoint,
    getPopularMovies,
    getNowPlayingMovies,
    getUpcomingMovies,
    getTopRatedMovies,
    searchMovies,
    getMoviesByCollection,
    getMoviesByKeyword,
    getAllMoviesData,
    getMovieDetails,
    getMovieTrailer,
    getMovieWatchProviders,
} from '../movieApi';

import { tmdbFetch } from '../tmdbClient';
import { trackOperation } from '../performance';

jest.mock('../tmdbClient', () => ({
    tmdbFetch: jest.fn(),
}));

jest.mock('../performance', () => ({
    trackOperation: jest.fn((_name: string, fn: any) => fn()),
}));

const mockTmdbFetch = tmdbFetch as jest.Mock;
const mockTrackOperation = trackOperation as jest.Mock;

const makeMovie = (overrides: Partial<any> = {}) => ({
    id: 1,
    title: 'Movie 1',
    release_date: '2024-06-10',
    vote_average: 7.8,
    poster_path: '/p.png',
    genre_ids: [10, 20],
    overview: 'hello',
    ...overrides,
});

describe('movieApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore?.();
    });

    describe('fetchMoviesFromEndpoint', () => {
        it('appends language=en-US, calls tmdbFetch, maps results', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: { results: [makeMovie(), makeMovie({ id: 2, poster_path: null, release_date: null })] },
            });

            const res = await fetchMoviesFromEndpoint('/movie/popular');

            expect(mockTrackOperation).toHaveBeenCalledWith(
                'fetchMoviesFromEndpoint',
                expect.any(Function),
            );

            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/popular?language=en-US');

            expect(res).toEqual([
                {
                    id: 1,
                    title: 'Movie 1',
                    year: '2024',
                    releaseDate: '2024-06-10',
                    rating: 7.8,
                    poster: 'https://image.tmdb.org/t/p/w500/p.png',
                    genres: [10, 20],
                    overview: 'hello',
                },
                {
                    id: 2,
                    title: 'Movie 1',
                    year: 'N/A',
                    releaseDate: null,
                    rating: 7.8,
                    poster: null,
                    genres: [10, 20],
                    overview: 'hello',
                },
            ]);
        });

        it('returns empty array when results missing', async () => {
            mockTmdbFetch.mockResolvedValueOnce({ data: {} });
            const res = await fetchMoviesFromEndpoint('/movie/popular');
            expect(res).toEqual([]);
        });
    });

    describe('endpoint wrappers', () => {
        it('getPopularMovies calls fetchMoviesFromEndpoint via tmdbFetch with correct endpoint', async () => {
            mockTmdbFetch.mockResolvedValueOnce({ data: { results: [] } });
            await getPopularMovies();
            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/popular?language=en-US');
        });

        it('getNowPlayingMovies calls correct endpoint', async () => {
            mockTmdbFetch.mockResolvedValueOnce({ data: { results: [] } });
            await getNowPlayingMovies();
            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/now_playing?language=en-US');
        });

        it('getUpcomingMovies calls correct endpoint', async () => {
            mockTmdbFetch.mockResolvedValueOnce({ data: { results: [] } });
            await getUpcomingMovies();
            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/upcoming?language=en-US');
        });

        it('getTopRatedMovies calls correct endpoint', async () => {
            mockTmdbFetch.mockResolvedValueOnce({ data: { results: [] } });
            await getTopRatedMovies();
            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/top_rated?language=en-US');
        });
    });

    describe('searchMovies', () => {
        it('returns [] immediately when query is empty/whitespace', async () => {
            const res = await searchMovies('   ');
            expect(res).toEqual([]);
            expect(mockTmdbFetch).not.toHaveBeenCalled();
        });

        it('encodes query, limits to 5, maps results', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: {
                    results: [
                        makeMovie({ id: 1 }),
                        makeMovie({ id: 2 }),
                        makeMovie({ id: 3 }),
                        makeMovie({ id: 4 }),
                        makeMovie({ id: 5 }),
                        makeMovie({ id: 6 }),
                    ],
                },
            });

            const res = await searchMovies('bat man');

            expect(mockTrackOperation).toHaveBeenCalledWith('searchMovies', expect.any(Function));
            expect(mockTmdbFetch).toHaveBeenCalledWith(
                `/search/movie?query=${encodeURIComponent('bat man')}&language=en-US&page=1&include_adult=false`,
            );

            expect(res).toHaveLength(5);
            expect(res[0].id).toBe(1);
            expect(res[4].id).toBe(5);
        });
    });

    describe('getMoviesByCollection', () => {
        it('returns mapped parts when success', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: { parts: [makeMovie({ id: 11 }), makeMovie({ id: 12, overview: null })] },
            });

            const res = await getMoviesByCollection(123);

            expect(mockTrackOperation).toHaveBeenCalledWith('getMoviesByCollection', expect.any(Function));
            expect(mockTmdbFetch).toHaveBeenCalledWith('/collection/123?language=en-US');
            expect(res[0].id).toBe(11);
            expect(res[1].overview).toBe('');
        });

        it('returns [] when tmdbFetch throws', async () => {
            mockTmdbFetch.mockRejectedValueOnce(new Error('nope'));

            const res = await getMoviesByCollection(999);

            expect(res).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getMoviesByKeyword', () => {
        it('returns mapped results when success', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: { results: [makeMovie({ id: 21, poster_path: null })] },
            });

            const res = await getMoviesByKeyword(555);

            expect(mockTmdbFetch).toHaveBeenCalledWith(
                '/discover/movie?with_keywords=555&sort_by=popularity.desc&language=en-US&page=1',
            );
            expect(res).toHaveLength(1);
            expect(res[0]).toMatchObject({ id: 21, poster: null });
        });

        it('returns [] when tmdbFetch throws', async () => {
            mockTmdbFetch.mockRejectedValueOnce(new Error('fail'));
            const res = await getMoviesByKeyword(1);
            expect(res).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getAllMoviesData', () => {
        it('calls 4 endpoints and returns all buckets', async () => {
            mockTmdbFetch
                .mockResolvedValueOnce({ data: { results: [makeMovie({ id: 1 })] } }) // popular
                .mockResolvedValueOnce({ data: { results: [makeMovie({ id: 2 })] } }) // now playing
                .mockResolvedValueOnce({ data: { results: [makeMovie({ id: 3 })] } }) // upcoming
                .mockResolvedValueOnce({ data: { results: [makeMovie({ id: 4 })] } }); // top rated

            const res = await getAllMoviesData();

            expect(res.popular[0].id).toBe(1);
            expect(res.nowPlaying[0].id).toBe(2);
            expect(res.upcoming[0].id).toBe(3);
            expect(res.topRated[0].id).toBe(4);

            expect(mockTmdbFetch).toHaveBeenNthCalledWith(1, '/movie/popular?language=en-US');
            expect(mockTmdbFetch).toHaveBeenNthCalledWith(2, '/movie/now_playing?language=en-US');
            expect(mockTmdbFetch).toHaveBeenNthCalledWith(3, '/movie/upcoming?language=en-US');
            expect(mockTmdbFetch).toHaveBeenNthCalledWith(4, '/movie/top_rated?language=en-US');
        });
    });

    describe('getMovieDetails', () => {
        it('maps details, genres, poster/backdrop, and slices cast to 10', async () => {
            const cast = Array.from({ length: 12 }).map((_, i) => ({
                id: i + 1,
                name: `Actor ${i + 1}`,
                character: `Char ${i + 1}`,
                profile_path: i % 2 === 0 ? `/c${i}.png` : null,
            }));

            mockTmdbFetch.mockResolvedValueOnce({
                data: {
                    id: 9,
                    title: 'Details',
                    overview: 'OV',
                    release_date: '2020-01-01',
                    vote_average: 8.1,
                    runtime: 120,
                    genres: [{ name: 'Action' }, { name: 'Drama' }],
                    poster_path: '/pp.png',
                    backdrop_path: '/bb.png',
                    credits: { cast },
                },
            });

            const res = await getMovieDetails(9);

            expect(mockTmdbFetch).toHaveBeenCalledWith(
                '/movie/9?append_to_response=credits&language=en-US',
            );

            expect(res).toMatchObject({
                id: 9,
                title: 'Details',
                overview: 'OV',
                year: '2020',
                releaseDate: '2020-01-01',
                rating: 8.1,
                runtime: 120,
                genres: ['Action', 'Drama'],
                poster: 'https://image.tmdb.org/t/p/w500/pp.png',
                backdrop: 'https://image.tmdb.org/t/p/w780/bb.png',
            });

            expect(res.cast).toHaveLength(10);
            expect(res.cast[0]).toEqual({
                id: 1,
                name: 'Actor 1',
                character: 'Char 1',
                profilePath: 'https://image.tmdb.org/t/p/w185/c0.png',
            });
            expect(res.cast[1].profilePath).toBeNull();
        });
    });

    describe('getMovieTrailer', () => {
        it('returns trailer key when Trailer + YouTube exists', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: {
                    results: [
                        { type: 'Teaser', site: 'YouTube', key: 'x' },
                        { type: 'Trailer', site: 'YouTube', key: 'TRAILER_KEY' },
                    ],
                },
            });

            const res = await getMovieTrailer(1);

            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/1/videos?language=en-US');
            expect(res).toBe('TRAILER_KEY');
        });

        it('returns null when no matching trailer found', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: { results: [{ type: 'Trailer', site: 'Vimeo', key: 'no' }] },
            });

            const res = await getMovieTrailer(2);
            expect(res).toBeNull();
        });

        it('returns null when tmdbFetch throws', async () => {
            mockTmdbFetch.mockRejectedValueOnce(new Error('boom'));
            const res = await getMovieTrailer(3);
            expect(res).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getMovieWatchProviders', () => {
        it('returns null when US providers missing', async () => {
            mockTmdbFetch.mockResolvedValueOnce({ data: { results: {} } });
            const res = await getMovieWatchProviders(1);
            expect(res).toBeNull();
        });

        it('maps providers and link (and allows null link)', async () => {
            mockTmdbFetch.mockResolvedValueOnce({
                data: {
                    results: {
                        US: {
                            flatrate: [{ provider_id: 1, provider_name: 'Netflix', logo_path: '/l.png', display_priority: 1 }],
                            rent: [{ provider_id: 2, provider_name: 'Apple', logo_path: '/a.png', display_priority: 2 }],
                            buy: [],
                            link: undefined,
                        },
                    },
                },
            });

            const res = await getMovieWatchProviders(10);

            expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/10/watch/providers');
            expect(res).toEqual({
                flatrate: [{ provider_id: 1, provider_name: 'Netflix', logo_path: '/l.png', display_priority: 1 }],
                rent: [{ provider_id: 2, provider_name: 'Apple', logo_path: '/a.png', display_priority: 2 }],
                buy: [],
                link: null,
            });
        });

        it('returns null when tmdbFetch throws', async () => {
            mockTmdbFetch.mockRejectedValueOnce(new Error('no'));
            const res = await getMovieWatchProviders(99);
            expect(res).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });
});
