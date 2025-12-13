import Config from 'react-native-config';

export const FeatureToggles = {
  ENABLE_THEATERS: Config.ENABLE_THEATERS === 'true',
  ENABLE_TRAILERS: Config.ENABLE_TRAILERS === 'true',
  ENABLE_COMPANION: Config.ENABLE_COMPANION === 'true',
};

export const isFeatureEnabled = (feature: keyof typeof FeatureToggles): boolean => {
  return FeatureToggles[feature] ?? false;
};
