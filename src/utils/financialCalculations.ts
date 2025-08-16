/**
 * Safe financial calculation utilities to handle floating-point precision issues
 */

/**
 * Performs a safe financial operation with error handling and fallback
 */
export const safeFinancialOperation = (operation: () => number, fallback: number = 0): number => {
  try {
    const result = operation();
    return Number.isFinite(result) ? result : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Safe addition for financial amounts
 */
export const safeAdd = (a: number, b: number): number => {
  return safeFinancialOperation(() => {
    // Use multiplication by 100 to avoid floating point issues
    return Math.round((a + b) * 100) / 100;
  });
};

/**
 * Safe subtraction for financial amounts
 */
export const safeSubtract = (a: number, b: number): number => {
  return safeFinancialOperation(() => {
    return Math.round((a - b) * 100) / 100;
  });
};

/**
 * Safe multiplication for financial amounts
 */
export const safeMultiply = (a: number, b: number): number => {
  return safeFinancialOperation(() => {
    return Math.round(a * b * 100) / 100;
  });
};

/**
 * Safe division for financial amounts
 */
export const safeDivide = (a: number, b: number, fallback: number = 0): number => {
  if (b === 0) return fallback;
  return safeFinancialOperation(() => {
    return Math.round((a / b) * 100) / 100;
  });
};

/**
 * Safe percentage calculation
 */
export const safePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return safeFinancialOperation(() => {
    return Math.round((part / total) * 10000) / 100; // 2 decimal places
  });
};

/**
 * Safe CAGR calculation with proper edge case handling
 */
export const safeCAGR = (initialValue: number, finalValue: number, years: number): number => {
  if (years <= 0 || initialValue <= 0) return 0;
  
  return safeFinancialOperation(() => {
    const totalReturnRatio = (finalValue - initialValue) / initialValue;
    
    // Handle negative returns properly
    if (totalReturnRatio <= -1) return -99.9; // Cap at -99.9%
    
    const cagr = (Math.pow(1 + totalReturnRatio, 1 / years) - 1) * 100;
    
    // Cap extreme values
    if (cagr > 10000) return 10000; // Cap at 10000%
    if (cagr < -99.9) return -99.9; // Cap at -99.9%
    
    return Math.round(cagr * 100) / 100; // 2 decimal places
  }, 0);
};

/**
 * Safe SWR calculation
 */
export const safeSWR = (assets: number, rate: number): number => {
  if (assets <= 0 || rate <= 0) return 0;
  return safeFinancialOperation(() => {
    return Math.round((assets * rate / 100) * 100) / 100;
  });
};
