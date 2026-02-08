import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { logError } from './analytics';
import { getPerformance, httpMetric, FirebasePerformanceTypes } from '@react-native-firebase/perf';
import { getApp } from '@react-native-firebase/app';

// Increased timeout to 60s to handle Render free tier cold starts (can take 30-60s)
const defaultTimeout = 60000;

const api = axios.create({
    timeout: defaultTimeout,
});

const perfMetrics = new Map();

api.interceptors.request.use(
    async config => {
        if (config.baseURL) {
            api.defaults.baseURL = config.baseURL;
        }
        let metric = null;
        try {
            const perf = getPerformance(getApp());
            const url = config.url || '';
            const method = (config.method || 'GET').toUpperCase() as FirebasePerformanceTypes.HttpMethod;
            metric = httpMetric(perf, url, method);
            await metric.start();
            perfMetrics.set(config, metric);
        } catch (perfError) {
            if (__DEV__) console.log('[API Perf] Could not start metric:', perfError);
        }
        if (__DEV__) {
            const methodColor = '\x1b[36m';
            const urlColor = '\x1b[33m';
            const dataColor = '\x1b[35m';
            const resetColor = '\x1b[0m';
            const method = config.method?.toUpperCase();
            const url = config.url;
            const data = config.data || config.params;
            console.log(
                `${methodColor}[API Request]${resetColor} ` +
                `${methodColor}${method}${resetColor} ` +
                `${urlColor}${url}${resetColor} ` +
                (data
                    ? `${dataColor}DATA:${resetColor} ${JSON.stringify(data, null, 2)}`
                    : `${dataColor}NO DATA${resetColor}`)
            );
        }
        return config;
    },
    error => {
        if (__DEV__) {
            console.log('[API Request Error]', error);
        }
        logError(error, 'API Request Error');
        throw error;
    }
);

api.interceptors.response.use(
    async response => {
        if (__DEV__) {
            const statusColor = response.status >= 200 && response.status < 300 ? '\x1b[32m' : '\x1b[31m'; // Green or Red
            const urlColor = '\x1b[33m';
            const dataColor = '\x1b[35m';
            const resetColor = '\x1b[0m';
            console.log(
                `${statusColor}[API Response]${resetColor} ` +
                `${urlColor}${response.config.url}${resetColor} ` +
                `${statusColor}${response.status}${resetColor} ` +
                `${dataColor}DATA:${resetColor} ${JSON.stringify(response.data, null, 2)}`
            );
        }
        const metric = perfMetrics.get(response.config);
        if (metric) {
            metric.setHttpResponseCode(response.status);
            metric.setResponseContentType(response.headers['content-type'] || '');
            await metric.stop();
            perfMetrics.delete(response.config);
        }
        return response;
    },
    async error => {
        if (__DEV__) {
            const errorColor = '\x1b[31m';
            const urlColor = '\x1b[33m';
            const resetColor = '\x1b[0m';
            const url = error.config?.url || 'Unknown URL';
            const status = error.response?.status || 'No Status';
            const data = error.response?.data;
            console.log(
                `${errorColor}[API Response Error]${resetColor} ` +
                `${urlColor}${url}${resetColor} ` +
                `${errorColor}${status}${resetColor} ` +
                (data
                    ? `${errorColor}DATA:${resetColor} ${JSON.stringify(data, null, 2)}`
                    : `${errorColor}NO DATA${resetColor}`)
            );
        }
        logError(error, 'API Response Error');
        const metric = perfMetrics.get(error.config);
        if (metric) {
            metric.setHttpResponseCode(error?.response?.status || 0);
            metric.setResponseContentType(error?.response?.headers?.['content-type'] || '');
            await metric.stop();
            perfMetrics.delete(error.config);
        }
        throw error;
    }
);

export async function apiCall<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (config.baseURL) {
        api.defaults.baseURL = config.baseURL;
    }
    return api.request<T>(config);
}

export default api;
