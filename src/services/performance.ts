
import { getPerformance, initializePerformance, trace as createTrace, httpMetric, FirebasePerformanceTypes } from '@react-native-firebase/perf';
import { getApp } from '@react-native-firebase/app';

const getPerf = () => {
  const app = getApp();
  return getPerformance(app);
};

type PerfTrace = FirebasePerformanceTypes.Trace;

export const startTrace = async (traceName: string): Promise<PerfTrace | null> => {
  try {
    const perf = getPerf();
    const safeName = traceName.trim().slice(0, 100);
    const t = createTrace(perf, safeName);
    await t.start();
    return t;
  } catch (error) {
    console.error(`Error starting trace ${traceName}:`, error);
    return null;
  }
};

export const stopTrace = async (t: PerfTrace | null) => {
  try {
    if (t) await t.stop();
  } catch (error) {
    console.error('Error stopping trace:', error);
  }
};

export const trackOperation = async <T>(operationName: string, operation: () => Promise<T>) => {
  const t = await startTrace(operationName);

  try {
    return await operation();
  } catch (error) {
    if (t) {
      t.putAttribute('error', 'true');
      t.putAttribute('error_message', String(error).slice(0, 100));
    }
    throw error;
  } finally {
    await stopTrace(t);
  }
};

export const addTraceAttribute = (t: PerfTrace | null, key: string, value: string) => {
  try {
    if (t) t.putAttribute(key, String(value).slice(0, 100));
  } catch (error) {
    console.error(`Error adding attribute ${key}:`, error);
  }
};

export const addTraceMetric = (t: PerfTrace | null, metricName: string, value: number) => {
  try {
    if (t) t.putMetric(metricName, value);
  } catch (error) {
    console.error(`Error adding metric ${metricName}:`, error);
  }
};

export const initializePerformanceMonitoring = async () => {
  try {
    const app = getApp();
    await initializePerformance(app, { dataCollectionEnabled: true });

    const perf = getPerformance(app);
    const testTrace = createTrace(perf, 'test_trace');
    await testTrace.start();
    await new Promise<void>(r => setTimeout(r, 500));
    await testTrace.stop();

    console.log('✅ Firebase Performance initialized and test trace sent');
  } catch (error) {
    console.error('❌ Error initializing performance monitoring:', error);
  }
};
