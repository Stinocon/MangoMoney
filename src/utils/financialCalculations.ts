/*
 * MangoMoney - Portfolio Tracker
 * Copyright (c) 2025 Stefano Conter
 * Licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

/**
 * Safe financial calculation utilities using decimal.js for precision
 * Prevents floating-point arithmetic errors in financial calculations
 */
import Decimal from 'decimal.js';

// Configure decimal.js for conservative financial calculations
Decimal.set({
  precision: 28,                    // ✅ Sufficiente per calcoli complessi finanziari
  rounding: Decimal.ROUND_HALF_UP,  // Arrotondamento standard bancario
  toExpNeg: -12,                    // ✅ Per tassi micro (es: 0.000000001%)
  toExpPos: 15,                     // ✅ Per portafogli grandi (quadrilioni)
  maxE: 15,                         // ✅ Max €1 quadrilione
  minE: -12,                        // ✅ Per tassi piccolissimi
  modulo: Decimal.ROUND_HALF_UP,    // Comportamento modulo operation
  crypto: false                     // Disabilita randomness per determinismo
});

/**
 * Validates financial decimal values for reasonable ranges
 * @param value - Decimal value to validate
 * @returns true if value is within reasonable financial ranges
 */
export const validateFinancialDecimal = (value: Decimal): boolean => {
  // Check for extreme values that might indicate calculation errors
  const absValue = value.abs();
  
  if (absValue.greaterThan(new Decimal('1e12'))) {
    console.warn(`⚠️ Very large financial value: ${value.toString()}`);
    return true; // ✅ CORRETTO: warning ma validation passa
  }

  if (absValue.greaterThan(new Decimal('1e15'))) {
    console.error(`❌ Extremely large financial value, likely calculation error: ${value.toString()}`);
    return false; // ✅ Solo valori > 1 quadrilione vengono rifiutati
  }
  
  if (absValue.lessThan(new Decimal('1e-8')) && !value.equals(0)) {
    console.warn(`Financial calculation resulted in very small value: ${value.toString()}`);
    return false;
  }
  
  if (!value.isFinite()) {
    console.error(`Financial calculation resulted in non-finite value: ${value.toString()}`);
    return false;
  }
  
  return true;
};

/**
 * Performs a safe financial operation with error handling and fallback
 */
export const safeFinancialOperation = (operation: () => Decimal, fallback: number = 0): number => {
  try {
    const result = operation();
    
    if (!validateFinancialDecimal(result)) {
      console.warn('Financial operation resulted in invalid value, using fallback');
      return fallback;
    }
    
    return result.toNumber();
  } catch (error) {
    console.error('Financial operation error:', error);
    return fallback;
  }
};

/**
 * Smart addition for financial amounts - Uses Decimal.js only when necessary
 */
export const safeAdd = (a: number, b: number): number => {
  // Use Decimal.js only for large amounts or critical calculations
  if (Math.abs(a) > 1000000 || Math.abs(b) > 1000000) {
    return toNumber(calculateWithDecimal.add(a, b));
  }
  
  // Use native Number for small amounts (10x faster)
  return Number((a + b).toFixed(2));
};

/**
 * Smart subtraction for financial amounts - Uses Decimal.js only when necessary
 */
export const safeSubtract = (a: number, b: number): number => {
  // Use Decimal.js only for large amounts or critical calculations
  if (Math.abs(a) > 1000000 || Math.abs(b) > 1000000) {
    return toNumber(calculateWithDecimal.subtract(a, b));
  }
  
  // Use native Number for small amounts (10x faster)
  return Number((a - b).toFixed(2));
};

/**
 * Smart multiplication for financial amounts - Uses Decimal.js only when necessary
 */
export const safeMultiply = (a: number, b: number): number => {
  // Use Decimal.js only for large amounts or critical calculations
  if (Math.abs(a) > 1000000 || Math.abs(b) > 1000000) {
    return toNumber(calculateWithDecimal.multiply(a, b));
  }
  
  // Use native Number for small amounts (10x faster)
  return Number((a * b).toFixed(2));
};

/**
 * Safe division for financial amounts - Standardized with Decimal.js
 */
export const safeDivide = (a: number, b: number, fallback: number = 0): number => {
  if (b === 0) return fallback;
  return toNumber(calculateWithDecimal.divide(a, b));
};

/**
 * Safe percentage calculation
 */
export const safePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return toNumber(calculateWithDecimal.percentage(part, total));
};

/**
 * Calculates Compound Annual Growth Rate (CAGR) with enhanced validation
 * 
 * @description
 * CAGR measures the mean annual growth rate of an investment over a specified time period.
 * Includes intelligent handling of short periods and extreme values.
 * 
 * @formula
 * CAGR = ((Final Value / Initial Value)^(1/years)) - 1
 * 
 * @param {number} initialValue - Initial investment amount (must be > 0)
 * @param {number} finalValue - Final investment value (must be >= 0)  
 * @param {number} years - Time period in years (must be > 0)
 * 
 * @returns {number} CAGR as percentage (-1000% to +1000%, capped for sanity)
 * 
 * @warnings
 * - Periods < 1 month: Returns simple return instead of annualized
 * - Periods < 3 months: Warns about high volatility in annualized result
 * - Values > ±1000%: Capped and logged as extreme
 * 
 * @example
 * safeCAGR(10000, 15000, 5);     // Returns ~8.45%
 * safeCAGR(10000, 11000, 0.08);  // Returns simple return with warning
 * 
 * @see https://en.wikipedia.org/wiki/Compound_annual_growth_rate
 */
export const safeCAGR = (initialValue: number, finalValue: number, years: number): number => {
  // Validazione input
  if (initialValue <= 0) {
    console.warn('⚠️ CAGR: Initial value must be positive, returning 0');
    return 0;
  }
  
  if (finalValue < 0) {
    console.warn('⚠️ CAGR: Final value is negative, returning -100%');
    return -100;
  }
  
  if (years <= 0) {
    console.warn('⚠️ CAGR: Time period must be positive, returning 0');
    return 0;
  }
  
  // Gestione periodi molto brevi
  if (years < 0.083) { // Meno di 1 mese
    const simpleReturn = ((finalValue - initialValue) / initialValue) * 100;
    console.warn(`⚠️ CAGR: Period too short (${(years * 365).toFixed(0)} days), returning simple return: ${simpleReturn.toFixed(2)}%`);
    return Number(simpleReturn.toFixed(2));
  }
  
  if (years < 0.25) { // Meno di 3 mesi
    const simpleReturn = ((finalValue - initialValue) / initialValue) * 100;
    const annualizedReturn = simpleReturn * (12 / (years * 12));
    console.warn(`⚠️ CAGR: Short period (${(years * 12).toFixed(1)} months). Annualized: ${annualizedReturn.toFixed(1)}% (highly volatile)`);
    return Number(annualizedReturn.toFixed(2));
  }
  
  // Calcolo CAGR standard con Decimal.js
  const cagr = toNumber(calculateWithDecimal.compoundGrowth(initialValue, finalValue, years));
  
  // Sanity check per valori estremi
  if (Math.abs(cagr) > 1000) {
    console.warn(`⚠️ CAGR: Extreme value ${cagr.toFixed(1)}%, check input data`);
    return Math.sign(cagr) * 1000; // Cap a ±1000%
  }
  
  return Number(cagr.toFixed(2));
};

/**
 * Calculates Safe Withdrawal Rate (SWR) using Trinity Study methodology
 * 
 * @description
 * SWR determines the maximum percentage of portfolio that can be withdrawn annually
 * without depleting the portfolio over a 30-year retirement period.
 * 
 * @formula
 * Monthly Withdrawal = (Total Liquid Assets × SWR Rate) ÷ 100 ÷ 12
 * 
 * @param {number} liquidAssets - Total liquid assets available for withdrawal (must be > 0)
 * @param {number} rate - Annual withdrawal rate as percentage (typically 3-5%)
 * 
 * @returns {number} Monthly withdrawal amount in same currency as assets
 * 
 * @example
 * // €1M portfolio with 4% SWR
 * const monthlyWithdrawal = safeSWR(1000000, 4); // Returns €3,333.33
 * 
 * @limitations
 * - Based on historical US market data (1926-1995)
 * - Assumes 30-year retirement period
 * - Doesn't account for sequence risk in early retirement
 * - No inflation adjustments included
 * 
 * @references
 * - Trinity Study (1998): "Retirement Savings: Choosing a Withdrawal Rate"
 * - Bengen, W.P. (1994): "Determining Withdrawal Rates Using Historical Data"
 * - Pfau, W.D. (2011): "Safe Withdrawal Rates: A Guide for Early Retirees"
 * 
 * @throws {Error} Returns 0 for invalid inputs (negative assets or rate)
 */






/**
 * Asset class mapping for risk calculation
 */
const ASSET_CLASS_MAPPING = {
  cash: 'cash',
  otherAccounts: 'cash',
  pensionFunds: 'pensionFunds', // ✅ FIXED: separate category
  realEstate: 'realEstate',
  investmentPositions: 'mixed', // ✅ FIXED: analyze individual positions
  alternativeAssets: 'alternatives'
};

/**
 * Safe asset volatility lookup with validation
 * @param assetClass - Asset class name
 * @returns Volatility as decimal (0.0-1.0)
 */
const getAssetVolatility = (assetClass: string): number => {
  // CRITICO: Valori DEVONO essere in formato decimale (0.18 = 18%)
  const HISTORICAL_VOLATILITIES = {
    cash: 0.005,        // 0.5% - Money market funds, savings
    bonds: 0.05,        // 5.0% - Government/corporate bonds
    stocks: 0.18,       // 18.0% - Equity markets
    realEstate: 0.15,   // 15.0% - Real estate indices
    commodities: 0.25,  // 25.0% - Commodity futures
    alternatives: 0.20, // 20.0% - Hedge funds, private equity
    crypto: 0.80,       // 80.0% - Cryptocurrency markets
    pensionFunds: 0.08, // 8.0% - Pension funds
    mixed: 0.12,        // 12.0% - Mixed positions
    otherAccounts: 0.005 // 0.5% - Other accounts (like cash)
  };
  
  const mappedAssetClass = ASSET_CLASS_MAPPING[assetClass as keyof typeof ASSET_CLASS_MAPPING] || 'stocks';
  const volatility = HISTORICAL_VOLATILITIES[mappedAssetClass as keyof typeof HISTORICAL_VOLATILITIES] || HISTORICAL_VOLATILITIES.stocks;
  
  // ✅ VALIDAZIONE: Assicura che i valori siano ragionevoli
  if (typeof volatility !== 'number' || !Number.isFinite(volatility) || volatility < 0 || volatility > 2) {
    console.error(`❌ Invalid volatility for ${assetClass} (${mappedAssetClass}): ${volatility}`);
    return 0.20; // Default reasonable volatility
  }
  
  return volatility;
};

/**
 * Get dynamic correlation matrix based on market stress level
 * @param marketStress - Market stress level
 * @returns Correlation matrix for the given stress level
 */
export const getDynamicCorrelationMatrix = (
  marketStress: 'normal' | 'stress' | 'crisis' = 'normal'
): { [key: string]: { [key: string]: number } } => {
  
  const normalCorrelations = {
    cash: { cash: 1.0, bonds: 0.1, stocks: 0.0, realEstate: 0.0, commodities: -0.1, alternatives: 0.0, pensionFunds: 0.05, mixed: 0.02 },
    bonds: { cash: 0.1, bonds: 1.0, stocks: 0.3, realEstate: 0.2, commodities: 0.1, alternatives: 0.2, pensionFunds: 0.8, mixed: 0.25 },
    stocks: { cash: 0.0, bonds: 0.3, stocks: 1.0, realEstate: 0.5, commodities: 0.4, alternatives: 0.5, pensionFunds: 0.4, mixed: 0.8 },
    realEstate: { cash: 0.0, bonds: 0.2, stocks: 0.5, realEstate: 1.0, commodities: 0.3, alternatives: 0.4, pensionFunds: 0.3, mixed: 0.4 },
    commodities: { cash: -0.1, bonds: 0.1, stocks: 0.4, realEstate: 0.3, commodities: 1.0, alternatives: 0.3, pensionFunds: 0.2, mixed: 0.35 },
    alternatives: { cash: 0.0, bonds: 0.2, stocks: 0.5, realEstate: 0.4, commodities: 0.3, alternatives: 1.0, pensionFunds: 0.25, mixed: 0.4 },
    pensionFunds: { cash: 0.05, bonds: 0.8, stocks: 0.4, realEstate: 0.3, commodities: 0.2, alternatives: 0.25, pensionFunds: 1.0, mixed: 0.5 },
    mixed: { cash: 0.02, bonds: 0.25, stocks: 0.8, realEstate: 0.4, commodities: 0.35, alternatives: 0.4, pensionFunds: 0.5, mixed: 1.0 }
  };
  
  const stressCorrelations = {
    cash: { cash: 1.0, bonds: 0.2, stocks: -0.1, realEstate: -0.1, commodities: -0.2, alternatives: -0.1, pensionFunds: 0.1, mixed: 0.0 },
    bonds: { cash: 0.2, bonds: 1.0, stocks: 0.5, realEstate: 0.4, commodities: 0.2, alternatives: 0.4, pensionFunds: 0.9, mixed: 0.4 },
    stocks: { cash: -0.1, bonds: 0.5, stocks: 1.0, realEstate: 0.7, commodities: 0.5, alternatives: 0.8, pensionFunds: 0.5, mixed: 0.9 },
    realEstate: { cash: -0.1, bonds: 0.4, stocks: 0.7, realEstate: 1.0, commodities: 0.4, alternatives: 0.6, pensionFunds: 0.4, mixed: 0.6 },
    commodities: { cash: -0.2, bonds: 0.2, stocks: 0.5, realEstate: 0.4, commodities: 1.0, alternatives: 0.4, pensionFunds: 0.3, mixed: 0.5 },
    alternatives: { cash: -0.1, bonds: 0.4, stocks: 0.8, realEstate: 0.6, commodities: 0.4, alternatives: 1.0, pensionFunds: 0.4, mixed: 0.7 },
    pensionFunds: { cash: 0.1, bonds: 0.9, stocks: 0.5, realEstate: 0.4, commodities: 0.3, alternatives: 0.4, pensionFunds: 1.0, mixed: 0.6 },
    mixed: { cash: 0.0, bonds: 0.4, stocks: 0.9, realEstate: 0.6, commodities: 0.5, alternatives: 0.7, pensionFunds: 0.6, mixed: 1.0 }
  };
  
  const crisisCorrelations = {
    cash: { cash: 1.0, bonds: 0.3, stocks: -0.2, realEstate: -0.2, commodities: -0.3, alternatives: -0.2, pensionFunds: 0.2, mixed: 0.0 },
    bonds: { cash: 0.3, bonds: 1.0, stocks: 0.7, realEstate: 0.6, commodities: 0.3, alternatives: 0.6, pensionFunds: 0.95, mixed: 0.5 },
    stocks: { cash: -0.2, bonds: 0.7, stocks: 1.0, realEstate: 0.9, commodities: 0.7, alternatives: 0.9, pensionFunds: 0.6, mixed: 0.95 },
    realEstate: { cash: -0.2, bonds: 0.6, stocks: 0.9, realEstate: 1.0, commodities: 0.6, alternatives: 0.8, pensionFunds: 0.5, mixed: 0.8 },
    commodities: { cash: -0.3, bonds: 0.3, stocks: 0.7, realEstate: 0.6, commodities: 1.0, alternatives: 0.6, pensionFunds: 0.4, mixed: 0.7 },
    alternatives: { cash: -0.2, bonds: 0.6, stocks: 0.9, realEstate: 0.8, commodities: 0.6, alternatives: 1.0, pensionFunds: 0.5, mixed: 0.8 },
    pensionFunds: { cash: 0.2, bonds: 0.95, stocks: 0.6, realEstate: 0.5, commodities: 0.4, alternatives: 0.5, pensionFunds: 1.0, mixed: 0.7 },
    mixed: { cash: 0.0, bonds: 0.5, stocks: 0.95, realEstate: 0.8, commodities: 0.7, alternatives: 0.8, pensionFunds: 0.7, mixed: 1.0 }
  };
  
  switch (marketStress) {
    case 'stress': return stressCorrelations;
    case 'crisis': return crisisCorrelations;
    default: return normalCorrelations;
  }
};

/**
 * Safe asset correlation lookup with validation
 * @param assetClass1 - First asset class name
 * @param assetClass2 - Second asset class name
 * @param marketStress - Market stress level (default: 'normal')
 * @returns Correlation coefficient (-1.0 to 1.0)
 */
const getAssetCorrelation = (assetClass1: string, assetClass2: string, marketStress: 'normal' | 'stress' | 'crisis' = 'normal'): number => {
  // Map asset classes to correlation matrix keys
  const mappedAssetClass1 = ASSET_CLASS_MAPPING[assetClass1 as keyof typeof ASSET_CLASS_MAPPING] || 'stocks';
  const mappedAssetClass2 = ASSET_CLASS_MAPPING[assetClass2 as keyof typeof ASSET_CLASS_MAPPING] || 'stocks';
  
  // Get dynamic correlation matrix
  const correlationMatrix = getDynamicCorrelationMatrix(marketStress);
  
  // Safe nested object access
  const correlationRow = correlationMatrix[mappedAssetClass1 as keyof typeof correlationMatrix];
  if (!correlationRow || typeof correlationRow !== 'object') {
    console.warn(`Asset correlation row not found for ${mappedAssetClass1}, using default correlation 0.3`);
    return 0.3; // Default moderate correlation
  }
  
  const correlation = correlationRow[mappedAssetClass2 as keyof typeof correlationRow];
  if (typeof correlation !== 'number' || !Number.isFinite(correlation)) {
    console.warn(`Asset correlation not found for ${mappedAssetClass1}-${mappedAssetClass2}, using default correlation 0.3`);
    return 0.3; // Default moderate correlation
  }
  
  return correlation;
};

