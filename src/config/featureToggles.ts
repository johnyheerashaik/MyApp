import Config from 'react-native-config';

export const FeatureToggles = {
  ENABLE_THEATERS: Config.ENABLE_THEATERS === 'true',
  ENABLE_MOVIES: Config.ENABLE_MOVIES === 'true',
};

export const isFeatureEnabled = (feature: keyof typeof FeatureToggles): boolean => {
  return FeatureToggles[feature] ?? false;
};
