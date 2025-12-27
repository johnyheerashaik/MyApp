import { RootState } from '../index';

export const selectTheaters = (state: RootState) => state.theatres.theaters;
export const selectTheatersLoading = (state: RootState) => state.theatres.loading;
export const selectTheatersError = (state: RootState) => state.theatres.error;