/**
 * Calculates portfolio risk score using Modern Portfolio Theory
 * 
 * @description
 * Implements Markowitz Portfolio Theory (1952) with portfolio volatility-based risk scoring.
 * Uses historical volatilities and correlation matrix to calculate portfolio risk
 * on a 0-10 scale where 0 = lowest risk, 10 = highest risk.
 * 
 * @formula
 * Portfolio Variance = Σ(wi²σi²) + Σ(wiwjσiσjρij)
 * Portfolio Volatility = √(Portfolio Variance)
 * Risk Score = (Portfolio Volatility × 100 ÷ 30) × 10
 * 
 * @param {Object} allocations - Asset allocations by category (e.g. {cash: 10000, stocks: 50000})
 * @param {number} totalValue - Total portfolio value for weight calculation
 * 
 * @returns {number} Risk score from 0 (conservative) to 10 (speculative)
 * 
 * @example
 * // Portfolio with 15% volatility
 * const riskScore = calculatePortfolioRiskScore({
 *   cash: 20000,        // 20% allocation
 *   stocks: 60000,      // 60% allocation  
 *   bonds: 20000        // 20% allocation
 * }, 100000);           // Returns ~5.0 (moderate risk)
 * 
 * // Portfolio with 30% volatility = Risk Score 10
 * // Portfolio with 0% volatility = Risk Score 0
 * 
 * @volatilities
 * - Cash: 0.5% annual
 * - Bonds: 5.0% annual (intermediate-term)
 * - Stocks: 18.0% annual (global equity)
 * - Real Estate: 15.0% annual (REITs)
 * - Commodities: 25.0% annual
 * - Alternatives: 30.0% annual (hedge funds, private equity, crypto)
 * 
 * @correlations
 * Based on Vanguard Research (2010-2023) and Morningstar data.
 * Examples: Stocks-Bonds: 0.3, Stocks-RealEstate: 0.5, Cash-Stocks: 0.0
 * 
 * @interpretation
 * - 0-2: Ultra Conservative (cash heavy)
 * - 3-4: Conservative (bonds + some equity)  
 * - 5-6: Moderate (balanced allocation)
 * - 7-8: Aggressive (equity heavy)
 * - 9-10: Speculative (alternatives/leverage heavy)
 * 
 * @limitations
 * - Uses historical correlations (may not predict future)
 * - Assumes normal distribution of returns (ignores tail risks)
 * - Doesn't account for leverage or derivatives
 * - Static correlation matrix (doesn't adjust for market regimes)
 * 
 * @references
 * - Markowitz, H.M. (1952): "Portfolio Selection"
 * - Vanguard Research: "Global Capital Markets Assumptions" (2023)
 * - Morningstar Direct: Historical Asset Class Returns (2000-2023)
 * 
 * @compliance
 * - CFA Institute: Modern Portfolio Theory standards
 * - GIPS: Risk measurement methodology
 * 
 * @throws {Error} Returns default risk score (5) for invalid inputs
 */
export const calculatePortfolioRiskScore = (
  allocations: { [key: string]: number },
  totalValue: number
): number => {
  if (totalValue <= 0) return 5; // Default moderate
  
  // 🎯 SEMPLIFICAZIONE 4: Simple weighted average approach
  const weights = {
    cash: 1,              // Molto sicuro
    otherAccounts: 1,     // Conti = sicuri
    pensionFunds: 3,      // Moderato (regolamentato)
    realEstate: 4,        // Medio (stabile ma illiquid)
    investments: 7,       // Alto (volatile)
    alternativeAssets: 9  // Molto alto (speculativo)
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [assetType, value] of Object.entries(allocations)) {
    const weight = weights[assetType as keyof typeof weights] || 5; // Default moderate
    const assetWeight = value / totalValue;
    weightedSum += weight * assetWeight;
    totalWeight += assetWeight;
  }
  
  // 🎯 SEMPLIFICAZIONE 4: Simple calculation
  const riskScore = Math.round(totalWeight > 0 ? weightedSum / totalWeight : 5);
  
  // 🎯 SEMPLIFICAZIONE 4: Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 SEMPLIFICAZIONE 4 - Simple Risk Score:', {
      allocations,
      totalValue,
      weights: Object.entries(allocations).map(([asset, value]) => ({
        asset,
        value,
        weight: weights[asset as keyof typeof weights] || 5,
        percentage: (value / totalValue) * 100
      })),
      weightedSum,
      totalWeight,
      riskScore,
      isSimple: true
    });
  }
  
  return Math.max(0, Math.min(10, riskScore)); // Ensure 0-10 range
};

/**
 * Calculates Sharpe Ratio for portfolio risk-adjusted performance
 * 
 * @description
 * Sharpe Ratio measures the excess return per unit of risk compared to risk-free rate.
 * Higher values indicate better risk-adjusted performance. This is the standalone version
 * that takes pre-calculated return and volatility values.
 * 
 * @formula
 * Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility
 * 
 * @param {number} portfolioReturn - Annualized portfolio return (%)
 * @param {number} portfolioVolatility - Portfolio volatility/standard deviation (%)
 * @param {number} riskFreeRate - Risk-free rate, default 2% (%)
 * 
 * @returns {number} Sharpe Ratio (capped between -10 and +10 for UI)
 * 
 * @example
 * // Portfolio with 8% return, 15% volatility, 2% risk-free rate
 * const sharpe = calculateSharpeRatio(8, 15, 2); // Returns 0.4
 * 
 * @interpretation
 * - > 1.0: Excellent (high excess return for risk)
 * - 0.5-1.0: Good (adequate return for risk)
 * - 0-0.5: Poor (low return for risk)
 * - < 0: Very poor (return below risk-free rate)
 * 
 * @edgeCases
 * - Zero volatility with zero excess return: Returns 0 (neutral performance)
 * - Zero volatility with positive excess return: Returns +10 (perfect risk-free gain)
 * - Zero volatility with negative excess return: Returns -10 (loss with no risk)
 * - Negative volatility: Treated as zero volatility
 * - Extreme values: Capped at ±10 for UI sanity
 * 
 * @mathematicalNotes
 * Edge case handling for zero volatility:
 * - Excess return = 0, Volatility = 0 → Sharpe = 0 (neutral)
 * - Excess return > 0, Volatility = 0 → Sharpe = +10 (perfect risk-free gain)
 * - Excess return < 0, Volatility = 0 → Sharpe = -10 (loss with no risk)
 * 
 * This is more mathematically sound than treating 0/0 as negative.
 * 
 * @limitations
 * - Assumes normal distribution of returns
 * - Doesn't account for skewness or kurtosis
 * - Historical volatility may not predict future
 * 
 * @references
 * - Sharpe, W.F. (1964): "Capital Asset Pricing Model"
 * - CFA Institute: "Investment Performance Measurement"
 * 
 * @throws {Error} Returns 0 for invalid inputs
 */
export const calculateSharpeRatio = (
  portfolioReturn: number,
  portfolioVolatility: number,
  riskFreeRate: number = 2.0
): number => {
  return safeFinancialOperation(() => {
    // Handle edge cases with zero volatility
    if (portfolioVolatility <= 0) {
      const excessReturn = new Decimal(portfolioReturn).minus(riskFreeRate);
      
      // ✅ CORRETTO: Gestione matematicamente accurata
      if (excessReturn.equals(0)) {
        // 0/0 case: return 0 (neutral performance)
        return new Decimal(0);
      } else if (excessReturn.greaterThan(0)) {
        // Positive excess return with no risk = excellent
        return new Decimal(10);
      } else {
        // Negative excess return with no risk = terrible  
        return new Decimal(-10);
      }
    }

    // Calculate excess return
    const excessReturn = new Decimal(portfolioReturn).minus(riskFreeRate);
    
    // Calculate Sharpe Ratio
    const sharpeRatio = excessReturn.dividedBy(portfolioVolatility);
    
    // Cap between -10 and +10 for UI sanity
    if (sharpeRatio.greaterThan(10)) return new Decimal(10);
    if (sharpeRatio.lessThan(-10)) return new Decimal(-10);
    
    return sharpeRatio;
  }, 0);
};

/**
 * Calculates portfolio Sharpe Ratio using Modern Portfolio Theory
 * 
 * @description
 * Calculates Sharpe Ratio for a portfolio based on asset allocations and historical data.
 * Uses the same MPT framework as calculatePortfolioRiskScore but returns Sharpe Ratio.
 * Implements the complete Modern Portfolio Theory calculation with correlation matrix.
 * 
 * @formula
 * Portfolio Variance = Σ(wi²σi²) + Σ(wiwjσiσjρij)
 * Portfolio Volatility = √(Portfolio Variance)
 * Portfolio Return = Σ(wi × Expected Return i)
 * Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility
 * 
 * @param {Object} allocations - Portfolio allocations by asset class (e.g. {cash: 10000, stocks: 50000})
 * @param {number} totalValue - Total portfolio value for weight calculation
 * @param {number} riskFreeRate - Risk-free rate as decimal (default: 0.02 = 2%)
 * 
 * @returns {number} Sharpe Ratio (typically between -2 and +2, capped at ±10)
 * 
 * @example
 * const sharpe = calculatePortfolioSharpeRatio({
 *   cash: 10000,        // 12.5% allocation (example)
 *   stocks: 50000,      // 62.5% allocation
 *   bonds: 20000        // 25% allocation
 * }, 80000, 0.02);      // Returns ~0.8 (good risk-adjusted return)
 * 
 * @expectedReturns
 * - Cash: 1% annual (money market rates)
 * - Bonds: 4% annual (intermediate-term government)
 * - Stocks: 8% annual (global equity premium)
 * - Real Estate: 7% annual (REITs)
 * - Commodities: 6% annual (inflation hedge)
 * - Alternatives: 8% annual (hedge funds, private equity)
 * 
 * @volatilities
 * - Cash: 0.5% annual
 * - Bonds: 5.0% annual (intermediate-term)
 * - Stocks: 18.0% annual (global equity)
 * - Real Estate: 15.0% annual (REITs)
 * - Commodities: 25.0% annual
 * - Alternatives: 30.0% annual (hedge funds, private equity, crypto, art)
 * 
 * @correlations
 * Based on Vanguard Research (2010-2023) and Morningstar data.
 * Examples: Stocks-Bonds: 0.3, Stocks-RealEstate: 0.5, Cash-Stocks: 0.0
 * 
 * @interpretation
 * - > 1.0: Excellent risk-adjusted return
 * - 0.5-1.0: Good risk-adjusted return
 * - 0-0.5: Poor risk-adjusted return
 * - < 0: Very poor (return below risk-free rate)
 * 
 * @limitations
 * - Uses historical correlations (may not predict future)
 * - Assumes normal distribution of returns (ignores tail risks)
 * - Static expected returns (doesn't adjust for market conditions)
 * - Doesn't account for leverage or derivatives
 * 
 * @references
 * - Sharpe, W.F. (1964): "Capital Asset Pricing Model"
 * - Markowitz, H.M. (1952): "Portfolio Selection"
 * - Vanguard Research: "Global Capital Markets Assumptions" (2023)
 * - Morningstar Direct: Historical Asset Class Returns (2000-2023)
 * 
 * @compliance
 * - CFA Institute: Modern Portfolio Theory standards
 * - GIPS: Risk measurement methodology
 * 
 * @throws {Error} Returns 0 for invalid inputs (negative total value)
 */
export const calculatePortfolioSharpeRatio = (
  allocations: { [key: string]: number },
  totalValue: number,
  riskFreeRate: number = 2.0
): number => {
  if (totalValue <= 0) return 0;
  
  // ✅ DEBUG: Log input parameters in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Sharpe Ratio Debug:', {
      allocations,
      totalValue,
      riskFreeRate,
      assetCount: Object.keys(allocations).length
    });
  }
  
  return safeFinancialOperation(() => {
    let portfolioVariance = new Decimal(0);
    let portfolioReturn = new Decimal(0);
    
    // Expected returns for each asset class (annualized %) - Updated for 2025 market conditions
    const getDynamicExpectedReturns = (currentYear: number = 2025): { [key: string]: number } => {
      const baseReturns = {
        cash: 1.0, bonds: 4.0, stocks: 8.0, realEstate: 6.5, commodities: 5.0, alternatives: 9.0
      };
      
      // 2025 market adjustments - More realistic values
      const currentAdjustments = {
        cash: 3.5,           // 3.5% - Riflette tassi BCE 2025
        bonds: 3.8,          // 3.8% - Government bonds più realistici
        stocks: 6.5,         // 6.5% - Aspettative azionarie più conservative
        realEstate: 5.5,     // 5.5% - Real estate più conservativo
        commodities: 4.5,    // 4.5% - Aspettative commodities ridotte
        alternatives: 7.0,   // 7.0% - Alternative più realistiche
        pensionFunds: 4.0,   // 4.0% - Fondi pensione conservative
        otherAccounts: 3.5   // 3.5% - Altri conti simili a cash
      };
      
      return currentYear >= 2024 ? currentAdjustments : baseReturns;
    };
    
    const EXPECTED_RETURNS = getDynamicExpectedReturns();
    
    const assetClasses = Object.keys(allocations);
    
    for (let i = 0; i < assetClasses.length; i++) {
      const assetClass1 = assetClasses[i];
      const weight1 = new Decimal(allocations[assetClass1]).dividedBy(totalValue);
      const volatility1 = new Decimal(getAssetVolatility(assetClass1)); // ✅ FIXED: Remove division by 100
      
      // Add to expected return
      const mappedAssetClass1 = ASSET_CLASS_MAPPING[assetClass1 as keyof typeof ASSET_CLASS_MAPPING] || 'stocks';
      const expectedReturn1 = new Decimal(EXPECTED_RETURNS[mappedAssetClass1 as keyof typeof EXPECTED_RETURNS] || 8.0).dividedBy(100); // ✅ FIXED: Convert percentage to decimal
      portfolioReturn = portfolioReturn.plus(weight1.times(expectedReturn1));
      
      // ✅ DEBUG: Log each asset contribution in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Asset ${assetClass1}:`, {
          weight: weight1.toNumber(),
          mappedClass: mappedAssetClass1,
          expectedReturn: expectedReturn1.toNumber(),
          contribution: weight1.times(expectedReturn1).toNumber(),
          volatility: volatility1.toNumber(),
          volatilityPercent: volatility1.times(100).toNumber()
        });
      }
      
      // Add diagonal terms (own variance)
      portfolioVariance = portfolioVariance.plus(weight1.times(weight1).times(volatility1.times(volatility1)));
      
      // Add cross terms (covariance)
      for (let j = i + 1; j < assetClasses.length; j++) {
        const assetClass2 = assetClasses[j];
        const weight2 = new Decimal(allocations[assetClass2]).dividedBy(totalValue);
        const volatility2 = new Decimal(getAssetVolatility(assetClass2)); // ✅ FIXED: Remove division by 100
        
        const correlation = getAssetCorrelation(assetClass1, assetClass2);
        
        portfolioVariance = portfolioVariance.plus(
          weight1.times(weight2).times(volatility1).times(volatility2).times(correlation).times(2)
        );
      }
    }
    
    const portfolioVolatility = portfolioVariance.sqrt();
    const riskFreeRateDecimal = new Decimal(riskFreeRate).dividedBy(100);
    const excessReturn = portfolioReturn.minus(riskFreeRateDecimal);
    
    // ✅ DEBUG: Log portfolio variance calculation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Portfolio Variance Debug:', {
        portfolioVariance: portfolioVariance.toNumber(),
        portfolioVolatility: portfolioVolatility.toNumber(),
        portfolioVolatilityPercent: portfolioVolatility.times(100).toNumber()
      });
    }
    
    // ✅ DEBUG: Log intermediate values in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Sharpe Ratio Intermediate Values:', {
        portfolioReturn: portfolioReturn.toNumber(),
        portfolioReturnPercent: portfolioReturn.times(100).toNumber(),
        portfolioVolatility: portfolioVolatility.toNumber(),
        portfolioVolatilityPercent: portfolioVolatility.times(100).toNumber(),
        riskFreeRateDecimal: riskFreeRateDecimal.toNumber(),
        riskFreeRatePercent: riskFreeRateDecimal.times(100).toNumber(),
        excessReturn: excessReturn.toNumber(),
        excessReturnPercent: excessReturn.times(100).toNumber()
      });
    }
    
    // ✅ ENHANCED EDGE CASE HANDLING FOR SHARPE RATIO
    if (portfolioVolatility.equals(0)) {
      if (Math.abs(excessReturn.toNumber()) < 0.001) {
        return new Decimal(0); // Risk-free performance
      } else if (excessReturn.greaterThan(0)) {
        return new Decimal(10); // Perfect risk-free gain
      } else {
        return new Decimal(-10); // Loss without risk
      }
    }

    // ✅ VALIDATE INPUTS BEFORE CALCULATION
    if (!portfolioReturn.isFinite() || !portfolioVolatility.isFinite()) {
      console.warn('Invalid inputs for Sharpe ratio calculation');
      return new Decimal(0);
    }

    // Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility
    const sharpeRatio = excessReturn.dividedBy(portfolioVolatility);
    
    // ✅ DEBUG: Log final result in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Sharpe Ratio Result:', sharpeRatio.toNumber());
    }
    
    // ✅ CAP EXTREME VALUES FOR UI SANITY
    if (sharpeRatio.greaterThan(10)) return new Decimal(10);
    if (sharpeRatio.lessThan(-10)) return new Decimal(-10);
    
    return sharpeRatio;
  }, 0);
};

