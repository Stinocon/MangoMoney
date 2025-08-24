/**
 * Advanced Security Utilities for MangoMoney
 * 
 * @description
 * Comprehensive security functions for input validation, XSS prevention,
 * CSV injection protection, and data sanitization.
 * 
 * @version 3.2.0
 * @author MangoMoney Security Team
 */

// ✅ CRITICO: Advanced Input Sanitization
export const sanitizeAmount = (input: string | number): string => {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new Error('Invalid number: not finite');
    }
    return input.toString();
  }
  
  if (typeof input !== 'string') {
    throw new Error('Invalid input type: expected string or number');
  }
  
  // Remove all non-numeric except single decimal point and minus
  let cleaned = input.replace(/[^\d.,\-]/g, '');
  
  // Handle European decimal format (comma as decimal separator)
  cleaned = cleaned.replace(',', '.');
  
  // Remove multiple decimal points (keep only first)
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Handle negative numbers (only one minus at start)
  const hasNegative = cleaned.startsWith('-');
  cleaned = cleaned.replace(/-/g, '');
  if (hasNegative) cleaned = '-' + cleaned;
  
  // Validate final format
  const numberRegex = /^-?\d*\.?\d*$/;
  if (!numberRegex.test(cleaned)) {
    throw new Error('Invalid number format after sanitization');
  }
  
  // Additional validation for edge cases
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    return '0';
  }
  
  // Prevent excessive decimal places (max 8 for crypto precision)
  const decimalParts = cleaned.split('.');
  if (decimalParts.length === 2 && decimalParts[1].length > 8) {
    cleaned = decimalParts[0] + '.' + decimalParts[1].substring(0, 8);
  }
  
  return cleaned;
};

// ✅ CRITICO: Enhanced XSS Protection
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  return input
    // Decode HTML entities first to catch encoded attacks
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/').replace(/&#x5C;/g, '\\')
    .replace(/&amp;/g, '&')
    
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Remove dangerous protocols
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/data:application\/javascript/gi, '')
    .replace(/data:application\/x-javascript/gi, '')
    
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    
    // Remove dangerous functions
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/setTimeout\s*\(/gi, '')
    .replace(/setInterval\s*\(/gi, '')
    .replace(/Function\s*\(/gi, '')
    
    // Remove control characters and unicode control chars
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, '') // Zero width and RTL/LTR marks
    
    // Remove potential CSS injection
    .replace(/expression\s*\(/gi, '')
    .replace(/url\s*\(/gi, '')
    .replace(/import\s*['"]/gi, '')
    
    .trim()
    .slice(0, maxLength);
};

// ✅ CRITICO: CSV Injection Prevention
export const sanitizeCSVCell = (value: string | number): string => {
  let cellValue = String(value);
  
  // Prevent formula injection
  if (cellValue.startsWith('=') || 
      cellValue.startsWith('+') || 
      cellValue.startsWith('-') ||
      cellValue.startsWith('@')) {
    cellValue = "'" + cellValue; // Prefix with single quote
  }
  
  // Prevent DDE attacks and dangerous patterns
  const dangerousPatterns = [
    /cmd\|/gi,
    /powershell/gi,
    /exec/gi,
    /system/gi,
    /@SUM/gi,
    /\|.*!/gi, // DDE pattern
    /=.*\+.*\*/gi, // Complex formula patterns
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(cellValue))) {
    // Remove dangerous characters instead of just prefixing
    cellValue = cellValue.replace(/[=+\-@|!]/g, '');
    cellValue = "SANITIZED_" + cellValue;
  }
  
  // Escape quotes in CSV
  if (cellValue.includes('"')) {
    cellValue = cellValue.replace(/"/g, '""');
  }
  
  // Wrap in quotes if contains comma, newline, or quotes
  if (cellValue.includes(',') || cellValue.includes('\n') || cellValue.includes('"')) {
    cellValue = `"${cellValue}"`;
  }
  
  return cellValue;
};

// ✅ Multi-layer Input Validation
export const secureInputValidation = {
  // Layer 1: Type checking
  validateType: (value: any, expectedType: string): boolean => {
    return typeof value === expectedType;
  },

  // Layer 2: Range validation
  validateRange: (value: number, min: number, max: number): boolean => {
    return Number.isFinite(value) && value >= min && value <= max;
  },

  // Layer 3: Format validation
  validateFormat: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  },

  // Layer 4: Business logic validation
  validateBusinessRules: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Financial business rules
    if (data.assetType === 'debt' && data.amount > 0) {
      errors.push('Debt amounts must be negative or zero');
    }
    
    if (data.quantity && data.quantity < 0) {
      errors.push('Quantity cannot be negative');
    }
    
    if (data.percentage && (data.percentage < 0 || data.percentage > 100)) {
      errors.push('Percentage must be between 0 and 100');
    }
    
    // String length validation
    if (data.name && data.name.length > 100) {
      errors.push('Name too long (max 100 characters)');
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('Description too long (max 500 characters)');
    }
    
    return { valid: errors.length === 0, errors };
  }
};

// ✅ Rate Limiting System
class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();
  
  checkLimit(action: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const key = action;
    const current = this.limits.get(key);
    
    if (!current || now > current.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (current.count >= maxRequests) {
      // Log security event
      console.warn(`🚨 Rate limit exceeded for action: ${action}`);
      return false;
    }
    
    current.count++;
    return true;
  }
  
  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.limits.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.limits.delete(key);
    });
  }
}

