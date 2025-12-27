import { RootState } from '../index';

export const selectReminders = (state: RootState) => state.reminder.reminders;