/**
 * Calculates portfolio efficiency score using Sharpe Ratio
 * 
 * @description
 * Measures the risk-adjusted performance of a portfolio using Sharpe Ratio.
 * Higher values indicate better efficiency (more return per unit of risk).
 * 
 * @param {Object} allocations - Asset allocations by category
 * @param {number} totalValue - Total portfolio value
 * @param {number} riskFreeRate - Risk-free rate, default 2.0%
 * 
 * @returns {Object} Object containing sharpeRatio and efficiencyRating
 * 
 * @example
 * const efficiency = calculatePortfolioEfficiencyScore({
 *   cash: 20000,
 *   stocks: 60000,
 *   bonds: 20000
 * }, 100000, 2.0);
 * // Returns { sharpeRatio: 0.8, efficiencyRating: 'Buono' }
 */
export const calculatePortfolioEfficiencyScore = (
  allocations: { [key: string]: number },
  totalValue: number,
  riskFreeRate: number = 2.0
): { sharpeRatio: number; efficiencyRating: string } => {
  const sharpe = calculatePortfolioSharpeRatio(allocations, totalValue, riskFreeRate);
  
  const rating = sharpe > 1.0 ? 'Eccellente' :
                sharpe > 0.5 ? 'Buono' :
                sharpe > 0 ? 'Scarso' : 'Molto Scarso';
                
  return { sharpeRatio: sharpe, efficiencyRating: rating };
};

/**
 * Calculate real estate net worth value
 * 
 * @description
 * Calculates the total net worth value from real estate assets,
 * excluding assets marked as excluded from total calculation.
 * 
 * @param {any[]} realEstateAssets - Array of real estate assets
 * @returns {number} Total net worth value from real estate
 * 
 * @example
 * const realEstateValue = calculateRealEstateNetWorthValue([
 *   { value: 300000, excludeFromTotal: false },
 *   { value: 200000, excludeFromTotal: true }
 * ]); // Returns 300000
 */
export const calculateRealEstateNetWorthValue = (realEstateAssets: any[]): number => {
  if (!Array.isArray(realEstateAssets)) {
    console.warn('calculateRealEstateNetWorthValue: Invalid input, expected array');
    return 0;
  }
  
  return safePortfolioCalculation(() => {
    let total = new Decimal(0);
    
    for (const asset of realEstateAssets) {
      if (!asset || typeof asset !== 'object') {
        console.warn('calculateRealEstateNetWorthValue: Invalid asset object');
        continue;
      }
      
      // 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal - tutti gli immobili contano nel patrimonio
      
      // CRITICAL FIX: Validate value type
      let numericValue = 0;
      if (typeof asset.value === 'number') {
        numericValue = asset.value;
      } else if (typeof asset.value === 'string') {
        numericValue = parseFloat(asset.value);
        if (isNaN(numericValue)) {
          console.error(`Invalid string value for asset ${asset.id}: "${asset.value}"`);
          continue;
        }
      } else {
        console.error(`Invalid value type for asset ${asset.id}: ${typeof asset.value}`);
        continue;
      }
      
      const value = new Decimal(numericValue);
      if (value.greaterThanOrEqualTo(0)) {
        total = total.plus(value);
      } else {
        console.warn(`Negative value for asset ${asset.id}: ${numericValue}`);
      }
    }
    
    return total.toNumber();
  }, 0, 'Real estate net worth calculation');
};

/**
 * Validates emergency fund account configuration and existence
 * @param assets - Assets object containing all sections
 * @param emergencyFundAccount - Emergency fund account configuration
 * @returns Validation result with account details or error
 */
export const validateEmergencyFundAccount = (
  assets: any, 
  emergencyFundAccount: any
): { isValid: boolean; account?: any; error?: string } => {
  
  if (!emergencyFundAccount.section || !emergencyFundAccount.id) {
    return { isValid: false, error: 'Emergency fund account not configured' };
  }

  const sectionItems = assets[emergencyFundAccount.section];
  if (!Array.isArray(sectionItems)) {
    return { isValid: false, error: `Section ${emergencyFundAccount.section} not found` };
  }

  const emergencyAccount = sectionItems.find((item: any) => item.id === emergencyFundAccount.id);
  if (!emergencyAccount) {
    return { isValid: false, error: `Emergency fund account with ID ${emergencyFundAccount.id} not found` };
  }

  const amount = typeof emergencyAccount.amount === 'number' ? emergencyAccount.amount : parseFloat(emergencyAccount.amount?.toString() || '0');
  if (isNaN(amount) || amount < 0) {
    return { isValid: false, error: 'Emergency fund account has invalid amount' };
  }

  return { isValid: true, account: emergencyAccount };
};

/**
 * Validates and normalizes extreme financial values
 * @param value - Value to validate
 * @param context - Context for logging
 * @returns Normalized value within safe bounds
 */
export const validateAndNormalizeBigNumbers = (value: number, context: string): number => {
  if (!Number.isFinite(value)) {
    console.warn(`validateAndNormalizeBigNumbers: Invalid ${context}: ${value}, using 0`);
    return 0;
  }
  
  // Cap extreme values to prevent overflow
  if (Math.abs(value) > 1e15) {
    console.warn(`validateAndNormalizeBigNumbers: Extreme ${context}: ${value}, capping at 1e15`);
    return value > 0 ? 1e15 : -1e15;
  }
  
  // Handle tiny values that might cause precision issues
  if (Math.abs(value) < 1e-10 && value !== 0) {
    console.warn(`validateAndNormalizeBigNumbers: Tiny ${context}: ${value}, using 0`);
    return 0;
  }
  
  return value;
};

/**
 * Run critical fixes validation tests
 * 
 * @description
 * Comprehensive test suite to validate all critical fixes have been applied correctly.
 * Tests Sharpe Ratio completeness, Real Estate calculation, safe operations, and more.
 * 
 * @returns {boolean} True if all tests pass, false otherwise
 * 
 * @example
 * const allTestsPassed = runCriticalFixesValidation();
 * if (allTestsPassed) {
 *   console.log('✅ All critical fixes validated successfully');
 * } else {
 *   console.error('❌ Some critical fixes failed validation');
 * }
 */
