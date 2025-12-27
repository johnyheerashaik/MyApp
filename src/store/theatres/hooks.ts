import { useAppDispatch, useAppSelector } from '../rtkHooks';
import { fetchTheatersByCoords, fetchTheatersByZip } from './theatresSlice';
import { useCallback } from 'react';

export const useTheatres = () => {
    const theaters = useAppSelector((state) => state.theatres.theaters);
    const loading = useAppSelector((state) => state.theatres.loading);
    const error = useAppSelector((state) => state.theatres.error);
    return { theaters, loading, error };
};

export const useTheatresActions = () => {
    const dispatch = useAppDispatch();

    const fetchByCoords = useCallback(
        (latitude: number, longitude: number) => {
            dispatch(fetchTheatersByCoords({ latitude, longitude }));
        },
        [dispatch]
    );

    const fetchByZip = useCallback(
        (zipCode: string) => {
            dispatch(fetchTheatersByZip(zipCode));
        },
        [dispatch]
    );

    return { fetchByCoords, fetchByZip };
};
