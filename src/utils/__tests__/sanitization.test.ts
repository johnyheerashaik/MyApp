import {
    sanitizeEmail,
    sanitizeString,
    validateEmail,
    validatePassword,
} from '../sanitization';

describe('sanitizeEmail', () => {
    it('lowercases and trims email', () => {
        expect(sanitizeEmail('  TEST@Example.COM  ')).toBe('test@example.com');
    });

    it('returns empty string for non-string input', () => {
        // @ts-expect-error intentional misuse
        expect(sanitizeEmail(null)).toBe('');
        // @ts-expect-error intentional misuse
        expect(sanitizeEmail(undefined)).toBe('');
    });

    it('handles empty string', () => {
        expect(sanitizeEmail('')).toBe('');
    });
});

describe('sanitizeString', () => {
    it('trims whitespace', () => {
        expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('returns empty string for non-string input', () => {
        // @ts-expect-error intentional misuse
        expect(sanitizeString(null)).toBe('');
        // @ts-expect-error intentional misuse
        expect(sanitizeString(undefined)).toBe('');
    });

    it('handles empty string', () => {
        expect(sanitizeString('')).toBe('');
    });
});

describe('validateEmail', () => {
    it('returns true for valid email', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name+tag@domain.co')).toBe(true);
    });

    it('returns false for invalid email', () => {
        expect(validateEmail('test')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('test@domain')).toBe(false);
        expect(validateEmail('@domain.com')).toBe(false);
        expect(validateEmail('test@domain.')).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(validateEmail('')).toBe(false);
    });
});

describe('validatePassword', () => {
    it('returns valid when password length >= 6', () => {
        const result = validatePassword('abcdef');

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it('returns error when password is too short', () => {
        const result = validatePassword('abc');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 6 characters');
    });

    it('handles empty password', () => {
        const result = validatePassword('');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 6 characters');
    });
});
