import reducer, { toggleReminder } from '../reminderSlice';

describe('reminderSlice', () => {
    const initialState = { reminders: [] as number[] };

    it('should return the initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should add movieId when enabled=true', () => {
        const state = reducer(
            initialState,
            toggleReminder({ movieId: 10, enabled: true }),
        );
        expect(state.reminders).toEqual([10]);
    });

    it('should NOT add duplicate movieId when enabled=true multiple times', () => {
        const state1 = reducer(
            initialState,
            toggleReminder({ movieId: 10, enabled: true }),
        );
        const state2 = reducer(
            state1,
            toggleReminder({ movieId: 10, enabled: true }),
        );
        expect(state2.reminders).toEqual([10]);
    });

    it('should remove movieId when enabled=false', () => {
        const preloaded = { reminders: [10, 20] };
        const state = reducer(
            preloaded,
            toggleReminder({ movieId: 10, enabled: false }),
        );
        expect(state.reminders).toEqual([20]);
    });

    it('should do nothing when removing a movieId that does not exist', () => {
        const preloaded = { reminders: [20] };
        const state = reducer(
            preloaded,
            toggleReminder({ movieId: 999, enabled: false }),
        );
        expect(state.reminders).toEqual([20]);
    });

    it('should add then remove correctly (full flow)', () => {
        const state1 = reducer(
            initialState,
            toggleReminder({ movieId: 5, enabled: true }),
        );
        expect(state1.reminders).toEqual([5]);

        const state2 = reducer(
            state1,
            toggleReminder({ movieId: 5, enabled: false }),
        );
        expect(state2.reminders).toEqual([]);
    });
});
