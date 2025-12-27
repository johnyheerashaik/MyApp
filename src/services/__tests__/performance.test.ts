/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    startTrace,
    stopTrace,
    trackOperation,
    addTraceAttribute,
    addTraceMetric,
    initializePerformanceMonitoring,
} from '../performance';

import {
    getPerformance,
    initializePerformance,
    trace as createTrace,
} from '@react-native-firebase/perf';

import { getApp } from '@react-native-firebase/app';

jest.mock('@react-native-firebase/app', () => ({
    getApp: jest.fn(),
}));

jest.mock('@react-native-firebase/perf', () => ({
    getPerformance: jest.fn(),
    initializePerformance: jest.fn(),
    trace: jest.fn(),
    httpMetric: jest.fn(),
}));

type MockTrace = {
    start: jest.Mock;
    stop: jest.Mock;
    putAttribute: jest.Mock;
    putMetric: jest.Mock;
};

const makeTrace = (): MockTrace => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    putAttribute: jest.fn(),
    putMetric: jest.fn(),
});

describe('performance.ts', () => {
    const mockApp = { name: 'app' };
    const mockPerf = { name: 'perf' };

    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        (getApp as jest.Mock).mockReturnValue(mockApp);
        (getPerformance as jest.Mock).mockReturnValue(mockPerf);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        jest.useRealTimers();
    });

    describe('startTrace', () => {
        it('creates a trace with trimmed/sliced name and starts it', async () => {
            const t = makeTrace();
            (createTrace as jest.Mock).mockReturnValueOnce(t);

            const longName = `   ${'a'.repeat(200)}   `;
            const res = await startTrace(longName);

            const expectedSafeName = 'a'.repeat(100);

            expect(getApp).toHaveBeenCalledTimes(1);
            expect(getPerformance).toHaveBeenCalledWith(mockApp);
            expect(createTrace).toHaveBeenCalledWith(mockPerf, expectedSafeName);
            expect(t.start).toHaveBeenCalledTimes(1);
            expect(res).toBe(t);
        });

        it('returns null and logs when something fails', async () => {
            (createTrace as jest.Mock).mockImplementationOnce(() => {
                throw new Error('boom');
            });

            const res = await startTrace('test');

            expect(res).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('stopTrace', () => {
        it('does nothing when trace is null', async () => {
            await stopTrace(null);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('stops the trace when provided', async () => {
            const t = makeTrace();
            await stopTrace(t as any);
            expect(t.stop).toHaveBeenCalledTimes(1);
        });

        it('catches and logs errors from stop()', async () => {
            const t = makeTrace();
            t.stop.mockRejectedValueOnce(new Error('stop fail'));

            await stopTrace(t as any);

            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('addTraceAttribute', () => {
        it('adds attribute (stringified & sliced) when trace exists', () => {
            const t = makeTrace();
            addTraceAttribute(t as any, 'k', '  ' + 'x'.repeat(150));

            expect(t.putAttribute).toHaveBeenCalledWith('k', ('  ' + 'x'.repeat(150)).slice(0, 100));
        });

        it('does nothing when trace is null', () => {
            addTraceAttribute(null, 'k', 'v');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('catches and logs errors', () => {
            const t = makeTrace();
            t.putAttribute.mockImplementationOnce(() => {
                throw new Error('attr fail');
            });

            addTraceAttribute(t as any, 'k', 'v');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('addTraceMetric', () => {
        it('adds metric when trace exists', () => {
            const t = makeTrace();
            addTraceMetric(t as any, 'm', 7);
            expect(t.putMetric).toHaveBeenCalledWith('m', 7);
        });

        it('does nothing when trace is null', () => {
            addTraceMetric(null, 'm', 1);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('catches and logs errors', () => {
            const t = makeTrace();
            t.putMetric.mockImplementationOnce(() => {
                throw new Error('metric fail');
            });

            addTraceMetric(t as any, 'm', 1);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('trackOperation', () => {
        it('starts trace, runs operation, stops trace and returns result', async () => {
            const t = makeTrace();
            (createTrace as jest.Mock).mockReturnValueOnce(t);

            const res = await trackOperation('op', async () => 'OK');

            expect(t.start).toHaveBeenCalledTimes(1);
            expect(t.stop).toHaveBeenCalledTimes(1);
            expect(res).toBe('OK');
        });

        it('when operation throws: marks error attrs, stops trace, then rethrows', async () => {
            const t = makeTrace();
            (createTrace as jest.Mock).mockReturnValueOnce(t);

            await expect(
                trackOperation('op', async () => {
                    throw new Error('bad things happened');
                }),
            ).rejects.toThrow('bad things happened');

            expect(t.putAttribute).toHaveBeenCalledWith('error', 'true');

            const errStr = String(new Error('bad things happened')).slice(0, 100);
            expect(t.putAttribute).toHaveBeenCalledWith('error_message', errStr);

            expect(t.stop).toHaveBeenCalledTimes(1);
        });

        it('if startTrace returns null, it still runs operation and returns result', async () => {
            (createTrace as jest.Mock).mockImplementationOnce(() => {
                throw new Error('no trace');
            });

            const res = await trackOperation('op', async () => 123);
            expect(res).toBe(123);
        });
    });

    describe('initializePerformanceMonitoring', () => {
        it('initializes performance, creates test trace, waits 500ms, stops it, logs success', async () => {
            jest.useFakeTimers();

            const testT = makeTrace();
            (createTrace as jest.Mock).mockReturnValueOnce(testT);

            const promise = initializePerformanceMonitoring();

            await jest.advanceTimersByTimeAsync(500);

            await promise;

            expect(getApp).toHaveBeenCalled();
            expect(initializePerformance).toHaveBeenCalledWith(mockApp, {
                dataCollectionEnabled: true,
            });

            expect(getPerformance).toHaveBeenCalledWith(mockApp);
            expect(createTrace).toHaveBeenCalledWith(mockPerf, 'test_trace');

            expect(testT.start).toHaveBeenCalledTimes(1);
            expect(testT.stop).toHaveBeenCalledTimes(1);

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('logs error if initialization throws', async () => {
            (initializePerformance as jest.Mock).mockRejectedValueOnce(new Error('init fail'));

            await initializePerformanceMonitoring();

            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

});
