import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../rtkHooks';
import { signInThunk, signOutThunk } from './authSlice';

export const useAuth = () => {
    const user = useAppSelector((state) => state.auth.user);
    const initializing = useAppSelector((state) => state.auth.initializing);
    return {
        user,
        initializing,
    };
};

export const useAuthActions = () => {
    const dispatch = useAppDispatch();

    const signIn = useCallback(
        async (email: string, password: string) => {
            void dispatch(signInThunk({ email, password }) as any);
        },
        [dispatch],
    );

    const signOut = useCallback(async () => {
        void dispatch(signOutThunk() as any);
    }, [dispatch]);

    return { signIn, signOut };
};
