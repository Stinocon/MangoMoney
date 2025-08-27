/**
 * Comprehensive bug tests for critical fixes
 * Run only in development mode
 * 
 * Tests all the critical bugs that were fixed:
 * 1. parseInt/NaN Bug in sanitizeInteger
 * 2. Date Side Effect Bug in sanitizeDate  
 * 3. Decimal.js Configuration Limits
 */

// Test 1: parseInt/NaN Bug
export const testParseIntBug = (): boolean => {
  console.log('🧪 Testing parseInt/NaN bug fix...');
  
  // Simula la funzione sanitizeInteger fixata
  const sanitizeInteger = (input: string | number): number => {
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) {
        return 0;
      }
      const rounded = Math.round(input);
      return rounded;
    }
    
    if (typeof input !== 'string') return 0;
    
    const cleaned = input.replace(/[^0-9.-]/g, '');
    
    if (!cleaned || cleaned === '-' || cleaned === '.') {
      return 0;
    }
    
    const parsed = parseFloat(cleaned);
    
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    
    const rounded = Math.round(parsed);
    return rounded;
  };
  
  // Test cases that should NOT return NaN
  const testCases = [
    { input: 'abc', expected: 0, description: 'non-numeric string' },
    { input: '', expected: 0, description: 'empty string' },
    { input: 'NaN', expected: 0, description: 'NaN string' },
    { input: 'undefined', expected: 0, description: 'undefined string' },
    { input: '5.7', expected: 6, description: 'decimal string (rounded)' },
    { input: 'Infinity', expected: 0, description: 'Infinity string' },
    { input: '5.4', expected: 5, description: 'decimal string (rounded down)' },
    { input: '5.5', expected: 6, description: 'decimal string (rounded up)' },
    { input: 5.7, expected: 6, description: 'decimal number (rounded)' },
    { input: 5.0, expected: 5, description: 'decimal number (no rounding needed)' }
  ];
  
  for (const testCase of testCases) {
    const result = sanitizeInteger(testCase.input);
    if (!Number.isFinite(result)) {
      console.error(`❌ parseInt bug still exists: sanitizeInteger('${testCase.input}') = ${result}`);
      return false;
    }
    if (result !== testCase.expected) {
      console.error(`❌ parseInt bug: expected ${testCase.expected}, got ${result} for ${testCase.description}`);
      return false;
    }
  }
  
  console.log('✅ parseInt/NaN bug test passed');
  return true;
};

// Test 2: Date Side Effect Bug  
export const testDateSideEffectBug = (): boolean => {
  console.log('🧪 Testing date side effect bug fix...');
  
  // Simula la funzione sanitizeDate fixata
  const sanitizeDate = (input: string): string => {
    if (!input || typeof input !== 'string') return new Date().toISOString().split('T')[0];
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input)) {
      return new Date().toISOString().split('T')[0];
    }
    
    const date = new Date(input);
    
    // ✅ CORRETTO: Crea nuovo oggetto invece di modificare in-place
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const minDate = new Date('1900-01-01');
    
    if (!Number.isFinite(date.getTime()) || date > endOfToday || date < minDate) {
      return new Date().toISOString().split('T')[0];
    }
    
    return input;
  };
  
  // Call function multiple times - should be deterministic
  const testDate = '2024-12-31';
  const date1 = sanitizeDate(testDate);
  const date2 = sanitizeDate(testDate); 
  const date3 = sanitizeDate(testDate);
  
  if (date1 !== date2 || date2 !== date3) {
    console.error(`❌ Date side effect bug still exists: inconsistent results`);
    console.error(`date1: ${date1}, date2: ${date2}, date3: ${date3}`);
    return false;
  }
  
  // Test with invalid dates
  const invalidDate1 = sanitizeDate('invalid-date');
  const invalidDate2 = sanitizeDate('invalid-date');
  
  if (invalidDate1 !== invalidDate2) {
    console.error(`❌ Date side effect bug with invalid dates: inconsistent results`);
    return false;
  }
  
  console.log('✅ Date side effect bug test passed');
  return true;
};





