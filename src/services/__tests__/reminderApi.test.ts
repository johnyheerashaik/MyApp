describe('remindersApi', () => {
    const mockApiCall = jest.fn();
    const mockTrackOperation = jest.fn();
    const mockGetReminderBaseUrl = jest.fn();

    const requireModule = () => {
        jest.resetModules();

        jest.doMock('../api', () => ({
            apiCall: (...args: any[]) => mockApiCall(...args),
        }));

        jest.doMock('../performance', () => ({
            trackOperation: (name: string, fn: any) => mockTrackOperation(name, fn),
        }));

        jest.doMock('../reminderBaseUrl', () => ({
            getReminderBaseUrl: () => mockGetReminderBaseUrl(),
        }));

        return require('../reminderApi') as typeof import('../reminderApi');
    };

    beforeEach(() => {
        mockApiCall.mockReset();
        mockTrackOperation.mockReset();
        mockGetReminderBaseUrl.mockReset();

        mockTrackOperation.mockImplementation(async (_name: string, fn: any) => fn());
        mockGetReminderBaseUrl.mockReturnValue('http://base');
    });

    describe('toggleReminder', () => {
        it('calls PATCH and succeeds when success=true (default baseUrl from getReminderBaseUrl)', async () => {
            const { toggleReminder } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await toggleReminder('TOKEN', 123, true);

            expect(mockTrackOperation).toHaveBeenCalledWith('toggleReminder', expect.any(Function));
            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://base/reminders/123',
                method: 'PATCH',
                headers: {
                    Authorization: 'Bearer TOKEN',
                    'Content-Type': 'application/json',
                },
                data: { reminderEnabled: true },
            });
        });

        it('uses provided baseUrl parameter', async () => {
            const { toggleReminder } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await toggleReminder('TOKEN', 5, false, 'http://custom');

            expect(mockApiCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://custom/reminders/5',
                    data: { reminderEnabled: false },
                }),
            );
        });

        it('throws message when success=false and message provided', async () => {
            const { toggleReminder } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false, message: 'nope' } });

            await expect(toggleReminder('T', 1, true)).rejects.toThrow('nope');
        });

        it('throws default when success=false and message missing', async () => {
            const { toggleReminder } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false } });

            await expect(toggleReminder('T', 1, true)).rejects.toThrow('Failed to toggle reminder');
        });
    });

    describe('getReminders', () => {
        it('calls GET and returns reminders when success=true', async () => {
            const { getReminders } = requireModule();

            mockApiCall.mockResolvedValueOnce({
                data: { success: true, reminders: [{ movieId: 1 }, { movieId: 2 }] },
            });

            const res = await getReminders('TOKEN');

            expect(mockTrackOperation).toHaveBeenCalledWith('getReminders', expect.any(Function));
            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://base/reminders',
                method: 'GET',
                headers: {
                    Authorization: 'Bearer TOKEN',
                    'Content-Type': 'application/json',
                },
            });
            expect(res).toEqual([{ movieId: 1 }, { movieId: 2 }]);
        });

        it('uses provided baseUrl parameter', async () => {
            const { getReminders } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true, reminders: [] } });

            await getReminders('TOKEN', 'http://custom');

            expect(mockApiCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://custom/reminders',
                }),
            );
        });

        it('throws message when success=false and message provided', async () => {
            const { getReminders } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false, message: 'bad' } });

            await expect(getReminders('TOKEN')).rejects.toThrow('bad');
        });

        it('throws default when success=false and message missing', async () => {
            const { getReminders } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false } });

            await expect(getReminders('TOKEN')).rejects.toThrow('Failed to get reminders');
        });
    });

    describe('updatePushToken', () => {
        it('calls PUT and succeeds when success=true', async () => {
            const { updatePushToken } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await updatePushToken('TOKEN', 'PUSH_TOKEN');

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://base/users/push-token',
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer TOKEN',
                    'Content-Type': 'application/json',
                },
                data: { pushToken: 'PUSH_TOKEN' },
            });
        });

        it('uses provided baseUrl parameter', async () => {
            const { updatePushToken } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await updatePushToken('TOKEN', 'P', 'http://custom');

            expect(mockApiCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://custom/users/push-token',
                }),
            );
        });

        it('throws message when success=false and message provided', async () => {
            const { updatePushToken } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false, message: 'no' } });

            await expect(updatePushToken('TOKEN', 'P')).rejects.toThrow('no');
        });

        it('throws default when success=false and message missing', async () => {
            const { updatePushToken } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false } });

            await expect(updatePushToken('TOKEN', 'P')).rejects.toThrow('Failed to update push token');
        });
    });

    describe('updateNotificationPreferences', () => {
        it('calls PUT and succeeds when success=true', async () => {
            const { updateNotificationPreferences } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            const prefs = { releaseReminders: true, reminderTime: '09:00' };
            await updateNotificationPreferences('TOKEN', prefs);

            expect(mockApiCall).toHaveBeenCalledWith({
                url: 'http://base/users/notification-preferences',
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer TOKEN',
                    'Content-Type': 'application/json',
                },
                data: prefs,
            });
        });

        it('works with partial preferences too', async () => {
            const { updateNotificationPreferences } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await updateNotificationPreferences('TOKEN', { releaseReminders: false });

            expect(mockApiCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { releaseReminders: false },
                }),
            );
        });

        it('uses provided baseUrl parameter', async () => {
            const { updateNotificationPreferences } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: true } });

            await updateNotificationPreferences('TOKEN', { reminderTime: '10:00' }, 'http://custom');

            expect(mockApiCall).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://custom/users/notification-preferences',
                }),
            );
        });

        it('throws message when success=false and message provided', async () => {
            const { updateNotificationPreferences } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false, message: 'bad prefs' } });

            await expect(updateNotificationPreferences('TOKEN', {})).rejects.toThrow('bad prefs');
        });

        it('throws default when success=false and message missing', async () => {
            const { updateNotificationPreferences } = requireModule();

            mockApiCall.mockResolvedValueOnce({ data: { success: false } });

            await expect(updateNotificationPreferences('TOKEN', {})).rejects.toThrow(
                'Failed to update notification preferences',
            );
        });
    });
});