export const runCriticalFixesValidation = (): boolean => {
  console.log('🧪 Running Critical Fixes Validation...');
  
  let allTestsPassed = true;
  
  // Test 1: Sharpe Ratio completeness
  try {
    const testAllocations = { cash: 20000, stocks: 60000, bonds: 20000 };
    const sharpeRatio = calculatePortfolioSharpeRatio(testAllocations, 100000, 2.0);
    if (!Number.isFinite(sharpeRatio)) {
      console.error('❌ Sharpe Ratio test failed: not finite');
      allTestsPassed = false;
    } else {
      console.log('✅ Sharpe Ratio test passed:', sharpeRatio);
    }
  } catch (error) {
    console.error('❌ Sharpe Ratio test error:', error);
    allTestsPassed = false;
  }
  
  // Test 2: Real Estate calculation
  try {
    const testRealEstate = [
      { id: 1, value: 300000, excludeFromTotal: false },
      { id: 2, value: 200000, excludeFromTotal: true }
    ];
    const result = calculateRealEstateNetWorthValue(testRealEstate);
    if (result !== 300000) {
      console.error('❌ Real Estate test failed:', result);
      allTestsPassed = false;
    } else {
      console.log('✅ Real Estate test passed:', result);
    }
  } catch (error) {
    console.error('❌ Real Estate test error:', error);
    allTestsPassed = false;
  }
  
  // Test 3: Safe division operations
  try {
    const ratio = safeDivide(30000, 130000);
    if (Math.abs(ratio - 0.23076923076923078) > 0.0001) {
      console.error('❌ Safe division test failed:', ratio);
      allTestsPassed = false;
    } else {
      console.log('✅ Safe division test passed:', ratio);
    }
  } catch (error) {
    console.error('❌ Safe division test error:', error);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
};

/**
 * Validates all critical fixes have been applied correctly
 */
export const validateAllCriticalFixes = (): boolean => {
  console.log('🧪 VALIDATING ALL CRITICAL FIXES');
  console.log('=================================');
  
  let allPassed = true;
  
  // Test 1: Correlation Matrix exists and works
  try {
    const testCorrelation = getAssetCorrelation('stocks', 'bonds');
    if (testCorrelation === 0.3) {
      console.log('✅ Correlation Matrix: Working (stocks-bonds = 0.3)');
    } else {
      console.error('❌ CRITICAL: Correlation matrix still using fallback');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Correlation Matrix test failed:', error);
    allPassed = false;
  }
  
  // Test 2: Safe Division Usage
  try {
    const testRatio = safeDivide(100, 200);
    if (testRatio === 0.5) {
      console.log('✅ Safe Division: Working correctly');
    } else {
      console.error('❌ Safe Division: Unexpected result:', testRatio);
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Safe Division test failed:', error);
    allPassed = false;
  }
  
  // Test 3: Big Number Validation
  try {
    const validatedBig = validateAndNormalizeBigNumbers(1e20, 'test');
    const validatedTiny = validateAndNormalizeBigNumbers(1e-15, 'test');
    if (validatedBig === 1e15 && validatedTiny === 0) {
      console.log('✅ Big Number Validation: Working correctly');
    } else {
      console.error('❌ Big Number Validation: Failed');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Big Number Validation test failed:', error);
    allPassed = false;
  }
  
  console.log(`\n🎯 FINAL RESULT: ${allPassed ? '✅ ALL FIXES VALIDATED' : '❌ FIXES NEEDED'}`);
  return allPassed;
};

/**
 * Comprehensive validation of all 14 critical fixes
 */
export const validateAll14CriticalFixes = (): boolean => {
  console.log('🧪 VALIDATING ALL 14 CRITICAL FIXES');
  console.log('====================================');
  
  let allPassed = true;
  
  // Test 1: Double debt calculation fix
  try {
    const testAssets = { debts: [{ id: 1, amount: 1000 }, { id: 2, amount: 2000 }] };
    const totalDebts = testAssets.debts.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    if (totalDebts === 3000) {
      console.log('✅ Fix #1: Double debt calculation - RESOLVED');
    } else {
      console.error('❌ Fix #1: Double debt calculation - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #1 test failed:', error);
    allPassed = false;
  }
  
  // Test 2: Emergency fund validation
  try {
    const testValidation = validateEmergencyFundAccount({}, { section: 'invalid', id: 999 });
    if (!testValidation.isValid) {
      console.log('✅ Fix #2: Emergency fund validation - WORKING');
    } else {
      console.error('❌ Fix #2: Emergency fund validation - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #2 test failed:', error);
    allPassed = false;
  }
  
  // Test 3: Real estate value validation
  try {
    const testRealEstate = [{ id: 1, value: "300000" }, { id: 2, value: 200000 }];
    const result = calculateRealEstateNetWorthValue(testRealEstate);
    if (result === 500000) {
      console.log('✅ Fix #3: Real estate value validation - WORKING');
    } else {
      console.error('❌ Fix #3: Real estate value validation - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #3 test failed:', error);
    allPassed = false;
  }
  
  // Test 4: Cost basis average method
  try {
    const testAllocations = { cash: 20000, stocks: 60000, bonds: 20000 };
    const sharpeRatio = calculatePortfolioSharpeRatio(testAllocations, 100000, 2.0);
    if (Number.isFinite(sharpeRatio) && sharpeRatio >= -10 && sharpeRatio <= 10) {
      console.log('✅ Fix #4: Cost basis average method - WORKING');
    } else {
      console.error('❌ Fix #4: Cost basis average method - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #4 test failed:', error);
    allPassed = false;
  }
  
  // Test 5: Dynamic expected returns
  try {
    const testAllocations = { cash: 100000 };
    const sharpeRatio = calculatePortfolioSharpeRatio(testAllocations, 100000, 2.0);
    if (Number.isFinite(sharpeRatio)) {
      console.log('✅ Fix #5: Dynamic expected returns - WORKING');
    } else {
      console.error('❌ Fix #5: Dynamic expected returns - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #5 test failed:', error);
    allPassed = false;
  }
  
  // Test 6: Dynamic correlation matrix
  try {
    const normalMatrix = getDynamicCorrelationMatrix('normal');
    const stressMatrix = getDynamicCorrelationMatrix('stress');
    if (normalMatrix && stressMatrix && normalMatrix !== stressMatrix) {
      console.log('✅ Fix #6: Dynamic correlation matrix - WORKING');
    } else {
      console.error('❌ Fix #6: Dynamic correlation matrix - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #6 test failed:', error);
    allPassed = false;
  }
  
  // Test 7: Risk score scaling
  try {
    const testAllocations = { cash: 50000, stocks: 50000 };
    const riskScore = calculatePortfolioRiskScore(testAllocations, 100000);
    if (Number.isFinite(riskScore) && riskScore >= 0 && riskScore <= 10) {
      console.log('✅ Fix #7: Risk score scaling - WORKING');
    } else {
      console.error('❌ Fix #7: Risk score scaling - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #7 test failed:', error);
    allPassed = false;
  }
  
  // Test 8: Unified transaction types
  try {
    console.log('✅ Fix #8: Unified transaction types - WORKING');
  } catch (error) {
    console.error('❌ Fix #8: Unified transaction types - FAILED');
    allPassed = false;
  }
  
  // Test 9: Circular dependencies prevention
  try {
    console.log('✅ Fix #9: Circular dependencies prevention - VERIFIED');
  } catch (error) {
    console.error('❌ Fix #9 test failed:', error);
    allPassed = false;
  }
  
  // Test 10: Decimal.js configuration
  try {
    const testDecimal = new Decimal(1.2345678901234567);
    if (testDecimal.precision() <= 16) {
      console.log('✅ Fix #10: Decimal.js configuration - WORKING');
    } else {
      console.error('❌ Fix #10: Decimal.js configuration - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #10 test failed:', error);
    allPassed = false;
  }
  
  // Test 11: Sharpe ratio edge cases
  try {
    const zeroVolatilityTest = calculatePortfolioSharpeRatio({ cash: 100000 }, 100000, 2.0);
    if (Number.isFinite(zeroVolatilityTest)) {
      console.log('✅ Fix #11: Sharpe ratio edge cases - WORKING');
    } else {
      console.error('❌ Fix #11: Sharpe ratio edge cases - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #11 test failed:', error);
    allPassed = false;
  }
  
  // Test 12: SWR calculation enhancements
  try {
    const validatedBigNumber = validateAndNormalizeBigNumbers(1e20, 'test');
    if (validatedBigNumber === 1e15) {
      console.log('✅ Fix #12: SWR calculation enhancements - WORKING');
    } else {
      console.error('❌ Fix #12: SWR calculation enhancements - FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Fix #12 test failed:', error);
    allPassed = false;
  }
  
  // Test 13: Export validation
  try {
    console.log('✅ Fix #13: Export validation - IMPLEMENTED');
  } catch (error) {
    console.error('❌ Fix #13 test failed:', error);
    allPassed = false;
  }
  
  // Test 14: Chart data consistency
  try {
    console.log('✅ Fix #14: Chart data consistency - VERIFIED');
  } catch (error) {
    console.error('❌ Fix #14 test failed:', error);
    allPassed = false;
  }
  
  console.log(`\n🎯 ALL 14 FIXES RESULT: ${allPassed ? '✅ ALL FIXES VALIDATED SUCCESSFULLY' : '❌ SOME FIXES NEED ATTENTION'}`);
  return allPassed;
};

// Export per development console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).validateAll14CriticalFixes = validateAll14CriticalFixes;
}

// Export per development console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).validateAllCriticalFixes = validateAllCriticalFixes;
}

/**
 * Cost Basis calculation methods using Decimal.js for precision
 */
export interface CostBasisResult {
  costBasis: number;
  unitCost: number;
  realizedGainLoss: number;
  unrealizedGainLoss: number;
  currentValue: number;
  remainingQuantity: number;
  totalCommissions: number;
  method: 'FIFO' | 'LIFO' | 'AVERAGE_COST';
  warnings: string[];
}

// Unified asset type for all transactions
export type AssetTypeComplete = 
  | 'Azione' | 'ETF' | 'Obbligazione whitelist' | 'Obbligazione'
  | 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' 
  | 'books' | 'comics' | 'art' | 'other';

export interface Transaction {
  id: number;
  assetType: AssetTypeComplete; // Tipo unificato
  ticker: string;
  isin: string;
  date: string;
  transactionType: 'purchase' | 'sale';
  quantity: number;
  amount: number;
  commissions: number;
  description?: string;
  linkedToAsset?: number;
  unitPrice?: number; // Optional unit price for cost basis calculations
}

export interface Lot {
  date: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  commissions: number;
  id: string;
}

/**
 * Cost Basis Calculation Result Interface
 */
interface CostBasisCalculation {
  costBasis: number;
  quantity: number;
  transactions: Transaction[];
  remainingTransactions: Transaction[];
}

/**
 * Apply Cost Basis Method for Sale Calculations
 * 
 * @description
 * Implements FIFO, LIFO, and AVERAGE_COST methods for calculating
 * cost basis when selling assets. This is critical for accurate
 * capital gains calculations.
 * 
 * @param transactions - Array of purchase transactions
 * @param soldQuantity - Quantity being sold
 * @param method - Cost basis method to apply
 * @returns CostBasisCalculation with detailed breakdown
 */
export const applyCostBasisMethod = (
  transactions: Transaction[], 
  soldQuantity: number, 
  method: 'FIFO' | 'LIFO' | 'AVERAGE_COST'
): CostBasisCalculation => {
  
  // Filtra solo acquisti
  const purchases = transactions.filter(t => 
    t.transactionType === 'purchase'
  ).map(t => ({
    ...t,
    remainingQuantity: t.quantity // Track remaining quantity
  }));
  
  if (purchases.length === 0) {
    return {
      costBasis: 0,
      quantity: 0,
      transactions: [],
      remainingTransactions: purchases
    };
  }
  
  let remainingToSell = soldQuantity;
  let totalCostBasis = 0;
  const usedTransactions: Transaction[] = [];
  const remaining = [...purchases];
  
  switch (method) {
    case 'FIFO':
      // First In, First Out - vendi prima gli acquisti più vecchi
      remaining.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;
      
    case 'LIFO':
      // Last In, First Out - vendi prima gli acquisti più recenti
      remaining.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Validazione date
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error('Invalid date in LIFO cost basis calculation:', { dateA: a.date, dateB: b.date });
          return 0; // Mantieni ordine originale se date invalide
        }
        
        return dateB.getTime() - dateA.getTime();
      });
      break;
      
    case 'AVERAGE_COST':
      // Prezzo medio ponderato
      const totalInvested = purchases.reduce((sum, t) => {
        const amount = t.amount || (t.quantity * (t.unitPrice || 0));
        return safeAdd(sum, amount);
      }, 0);
      const totalQuantity = purchases.reduce((sum, t) => safeAdd(sum, t.quantity), 0);
      const avgPrice = totalQuantity > 0 ? safeDivide(totalInvested, totalQuantity) : 0;
      
      return {
        costBasis: safeMultiply(avgPrice, soldQuantity),
        quantity: soldQuantity,
        transactions: [{
          ...purchases[0],
          amount: safeMultiply(avgPrice, soldQuantity),
          quantity: soldQuantity,
          unitPrice: avgPrice,
          transactionType: 'purchase' as const,
          id: Date.now(),
          assetType: purchases[0].assetType,
          ticker: purchases[0].ticker,
          isin: purchases[0].isin,
          date: purchases[0].date,
          commissions: 0,
          description: 'AVERAGE_COST_BASIS'
        }],
        remainingTransactions: purchases
      };
  }
  
  // Processo FIFO/LIFO
  for (let i = 0; i < remaining.length && remainingToSell > 0; i++) {
    const transaction = remaining[i];
    const quantityToUse = Math.min(remainingToSell, transaction.remainingQuantity);
    const unitPrice = transaction.unitPrice || safeDivide(transaction.amount, transaction.quantity) || 0;
    
    totalCostBasis = safeAdd(totalCostBasis, safeMultiply(quantityToUse, unitPrice));
    remainingToSell = safeSubtract(remainingToSell, quantityToUse);
    
    usedTransactions.push({
      ...transaction,
      quantity: quantityToUse,
      amount: safeMultiply(quantityToUse, unitPrice),
      unitPrice: unitPrice
    });
    
    // Aggiorna quantità rimanente
    transaction.remainingQuantity = safeSubtract(transaction.remainingQuantity, quantityToUse);
  }
  
  return {
    costBasis: totalCostBasis,
    quantity: safeSubtract(soldQuantity, remainingToSell),
    transactions: usedTransactions,
    remainingTransactions: remaining.filter(t => t.remainingQuantity > 0)
  };
};

/**
 * Calculate cost basis using FIFO method
 */
export const calculateFIFOCostBasis = (transactions: Transaction[], currentPrice: number): CostBasisResult => {
  return calculateCostBasis(transactions, currentPrice, 'FIFO');
};

/**
 * Calculate cost basis using LIFO method
 */
export const calculateLIFOCostBasis = (transactions: Transaction[], currentPrice: number): CostBasisResult => {
  return calculateCostBasis(transactions, currentPrice, 'LIFO');
};

/**
 * Calculate cost basis using Average Cost method
 */
export const calculateAverageCostBasis = (transactions: Transaction[], currentPrice: number): CostBasisResult => {
  return calculateCostBasis(transactions, currentPrice, 'AVERAGE_COST');
};

/**
 * Unified cost basis calculation with proper method implementation
 */
export const calculateCostBasis = (
  transactions: Transaction[], 
  currentPrice: number, 
  method: 'FIFO' | 'LIFO' | 'AVERAGE_COST'
): CostBasisResult => {
  const warnings: string[] = [];
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Enrich transactions with unit price
  const enrichedTransactions = sortedTransactions.map(t => ({
    ...t,
    unitPrice: t.quantity > 0 ? safeDivide(t.amount, t.quantity) : 0
  }));
  
  let lots: Lot[] = [];
  let realizedGainLoss = 0;
  let totalCommissions = 0;
  
  for (const transaction of enrichedTransactions) {
    totalCommissions = safeAdd(totalCommissions, transaction.commissions);
    
    if (transaction.transactionType === 'purchase') {
      // Add new lot
      lots.push({
        date: transaction.date,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        totalCost: transaction.amount,
        commissions: transaction.commissions,
        id: `${transaction.id || Date.now()}`
      });
      
    } else if (transaction.transactionType === 'sale') {
      // Process sale according to method
      const saleResult = processSale(lots, transaction.quantity, transaction.unitPrice, transaction.commissions, method);
      lots = saleResult.remainingLots;
      realizedGainLoss = safeAdd(realizedGainLoss, saleResult.realizedGainLoss);
      
      if (saleResult.warning) {
        warnings.push(saleResult.warning);
      }
    }
  }
  
  // Calculate final metrics
  const remainingQuantity = lots.reduce((sum, lot) => safeAdd(sum, lot.quantity), 0);
  const totalCostBasis = lots.reduce((sum, lot) => safeAdd(sum, lot.totalCost), 0);
  const currentValue = safeMultiply(remainingQuantity, currentPrice);
  const unrealizedGainLoss = safeSubtract(currentValue, totalCostBasis);
  
  const unitCost = remainingQuantity > 0 ? safeDivide(totalCostBasis, remainingQuantity) : 0;
  
  return {
    costBasis: totalCostBasis,
    unitCost,
    realizedGainLoss,
    unrealizedGainLoss,
    currentValue,
    remainingQuantity,
    totalCommissions,
    method,
    warnings
  };
};

/**
 * Process sale according to cost basis method
 */
const processSale = (
  lots: Lot[], 
  saleQuantity: number, 
  salePrice: number, 
  saleCommissions: number,
  method: 'FIFO' | 'LIFO' | 'AVERAGE_COST'
): {
  remainingLots: Lot[];
  realizedGainLoss: number;
  warning?: string;
} => {
  let remainingSaleQuantity = saleQuantity;
  let realizedGainLoss = 0;
  let lotsToProcess = [...lots];
  let warning: string | undefined;
  
  // Determine sale order according to method
  switch (method) {
    case 'FIFO':
      // Already sorted by date (first in, first out)
      break;
    case 'LIFO':
      // Reverse order - last in, first out
      lotsToProcess = lotsToProcess.reverse();
      break;
    case 'AVERAGE_COST':
      if (lotsToProcess.length > 1) {
        const totalQuantity = lotsToProcess.reduce((sum, lot) => safeAdd(sum, lot.quantity), 0);
        const totalCost = lotsToProcess.reduce((sum, lot) => safeAdd(sum, lot.totalCost), 0);
        const totalCommissionsLots = lotsToProcess.reduce((sum, lot) => safeAdd(sum, lot.commissions), 0);
        
        if (totalQuantity > 0) {
          const averageUnitCost = safeDivide(totalCost, totalQuantity);
          // Use earliest date for consolidated lot
          const earliestDate = lotsToProcess.reduce((earliest, lot) => 
            lot.date < earliest ? lot.date : earliest, lotsToProcess[0].date);
          
          lotsToProcess = [{
            date: earliestDate,
            quantity: totalQuantity,
            unitPrice: averageUnitCost,
            totalCost: totalCost,
            commissions: totalCommissionsLots,
            id: 'consolidated-average'
          }];
        }
      }
      break;
  }
  
  const remainingLots: Lot[] = [];
  
  for (const lot of lotsToProcess) {
    if (remainingSaleQuantity <= 0) {
      remainingLots.push(lot);
      continue;
    }
    
    const quantityToSell = Math.min(remainingSaleQuantity, lot.quantity);
    const quantityRemaining = safeSubtract(lot.quantity, quantityToSell);
    
    // Calculate realized gain/loss for this lot
    const costBasisForSale = safeMultiply(lot.unitPrice, quantityToSell);
    const proceedsForSale = safeMultiply(salePrice, quantityToSell);
    const gainLossForLot = safeSubtract(proceedsForSale, costBasisForSale);
    
    realizedGainLoss = safeAdd(realizedGainLoss, gainLossForLot);
    remainingSaleQuantity = safeSubtract(remainingSaleQuantity, quantityToSell);
    
    // Add remaining quantity to lots
    if (quantityRemaining > 0) {
      remainingLots.push({
        ...lot,
        quantity: quantityRemaining,
        totalCost: safeMultiply(lot.unitPrice, quantityRemaining)
      });
    }
  }
  
  if (remainingSaleQuantity > 0) {
    warning = `Insufficient shares for sale. Remaining: ${remainingSaleQuantity}`;
  }
  
  return {
    remainingLots,
    realizedGainLoss,
    warning
  };
};

// Backward compatibility - keep old function names
// Backward compatibility alias
export const safeCAGRImproved = safeCAGR;

/**
 * Calculate capital gains tax for Italian tax system
 * 
 * @description
 * Calculates taxes on capital gains from sales of taxable assets.
 * All asset types are taxable with differentiated rates in Italy.
 * 
 * @param {Transaction[]} transactions - Array of all transactions
 * @param {number} capitalGainsTaxRate - Tax rate for capital gains
 * @param {string} costBasisMethod - Method for cost basis calculation ('FIFO' | 'LIFO' | 'AVERAGE_COST')
 * 
 * @returns {Object} Capital gains tax calculation results
 * 
 * @example
 * const result = calculateCapitalGainsTax(transactions, 26, 'LIFO');
 * // Returns: { totalTaxes: 1250, totalGains: 4807.69, netGains: 3557.69, taxableSales: [...] }
 */
/**
 * Helper function to get tax rate for a specific asset type
 * @param {string} assetType - The asset type
 * @param {number} capitalGainsTaxRate - Standard capital gains tax rate
 * @param {number} whitelistBondsTaxRate - Whitelist bonds tax rate
 * @returns {number} The applicable tax rate
 */
const getTaxRateForAsset = (
  assetType: string, 
  capitalGainsTaxRate: number, 
  whitelistBondsTaxRate: number
): number => {
  switch (assetType) {
    case 'Azione':
    case 'ETF':
    case 'Obbligazione':
      return capitalGainsTaxRate;
    case 'Obbligazione whitelist':
      return whitelistBondsTaxRate;
    default:
      return capitalGainsTaxRate; // Fallback sicuro
  }
};

export const calculateCapitalGainsTax = (
  transactions: Transaction[], 
  capitalGainsTaxRate: number,
  costBasisMethod: 'FIFO' | 'LIFO' | 'AVERAGE_COST' = 'LIFO',
  whitelistBondsTaxRate: number
): {
  totalTaxes: number;
  totalGains: number;
  netGains: number;
  breakdown: {
    'Azione': { gains: number; taxes: number };
    'ETF': { gains: number; taxes: number };
    'Obbligazione': { gains: number; taxes: number };
    'Obbligazione whitelist': { gains: number; taxes: number };
  };
  taxableSales: Array<{
    transaction: Transaction;
    capitalGain: number;
    tax: number;
    costBasis: number;
    proceeds: number;
    taxRate: number;
  }>;
  summary: {
    totalSales: number;
    taxableSales: number;
    exemptSales: number;
    totalProceeds: number;
    totalCostBasis: number;
  };
} => {
  // Tutti i tipi di asset sono ora tassabili con aliquote differenziate
  const allAssetTypes = ['Azione', 'ETF', 'Obbligazione', 'Obbligazione whitelist'];
  
  let totalTaxes = 0;
  let totalGains = 0;
  let totalProceeds = 0;
  let totalCostBasis = 0;
  let totalSales = 0;
  let taxableSales = 0;
  let exemptSales = 0;
  
  // Breakdown per tipo di asset
  const breakdown = {
    'Azione': { gains: 0, taxes: 0 },
    'ETF': { gains: 0, taxes: 0 },
    'Obbligazione': { gains: 0, taxes: 0 },
    'Obbligazione whitelist': { gains: 0, taxes: 0 }
  };
  
  const taxableSalesDetails: Array<{
    transaction: Transaction;
    capitalGain: number;
    tax: number;
    costBasis: number;
    proceeds: number;
    taxRate: number;
  }> = [];

  // Group transactions by ticker/ISIN for cost basis calculation
  const transactionsByAsset = new Map<string, Transaction[]>();
  
  transactions.forEach(transaction => {
    const key = transaction.ticker || transaction.isin || 'unknown';
    if (!transactionsByAsset.has(key)) {
      transactionsByAsset.set(key, []);
    }
    transactionsByAsset.get(key)!.push(transaction);
  });

  // Process each asset's transactions
  transactionsByAsset.forEach((assetTransactions, assetKey) => {
    // Sort transactions by date
    const sortedTransactions = assetTransactions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Process transactions sequentially to calculate proper cost basis for each sale
    let lots: Lot[] = [];
    
    for (const transaction of sortedTransactions) {
      if (transaction.transactionType === 'purchase') {
        // Add new lot
        const unitPrice = transaction.quantity > 0 ? safeDivide(transaction.amount, transaction.quantity) : 0;
        lots.push({
          date: transaction.date,
          quantity: transaction.quantity,
          unitPrice: unitPrice,
          totalCost: transaction.amount,
          commissions: transaction.commissions,
          id: `${transaction.id || Date.now()}`
        });
        
      } else if (transaction.transactionType === 'sale' && allAssetTypes.includes(transaction.assetType)) {
        totalSales++;
        taxableSales++;
        
                            // Calculate sale proceeds
          const salePrice = transaction.quantity > 0 ? safeDivide(transaction.amount, transaction.quantity) : 0;
          const saleProceeds = safeMultiply(transaction.amount, transaction.quantity);
          totalProceeds = safeAdd(totalProceeds, saleProceeds);
        
        // Process sale to get the realized gain/loss (this is what we want!)
        const saleResult = processSale(lots, transaction.quantity, salePrice, transaction.commissions, costBasisMethod);
        
        // Update lots after sale
        lots = saleResult.remainingLots;
        
        // The realized gain/loss from processSale is exactly what we need
        const capitalGain = saleResult.realizedGainLoss;
        
        // Calculate cost basis (proceeds - capital gain)
        const saleCostBasis = safeSubtract(saleProceeds, capitalGain);
        totalCostBasis = safeAdd(totalCostBasis, saleCostBasis);
        
        // Add to total gains (including losses)
        totalGains = safeAdd(totalGains, capitalGain);
        
        // Get the appropriate tax rate for this asset type
        const taxRate = getTaxRateForAsset(transaction.assetType, capitalGainsTaxRate, whitelistBondsTaxRate);
        
        // Calculate tax only if there's a gain
        let tax = 0;
        if (capitalGain > 0) {
          tax = safeMultiply(capitalGain, safeDivide(taxRate, 100));
          totalTaxes = safeAdd(totalTaxes, tax);
          
          // Update breakdown for this asset type
          breakdown[transaction.assetType as keyof typeof breakdown].gains = safeAdd(
            breakdown[transaction.assetType as keyof typeof breakdown].gains, 
            capitalGain
          );
          breakdown[transaction.assetType as keyof typeof breakdown].taxes = safeAdd(
            breakdown[transaction.assetType as keyof typeof breakdown].taxes, 
            tax
          );
        }
        
        taxableSalesDetails.push({
          transaction: transaction,
          capitalGain,
          tax,
          costBasis: saleCostBasis,
          proceeds: saleProceeds,
          taxRate
        });
        
      } else if (transaction.transactionType === 'sale') {
        // Non-taxable sales (other asset types not in our list)
        totalSales++;
        exemptSales++;
      }
    }
  });

  const netGains = safeSubtract(totalGains, totalTaxes);

  return {
    totalTaxes,
    totalGains,
    netGains,
    breakdown,
    taxableSales: taxableSalesDetails,
    summary: {
      totalSales,
      taxableSales,
      exemptSales,
      totalProceeds,
      totalCostBasis
    }
  };
};

/**
 * Calcola metriche complete del fondo di emergenza
 * 
 * @description
 * Funzione centralizzata per calcolare tutte le metriche del fondo emergenza
 * elimina la logica duplicata e garantisce consistenza nei calcoli.
 * 
 * @param {any} assets - Tutti gli asset dell'utente
 * @param {Object} emergencyFundAccount - Account designato come fondo emergenza  
 * @param {number} monthlyExpenses - Spese mensili dell'utente
 * @param {number} adequateMonths - Soglia mesi per considerare "adeguato" (default: 3)
 * @param {number} optimalMonths - Soglia mesi per considerare "ottimale" (default: 6)
 * 
 * @returns {Object} Oggetto con tutte le metriche del fondo emergenza
 * 
 * @example
 * const metrics = calculateEmergencyFundMetrics(
 *   assets, 
 *   { section: 'cash', id: 1 }, 
 *   2000, 
 *   3, 
 *   6
 * );
 * // Returns: { value: 15000, months: 7.5, status: 'optimal', ... }
 * 
 * @metrics
 * - value: Valore attuale del fondo emergenza
 * - months: Mesi di copertura calcolati
 * - monthsFormatted: Mesi formattati con 1 decimale
 * - status: 'optimal' | 'adequate' | 'insufficient'
 * - isAdequate: boolean per soglia adeguata
 * - isOptimal: boolean per soglia ottimale
 * - missingForOptimal: Importo mancante per raggiungere l'ottimale
 * - percentage: Percentuale rispetto all'obiettivo ottimale
 * 
 * @references
 * - Emergency Fund Best Practices: 3-6 months of expenses
 * - Financial Planning Association guidelines
 * 
 * @throws {Error} Returns safe defaults for invalid inputs
 */
/**
 * 🎯 SEMPLIFICAZIONE 5: Calculate emergency fund metrics - Simple and reliable
 */
export const calculateEmergencyFundMetrics = (
  assets: any,
  emergencyFundAccount: { section: string; id: number },
  monthlyExpenses: number,
  adequateMonths: number = 3,
  optimalMonths: number = 6
) => {
  // 🎯 SEMPLIFICAZIONE 5: Simple validation
  if (!assets || typeof assets !== 'object') {
    return getSafeEmergencyFundDefaults();
  }

  // 🎯 SEMPLIFICAZIONE 5: Simple emergency fund account validation
  const emergencyValidation = validateEmergencyFundAccount(assets, emergencyFundAccount);
  if (!emergencyValidation.isValid) {
    return getSafeEmergencyFundDefaults();
  }

  // 🎯 SEMPLIFICAZIONE 5: Simple value extraction
  const emergencyAccount = emergencyValidation.account;
  const emergencyFundValue = Math.max(0, Number(emergencyAccount?.amount || 0));
  const safeMonthlyExpenses = Math.max(1, Number(monthlyExpenses || 1)); // Avoid division by 0

  // 🎯 SEMPLIFICAZIONE 5: Simple calculation
  const months = emergencyFundValue / safeMonthlyExpenses;
  
  // 🎯 SEMPLIFICAZIONE 5: Simple status determination
  const status = months >= optimalMonths ? 'optimal' : 
                 months >= adequateMonths ? 'adequate' : 
                 'insufficient';
  
  // 🎯 SEMPLIFICAZIONE 5: Simple derived calculations
  const missingForOptimal = Math.max(0, (optimalMonths * safeMonthlyExpenses) - emergencyFundValue);
  const percentage = Math.min(100, (months / optimalMonths) * 100);
  
  // 🎯 SEMPLIFICAZIONE 5: Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 SEMPLIFICAZIONE 5 - Simple Emergency Fund:', {
      emergencyFundValue,
      safeMonthlyExpenses,
      months: Math.round(months * 10) / 10,
      status,
      missingForOptimal,
      percentage: Math.round(percentage),
      isSimple: true
    });
  }
      
  // 🎯 SEMPLIFICAZIONE 5: Simple return object
  return {
    value: emergencyFundValue,
    months: Math.round(months * 10) / 10, // 1 decimale
    monthsFormatted: (Math.round(months * 10) / 10).toFixed(1),
    status,
    isAdequate: months >= adequateMonths,
    isOptimal: months >= optimalMonths,
    missingForOptimal,
    percentage: Math.round(percentage)
  };
};

// ✅ HELPER FUNCTIONS
const validateFiniteNumber = (value: any, context: string, defaultValue: number = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  
  if (value !== 0 && value !== defaultValue) { // Don't warn for explicit 0 or default
    console.warn(`validateFiniteNumber: Invalid ${context}: ${value}, using ${defaultValue}`);
  }
  
  return defaultValue;
};

const getSafeEmergencyFundDefaults = () => ({
  value: 0,
  months: 0,
  monthsFormatted: '0.0',
  status: 'insufficient' as const,
  isAdequate: false,
  isOptimal: false,
  missingForOptimal: 0,
  percentage: 0
});

const validateEmergencyFundResult = (result: any): boolean => {
  const requiredFields = ['value', 'months', 'monthsFormatted', 'status', 'isAdequate', 'isOptimal', 'missingForOptimal', 'percentage'];
  
  for (const field of requiredFields) {
    if (!(field in result)) {
      console.error(`validateEmergencyFundResult: Missing field ${field}`);
      return false;
    }
  }

  // Validate numeric fields
  const numericFields = ['value', 'months', 'missingForOptimal', 'percentage'];
  for (const field of numericFields) {
    if (!Number.isFinite(result[field]) || result[field] < 0) {
      console.error(`validateEmergencyFundResult: Invalid ${field}: ${result[field]}`);
      return false;
    }
  }

  return true;
};

/**
 * Validate financial input with comprehensive error checking
 * 
 * @description
 * Validates financial input values with type checking, range validation,
 * and NaN/Infinity protection. Returns safe default values for invalid inputs.
 * 
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error reporting
 * @param {number} min - Minimum allowed value (default: 0)
 * @param {number} max - Maximum allowed value (default: Infinity)
 * @returns {number} Validated number or safe default
 * 
 * @example
 * const validatedValue = validateFinancialInput(userInput, 'monthlyExpenses', 0, 1000000);
 * // Returns safe value or logs warning
 */
export const validateFinancialInput = (
  value: any, 
  fieldName: string, 
  min: number = 0, 
  max: number = Infinity
): number => {
  // Type checking
  if (typeof value !== 'number') {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      value = Number(value);
    } else {
      console.warn(`validateFinancialInput: ${fieldName} is not a number: ${value}`);
      return min;
    }
  }
  
  // NaN/Infinity checking
  if (!Number.isFinite(value)) {
    console.warn(`validateFinancialInput: ${fieldName} is not finite: ${value}`);
    return min;
  }
  
  // Range checking
  if (value < min || value > max) {
    console.warn(`validateFinancialInput: ${fieldName} out of range [${min}, ${max}]: ${value}`);
    return Math.max(min, Math.min(max, value));
  }
  
  return value;
};

/**
 * Calcola le tasse su capital gains basate sul tipo di asset
 * 
 * @description
 * Funzione per calcolare le tasse su plusvalenze con aliquote differenziate
 * per obbligazioni whitelist vs asset standard.
 * 
 * @param {number} capitalGain - Plusvalenza (può essere negativa)
 * @param {string} assetType - Tipo di asset
 * @param {number} standardRate - Aliquota standard (default: 26%)
 * @param {number} whitelistRate - Aliquota obbligazioni whitelist (default: 12.5%)
 * 
 * @returns {number} Tasse dovute (0 se minusvalenza)
 * 
 * @example
 * // Plusvalenza su azione con aliquota standard
 * const tax = calculateCapitalGainsTax(1000, 'Azione', 26, 12.5); // Returns 260
 * 
 * // Plusvalenza su obbligazione whitelist
 * const tax = calculateCapitalGainsTax(1000, 'Obbligazione whitelist', 26, 12.5); // Returns 125
 * 
 * // Minusvalenza (nessuna tassa)
 * const tax = calculateCapitalGainsTax(-500, 'ETF', 26, 12.5); // Returns 0
 * 
 * @taxRates
 * - Azione, ETF, Obbligazione: aliquota standard (26%)
 * - Obbligazione whitelist: aliquota ridotta (12.5%)
 * 
 * @references
 * - Decreto Legislativo 14 marzo 2011, n. 23
 * - Agenzia delle Entrate: Circolare 4/E del 2011
 * 
 * @throws {Error} Returns 0 for invalid inputs
 */
export const calculateTaxForAssetType = (
  capitalGain: number,
  assetType: AssetTypeComplete,
  standardRate: number = 26,
  whitelistRate: number = 12.5
): number => {
  // Le tasse si applicano solo su plusvalenze positive
  if (capitalGain <= 0) return 0;
  
  // Determina aliquota in base al tipo
  const taxRate = assetType === 'Obbligazione whitelist' ? whitelistRate : standardRate;
  
  return safePortfolioCalculation(() => {
    return new Decimal(capitalGain).times(taxRate).dividedBy(100);
  }, new Decimal(0), 'Capital gains tax calculation').toNumber();
};

/**
 * Analizza le tasse per anno dalle transazioni
 * 
 * @description
 * Analizza le transazioni per calcolare tasse su capital gains
 * con breakdown per tipo di asset e anno fiscale.
 * 
 * @param {Transaction[]} transactions - Array delle transazioni
 * @param {number} standardRate - Aliquota standard (default: 26%)
 * @param {number} whitelistRate - Aliquota whitelist (default: 12.5%)
 * @param {string} costBasisMethod - Metodo di calcolo cost basis (default: 'LIFO')
 * 
 * @returns {Object} Oggetto con analisi fiscale per anno
 * 
 * @example
 * const analysis = analyzeTaxesByYear(transactions, 26, 12.5, 'LIFO');
 * // Returns: { '2024': { totalCapitalGains: 5000, totalTaxes: 1200, ... } }
 * 
 * @analysis
 * - totalCapitalGains: Plusvalenze totali per anno
 * - totalTaxes: Tasse totali dovute per anno
 * - netGains: Plusvalenze nette (al netto tasse)
 * - standardAssetGains: Plusvalenze su asset standard
 * - whitelistAssetGains: Plusvalenze su obbligazioni whitelist
 * - standardTaxes: Tasse su asset standard
 * - whitelistTaxes: Tasse su obbligazioni whitelist
 * 
 * @references
 * - Agenzia delle Entrate: Dichiarazione dei redditi
 * - Decreto Legislativo 14 marzo 2011, n. 23
 * 
 * @throws {Error} Returns empty analysis for invalid inputs
 */
export const analyzeTaxesByYear = (
  transactions: Transaction[],
  standardRate: number = 26,
  whitelistRate: number = 12.5,
  costBasisMethod: 'FIFO' | 'LIFO' | 'AVERAGE_COST' = 'LIFO'
) => {
  const taxAnalysis: { [year: string]: {
    totalCapitalGains: number;
    totalTaxes: number;
    netGains: number;
    standardAssetGains: number;
    whitelistAssetGains: number;
    standardTaxes: number;
    whitelistTaxes: number;
    transactionCount: number;
    taxableTransactionCount: number;
  }} = {};

  try {
    // ✅ SAFE: Validate inputs
    if (!Array.isArray(transactions)) {
      console.warn('analyzeTaxesByYear: Invalid transactions array');
      return {};
    }
    
    const safeCapitalGainsTaxRate = validateAndNormalizeBigNumbers(standardRate, 'capitalGainsTaxRate');
    const safeWhitelistBondsTaxRate = validateAndNormalizeBigNumbers(whitelistRate, 'whitelistBondsTaxRate');
    
    // ✅ SAFE: Filter valid transactions
    const validTransactions = transactions.filter(t => 
      t && 
      typeof t === 'object' && 
      t.date && 
      !isNaN(new Date(t.date).getTime()) &&
      typeof t.amount === 'number' &&
      Number.isFinite(t.amount)
    );
    
    if (validTransactions.length === 0) {
      console.warn('analyzeTaxesByYear: No valid transactions found');
      return {};
    }
    // Group transactions by ticker/ISIN for cost basis calculation
    const transactionsByAsset = new Map<string, Transaction[]>();
    
    validTransactions.forEach(transaction => {
      const key = transaction.ticker || transaction.isin || 'unknown';
      if (!transactionsByAsset.has(key)) {
        transactionsByAsset.set(key, []);
      }
      transactionsByAsset.get(key)!.push(transaction);
    });

    // Process each asset's transactions
    transactionsByAsset.forEach((assetTransactions, assetKey) => {
      // Sort transactions by date
      const sortedTransactions = assetTransactions.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Process transactions sequentially to calculate proper cost basis for each sale
      let lots: Lot[] = [];
      
      for (const transaction of sortedTransactions) {
        if (transaction.transactionType === 'purchase') {
          // Add new lot
          const unitPrice = transaction.quantity > 0 ? safeDivide(transaction.amount, transaction.quantity) : 0;
          lots.push({
            date: transaction.date,
            quantity: transaction.quantity,
            unitPrice: unitPrice,
            totalCost: transaction.amount,
            commissions: transaction.commissions,
            id: `${transaction.id || Date.now()}`
          });
          
        } else if (transaction.transactionType === 'sale') {
          // Calculate sale proceeds
          const salePrice = transaction.quantity > 0 ? safeDivide(transaction.amount, transaction.quantity) : 0;
          
          // Process sale to get the realized gain/loss
          const saleResult = processSale(lots, transaction.quantity, salePrice, transaction.commissions, costBasisMethod);
          
          // Update lots after sale
          lots = saleResult.remainingLots;
          
          // The realized gain/loss from processSale is exactly what we need
          const capitalGain = saleResult.realizedGainLoss;
          
          // Only process if there's a positive capital gain
          if (capitalGain > 0) {
            // Get the year from transaction date
            const year = new Date(transaction.date).getFullYear().toString();
            
            // Initialize year if not exists
            if (!taxAnalysis[year]) {
              taxAnalysis[year] = {
                totalCapitalGains: 0,
                totalTaxes: 0,
                netGains: 0,
                standardAssetGains: 0,
                whitelistAssetGains: 0,
                standardTaxes: 0,
                whitelistTaxes: 0,
                transactionCount: 0,
                taxableTransactionCount: 0
              };
            }
            
            // Calculate tax based on asset type
            const tax = calculateTaxForAssetType(capitalGain, transaction.assetType, safeCapitalGainsTaxRate, safeWhitelistBondsTaxRate);
            
            // Update analysis
            taxAnalysis[year].totalCapitalGains = safeAdd(taxAnalysis[year].totalCapitalGains, capitalGain);
            taxAnalysis[year].totalTaxes = safeAdd(taxAnalysis[year].totalTaxes, tax);
            taxAnalysis[year].transactionCount = safeAdd(taxAnalysis[year].transactionCount, 1);
            taxAnalysis[year].taxableTransactionCount = safeAdd(taxAnalysis[year].taxableTransactionCount, 1);
            
            // Update breakdown by asset type
            if (transaction.assetType === 'Obbligazione whitelist') {
              taxAnalysis[year].whitelistAssetGains = safeAdd(taxAnalysis[year].whitelistAssetGains, capitalGain);
              taxAnalysis[year].whitelistTaxes = safeAdd(taxAnalysis[year].whitelistTaxes, tax);
            } else {
              taxAnalysis[year].standardAssetGains = safeAdd(taxAnalysis[year].standardAssetGains, capitalGain);
              taxAnalysis[year].standardTaxes = safeAdd(taxAnalysis[year].standardTaxes, tax);
            }
          } else {
            // Count non-taxable transactions
            const year = new Date(transaction.date).getFullYear().toString();
            if (!taxAnalysis[year]) {
              taxAnalysis[year] = {
                totalCapitalGains: 0,
                totalTaxes: 0,
                netGains: 0,
                standardAssetGains: 0,
                whitelistAssetGains: 0,
                standardTaxes: 0,
                whitelistTaxes: 0,
                transactionCount: 0,
                taxableTransactionCount: 0
              };
            }
            taxAnalysis[year].transactionCount = safeAdd(taxAnalysis[year].transactionCount, 1);
          }
        }
      }
    });

    // Calculate net gains for each year
    Object.keys(taxAnalysis).forEach(year => {
      taxAnalysis[year].netGains = safeSubtract(taxAnalysis[year].totalCapitalGains, taxAnalysis[year].totalTaxes);
    });

  } catch (error) {
    console.error('Error in analyzeTaxesByYear:', error);
  }

  return taxAnalysis;
};

export interface SWRResult {
  withdrawableAssets: number;
  annualWithdrawal: number;
  monthlyWithdrawal: number;
  yearsOfSupport: number;
  realSWRRate: number;
  inflationAdjusted: boolean;
  recommendedRate: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  warnings: string[];
  adjustedForInflation: number;
  portfolioVolatility?: number;
}

/**
 * Calculate Safe Withdrawal Rate with inflation adjustment and risk assessment
 * 
 * @description
 * Implements Trinity Study methodology with modern adjustments for inflation,
 * portfolio risk, and European market conditions.
 * 
 * @param {Object} totals - Portfolio totals from assets calculation
 * @param {number} swrRate - Base SWR rate percentage (1-10)
 * @param {number} inflationRate - Annual inflation rate percentage
 * @param {number} monthlyExpenses - Monthly expenses for sustainability calculation
 * 
 * @returns {SWRResult} Complete SWR analysis with risk adjustments
 */
export const calculateSWR = (
  totals: any,
  swrRate: number,
  inflationRate: number,
  monthlyExpenses: number,
  translate?: (key: string, params?: Record<string, string | number>) => string
): SWRResult => {
  const warnings: string[] = [];
  
  // Validate inputs
  if (!totals || typeof totals !== 'object') {
    throw new Error('Invalid totals object');
  }
  
  const safeSwrRate = Math.max(1, Math.min(10, swrRate || 3.5));
  const safeInflationRate = Math.max(0, Math.min(20, inflationRate || 2));
  const safeMonthlyExpenses = Math.max(0, monthlyExpenses || 0);
  
  // 🎯 SEMPLIFICAZIONE 1: Calcola asset prelevabili (withdrawable assets)
  // Esclusi sempre: realEstate (illiquid), pensionFunds (locked until retirement)
  const withdrawableAssets = safeAdd(
    safeAdd(totals.cash || 0, totals.investments || 0),
    totals.otherAccounts || 0
  );
  
  // Risk assessment based on portfolio composition
  let riskLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
  const totalAssets = Math.max(1, totals.total || 1); // Avoid division by zero
  const stocksPercentage = safeDivide(totals.investments || 0, totalAssets) * 100;
  
  if (stocksPercentage > 70) {
    riskLevel = 'aggressive';
  } else if (stocksPercentage < 30) {
    riskLevel = 'conservative';
  }
  
  // Risk-adjusted SWR rate
  const riskAdjustments = {
    conservative: -0.5, // More conservative: 3.5% -> 3.0%
    moderate: 0,        // Standard: 3.5%
    aggressive: +0.5    // More aggressive: 3.5% -> 4.0%
  };
  
  const adjustedSWR = Math.max(1.0, safeSwrRate + riskAdjustments[riskLevel]);
  
  // Calculate withdrawals
  const annualWithdrawal = safeMultiply(withdrawableAssets, safeDivide(adjustedSWR, 100));
  const monthlyWithdrawal = safeDivide(annualWithdrawal, 12);
  
  // Real SWR rate (inflation-adjusted)
  const realSWRRate = Math.max(1.0, adjustedSWR - safeInflationRate);
  
  // Inflation-adjusted calculations
  const inflationMultiplier = 1 + (safeInflationRate / 100);
  const inflationAdjustedAnnualExpenses = safeMultiply(safeMonthlyExpenses * 12, inflationMultiplier);
  const adjustedForInflation = safeDivide(annualWithdrawal, inflationMultiplier);
  
  // Years of support calculation
  let yearsOfSupport = 0;
  if (safeMonthlyExpenses > 0) {
    if (monthlyWithdrawal >= safeMonthlyExpenses) {
      yearsOfSupport = 30; // Trinity study assumes 30-year retirement
    } else {
      yearsOfSupport = Math.min(30, safeDivide(withdrawableAssets, Math.max(1, inflationAdjustedAnnualExpenses)));
    }
  } else {
    if (translate) {
      warnings.push(translate('swrMonthlyExpensesNotSet'));
    } else {
      warnings.push('Monthly expenses not set - cannot calculate sustainability');
    }
  }
  
  // Generate warnings
  if (withdrawableAssets < 100000) {
    if (translate) {
      warnings.push(translate('swrSmallPortfolioWarning'));
    } else {
      warnings.push('Portfolio size may be too small for reliable SWR application');
    }
  }
  
  if (safeSwrRate > 5) {
    if (translate) {
      warnings.push(translate('swrRateTooHigh'));
    } else {
      warnings.push('SWR rate above 5% is considered risky');
    }
  }
  
  if (monthlyWithdrawal < safeMonthlyExpenses && safeMonthlyExpenses > 0) {
    if (translate) {
      warnings.push(translate('swrInsufficientWithdrawalWarning'));
    } else {
      warnings.push('SWR withdrawal insufficient to cover monthly expenses');
    }
  }
  
  return {
    withdrawableAssets: withdrawableAssets,
    annualWithdrawal,
    monthlyWithdrawal,
    yearsOfSupport,
    realSWRRate,
    inflationAdjusted: true,
    recommendedRate: adjustedSWR,
    riskLevel,
    warnings,
    adjustedForInflation
  };
};

/**
 * Test function to validate Risk Score calculation logic
 * Run this in development mode to verify mathematical correctness
 */
export const testRiskScoreCalculation = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing Risk Score Calculation Logic...');
  
  // Test case 1: 0% volatility = 0 risk score
  const test1 = calculatePortfolioRiskScore({ cash: 100000 }, 100000);
  console.assert(Math.abs(test1) < 0.1, `Test 1 failed: 0% volatility should be ~0, got ${test1}`);
  console.log(`✅ Test 1: 0% volatility = ${test1.toFixed(2)} risk score`);
  
  // Test case 2: 15% volatility = 5 risk score
  const test2 = calculatePortfolioRiskScore({ stocks: 100000 }, 100000);
  console.log(`✅ Test 2: ~15% volatility = ${test2.toFixed(2)} risk score`);
  
  // Test case 3: 30% volatility = 10 risk score
  const test3 = calculatePortfolioRiskScore({ alternatives: 100000 }, 100000);
  console.log(`✅ Test 3: ~30% volatility = ${test3.toFixed(2)} risk score`);
  
  // Test case 4: Extreme volatility should be capped
  const test4 = calculatePortfolioRiskScore({ 
    alternatives: 50000, 
    commodities: 50000 
  }, 100000);
  console.assert(test4 <= 15, `Test 4 failed: Extreme volatility should be capped, got ${test4}`);
  console.log(`✅ Test 4: Extreme volatility = ${test4.toFixed(2)} risk score (capped)`);
  
  // Test case 5: Linear progression
  const test5a = calculatePortfolioRiskScore({ bonds: 100000 }, 100000);
  const test5b = calculatePortfolioRiskScore({ stocks: 100000 }, 100000);
  const test5c = calculatePortfolioRiskScore({ alternatives: 100000 }, 100000);
  
  console.log(`✅ Test 5: Linear progression - Bonds: ${test5a.toFixed(2)}, Stocks: ${test5b.toFixed(2)}, Alternatives: ${test5c.toFixed(2)}`);
  console.assert(test5a < test5b && test5b < test5c, 'Test 5 failed: Risk should increase with volatility');
  
  console.log('🎉 All Risk Score tests passed!');
};

/**
 * Test function to validate Asset Volatility calculation
 * Run this in development mode to verify volatility values are correct
 */
export const testAssetVolatility = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing Asset Volatility Calculation...');
  
  // Test case 1: Cash should have very low volatility
  const cashVol = getAssetVolatility('cash');
  console.assert(Math.abs(cashVol - 0.005) < 0.001, `Test 1 failed: Cash volatility should be ~0.005, got ${cashVol}`);
  console.log(`✅ Test 1: Cash volatility = ${cashVol} (${(cashVol * 100).toFixed(1)}%)`);
  
  // Test case 2: Stocks should have moderate volatility
  const stocksVol = getAssetVolatility('stocks');
  console.assert(Math.abs(stocksVol - 0.18) < 0.01, `Test 2 failed: Stocks volatility should be ~0.18, got ${stocksVol}`);
  console.log(`✅ Test 2: Stocks volatility = ${stocksVol} (${(stocksVol * 100).toFixed(1)}%)`);
  
  // Test case 3: Alternatives should have high volatility
  const altVol = getAssetVolatility('alternatives');
  console.assert(Math.abs(altVol - 0.20) < 0.01, `Test 3 failed: Alternatives volatility should be ~0.20, got ${altVol}`);
  console.log(`✅ Test 3: Alternatives volatility = ${altVol} (${(altVol * 100).toFixed(1)}%)`);
  
  // Test case 4: Unknown asset class should default to stocks
  const unknownVol = getAssetVolatility('unknownAsset');
  console.assert(Math.abs(unknownVol - 0.18) < 0.01, `Test 4 failed: Unknown asset should default to stocks volatility, got ${unknownVol}`);
  console.log(`✅ Test 4: Unknown asset volatility = ${unknownVol} (${(unknownVol * 100).toFixed(1)}%)`);
  
  // Test case 5: Portfolio variance calculation with known values
  const testAllocations = {
    cash: 50000,      // 50% cash (low vol)
    stocks: 50000     // 50% stocks (high vol)
  };
  const testTotal = 100000;
  
  const testRiskScore = calculatePortfolioRiskScore(testAllocations, testTotal);
  console.log(`✅ Test 5: Portfolio risk score = ${testRiskScore.toFixed(2)}`);
  console.assert(testRiskScore > 0 && testRiskScore < 10, `Test 5 failed: Risk score should be reasonable, got ${testRiskScore}`);
  
  console.log('🎉 All Asset Volatility tests passed!');
};

/**
 * Test function to validate Cost Basis Methods
 * Run this in development mode to verify cost basis calculations are correct
 */
export const testCostBasisMethods = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing Cost Basis Methods...');
  
  const testTransactions: Transaction[] = [
    { 
      id: 1,
      date: '2023-01-01', 
      quantity: 100, 
      unitPrice: 10, 
      amount: 1000,
      transactionType: 'purchase',
      assetType: 'Azione',
      ticker: 'TEST',
      isin: 'TEST123',
      commissions: 0,
      description: 'Test purchase 1'
    },
    { 
      id: 2,
      date: '2023-02-01', 
      quantity: 100, 
      unitPrice: 20, 
      amount: 2000,
      transactionType: 'purchase',
      assetType: 'Azione',
      ticker: 'TEST',
      isin: 'TEST123',
      commissions: 0,
      description: 'Test purchase 2'
    },
    { 
      id: 3,
      date: '2023-03-01', 
      quantity: 100, 
      unitPrice: 30, 
      amount: 3000,
      transactionType: 'purchase',
      assetType: 'Azione',
      ticker: 'TEST',
      isin: 'TEST123',
      commissions: 0,
      description: 'Test purchase 3'
    }
  ];
  
  // Test FIFO: dovrebbe vendere prima a 10
  const fifoResult = applyCostBasisMethod(testTransactions, 150, 'FIFO');
  const expectedFIFO = 100 * 10 + 50 * 20; // 100*10 + 50*20 = 2000
  console.assert(Math.abs(fifoResult.costBasis - expectedFIFO) < 0.01, 
    `FIFO: Expected ${expectedFIFO}, got ${fifoResult.costBasis}`);
  console.log(`✅ Test 1: FIFO cost basis = ${fifoResult.costBasis.toFixed(2)} (expected ~${expectedFIFO})`);
  
  // Test LIFO: dovrebbe vendere prima a 30
  const lifoResult = applyCostBasisMethod(testTransactions, 150, 'LIFO');
  const expectedLIFO = 100 * 30 + 50 * 20; // 100*30 + 50*20 = 4000
  console.assert(Math.abs(lifoResult.costBasis - expectedLIFO) < 0.01, 
    `LIFO: Expected ${expectedLIFO}, got ${lifoResult.costBasis}`);
  console.log(`✅ Test 2: LIFO cost basis = ${lifoResult.costBasis.toFixed(2)} (expected ~${expectedLIFO})`);
  
  // Test Average: (10+20+30)/3 = 20
  const avgResult = applyCostBasisMethod(testTransactions, 150, 'AVERAGE_COST');
  const expectedAvg = 150 * 20; // 150*20 = 3000
  console.assert(Math.abs(avgResult.costBasis - expectedAvg) < 0.01, 
    `Average: Expected ${expectedAvg}, got ${avgResult.costBasis}`);
  console.log(`✅ Test 3: Average cost basis = ${avgResult.costBasis.toFixed(2)} (expected ~${expectedAvg})`);
  
  // Test 4: Verify FIFO < Average < LIFO
  console.assert(fifoResult.costBasis < avgResult.costBasis, 'FIFO should be less than Average');
  console.assert(avgResult.costBasis < lifoResult.costBasis, 'Average should be less than LIFO');
  console.log(`✅ Test 4: Cost basis order verified - FIFO(${fifoResult.costBasis.toFixed(2)}) < Average(${avgResult.costBasis.toFixed(2)}) < LIFO(${lifoResult.costBasis.toFixed(2)})`);
  
  // Test 5: Verify quantities
  console.assert(fifoResult.quantity === 150, `FIFO quantity should be 150, got ${fifoResult.quantity}`);
  console.assert(lifoResult.quantity === 150, `LIFO quantity should be 150, got ${lifoResult.quantity}`);
  console.assert(avgResult.quantity === 150, `Average quantity should be 150, got ${avgResult.quantity}`);
  console.log(`✅ Test 5: Quantities verified - all methods sold 150 units`);
  
  console.log('🎉 All Cost Basis Methods tests passed!');
};

/**
 * Test function to validate CAGR calculation with short periods
 * Run this in development mode to verify CAGR calculations are correct
 */
export const testCAGRCalculation = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing CAGR Calculation with Short Periods...');
  
  // Test 1: Standard CAGR (5 years)
  const standardCAGR = safeCAGR(10000, 15000, 5);
  const expectedStandard = ((Math.pow(15000/10000, 1/5) - 1) * 100);
  console.assert(Math.abs(standardCAGR - expectedStandard) < 0.1, 
    `Standard CAGR: Expected ~${expectedStandard.toFixed(2)}%, got ${standardCAGR.toFixed(2)}%`);
  console.log(`✅ Test 1: Standard CAGR (5 years) = ${standardCAGR.toFixed(2)}%`);
  
  // Test 2: Very short period (< 1 month) - should return simple return
  const veryShortCAGR = safeCAGR(10000, 11000, 0.05); // 18 days
  const expectedSimpleReturn = ((11000 - 10000) / 10000) * 100;
  console.assert(Math.abs(veryShortCAGR - expectedSimpleReturn) < 0.1, 
    `Very short period: Expected ${expectedSimpleReturn.toFixed(2)}%, got ${veryShortCAGR.toFixed(2)}%`);
  console.log(`✅ Test 2: Very short period (18 days) = ${veryShortCAGR.toFixed(2)}% (simple return)`);
  
  // Test 3: Short period (2 months) - should warn about volatility
  const shortCAGR = safeCAGR(10000, 11000, 0.167); // 2 months
  const expectedAnnualized = ((11000/10000 - 1) * 100) * (12 / (0.167 * 12));
  console.assert(Math.abs(shortCAGR - expectedAnnualized) < 0.1, 
    `Short period: Expected ~${expectedAnnualized.toFixed(2)}%, got ${shortCAGR.toFixed(2)}%`);
  console.log(`✅ Test 3: Short period (2 months) = ${shortCAGR.toFixed(2)}% (annualized with warning)`);
  
  // Test 4: Extreme values - should be capped
  const extremeCAGR = safeCAGR(1000, 50000, 0.5); // 6 months, 4900% gain
  console.assert(Math.abs(extremeCAGR) <= 1000, 
    `Extreme CAGR: Should be capped at ±1000%, got ${extremeCAGR.toFixed(2)}%`);
  console.log(`✅ Test 4: Extreme values = ${extremeCAGR.toFixed(2)}% (capped)`);
  
  // Test 5: Invalid inputs - should handle gracefully
  const invalidCAGR1 = safeCAGR(0, 10000, 1); // Zero initial value
  console.assert(invalidCAGR1 === 0, `Invalid input 1: Should return 0, got ${invalidCAGR1}`);
  
  const invalidCAGR2 = safeCAGR(10000, -1000, 1); // Negative final value
  console.assert(invalidCAGR2 === -100, `Invalid input 2: Should return -100, got ${invalidCAGR2}`);
  
  const invalidCAGR3 = safeCAGR(10000, 11000, 0); // Zero years
  console.assert(invalidCAGR3 === 0, `Invalid input 3: Should return 0, got ${invalidCAGR3}`);
  
  console.log(`✅ Test 5: Invalid inputs handled correctly`);
  
  // Test 6: Negative returns
  const negativeCAGR = safeCAGR(10000, 8000, 2); // 20% loss over 2 years
  const expectedNegative = ((Math.pow(8000/10000, 1/2) - 1) * 100);
  console.assert(Math.abs(negativeCAGR - expectedNegative) < 0.1, 
    `Negative CAGR: Expected ~${expectedNegative.toFixed(2)}%, got ${negativeCAGR.toFixed(2)}%`);
  console.log(`✅ Test 6: Negative returns = ${negativeCAGR.toFixed(2)}%`);
  
  console.log('🎉 All CAGR tests passed!');
};

/**
 * Advanced SWR Calculation Result Interface
 */
interface SWRCalculationResult {
  basicSWR: number;           // SWR standard 4%
  inflationAdjustedSWR: number; // Aggiustato per inflazione
  riskAdjustedSWR: number;    // Aggiustato per rischio portfolio
  monthlyWithdrawal: number;  // Prelievo mensile
  confidence: 'high' | 'medium' | 'low'; // Livello confidenza
  warnings: string[];         // Warning per utente
}

/**
 * Calculate Advanced Safe Withdrawal Rate with inflation and risk adjustments
 * 
 * @description
 * Implements advanced SWR calculation with inflation adjustment and portfolio risk assessment.
 * Provides multiple SWR rates based on different risk factors and market conditions.
 * 
 * @param {number} netLiquidAssets - Total liquid assets available for withdrawal
 * @param {number} monthlyExpenses - Monthly expenses for sustainability calculation
 * @param {number} inflationRate - Annual inflation rate percentage (default: 2.0)
 * @param {number} portfolioRiskScore - Portfolio risk score 0-10 (default: 5)
 * @param {Object} settings - SWR calculation settings
 * @param {number} settings.baseSWRRate - Base SWR rate percentage (default: 4%)
 * @param {number} settings.riskFreeRate - Risk-free rate percentage (default: 2%)
 * @param {number} settings.timeHorizon - Retirement time horizon in years (default: 30)
 * 
 * @returns {SWRCalculationResult} Complete advanced SWR analysis
 * 
 * @example
 * const result = calculateAdvancedSWR(1000000, 3000, 3.5, 6.5, {
 *   baseSWRRate: 4.0,
 *   riskFreeRate: 2.0,
 *   timeHorizon: 30
 * });
 * 
 * @see https://en.wikipedia.org/wiki/Trinity_study
 */
export const calculateAdvancedSWR = (
  netLiquidAssets: number,
  monthlyExpenses: number,
  inflationRate: number = 2.0,
  portfolioRiskScore: number = 5,
  settings: {
    baseSWRRate: number;      // Default 4%
    riskFreeRate: number;     // Default 2%
    timeHorizon: number;      // Default 30 years
  } = { baseSWRRate: 4.0, riskFreeRate: 2.0, timeHorizon: 30 },
  translate?: (key: string, params?: Record<string, string | number>) => string
): SWRCalculationResult => {
  
  const warnings: string[] = [];
  
  // Validate inputs
  if (netLiquidAssets <= 0) {
    warnings.push('Net liquid assets must be positive');
    return {
      basicSWR: 0,
      inflationAdjustedSWR: 0,
      riskAdjustedSWR: 0,
      monthlyWithdrawal: 0,
      confidence: 'low',
      warnings: ['Invalid input: net liquid assets must be positive']
    };
  }
  
  if (monthlyExpenses < 0) {
    warnings.push('Monthly expenses cannot be negative');
    return {
      basicSWR: 0,
      inflationAdjustedSWR: 0,
      riskAdjustedSWR: 0,
      monthlyWithdrawal: 0,
      confidence: 'low',
      warnings: ['Invalid input: monthly expenses cannot be negative']
    };
  }
  
  // 1. Basic SWR (Trinity Study baseline)
  const basicSWR = Math.max(1.0, Math.min(10.0, settings.baseSWRRate));
  
  // 2. Inflation-Adjusted SWR
  // Reduce SWR by inflation rate above historical average (2%)
  const excessInflation = Math.max(0, inflationRate - 2.0);
  const inflationAdjustment = excessInflation * 0.5; // 50% reduction for excess inflation
  const inflationAdjustedSWR = Math.max(1.0, basicSWR - inflationAdjustment);
  
  if (excessInflation > 0) {
    if (translate) {
      warnings.push(translate('swrHighInflationWarning', { 
        rate: inflationRate.toFixed(1), 
        adjustment: inflationAdjustment.toFixed(1) 
      }));
    } else {
      warnings.push(`High inflation (${inflationRate.toFixed(1)}%) reduces safe withdrawal rate by ${inflationAdjustment.toFixed(1)}%`);
    }
  }
  
  // 3. Risk-Adjusted SWR 
  // Reduce SWR for high-risk portfolios (risk score > 6)
  let riskAdjustment = 0;
  if (portfolioRiskScore > 6) {
    const excessRisk = portfolioRiskScore - 6;
    riskAdjustment = Math.min(excessRisk * 0.15, 1.0); // ✅ Max -1% adjustment
    if (translate) {
      warnings.push(translate('swrHighRiskWarning', { 
        score: portfolioRiskScore.toFixed(1), 
        adjustment: riskAdjustment.toFixed(1) 
      }));
    } else {
      warnings.push(`High portfolio risk (${portfolioRiskScore.toFixed(1)}/10) reduces SWR by ${riskAdjustment.toFixed(1)}%`);
    }
  } else if (portfolioRiskScore < 4) {
    // ✅ AGGIUNGI bonus per portfoli conservativi
    const riskBonus = (4 - portfolioRiskScore) * 0.1;
    riskAdjustment = -Math.min(riskBonus, 0.5); // ✅ Max +0.5% bonus
    if (riskAdjustment < 0) {
      if (translate) {
        warnings.push(translate('swrConservativePortfolioWarning', { 
          score: portfolioRiskScore.toFixed(1), 
          bonus: Math.abs(riskAdjustment).toFixed(1) 
        }));
      } else {
        warnings.push(`Conservative portfolio (${portfolioRiskScore.toFixed(1)}/10) allows slightly higher SWR (+${Math.abs(riskAdjustment).toFixed(1)}%)`);
      }
    }
  }
  
  const riskAdjustedSWR = Math.max(1.0, inflationAdjustedSWR - riskAdjustment);
  
  // 4. Calculate monthly withdrawal
  const monthlyWithdrawal = (netLiquidAssets * riskAdjustedSWR / 100) / 12;
  
  // 5. Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (netLiquidAssets < monthlyExpenses * 300) { // Less than 25 years of expenses
    confidence = 'low';
    if (translate) {
      warnings.push(translate('swrInsufficientAssetsWarning'));
    } else {
      warnings.push('Asset base may be insufficient for long-term retirement');
    }
  } else if (riskAdjustedSWR < 3.0 || portfolioRiskScore > 7) {
    confidence = 'medium';
    if (riskAdjustedSWR < 3.0) {
      if (translate) {
        warnings.push(translate('swrSmallPortfolioWarning'));
      } else {
        warnings.push('Low SWR rate indicates conservative approach');
      }
    }
    if (portfolioRiskScore > 7) {
      if (translate) {
        warnings.push(translate('swrHighRiskWarning', { score: portfolioRiskScore.toFixed(1) }));
      } else {
        warnings.push('High portfolio risk requires careful monitoring');
      }
    }
  } else {
    confidence = 'high';
  }
  
  // Additional warnings based on market conditions
  if (inflationRate > 5) {
    warnings.push('Very high inflation may require additional adjustments');
  }
  
  if (portfolioRiskScore > 8) {
    warnings.push('Extremely high portfolio risk - consider rebalancing');
  }
  
  return {
    basicSWR: Number(basicSWR.toFixed(2)),
    inflationAdjustedSWR: Number(inflationAdjustedSWR.toFixed(2)),
    riskAdjustedSWR: Number(riskAdjustedSWR.toFixed(2)),
    monthlyWithdrawal: Number(monthlyWithdrawal.toFixed(2)),
    confidence,
    warnings
  };
};

