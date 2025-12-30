import 'react-native-gesture-handler/jestSetup';

globalThis.__reanimatedWorkletInit = () => { };

jest.mock('@react-native-community/geolocation', () => ({
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
}));

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


jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn((obj) => obj.ios),
    },

    Alert: { alert: jest.fn() },

    Linking: {
        openSettings: jest.fn(),
        canOpenURL: jest.fn().mockResolvedValue(true),
        openURL: jest.fn(),
    },

    PermissionsAndroid: {
        request: jest.fn(),
        PERMISSIONS: { ACCESS_FINE_LOCATION: 'ACCESS_FINE_LOCATION' },
        RESULTS: { GRANTED: 'granted' },
    },

    NativeModules: {
        RNFBAppModule: {},
    },
    Keyboard: { dismiss: jest.fn() },
    StyleSheet: {
        create: (styles) => styles,
    },
}));

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
        SafeAreaProvider: ({ children }) => children,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
});
