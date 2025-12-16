import { getPerformance, trace as createTrace } from '@react-native-firebase/perf';

export const startTrace = async (traceName: string) => {
  try {
    const perf = getPerformance();
    const trace = createTrace(perf, traceName);
    await trace.start();
    return trace;
  } catch (error) {
    console.error(`Error starting trace ${traceName}:`, error);
    return null;
  }
};

export const stopTrace = async (trace: any) => {
  try {
    if (trace) {
      await trace.stop();
    }
  } catch (error) {
    console.error('Error stopping trace:', error);
  }
};

export const trackOperation = async (
  operationName: string,
  operation: () => Promise<any>
) => {
  const trace = await startTrace(operationName);
  
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (trace) {
      trace.putAttribute('error', 'true');
      trace.putAttribute('error_message', String(error));
    }
    throw error;
  } finally {
    await stopTrace(trace);
  }
};

export const addTraceAttribute = (trace: any, key: string, value: string) => {
  try {
    if (trace) {
      trace.putAttribute(key, value);
    }
  } catch (error) {
    console.error(`Error adding attribute ${key}:`, error);
  }
};

export const addTraceMetric = (trace: any, metricName: string, value: number) => {
  try {
    if (trace) {
      trace.putMetric(metricName, value);
    }
  } catch (error) {
    console.error(`Error adding metric ${metricName}:`, error);
  }
};

export const trackScreenRender = async (screenName: string) => {
  const trace = await startTrace(`screen_${screenName}`);
  return trace;
};

export const initializePerformanceMonitoring = async () => {
  try {
    const perf = getPerformance();

  } catch (error) {
    console.error('❌ Error initializing performance monitoring:', error);
  }
};

export { getPerformance };