export const rateLimiter = new RateLimiter();

// ✅ Security Audit Trail
export const auditTrail = {
  logSecurityEvent: (event: string, details: any, severity: 'low' | 'medium' | 'high') => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: sanitizeForLogging(details),
      severity,
      sessionId: sessionStorage.getItem('session-id') || 'unknown',
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const auditLog = JSON.parse(localStorage.getItem('security-audit') || '[]');
    auditLog.push(auditEntry);
    
    // Keep only last 100 entries for storage efficiency
    if (auditLog.length > 100) {
      auditLog.shift();
    }
    
    try {
      localStorage.setItem('security-audit', JSON.stringify(auditLog));
    } catch (error) {
      console.error('Failed to save audit trail:', error);
    }
    
    if (severity === 'high') {
      console.warn('🚨 High severity security event:', auditEntry);
    }
  }
};

// ✅ Privacy-First Data Sanitization
export const sanitizeForLogging = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitive = ['amount', 'balance', 'iban', 'accountNumber', 'value', 'currentPrice', 'avgPrice'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  // Recursively sanitize object properties
  Object.keys(sanitized).forEach(key => {
    if (sensitive.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  });
  
  return sanitized;
};

// ✅ Content Security Policy Violations Handler
export const cspViolationHandler = (event: SecurityPolicyViolationEvent) => {
  auditTrail.logSecurityEvent('csp_violation', {
    violatedDirective: event.violatedDirective,
    blockedURI: event.blockedURI,
    documentURI: event.documentURI,
    originalPolicy: event.originalPolicy
  }, 'high');
};

// ✅ Enhanced Error Handling (no data leakage)
export const secureErrorHandler = (error: Error, context: string): string => {
  // Log full error details securely
  auditTrail.logSecurityEvent('application_error', {
    context,
    message: error.message,
    stack: error.stack
  }, 'medium');
  
  // Return sanitized error message for user
  const userFriendlyMessages = {
    'validation': 'Input validation failed. Please check your data.',
    'calculation': 'Calculation error occurred. Please verify your inputs.',
    'storage': 'Data storage error. Please try again.',
    'export': 'Export failed. Please check your data and try again.',
    'import': 'Import failed. Please verify file format and content.'
  };
  
  return userFriendlyMessages[context as keyof typeof userFriendlyMessages] || 
         'An unexpected error occurred. Please try again.';
};

// Run rate limiter cleanup periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 60000); // Cleanup every minute
}
