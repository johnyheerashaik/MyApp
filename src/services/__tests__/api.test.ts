/* eslint-disable @typescript-eslint/no-explicit-any */
declare var global: any;
describe('api.ts', () => {
    let requestFulfilled: any;
    let requestRejected: any;
    let responseFulfilled: any;
    let responseRejected: any;

    const metric = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        setHttpResponseCode: jest.fn(),
        setResponseContentType: jest.fn(),
    };

    const httpMetricMock = jest.fn((..._args: any[]) => metric);
    const getPerformanceMock = jest.fn((..._args: any[]) => ({ perf: true }));
    const getAppMock = jest.fn((..._args: any[]) => ({ app: true }));

    const logErrorMock = jest.fn((..._args: any[]) => undefined);

    const apiInstance = {
        defaults: { baseURL: undefined as any },
        interceptors: {
            request: {
                use: jest.fn((ok: any, bad: any) => {
                    requestFulfilled = ok;
                    requestRejected = bad;
                }),
            },
            response: {
                use: jest.fn((ok: any, bad: any) => {
                    responseFulfilled = ok;
                    responseRejected = bad;
                }),
            },
        },
        request: jest.fn(),
    };

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        (global as any).__DEV__ = false;

        metric.start.mockClear();
        metric.stop.mockClear();
        metric.setHttpResponseCode.mockClear();
        metric.setResponseContentType.mockClear();

        httpMetricMock.mockClear();
        getPerformanceMock.mockClear();
        getAppMock.mockClear();
        logErrorMock.mockClear();

        apiInstance.defaults.baseURL = undefined;
        apiInstance.request.mockReset();

        requestFulfilled = undefined;
        requestRejected = undefined;
        responseFulfilled = undefined;
        responseRejected = undefined;

        jest.doMock('axios', () => ({
            __esModule: true,
            default: {
                create: jest.fn(() => apiInstance),
            },
            create: jest.fn(() => apiInstance),
        }));

        jest.doMock('@react-native-firebase/perf', () => ({
            __esModule: true,
            getPerformance: (...args: any[]) => getPerformanceMock(...args),
            httpMetric: (...args: any[]) => httpMetricMock(...args),
        }));

        jest.doMock('@react-native-firebase/app', () => ({
            __esModule: true,
            getApp: (...args: any[]) => getAppMock(...args),
        }));

        jest.doMock('../analytics', () => ({
            __esModule: true,
            logError: (...args: any[]) => logErrorMock(...args),
        }));
    });

    const importSubject = async () => {
        const mod = require('../api');
        return mod;
    };

    it('registers request/response interceptors on module load', async () => {
        await importSubject();

        expect(apiInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
        expect(apiInstance.interceptors.response.use).toHaveBeenCalledTimes(1);

        expect(typeof requestFulfilled).toBe('function');
        expect(typeof requestRejected).toBe('function');
        expect(typeof responseFulfilled).toBe('function');
        expect(typeof responseRejected).toBe('function');
    });

    describe('request interceptor (fulfilled)', () => {
        it('sets defaults.baseURL from config.baseURL and starts perf metric', async () => {
            await importSubject();

            const config: any = {
                baseURL: 'http://example.com',
                url: '/test',
                method: 'post',
                data: { a: 1 },
            };

            const out = await requestFulfilled(config);

            expect(out).toBe(config);
            expect(apiInstance.defaults.baseURL).toBe('http://example.com');

            expect(getAppMock).toHaveBeenCalledTimes(1);
            expect(getPerformanceMock).toHaveBeenCalledTimes(1);

            expect(httpMetricMock).toHaveBeenCalledWith(
                { perf: true },
                '/test',
                'POST',
            );
            expect(metric.start).toHaveBeenCalledTimes(1);
        });

        it('does not crash if perf metric fails to start', async () => {
            await importSubject();

            httpMetricMock.mockImplementationOnce(() => {
                throw new Error('perf fail');
            });

            const config: any = {
                url: '/x',
                method: 'get',
            };

            const out = await requestFulfilled(config);

            expect(out).toBe(config);
        });
    });

    describe('response interceptor (fulfilled)', () => {
        it('stops perf metric and sets response code/content-type when metric exists', async () => {
            await importSubject();

            const config: any = { url: '/test', method: 'get' };

            await requestFulfilled(config);

            const response: any = {
                status: 201,
                data: { ok: true },
                headers: { 'content-type': 'application/json' },
                config,
            };

            const out = await responseFulfilled(response);

            expect(out).toBe(response);

            expect(metric.setHttpResponseCode).toHaveBeenCalledWith(201);
            expect(metric.setResponseContentType).toHaveBeenCalledWith('application/json');
            expect(metric.stop).toHaveBeenCalledTimes(1);
        });

        it('does nothing with perf metric if none was stored', async () => {
            await importSubject();

            const response: any = {
                status: 200,
                data: {},
                headers: {},
                config: { url: '/no-metric' },
            };

            const out = await responseFulfilled(response);

            expect(out).toBe(response);
            expect(metric.stop).not.toHaveBeenCalled();
        });
    });

    describe('response interceptor (rejected)', () => {
        it('logs error, stops perf metric using status/content-type fallback, then rethrows', async () => {
            await importSubject();

            const config: any = { url: '/boom', method: 'get' };

            await requestFulfilled(config);

            const err: any = new Error('bad');
            err.config = config; // same ref
            err.response = {
                status: 500,
                headers: { 'content-type': 'text/plain' },
                data: { msg: 'oops' },
            };

            await expect(responseRejected(err)).rejects.toThrow('bad');

            expect(logErrorMock).toHaveBeenCalledWith(err, 'API Response Error');

            expect(metric.setHttpResponseCode).toHaveBeenCalledWith(500);
            expect(metric.setResponseContentType).toHaveBeenCalledWith('text/plain');
            expect(metric.stop).toHaveBeenCalledTimes(1);
        });

        it('handles missing response/status/headers (uses 0 and empty content-type)', async () => {
            await importSubject();

            const config: any = { url: '/missing', method: 'get' };
            await requestFulfilled(config);

            const err: any = new Error('no response');
            err.config = config; // same ref
            err.response = undefined;

            await expect(responseRejected(err)).rejects.toThrow('no response');

            expect(metric.setHttpResponseCode).toHaveBeenCalledWith(0);
            expect(metric.setResponseContentType).toHaveBeenCalledWith('');
            expect(metric.stop).toHaveBeenCalledTimes(1);
        });
    });

    describe('apiCall', () => {
        it('sets defaults.baseURL when config.baseURL is provided and calls api.request', async () => {
            const { apiCall } = await importSubject();

            apiInstance.request.mockResolvedValueOnce({ data: { ok: true } });

            const cfg: any = {
                baseURL: 'http://base',
                url: '/hello',
                method: 'GET',
            };

            const res = await apiCall(cfg);

            expect(apiInstance.defaults.baseURL).toBe('http://base');
            expect(apiInstance.request).toHaveBeenCalledWith(cfg);
            expect(res).toEqual({ data: { ok: true } });
        });

        it('does not change defaults.baseURL when baseURL is not provided', async () => {
            const { apiCall } = await importSubject();

            apiInstance.defaults.baseURL = 'http://existing';
            apiInstance.request.mockResolvedValueOnce({ data: { ok: true } });

            const cfg: any = { url: '/x', method: 'GET' };
            await apiCall(cfg);

            expect(apiInstance.defaults.baseURL).toBe('http://existing');
            expect(apiInstance.request).toHaveBeenCalledWith(cfg);
        });
    });
});
