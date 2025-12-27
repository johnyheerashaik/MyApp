import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../rtkHooks';

import {
    fetchMoviesByCollection,
    fetchMoviesByKeyword,
    fetchMovieDetails,
    fetchPopularMovies,
    fetchNowPlayingMovies,
    fetchUpcomingMovies,
    fetchTopRatedMovies,
} from './moviesSlice';

import {
    selectPopularMovies,
    selectNowPlayingMovies,
    selectUpcomingMovies,
    selectTopRatedMovies,
    selectMovieDetails,
    selectMoviesLoading,
    selectMoviesError,
} from './selectors';


export const useMoviesSelectors = () => {
    const popular = useAppSelector(selectPopularMovies);
    const nowPlaying = useAppSelector(selectNowPlayingMovies);
    const upcoming = useAppSelector(selectUpcomingMovies);
    const topRated = useAppSelector(selectTopRatedMovies);
    const movieDetails = useAppSelector(selectMovieDetails);
    const loading = useAppSelector(selectMoviesLoading);
    const error = useAppSelector(selectMoviesError);

    return {
        popular,
        nowPlaying,
        upcoming,
        topRated,
        movieDetails,
        loading,
        error,
    };
};

export const useMoviesActions = () => {
    const dispatch = useAppDispatch();

    const fetchByCollection = useCallback(
        (collectionId: number) => {
            dispatch(fetchMoviesByCollection(collectionId));
        },
        [dispatch],
    );

    const fetchByKeyword = useCallback(
        (keywordId: number) => {
            dispatch(fetchMoviesByKeyword(keywordId));
        },
        [dispatch],
    );

    const fetchDetails = useCallback(
        (movieId: number) => {
            dispatch(fetchMovieDetails(movieId));
        },
        [dispatch],
    );

    const fetchPopularMoviesAction = useCallback(() => {
        dispatch(fetchPopularMovies());
    }, [dispatch]);

    const fetchNowPlayingMoviesAction = useCallback(() => {
        dispatch(fetchNowPlayingMovies());
    }, [dispatch]);

    const fetchUpcomingMoviesAction = useCallback(() => {
        dispatch(fetchUpcomingMovies());
    }, [dispatch]);

    const fetchTopRatedMoviesAction = useCallback(() => {
        dispatch(fetchTopRatedMovies());
    }, [dispatch]);

    return {
        fetchByCollection,
        fetchByKeyword,
        fetchDetails,
        fetchPopularMovies: fetchPopularMoviesAction,
        fetchNowPlayingMovies: fetchNowPlayingMoviesAction,
        fetchUpcomingMovies: fetchUpcomingMoviesAction,
        fetchTopRatedMovies: fetchTopRatedMoviesAction,
    };
};
