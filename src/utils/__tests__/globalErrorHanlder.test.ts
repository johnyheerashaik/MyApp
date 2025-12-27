import crashlytics from '@react-native-firebase/crashlytics';
import { registerGlobalErrorHandler } from '../globalErrorHandler';

declare var global: any;

jest.mock('@react-native-firebase/crashlytics', () => {
    const recordError = jest.fn();
    return () => ({
        recordError,
    });
});

describe('registerGlobalErrorHandler', () => {
    const originalErrorUtils = (global as any).ErrorUtils;

    const getRecordErrorMock = () => {
        return (crashlytics() as any).recordError as jest.Mock;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (global as any).ErrorUtils = undefined;
    });

    afterEach(() => {
        (global as any).ErrorUtils = originalErrorUtils;
    });

    it('does nothing when ErrorUtils is undefined', () => {
        registerGlobalErrorHandler();
        expect(getRecordErrorMock()).not.toHaveBeenCalled();
    });

    it('does nothing when ErrorUtils.getGlobalHandler is missing', () => {
        (global as any).ErrorUtils = {
            setGlobalHandler: jest.fn(),
        };

        registerGlobalErrorHandler();

        expect((global as any).ErrorUtils.setGlobalHandler).not.toHaveBeenCalled();
        expect(getRecordErrorMock()).not.toHaveBeenCalled();
    });

    it('registers a global handler and records error; calls default handler when present', () => {
        const defaultHandler = jest.fn();
        const setGlobalHandler = jest.fn();

        (global as any).ErrorUtils = {
            getGlobalHandler: jest.fn(() => defaultHandler),
            setGlobalHandler,
        };

        registerGlobalErrorHandler();

        expect((global as any).ErrorUtils.getGlobalHandler).toHaveBeenCalledTimes(1);
        expect(setGlobalHandler).toHaveBeenCalledTimes(1);

        const registeredHandler = setGlobalHandler.mock.calls[0][0] as (
            error: Error,
            isFatal?: boolean
        ) => void;

        const err = new Error('boom');
        registeredHandler(err, true);

        expect(getRecordErrorMock()).toHaveBeenCalledWith(err);
        expect(defaultHandler).toHaveBeenCalledWith(err, true);
    });

    it('records error but does NOT call default handler when defaultHandler is falsy', () => {
        const setGlobalHandler = jest.fn();

        (global as any).ErrorUtils = {
            getGlobalHandler: jest.fn(() => undefined),
            setGlobalHandler,
        };

        registerGlobalErrorHandler();

        const registeredHandler = setGlobalHandler.mock.calls[0][0] as (
            error: Error,
            isFatal?: boolean
        ) => void;

        const err = new Error('no default handler');
        registeredHandler(err, false);

        expect(getRecordErrorMock()).toHaveBeenCalledWith(err);
        expect((global as any).ErrorUtils.getGlobalHandler).toHaveBeenCalledTimes(1);
    });
});
