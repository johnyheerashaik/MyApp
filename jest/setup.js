// Mock @react-native-firebase/perf
jest.mock('@react-native-firebase/perf', () => () => ({
    newTrace: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        incrementMetric: jest.fn(),
        putAttribute: jest.fn(),
        putMetric: jest.fn(),
    })),
    startTrace: jest.fn(),
    getTrace: jest.fn(),
    httpMetric: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        setHttpResponseCode: jest.fn(),
        setRequestPayloadSize: jest.fn(),
        setResponseContentType: jest.fn(),
        setResponsePayloadSize: jest.fn(),
        setUrl: jest.fn(),
        setHttpMethod: jest.fn(),
    })),
}));

// Mock RNFBAppModule (for @react-native-firebase/app internals)
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.NativeModules = RN.NativeModules || {};
    RN.NativeModules.RNFBAppModule = {};
    return RN;
});
// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
}));
// jest/setup.js
// Mock @react-native-firebase modules for Jest
global.__reanimatedWorkletInit = () => { };

jest.mock('@react-native-firebase/analytics', () => () => ({
    logEvent: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
}));

jest.mock('@react-native-firebase/crashlytics', () => () => ({
    log: jest.fn(),
    recordError: jest.fn(),
    setUserId: jest.fn(),
    setAttribute: jest.fn(),
    setAttributes: jest.fn(),
    setUserName: jest.fn(),
    setUserEmail: jest.fn(),
    crash: jest.fn(),
}));

jest.mock('@react-native-firebase/app', () => () => ({
    utils: jest.fn(),
}));

// Mock AsyncStorage if used
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};

// Add more mocks as needed for other native modules
