import { useState, useCallback } from 'react';

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, context?: any) => string | null;
  section?: string;
  fieldName?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Form data type
export interface FormData {
  [key: string]: any;
}

// Hook return type
export interface UseFormValidationReturn {
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  validateField: (fieldName: string, value: any, context?: any) => string | null;
  validateForm: (data: FormData, context?: any) => boolean;
  setFieldTouched: (fieldName: string, touched: boolean) => void;
  clearErrors: () => void;
  setError: (fieldName: string, error: string) => void;
}

export const useFormValidation = (
  schema: ValidationSchema,
  t: (key: string) => string
): UseFormValidationReturn => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Enhanced validation functions
  const validateAmount = useCallback((amount: string, section: string): ValidationResult => {
    if (amount === '') return { isValid: false, error: t('amountRequired') };
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return { isValid: false, error: t('amountMustBeValid') };
    
    // Prevent zero amounts
    if (numAmount === 0) return { isValid: false, error: t('amountCannotBeZero') };
    
    // Debt-specific validation
    if (section === 'debts') {
      if (numAmount > 0) return { isValid: false, error: t('debtsMustBeNegative') };
      if (numAmount < -1000000000) return { isValid: false, error: t('debtAmountTooHigh') };
    } else {
      // Asset validation (non-debts)
      if (numAmount < 0) return { isValid: false, error: t('amountMustBePositive') };
      if (numAmount > 1000000000) return { isValid: false, error: t('amountTooHigh') };
    }
    
    return { isValid: true };
  }, [t]);

  const validateQuantity = useCallback((quantity: string): ValidationResult => {
    if (quantity === '') return { isValid: false, error: t('quantityRequired') };
    
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity)) return { isValid: false, error: t('quantityMustBeInteger') };
    
    if (numQuantity <= 0) return { isValid: false, error: t('quantityMustBePositive') };
    if (numQuantity > 1000000000) return { isValid: false, error: t('quantityTooHigh') };
    
    return { isValid: true };
  }, [t]);

  const validatePrice = useCallback((price: string, fieldName: string): ValidationResult => {
    if (price === '') return { isValid: true }; // Optional field
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return { isValid: false, error: `${fieldName} ${t('mustBeValidNumber')}` };
    
    if (numPrice < 0) return { isValid: false, error: `${fieldName} ${t('cannotBeNegative')}` };
    if (numPrice > 1000000) return { isValid: false, error: `${fieldName} ${t('tooHigh')}` };
    
    return { isValid: true };
  }, [t]);

  const validateDate = useCallback((date: string | undefined): ValidationResult => {
    if (!date) return { isValid: true }; // Optional field
    
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) return { isValid: false, error: t('invalidDate') };
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (transactionDate > today) return { isValid: false, error: t('dateCannotBeFuture') };
    
    return { isValid: true };
  }, [t]);

  const validateField = useCallback((fieldName: string, value: any, context?: any): string | null => {
    const rule = schema[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return t('fieldRequired');
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Min/Max length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return t('minLength').replace('{min}', rule.minLength.toString());
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return t('maxLength').replace('{max}', rule.maxLength.toString());
      }
    }

    // Min/Max value validation
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      if (rule.min !== undefined && numValue < rule.min) {
        return t('minValue').replace('{min}', rule.min.toString());
      }
      if (rule.max !== undefined && numValue > rule.max) {
        return t('maxValue').replace('{max}', rule.max.toString());
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return t('invalidFormat');
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value, context);
    }

    // Special field validations
    switch (fieldName) {
      case 'amount':
        const amountValidation = validateAmount(value, context?.section || '');
        return amountValidation.isValid ? null : amountValidation.error || null;
      
      case 'quantity':
        const quantityValidation = validateQuantity(value);
        return quantityValidation.isValid ? null : quantityValidation.error || null;
      
      case 'avgPrice':
      case 'currentPrice':
        const priceValidation = validatePrice(value, rule.fieldName || fieldName);
        return priceValidation.isValid ? null : priceValidation.error || null;
      
      case 'date':
        const dateValidation = validateDate(value);
        return dateValidation.isValid ? null : dateValidation.error || null;
      
      default:
        return null;
    }
  }, [schema, t, validateAmount, validateQuantity, validatePrice, validateDate]);

  const validateForm = useCallback((data: FormData, context?: any): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate each field in the schema
    Object.keys(schema).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName], context);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    // Special validations based on context
    if (context?.section === 'transactions') {
      // Additional transaction-specific validations
      if (!data.name?.trim()) {
        newErrors.name = t('nameRequired');
      } else if (data.name.trim().length < 2) {
        newErrors.name = t('nameMinLength');
      } else if (data.name.trim().length > 100) {
        newErrors.name = t('nameMaxLength');
      }
    }

    // Description and notes length validation
    if (data.description && data.description.length > 500) {
      newErrors.description = t('descriptionTooLong');
    }

    if (data.notes && data.notes.length > 1000) {
      newErrors.notes = t('notesTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema, validateField, t]);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    clearErrors,
    setError
  };
};
