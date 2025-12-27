import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../rtkHooks';
import { toggleReminder as toggleReminderAction } from './reminderSlice';

export const useReminder = () => {
    const reminders = useAppSelector((state) => state.reminder.reminders);
    const dispatch = useAppDispatch();

    const isReminderEnabled = useCallback(
        (movieId: number) => reminders.includes(movieId),
        [reminders]
    );

    const toggleReminder = useCallback(
        (movieId: number, enabled: boolean) => {
            dispatch(toggleReminderAction({ movieId, enabled }));
        },
        [dispatch]
    );

    return { isReminderEnabled, toggleReminder };
};
