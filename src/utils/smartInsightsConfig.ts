/**
 * Smart Insights Configuration
 * 
 * @description
 * Configurazione centralizzata per tutte le soglie e costanti degli Smart Insights.
 * Elimina magic numbers hard-coded e rende tutto configurabile dall'utente.
 * 
 * @version 1.0.0
 */

// ===== EMERGENCY FUND THRESHOLDS =====
export interface EmergencyFundConfig {
  optimalMonths: number;      // Default: 6 mesi
  adequateMonths: number;     // Default: 3 mesi
  excessiveRatio: number;     // Default: 2.0 (12 mesi se optimal=6)
}

export const DEFAULT_EMERGENCY_FUND_CONFIG: EmergencyFundConfig = {
  optimalMonths: 6,
  adequateMonths: 3,
  excessiveRatio: 2.0
};

// ===== RISK SCORE THRESHOLDS =====
export interface RiskScoreConfig {
  conservativeThreshold: number;  // Default: 3.0
  moderateThreshold: number;      // Default: 6.0
  aggressiveThreshold: number;    // Default: 8.0
}

export const DEFAULT_RISK_SCORE_CONFIG: RiskScoreConfig = {
  conservativeThreshold: 3.0,
  moderateThreshold: 6.0,
  aggressiveThreshold: 8.0
};

// ===== ASSET RISK WEIGHTS - SOTTOCATEGORIE SPECIFICHE =====
export interface AssetRiskWeights {
  // Liquidità
  cash: number;
  currentAccount: number;
  depositAccount: number;
  
  // Investimenti - SUBCATEGORIE SPECIFICHE
  governmentBonds: number;
  corporateBonds: number;
  bondFunds: number;
  balancedFunds: number;
  equityFunds: number;
  individualStocks: number;
  emergingMarkets: number;
  commodities: number;
  cryptocurrency: number;
  
  // Immobili - SUBCATEGORIE
  primaryResidence: number;
  rentalProperty: number;
  realEstateFunds: number;
  reits: number;
  
  // Pensione
  pensionFunds: number;
  
  // Alternativi - SUBCATEGORIE
  collectibles: number;
  privateEquity: number;
  hedge: number;
  derivatives: number;
}

export const DEFAULT_ASSET_RISK_WEIGHTS: AssetRiskWeights = {
  // Liquidità
  cash: 1.0,
  currentAccount: 1.0,
  depositAccount: 1.5,
  
  // Investimenti - SUBCATEGORIE SPECIFICHE
  governmentBonds: 2.0,        // Obbligazioni statali
  corporateBonds: 3.0,         // Obbligazioni corporate
  bondFunds: 3.5,              // Fondi obbligazionari
  balancedFunds: 5.0,          // Fondi bilanciati
  equityFunds: 7.0,            // Fondi azionari
  individualStocks: 8.0,       // Singole azioni
  emergingMarkets: 8.5,        // Mercati emergenti
  commodities: 9.0,            // Commodities
  cryptocurrency: 10.0,        // Crypto
  
  // Immobili - SUBCATEGORIE  
  primaryResidence: 2.0,       // Casa di abitazione (illiquida ma stabile)
  rentalProperty: 5.0,         // Immobili da reddito
  realEstateFunds: 6.0,        // Fondi immobiliari
  reits: 7.0,                  // REIT quotati
  
  // Pensione
  pensionFunds: 3.0,           // Fondi pensione (regolamentati)
  
  // Alternativi - SUBCATEGORIE
  collectibles: 8.0,           // Collezionabili
  privateEquity: 9.0,          // Private equity
  hedge: 9.5,                  // Hedge funds
  derivatives: 10.0            // Derivati
};

// ===== DIVERSIFICATION THRESHOLDS =====
// DiversificationConfig rimosso - non utilizzato negli smart insights

// ===== PERFORMANCE THRESHOLDS =====
// PerformanceConfig rimosso - non utilizzato negli smart insights

// ===== DEBT-TO-ASSET THRESHOLDS =====
export interface DebtToAssetConfig {
  criticalThreshold: number;   // Default: 0.5 (50%)
  warningThreshold: number;    // Default: 0.3 (30%)
}

export const DEFAULT_DEBT_TO_ASSET_CONFIG: DebtToAssetConfig = {
  criticalThreshold: 0.5,
  warningThreshold: 0.3
};

// ===== TAX OPTIMIZATION THRESHOLDS =====
export interface TaxOptimizationConfig {
  depositAccountThreshold: number;     // Default: 5000 (€)
  stampDutyRate: number;               // Default: 0.2%
  harvestMonth: number;                // Default: 12 (dicembre)
}

