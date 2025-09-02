/**
 * MangoMoney - Application Constants
 * Centralized configuration for all hardcoded values
 * 
 * @version 1.0.0
 * @description Centralized constants for maintainability and consistency
 */

// Portfolio Size Thresholds
export const PORTFOLIO_THRESHOLDS = {
  SMALL: 10_000,      // €10K - Portfolio fase iniziale
  MEDIUM: 100_000,    // €100K - Portfolio crescita  
  LARGE: 1_000_000,   // €1M - Portfolio maturo
  HNW: 5_000_000      // €5M - High net worth
} as const;

// Tax Thresholds (Italian System)
export const TAX_CONSTANTS = {
  STAMP_DUTY_CASH_THRESHOLD: 5_000,    // €5K soglia bollo conti
  STAMP_DUTY_SECURITIES_THRESHOLD: 5_000, // €5K soglia bollo titoli
  STAMP_DUTY_RATE: 0.2,                // 0.2% tasso bollo
  CAPITAL_GAINS_STANDARD: 26,          // 26% standard rate
  CAPITAL_GAINS_WHITELIST: 12.5        // 12.5% whitelist bonds
} as const;

// App Configuration
export const APP_CONFIG = {
  AUTO_BACKUP_INTERVAL: 5 * 60 * 1000,  // 5 minuti in ms
  CSV_PROGRESS_THRESHOLD: 100,           // Progress ogni 100 righe
  NOTIFICATION_DURATION: 5000,           // 5 secondi
  DECIMAL_PRECISION: 2                   // 2 decimali per currency
} as const;

// Smart Insights Defaults
export const INSIGHTS_DEFAULTS = {
  EMERGENCY_OPTIMAL_MONTHS: 12,
  EMERGENCY_ADEQUATE_MONTHS: 6,
  SWR_RATE: 4.0,
  INFLATION_RATE: 2.0
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  SWR_CRITICAL: 70,    // SWR < 70% = critical
  SWR_WARNING: 100,    // SWR < 100% = warning
  DEBT_CRITICAL: 70,   // Debt > 70% = critical
  DEBT_WARNING: 50,    // Debt > 50% = warning
  DEBT_MODERATE: 30    // Debt > 30% = moderate
} as const;

// Calculation Thresholds for CAGR and Performance
export const CALCULATION_THRESHOLDS = {
  MIN_DAYS_FOR_CALCULATION: 7,        // 1 settimana minimo
  MIN_MONTHS_FOR_CAGR: 1,             // 1 mese per CAGR (0.083 anni)
  MIN_MONTHS_FOR_RELIABLE_CAGR: 3,    // 3 mesi per CAGR "affidabile"
  MIN_YEARS_FOR_STABLE_CAGR: 1        // 1 anno per CAGR stabile
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,    // md breakpoint
  TABLET_BREAKPOINT: 1024,   // lg breakpoint
  DESKTOP_BREAKPOINT: 1280,  // xl breakpoint
  MAX_TABLE_ROWS: 50,        // Max rows per table
  PAGINATION_SIZE: 10        // Items per page
} as const;
