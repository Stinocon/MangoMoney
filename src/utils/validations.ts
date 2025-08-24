/**
 * Validazioni per prevenire errori di calcolo finanziario
 * 
 * @description
 * Questo modulo contiene validazioni per garantire la correttezza dei calcoli
 * finanziari e prevenire errori che potrebbero compromettere l'accuratezza
 * delle statistiche e dei report.
 * 
 * @references
 * - Financial Mathematics: Accuracy and Precision Standards
 * - Modern Portfolio Theory: Risk Measurement Validation
 * - Italian Tax Code: Compliance Validation
 */

/**
 * Validazione debt-to-asset ratio
 * 
 * @description
 * Verifica che il debt-to-asset ratio sia compreso tra 0 e 1 (0% e 100%).
 * Un valore fuori da questo range indica un errore di calcolo.
 * 
 * @param {number} ratio - Il debt-to-asset ratio calcolato
 * @param {string} context - Contesto del calcolo per debug
 * 
 * @formula
 * Debt-to-Asset Ratio = Total Debts / (Net Worth + Total Debts)
 * Range valido: 0.0 - 1.0 (0% - 100%)
 * 
 * @example
 * validateDebtToAssetRatio(0.3, 'portfolio statistics'); // OK
 * validateDebtToAssetRatio(1.5, 'portfolio statistics'); // Warning
 */
export const validateDebtToAssetRatio = (ratio: number, context: string): void => {
  if (ratio < 0 || ratio > 1) {
    console.warn(
      `⚠️ Invalid debt-to-asset ratio in ${context}: ${ratio.toFixed(3)}. ` +
      `Should be 0.0-1.0 (0%-100%). Check calculation formula.`
    );
  }
  
  // Avviso per valori estremi ma tecnicamente validi
  if (ratio > 0.8) {
    console.warn(
      `📊 High debt-to-asset ratio in ${context}: ${(ratio * 100).toFixed(1)}%. ` +
      `Consider debt management strategies.`
    );
  }
};

/**
 * Validazione percentuali che devono sommare a 100%
 * 
 * @description
 * Verifica che un array di percentuali sommi a 100% con tolleranza di 0.1%.
 * Utilizzata per asset allocation e altri calcoli percentuali.
 * 
 * @param {number[]} percentages - Array di percentuali (come numeri, non decimali)
 * @param {string} context - Contesto del calcolo per debug
 * 
 * @example
 * validatePercentageSum([30, 40, 30], 'asset allocation'); // OK (sum = 100)
 * validatePercentageSum([30, 40, 29], 'asset allocation'); // Warning (sum = 99)
 */
export const validatePercentageSum = (percentages: number[], context: string): void => {
  const sum = percentages.reduce((a, b) => a + b, 0);
  const tolerance = 0.1;
  
  if (Math.abs(sum - 100) > tolerance) {
    console.warn(
      `⚠️ Percentages don't sum to 100% in ${context}: ${sum.toFixed(2)}%. ` +
      `Difference: ${(sum - 100).toFixed(2)}%. Check normalization logic.`
    );
  }
};

/**
 * Validazione risk score (0-10 scale)
 * 
 * @description
 * Verifica che il risk score sia compreso tra 0 e 10 secondo la scala MPT.
 * Un valore fuori da questo range indica un errore nel calcolo del rischio.
 * 
 * @param {number} score - Il risk score calcolato
 * @param {string} context - Contesto del calcolo per debug
 * 
 * @scale
 * 0-2: Ultra Conservative
 * 3-4: Conservative  
 * 5-6: Moderate
 * 7-8: Aggressive
 * 9-10: Speculative
 * 
 * @example
 * validateRiskScore(5.5, 'portfolio risk assessment'); // OK
 * validateRiskScore(12.0, 'portfolio risk assessment'); // Warning
 */
export const validateRiskScore = (score: number, context: string): void => {
  if (score < 0 || score > 10) {
    console.warn(
      `⚠️ Risk score out of range in ${context}: ${score.toFixed(2)}. ` +
      `Should be 0.0-10.0. Check portfolio volatility calculation.`
    );
  }
  
  // Controllo per valori sospetti
  if (!isFinite(score) || isNaN(score)) {
    console.error(
      `❌ Invalid risk score in ${context}: ${score}. ` +
      `Check for division by zero or invalid inputs.`
    );
  }
};

/**
 * Validazione leverage multiplier
 * 
 * @description
 * Verifica che il leverage multiplier sia calcolato correttamente secondo
 * la formula di Modigliani-Miller: 1 + Leverage Ratio.
 * 
 * @param {number} multiplier - Il leverage multiplier calcolato
 * @param {number} leverageRatio - Il leverage ratio usato per il calcolo
 * 
 * @formula
 * Leverage Multiplier = 1 + Leverage Ratio
 * 
 * @example
 * validateLeverageMultiplier(1.3, 0.3); // OK (1 + 0.3 = 1.3)
 * validateLeverageMultiplier(1.6, 0.3); // Warning (expected 1.3)
 */
export const validateLeverageMultiplier = (multiplier: number, leverageRatio: number): void => {
  const expectedMultiplier = 1 + leverageRatio;
  const tolerance = 0.01; // 1% tolerance
  
  if (Math.abs(multiplier - expectedMultiplier) > tolerance) {
    console.warn(
      `⚠️ Leverage multiplier incorrect: ${multiplier.toFixed(3)}, ` +
      `expected: ${expectedMultiplier.toFixed(3)} (1 + ${leverageRatio.toFixed(3)}). ` +
      `Check Modigliani-Miller formula implementation.`
    );
  }
};

