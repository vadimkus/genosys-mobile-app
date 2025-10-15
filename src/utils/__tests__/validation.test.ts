/**
 * Validation Utilities Tests
 */

import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateUrl,
  validateNumber,
  validateCreditCard,
  sanitizeInput,
  validateForm,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedValue).toBe(email.toLowerCase().trim());
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        '',
        'test@.com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should handle email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be less than 254 characters');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MySecure123',
        'Test1234',
        'StrongPass1',
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '12345678', // no uppercase
        'password', // no uppercase, no number
        'PASSWORD', // no lowercase, no number
        'Pass1', // too short
        '', // empty
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should handle password that is too long', () => {
      const longPassword = 'a'.repeat(130);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be less than 128 characters'
      );
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John Doe',
        'Mary-Jane',
        "O'Connor",
        'Jean-Luc',
        'José',
        'Müller',
      ];

      validNames.forEach(name => {
        const result = validateName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedValue).toBe(name.trim());
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        'John123', // contains numbers
        'John@Doe', // contains special characters
        'J', // too short
        '', // empty
        'John'.repeat(20), // too long
      ];

      invalidNames.forEach(name => {
        const result = validateName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '+971501234567',
        '0501234567',
      ];

      validPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123', // too short
        'abc123', // contains letters
        '', // empty
        '123-456-789', // contains dashes
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://subdomain.example.com/path',
        'https://example.com?query=value',
      ];

      validUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        '',
        'example.com', // missing protocol
      ];

      invalidUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateNumber', () => {
    it('should validate numbers within range', () => {
      const result = validateNumber(50, 0, 100, 'Age');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject numbers outside range', () => {
      const result = validateNumber(150, 0, 100, 'Age');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be at most 100');
    });

    it('should handle non-numeric values', () => {
      const result = validateNumber('abc', 0, 100, 'Age');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be a valid number');
    });
  });

  describe('validateCreditCard', () => {
    it('should validate correct credit card numbers', () => {
      const validCards = [
        '4111111111111111', // Visa
        '5555555555554444', // Mastercard
        '378282246310005', // American Express
      ];

      validCards.forEach(card => {
        const result = validateCreditCard(card);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid credit card numbers', () => {
      const invalidCards = [
        '1234567890123456', // invalid Luhn
        '1234', // too short
        'abc123', // contains letters
        '', // empty
      ];

      invalidCards.forEach(card => {
        const result = validateCreditCard(card);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize dangerous input', () => {
      const dangerousInput = '<script>alert("xss")</script>';
      const result = sanitizeInput(dangerousInput);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should handle empty input', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const result = sanitizeInput('  test  ');
      expect(result).toBe('test');
    });

    it('should limit length when specified', () => {
      const longInput = 'a'.repeat(100);
      const result = sanitizeInput(longInput, 10);
      expect(result).toHaveLength(10);
    });
  });

  describe('validateForm', () => {
    it('should validate all fields successfully', () => {
      const fields = {
        email: validateEmail('test@example.com'),
        password: validatePassword('Password123'),
        name: validateName('John Doe'),
      };

      const result = validateForm(fields);
      expect(result.isValid).toBe(true);
      expect(result.hasErrors).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for invalid fields', () => {
      const fields = {
        email: validateEmail('invalid-email'),
        password: validatePassword('weak'),
        name: validateName('John123'),
      };

      const result = validateForm(fields);
      expect(result.isValid).toBe(false);
      expect(result.hasErrors).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });
});