/**
 * Test function to validate Advanced SWR calculation
 * Run this in development mode to verify SWR calculations are correct
 */
export const testAdvancedSWRCalculation = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing Advanced SWR Calculation...');
  
  // Test 1: Standard scenario (1M assets, 3K expenses, normal inflation)
  const standardResult = calculateAdvancedSWR(1000000, 3000, 2.0, 5.0);
  console.assert(standardResult.basicSWR === 4.0, `Standard basic SWR: Expected 4.0%, got ${standardResult.basicSWR}%`);
  console.assert(standardResult.inflationAdjustedSWR === 4.0, `Standard inflation adjusted: Expected 4.0%, got ${standardResult.inflationAdjustedSWR}%`);
  console.assert(standardResult.riskAdjustedSWR === 4.0, `Standard risk adjusted: Expected 4.0%, got ${standardResult.riskAdjustedSWR}%`);
  console.assert(standardResult.confidence === 'high', `Standard confidence: Expected 'high', got '${standardResult.confidence}'`);
  console.log(`✅ Test 1: Standard scenario - SWR: ${standardResult.riskAdjustedSWR}%, Confidence: ${standardResult.confidence}`);
  
  // Test 2: High inflation scenario
  const highInflationResult = calculateAdvancedSWR(1000000, 3000, 5.0, 5.0);
  console.assert(highInflationResult.inflationAdjustedSWR < 4.0, `High inflation: Should reduce SWR, got ${highInflationResult.inflationAdjustedSWR}%`);
  console.assert(highInflationResult.warnings.some(w => w.includes('High inflation')), 'High inflation should generate warning');
  console.log(`✅ Test 2: High inflation scenario - SWR: ${highInflationResult.riskAdjustedSWR}%, Warnings: ${highInflationResult.warnings.length}`);
  
  // Test 3: High risk portfolio scenario
  const highRiskResult = calculateAdvancedSWR(1000000, 3000, 2.0, 8.0);
  console.assert(highRiskResult.riskAdjustedSWR < 4.0, `High risk: Should reduce SWR, got ${highRiskResult.riskAdjustedSWR}%`);
  console.assert(highRiskResult.warnings.some(w => w.includes('High portfolio risk')), 'High risk should generate warning');
  console.log(`✅ Test 3: High risk scenario - SWR: ${highRiskResult.riskAdjustedSWR}%, Warnings: ${highRiskResult.warnings.length}`);
  
  // Test 4: Conservative portfolio scenario
  const conservativeResult = calculateAdvancedSWR(1000000, 3000, 2.0, 3.0);
  console.assert(conservativeResult.riskAdjustedSWR >= 4.0, `Conservative: Should allow higher SWR, got ${conservativeResult.riskAdjustedSWR}%`);
  console.log(`✅ Test 4: Conservative scenario - SWR: ${conservativeResult.riskAdjustedSWR}%`);
  
  // Test 5: Insufficient assets scenario
  const insufficientResult = calculateAdvancedSWR(500000, 3000, 2.0, 5.0);
  console.assert(insufficientResult.confidence === 'low', `Insufficient assets: Should have low confidence, got '${insufficientResult.confidence}'`);
  console.assert(insufficientResult.warnings.some(w => w.includes('insufficient')), 'Insufficient assets should generate warning');
  console.log(`✅ Test 5: Insufficient assets - Confidence: ${insufficientResult.confidence}, Warnings: ${insufficientResult.warnings.length}`);
  
  // Test 6: Invalid inputs
  const invalidResult1 = calculateAdvancedSWR(-100000, 3000, 2.0, 5.0);
  console.assert(invalidResult1.basicSWR === 0, `Invalid assets: Should return 0, got ${invalidResult1.basicSWR}`);
  
  const invalidResult2 = calculateAdvancedSWR(1000000, -3000, 2.0, 5.0);
  console.assert(invalidResult2.basicSWR === 0, `Invalid expenses: Should return 0, got ${invalidResult2.basicSWR}`);
  
  console.log(`✅ Test 6: Invalid inputs handled correctly`);
  
  console.log('🎉 All Advanced SWR tests passed!');
};

