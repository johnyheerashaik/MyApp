import reducer, { signInThunk, signOutThunk, bootstrapAuth } from '../authSlice';
import type { AuthState, AuthUser } from '../types';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null, initializing: true,
    error: undefined,
    loading: undefined
  };
  const user: AuthUser = { id: '1', name: 'Test', email: 'test@example.com', token: 'token' };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle bootstrapAuth.fulfilled', () => {
    const state = reducer(initialState, { type: bootstrapAuth.fulfilled.type, payload: user });
    expect(state.user).toEqual(user);
    expect(state.initializing).toBe(false);
  });

  it('should handle bootstrapAuth.rejected', () => {
    const state = reducer(initialState, { type: bootstrapAuth.rejected.type });
    expect(state.user).toBeNull();
    expect(state.initializing).toBe(false);
  });

  it('should handle signInThunk.fulfilled', () => {
    const state = reducer(initialState, { type: signInThunk.fulfilled.type, payload: user });
    expect(state.user).toEqual(user);
  });

  it('should handle signOutThunk.fulfilled', () => {
    const state = reducer({ ...initialState, user }, { type: signOutThunk.fulfilled.type });
    expect(state.user).toBeNull();
  });
});