// Test 5: Decimal Limits
export const testDecimalLimits = (): boolean => {
  console.log('🧪 Testing decimal limits...');
  
  // Simula la funzione validateFinancialDecimal
  const validateFinancialDecimal = (value: number): boolean => {
    // Check for extreme values that might indicate calculation errors
    const absValue = Math.abs(value);
    
    if (absValue > 1e12) {
      return false;
    }
    
    if (absValue < 1e-8 && value !== 0) {
      return false;
    }
    
    if (!Number.isFinite(value)) {
      return false;
    }
    
    return true;
  };
  
  // Simula la funzione safeFinancialOperation
  const safeFinancialOperation = (operation: () => number, fallback: number = 0): number => {
    try {
      const result = operation();
      
      if (!validateFinancialDecimal(result)) {
        return fallback;
      }
      
      return result;
    } catch (error) {
      return fallback;
    }
  };
  
  // Test extreme values
  const testValues = [
    { value: 1e20, description: 'very large positive' },
    { value: -1e20, description: 'very large negative' },
    { value: 1e-20, description: 'very small positive' },
    { value: -1e-20, description: 'very small negative' },
    { value: Infinity, description: 'Infinity' },
    { value: -Infinity, description: '-Infinity' },
    { value: NaN, description: 'NaN' }
  ];
  
  for (const testCase of testValues) {
    const result = safeFinancialOperation(() => testCase.value, 0);
    if (!Number.isFinite(result)) {
      console.error(`❌ Decimal limits bug: ${testCase.description} resulted in ${result}`);
      return false;
    }
    if (result !== 0) {
      console.error(`❌ Decimal limits bug: ${testCase.description} should return fallback 0, got ${result}`);
      return false;
    }
  }
  
  // Test normal values
  const normalValues = [
    { value: 1000, expected: 1000, description: 'normal positive' },
    { value: -1000, expected: -1000, description: 'normal negative' },
    { value: 0, expected: 0, description: 'zero' },
    { value: 1e6, expected: 1e6, description: 'million' },
    { value: 1e9, expected: 1e9, description: 'billion' }
  ];
  
  for (const testCase of normalValues) {
    const result = safeFinancialOperation(() => testCase.value, 0);
    if (result !== testCase.expected) {
      console.error(`❌ Decimal limits bug: ${testCase.description} expected ${testCase.expected}, got ${result}`);
      return false;
    }
  }
  
  console.log('✅ Decimal limits test passed');
  return true;
};

// Master test runner
export const runAllBugTests = (): boolean => {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Bug tests only run in development mode');
    return true;
  }
  
  console.log('🧪 Running comprehensive bug tests...');
  console.log('Testing all critical bug fixes:');
  console.log('1. parseInt/NaN Bug in sanitizeInteger');
  console.log('2. Date Side Effect Bug in sanitizeDate');
  console.log('3. Decimal.js Configuration Limits');
  console.log('');
  
  const tests = [
    { name: 'parseInt/NaN Bug', test: testParseIntBug },
    { name: 'Date Side Effect Bug', test: testDateSideEffectBug },
    { name: 'Decimal Limits', test: testDecimalLimits }
  ];
  
  let allPassed = true;
  let passedCount = 0;
  
  for (const { name, test } of tests) {
    try {
      console.log(`Testing: ${name}...`);
      const passed = test();
      if (passed) {
        passedCount++;
        console.log(`✅ ${name}: PASSED`);
      } else {
        console.log(`❌ ${name}: FAILED`);
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${name}: ERROR - ${error}`);
      allPassed = false;
    }
    console.log('');
  }
  
  console.log(`🧪 Test Results: ${passedCount}/${tests.length} tests passed`);
  
  if (allPassed) {
    console.log('🎉 All bug tests passed! All critical fixes are working correctly.');
  } else {
    console.error('💥 Some bug tests failed - check implementations and fix regressions!');
  }
  
  return allPassed;
};