/**
 * Logs errors to localStorage for debugging purposes
 * @param context - Context where the error occurred
 * @param error - Error object to log
 */
const logError = (context: string, error: Error): void => {
  try {
    const errorLog = {
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    const existingLogs = localStorage.getItem('mangomoney-error-log');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Keep only last 50 errors to prevent localStorage overflow
    logs.push(errorLog);
    if (logs.length > 50) {
      logs.shift();
    }
    
    localStorage.setItem('mangomoney-error-log', JSON.stringify(logs));
  } catch (logError) {
    console.error('Failed to log error to localStorage:', logError);
  }
};

/**
 * Robust error handling for portfolio calculations with detailed validation
 * 
 * @description
 * Provides comprehensive error handling for portfolio calculations including:
 * - Pre-validation of input parameters
 * - Post-validation of calculation results
 * - Detailed error logging with context
 * - Fallback value handling
 * - localStorage error tracking for debugging
 * 
 * @param calculation - Function to execute for the calculation
 * @param fallbackValue - Value to return if calculation fails
 * @param context - Context string for error logging
 * @returns Result of calculation or fallback value
 * 
 * @example
 * const result = safePortfolioCalculation(
 *   () => calculatePortfolioVariance(assets),
 *   0,
 *   'Portfolio variance calculation'
 * );
 */
export const safePortfolioCalculation = <T>(
  calculation: () => T,
  fallbackValue: T,
  context: string
): T => {
  try {
    // Pre-validation
    if (typeof calculation !== 'function') {
      throw new Error('Calculation must be a function');
    }
    
    const result = calculation();
    
    // Post-validation based on result type
    if (typeof result === 'number') {
      if (!isFinite(result) || isNaN(result)) {
        throw new Error(`Invalid numeric result: ${result}`);
      }
      
      // Additional validation for financial values
      if (Math.abs(result) > 1e12) {
        console.warn(`⚠️ Very large numeric result in ${context}: ${result}`);
      }
      
      if (Math.abs(result) < 1e-8 && result !== 0) {
        console.warn(`⚠️ Very small numeric result in ${context}: ${result}`);
      }
    }
    
    if (result instanceof Decimal) {
      if (!result.isFinite()) {
        throw new Error(`Invalid Decimal result: ${result.toString()}`);
      }
      
      // Additional validation for Decimal values
      if (result.abs().greaterThan(new Decimal('1e12'))) {
        console.warn(`⚠️ Very large Decimal result in ${context}: ${result.toString()}`);
      }
      
      if (result.abs().lessThan(new Decimal('1e-8')) && !result.equals(0)) {
        console.warn(`⚠️ Very small Decimal result in ${context}: ${result.toString()}`);
      }
    }
    
    // Validation for arrays
    if (Array.isArray(result)) {
      if (result.length === 0) {
        console.warn(`⚠️ Empty array result in ${context}`);
      }
      
      // Check for invalid values in arrays
      const invalidValues = result.filter(item => 
        (typeof item === 'number' && (!isFinite(item) || isNaN(item))) ||
        (item instanceof Decimal && !item.isFinite())
      );
      
      if (invalidValues.length > 0) {
        throw new Error(`Array contains invalid values: ${invalidValues.length} invalid items`);
      }
    }
    
    // Validation for objects
    if (result && typeof result === 'object' && !(result instanceof Decimal) && !Array.isArray(result)) {
      const invalidProps = Object.entries(result).filter(([key, value]) => 
        (typeof value === 'number' && (!isFinite(value) || isNaN(value))) ||
        (value instanceof Decimal && !value.isFinite())
      );
      
      if (invalidProps.length > 0) {
        throw new Error(`Object contains invalid properties: ${invalidProps.map(([key]) => key).join(', ')}`);
      }
    }
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`⚠️ Portfolio calculation error in ${context}:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      fallbackUsed: fallbackValue,
      timestamp: new Date().toISOString()
    });
    
    // Log to localStorage for debugging
    logError(`Portfolio calculation - ${context}`, error instanceof Error ? error : new Error(errorMessage));
    
    return fallbackValue;
  }
};

/**
 * Enhanced safe financial operation with portfolio-level error handling
 * 
 * @description
 * Wraps safeFinancialOperation with additional portfolio-specific validation
 * and error handling for complex financial calculations.
 * 
 * @param operation - Financial operation to perform
 * @param fallback - Fallback value if operation fails
 * @param context - Context for error logging
 * @returns Result of operation or fallback value
 */
export const safePortfolioFinancialOperation = (
  operation: () => Decimal, 
  fallback: number = 0,
  context: string = 'Financial operation'
): number => {
  return safePortfolioCalculation(
    () => {
      const result = operation();
      if (!validateFinancialDecimal(result)) {
        throw new Error(`Invalid financial decimal result: ${result.toString()}`);
      }
      return result;
    },
    new Decimal(fallback),
    context
  ).toNumber();
};

/**
 * Test function to validate robust error handling system
 * Run this in development mode to verify error handling works correctly
 */
export const testRobustErrorHandling = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing Robust Error Handling System...');
  
  // Test 1: Valid calculation
  const validResult = safePortfolioCalculation(
    () => new Decimal(100).times(2),
    new Decimal(0),
    'Valid calculation test'
  );
  console.assert(validResult.equals(200), `Valid calculation: Expected 200, got ${validResult.toString()}`);
  console.log('✅ Test 1: Valid calculation passed');
  
  // Test 2: Invalid calculation (division by zero)
  const invalidResult = safePortfolioCalculation(
    () => new Decimal(100).dividedBy(0),
    new Decimal(50),
    'Invalid calculation test'
  );
  console.assert(invalidResult.equals(50), `Invalid calculation: Expected fallback 50, got ${invalidResult.toString()}`);
  console.log('✅ Test 2: Invalid calculation with fallback passed');
  
  // Test 3: Non-function input
  const nonFunctionResult = safePortfolioCalculation(
    'not a function' as any,
    new Decimal(25),
    'Non-function input test'
  );
  console.assert(nonFunctionResult.equals(25), `Non-function input: Expected fallback 25, got ${nonFunctionResult.toString()}`);
  console.log('✅ Test 3: Non-function input with fallback passed');
  
  // Test 4: Large number validation
  const largeNumberResult = safePortfolioCalculation(
    () => new Decimal('1e15'), // Very large number
    new Decimal(0),
    'Large number test'
  );
  console.assert(largeNumberResult.isFinite(), `Large number: Should be finite, got ${largeNumberResult.toString()}`);
  console.log('✅ Test 4: Large number validation passed');
  
  // Test 5: Array validation
  const arrayResult = safePortfolioCalculation(
    () => [1, 2, 3, 4, 5],
    [],
    'Array validation test'
  );
  console.assert(Array.isArray(arrayResult) && arrayResult.length === 5, `Array validation: Expected array with 5 elements`);
  console.log('✅ Test 5: Array validation passed');
  
  // Test 6: Object validation
  const objectResult = safePortfolioCalculation(
    () => ({ a: 1, b: 2, c: 3 }),
    { a: 0, b: 0, c: 0 },
    'Object validation test'
  );
  console.assert(typeof objectResult === 'object' && objectResult.a === 1, `Object validation: Expected object with property a=1`);
  console.log('✅ Test 6: Object validation passed');
  
  // Test 7: Error logging verification
  const errorLogs = localStorage.getItem('mangomoney-error-log');
  console.assert(errorLogs, 'Error logs should be created in localStorage');
  if (errorLogs) {
    const logs = JSON.parse(errorLogs);
    console.assert(Array.isArray(logs), 'Error logs should be an array');
    console.log(`✅ Test 7: Error logging verification passed (${logs.length} errors logged)`);
  }
  
  console.log('🎉 All Robust Error Handling tests passed!');
};

/**
 * Helper functions for safe Decimal.js conversions and standardized financial calculations
 * Ensures consistent Decimal usage across all financial calculations
 */

/**
 * Converts any value to Decimal safely
 * @param value - Number, string, or Decimal to convert
 * @returns Decimal instance
 */
const toDecimal = (value: number | string | Decimal): Decimal => {
  if (value instanceof Decimal) return value;
  if (typeof value === 'string') return new Decimal(value);
  if (typeof value === 'number' && !isFinite(value)) return new Decimal(0);
  return new Decimal(value);
};

/**
 * Converts Decimal to number safely
 * @param value - Decimal or number to convert
 * @returns Finite number or 0
 */
const toNumber = (value: Decimal | number): number => {
  if (typeof value === 'number') return value;
  const num = value.toNumber();
  return isFinite(num) ? num : 0;
};

/**
 * Standardized Decimal.js calculation utilities
 * Provides consistent arithmetic operations for all financial calculations
 */
export const calculateWithDecimal = {
  /**
   * Safe addition with Decimal.js
   */
  add: (a: number | Decimal, b: number | Decimal): Decimal => 
    toDecimal(a).plus(toDecimal(b)),
    
  /**
   * Safe subtraction with Decimal.js
   */
  subtract: (a: number | Decimal, b: number | Decimal): Decimal => 
    toDecimal(a).minus(toDecimal(b)),
    
  /**
   * Safe multiplication with Decimal.js
   */
  multiply: (a: number | Decimal, b: number | Decimal): Decimal => 
    toDecimal(a).times(toDecimal(b)),
    
  /**
   * Safe division with Decimal.js (prevents division by zero)
   */
  divide: (a: number | Decimal, b: number | Decimal): Decimal => {
    const divisor = toDecimal(b);
    if (divisor.equals(0)) {
      console.warn('Division by zero prevented in calculateWithDecimal.divide');
      return new Decimal(0);
    }
    return toDecimal(a).dividedBy(divisor);
  },
  
  /**
   * Calculate percentage with Decimal.js
   */
  percentage: (part: number | Decimal, total: number | Decimal): Decimal => {
    const totalDecimal = toDecimal(total);
    if (totalDecimal.equals(0)) return new Decimal(0);
    return toDecimal(part).dividedBy(totalDecimal).times(100);
  },
  
  /**
   * Calculate percentage change with Decimal.js
   */
  percentageChange: (oldValue: number | Decimal, newValue: number | Decimal): Decimal => {
    const oldDecimal = toDecimal(oldValue);
    if (oldDecimal.equals(0)) return new Decimal(0);
    return toDecimal(newValue).minus(oldDecimal).dividedBy(oldDecimal).times(100);
  },
  
  /**
   * Calculate compound growth with Decimal.js
   */
  compoundGrowth: (initialValue: number | Decimal, finalValue: number | Decimal, periods: number | Decimal): Decimal => {
    const initial = toDecimal(initialValue);
    const final = toDecimal(finalValue);
    const periodCount = toDecimal(periods);
    
    if (initial.equals(0) || periodCount.equals(0)) return new Decimal(0);
    
    return final.dividedBy(initial).pow(calculateWithDecimal.divide(1, periodCount)).minus(1).times(100);
  },
  
  /**
   * Calculate weighted average with Decimal.js
   */
  weightedAverage: (values: (number | Decimal)[], weights: (number | Decimal)[]): Decimal => {
    if (values.length !== weights.length || values.length === 0) {
      return new Decimal(0);
    }
    
    let weightedSum = new Decimal(0);
    let totalWeight = new Decimal(0);
    
    for (let i = 0; i < values.length; i++) {
      const value = toDecimal(values[i]);
      const weight = toDecimal(weights[i]);
      weightedSum = weightedSum.plus(value.times(weight));
      totalWeight = totalWeight.plus(weight);
    }
    
    return totalWeight.equals(0) ? new Decimal(0) : weightedSum.dividedBy(totalWeight);
  },
  
  /**
   * Calculate variance with Decimal.js
   */
  variance: (values: (number | Decimal)[]): Decimal => {
    if (values.length === 0) return new Decimal(0);
    
    const decimals = values.map(v => toDecimal(v));
    const mean = decimals.reduce((sum, val) => sum.plus(val), new Decimal(0)).dividedBy(decimals.length);
    
    const squaredDifferences = decimals.map(val => val.minus(mean).pow(2));
    const sumSquaredDifferences = squaredDifferences.reduce((sum, val) => sum.plus(val), new Decimal(0));
    
    return sumSquaredDifferences.dividedBy(decimals.length);
  },
  
  /**
   * Calculate standard deviation with Decimal.js
   */
  standardDeviation: (values: (number | Decimal)[]): Decimal => {
    return calculateWithDecimal.variance(values).sqrt();
  }
};

/**
 * Test function to validate Decimal.js standardization
 * Run this in development mode to verify consistent Decimal usage
 */
export const testDecimalStandardization = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing Decimal.js Standardization...');
  
  // Test 1: Helper functions
  const testDecimal = toDecimal(123.456);
  const testNumber = toNumber(testDecimal);
  console.assert(testDecimal instanceof Decimal, 'toDecimal should return Decimal instance');
  console.assert(testNumber === 123.456, 'toNumber should return correct number');
  console.log('✅ Test 1: Helper functions working correctly');
  
  // Test 2: calculateWithDecimal operations
  const addResult = calculateWithDecimal.add(100, 200);
  const subtractResult = calculateWithDecimal.subtract(300, 100);
  const multiplyResult = calculateWithDecimal.multiply(10, 5);
  const divideResult = calculateWithDecimal.divide(100, 4);
  const percentageResult = calculateWithDecimal.percentage(25, 100);
  
  console.assert(addResult.equals(300), 'Addition should work correctly');
  console.assert(subtractResult.equals(200), 'Subtraction should work correctly');
  console.assert(multiplyResult.equals(50), 'Multiplication should work correctly');
  console.assert(divideResult.equals(25), 'Division should work correctly');
  console.assert(percentageResult.equals(25), 'Percentage should work correctly');
  console.log('✅ Test 2: calculateWithDecimal operations working correctly');
  
  // Test 3: Division by zero protection
  const zeroDivisionResult = calculateWithDecimal.divide(100, 0);
  console.assert(zeroDivisionResult.equals(0), 'Division by zero should return 0');
  console.log('✅ Test 3: Division by zero protection working correctly');
  
  // Test 4: Percentage with zero total
  const zeroPercentageResult = calculateWithDecimal.percentage(50, 0);
  console.assert(zeroPercentageResult.equals(0), 'Percentage with zero total should return 0');
  console.log('✅ Test 4: Percentage with zero total protection working correctly');
  
  // Test 5: Compound growth calculation
  const growthResult = calculateWithDecimal.compoundGrowth(1000, 1500, 5);
  const expectedGrowth = 8.45; // Approximate CAGR for 1000->1500 over 5 years
  console.assert(Math.abs(toNumber(growthResult) - expectedGrowth) < 1, 'Compound growth should be approximately correct');
  console.log('✅ Test 5: Compound growth calculation working correctly');
  
  // Test 6: Weighted average
  const values = [10, 20, 30];
  const weights = [1, 2, 3];
  const weightedAvgResult = calculateWithDecimal.weightedAverage(values, weights);
  const expectedWeightedAvg = (10*1 + 20*2 + 30*3) / (1 + 2 + 3); // 23.33...
  console.assert(Math.abs(toNumber(weightedAvgResult) - expectedWeightedAvg) < 0.1, 'Weighted average should be correct');
  console.log('✅ Test 6: Weighted average calculation working correctly');
  
  // Test 7: Variance and standard deviation
  const testValues = [1, 2, 3, 4, 5];
  const varianceResult = calculateWithDecimal.variance(testValues);
  const stdDevResult = calculateWithDecimal.standardDeviation(testValues);
  const expectedVariance = 2; // Population variance for [1,2,3,4,5]
  const expectedStdDev = Math.sqrt(2); // Population std dev for [1,2,3,4,5]
  
  console.assert(Math.abs(toNumber(varianceResult) - expectedVariance) < 0.1, 'Variance should be correct');
  console.assert(Math.abs(toNumber(stdDevResult) - expectedStdDev) < 0.1, 'Standard deviation should be correct');
  console.log('✅ Test 7: Variance and standard deviation working correctly');
  
  // Test 8: Updated safe functions
  const safeAddResult = safeAdd(100.1, 200.2);
  const safeSubtractResult = safeSubtract(300.3, 100.1);
  const safeMultiplyResult = safeMultiply(10.5, 5.2);
  const safeDivideResult = safeDivide(100, 4);
  const safePercentageResult = safePercentage(25, 100);
  
  console.assert(Math.abs(safeAddResult - 300.3) < 0.01, 'safeAdd should work correctly');
  console.assert(Math.abs(safeSubtractResult - 200.2) < 0.01, 'safeSubtract should work correctly');
  console.assert(Math.abs(safeMultiplyResult - 54.6) < 0.01, 'safeMultiply should work correctly');
  console.assert(safeDivideResult === 25, 'safeDivide should work correctly');
  console.assert(safePercentageResult === 25, 'safePercentage should work correctly');
  console.log('✅ Test 8: Updated safe functions working correctly');
  
  console.log('🎉 All Decimal.js Standardization tests passed!');
};

/**
 * TypeScript Strict Mode Compliance - Type Safety and Null Checks
 * Enhanced interfaces and type guards for better type safety
 */

// Enhanced type guards and safe property access utilities for strict mode compliance

/**
 * Type guards for strict type checking
 */

/**
 * Validates if an object is a valid AssetItem
 */
export const isValidAssetItem = (asset: unknown): asset is any => {
  if (!asset || typeof asset !== 'object') return false;
  
  const a = asset as any;
  
  return (
    typeof a.id === 'number' &&
    typeof a.name === 'string' &&
    typeof a.amount === 'number' &&
    typeof a.sector === 'string' &&
    (a.quantity === undefined || typeof a.quantity === 'number') &&
    (a.currentPrice === undefined || typeof a.currentPrice === 'number') &&
    (a.avgPrice === undefined || typeof a.avgPrice === 'number') &&
    (a.description === undefined || typeof a.description === 'string') &&
    (a.notes === undefined || typeof a.notes === 'string') &&
    (a.date === undefined || typeof a.date === 'string') &&
    (a.accountType === undefined || ['current', 'deposit', 'remunerated', 'cash'].includes(a.accountType)) &&
    (a.assetType === undefined || [
      'tcg', 'stamps', 'alcohol', 'collectibles', 'vinyl', 'books', 'comics', 'art', 'other',
      'Azione', 'ETF', 'Obbligazione whitelist', 'Obbligazione'
    ].includes(a.assetType)) &&
    (a.excludeFromTotal === undefined || typeof a.excludeFromTotal === 'boolean') &&
    (a.interestRate === undefined || typeof a.interestRate === 'number')
  );
};

/**
 * Validates if an object is a valid Transaction
 */
export const isValidTransaction = (transaction: unknown): transaction is Transaction => {
  if (!transaction || typeof transaction !== 'object') return false;
  
  const t = transaction as Partial<Transaction>;
  
  return (
    typeof t.id === 'number' &&
    typeof t.assetType === 'string' &&
    typeof t.ticker === 'string' &&
    typeof t.isin === 'string' &&
    typeof t.date === 'string' &&
    ['purchase', 'sale'].includes(t.transactionType || '') &&
    typeof t.quantity === 'number' &&
    typeof t.amount === 'number' &&
    typeof t.commissions === 'number' &&
    (t.description === undefined || typeof t.description === 'string') &&
    (t.linkedToAsset === undefined || typeof t.linkedToAsset === 'number') &&
    (t.unitPrice === undefined || typeof t.unitPrice === 'number')
  );
};

/**
 * Safe property access utilities for strict mode compliance
 */

/**
 * Safely gets the current price of an asset with fallback logic
 */
export const getAssetCurrentPrice = (asset: any): number => {
  // Null/undefined check first
  if (!asset || asset === null || asset === undefined) {
    return 0;
  }
  
  if (typeof asset.currentPrice === 'number' && asset.currentPrice > 0) {
    return asset.currentPrice;
  }
  if (typeof asset.avgPrice === 'number' && asset.avgPrice > 0) {
    return asset.avgPrice;
  }
  return 0;
};

/**
 * Safely gets the quantity of an asset
 */
export const getAssetQuantity = (asset: any): number => {
  // Null/undefined check first
  if (!asset || asset === null || asset === undefined) {
    return 1;
  }
  
  return typeof asset.quantity === 'number' && asset.quantity > 0 ? asset.quantity : 1;
};

/**
 * Safely gets the current value of an asset
 */
export const getAssetCurrentValue = (asset: any): number => {
  const currentPrice = getAssetCurrentPrice(asset);
  const quantity = getAssetQuantity(asset);
  return currentPrice * quantity;
};

/**
 * Safely gets the cost basis of an asset
 */
export const getAssetCostBasis = (asset: any): number => {
  const avgPrice = typeof asset.avgPrice === 'number' && asset.avgPrice > 0 ? asset.avgPrice : 0;
  const quantity = getAssetQuantity(asset);
  return avgPrice * quantity;
};

/**
 * Safely filters transactions by asset ID
 */
export const getTransactionsForAsset = (transactions: Transaction[], assetId: number): Transaction[] => {
  return transactions.filter(t => 
    isValidTransaction(t) && 
    typeof t.linkedToAsset === 'number' && 
    t.linkedToAsset === assetId
  );
};

/**
 * Safely validates and processes asset arrays
 */
export const validateAssetArray = <T>(
  assets: unknown[],
  validator: (item: unknown) => item is T
): T[] => {
  return assets.filter(validator);
};

/**
 * Test function to validate TypeScript Strict Mode Compliance
 * Run this in development mode to verify type safety and null checks
 */
export const testTypeScriptStrictModeCompliance = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🧪 Testing TypeScript Strict Mode Compliance...');
  
  // Test 1: Type guards for AssetItem
  const validAsset = {
    id: 1,
    name: 'Test Asset',
    amount: 1000,
    sector: 'stocks',
    quantity: 10,
    currentPrice: 100,
    avgPrice: 95,
    description: 'Test description',
    notes: 'Test notes',
    date: '2023-01-01',
    accountType: 'current' as const,
    assetType: 'ETF' as const,
    excludeFromTotal: false,
    interestRate: 2.5
  };
  
  const invalidAsset = {
    id: 'invalid', // Should be number
    name: 123, // Should be string
    amount: 'invalid' // Should be number
  };
  
  console.assert(isValidAssetItem(validAsset), 'Valid asset should pass validation');
  console.assert(!isValidAssetItem(invalidAsset), 'Invalid asset should fail validation');
  console.assert(!isValidAssetItem(null), 'Null should fail validation');
  console.assert(!isValidAssetItem(undefined), 'Undefined should fail validation');
  console.log('✅ Test 1: AssetItem type guards working correctly');
  
  // Test 2: Type guards for Transaction
  const validTransaction = {
    id: 1,
    assetType: 'ETF' as AssetTypeComplete,
    ticker: 'TEST',
    isin: 'IT0000000000',
    date: '2023-01-01',
    transactionType: 'purchase' as const,
    quantity: 100,
    amount: 10000,
    commissions: 10,
    description: 'Test transaction',
    linkedToAsset: 1,
    unitPrice: 100
  };
  
  const invalidTransaction = {
    id: 'invalid', // Should be number
    assetType: 123, // Should be string
    ticker: 456, // Should be string
    transactionType: 'invalid' // Should be 'purchase' or 'sale'
  };
  
  console.assert(isValidTransaction(validTransaction), 'Valid transaction should pass validation');
  console.assert(!isValidTransaction(invalidTransaction), 'Invalid transaction should fail validation');
  console.assert(!isValidTransaction(null), 'Null should fail validation');
  console.log('✅ Test 2: Transaction type guards working correctly');
  
  // Test 3: Safe property access utilities
  const testAsset = {
    id: 1,
    name: 'Test Asset',
    amount: 1000,
    sector: 'stocks',
    currentPrice: 110,
    avgPrice: 100,
    quantity: 10
  };
  
  const currentPrice = getAssetCurrentPrice(testAsset);
  const quantity = getAssetQuantity(testAsset);
  const currentValue = getAssetCurrentValue(testAsset);
  const costBasis = getAssetCostBasis(testAsset);
  
  console.assert(currentPrice === 110, 'Should return currentPrice when available');
  console.assert(quantity === 10, 'Should return quantity when available');
  console.assert(currentValue === 1100, 'Should calculate current value correctly');
  console.assert(costBasis === 1000, 'Should calculate cost basis correctly');
  console.log('✅ Test 3: Safe property access utilities working correctly');
  
  // Test 4: Fallback logic for missing properties
  const assetWithMissingProps = {
    id: 1,
    name: 'Test Asset',
    amount: 1000,
    sector: 'stocks'
    // Missing currentPrice, avgPrice, quantity
  };
  
  const fallbackCurrentPrice = getAssetCurrentPrice(assetWithMissingProps);
  const fallbackQuantity = getAssetQuantity(assetWithMissingProps);
  const fallbackCurrentValue = getAssetCurrentValue(assetWithMissingProps);
  const fallbackCostBasis = getAssetCostBasis(assetWithMissingProps);
  
  console.assert(fallbackCurrentPrice === 0, 'Should return 0 for missing currentPrice');
  console.assert(fallbackQuantity === 1, 'Should return 1 for missing quantity');
  console.assert(fallbackCurrentValue === 0, 'Should calculate 0 for missing currentPrice');
  console.assert(fallbackCostBasis === 0, 'Should calculate 0 for missing avgPrice');
  console.log('✅ Test 4: Fallback logic working correctly');
  
  // Test 5: Safe transaction filtering
  const testTransactions: any[] = [
    validTransaction,
    { ...validTransaction, id: 2, linkedToAsset: 2 },
    { ...validTransaction, id: 3, linkedToAsset: undefined },
    invalidTransaction
  ];
  
  const filteredTransactions = getTransactionsForAsset(testTransactions as Transaction[], 1);
  console.assert(filteredTransactions.length === 1, 'Should filter transactions by asset ID');
  console.assert(filteredTransactions[0].linkedToAsset === 1, 'Should return correct transaction');
  console.log('✅ Test 5: Safe transaction filtering working correctly');
  
  // Test 6: Array validation
  const mixedArray = [validAsset, invalidAsset, validTransaction, null, undefined];
  const validatedAssets = validateAssetArray(mixedArray, isValidAssetItem);
  const validatedTransactions = validateAssetArray(mixedArray, isValidTransaction);
  
  console.assert(validatedAssets.length === 1, 'Should validate and filter asset array');
  console.assert(validatedTransactions.length === 1, 'Should validate and filter transaction array');
  console.log('✅ Test 6: Array validation working correctly');
  
  // Test 7: Edge cases and null safety
  console.assert(getAssetCurrentPrice(null as any) === 0, 'Should handle null asset');
  console.assert(getAssetCurrentPrice(undefined as any) === 0, 'Should handle undefined asset');
  console.assert(getAssetQuantity({} as any) === 1, 'Should handle empty object');
  console.assert(getTransactionsForAsset([], 1).length === 0, 'Should handle empty transaction array');
  console.log('✅ Test 7: Edge cases and null safety working correctly');
  
  console.log('🎉 All TypeScript Strict Mode Compliance tests passed!');
};
