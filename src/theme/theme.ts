export const theme = {
  colors: {
    background: '#2d3748',
    card: '#3a4556',
    primary: '#38BDF8',
    text: '#F9FAFB',
    mutedText: '#9CA3AF',
    border: '#4a5568',
    inputBackground: '#3a4556',
    danger: '#F97373',
  },
  spacing: (factor: number) => factor * 8,
  radius: {
    sm: 6,
    md: 12,
    lg: 20,
  },
};
export type Theme = typeof theme;