import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';

import { useMoviesSelectors, useMoviesActions } from '../hooks';

import {
  fetchMoviesByCollection,
  fetchMoviesByKeyword,
  fetchMovieDetails,
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
} from '../moviesSlice';

import {
  selectPopularMovies,
  selectNowPlayingMovies,
  selectUpcomingMovies,
  selectTopRatedMovies,
  selectMovieDetails,
  selectMoviesLoading,
  selectMoviesError,
} from '../selectors';

jest.mock('../selectors', () => ({
  __esModule: true,
  selectPopularMovies: jest.fn(),
  selectNowPlayingMovies: jest.fn(),
  selectUpcomingMovies: jest.fn(),
  selectTopRatedMovies: jest.fn(),
  selectMovieDetails: jest.fn(),
  selectMoviesLoading: jest.fn(),
  selectMoviesError: jest.fn(),
}));

jest.mock('../moviesSlice', () => ({
  __esModule: true,
  fetchMoviesByCollection: jest.fn((collectionId: number) => ({
    type: 'movies/fetchByCollection',
    payload: collectionId,
  })),
  fetchMoviesByKeyword: jest.fn((keywordId: number) => ({
    type: 'movies/fetchByKeyword',
    payload: keywordId,
  })),
  fetchMovieDetails: jest.fn((movieId: number) => ({
    type: 'movies/fetchDetails',
    payload: movieId,
  })),
  fetchPopularMovies: jest.fn(() => ({ type: 'movies/fetchPopular' })),
  fetchNowPlayingMovies: jest.fn(() => ({ type: 'movies/fetchNowPlaying' })),
  fetchUpcomingMovies: jest.fn(() => ({ type: 'movies/fetchUpcoming' })),
  fetchTopRatedMovies: jest.fn(() => ({ type: 'movies/fetchTopRated' })),
}));

const moviesReducer = (state = {}) => state;

const makeStore = () =>
  configureStore({
    reducer: { movies: moviesReducer },
    preloadedState: {
      movies: {},
    },
  });

const makeWrapper =
  (store: ReturnType<typeof makeStore>) =>
    ({ children }: { children: React.ReactNode }) =>
      <Provider store={store}>{children}</Provider>;

describe('movies hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useMoviesSelectors should return values from selectors', () => {
    (selectPopularMovies as jest.Mock).mockReturnValue([{ id: 1 }]);
    (selectNowPlayingMovies as jest.Mock).mockReturnValue([{ id: 2 }]);
    (selectUpcomingMovies as jest.Mock).mockReturnValue([{ id: 3 }]);
    (selectTopRatedMovies as jest.Mock).mockReturnValue([{ id: 4 }]);
    (selectMovieDetails as jest.Mock).mockReturnValue({ 1: { id: 1, title: 'X' } });
    (selectMoviesLoading as jest.Mock).mockReturnValue(false);
    (selectMoviesError as jest.Mock).mockReturnValue(null);

    const store = makeStore();

    const { result } = renderHook(() => useMoviesSelectors(), {
      wrapper: makeWrapper(store),
    });

    expect(result.current.popular).toEqual([{ id: 1 }]);
    expect(result.current.nowPlaying).toEqual([{ id: 2 }]);
    expect(result.current.upcoming).toEqual([{ id: 3 }]);
    expect(result.current.topRated).toEqual([{ id: 4 }]);
    expect(result.current.movieDetails).toEqual({ 1: { id: 1, title: 'X' } });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(selectPopularMovies).toHaveBeenCalled();
    expect(selectNowPlayingMovies).toHaveBeenCalled();
    expect(selectUpcomingMovies).toHaveBeenCalled();
    expect(selectTopRatedMovies).toHaveBeenCalled();
    expect(selectMovieDetails).toHaveBeenCalled();
    expect(selectMoviesLoading).toHaveBeenCalled();
    expect(selectMoviesError).toHaveBeenCalled();
  });

  it('useMoviesActions.fetchByCollection should dispatch fetchMoviesByCollection(collectionId)', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchByCollection(123);
    });

    expect(fetchMoviesByCollection).toHaveBeenCalledWith(123);
    expect(spyDispatch).toHaveBeenCalledWith({
      type: 'movies/fetchByCollection',
      payload: 123,
    });
  });

  it('useMoviesActions.fetchByKeyword should dispatch fetchMoviesByKeyword(keywordId)', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchByKeyword(999);
    });

    expect(fetchMoviesByKeyword).toHaveBeenCalledWith(999);
    expect(spyDispatch).toHaveBeenCalledWith({
      type: 'movies/fetchByKeyword',
      payload: 999,
    });
  });

  it('useMoviesActions.fetchDetails should dispatch fetchMovieDetails(movieId)', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchDetails(77);
    });

    expect(fetchMovieDetails).toHaveBeenCalledWith(77);
    expect(spyDispatch).toHaveBeenCalledWith({
      type: 'movies/fetchDetails',
      payload: 77,
    });
  });

  it('useMoviesActions.fetchPopularMovies should dispatch fetchPopularMovies()', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchPopularMovies();
    });

    expect(fetchPopularMovies).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledWith({ type: 'movies/fetchPopular' });
  });

  it('useMoviesActions.fetchNowPlayingMovies should dispatch fetchNowPlayingMovies()', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchNowPlayingMovies();
    });

    expect(fetchNowPlayingMovies).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledWith({ type: 'movies/fetchNowPlaying' });
  });

  it('useMoviesActions.fetchUpcomingMovies should dispatch fetchUpcomingMovies()', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchUpcomingMovies();
    });

    expect(fetchUpcomingMovies).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledWith({ type: 'movies/fetchUpcoming' });
  });

  it('useMoviesActions.fetchTopRatedMovies should dispatch fetchTopRatedMovies()', () => {
    const store = makeStore();
    const spyDispatch = jest.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useMoviesActions(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.fetchTopRatedMovies();
    });

    expect(fetchTopRatedMovies).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledWith({ type: 'movies/fetchTopRated' });
  });
});