/**
 * Validazione sharpe ratio
 * 
 * @description
 * Verifica che il Sharpe Ratio sia in un range ragionevole.
 * Valori estremi potrebbero indicare errori di calcolo.
 * 
 * @param {number} sharpeRatio - Il Sharpe Ratio calcolato
 * @param {string} context - Contesto del calcolo per debug
 * 
 * @interpretation
 * > 1.0: Excellent
 * 0.5-1.0: Good
 * 0-0.5: Poor
 * < 0: Very poor
 * 
 * @example
 * validateSharpeRatio(0.8, 'portfolio efficiency'); // OK
 * validateSharpeRatio(5.0, 'portfolio efficiency'); // Warning (too high)
 */
export const validateSharpeRatio = (sharpeRatio: number, context: string): void => {
  // Range ragionevole per Sharpe Ratio: -3 to +3
  if (sharpeRatio < -3 || sharpeRatio > 3) {
    console.warn(
      `⚠️ Sharpe Ratio out of typical range in ${context}: ${sharpeRatio.toFixed(3)}. ` +
      `Typical range: -3.0 to +3.0. Check return and volatility calculations.`
    );
  }
  
  if (!isFinite(sharpeRatio) || isNaN(sharpeRatio)) {
    console.error(
      `❌ Invalid Sharpe Ratio in ${context}: ${sharpeRatio}. ` +
      `Check for division by zero in volatility calculation.`
    );
  }
};

/**
 * Validazione capital gains tax rate
 * 
 * @description
 * Verifica che le aliquote fiscali siano in range ragionevoli per l'Italia.
 * 
 * @param {number} standardRate - Aliquota standard (%)
 * @param {number} whitelistRate - Aliquota obbligazioni whitelist (%)
 * @param {string} context - Contesto del calcolo per debug
 * 
 * @legalRanges
 * Standard: 20-30% (tipicamente 26%)
 * Whitelist: 10-15% (tipicamente 12.5%)
 * 
 * @example
 * validateTaxRates(26, 12.5, 'capital gains calculation'); // OK
 * validateTaxRates(50, 5, 'capital gains calculation'); // Warning
 */
export const validateTaxRates = (standardRate: number, whitelistRate: number, context: string): void => {
  // Range ragionevoli per l'Italia
  const standardMin = 20, standardMax = 30;
  const whitelistMin = 10, whitelistMax = 15;
  
  if (standardRate < standardMin || standardRate > standardMax) {
    console.warn(
      `⚠️ Standard tax rate unusual in ${context}: ${standardRate}%. ` +
      `Expected range: ${standardMin}-${standardMax}% for Italy.`
    );
  }
  
  if (whitelistRate < whitelistMin || whitelistRate > whitelistMax) {
    console.warn(
      `⚠️ Whitelist tax rate unusual in ${context}: ${whitelistRate}%. ` +
      `Expected range: ${whitelistMin}-${whitelistMax}% for Italy.`
    );
  }
  
  if (whitelistRate >= standardRate) {
    console.warn(
      `⚠️ Whitelist tax rate should be lower than standard rate in ${context}: ` +
      `whitelist=${whitelistRate}%, standard=${standardRate}%.`
    );
  }
};

/**
 * Validazione emergency fund metrics
 * 
 * @description
 * Verifica che le metriche del fondo emergenza siano coerenti.
 * 
 * @param {number} months - Mesi di copertura calcolati
 * @param {number} adequateThreshold - Soglia per "adeguato"
 * @param {number} optimalThreshold - Soglia per "ottimale"
 * @param {string} context - Contesto del calcolo per debug
 */
export const validateEmergencyFundMetrics = (
  months: number, 
  adequateThreshold: number, 
  optimalThreshold: number, 
  context: string
): void => {
  if (months < 0) {
    console.warn(
      `⚠️ Negative emergency fund months in ${context}: ${months.toFixed(1)}. ` +
      `Check monthly expenses calculation.`
    );
  }
  
  if (adequateThreshold >= optimalThreshold) {
    console.warn(
      `⚠️ Emergency fund thresholds inconsistent in ${context}: ` +
      `adequate=${adequateThreshold}, optimal=${optimalThreshold}. ` +
      `Optimal should be higher than adequate.`
    );
  }
  
  if (months > 24) {
    console.warn(
      `📊 Very high emergency fund in ${context}: ${months.toFixed(1)} months. ` +
      `Consider investment opportunities for excess funds.`
    );
  }
};

/**
 * Validazione comprehensive per portfolio statistics
 * 
 * @description
 * Esegue tutte le validazioni principali per le statistiche del portfolio.
 * Utilizzata come controllo finale di coerenza.
 * 
 * @param {Object} stats - Oggetto con tutte le statistiche calcolate
 * @param {string} context - Contesto del calcolo per debug
 */
export const validatePortfolioStatistics = (stats: any, context: string): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    // Validazione asset allocation percentages
    if (stats.allocationPercentages) {
      const percentages = Object.values(stats.allocationPercentages).map((p: any) => parseFloat(p));
      validatePercentageSum(percentages, `${context} - asset allocation`);
    }
    
    // Validazione risk score
    if (stats.riskScore) {
      validateRiskScore(parseFloat(stats.riskScore), `${context} - risk assessment`);
    }
    
    // Validazione Sharpe Ratio
    if (stats.sharpeRatio) {
      validateSharpeRatio(parseFloat(stats.sharpeRatio), `${context} - efficiency score`);
    }
    
    // Validazione emergency fund
    if (stats.emergencyMonths) {
      const months = parseFloat(stats.emergencyMonths);
      validateEmergencyFundMetrics(months, 3, 6, `${context} - emergency fund`);
    }
    
  } catch (error) {
    console.error(`Error in portfolio validation for ${context}:`, error);
  }
};
