export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim();
};

export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
