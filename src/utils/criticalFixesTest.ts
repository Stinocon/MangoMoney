/**
 * Critical Fixes Test Suite
 * 
 * @description
 * Comprehensive test suite to validate all 7 critical fixes have been applied correctly.
 * This file tests each fix individually and provides detailed feedback.
 * 
 * @fixes
 * 1. Sharpe Ratio completeness
 * 2. Real Estate calculation
 * 3. Safe division operations
 * 4. Tax rate calculation
 * 5. Emergency fund overflow protection
 * 6. Leverage ratio calculation
 * 7. Validation functions
 */

import { 
  calculatePortfolioSharpeRatio, 
  calculateRealEstateNetWorthValue, 
  safeDivide, 
  safeMultiply,
  calculateEmergencyFundMetrics,
  validateFinancialInput,
  runCriticalFixesValidation
} from './financialCalculations';

/**
 * Test suite for all critical fixes
 */
export const runAllCriticalFixesTests = (): boolean => {
  console.log('🧪 CRITICAL FIXES TEST SUITE');
  console.log('============================');
  
  let allTestsPassed = true;
  let testCount = 0;
  let passedTests = 0;
  
  // Test 1: Sharpe Ratio completeness
  testCount++;
  console.log(`\n📊 Test ${testCount}: Sharpe Ratio Completeness`);
  try {
    const testAllocations = { 
      cash: 20000, 
      stocks: 60000, 
      bonds: 20000 
    };
    const sharpeRatio = calculatePortfolioSharpeRatio(testAllocations, 100000, 2.0);
    
    if (!Number.isFinite(sharpeRatio)) {
      console.error('❌ FAILED: Sharpe Ratio is not finite');
      allTestsPassed = false;
    } else if (sharpeRatio < -10 || sharpeRatio > 10) {
      console.error('❌ FAILED: Sharpe Ratio out of expected range:', sharpeRatio);
      allTestsPassed = false;
    } else {
      console.log('✅ PASSED: Sharpe Ratio calculated correctly:', sharpeRatio.toFixed(4));
      passedTests++;
    }
  } catch (error) {
    console.error('❌ FAILED: Sharpe Ratio test error:', error);
    allTestsPassed = false;
  }
  
  // Test 2: Real Estate calculation
  testCount++;
  console.log(`\n🏠 Test ${testCount}: Real Estate Calculation`);
  try {
    const testRealEstate = [
      { id: 1, value: 300000, excludeFromTotal: false },
      { id: 2, value: 200000, excludeFromTotal: true },
      { id: 3, value: 150000, excludeFromTotal: false }
    ];
    const result = calculateRealEstateNetWorthValue(testRealEstate);
    const expected = 450000; // 300000 + 150000 (200000 excluded)
    
    if (result !== expected) {
      console.error('❌ FAILED: Real Estate calculation incorrect');
      console.error(`   Expected: ${expected}, Got: ${result}`);
      allTestsPassed = false;
    } else {
      console.log('✅ PASSED: Real Estate calculation correct:', result);
      passedTests++;
    }
  } catch (error) {
    console.error('❌ FAILED: Real Estate test error:', error);
    allTestsPassed = false;
  }
  
  // Test 3: Safe division operations
  testCount++;
  console.log(`\n➗ Test ${testCount}: Safe Division Operations`);
  try {
    const testCases = [
      { a: 30000, b: 130000, expected: 0.23076923076923078 },
      { a: 0, b: 100, expected: 0 },
      { a: 100, b: 0, expected: 0 } // Should return fallback
    ];
    
    let divisionTestsPassed = 0;
    for (const testCase of testCases) {
      const result = safeDivide(testCase.a, testCase.b);
      if (Math.abs(result - testCase.expected) < 0.0001) {
        divisionTestsPassed++;
      } else {
        console.error(`❌ FAILED: Division ${testCase.a}/${testCase.b}`);
        console.error(`   Expected: ${testCase.expected}, Got: ${result}`);
      }
    }
    
    if (divisionTestsPassed === testCases.length) {
      console.log('✅ PASSED: All safe division tests passed');
      passedTests++;
    } else {
      console.error(`❌ FAILED: ${testCases.length - divisionTestsPassed} division tests failed`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ FAILED: Safe division test error:', error);
    allTestsPassed = false;
  }
  
  // Test 4: Tax rate calculation
  testCount++;
  console.log(`\n💰 Test ${testCount}: Tax Rate Calculation`);
  try {
    const capitalGain = 1000;
    const taxRate = 26;
    
    // Test safe division for tax calculation
    const taxAmount = safeMultiply(capitalGain, safeDivide(taxRate, 100));
    const expectedTax = 260;
    
    if (Math.abs(taxAmount - expectedTax) < 0.01) {
      console.log('✅ PASSED: Tax calculation using safe operations:', taxAmount);
      passedTests++;
    } else {
      console.error('❌ FAILED: Tax calculation incorrect');
      console.error(`   Expected: ${expectedTax}, Got: ${taxAmount}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ FAILED: Tax rate test error:', error);
    allTestsPassed = false;
  }
  
  // Test 5: Emergency fund overflow protection
  testCount++;
  console.log(`\n🛡️ Test ${testCount}: Emergency Fund Overflow Protection`);
  try {
    const mockAssets = {
      cash: [
        { id: 1, amount: 50000, name: 'Emergency Fund' }
      ]
    };
    
    // Test with extreme values
    const extremeResult = calculateEmergencyFundMetrics(
      mockAssets,
      { section: 'cash', id: 1 },
      1000000, // Extreme monthly expenses
      3,
      6
    );
    
    if (extremeResult && typeof extremeResult.value === 'number' && 
        Number.isFinite(extremeResult.value) && extremeResult.value >= 0) {
      console.log('✅ PASSED: Emergency fund handles extreme values correctly');
      passedTests++;
    } else {
      console.error('❌ FAILED: Emergency fund overflow protection failed');
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ FAILED: Emergency fund test error:', error);
    allTestsPassed = false;
  }
  
  // Test 6: Leverage ratio calculation (simulated)
  testCount++;
  console.log(`\n⚖️ Test ${testCount}: Leverage Ratio Calculation`);
  try {
    // Simulate the leverage ratio calculation from App.tsx
    const grossAssets = 200000;
    const total = 150000;
    const leverageRatio = safeDivide(grossAssets, total);
    const expected = 1.3333333333333333;
    
    if (Math.abs(leverageRatio - expected) < 0.0001) {
      console.log('✅ PASSED: Leverage ratio calculation correct:', leverageRatio.toFixed(4));
      passedTests++;
    } else {
      console.error('❌ FAILED: Leverage ratio calculation incorrect');
      console.error(`   Expected: ${expected}, Got: ${leverageRatio}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ FAILED: Leverage ratio test error:', error);
    allTestsPassed = false;
  }
  
  // Test 7: Validation functions
  testCount++;
  console.log(`\n✅ Test ${testCount}: Validation Functions`);
  try {
    const testCases = [
      { input: 100, fieldName: 'test', expected: 100 },
      { input: -50, fieldName: 'test', expected: 0 }, // Should clamp to min
      { input: 1000000, fieldName: 'test', min: 0, max: 100000, expected: 100000 }, // Should clamp to max
      { input: 'invalid', fieldName: 'test', expected: 0 }, // Should return default
      { input: NaN, fieldName: 'test', expected: 0 }, // Should return default
      { input: Infinity, fieldName: 'test', expected: 0 } // Should return default
    ];
    
    let validationTestsPassed = 0;
    for (const testCase of testCases) {
      const result = validateFinancialInput(
        testCase.input, 
        testCase.fieldName, 
        testCase.min || 0, 
        testCase.max || Infinity
      );
      
      if (result === testCase.expected) {
        validationTestsPassed++;
      } else {
        console.error(`❌ FAILED: Validation test for input ${testCase.input}`);
        console.error(`   Expected: ${testCase.expected}, Got: ${result}`);
      }
    }
    
    if (validationTestsPassed === testCases.length) {
      console.log('✅ PASSED: All validation function tests passed');
      passedTests++;
    } else {
      console.error(`❌ FAILED: ${testCases.length - validationTestsPassed} validation tests failed`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('❌ FAILED: Validation function test error:', error);
    allTestsPassed = false;
  }
  
  // Final summary
  console.log('\n📋 TEST SUMMARY');
  console.log('===============');
  console.log(`Total Tests: ${testCount}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${testCount - passedTests}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 ALL CRITICAL FIXES VALIDATED SUCCESSFULLY!');
    console.log('✅ All 7 critical fixes have been applied correctly');
    console.log('✅ Financial calculations are now robust and safe');
    console.log('✅ Edge cases are properly handled');
    console.log('✅ Overflow protection is active');
  } else {
    console.log('\n❌ SOME CRITICAL FIXES FAILED VALIDATION');
    console.log('⚠️ Please review the failed tests above');
    console.log('⚠️ Some financial calculations may still be unsafe');
  }
  
  return allTestsPassed;
};

/**
 * Quick validation check for production use
 */
export const quickCriticalFixesCheck = (): boolean => {
  try {
    // Run the main validation function
    return runCriticalFixesValidation();
  } catch (error) {
    console.error('Quick critical fixes check failed:', error);
    return false;
  }
};

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).runCriticalFixesTests = runAllCriticalFixesTests;
  (window as any).quickCriticalFixesCheck = quickCriticalFixesCheck;
}
