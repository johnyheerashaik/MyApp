import {
    initializeFirebaseServices,
    logScreenView,
    logEvent,
    setUserProperty,
    setUserId,
    logError,
    testCrash,
    logUserLogin,
    logUserSignup,
    logUserLogout,
    logMovieView,
    logMovieSearch,
    logMovieFavorited,
    logMovieUnfavorited,
    logTrailerPlay,
    logAIChat,
    logAIRecommendation,
    logTheaterSearch,
    logTheaterDirections,
    logCollectionView,
    logThemeChange,
    logAppError,
} from '../analytics';

import * as analyticsMod from '@react-native-firebase/analytics';
import * as crashMod from '@react-native-firebase/crashlytics';

describe('analytics service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initializeFirebaseServices', () => {
        it('enables analytics & crashlytics and logs app_initialized', async () => {
            await initializeFirebaseServices();

            expect(analyticsMod.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
                expect.anything(),
                true,
            );
            expect(crashMod.setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
                expect.anything(),
                true,
            );

            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'app_initialized',
                expect.objectContaining({ timestamp: expect.any(String) }),
            );
        });
    });

    describe('logEvent / logScreenView / setUserProperty', () => {
        it('logs a generic event', async () => {
            await logEvent('test_event', { foo: 'bar' });

            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'test_event',
                { foo: 'bar' },
            );
        });

        it('logs screen view', async () => {
            await logScreenView('Home');

            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'screen_view',
                {
                    firebase_screen: 'Home',
                    firebase_screen_class: 'Home',
                },
            );
        });

        it('sets user property', async () => {
            await setUserProperty('role', 'admin');

            expect(analyticsMod.setUserProperty).toHaveBeenCalledWith(
                expect.anything(),
                'role',
                'admin',
            );
        });
    });

    describe('setUserId', () => {
        it('sets user id in analytics and crashlytics', async () => {
            await setUserId('user-123');

            expect(analyticsMod.setUserId).toHaveBeenCalledWith(
                expect.anything(),
                'user-123',
            );
            expect(crashMod.setUserId).toHaveBeenCalledWith(
                expect.anything(),
                'user-123',
            );
        });
    });

    describe('logError / testCrash', () => {
        it('logs error with context to crashlytics', () => {
            const error = new Error('Boom');

            logError(error, 'Something failed');

            expect(crashMod.log).toHaveBeenCalledWith(expect.anything(), 'Something failed');
            expect(crashMod.recordError).toHaveBeenCalledWith(expect.anything(), error);
        });

        it('triggers crashlytics crash', () => {
            testCrash();
            expect(crashMod.crash).toHaveBeenCalledWith(expect.anything());
        });
    });

    describe('event wrappers', () => {
        it('auth events', () => {
            logUserLogin('email');
            logUserSignup('google');
            logUserLogout();

            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'login',
                { method: 'email' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'sign_up',
                { method: 'google' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'logout',
                {},
            );
        });

        it('movie events', () => {
            logMovieView('1', 'Inception');
            logMovieSearch('batman');
            logMovieFavorited('1', 'Matrix');
            logMovieUnfavorited('1', 'Matrix');
            logTrailerPlay('1', 'Avatar');

            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'view_movie_details',
                { movie_id: '1', movie_title: 'Inception' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'search',
                { search_term: 'batman' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'add_to_favorites',
                { movie_id: '1', movie_title: 'Matrix' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'remove_from_favorites',
                { movie_id: '1', movie_title: 'Matrix' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'play_trailer',
                { movie_id: '1', movie_title: 'Avatar' },
            );
        });

        it('ai/theaters/theme/app-error events', () => {
            logAIChat('question');
            logAIRecommendation(5);
            logTheaterSearch('gps', 10);
            logTheaterDirections('AMC');
            logCollectionView('popular');
            logThemeChange('dark');
            logAppError('NetworkError', 'Timeout');

            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'ai_chat',
                { message_type: 'question' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'ai_recommendation',
                { movie_count: 5 },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'search_theaters',
                { search_method: 'gps', result_count: 10 },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'get_directions',
                { theater_name: 'AMC' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'view_collection',
                { sort_type: 'popular' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'theme_change',
                { theme: 'dark' },
            );
            expect(analyticsMod.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                'app_error',
                { error_name: 'NetworkError', error_message: 'Timeout' },
            );
        });
    });
});
