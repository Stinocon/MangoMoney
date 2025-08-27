/**
 * Security utilities for input sanitization and validation
 * Prevents XSS attacks and ensures data integrity
 * 
 * @version 3.2.0 - Enhanced security with advanced protections
 */

// ✅ SECURITY: Import enhanced sanitization functions
import { 
  sanitizeString as advancedSanitizeString, 
  sanitizeAmount, 
  secureInputValidation,
  auditTrail
} from './advancedSecurity';

/**
 * ✅ ENHANCED: Sanitizes string input to prevent XSS attacks
 * @param input - Raw user input
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  try {
    return advancedSanitizeString(input, maxLength);
  } catch (error) {
    auditTrail.logSecurityEvent('sanitization_error', {
      inputType: 'string',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'medium');
    return '';
  }
};

/**
 * ✅ ENHANCED: Validates and sanitizes numeric input with advanced security
 * @param value - Raw numeric input
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: Number.MAX_SAFE_INTEGER)
 * @returns Validated number
 */
export const validateNumber = (value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
  try {
    // Use advanced sanitization for string inputs
    if (typeof value === 'string') {
      const sanitized = sanitizeAmount(value);
      value = parseFloat(sanitized);
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      auditTrail.logSecurityEvent('number_validation_failed', {
        input: value,
        reason: 'NaN result'
      }, 'low');
      return 0;
    }
    
    // Additional security checks
    if (!secureInputValidation.validateRange(num, min, max)) {
      auditTrail.logSecurityEvent('number_range_violation', {
        value: num,
        min,
        max
      }, 'medium');
      return Math.max(min, Math.min(max, num));
    }
    
    return num;
  } catch (error) {
    auditTrail.logSecurityEvent('number_validation_error', {
      input: value,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'medium');
    return 0;
  }
};

/**
 * Validates and sanitizes date input
 * @param dateString - Raw date string
 * @returns Validated date string (YYYY-MM-DD format) or empty string
 */
export const validateDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Ensure date is not in the future (for financial transactions)
  if (date > new Date()) return '';
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

/**
 * Validates and sanitizes ticker symbols
 * @param ticker - Raw ticker input
 * @returns Sanitized ticker (uppercase, alphanumeric only)
 */
export const validateTicker = (ticker: string): string => {
  if (!ticker || typeof ticker !== 'string') return '';
  
  return ticker
    .replace(/[^A-Za-z0-9]/g, '') // Remove non-alphanumeric characters
    .toUpperCase()
    .slice(0, 10); // Limit to 10 characters
};

/**
 * Validates and sanitizes ISIN codes
 * @param isin - Raw ISIN input
 * @returns Sanitized ISIN (uppercase, alphanumeric only)
 */
export const validateISIN = (isin: string): string => {
  if (!isin || typeof isin !== 'string') return '';
  
  return isin
    .replace(/[^A-Za-z0-9]/g, '') // Remove non-alphanumeric characters
    .toUpperCase()
    .slice(0, 12); // ISIN is exactly 12 characters
};

/**
 * ✅ DEPRECATED: Use secureLocalStorage instead for encrypted storage
 * Legacy function kept for compatibility
 * @deprecated Use secureLocalStorage.setItem() for encrypted storage
 */
export const safeLocalStorageSet = (key: string, data: any): void => {
  try {
    auditTrail.logSecurityEvent('legacy_storage_used', {
      key: key.replace(/mangomoney-/, ''),
      action: 'set'
    }, 'low');
    
    const sanitizedData = typeof data === 'string' ? sanitizeString(data) : data;
    localStorage.setItem(key, JSON.stringify(sanitizedData));
  } catch (error) {
    auditTrail.logSecurityEvent('legacy_storage_error', {
      key,
      action: 'set',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'medium');
    console.error('Failed to store data in localStorage:', error);
  }
};

/**
 * ✅ DEPRECATED: Use secureLocalStorage instead for encrypted storage
 * Legacy function kept for compatibility
 * @deprecated Use secureLocalStorage.getItem() for encrypted storage
 */
export const safeLocalStorageGet = <T>(key: string, defaultValue: T): T => {
  try {
    auditTrail.logSecurityEvent('legacy_storage_used', {
      key: key.replace(/mangomoney-/, ''),
      action: 'get'
    }, 'low');
    
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    const parsed = JSON.parse(item);
    return parsed as T;
  } catch (error) {
    auditTrail.logSecurityEvent('legacy_storage_error', {
      key,
      action: 'get',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'medium');
    console.error('Failed to retrieve data from localStorage:', error);
    return defaultValue;
  }
};

// ✅ Export advanced security functions for easy access
export { sanitizeAmount, sanitizeCSVCell, secureInputValidation } from './advancedSecurity';
