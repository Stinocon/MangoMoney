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
  // Enhanced validation options
  noFutureDate?: boolean;
  currency?: boolean;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
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
  validateAllFields: (data: FormData, context?: any) => { [key: string]: string };
}

export const useFormValidation = (
  schema: ValidationSchema,
  t: (key: string) => string
): UseFormValidationReturn => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // UNIFIED validation functions with consistent error messages
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

  // ENHANCED date validation with no future dates
  const validateDate = useCallback((date: string | undefined, noFutureDate: boolean = true): ValidationResult => {
    if (!date) return { isValid: true }; // Optional field
    
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) return { isValid: false, error: t('invalidDate') };
    
    if (noFutureDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (transactionDate > today) return { isValid: false, error: t('dateCannotBeFuture') };
    }
    
    return { isValid: true };
  }, [t]);

  // UNIFIED field validation with enhanced rules
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

    // Enhanced validation rules
    if (rule.currency && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return t('amountMustBeValid');
      if (numValue < 0) return t('amountMustBePositive');
    }

    if (rule.integer && typeof value === 'string') {
      const numValue = parseInt(value);
      if (isNaN(numValue)) return t('quantityMustBeInteger');
      if (numValue <= 0) return t('quantityMustBePositive');
    }

    if (rule.positive && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return t('amountMustBeValid');
      if (numValue <= 0) return t('amountMustBePositive');
    }

    if (rule.negative && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return t('amountMustBeValid');
      if (numValue >= 0) return t('amountMustBeNegative');
    }

    // Date validation with no future date option
    if (rule.noFutureDate !== undefined && typeof value === 'string') {
      const dateValidation = validateDate(value, rule.noFutureDate);
      if (!dateValidation.isValid) return dateValidation.error || null;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value, context);
    }

    // Special field validations (backward compatibility)
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
        const dateValidation = validateDate(value, true); // Default to no future dates
        return dateValidation.isValid ? null : dateValidation.error || null;
      
      default:
        return null;
    }
  }, [schema, t, validateAmount, validateQuantity, validatePrice, validateDate]);

  // NEW: Validate all fields and return errors object
  const validateAllFields = useCallback((data: FormData, context?: any): { [key: string]: string } => {
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
      if (!data.assetType?.trim()) {
        newErrors.assetType = t('assetTypeRequired');
      }
    }

    // Description and notes length validation
    if (data.description && data.description.length > 500) {
      newErrors.description = t('descriptionTooLong');
    }

    if (data.notes && data.notes.length > 1000) {
      newErrors.notes = t('notesTooLong');
    }

    return newErrors;
  }, [schema, validateField, t]);

  // UNIFIED form validation
  const validateForm = useCallback((data: FormData, context?: any): boolean => {
    const newErrors = validateAllFields(data, context);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateAllFields]);

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
    setError,
    validateAllFields
  };
};

// Predefined validation schemas for common use cases
export const createValidationSchema = {
  // Asset validation schema
  asset: (section: string): ValidationSchema => ({
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      fieldName: 'Nome'
    },
    amount: {
      required: true,
      currency: true,
      positive: section !== 'debts',
      negative: section === 'debts',
      fieldName: 'Importo'
    },
    description: {
      maxLength: 500,
      fieldName: 'Descrizione'
    },
    notes: {
      maxLength: 1000,
      fieldName: 'Note'
    }
  }),

  // Transaction validation schema
  transaction: (): ValidationSchema => ({
    assetType: {
      required: true,
      fieldName: 'Tipo Asset'
    },
    amount: {
      required: true,
      currency: true,
      positive: true,
      fieldName: 'Importo'
    },
    quantity: {
      required: true,
      integer: true,
      positive: true,
      fieldName: 'Quantità'
    },
    date: {
      required: true,
      noFutureDate: true,
      fieldName: 'Data'
    },
    avgPrice: {
      currency: true,
      positive: true,
      fieldName: 'Prezzo medio'
    },
    currentPrice: {
      currency: true,
      positive: true,
      fieldName: 'Prezzo corrente'
    },
    commissions: {
      currency: true,
      positive: true,
      fieldName: 'Commissioni'
    },
    notes: {
      maxLength: 1000,
      fieldName: 'Note'
    }
  }),

  // Settings validation schema
  settings: (): ValidationSchema => ({
    swrRate: {
      min: 1,
      max: 10,
      fieldName: 'Tasso SWR'
    },
    inflationRate: {
      min: 0,
      max: 50,
      fieldName: 'Tasso inflazione'
    },
    monthlyExpenses: {
      currency: true,
      positive: true,
      fieldName: 'Spese mensili'
    }
  })
};
