export const FeatureToggles = {
  ENABLE_THEATERS: false,
  ENABLE_MOVIES: true,
};

export const isFeatureEnabled = (feature: keyof typeof FeatureToggles): boolean => {
  return FeatureToggles[feature] ?? false;
};
