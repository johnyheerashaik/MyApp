import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReminderState {
    reminders: number[];
}

const initialState: ReminderState = {
    reminders: [],
};

export const reminderSlice = createSlice({
    name: 'reminder',
    initialState,
    reducers: {
        toggleReminder: (
            state,
            action: PayloadAction<{ movieId: number; enabled: boolean }>
        ) => {
            const { movieId, enabled } = action.payload;
            if (enabled) {
                if (!state.reminders.includes(movieId)) {
                    state.reminders.push(movieId);
                }
            } else {
                state.reminders = state.reminders.filter(id => id !== movieId);
            }
        },
    },
});

export const { toggleReminder } = reminderSlice.actions;
export default reminderSlice.reducer;