export const DEFAULT_TAX_OPTIMIZATION_CONFIG: TaxOptimizationConfig = {
  depositAccountThreshold: 5000,
  stampDutyRate: 0.2,
  harvestMonth: 12
};

// ===== SWR ADJUSTMENT FACTORS =====
export interface SwrAdjustmentConfig {
  inflationAdjustmentFactor: number;   // Default: 0.3 (30% dell'eccesso)
  riskAdjustmentFactor: number;        // Default: 0.2 (20% per punto)
  conservativeBonusFactor: number;     // Default: 0.1 (10% per punto)
  historicalInflation: number;         // Default: 2.0%
  minSwr: number;                      // Default: 2.0%
  maxSwr: number;                      // Default: 6.0%
}

export const DEFAULT_SWR_ADJUSTMENT_CONFIG: SwrAdjustmentConfig = {
  inflationAdjustmentFactor: 0.3,
  riskAdjustmentFactor: 0.2,
  conservativeBonusFactor: 0.1,
  historicalInflation: 2.0,
  minSwr: 2.0,
  maxSwr: 6.0
};

// ===== CONFIGURAZIONE COMPLETA =====
export interface SmartInsightsConfig {
  emergencyFund: EmergencyFundConfig;
  riskScore: RiskScoreConfig;
  assetRiskWeights: AssetRiskWeights;
  // diversification rimosso - non utilizzato
  // performance rimosso - non utilizzato
  debtToAsset: DebtToAssetConfig;
  taxOptimization: TaxOptimizationConfig;
  swrAdjustment: SwrAdjustmentConfig;
}

export const DEFAULT_SMART_INSIGHTS_CONFIG: SmartInsightsConfig = {
  emergencyFund: DEFAULT_EMERGENCY_FUND_CONFIG,
  riskScore: DEFAULT_RISK_SCORE_CONFIG,
  assetRiskWeights: DEFAULT_ASSET_RISK_WEIGHTS,
  // diversification rimosso - non utilizzato
  // performance rimosso - non utilizzato
  debtToAsset: DEFAULT_DEBT_TO_ASSET_CONFIG,
  taxOptimization: DEFAULT_TAX_OPTIMIZATION_CONFIG,
  swrAdjustment: DEFAULT_SWR_ADJUSTMENT_CONFIG
};

// ===== UTILITY FUNCTIONS =====

/**
 * Calcola le soglie dinamiche per il fondo di emergenza
 */
export const calculateEmergencyFundThresholds = (config: EmergencyFundConfig) => {
  const adequateRatio = config.adequateMonths / config.optimalMonths;
  const excessiveRatio = config.excessiveRatio;
  
  return {
    adequateRatio,
    excessiveRatio,
    // Soglie per messaggi
    criticalThreshold: adequateRatio,
    warningThreshold: 1.0,
    successThreshold: excessiveRatio
  };
};

/**
 * Calcola le soglie dinamiche per il risk score
 */
export const calculateRiskScoreThresholds = (config: RiskScoreConfig) => {
  return {
    conservative: config.conservativeThreshold,
    moderate: config.moderateThreshold,
    aggressive: config.aggressiveThreshold
  };
};

/**
 * Valida configurazione
 */
export const validateSmartInsightsConfig = (config: SmartInsightsConfig): string[] => {
  const errors: string[] = [];
  
  // Emergency Fund validation
  if (config.emergencyFund.adequateMonths >= config.emergencyFund.optimalMonths) {
    errors.push('Emergency fund adequate months must be less than optimal months');
  }
  
  if (config.emergencyFund.excessiveRatio <= 1.0) {
    errors.push('Emergency fund excessive ratio must be greater than 1.0');
  }
  
  // Risk Score validation
  if (config.riskScore.conservativeThreshold >= config.riskScore.moderateThreshold) {
    errors.push('Conservative threshold must be less than moderate threshold');
  }
  
  if (config.riskScore.moderateThreshold >= config.riskScore.aggressiveThreshold) {
    errors.push('Moderate threshold must be less than aggressive threshold');
  }
  
  // Diversification validation rimossa - non più utilizzato
  // Performance validation rimossa - non più utilizzato
  
  // Debt-to-Asset validation
  if (config.debtToAsset.criticalThreshold <= config.debtToAsset.warningThreshold) {
    errors.push('Debt-to-asset critical threshold must be greater than warning threshold');
  }
  
  return errors;
};
