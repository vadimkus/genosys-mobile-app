/**
 * Input Validation & Sanitization Utilities
 * Provides comprehensive validation and sanitization for user inputs
 */

import { VALIDATION_RULES } from '../config/environment';

// Validation Result Interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

// Email Validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    errors.push('Email is required');
  } else {
    if (trimmedEmail.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
      errors.push(
        `Email must be less than ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`
      );
    }

    if (!VALIDATION_RULES.EMAIL.PATTERN.test(trimmedEmail)) {
      errors.push('Please enter a valid email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? trimmedEmail : undefined,
  };
};

// Password Validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      errors.push(
        `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`
      );
    }

    if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
      errors.push(
        `Password must be less than ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`
      );
    }

    if (
      VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE &&
      !/[A-Z]/.test(password)
    ) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (
      VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE &&
      !/[a-z]/.test(password)
    ) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (
      VALIDATION_RULES.PASSWORD.REQUIRE_SPECIAL_CHAR &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Name Validation
export const validateName = (
  name: string,
  fieldName: string = 'Name'
): ValidationResult => {
  const errors: string[] = [];
  const trimmedName = name.trim();

  if (!trimmedName) {
    errors.push(`${fieldName} is required`);
  } else {
    if (trimmedName.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
      errors.push(
        `${fieldName} must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`
      );
    }

    if (trimmedName.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
      errors.push(
        `${fieldName} must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`
      );
    }

    if (!VALIDATION_RULES.NAME.PATTERN.test(trimmedName)) {
      errors.push(
        `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? trimmedName : undefined,
  };
};

// Phone Number Validation
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (!cleanedPhone) {
    errors.push('Phone number is required');
  } else {
    if (!VALIDATION_RULES.PHONE.PATTERN.test(cleanedPhone)) {
      errors.push('Please enter a valid phone number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? cleanedPhone : undefined,
  };
};

// Generic Text Input Sanitization
export const sanitizeInput = (input: string, maxLength?: number): string => {
  if (!input) return '';

  // Remove potentially dangerous characters
  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/"/g, '&quot;') // Escape quotes
    .replace(/'/g, '&#x27;') // Escape apostrophes
    .replace(/\//g, '&#x2F;'); // Escape forward slashes

  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

// URL Validation
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    errors.push('URL is required');
  } else {
    try {
      new URL(trimmedUrl);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? trimmedUrl : undefined,
  };
};

// Numeric Validation
export const validateNumber = (
  value: string | number,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): ValidationResult => {
  const errors: string[] = [];
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (min !== undefined && numValue < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && numValue > max) {
      errors.push(`${fieldName} must be at most ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? numValue.toString() : undefined,
  };
};

// Credit Card Validation (Luhn Algorithm)
export const validateCreditCard = (cardNumber: string): ValidationResult => {
  const errors: string[] = [];
  const cleanedNumber = cardNumber.replace(/\s/g, '');

  if (!cleanedNumber) {
    errors.push('Card number is required');
  } else {
    // Check if it's all digits
    if (!/^\d+$/.test(cleanedNumber)) {
      errors.push('Card number must contain only digits');
    } else {
      // Luhn algorithm validation
      let sum = 0;
      let isEven = false;

      for (let i = cleanedNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanedNumber[i]);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      if (sum % 10 !== 0) {
        errors.push('Invalid card number');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? cleanedNumber : undefined,
  };
};

// Form Validation Helper
export const validateForm = (
  fields: Record<string, ValidationResult>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
  hasErrors: boolean;
} => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, validation]) => {
    if (!validation.isValid) {
      errors[fieldName] = validation.errors;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
    hasErrors: !isValid,
  };
};

// Real-time Validation Hook
export const useValidation = () => {
  const validateField = (
    value: string,
    type: 'email' | 'password' | 'name' | 'phone' | 'url' | 'number',
    options?: any
  ): ValidationResult => {
    switch (type) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'name':
        return validateName(value, options?.fieldName);
      case 'phone':
        return validatePhone(value);
      case 'url':
        return validateUrl(value);
      case 'number':
        return validateNumber(
          value,
          options?.min,
          options?.max,
          options?.fieldName
        );
      default:
        return { isValid: true, errors: [] };
    }
  };

  return { validateField };
};

// Export all validation functions
export const validationUtils = {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateUrl,
  validateNumber,
  validateCreditCard,
  validateForm,
  sanitizeInput,
  useValidation,
};
