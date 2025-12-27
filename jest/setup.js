import 'react-native-gesture-handler/jestSetup';

global.__reanimatedWorkletInit = () => { };


jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
}));


jest.mock('@react-native-firebase/analytics', () => {
    const mockAnalyticsInstance = {};
    return {
        __esModule: true,
        getAnalytics: jest.fn(() => mockAnalyticsInstance),
        logEvent: jest.fn(),
        setUserProperty: jest.fn(),
        setUserId: jest.fn(),
        setAnalyticsCollectionEnabled: jest.fn(),
        logScreenView: jest.fn(), // optional
    };
});

jest.mock('@react-native-firebase/crashlytics', () => {
    const mockCrashlyticsInstance = {};
    return {
        __esModule: true,
        getCrashlytics: jest.fn(() => mockCrashlyticsInstance),
        log: jest.fn(),
        recordError: jest.fn(),
        crash: jest.fn(),
        setUserId: jest.fn(),
        setCrashlyticsCollectionEnabled: jest.fn(),
    };
});


jest.mock('@react-native-firebase/app', () => ({
    __esModule: true,
}));

jest.mock('@react-native-firebase/perf', () => ({
    __esModule: true,
}));


jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.NativeModules = RN.NativeModules || {};
    RN.NativeModules.RNFBAppModule = RN.NativeModules.RNFBAppModule || {};
    return RN;
});
