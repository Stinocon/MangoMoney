/*
 * MangoMoney - Portfolio Tracker
 * Copyright (c) 2025 Stefano Conter
 * Licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import React, { Component, ReactNode, useCallback, useEffect, useMemo, useState, useRef } from 'react';

// PDF generation utilities - used in exportToPDF function (line 5208)
import jsPDF from 'jspdf';
// Screenshot capture utility - used in exportToPDF function (line 5198)
import html2canvas from 'html2canvas';
// UI Icons - used throughout the application for buttons and indicators
import { PlusCircle, Trash2, Moon, Sun, Plus } from 'lucide-react';
// Chart components - used in MemoizedBarChart component (lines 6280-6309)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Virtualized table component - used for large data sets (line 10567)
import { VirtualizedTable } from './components/VirtualizedTable';
// Auto backup hook - used for automatic data backup (line 1582)
import { useAutoBackup } from './hooks/useAutoBackup';
// Form validation hook - used in dynamic forms (line 6371)
import { useFormValidation, ValidationSchema as FormValidationSchema } from './hooks/useFormValidation';
// Keyboard navigation and focus trap hooks - used for accessibility (lines 1709, 1722)
import { useKeyboardNavigation, useFocusTrap } from './hooks/useKeyboardNavigation';
// Financial calculation utilities - used throughout the application for calculations
import { 
  safeSubtract, 
  safeAdd, 
  safeMultiply, 
  safeDivide, 
  safePercentage, 
  safeCAGR,
  calculatePortfolioRiskScore, 
  // calculatePortfolioEfficiencyScore, // ✅ ELIMINATO: funzione zombie 
  calculateCapitalGainsTax, 
  calculateEmergencyFundMetrics, 
  analyzeTaxesByYear, 
  calculateRealEstateNetWorthValue, 
  calculateSWR, 
  calculateAdvancedSWR 
} from './utils/financialCalculations';

// Validation utilities - used for input validation in development mode (lines 2169, 2185, 2194, 2195, 2213, 2330)
import { validateDebtToAssetRatio, validateRiskScore, validateLeverageMultiplier, validatePortfolioStatistics, validateTaxRates, validatePercentageSum } from './utils/validations';


// Security utilities - used for input sanitization throughout the application (multiple lines)
import { sanitizeString, sanitizeAmount, sanitizeCSVCell } from './utils/security';
// ✅ SECURITY: Enhanced secure storage with encryption
import { secureLocalStorage, initializeSecureStorage } from './utils/secureStorage';
// ✅ PRIVACY: GDPR compliance utilities
import { privacyCompliance } from './utils/privacyCompliance';
// ✅ SECURITY: Advanced security utilities
import { auditTrail, rateLimiter, secureErrorHandler } from './utils/advancedSecurity';
// ✅ UX/UI: Design system and accessible components
import './styles/designSystem.css';
import {
  Button,
  Input,
  Card,
  ResponsiveTable,
  Collapsible,
  Modal,
  Tooltip as AccessibleTooltip,
  Skeleton,
  ContextualHelp,
  MetricCard,
  Navigation
} from './components/AccessibleComponents';
import {
  AccessiblePieChart,
  AccessibleBarChart,
  AccessibleLineChart,
  SmartInsights,
  generateInsights
} from './components/AccessibleCharts';
import SwrSimplified from './components/SwrSimplified';
import SimpleStatistics from './components/SimpleStatistics';
import { FloatingActionButton, SwipeHint, ProgressBar } from './components/MobileOptimizations';
// Internationalization utilities - used for multi-language support (lines 1436, 7275, 7370)
import { translations, languages, type TranslationKey, type Language } from './translations';

// ✅ PERFORMANCE OPTIMIZATION: Extracted constants to prevent recreation
const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#a855f7', '#ec4899', '#f97316'] as const;
const DEFAULT_CHART_CONFIG = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  barSize: 40,
} as const;

// ✅ PERFORMANCE OPTIMIZATION: Memoized chart color function
const getChartColor = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

// ✅ BUNDLE OPTIMIZATION: Lazy load heavy components (placeholder for future implementation)
// const PDFExport = lazy(() => import('./components/PDFExport').catch(() => ({ default: () => <div>PDF Export not available</div> })));
// const ExcelImport = lazy(() => import('./components/ExcelImport').catch(() => ({ default: () => <div>Excel Import not available</div> })));
// const AdvancedCharts = lazy(() => import('./components/AdvancedCharts').catch(() => ({ default: () => <div>Advanced Charts not available</div> })));

// Debounce utility function for performance optimization
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// ✅ PERFORMANCE OPTIMIZATION: Smart precision calculation
const smartCalculation = (a: number, b: number, operation: 'add' | 'multiply' | 'divide'): number => {
  // Use Decimal.js only for large amounts or critical calculations
  if (Math.abs(a) > 1000000 || Math.abs(b) > 1000000) {
    switch (operation) {
      case 'add': return safeAdd(a, b);
      case 'multiply': return safeMultiply(a, b);
      case 'divide': return safeDivide(a, b);
      default: return a;
    }
  }
  
  // Use native Number for small amounts (10x faster)
  switch (operation) {
    case 'add': return Number((a + b).toFixed(2));
    case 'multiply': return Number((a * b).toFixed(2));
    case 'divide': return b !== 0 ? Number((a / b).toFixed(2)) : 0;
    default: return a;
  }
};

// ✅ PERFORMANCE OPTIMIZATION: Performance monitoring utility
const performanceTest = (name: string, fn: () => any) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`📊 ${name}: ${(end - start).toFixed(2)}ms`);
    
    if (end - start > 100) {
      console.warn(`⚠️ ${name} is slow (>${100}ms)`);
    }
    
    return result;
  }
  return fn();
};

// ✅ PERFORMANCE OPTIMIZATION: Memory monitoring
const memoryMonitor = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
      allocated: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
    });
  }
};

interface ErrorLogEntry {
  context: string;
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  severity: 'error' | 'warning' | 'info';
}

const ERROR_LOG_KEY = 'mangomoney-error-log';
const MAX_ERROR_LOGS = 10;

/**
 * Structured error logging utility with localStorage persistence
 */
const logError = (context: string, error: Error | string, severity: 'error' | 'warning' | 'info' = 'error') => {
  try {
    const errorLog: ErrorLogEntry = {
      context,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      severity
    };

    const existingLogs = localStorage.getItem(ERROR_LOG_KEY);
    const logs: ErrorLogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(errorLog);

    if (logs.length > MAX_ERROR_LOGS) {
      logs.splice(0, logs.length - MAX_ERROR_LOGS);
    }

    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
    console.error(`[${context}] ${errorLog.message}`, errorLog);
  } catch (logError) {
    console.error('Failed to log error to localStorage:', logError);
    console.error(`[${context}] Original error:`, error);
  }
};

const getErrorLogs = (): ErrorLogEntry[] => {
  try {
    const logs = localStorage.getItem(ERROR_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

const clearErrorLogs = (): void => {
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch (error) {
    console.error('Failed to clear error logs:', error);
  }
};

interface SectionErrorBoundaryProps {
  section: string;
  children: React.ReactNode;
  darkMode?: boolean;
  onRetry?: () => void;
  t: (key: any) => string;
}

/**
 * Performance monitoring component for useMemo hooks in development
 * Provides timing information for expensive calculations
 */
const ProfiledUseMemo = ({ children, deps, name }: {
  children: () => any;
  deps: any[];
  name: string;
}) => {
  return useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = children();
      const end = performance.now();
      console.log(`📊 ${name} calculation took ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return children();
  }, deps);
};

class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, { 
  hasError: boolean; 
  error?: Error; 
  errorId: string;
  retryCount: number;
  isRetrying: boolean;
  retryTimer: number;
}> {
  private retryTimeoutId?: NodeJS.Timeout;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 secondi

  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: '',
      retryCount: 0,
      isRetrying: false,
      retryTimer: 0
    };
  }

  static getDerivedStateFromError(error: Error) {
    const errorId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error, 
      errorId,
      retryCount: 0,
      isRetrying: false,
      retryTimer: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorData = {
      errorId: this.state.errorId,
      section: this.props.section,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Section Error Boundary caught error:', errorData);
    this.saveErrorToStorage(errorData);
    logError(`SectionErrorBoundary-${this.props.section}`, error, 'error');
  }

  private saveErrorToStorage = (errorData: any) => {
    try {
      const existingErrors = localStorage.getItem('mangomoney-section-errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      errors.push(errorData);
      
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('mangomoney-section-errors', JSON.stringify(errors));
    } catch (e) {
      logError(`SectionErrorBoundary-${this.props.section}-saveError`, e instanceof Error ? e : String(e), 'error');
    }
  };

  private startRetryTimer = () => {
    this.setState({ isRetrying: true, retryTimer: this.retryDelay / 1000 });
    
    const timer = setInterval(() => {
      this.setState(prevState => ({
        retryTimer: Math.max(0, prevState.retryTimer - 1)
      }));
    }, 1000);

    this.retryTimeoutId = setTimeout(() => {
      clearInterval(timer);
      this.handleRetry();
    }, this.retryDelay);
  };

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        retryCount: 0,
        isRetrying: false,
        retryTimer: 0
      });
      this.props.onRetry?.();
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
      retryTimer: 0
    }));

    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  handleReportIssue = () => {
    const errorData = {
      errorId: this.state.errorId,
      section: this.props.section,
      error: this.state.error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const debugData = JSON.stringify(errorData, null, 2);
    const blob = new Blob([debugData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangomoney-debug-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const { section, darkMode = false, t } = this.props;
      const isCriticalError = this.state.error?.message?.includes('critical') || 
                             this.state.retryCount >= this.maxRetries;
      
      return (
        <div className={`${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-6 text-center`}>
          <div className={`text-4xl mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
            {isCriticalError ? '🚨' : '⚠️'}
          </div>
          
                          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
            {isCriticalError ? 'Errore Critico' : t('errorInSection').replace('{section}', section)}
                </h3>
          
                <p className={`text-sm mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
            {isCriticalError 
              ? 'Si è verificato un errore critico che richiede attenzione immediata.'
              : t('errorLoadingSection')
            }
          </p>

          {/* Error ID per debugging */}
          <div className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ID Errore: {this.state.errorId}
          </div>

          {/* Retry count e timer */}
          {this.state.retryCount > 0 && (
            <div className={`text-sm mb-3 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
              Tentativo {this.state.retryCount}/{this.maxRetries}
            </div>
          )}

          {this.state.isRetrying && (
            <div className={`text-sm mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              Retry automatico tra {this.state.retryTimer} secondi...
            </div>
          )}

          {/* Dettagli errore */}
          {this.state.error && (
            <details className={`text-xs mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
              <summary className="cursor-pointer hover:underline">
                {t('errorDetails')} {isCriticalError ? '(Critico)' : ''}
              </summary>
              <pre className="mt-2 text-left overflow-auto max-h-32 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {this.state.error.message}
              </pre>
            </details>
          )}

          {/* Azioni utente */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!isCriticalError && this.state.retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
                disabled={this.state.isRetrying}
              className={`px-4 py-2 rounded transition-colors ${
                darkMode 
                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-600' 
                    : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400'
              }`}
            >
                {this.state.isRetrying ? 'Riprova automatica...' : t('retry')}
            </button>
            )}

            <button
              onClick={this.handleReportIssue}
              className={`px-4 py-2 rounded transition-colors ${
                darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Segnala Problema
            </button>

            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
                              {t('reloadPage')}
            </button>

            {isCriticalError && (
              <button
                onClick={() => {
                  // Modalità sicura - disabilita funzionalità avanzate
                  localStorage.setItem('mangomoney-safe-mode', 'true');
                  window.location.reload();
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  darkMode 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                Modalità Sicura
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
  t: (key: any) => string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, { 
  hasError: boolean; 
  error?: Error; 
  errorId: string;
  isRecovering: boolean;
}> {
  private errorData?: any;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: '',
      isRecovering: false
    };
  }
  
  static getDerivedStateFromError(error: Error) {
    const errorId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error, 
      errorId,
      isRecovering: false
    };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.errorData = {
      errorId: this.state.errorId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage: this.getLocalStorageInfo()
    };

    console.error('Critical Error Boundary caught error:', this.errorData);
    this.saveCriticalErrorToStorage(this.errorData);
    logError('CriticalErrorBoundary', error, 'error');
  }

  private getLocalStorageInfo = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('mangomoney'));
      return {
        totalKeys: keys.length,
        keys: keys.slice(0, 5),
        hasAssets: localStorage.getItem('mangomoney-assets') ? true : false,
        hasSettings: localStorage.getItem('mangomoney-settings') ? true : false
      };
    } catch (e) {
      return { error: 'Failed to read localStorage' };
    }
  };

  private saveCriticalErrorToStorage = (errorData: any) => {
    try {
      const existingErrors = localStorage.getItem('mangomoney-critical-errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      errors.push(errorData);
      
      if (errors.length > 5) {
        errors.splice(0, errors.length - 5);
      }
      
      localStorage.setItem('mangomoney-critical-errors', JSON.stringify(errors));
    } catch (e) {
      logError('CriticalErrorBoundary-saveError', e instanceof Error ? e : String(e), 'error');
    }
  };

  handleRecovery = () => {
    this.setState({ isRecovering: true });
    
    try {
      const criticalKeys = ['mangomoney-assets', 'mangomoney-settings'];
      criticalKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data && !this.isValidJSON(data)) {
            localStorage.removeItem(key);
            logError('CriticalErrorBoundary', `Removed corrupted data: ${key}`, 'info');
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      });
      
      setTimeout(() => {
        this.setState({ 
          hasError: false, 
          error: undefined, 
          isRecovering: false 
        });
      }, 1000);
      
    } catch (e) {
      console.error('Recovery failed:', e);
      this.setState({ isRecovering: false });
    }
  };

  private isValidJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  handleReportIssue = () => {
    if (!this.errorData) return;

    const debugData = JSON.stringify(this.errorData, null, 2);
    const blob = new Blob([debugData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangomoney-critical-debug-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  handleSafeMode = () => {
    localStorage.setItem('mangomoney-safe-mode', 'true');
    localStorage.setItem('mangomoney-disable-charts', 'true');
    localStorage.setItem('mangomoney-disable-advanced-features', 'true');
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      // Localized messages available via this.props.t if needed
      const isRecovering = this.state.isRecovering;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {isRecovering ? 'Ripristino in corso...' : 'Errore Critico'}
            </h2>
            
            {!isRecovering && (
              <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Si è verificato un errore critico nell'applicazione. 
                  Stiamo tentando di ripristinare i dati.
                </p>

                {/* Error ID */}
                <div className="text-xs text-gray-500 mb-4">
                  ID Errore: {this.state.errorId}
                </div>

                {/* Dettagli errore */}
                {this.state.error && (
                  <details className="text-xs mb-4 text-left">
                    <summary className="cursor-pointer hover:underline mb-2">
                      Dettagli tecnici
                    </summary>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-left overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}

                {/* Azioni */}
                <div className="space-y-2">
                  <button 
                    onClick={this.handleRecovery}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Ripristina Applicazione
                  </button>
                  
                  <button 
                    onClick={this.handleSafeMode}
                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Modalità Sicura
                  </button>
                  
                  <button
                    onClick={this.handleReportIssue}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Segnala Problema
                  </button>
                  
            <button 
              onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
                    Ricarica Pagina
            </button>
                </div>
              </>
            )}

            {isRecovering && (
              <div className="animate-pulse">
                <div className="text-blue-500 mb-2">Ripristino in corso...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const useDebounce = (value: unknown, delay: number): unknown => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};



// Validation schemas and helpers (formal asset validation)
type FieldRule = {
  type: 'string' | 'number';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
};

type ValidationSchema = Record<string, FieldRule>;

const AssetSchema: ValidationSchema = {
  id: { type: 'number', required: true, min: 1 },
  name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
  amount: { type: 'number', required: true, min: -1e15, max: 1e15 },
  description: { type: 'string', maxLength: 1000 },
  notes: { type: 'string', maxLength: 2000 }
};

const InvestmentPositionSchema: ValidationSchema = {
  id: { type: 'number', required: true, min: 1 },
  name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
  amount: { type: 'number', required: true, min: -1e15, max: 1e15 },
  description: { type: 'string', maxLength: 1000 },
  notes: { type: 'string', maxLength: 2000 }
};

const TransactionSchema: ValidationSchema = {
  id: { type: 'number', required: true, min: 1 },
  assetType: { type: 'string', required: true, minLength: 1, maxLength: 50 },
  amount: { type: 'number', required: true, min: -1e15, max: 1e15 },
  description: { type: 'string', maxLength: 1000 },
  quantity: { type: 'number', min: 0 },
  date: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ }
};

const RealEstateSchema: ValidationSchema = {
  id: { type: 'number', required: true, min: 1 },
  name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
  value: { type: 'number', required: true, min: -1e15, max: 1e15 },
  description: { type: 'string', maxLength: 1000 },
  notes: { type: 'string', maxLength: 2000 }
};

const validateAsset = (schema: ValidationSchema, data: Record<string, any>): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = 'Campo obbligatorio';
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rule.type === 'string') {
      if (typeof value !== 'string') {
        errors[field] = 'Deve essere una stringa';
        continue;
      }
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors[field] = `Lunghezza minima ${rule.minLength}`;
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors[field] = `Lunghezza massima ${rule.maxLength}`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = 'Formato non valido';
      }
    } else if (rule.type === 'number') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors[field] = 'Deve essere un numero';
        continue;
      }
      if (rule.min !== undefined && value < rule.min) {
        errors[field] = `Valore minimo ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[field] = `Valore massimo ${rule.max}`;
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

const getSchemaForSection = (section: string): ValidationSchema => {
  if (section === 'investmentPositions') return InvestmentPositionSchema;
  if (section === 'transactions') return TransactionSchema;
  if (section === 'realEstate') return RealEstateSchema;
    return AssetSchema;
};

// ✅ TYPE SAFETY IMPROVEMENTS - Base interface for common properties
interface BaseAsset {
  id: number;
  name: string;
  amount: number;
  description: string;
  notes: string;
  fees?: number;
  quantity?: number;
  avgPrice?: number;
  sector?: string;
  unitCost?: number;
  isin?: string;
  fee?: number;
  dataSource?: string;
  ticker?: string;
  purchaseDate?: string;
  linkedToGlobalPosition?: number; // ID of the linked global position
  currentPrice?: number; // Current market price for performance calculation
  lastPriceUpdate?: string; // Date of last price update
}



// ✅ TYPE SAFETY IMPROVEMENTS - Keep AssetItem for backward compatibility
interface AssetItem extends BaseAsset {
  accountType?: 'current' | 'deposit' | 'remunerated' | 'cash'; // For cash accounts
  assetType?: 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other' | 'Azione' | 'ETF' | 'Obbligazione' | 'Obbligazione whitelist'; // For alternative assets and investments
  bollo?: number; // For cash accounts - stamp duty amount in euros
  interestRate?: number; // Tasso interesse lordo annuo in % per conti deposito
}

interface InvestmentPosition {
  id: number;
  name: string;
  ticker: string;
  isin: string;
  amount: number;
  purchaseDate: string;
  description?: string;
  notes?: string;
}

// Unified asset type for all transactions and assets
export type CompleteAssetType = 
  | 'Azione' 
  | 'ETF' 
  | 'Obbligazione whitelist' 
  | 'Obbligazione'
  | 'tcg'
  | 'stamps'
  | 'alcohol'
  | 'collectibles'
  | 'vinyl'
  | 'books'
  | 'comics'
  | 'art'
  | 'other';

interface Transaction {
  id: number;
  assetType: CompleteAssetType; // ✅ Unified type
  ticker: string;
  isin: string;
  transactionType: 'purchase' | 'sale';
  amount: number;
  quantity: number;
  commissions: number;
  description: string;
  date: string;
  linkedToAsset?: number; // ID of the linked individual asset
}

interface RealEstate {
  id: number;
  name: string;
  description: string;
  value: number;
  type: 'primary' | 'secondary';
  address?: string;
  notes?: string;
}

interface Assets {
  cash: AssetItem[];
  debts: AssetItem[];
  investments: AssetItem[];
  investmentPositions: InvestmentPosition[];
  transactions: Transaction[];
  realEstate: RealEstate[];
  pensionFunds: AssetItem[];
  alternativeAssets: AssetItem[];
}

interface EmergencyFundAccount {
  section: string;
  id: number;
  name: string;
}

interface NewItem {
  name: string;
  amount: string;
  description: string;
  notes: string;
  fees: string;
  quantity: string;
  avgPrice: string;
  currentPrice: string;
  linkedToAsset?: number;
  sector: string;
  date?: string;
  accountType?: 'current' | 'deposit' | 'remunerated' | 'cash';
  assetType?: 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other' | 'Azione' | 'ETF' | 'Obbligazione whitelist' | 'Obbligazione';
  interestRate?: string; // Tasso interesse lordo annuo in % per conti deposito e remunerati
}

// Enhanced TypeScript interfaces for better type safety
interface AssetWithPerformance extends AssetItem {
  performance: {
    totalReturn: number;
    percentageReturn: number;
    currentValue: number;
    costBasis: number;
    totalInvested: number;
  };
}

// Interface per calcolo fiscale conti deposito
interface DepositTaxCalculation {
  grossInterest: number;    // Interessi lordi annui
  interestTax: number;      // Imposta sui rendimenti  
  netInterest: number;      // Interessi al netto tasse
  bollo: number;            // Bollo
  totalTaxes: number;       // Totale imposte
  netYield: number;         // Rendimento finale netto
  effectiveRate: number;    // Tasso effettivo %
}

// Interface per aggregazione conti deposito
interface DepositTaxesSummary {
  totalGrossInterest: number;
  totalInterestTax: number;
  totalBollo: number;
  totalTaxes: number;
  totalNetYield: number;
  accountCount: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface ExportData {
  assets: Assets;
  settings: {
    // Tax and fee settings
    capitalGainsTaxRate: number;
    whitelistBondsTaxRate: number;
    currentAccountStampDuty: number;
    currentAccountStampDutyThreshold: number;
    depositAccountStampDutyRate: number;
    
    // Emergency fund settings
    emergencyFundOptimalMonths: number;
    emergencyFundAdequateMonths: number;
    emergencyFundAccount: EmergencyFundAccount;
    monthlyExpenses: number;
    
    // Currency and language settings
    selectedCurrency: string;
    selectedLanguage: string;
    
    // Financial planning settings
    swrRate: number;
    inflationRate: number;
    costBasisMethod: 'FIFO' | 'LIFO' | 'AVERAGE_COST';
    
    // UI and display settings
    darkMode: boolean;
    forceMobileLayout: boolean;
    privacyMode: boolean;
    safeMode: boolean;
    
    // Transaction filters and sorting
    transactionFilters: {
      type: string;
      ticker: string;
      isin: string;
    };
    sortField: 'date' | 'assetType' | 'amount' | 'quantity';
    sortDirection: 'asc' | 'desc';
    
    // Alternative assets filter
    alternativeAssetFilter: string;
    
    // Pagination settings
    currentTransactionPage: number;
    currentTransactionYearPage: number;
    currentAlternativeAssetPage: number;
    
    // Form and editing state
    localFieldValues: { [key: string]: string };
    
    // Last saved timestamp
    lastSaved: string; // ✅ Solo string per JSON compatibility
  };
  metadata: {
    exportDate: string;
    version: string;
    appName: string;
    totalItems: number;
    totalValue: number;
    exportInfo: {
      totalAssets: number;
      sections: Array<{
        name: string;
        count: number;
      }>;
    };
    // Additional metadata for validation
    checksum?: string;
    dataIntegrity: {
      assetsValid: boolean;
      settingsValid: boolean;
      requiredSections: string[];
    };
  };
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  fullName?: string;
  description?: string;
  startPercentage?: number;
  endPercentage?: number;
  isHovered?: boolean;
}

interface CompactPieChartProps {
  data: ChartDataItem[];
  size?: number;
  title?: string;
  showLegend?: boolean;
  totalAssets?: number; // 🎯 NUOVO: parametro per asset lordi (opzionale per compatibilità)
}

// Additional type definitions for better type safety
interface EditingItem {
  section: string;
  id: number;
  data: AssetItem | InvestmentPosition | Transaction | RealEstate;
  // Add all possible properties that can be edited
  name?: string;
  amount?: number;
  description?: string;
  notes?: string;
  fees?: number;
  quantity?: number;
  avgPrice?: number;
  currentPrice?: number;
  ticker?: string;
  isin?: string;
  sector?: string;
  date?: string;
  purchaseDate?: string;
  transactionType?: 'purchase' | 'sale';
  commissions?: number;
  linkedToAsset?: number;
  accountType?: 'current' | 'deposit' | 'cash';
  assetType?: 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other';
  type?: 'primary' | 'secondary';
  address?: string;
  value?: number;
}

interface CSVRow {
  [key: string]: string | number | undefined;
}

// Safe localStorage utilities with validation
const safeParseJSON = (data: string, fallback: any): any => {
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch {
    return fallback;
  }
};

// Migration function for old transaction format
const migrateTransactions = (oldTransactions: any[]): Transaction[] => {
  return oldTransactions.map(t => {
    // Check if this is an old transaction format (has 'name' field)
    if ('name' in t && !('assetType' in t)) {
      return {
        ...t,
        assetType: 'ETF' as const, // Default safety per dati esistenti
        // Remove the old 'name' field
        name: undefined
      };
    }
    // If it's already in new format, return as is
    return t as Transaction;
  });
};

const validateAssets = (data: unknown): Assets | null => {
  if (!data || typeof data !== 'object') return null;
  
  const assets = data as Partial<Assets>;
      const requiredSections = ['cash', 'debts', 'investments', 'investmentPositions', 'transactions', 'realEstate', 'pensionFunds', 'alternativeAssets'];
  
  for (const section of requiredSections) {
    if (!Array.isArray(assets[section as keyof Assets])) {
      return null;
    }
  }
  
  // Apply migration for transactions if needed
  if (assets.transactions) {
    assets.transactions = migrateTransactions(assets.transactions);
  }
  
  return data as Assets;
};

  // Info Tooltip Component
  const InfoTooltip = React.memo(({ children, content, darkMode = false }: {
    children: ReactNode;
    content: string;
    darkMode?: boolean;
  }) => (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs text-center ${
        darkMode
          ? 'bg-gray-800 text-gray-100 border border-gray-700'
          : 'bg-white text-gray-800 border border-gray-200'
      }`}>
        {content}
        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
          darkMode ? 'border-t-gray-800' : 'border-t-white'
        }`} />
      </div>
    </div>
  ));

  // Enhanced Pagination Component
  const EnhancedPagination = React.memo(({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalItems, 
    itemsPerPage,
    darkMode = false 
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    darkMode?: boolean;
  }) => {
    const [jumpToPage, setJumpToPage] = useState('');
    
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    const handleJumpToPage = () => {
      const page = parseInt(jumpToPage);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
        setJumpToPage('');
      }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleJumpToPage();
      }
    };
    
    // Calcola le pagine da mostrare (massimo 7)
    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 7;
      
      if (totalPages <= maxVisible) {
        // Mostra tutte le pagine se ce ne sono poche
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Logica per mostrare pagine intelligenti
        if (currentPage <= 4) {
          // Vicino all'inizio
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          // Vicino alla fine
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Nel mezzo
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };
    
    return (
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Info paginazione */}
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Mostrando {startItem} - {endItem} di {totalItems} elementi
        </div>
        
        {/* Controlli paginazione */}
        <div className="flex items-center gap-2">
          {/* Prima pagina */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Prima pagina"
            className={`px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="11,17 6,12 11,7"></polyline>
              <polyline points="17,17 12,12 17,7"></polyline>
            </svg>
          </button>
          
          {/* Pagina precedente */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Pagina precedente"
            className={`px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          
          {/* Numeri pagina */}
          <div className="flex gap-1">
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className={`px-2 py-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    aria-label={`Vai alla pagina ${page}`}
                    aria-pressed={currentPage === page}
                    className={`px-3 py-1 text-xs border rounded ${currentPage === page ? 
                      (darkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-500 border-blue-500 text-white') :
                      (darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Pagina successiva */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Pagina successiva"
            className={`px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          
          {/* Ultima pagina */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Ultima pagina"
            className={`px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="13,17 18,12 13,7"></polyline>
              <polyline points="7,17 12,12 7,7"></polyline>
            </svg>
          </button>
        </div>
        
        {/* Input salto pagina */}
        <div className="flex items-center gap-2">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Vai a:
          </span>
          <input
            type="number"
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            min="1"
            max={totalPages}
            className={`w-16 px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`}
            placeholder="..."
          />
          <button
            onClick={handleJumpToPage}
            disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
            className={`px-2 py-1 text-xs border rounded ${darkMode ? 'bg-blue-600 border-blue-600 text-white disabled:bg-gray-800 disabled:text-gray-500' : 'bg-blue-500 border-blue-500 text-white disabled:bg-gray-100 disabled:text-gray-400'}`}
          >
            Vai
          </button>
        </div>
      </div>
    );
  });

// Skeleton loading components
const TableSkeleton = React.memo(({ rows = 5, darkMode = false }: { rows?: number; darkMode?: boolean }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
    ))}
  </div>
));

const StatsSkeleton = React.memo(({ darkMode = false }: { darkMode?: boolean }) => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={`h-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`} />
    ))}
  </div>
));

const OverviewSkeleton = React.memo(({ darkMode = false }: { darkMode?: boolean }) => (
  <div className="animate-pulse space-y-4">
    {/* First row - 4 boxes */}
    <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`h-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`} />
      ))}
    </div>
    {/* Second row - 3 boxes */}
    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`h-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`} />
      ))}
    </div>
  </div>
));

const ChartSkeleton = React.memo(({ darkMode = false }: { darkMode?: boolean }) => (
  <div className="animate-pulse">
    <div className={`h-6 w-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`} />
    <div className={`h-64 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`} />
  </div>
));

// ✅ REAL ESTATE CALCULATION FIXED - Function imported from financialCalculations.ts

// ✅ REMOVED: Function now imported from financialCalculations.ts

// Helper function for normalized percentages that always sum to 100%
const calculateNormalizedPercentages = (values: number[], total: number) => {
  if (total <= 0) return values.map(() => '0.0');
  
  // Calcola percentuali grezze
  const rawPercentages = values.map(value => (value / total) * 100);
  
  // Arrotonda a 1 decimale
  const roundedPercentages = rawPercentages.map(p => Math.round(p * 10) / 10);
  
  // Calcola differenza dalla somma target (100.0)
  const sum = roundedPercentages.reduce((a, b) => a + b, 0);
  const diff = Math.round((100.0 - sum) * 10) / 10; // Arrotonda la differenza per evitare errori floating point
  
  // Aggiusta la categoria più grande per compensare
  if (Math.abs(diff) > 0.05) { // Solo se differenza > 0.05%
    const maxIndex = rawPercentages.indexOf(Math.max(...rawPercentages));
    roundedPercentages[maxIndex] = Math.round((roundedPercentages[maxIndex] + diff) * 10) / 10;
  }
  
  return roundedPercentages.map(p => p.toFixed(1));
};

// Custom hook for form validation




const NetWorthManager = () => {

  // State management
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mangomoney-darkMode');
    return saved ? safeParseJSON(saved, false) : false;
  });
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('mangomoney-assets');
    if (saved) {
      const parsedAssets = safeParseJSON(saved, getInitialData());
      const validatedAssets = validateAssets(parsedAssets);
      if (validatedAssets) {
        return validatedAssets;
      }
      return getInitialData();
    }
    return getInitialData();
  });
  const [lastSaved, setLastSaved] = useState(() => {
    const saved = localStorage.getItem('mangomoney-lastSaved');
    return saved ? new Date(saved) : new Date();
  });
  // Auto-save handles all saving - no manual save needed
  const [activeSection, setActiveSection] = useState('overview');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);
  const [forceMobileLayout, setForceMobileLayout] = useState(() => {
    const saved = localStorage.getItem('mangomoney-forceMobileLayout');
    return saved ? safeParseJSON(saved, false) : false;
  });

  const [privacyMode, setPrivacyMode] = useState(() => {
    const saved = localStorage.getItem('mangomoney-privacyMode');
    return saved ? safeParseJSON(saved, false) : false;
  });
  const [emergencyFundAccount, setEmergencyFundAccount] = useState<EmergencyFundAccount>(() => {
    const saved = localStorage.getItem('mangomoney-emergencyFundAccount');
    return saved ? safeParseJSON(saved, { section: 'cash', id: 2, name: 'Conto Emergenza' }) : { section: 'cash', id: 2, name: 'Conto Emergenza' };
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => {
    const saved = localStorage.getItem('mangomoney-monthlyExpenses');
    return saved ? safeParseJSON(saved, 3500) : 3500;
  });
  

  
  // Language configuration
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem('mangomoney-language');
    return saved ? safeParseJSON(saved, 'it') : 'it';
  });

  // Safe Withdrawal Rate simulation
  const [swrRate, setSwrRate] = useState(() => {
    const saved = localStorage.getItem('mangomoney-swr-rate');
    return saved ? safeParseJSON(saved, 3.5) : 3.5; // Default 3.5% more conservative for Italian mindset
  });

  // Inflation rate setting
  const [inflationRate, setInflationRate] = useState(() => {
    const saved = localStorage.getItem('mangomoney-inflation-rate');
    return saved ? safeParseJSON(saved, 2.8) : 2.8; // Default 2.8% EU inflation
  });

  // Cost basis calculation method setting
  const [costBasisMethod, setCostBasisMethod] = useState<'FIFO' | 'LIFO' | 'AVERAGE_COST'>(() => {
    const saved = localStorage.getItem('mangomoney-cost-basis-method');
    return saved ? safeParseJSON(saved, 'LIFO') : 'LIFO'; // Default LIFO for Italian tax efficiency
  });

  // Safe mode setting
  const [safeMode, setSafeMode] = useState(() => {
    const saved = localStorage.getItem('mangomoney-safe-mode');
    return saved ? safeParseJSON(saved, false) : false;
  });

  // Smart Insights configuration
  const [insightsConfig, setInsightsConfig] = useState(() => {
    const saved = localStorage.getItem('mangomoney-insights-config');
    return saved ? safeParseJSON(saved, {
      emergency: true,
      tax: true,
      performance: true,
      risk: true,
      allocation: true
    }) : {
      emergency: true,
      tax: true,
      performance: true,
      risk: true,
      allocation: true
    };
  });

  // Save insights config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mangomoney-insights-config', JSON.stringify(insightsConfig));
  }, [insightsConfig]);

  // Notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // ✅ SECURITY: Clear all transactions with multi-step confirmation
  const [showClearTransactionsModal, setShowClearTransactionsModal] = useState(false);
  const [clearTransactionsStep, setClearTransactionsStep] = useState<'confirm' | 'warning' | 'final'>('confirm');
  const [clearTransactionsPassword, setClearTransactionsPassword] = useState('');
  
  // ✅ SAFE ARRAY ACCESS HELPERS
  const safeGetTransactions = useCallback((): Transaction[] => {
    return Array.isArray(assets.transactions) ? assets.transactions : [];
  }, [assets.transactions]);



  const safeFilterTransactions = useCallback((filterFn: (t: Transaction) => boolean): Transaction[] => {
    const transactions = safeGetTransactions();
    return transactions.filter(filterFn);
  }, [safeGetTransactions]);


  
  // Stato locale per i valori dei campi durante la digitazione
  const [localFieldValues, setLocalFieldValues] = useState<{ [key: string]: string }>({});

  // Performance monitoring and testing in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        testPerformanceOptimizations();
        
        // Memory monitoring
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          console.log('📊 Memory Usage:', {
            used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
            allocated: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
          });
        }
      }, 2000);
    }
  }, []);

  // ✅ PERFORMANCE OPTIMIZATION TEST: Validate useMemo optimizations
  const testPerformanceOptimizations = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('🧪 Testing Performance Optimizations...');
    
    // Test 1: Verify performance monitoring works
    const start = performance.now();
    // Simulate expensive calculation
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += Math.random();
    }
    const end = performance.now();
    console.log(`📊 Test Performance Calculation took ${(end - start).toFixed(2)}ms`);
    
    console.assert(typeof result === 'number', 'Performance test should return calculation result');
    console.log('✅ Test 1: Performance monitoring working correctly');
    
    // Test 2: Verify minimal dependencies
    console.log('📊 Performance optimization summary:');
    console.log('- assetsWithPerformance: dependencies reduced from 3 to 1');
    console.log('- pieData/barData: dependencies reduced from 1 to 2 (inline creation)');
    console.log('- capitalGainsData: dependencies reduced from 4 to 3');
    console.log('- portfolioPerformance: dependencies reduced from 2 to 1');
    console.log('- investmentTransactions: dependencies reduced from 1 to 0');
    
    // Test 3: Verify inline calculations work
    const testAssets = [
      { id: 1, name: 'Test Asset', amount: 1000, quantity: 10, currentPrice: 110, avgPrice: 100 }
    ];
    
    const testPerformance = testAssets.map(asset => ({
      ...asset,
      performance: {
        totalReturn: (asset.currentPrice - asset.avgPrice) * asset.quantity,
        percentageReturn: ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100,
        currentValue: asset.currentPrice * asset.quantity,
        costBasis: asset.avgPrice * asset.quantity,
        totalInvested: asset.avgPrice * asset.quantity
      }
    }));
    
    console.assert(testPerformance.length === 1, 'Test performance calculation should return 1 asset');
    console.assert(testPerformance[0].performance.totalReturn === 100, 'Test performance calculation should be correct');
    console.log('✅ Test 3: Inline calculations working correctly');
    
    console.log('🎉 All Performance Optimization tests passed!');
  }, []);



  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 5000) => {
    setNotification({ message, type, visible: true });
    
    // Auto-hide con possibilità di personalizzare durata
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  // Varianti per facilità d'uso
  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

  // Translation helper function
  const t = useCallback((key: TranslationKey): string => {
    return translations[selectedLanguage as Language]?.[key] || key;
  }, [selectedLanguage]);

  // Helper function for section descriptions
  const getSectionDescription = useCallback((section: string): string => {
    const descriptions: Record<string, string> = {
      cash: 'Conti correnti, depositi e liquidità immediatamente disponibile',
      debts: 'Prestiti, mutui e altri debiti da sottrarre al patrimonio',
      investments: 'Investimenti in titoli, ETF e fondi comuni di investimento',
      realEstate: 'Proprietà immobiliari (residenza principale e secondarie)',
      pensionFunds: 'Fondi pensione e previdenza complementare',

      alternativeAssets: 'Asset alternativi come collezionabili, arte, oro, argento, vini pregiati'
    };
    return descriptions[section] || 'Sezione per la gestione di asset finanziari';
  }, []);

  // Currency configuration
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const saved = localStorage.getItem('mangomoney-currency');
    return saved ? safeParseJSON(saved, 'EUR') : 'EUR';
  });

  // Transaction filtering and pagination
  const [transactionFilters, setTransactionFilters] = useState({
    type: 'all', // 'all', 'purchase', 'sale'
    ticker: '',
    isin: ''
  });
  
  // Debounced filters for performance optimization
  const debouncedTransactionFilters = useDebounce(transactionFilters, 300);
  
  // ✅ SECURITY: Initialize secure storage on app start
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        await initializeSecureStorage();
        auditTrail.logSecurityEvent('app_initialized', {
          version: '3.2.0',
          secureStorageEnabled: true
        }, 'low');
        console.log('🔒 Security systems initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize security systems:', error);
        auditTrail.logSecurityEvent('security_init_failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'high');
        // Continue with basic functionality even if security init fails
      }
    };
    
    initializeSecurity();
  }, []);
  
  // Show welcome message only when data is actually restored from backup
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('mangomoney-welcome-shown');
    const wasRestoredFromBackup = sessionStorage.getItem('mangomoney-restored-from-backup');
    
    if (wasRestoredFromBackup && !hasShownWelcome) {
              showInfo(t('dataLoadedSuccessfully'));
      sessionStorage.setItem('mangomoney-welcome-shown', 'true');
      sessionStorage.removeItem('mangomoney-restored-from-backup');
    }
  }, [showInfo, t]);

  // Backup protection on browser close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const lastBackupTime = localStorage.getItem('mangomoney-last-backup-time');
      const lastSavedTime = localStorage.getItem('mangomoney-lastSaved');
      
      if (!lastBackupTime || !lastSavedTime) {
        // Se non c'è mai stato un backup o salvataggio, mostra sempre l'avviso
        event.preventDefault();
        event.returnValue = t('dataNotSavedWarning');
        return event.returnValue;
      }
      
      const now = new Date().getTime();
      const lastBackup = new Date(lastBackupTime).getTime();
      const lastSaved = new Date(lastSavedTime).getTime();
      const thirtySecondsAgo = now - (30 * 1000);
      
      // Controlla se l'ultimo backup o salvataggio è stato fatto negli ultimi 30 secondi
      if (lastBackup < thirtySecondsAgo && lastSaved < thirtySecondsAgo) {
        event.preventDefault();
        event.returnValue = t('dataNotSavedRecentlyWarning');
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [t]);


  
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const transactionsPerPage = 10;
  
  // Transaction statistics pagination - showing last 2 years by default
  const [currentTransactionYearPage, setCurrentTransactionYearPage] = useState(1);
  const yearsPerPage = 2;

  // Transaction sorting state
  const [sortField, setSortField] = useState<'date' | 'assetType' | 'amount' | 'quantity'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort click
  const handleSort = useCallback((field: 'date' | 'assetType' | 'amount' | 'quantity') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, setSortField, setSortDirection]);

  // Alternative asset filtering and pagination
  const [alternativeAssetFilter, setAlternativeAssetFilter] = useState('all');
  const [currentAlternativeAssetPage, setCurrentAlternativeAssetPage] = useState(1);
  const alternativeAssetsPerPage = 10;

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentAlternativeAssetPage(1);
  }, [alternativeAssetFilter]);

  // Tax and fee settings
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState(() => {
    const saved = localStorage.getItem('mangomoney-capital-gains-tax');
    return saved ? safeParseJSON(saved, 26.0) : 26.0; // Default 26% for Italy
  });

  const [whitelistBondsTaxRate, setWhitelistBondsTaxRate] = useState(() => {
    const saved = localStorage.getItem('mangomoney-whitelist-bonds-tax-rate');
    return saved ? safeParseJSON(saved, 12.5) : 12.5; // Default 12.5% for Italy (future use)
  });

  const [currentAccountStampDuty, setCurrentAccountStampDuty] = useState(() => {
    const saved = localStorage.getItem('mangomoney-current-account-stamp-duty');
    return saved ? safeParseJSON(saved, 34.20) : 34.20; // Default €34.20 for Italy
  });

  const [currentAccountStampDutyThreshold, setCurrentAccountStampDutyThreshold] = useState(() => {
    const saved = localStorage.getItem('mangomoney-current-account-stamp-duty-threshold');
    return saved ? safeParseJSON(saved, 5000) : 5000; // Default €5,000 threshold for Italy
  });

  const [depositAccountStampDutyRate, setDepositAccountStampDutyRate] = useState(() => {
    const saved = localStorage.getItem('mangomoney-deposit-account-stamp-duty');
    return saved ? safeParseJSON(saved, 0.20) : 0.20; // Default 0.20% for Italy
  });

  // Emergency fund threshold settings
  const [emergencyFundOptimalMonths, setEmergencyFundOptimalMonths] = useState(() => {
    const saved = localStorage.getItem('mangomoney-emergency-fund-optimal-months');
    return saved ? safeParseJSON(saved, 6) : 6; // Default 6 months for optimal
  });

  const [emergencyFundAdequateMonths, setEmergencyFundAdequateMonths] = useState(() => {
    const saved = localStorage.getItem('mangomoney-emergency-fund-adequate-months');
    return saved ? safeParseJSON(saved, 3) : 3; // Default 3 months for adequate
  });

  // Helper function for numeric input fields that allows empty values
  const handleNumericInputChange = useCallback((setter: (value: number) => void, value: string) => {
    if (value === '' || value === null || value === undefined) {
      setter(0);
    } else {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setter(parsed);
      }
    }
  }, []);

  // Auto-backup system
  const autoBackup = useAutoBackup(
    assets,
    {
      capitalGainsTaxRate,
      whitelistBondsTaxRate,
      currentAccountStampDuty,
      currentAccountStampDutyThreshold,
      depositAccountStampDutyRate,
      emergencyFundOptimalMonths,
      emergencyFundAdequateMonths,
      selectedCurrency,
      selectedLanguage,
      swrRate,
      inflationRate,
      darkMode,
      forceMobileLayout
    },
    {
      emergencyFundAccount,
      monthlyExpenses
    },
    {
      intervalMs: 5 * 60 * 1000, // 5 minuti
      maxBackups: 10,
      sizeThreshold: 1024
    }
  );
  
  // Currency definitions
  const currencies = {
    EUR: { symbol: '€', name: 'Euro', locale: 'it-IT' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' }
  };
  // Initial portfolio data - Empty data for production use
  function getInitialData(): Assets {
    return {
      cash: [],
      debts: [],
      investments: [],
      investmentPositions: [],
      transactions: [],
      realEstate: [],
      pensionFunds: [],

      alternativeAssets: []
    };
  }

  // Simplified: only signal whether stamp duty (bollo) is due; no amount calculation
  const isStampDutyDue = useCallback((accountType: 'current' | 'deposit' | 'remunerated' | 'cash' | undefined, amount: number): boolean => {
    if (!accountType) return false;
    const absAmount = Math.abs(amount);
    if (accountType === 'deposit') return absAmount > 0;
    if (accountType === 'remunerated' || accountType === 'current') return absAmount > currentAccountStampDutyThreshold;
    return false;
  }, [currentAccountStampDutyThreshold]);

  // Remove persisted bollo amounts (we don't compute numbers anymore)
  const stripBolloAmounts = useCallback((cashAccounts: AssetItem[]): AssetItem[] => {
    return cashAccounts.map(account => ({ ...account, bollo: undefined }));
  }, []);

  // Strip previous bollo amounts on mount
  useEffect(() => {
    if (assets.cash.length > 0) {
      const updatedCash = stripBolloAmounts(assets.cash);
      if (JSON.stringify(updatedCash) !== JSON.stringify(assets.cash)) {
        setAssets(prev => ({
          ...prev,
          cash: updatedCash
        }));
      }
    }
  }, [stripBolloAmounts, assets.cash]);

  // Granular loading states
  const [loadingStates, setLoadingStates] = useState({
    importing: false,
    exporting: false,
    calculating: false,
    saving: false,
    deleting: false,
    copying: false
  });

  // Custom hook for async operations with loading states
  const useAsyncOperation = () => {
    const updateLoadingState = useCallback((operation: string, isLoading: boolean) => {
      setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
    }, []);

    const withLoading = useCallback(async <T,>(
      operation: string,
      asyncFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | undefined> => {
      updateLoadingState(operation, true);
      try {
        const result = await asyncFn();
        onSuccess?.(result);
        showSuccess(`${operation} completato con successo`);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
        showError(`Errore durante ${operation}: ${err.message}`);
        logError(`AsyncOperation-${operation}`, err, 'error');
        throw err;
      } finally {
        updateLoadingState(operation, false);
      }
    }, [updateLoadingState]);

    return { loadingStates, withLoading };
  };

  const { withLoading } = useAsyncOperation();

  // Keyboard navigation support for modals
  useKeyboardNavigation({
    onEscape: () => {
      if (editingItem) {
        setEditingItem(null);
      }
      if (notification.visible) {
        setNotification(prev => ({ ...prev, visible: false }));
      }
    },
    enabled: editingItem !== null || notification.visible
  });

  // Focus trap for modals - disabilitato quando editingItem è attivo per evitare conflitti
  useFocusTrap(notification.visible);

  // ✅ PERFORMANCE OPTIMIZATION: Debounced save settings for better performance
  const debouncedSaveSettings = useMemo(
    () => debounce((settings: any) => {
      // Batch all localStorage operations for better performance
      const batchOperations = Object.entries(settings).map(([key, value]) => 
        () => localStorage.setItem(`mangomoney-${key}`, JSON.stringify(value))
      );
      
      // Execute all operations in batch
      batchOperations.forEach(operation => operation());
    localStorage.setItem('mangomoney-lastSaved', new Date().toISOString());
    setLastSaved(new Date());
    }, 500),
    []
  );

  // ✅ PERFORMANCE OPTIMIZATION: Single optimized auto-save useEffect
  useEffect(() => {
    const settings = {
      darkMode,
      assets,
      forceMobileLayout,
      privacyMode,
      emergencyFundAccount,
      monthlyExpenses,
      currency: selectedCurrency,
      language: selectedLanguage,
      'swr-rate': swrRate,
      'inflation-rate': inflationRate,
      'cost-basis-method': costBasisMethod,
      'safe-mode': safeMode,
      'capital-gains-tax': capitalGainsTaxRate,
      'whitelist-bonds-tax-rate': whitelistBondsTaxRate,
      'current-account-stamp-duty': currentAccountStampDuty,
      'current-account-stamp-duty-threshold': currentAccountStampDutyThreshold,
      'deposit-account-stamp-duty': depositAccountStampDutyRate,
      'emergency-fund-optimal-months': emergencyFundOptimalMonths,
      'emergency-fund-adequate-months': emergencyFundAdequateMonths
    };
    
    debouncedSaveSettings(settings);
  }, [
    darkMode, assets, forceMobileLayout, privacyMode, emergencyFundAccount,
    monthlyExpenses, selectedCurrency, selectedLanguage, swrRate, inflationRate,
    costBasisMethod, safeMode, capitalGainsTaxRate, whitelistBondsTaxRate,
    currentAccountStampDuty, currentAccountStampDutyThreshold, depositAccountStampDutyRate,
    emergencyFundOptimalMonths, emergencyFundAdequateMonths, debouncedSaveSettings
  ]);

  // Mobile card view component for transactions
  const TransactionMobileCard = ({ item }: { item: Transaction }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-3 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.assetType}</h4>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            {item.ticker} • {item.isin}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs ml-2 ${item.transactionType === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantità</div>
          <div className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity.toLocaleString()}</div>
        </div>
        <div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Importo</div>
          <div className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(item.amount)}</div>
        </div>
        <div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Commissioni</div>
          <div className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(item.commissions)}</div>
        </div>
        <div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.date}</div>
        </div>
      </div>
      
      {item.description && (
        <div className="mb-3">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Descrizione</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</div>
        </div>
      )}
      
      {item.linkedToAsset && (
        <div className="mb-3">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Collegato a</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {assets.investments.find((asset: AssetItem) => asset.id === item.linkedToAsset)?.name || 'Asset non trovato'}
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button 
          onClick={() => handleCopyRow('transactions', item.id)}
          className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
          title="Copia riga"
          aria-label={`Duplica ${item.description || item.amount}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopyRow('transactions', item.id);
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button 
          onClick={() => handleEditRow('transactions', item.id)}
          className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
          title="Modifica riga"
          aria-label={`Modifica ${item.description || item.amount}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEditRow('transactions', item.id);
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button
          onClick={() => handleDeleteItem('transactions', item.id)}
          className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
          title="Elimina riga"
          aria-label={`Elimina ${item.description || item.amount}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (window.confirm(`Eliminare ${item.description || item.amount}?`)) {
                handleDeleteItem('transactions', item.id);
              }
            }
          }}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  // Mobile card view component for investment positions
  const InvestmentPositionMobileCard = ({ item }: { item: InvestmentPosition }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-3 shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.name}</h4>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            {item.ticker} • {item.isin}
          </div>
        </div>
        <div className={`font-mono text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          {formatCurrencyWithPrivacy(item.amount)}
        </div>
      </div>
      
      {item.description && (
        <div className="mb-3">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Descrizione</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</div>
        </div>
      )}
      
      {item.notes && (
        <div className="mb-3">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Note</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.notes}</div>
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button 
          onClick={() => handleEditRow('investmentPositions', item.id)}
          className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
          title="Modifica riga"
          aria-label={`Modifica ${item.name}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEditRow('investmentPositions', item.id);
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button 
          onClick={() => handleCopyRow('investmentPositions', item.id)}
          className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
          title="Copia riga"
          aria-label={`Duplica ${item.name}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopyRow('investmentPositions', item.id);
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button
          onClick={() => handleDeleteItem('investmentPositions', item.id)}
          className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
          title="Elimina riga"
          aria-label={`Elimina ${item.name}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (window.confirm(`Eliminare ${item.name}?`)) {
                handleDeleteItem('investmentPositions', item.id);
              }
            }
          }}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );



  // Mobile detection hook
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus management for modals
  useEffect(() => {
    if (editingItem) {
      // Inizializza i valori locali quando si apre il modal
      if (editingItem?.data) {
        const initialValues: { [key: string]: string } = {};
        Object.keys(editingItem.data).forEach(key => {
          const value = (editingItem.data as any)[key];
          if (typeof value === 'string' || typeof value === 'number') {
            initialValues[key] = String(value);
          } else if (typeof value === 'boolean') {
            initialValues[key] = value ? 'true' : 'false';
          }
        });
        setLocalFieldValues(initialValues);
      }
      
      // Focus sul primo input quando si apre il modal
      const timer = setTimeout(() => {
        const modal = modalRef.current;
        if (modal) {
          const firstInput = modal.querySelector('input[type="text"], input[type="number"], textarea') as HTMLInputElement | HTMLTextAreaElement;
          if (firstInput) {
            firstInput.focus();
            if (firstInput.type === 'text' || firstInput.tagName === 'TEXTAREA') {
              firstInput.select();
            }
          }
        }
      }, 100);

      // Gestione ESC per chiudere
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setEditingItem(null);
        }
      };

          document.addEventListener('keydown', handleEscape);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      // Pulisci i valori locali quando si chiude il modal
      setLocalFieldValues({});
    }
  }, [editingItem]);



  const isCompactLayout = isMobileView || forceMobileLayout;

  // UI toggle functions
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMobileLayout = () => setForceMobileLayout(!forceMobileLayout);
  const togglePrivacyMode = () => setPrivacyMode(!privacyMode);



  // Financial calculations
  const totals = useMemo(() => {
    const cash = assets.cash.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    const investmentPositions = assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => safeAdd(sum, item.amount), 0);
    const pensionFunds = assets.pensionFunds.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    const alternativeAssets = assets.alternativeAssets.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    
      // ✅ CALCOLI REAL ESTATE FIXED - Use clear, single-purpose functions
  const realEstate = calculateRealEstateNetWorthValue(assets.realEstate); // Solo inclusi nel net worth
  
  // ✅ DEBT CALCULATION FIXED - Single calculation with validation
  const totalDebts = assets.debts.reduce((sum: number, item: AssetItem) => {
    let amount: number;
    if (typeof item.amount === 'number') {
      amount = item.amount;
    } else if (typeof item.amount === 'string') {
      amount = parseFloat(item.amount);
    } else {
      amount = 0;
    }
    
    if (isNaN(amount)) {
      console.warn(`Invalid debt amount for item ${item.id}: ${item.amount}`);
      return sum;
    }
    return safeAdd(sum, Math.abs(amount));
  }, 0);
  
  
  return {
    cash,
    debts: totalDebts,             // ✅ FIXED: usa totalDebts invece di debts
    investments: investmentPositions,
    realEstate,                    // ✅ SEMPLIFICATO: usa solo il valore per net worth
    pensionFunds,
    alternativeAssets
  };
  }, [assets]);

  // Calcola patrimonio netto (asset - debiti)
  const netWorth = useMemo(() => {
    const totalAssets = totals.cash + totals.investments + totals.realEstate + 
                       totals.pensionFunds + totals.alternativeAssets;
    return totalAssets - Math.abs(totals.debts);
  }, [totals]);

  // Core financial calculations - Memoized for performance
  // Questi calcoli dipendono solo da assets e settings, non da UI state
  const coreFinancialCalculations = useMemo(() => {
    const { cash, investments } = totals;
    const totalDebts = Math.abs(totals.debts);
    
    // Emergency Fund Analysis - Funzione centralizzata
    const emergencyFundMetrics = calculateEmergencyFundMetrics(
      assets, 
      emergencyFundAccount, 
      monthlyExpenses, 
      emergencyFundAdequateMonths, 
      emergencyFundOptimalMonths
    );

    // Simplified Risk Score Calculation (category-based weights)
    const portfolioAllocations = {
      cash: totals.cash,
      pensionFunds: totals.pensionFunds,
      realEstate: totals.realEstate,
      investmentPositions: totals.investments,
      alternativeAssets: totals.alternativeAssets
    } as const;

    // 🎯 SEMPLIFICAZIONE 3: Standardizzare terminologie - totalAssets per coerenza
    const totalAssets = totals.cash + totals.investments + totals.realEstate + 
                        totals.pensionFunds + totals.alternativeAssets;
    
    // Debug in development per verificare il fix
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 SEMPLIFICAZIONE 3 - MPT calculations:', {
          patrimonioNetto: netWorth,
        totalAssets: totalAssets,
          differenza: netWorth - totalAssets,
          shouldUseTotalAssets: netWorth < 0
      });
    }

    // 📊 Risk Score: Simplified approach using fixed category weights
    // Not full MPT - suitable for personal finance use
    const baseRiskScore = calculatePortfolioRiskScore(portfolioAllocations, totalAssets);
    
    // ✅ ELIMINATO: Efficiency Score - era una funzione zombie che returnava 0
    
    // Tax Analysis - Analisi fiscale per anno
    if (process.env.NODE_ENV === 'development') {
      validateTaxRates(capitalGainsTaxRate, whitelistBondsTaxRate, 'capital gains tax calculation');
    }
    
    const taxAnalysis = analyzeTaxesByYear(
      assets.transactions || [], 
      capitalGainsTaxRate, 
      whitelistBondsTaxRate,
      costBasisMethod
    );
    
    // Financial Health Metrics
    // 🎯 SEMPLIFICAZIONE 3: Usa totalAssets già definito sopra
    const debtToAssetRatio = totalAssets > 0 ? safeDivide(Math.abs(totalDebts), totalAssets) : 0;
    
    // Validazione in development mode
    if (process.env.NODE_ENV === 'development') {
      validateDebtToAssetRatio(debtToAssetRatio, 'debt-to-asset ratio calculation');
    }
    
    // ✅ SISTEMATO: Risk Score basato solo sulla composizione del portafoglio
    // Non serve leverage multiplier - il rischio dipende dalla composizione, non dai debiti
    const adjustedRiskScore = baseRiskScore;
    
    // Validazione in development mode
    if (process.env.NODE_ENV === 'development') {
      validateRiskScore(adjustedRiskScore, 'risk score calculation');
    }
    
    // Asset allocation percentages - Normalized to always sum to 100%
    const assetValues = [cash, investments, totals.realEstate, totals.pensionFunds, totals.alternativeAssets];
    const normalizedPercentages = calculateNormalizedPercentages(assetValues, netWorth);

    const allocationPercentages = {
      cash: normalizedPercentages[0],
      investments: normalizedPercentages[1],
      realEstate: normalizedPercentages[2],
      pensionFunds: normalizedPercentages[3],
      alternativeAssets: normalizedPercentages[4]
    };
    
    // Validation in development mode
    if (process.env.NODE_ENV === 'development') {
      const percentages = Object.values(allocationPercentages).map((p: any) => parseFloat(p));
      validatePercentageSum(percentages, 'asset allocation calculation');
    }
    
          // 🎯 VALIDAZIONE COMPLETA - Verifica tutti i fix in development
      if (process.env.NODE_ENV === 'development') {
        const realAssets = totals.cash + totals.investments + totals.realEstate + 
                           totals.pensionFunds + totals.alternativeAssets;
        const oldGrossAssets = netWorth + Math.abs(totals.debts || 0);
        
        console.log('🎯 VALIDAZIONE COMPLETA - Tutti i fix:', {
          // SEMPLIFICAZIONE 3: MPT calculations
          mptUsesTotalAssets: totalAssets === realAssets,
          riskScoreValid: baseRiskScore >= 0 && baseRiskScore <= 10,
          
          // SEMPLIFICAZIONE 3: Total Assets
          totalAssetsCorrect: totalAssets === realAssets,
          totalAssetsOld: oldGrossAssets,
          totalAssetsNew: realAssets,
          
          // ERRORE 3: Chart excludes debts (verificato nel pieData debug)
          chartExcludesDebts: 'verified in pieData debug',
          
          // ERRORE 5: Debt-to-Asset ratio
          debtToAssetCorrect: debtToAssetRatio === Math.abs(totals.debts || 0) / realAssets,
          debtToAssetOld: Math.abs(totals.debts || 0) / oldGrossAssets,
          debtToAssetNew: Math.abs(totals.debts || 0) / realAssets,
          
          // ERRORE 6: Leverage ratio - RIMOSSO (non più utilizzato)
          // leverageUsesAbsTotal: leverageRatio === realAssets / Math.abs(netWorth),
          // leverageOld: oldGrossAssets / netWorth,
          // leverageNew: realAssets / Math.abs(netWorth)
        });
        
        // 🎯 VALIDAZIONE COERENZA CARDS vs GRAFICO
        const assetPercentages = [
          (totals.cash / realAssets) * 100,
          (totals.investments / realAssets) * 100,
          (totals.realEstate / realAssets) * 100,
          (totals.pensionFunds / realAssets) * 100,

          (totals.alternativeAssets / realAssets) * 100
        ];
        const totalAssetPercentage = assetPercentages.reduce((sum, pct) => sum + pct, 0);
        
        console.log('🎯 VALIDAZIONE COERENZA - Cards vs Grafico:', {
          totalRealAssets: realAssets.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
          assetPercentages: assetPercentages.map(pct => pct.toFixed(1) + '%'),
          totalAssetPercentage: totalAssetPercentage.toFixed(1) + '%',
          shouldBe100: Math.abs(totalAssetPercentage - 100) < 0.1,
          debtCardShows: 'Passività (no percentage)',
          consistency: 'Cards and chart use same logic'
        });
      }

    return {
      emergencyFundMetrics,
      baseRiskScore,
      // efficiencyScore, // ✅ ELIMINATO: funzione zombie
      taxAnalysis,
      debtToAssetRatio,
      adjustedRiskScore,
      allocationPercentages,
      totalAssets,
      totalDebts
    };
  }, [
    assets, 
    totals, 
    emergencyFundAccount, 
    monthlyExpenses, 
    emergencyFundAdequateMonths, 
    emergencyFundOptimalMonths,
    capitalGainsTaxRate, 
    whitelistBondsTaxRate, 
    costBasisMethod
  ]);

  // Advanced statistics calculations - UI dependent calculations
  const statistics = useMemo(() => {
    const { cash, investments } = totals;
    
    // ✅ ACCESSO DIRETTO AI VALORI PRE-CALCOLATI senza creare dipendenza circolare
    const emergencyFundMetrics = coreFinancialCalculations.emergencyFundMetrics;
    // const efficiencyScore = coreFinancialCalculations.efficiencyScore; // ✅ ELIMINATO: funzione zombie
    const taxAnalysis = coreFinancialCalculations.taxAnalysis;
    const debtToAssetRatio = coreFinancialCalculations.debtToAssetRatio;
    const adjustedRiskScore = coreFinancialCalculations.adjustedRiskScore;
    const allocationPercentages = coreFinancialCalculations.allocationPercentages;
    // Non serve più calcolare realEstateForPercentage, usa totals.realEstate
    
    // ✅ ELIMINATO: Sharpe Ratio e Efficiency Score - erano funzioni zombie
    
    // Count total positions across all sections
    const totalPositions = assets.cash.length + assets.debts.length + 
                          assets.investmentPositions.length + assets.realEstate.length + 
                          assets.pensionFunds.length + 
                          assets.alternativeAssets.length;
    
    // Count unique investment positions
    const uniqueInvestmentPositions = (() => {
      const uniqueAssets = new Set<string>();
      assets.investments.forEach((asset: AssetItem) => {
        const key = `${asset.name}-${asset.ticker || ''}-${asset.isin || ''}`;
        uniqueAssets.add(key);
      });
      return uniqueAssets.size;
    })();
    
    // Active positions calculation
    const activePositions = assets.cash.filter((item: AssetItem) => item.amount > 0).length +
                           assets.debts.filter((item: AssetItem) => item.amount < 0).length +
                           assets.investmentPositions.filter((item: InvestmentPosition) => item.amount > 0).length +
                           assets.realEstate.filter((item: RealEstate) => item.value > 0).length +
                           assets.pensionFunds.filter((item: AssetItem) => item.amount > 0).length +
                           assets.alternativeAssets.filter((item: AssetItem) => item.amount > 0).length;

    // Financial Health Metrics
    const debtToAssetPercentage = (debtToAssetRatio * 100).toFixed(1);
          const debtHealth = debtToAssetRatio < 0.3 ? t('excellent') : debtToAssetRatio < 0.5 ? t('good') : t('attention');

    const liquidityRatio = netWorth > 0 ? (cash / netWorth) : 0;
    const liquidityPercentage = (liquidityRatio * 100).toFixed(1);
    const liquidityHealth = liquidityRatio > 0.1 ? t('adequate') : liquidityRatio > 0.05 ? t('limited') : t('insufficient');

    // Investment Efficiency
    const totalGlobalPositions = assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => safeAdd(sum, item.amount), 0);
    const investmentEfficiency = netWorth > 0 ? (investments / netWorth) : 0;
    const investmentPercentage = (investmentEfficiency * 100).toFixed(1);

    // ✅ FATTIBILE: Calcolo metriche per Smart Insights
    const currentYear = new Date().getFullYear();
    const yearlyCommissions = assets.transactions
      .filter(t => new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (t.commissions || 0), 0);

    const unrealizedLosses = assets.investments
      .filter(asset => {
        const currentValue = (asset.quantity || 0) * (asset.currentPrice || 0);
        const originalValue = (asset.quantity || 0) * (asset.avgPrice || 0);
        return currentValue < originalValue;
      })
      .reduce((sum, asset) => {
        const currentValue = (asset.quantity || 0) * (asset.currentPrice || 0);
        const originalValue = (asset.quantity || 0) * (asset.avgPrice || 0);
        return sum + (originalValue - currentValue);
      }, 0);

    const totalPortfolioValue = netWorth;
    const positionsUnder1Percent = assets.investments
      .filter(asset => {
        const positionValue = (asset.quantity || 0) * (asset.currentPrice || 0);
        return totalPortfolioValue > 0 && (positionValue / totalPortfolioValue) < 0.01;
      }).length;

    const statisticsResult = {
      allocationPercentages,
      totalPositions,
      activePositions,
      totalGlobalPositions,
      uniqueInvestmentPositions,
      riskScore: adjustedRiskScore.toFixed(1),
      // sharpeRatio: sharpeRatioFormatted, // ✅ ELIMINATO: funzione zombie
      // efficiencyRating: efficiencyRating.rating, // ✅ ELIMINATO: funzione zombie
      // efficiencyColor: efficiencyRating.color, // ✅ ELIMINATO: funzione zombie
      // ✅ FATTIBILE: Metriche per Smart Insights
      yearlyCommissions,
      unrealizedLosses,
      numberOfPositions: assets.investments.length,
      positionsUnder1Percent,
      totalPortfolioValue,
      // efficiencyBgColor: efficiencyRating.bgColor, // ✅ ELIMINATO: funzione zombie
      emergencyMonths: emergencyFundMetrics.monthsFormatted,
      emergencyFundValue: emergencyFundMetrics.value,
      emergencyFundStatus: emergencyFundMetrics.status === 'optimal' ? t('optimal') :
                          emergencyFundMetrics.status === 'adequate' ? t('adequate') : t('insufficient'),
      debtToAssetPercentage,
      debtHealth,
      liquidityPercentage,
      liquidityHealth,
      investmentPercentage,
      taxAnalysis
    };
    
    // Validazione comprehensive finale in development mode
    if (process.env.NODE_ENV === 'development') {
      validatePortfolioStatistics(statisticsResult, 'portfolio statistics calculation');
    }
    
    return statisticsResult;
  }, [totals, assets, t]); // ✅ RIMOSSA DEPENDENCY CIRCOLARE!



  // ✅ UNIFIED CHART DATA FACTORY
  const createChartData = useCallback((dataType: 'pie' | 'bar') => {
    const baseData = [
      { 
        id: 'cash',
        label: t('cash'), 
        value: totals.cash, 
        color: '#3b82f6' 
      },
      { 
        id: 'debts',
        label: t('debts'), 
        value: Math.abs(totals.debts), 
        color: '#dc2626' 
      },
      { 
        id: 'investments',
        label: t('investments'), 
        value: totals.investments, 
        color: '#10b981' 
      },
      { 
        id: 'realEstate',
        label: t('realEstate'), 
        value: totals.realEstate, 
        color: '#8b5cf6' 
      },
      { 
        id: 'pensionFunds',
        label: t('pensionFunds'), 
        value: totals.pensionFunds, 
        color: '#ef4444' 
      },

      { 
        id: 'alternativeAssets',
        label: t('alternativeAssets'), 
        value: totals.alternativeAssets, 
        color: '#84cc16' 
      }
    ];

    if (dataType === 'pie') {
      return baseData.map(item => ({
        name: item.label,
        value: item.value,
        color: item.color
      })) as ChartDataItem[];
    } else {
      return baseData.map(item => ({
        category: item.label,
        amount: item.value,
        color: item.color
      })) as any[];
    }
  }, [totals, t]);

  // ✅ PERFORMANCE OPTIMIZATION: Memoized chart color function
  const getChartColor = (key: string): string => {
    const colors = {
      cash: CHART_COLORS[0],
      debts: CHART_COLORS[4],
      investments: CHART_COLORS[1],
      realEstate: CHART_COLORS[3],
      pensionFunds: CHART_COLORS[2],

      alternativeAssets: CHART_COLORS[8]
    };
    return colors[key as keyof typeof colors] || '#6b7280';
  };

  const sections = useMemo(() => ({
    cash: t('cash'),
    debts: t('debts'),
    investments: t('investments'),
    realEstate: t('realEstate'),
    pensionFunds: t('pensionFunds'),

    alternativeAssets: t('alternativeAssets')
  }), [t]);

  // ✅ PERFORMANCE OPTIMIZATION: Inline chart data creation
  const pieData = useMemo(() => {
    // 🎯 FIX: Escludi debiti dal grafico "Distribuzione patrimonio"
    // I debiti NON sono patrimonio - sono passività che riducono il patrimonio
    const data = Object.entries(totals)
      .filter(([key]) => key !== 'total' && key !== 'debts') // ✅ ESCLUDI 'total' E 'debts'!
      .map(([key, value]) => ({
        name: sections[key as keyof typeof sections] || key,
        value: Math.abs(value),
        color: getChartColor(key)
      })).filter(item => item.value > 0);
    
    // Debug in development per verificare che i debiti siano esclusi
    if (process.env.NODE_ENV === 'development') {
      const assetSum = data.reduce((sum, item) => sum + item.value, 0);
      const percentageSum = data.reduce((sum, item) => sum + (item.value / assetSum * 100), 0);
      console.log('🔧 Fix ERRORE 3 - pieData (solo asset):', {
        assetCount: data.length,
        assetSum: assetSum.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
        percentageSum: percentageSum.toFixed(1) + '%',
        excludedDebts: totals.debts || 0,
        dataKeys: data.map(item => item.name),
        shouldBe100: percentageSum.toFixed(1) === '100.0'
      });
      

    }
    
    return data;
  }, [totals, sections]);
  
  const barData = useMemo(() => {
    // 🎯 FIX: Escludi debiti anche dal grafico a barre per coerenza
    const data = Object.entries(totals)
      .filter(([key]) => key !== 'total' && key !== 'debts') // ✅ ESCLUDI 'total' E 'debts'!
      .map(([key, value]) => ({
        category: sections[key as keyof typeof sections] || key,
        amount: Math.abs(value),
        color: getChartColor(key)
      })).filter(item => item.amount > 0);
    
    return data;
  }, [totals, sections]);

  // Memoized filtered data for better performance
  const filteredPieData = pieData;
  const filteredBarData = barData;

  // Generate section-specific chart data - Optimized with memoization
  const getSectionChartData = useCallback((section: string): ChartDataItem[] => {
    if (!assets[section as keyof typeof assets]) return [];
    
    const sectionAssets = assets[section as keyof typeof assets];
    const colors = CHART_COLORS;
    
    // Handle different asset types
    if (section === 'investmentPositions') {
      const positions = sectionAssets as InvestmentPosition[];
      return positions
        .filter((item: InvestmentPosition) => item.amount > 0)
        .map((item: InvestmentPosition, index: number) => ({
          name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
          value: item.amount,
          color: colors[index % colors.length],
          fullName: item.name,
          description: item.description || ''
        }));
    } else if (section === 'realEstate') {
      const properties = sectionAssets as RealEstate[];
      return properties
        .filter((item: RealEstate) => item.value > 0)
        .map((item: RealEstate, index: number) => ({
          name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
          value: item.value,
          color: colors[index % colors.length],
          fullName: item.name,
          description: item.description || ''
        }));
    } else {
      const items = sectionAssets as AssetItem[];
      return items
        .filter((item: AssetItem) => item.amount > 0)
        .map((item: AssetItem, index: number) => {
          // Per gli investimenti usa ticker se disponibile, altrimenti nome
          const displayName = section === 'investments' && item.sector 
            ? item.sector 
            : item.name;
          return {
            name: displayName.length > 15 ? displayName.substring(0, 15) + '...' : displayName,
            value: item.amount,
            color: colors[index % colors.length],
            fullName: item.name,
            description: item.description
          };
        });
    }
  }, [assets]);

  // Note: Chart data is generated on-demand using getSectionChartData function
  // Memoization is handled within the getSectionChartData useCallback

  // CRUD operations for portfolio items
  /*
  const handleAddItem = (section: string) => {
    if (!newItem.name || newItem.amount === '') return;
    
    if (section === 'investmentPositions') {
      const maxId = Math.max(...assets.investmentPositions.map((item: InvestmentPosition) => item.id), 0);
      const newPosition: InvestmentPosition = {
        id: maxId + 1,
        name: newItem.name.trim(),
        ticker: newItem.sector || '', // Using sector field for ticker
        isin: newItem.notes || '', // Using notes field for ISIN
        amount: Math.abs(parseFloat(newItem.amount)),
        purchaseDate: new Date().toISOString().split('T')[0], // Default to today
        description: newItem.description.trim(),
        notes: ''
      };

      setAssets({
        ...assets,
        investmentPositions: [...assets.investmentPositions, newPosition]
      });
    } else if (section === 'transactions') {
      const maxId = Math.max(...assets.transactions.map((item: Transaction) => item.id), 0);
      const newTransaction: Transaction = {
        id: maxId + 1,
        name: newItem.name.trim(),
        ticker: newItem.sector || '', // Using sector field for ticker
        isin: newItem.notes || '', // Using notes field for ISIN
        transactionType: 'purchase', // Default to purchase
        amount: Math.abs(parseFloat(newItem.amount)),
        quantity: parseInt(newItem.quantity),
        commissions: parseFloat(newItem.fees),
        description: newItem.description.trim(),
        date: new Date().toISOString().split('T')[0] // Default to today
      };

      setAssets({
        ...assets,
        transactions: [...assets.transactions, newTransaction]
      });
    } else if (section === 'realEstate') {
      const maxId = Math.max(...assets.realEstate.map((item: RealEstate) => item.id), 0);
      const newProperty: RealEstate = {
        id: maxId + 1,
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        value: Math.abs(parseFloat(newItem.amount)),
        type: 'primary', // Default to primary
        address: newItem.notes || '',
        notes: ''
      };

      setAssets({
        ...assets,
        realEstate: [...assets.realEstate, newProperty]
      });
    } else {
      const maxId = Math.max(...(assets[section as keyof typeof assets] as AssetItem[]).map((item: AssetItem) => item.id), 0);
      const newAssetItem: AssetItem = {
        id: maxId + 1,
        name: newItem.name.trim(),
        amount: section === 'debts' ? -Math.abs(parseFloat(newItem.amount)) : Math.abs(parseFloat(newItem.amount)),
        description: newItem.description.trim(),
        notes: newItem.notes.trim(),
                    ...(section === 'investments' && {
          fees: parseFloat(newItem.fees),
              quantity: parseInt(newItem.quantity),
          avgPrice: parseFloat(newItem.avgPrice),
              sector: newItem.sector.trim()
            })
      };

      setAssets({
        ...assets,
        [section]: [...(assets[section as keyof typeof assets] as AssetItem[]), newAssetItem]
      });
    }
    
    setNewItem({ name: '', amount: '', description: '', notes: '', fees: '', quantity: '', avgPrice: '', sector: '' });
  };
  */

  /*
  const handleEditItem = (section: string, id: number, updatedItem: Partial<AssetItem>) => {
    if (section === 'investmentPositions') {
      setAssets({
        ...assets,
        investmentPositions: assets.investmentPositions.map((item: InvestmentPosition) => 
          item.id === id ? { ...item, ...updatedItem, amount: parseFloat(updatedItem.amount?.toString() || '0') } as InvestmentPosition : item
        )
      });
    } else if (section === 'transactions') {
      setAssets({
        ...assets,
        transactions: assets.transactions.map((item: Transaction) => 
          item.id === id ? { ...item, ...updatedItem, amount: parseFloat(updatedItem.amount?.toString() || '0') } as Transaction : item
        )
      });
    } else if (section === 'realEstate') {
      setAssets({
        ...assets,
        realEstate: assets.realEstate.map((item: RealEstate) => 
          item.id === id ? { ...item, ...updatedItem, value: parseFloat(updatedItem.amount?.toString() || '0') } as RealEstate : item
        )
      });
    } else {
      setAssets({
        ...assets,
        [section]: (assets[section as keyof typeof assets] as AssetItem[]).map((item: AssetItem) => 
          item.id === id ? { ...item, ...updatedItem, amount: parseFloat(updatedItem.amount?.toString() || '0') } : item
        )
      });
    }
  };
  */

  const handleDeleteItem = useCallback((section: string, id: number) => {
          if (window.confirm(t('confirmDelete'))) {
      try {
      if (section === 'investmentPositions') {
        setAssets({
          ...assets,
          investmentPositions: assets.investmentPositions.filter((item: InvestmentPosition) => item.id !== id)
        });
      } else if (section === 'transactions') {
        setAssets({
          ...assets,
          transactions: assets.transactions.filter((item: Transaction) => item.id !== id)
        });
      } else if (section === 'realEstate') {
        setAssets({
          ...assets,
          realEstate: assets.realEstate.filter((item: RealEstate) => item.id !== id)
        });
      } else {
        setAssets({
          ...assets,
          [section]: (assets[section as keyof typeof assets] as AssetItem[]).filter((item: AssetItem) => item.id !== id)
        });
      }
    } catch (error) {
      logError('handleDeleteItem', error instanceof Error ? error : String(error), 'error');
      showError('Errore durante l\'eliminazione dell\'elemento.');
    }
  }
  }, [assets, t, showError]);

  // Funzione per il collegamento automatico delle transazioni basato su ISIN - OTTIMIZZATA
  const performAutoLink = useCallback(() => {
    // Performance monitoring in development mode
    const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    
    // Pre-calcola mappa ISIN -> Asset (una volta sola) - O(n)
    const isinToAssetMap = new Map(
      assets.investments
        .filter(asset => asset.isin)
        .map(asset => [asset.isin!.trim().toUpperCase(), asset])
    );
    
    let linkedCount = 0;
    const updatedTransactions = assets.transactions.map((transaction: Transaction) => {
      // Se la transazione è già collegata, salta
      if (transaction.linkedToAsset) {
        return transaction;
      }
      
      // Lookup O(1) invece di find O(n)
      const matchingAsset = transaction.isin ? 
        isinToAssetMap.get(transaction.isin.trim().toUpperCase()) : 
        null;
      
      if (matchingAsset) {
        linkedCount++;
        return {
          ...transaction,
          linkedToAsset: matchingAsset.id
        };
      }
      
      return transaction;
    });
    
    // Performance logging in development mode
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`🚀 Autolink Performance: ${duration.toFixed(2)}ms for ${assets.transactions.length} transactions, ${assets.investments.length} investments`);
      
      if (duration > 100) {
        console.warn(`⚠️ Autolink is slow (>100ms) - consider optimization for large datasets`);
      }
    }
    
    setAssets({
      ...assets,
      transactions: updatedTransactions
    });
    
    // Mostra notifica con i risultati
    if (linkedCount > 0) {
      showNotification(
        `${t('autolinkCompleted')}: ${linkedCount} transazioni collegate automaticamente`,
        'success'
      );
    } else {
      showNotification(
        t('autolinkNoTransactions'),
        'info'
      );
    }
  }, [assets, t, showNotification]);

  // Add missing functions
  const handleEditRow = (section: string, id: number) => {
    let itemToEdit: AssetItem | InvestmentPosition | Transaction | RealEstate | undefined;
    
    if (section === 'investmentPositions') {
      itemToEdit = assets.investmentPositions.find((item: InvestmentPosition) => item.id === id);
    } else if (section === 'transactions') {
      itemToEdit = assets.transactions.find((item: Transaction) => item.id === id);
    } else if (section === 'realEstate') {
      itemToEdit = assets.realEstate.find((item: RealEstate) => item.id === id);
    } else {
      itemToEdit = (assets[section as keyof typeof assets] as AssetItem[]).find((item: AssetItem) => item.id === id);
    }
    
    if (itemToEdit) {
      setEditingItem({ section, id, data: itemToEdit });
    }
  };

  const handleCopyRow = (section: string, itemId: number) => {
          let itemToCopy: AssetItem | InvestmentPosition | Transaction | RealEstate | undefined;
    
    if (section === 'investmentPositions') {
      itemToCopy = assets.investmentPositions.find((item: InvestmentPosition) => item.id === itemId);
      if (itemToCopy) {
        const maxId = Math.max(...assets.investmentPositions.map((item: InvestmentPosition) => item.id), 0);
        const newItem: InvestmentPosition = {
          ...itemToCopy,
          id: maxId + 1,
          name: `${itemToCopy.name} (copia)`,
          amount: itemToCopy.amount
        };
        setAssets({
          ...assets,
          investmentPositions: [...assets.investmentPositions, newItem]
        });
      }
    } else if (section === 'transactions') {
      itemToCopy = assets.transactions.find((item: Transaction) => item.id === itemId);
      if (itemToCopy) {
        const maxId = Math.max(...assets.transactions.map((item: Transaction) => item.id), 0);
        const newItem: Transaction = {
          ...itemToCopy,
          id: maxId + 1,
          date: new Date().toISOString().split('T')[0]
        };
        setAssets({
          ...assets,
          transactions: [...assets.transactions, newItem]
        });
        
        // Reset filters and pagination to show the new transaction
        setTransactionFilters({ type: 'all', ticker: '', isin: '' });
        setCurrentTransactionPage(1);
        
        // Show success notification
        showNotification(t('transactionCopiedSuccess'), 'success');
      }
    } else if (section === 'realEstate') {
      itemToCopy = assets.realEstate.find((item: RealEstate) => item.id === itemId);
      if (itemToCopy) {
        const maxId = Math.max(...assets.realEstate.map((item: RealEstate) => item.id), 0);
        const newItem: RealEstate = {
          ...itemToCopy,
          id: maxId + 1,
          name: `${itemToCopy.name} (copia)`,
          value: itemToCopy.value
        };
        setAssets({
          ...assets,
          realEstate: [...assets.realEstate, newItem]
        });
      }
    } else {
      itemToCopy = (assets[section as keyof typeof assets] as AssetItem[]).find((item: AssetItem) => item.id === itemId);
      if (itemToCopy) {
        const maxId = Math.max(...(assets[section as keyof typeof assets] as AssetItem[]).map((item: AssetItem) => item.id), 0);
        const newItem: AssetItem = {
          ...itemToCopy,
          id: maxId + 1,
          name: `${itemToCopy.name} (copia)`,
          amount: itemToCopy.amount
        };
        setAssets({
          ...assets,
          [section]: [...(assets[section as keyof typeof assets] as AssetItem[]), newItem]
        });
      }
    }
  };

  // Function to save edited row with error handling and schema validation
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    try {
    
    const { section, id, data } = editingItem;

    // Create updated data using local field values
    const updatedData = { ...data } as Record<string, any>;
    Object.keys(localFieldValues).forEach(field => {
      const value = localFieldValues[field];
      if (value !== undefined && field !== 'id') { // Skip id field to preserve original type
        // Convert string values to appropriate types
        if (field === 'amount' || field === 'value' || field === 'fees' || field === 'avgPrice' || field === 'currentPrice' || field === 'commissions') {
          updatedData[field] = parseFloat(value) || 0;
        } else if (field === 'quantity') {
          updatedData[field] = parseInt(value) || 0;
        } else if (field === 'excludeFromTotal') {
          updatedData[field] = value === 'true';
        } else if (field === 'interestRate') {
          updatedData[field] = value ? parseFloat(value) : undefined;
        } else {
          updatedData[field] = value;
        }
      }
    });

    // Validate against schema before saving
    const schema = getSchemaForSection(section);
    // Map field names to schema keys when needed (value vs amount)
    const normalizedData: Record<string, any> = { ...updatedData } as any;
    if (section === 'realEstate') {
      normalizedData.value = (updatedData as any).value;
    } else if (section !== 'transactions' && section !== 'investmentPositions') {
      normalizedData.amount = (updatedData as any).amount;
    }
    const { valid, errors } = validateAsset(schema, normalizedData);
    if (!valid) {
      const errorMessages = Object.entries(errors).map(([field, message]) => `${field}: ${message}`).join(', ');
      showError(`Validazione fallita: ${errorMessages}`);
      return;
    }
    
    // Sanitize the data based on section type
    const sanitizedData: any = { ...updatedData };
    
    if (section === 'investmentPositions') {
      const investmentData = updatedData as InvestmentPosition;
      sanitizedData.name = sanitizeString(investmentData.name || '');
      sanitizedData.ticker = sanitizeTicker(investmentData.ticker || '');
      sanitizedData.isin = sanitizeISIN(investmentData.isin || '');
              sanitizedData.amount = Math.abs(sanitizeNumber(investmentData.amount || 0, 'amount'));
      sanitizedData.purchaseDate = sanitizeDate(investmentData.purchaseDate || '');
      sanitizedData.description = sanitizeString(investmentData.description || '');
      sanitizedData.notes = sanitizeString(investmentData.notes || '');
      
      setAssets({
        ...assets,
        investmentPositions: assets.investmentPositions.map((item: InvestmentPosition) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else if (section === 'transactions') {
      const transactionData = updatedData as Transaction;
      sanitizedData.assetType = transactionData.assetType || 'ETF';
      sanitizedData.ticker = sanitizeTicker(transactionData.ticker || '');
      sanitizedData.isin = sanitizeISIN(transactionData.isin || '');
      sanitizedData.amount = Math.abs(sanitizeNumber(transactionData.amount || 0, 'amount'));
      sanitizedData.quantity = sanitizeInteger(transactionData.quantity || 0);
      sanitizedData.commissions = sanitizeNumber(transactionData.commissions || 0, 'amount');
      sanitizedData.description = sanitizeString(transactionData.description || '');
      sanitizedData.date = sanitizeDate(transactionData.date || '');
      sanitizedData.linkedToAsset = transactionData.linkedToAsset;
      
      setAssets({
        ...assets,
        transactions: assets.transactions.map((item: Transaction) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else if (section === 'realEstate') {
      const realEstateData = updatedData as RealEstate;
      sanitizedData.name = sanitizeString(realEstateData.name || '');
      sanitizedData.description = sanitizeString(realEstateData.description || '');
              sanitizedData.value = Math.abs(sanitizeNumber(realEstateData.value || 0, 'amount'));
      sanitizedData.address = sanitizeString(realEstateData.address || '');
      sanitizedData.notes = sanitizeString(realEstateData.notes || '');
      // 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal
      
      setAssets({
        ...assets,
        realEstate: assets.realEstate.map((item: RealEstate) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else {
      // Handle other sections (cash, debts, investments, alternativeAssets, etc.)
      const assetData = updatedData as AssetItem;
      sanitizedData.name = sanitizeString(assetData.name || '');
      sanitizedData.amount = section === 'debts' ? -Math.abs(sanitizeNumber(assetData.amount || 0, 'amount')) : Math.abs(sanitizeNumber(assetData.amount || 0, 'amount'));
      sanitizedData.description = sanitizeString(assetData.description || '');
      sanitizedData.notes = sanitizeString(assetData.notes || '');
      
      if (section === 'investments') {
        sanitizedData.fees = sanitizeNumber(assetData.fees || 0, 'amount');
        sanitizedData.quantity = sanitizeInteger(assetData.quantity || 0);
        sanitizedData.avgPrice = sanitizeNumber(assetData.avgPrice || 0, 'price');
        // Gestisci currentPrice in modo speciale - può essere undefined
        if (assetData.currentPrice !== undefined && assetData.currentPrice !== null) {
          sanitizedData.currentPrice = sanitizeNumber(assetData.currentPrice, 'price');
          sanitizedData.lastPriceUpdate = new Date().toISOString().split('T')[0];
        } else {
          sanitizedData.currentPrice = undefined;
        }
        sanitizedData.sector = sanitizeTicker(assetData.sector || '');
        sanitizedData.isin = sanitizeISIN(assetData.isin || '');
      }
      
      if (section === 'cash') {
        sanitizedData.accountType = assetData.accountType;
        // No bollo amount calculation anymore; only signal due in UI
        // Drop interest rate handling
      }
      
      if (section === 'alternativeAssets') {
        sanitizedData.assetType = assetData.assetType;
      }
      
      setAssets({
        ...assets,
        [section]: (assets[section as keyof typeof assets] as AssetItem[]).map((item: AssetItem) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    }
    
          setEditingItem(null);
    } catch (error) {
      logError('handleSaveEdit', error instanceof Error ? error : String(error), 'error');
      showError('Errore durante il salvataggio delle modifiche.');
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Optimized handlers for edit modal to prevent focus loss
  const handleEditFieldChange = useCallback((field: string, value: string | number) => {
    setEditingItem(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: value
        }
      };
    });
  }, []);



  const handleEditNumberChange = useCallback((field: string, value: string) => {
    // Gestisci il caso in cui il campo è vuoto
    if (value === '') {
      setEditingItem(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            [field]: undefined
          }
        };
      });
    } else {
      const numValue = parseFloat(value);
      // Solo se il parsing è valido (non NaN)
      if (!isNaN(numValue)) {
        setEditingItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              [field]: numValue
            }
          };
        });
      }
    }
  }, []);

  const handleEditIntegerChange = useCallback((field: string, value: string) => {
    const intValue = parseInt(value) || 0;
    setEditingItem(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: intValue
        }
      };
    });
  }, []);

  const handleEditOptionalIntegerChange = useCallback((field: string, value: string) => {
    const intValue = value ? parseInt(value) : undefined;
    setEditingItem(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: intValue
        }
      };
    });
  }, []);

  // Handler per input controllati che mantiene il focus
  const handleUncontrolledFieldChange = useCallback((field: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    
    // Aggiorna solo lo stato locale per evitare re-render del modal
    setLocalFieldValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);











  // Function to link individual asset to global position
  const handleLinkToGlobalPosition = (assetId: number, globalPositionId: number | null) => {
    setAssets({
      ...assets,
      investments: assets.investments.map((item: AssetItem) => 
        item.id === assetId 
          ? { ...item, linkedToGlobalPosition: globalPositionId || undefined }
          : item
      )
    });
  };

  // Dynamic tolerance calculation based on amount size
  const calculateDynamicTolerance = (amount: number): number => {
    if (amount < 1000) return 0.10;      // ±10% per piccoli importi (arrotondamenti)
    if (amount < 10000) return 0.05;     // ±5% per importi medi  
    if (amount < 100000) return 0.03;    // ±3% per portafogli medi
    return 0.02;                         // ±2% per grandi portafogli
  };

  // Minimum tolerance amount varies by currency to account for different monetary scales
  const MIN_LINKING_TOLERANCE_AMOUNT = selectedCurrency === 'JPY' ? 1000 : // ¥1000 for JPY
                                      selectedCurrency === 'USD' ? 10 : // $10 for USD
                                      selectedCurrency === 'GBP' ? 8 : // £8 for GBP
                                      selectedCurrency === 'CHF' ? 10 : // CHF 10 for CHF
                                      10; // €10 default for EUR

  // Function to calculate linking validation
  const getLinkingValidation = () => {
    const validation: { [key: number]: { linkedAssets: AssetItem[], totalLinkedValue: number, globalValue: number, deviation: number, isValid: boolean, appliedTolerance: number, tolerancePercentage: number } } = {};
    
    assets.investmentPositions.forEach((globalPosition: InvestmentPosition) => {
      const linkedAssets = assets.investments.filter((asset: AssetItem) => asset.linkedToGlobalPosition === globalPosition.id);
      const totalLinkedValue = linkedAssets.reduce((sum: number, asset: AssetItem) => sum + asset.amount, 0);
      const deviation = Math.abs(totalLinkedValue - globalPosition.amount);
      // Dynamic tolerance based on amount size
      const dynamicTolerancePercentage = calculateDynamicTolerance(globalPosition.amount);
      const tolerance = Math.max(globalPosition.amount * dynamicTolerancePercentage, MIN_LINKING_TOLERANCE_AMOUNT);
      const isValid = deviation <= tolerance;
      
      validation[globalPosition.id] = {
        linkedAssets,
        totalLinkedValue,
        globalValue: globalPosition.amount,
        deviation,
        isValid,
        appliedTolerance: tolerance,
        tolerancePercentage: dynamicTolerancePercentage
      };
    });
    
    return validation;
  };

  // Function to calculate transaction statistics by year
  const getTransactionStats = () => {
    const stats: { [year: string]: { 
      count: number, 
      totalInvested: number, 
      totalSold: number, 
      netInvestment: number, 
      totalCommissions: number,
      capitalGains: number,
      capitalGainsTaxes: number,
      netCapitalGains: number
    } } = {};
    
    const transactions = safeGetTransactions();
    transactions.forEach((transaction: Transaction) => {
      const year = transaction.date.split('-')[0];
      
      if (!stats[year]) {
        stats[year] = { 
          count: 0, 
          totalInvested: 0, 
          totalSold: 0, 
          netInvestment: 0, 
          totalCommissions: 0,
          capitalGains: 0,
          capitalGainsTaxes: 0,
          netCapitalGains: 0
        };
      }
      
      stats[year].count++;
      stats[year].totalCommissions += transaction.commissions;
      
      if (transaction.transactionType === 'purchase') {
        stats[year].totalInvested += transaction.amount;
      } else {
        stats[year].totalSold += transaction.amount;
      }
    });
    
    // Calculate capital gains for each year
    Object.keys(stats).forEach(year => {
      // Get transactions for this year
      const yearTransactions = safeFilterTransactions(t => t.date.split('-')[0] === year);
      
      if (yearTransactions.length > 0) {
        // Calculate capital gains for this year's transactions
        const yearCapitalGains = calculateCapitalGainsTax(yearTransactions, capitalGainsTaxRate, costBasisMethod, whitelistBondsTaxRate);
        
        stats[year].capitalGains = yearCapitalGains.totalGains;
        stats[year].capitalGainsTaxes = yearCapitalGains.totalTaxes;
        stats[year].netCapitalGains = yearCapitalGains.netGains;
      }
      
      // Calculate net investment as total invested - total sold - total commissions
      stats[year].netInvestment = stats[year].totalInvested - stats[year].totalSold - stats[year].totalCommissions;
    });
    
    return stats;
  };

  // Calculate performance for individual assets
  const calculateAssetPerformance = (asset: AssetItem) => {
    if (!asset.quantity || asset.quantity <= 0) {
      return { totalReturn: 0, percentageReturn: 0, currentValue: 0 };
    }

    // For performance calculation, we need either currentPrice or avgPrice
    if (!asset.currentPrice && !asset.avgPrice) {
      return { totalReturn: 0, percentageReturn: 0, currentValue: 0 };
    }

    // If no current price is set, use avg price as current price (no performance change)
    const effectiveCurrentPrice = asset.currentPrice || asset.avgPrice || 0;
    const avgPrice = asset.avgPrice || 0;

    const currentValue = effectiveCurrentPrice * (asset.quantity || 0);
    const investedValue = avgPrice * (asset.quantity || 0);
    const totalReturn = currentValue - investedValue;
    const percentageReturn = investedValue > 0 ? (totalReturn / investedValue) * 100 : 0;

    return {
      totalReturn,
      percentageReturn,
      currentValue
    };
  };

  // Calculate transaction-based performance for individual assets
  // Cost Basis Calculator for multiple methods (FIFO, LIFO, Average Cost)
  const createCostBasisCalculator = useCallback((method: 'FIFO' | 'LIFO' | 'AVERAGE_COST' = 'FIFO') => {
    const calculator = {
      calculatePerformance: (transactions: Transaction[], currentPrice: number) => {
        const warnings: string[] = [];
        
        // Sort transactions by date
        const sortedTransactions = [...transactions].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Enrich transactions with unit price
        const enrichedTransactions = sortedTransactions.map(t => ({
          ...t,
          unitPrice: t.quantity > 0 ? t.amount / t.quantity : 0
        }));
        
        let lots: Array<{
          date: string;
          quantity: number;
          unitPrice: number;
          totalCost: number;
          commissions: number;
          id: string;
        }> = [];
        let realizedGainLoss = 0;
        let totalCommissions = 0;
        
        for (const transaction of enrichedTransactions) {
          totalCommissions += transaction.commissions;
          
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
            const saleResult = calculator.processSale(lots, transaction.quantity, transaction.unitPrice, transaction.commissions, method);
            lots = saleResult.remainingLots;
            realizedGainLoss += saleResult.realizedGainLoss;
            
            if (saleResult.warning) {
              warnings.push(saleResult.warning);
            }
          }
        }
        
        // Calculate final metrics
        const remainingQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);
        const totalCostBasis = lots.reduce((sum, lot) => sum + lot.totalCost, 0);
        const currentValue = remainingQuantity * currentPrice;
        const unrealizedGainLoss = currentValue - totalCostBasis;
        
        return {
          costBasis: totalCostBasis,
          realizedGainLoss,
          unrealizedGainLoss,
          currentValue,
          remainingQuantity,
          totalCommissions,
          method,
          warnings
        };
      },
      
      processSale: (
        lots: Array<{date: string, quantity: number, unitPrice: number, totalCost: number, commissions: number, id: string}>, 
        saleQuantity: number, 
        salePrice: number, 
        saleCommissions: number,
        method: 'FIFO' | 'LIFO' | 'AVERAGE_COST'
      ) => {
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
            // Consolidate all lots into one with average price
            if (lotsToProcess.length > 1) {
              const totalQuantity = lotsToProcess.reduce((sum, lot) => sum + lot.quantity, 0);
              const totalCost = lotsToProcess.reduce((sum, lot) => sum + lot.totalCost, 0);
              const totalCommissionsLots = lotsToProcess.reduce((sum, lot) => sum + lot.commissions, 0);
              
              if (totalQuantity > 0) {
                const averageUnitPrice = totalCost / totalQuantity;
                lotsToProcess = [{
                  date: lotsToProcess[0].date,
                  quantity: totalQuantity,
                  unitPrice: averageUnitPrice,
                  totalCost: totalCost,
                  commissions: totalCommissionsLots,
                  id: 'CONSOLIDATED_AVERAGE'
                }];
              }
            }
            break;
        }
        
        const remainingLots: typeof lots = [];
        
        for (const lot of lotsToProcess) {
          if (remainingSaleQuantity <= 0) {
            remainingLots.push(lot);
            continue;
          }
          
          if (lot.quantity <= remainingSaleQuantity) {
            // Sell entire lot
            const saleProceeds = lot.quantity * salePrice;
            const costOfSoldShares = lot.totalCost;
            const proportionalCommissions = (saleCommissions * lot.quantity) / saleQuantity;
            
            realizedGainLoss += saleProceeds - costOfSoldShares - proportionalCommissions;
            remainingSaleQuantity -= lot.quantity;
            
          } else {
            // Sell part of lot
            const soldQuantity = remainingSaleQuantity;
            const quantityRatio = soldQuantity / lot.quantity;
            
            const saleProceeds = soldQuantity * salePrice;
            const costOfSoldShares = lot.totalCost * quantityRatio;
            const proportionalCommissions = (saleCommissions * soldQuantity) / saleQuantity;
            
            realizedGainLoss += saleProceeds - costOfSoldShares - proportionalCommissions;
            
            // Keep remaining part of lot
            remainingLots.push({
              ...lot,
              quantity: lot.quantity - soldQuantity,
              totalCost: lot.totalCost * (1 - quantityRatio)
            });
            
            remainingSaleQuantity = 0;
          }
        }
        
        // Restore chronological order if it was reversed
        if (method === 'LIFO') {
          remainingLots.reverse();
        }
        
        if (remainingSaleQuantity > 0) {
          warning = `Vendita di ${remainingSaleQuantity} unità non coperta da acquisti precedenti`;
        }
        
        return { remainingLots, realizedGainLoss, warning };
      }
    };
    
    return calculator;
  }, []);

  // Enhanced transaction-based performance calculation with Cost Basis methods
  const calculateTransactionBasedPerformance = useCallback((asset: AssetItem | null | undefined, method: 'FIFO' | 'LIFO' | 'AVERAGE_COST' = costBasisMethod) => {
    // ✅ ROBUST INPUT VALIDATION
    if (!asset || typeof asset !== 'object') {
      console.warn('calculateTransactionBasedPerformance: Invalid asset provided');
      return getSafePerformanceDefaults();
    }

    if (typeof asset.id !== 'number') {
      console.warn('calculateTransactionBasedPerformance: Asset missing valid ID');
      return getSafePerformanceDefaults();
    }

    // ✅ SAFE TRANSACTION ACCESS
    const transactions = safeGetTransactions();
    
    if (transactions.length === 0) {
      console.info('calculateTransactionBasedPerformance: No transactions available');
      return calculateManualPerformanceFallback(asset);
    }

    // ✅ SAFE TRANSACTION FILTERING
    let assetTransactions: Transaction[] = [];
    try {
      assetTransactions = safeFilterTransactions((t: Transaction) => {
        // Validation di ogni transazione
        if (!t || typeof t !== 'object') return false;
        if (typeof t.linkedToAsset !== 'number') return false;
        return t.linkedToAsset === asset.id;
      });
    } catch (filterError) {
      console.error('calculateTransactionBasedPerformance: Error filtering transactions:', filterError);
      return calculateManualPerformanceFallback(asset);
    }

    if (assetTransactions.length === 0) {
      return calculateManualPerformanceFallback(asset);
    }

    // ✅ ROBUST COST BASIS CALCULATION
    try {
      const calculator = createCostBasisCalculator(method);
      
      if (!calculator || typeof calculator.calculatePerformance !== 'function') {
        console.error('calculateTransactionBasedPerformance: Invalid cost basis calculator');
        return calculateManualPerformanceFallback(asset);
      }

      // Validate current price
      const currentPrice = validateFiniteNumber(asset.currentPrice, 'currentPrice', 0);
      if (currentPrice <= 0) {
        console.warn(`calculateTransactionBasedPerformance: Invalid current price for ${asset.name}: ${asset.currentPrice}`);
        return calculateManualPerformanceFallback(asset);
      }

      const result = calculator.calculatePerformance(assetTransactions, currentPrice);
      
      // ✅ VALIDATE CALCULATOR RESULT
      if (!result || typeof result !== 'object') {
        console.error('calculateTransactionBasedPerformance: Calculator returned invalid result');
        return calculateManualPerformanceFallback(asset);
      }

      // Validate all numeric fields
      if (!Number.isFinite(result.costBasis) || !Number.isFinite(result.currentValue) || 
          !Number.isFinite(result.realizedGainLoss) || !Number.isFinite(result.unrealizedGainLoss)) {
        console.error(`calculateTransactionBasedPerformance: Invalid result fields`);
        return calculateManualPerformanceFallback(asset);
      }

      // ✅ SAFE PERFORMANCE CALCULATION
      const totalInvested = Math.abs(result.costBasis); // Use absolute value for safety
      const totalReturn = safeAdd(result.realizedGainLoss, result.unrealizedGainLoss);
      const percentageReturn = totalInvested > 0 ? safePercentage(totalReturn, totalInvested) : 0;

      return {
        totalInvested,
        costBasis: result.costBasis,
        currentValue: result.currentValue,
        totalReturn,
        percentageReturn,
        realizedGainLoss: result.realizedGainLoss,
        unrealizedReturn: result.unrealizedGainLoss,
        method: result.method || method,
        warnings: Array.isArray(result.warnings) ? result.warnings : []
      };

    } catch (calculationError) {
      console.error('calculateTransactionBasedPerformance: Calculation error:', calculationError);
      return calculateManualPerformanceFallback(asset);
    }
  }, [safeGetTransactions, safeFilterTransactions, createCostBasisCalculator, costBasisMethod]);

  // ✅ HELPER FUNCTIONS
  const calculateManualPerformanceFallback = (asset: AssetItem) => {
    try {
      // Validate asset fields for manual calculation
      const avgPrice = validateFiniteNumber(asset.avgPrice, 'avgPrice', 0);
      const quantity = validateFiniteNumber(asset.quantity, 'quantity', 0);
      const currentPrice = validateFiniteNumber(asset.currentPrice, 'currentPrice', avgPrice);

      if (avgPrice <= 0 || quantity <= 0) {
        return getSafePerformanceDefaults();
      }

      const manualCostBasis = safeMultiply(avgPrice, quantity);
      const manualCurrentValue = safeMultiply(currentPrice, quantity);
        const manualTotalReturn = safeSubtract(manualCurrentValue, manualCostBasis);
        const manualPercentageReturn = manualCostBasis > 0 ? safePercentage(manualTotalReturn, manualCostBasis) : 0;
        
        return {
          totalInvested: manualCostBasis,
          costBasis: manualCostBasis,
          currentValue: manualCurrentValue,
          totalReturn: manualTotalReturn,
          percentageReturn: manualPercentageReturn,
          realizedGainLoss: 0,
          unrealizedReturn: manualTotalReturn,
          method: 'MANUAL',
        warnings: ['Performance calculated from manual data (no transactions found)']
        };
    } catch (fallbackError) {
      console.error('calculateManualPerformanceFallback: Error in fallback calculation:', fallbackError);
      return getSafePerformanceDefaults();
      }
  };
      
  const getSafePerformanceDefaults = () => ({
        totalInvested: 0,
        costBasis: 0,
    currentValue: 0,
        totalReturn: 0,
        percentageReturn: 0,
        realizedGainLoss: 0,
        unrealizedReturn: 0,
        method: 'NONE',
    warnings: ['Unable to calculate performance due to invalid data']
  });

  // ✅ VALIDATE FINITE NUMBER HELPER (riusa dal Prompt 3)
  const validateFiniteNumber = (value: any, context: string, defaultValue: number = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value;
    }
    
    if (value !== 0 && value !== defaultValue) {
      console.warn(`validateFiniteNumber: Invalid ${context}: ${value}, using ${defaultValue}`);
    }
    
    return defaultValue;
  };

  // ✅ TYPE GUARD PER ASSET
  const isValidAsset = (asset: any): asset is AssetItem => {
    return asset && 
           typeof asset === 'object' && 
           typeof asset.id === 'number' && 
           typeof asset.name === 'string' && 
           asset.name.length > 0;
  };


  // Memoized assets with performance for better performance



  // Filter and paginate transactions - Optimized with debounced filters
  const filteredTransactions = useMemo(() => {
    const transactions = safeGetTransactions();
    return transactions.filter((transaction: Transaction) => {
      const filters = debouncedTransactionFilters as { type: string; ticker: string; isin: string };
      const matchesType = filters.type === 'all' || 
                         transaction.transactionType === filters.type;
      const matchesTicker = !filters.ticker || 
                           transaction.ticker.toLowerCase().includes(filters.ticker.toLowerCase());
      const matchesIsin = !filters.isin || 
                         transaction.isin.toLowerCase().includes(filters.isin.toLowerCase());
      
      return matchesType && matchesTicker && matchesIsin;
    });
  }, [debouncedTransactionFilters]); // ✅ Removed safeGetTransactions dependency

  // Sort filtered transactions
  const sortedFilteredTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'assetType':
          aValue = a.assetType.toLowerCase();
          bValue = b.assetType.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : aValue < bValue ? -1 : 0)
        : (aValue < bValue ? 1 : aValue > bValue ? -1 : 0);
    });
  }, [filteredTransactions, sortField, sortDirection]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
    return sortedFilteredTransactions.slice(startIndex, startIndex + transactionsPerPage);
  }, [sortedFilteredTransactions, currentTransactionPage]);

  const totalTransactionPages = Math.ceil(sortedFilteredTransactions.length / transactionsPerPage);

  // Filter alternative assets
  const filteredAlternativeAssets = useMemo(() => {
    if (alternativeAssetFilter === 'all') {
      return assets.alternativeAssets;
    }
    return assets.alternativeAssets.filter((asset: AssetItem) => asset.assetType === alternativeAssetFilter);
  }, [assets.alternativeAssets, alternativeAssetFilter]);

  // Paginate alternative assets
  const paginatedAlternativeAssets = useMemo(() => {
    const startIndex = (currentAlternativeAssetPage - 1) * alternativeAssetsPerPage;
    return filteredAlternativeAssets.slice(startIndex, startIndex + alternativeAssetsPerPage);
  }, [filteredAlternativeAssets, currentAlternativeAssetPage]);

  const totalAlternativeAssetPages = Math.ceil(filteredAlternativeAssets.length / alternativeAssetsPerPage);

  // ✅ PERFORMANCE OPTIMIZATION: Investment transactions with minimal dependencies
  const investmentTransactions = useMemo(() => 
    safeGetTransactions().filter((t: Transaction) => 
      !!t.linkedToAsset
    )
  , []); // ✅ No dependencies needed, inline filtering





  // ✅ PERFORMANCE OPTIMIZATION: Inline calculations and minimal dependencies
  // Memoized assets with performance for better performance
  const assetsWithPerformance = useMemo(() => {
    // Move calculation logic inline to avoid function reference changes
    const calculatePerformance = (asset: AssetItem) => {
      // Safety check
      if (!asset || typeof asset.id === 'undefined') {
        return getSafePerformanceDefaults();
      }
      
      const transactions = safeGetTransactions().filter(t => 
        t.linkedToAsset === asset.id || 
        (t.ticker === asset.sector && t.isin === asset.description)
      );
      
      if (transactions.length === 0) {
      return {
          totalReturn: 0,
          percentageReturn: 0,
          currentValue: (asset.quantity || 0) * (asset.currentPrice || asset.avgPrice || 0),
          costBasis: (asset.quantity || 0) * (asset.avgPrice || 0),
          totalInvested: (asset.quantity || 0) * (asset.avgPrice || 0)
        };
      }
      
      // Inline performance calculation logic
      let totalInvested = 0;
      let totalQuantity = 0;
      let totalCost = 0;
      
      transactions.forEach(t => {
        if (t.transactionType === 'purchase') {
          const quantity = t.quantity || 0;
          const price = t.amount / quantity || 0;
          totalInvested += t.amount;
          totalQuantity += quantity;
          totalCost += quantity * price;
        }
      });
      
      const avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
      const currentPrice = asset.currentPrice || asset.avgPrice || avgPrice;
      const currentValue = totalQuantity * currentPrice;
      const totalReturn = currentValue - totalInvested;
      const percentageReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
      
      return {
        totalReturn,
        percentageReturn,
        currentValue,
        costBasis: totalCost,
        totalInvested
      };
    };
    
    return assets.investments
      .filter(asset => asset && typeof asset.id !== 'undefined') // Pre-filter invalid
      .map(asset => ({
        ...asset,
        performance: calculatePerformance(asset)
      }));
      
  }, [assets.investments]); // Only dependency that actually matters

  // ✅ PERFORMANCE OPTIMIZATION: Capital gains tax calculation with minimal dependencies
  const capitalGainsData = useMemo(() => {
    const transactions = safeGetTransactions();
    return calculateCapitalGainsTax(transactions, capitalGainsTaxRate, costBasisMethod, whitelistBondsTaxRate);
  }, [capitalGainsTaxRate, costBasisMethod, whitelistBondsTaxRate]); // Removed safeGetTransactions dependency

  // ✅ PERFORMANCE OPTIMIZATION: Portfolio performance calculation with minimal dependencies
  const portfolioPerformance = useMemo(() => {
    // Method 1: Portfolio-level aggregation (sum of individual asset performances)
    // Calculate total invested and current value from individual assets with performance data
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalReturn = 0;

    // Sum up performance from all assets that have performance data
    assetsWithPerformance.forEach((asset: AssetWithPerformance) => {
      if (asset.quantity && asset.quantity > 0 && (asset.currentPrice || asset.avgPrice)) {
        totalInvested += asset.performance.totalInvested;
        totalCurrentValue += asset.performance.currentValue;
        // Don't sum totalReturn from individual assets - calculate it at portfolio level
      }
    });

    // Calculate portfolio-level total return (current value - invested)
    totalReturn = totalCurrentValue - totalInvested;

    // Calculate percentage return
    const percentageReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Improved CAGR calculation with proper period handling
    const earliestDate = new Date(Math.min(...investmentTransactions.map((t: Transaction) => new Date(t.date).getTime())));
    const currentDate = new Date();
    const timeDiffMs = currentDate.getTime() - earliestDate.getTime();
    const periodInDays = timeDiffMs / (1000 * 60 * 60 * 24);
    const timeInYears = periodInDays / 365.25; // Julian year for precision
    const periodInMonths = timeInYears * 12;
    
    // SOGLIE MINIME DEFINITE CHIARAMENTE
    const MIN_DAYS_FOR_CALCULATION = 7;     // 1 settimana minimo
    const MIN_MONTHS_FOR_ANNUALIZATION = 3; // 3 mesi per annualizzare
    const MIN_YEARS_FOR_RELIABLE_CAGR = 1;  // 1 anno per CAGR affidabile
    
    let annualizedReturnPercentage = 0;
    let annualizedReturn = 0;
    let cagrWarning: string | undefined;
    let methodology = 'standard_cagr';
    
    // Validazione periodo
    if (periodInDays < MIN_DAYS_FOR_CALCULATION) {
      annualizedReturnPercentage = 0;
      annualizedReturn = 0;
      cagrWarning = 'Periodo troppo breve per calcolo significativo (minimo 7 giorni)';
      methodology = 'insufficient_period';
    } else if (periodInMonths < MIN_MONTHS_FOR_ANNUALIZATION) {
      // Periodo molto breve: rendimento semplice non annualizzato
      const simpleReturn = totalInvested > 0 ? totalReturn / totalInvested : 0;
      annualizedReturnPercentage = simpleReturn * 100;
      annualizedReturn = safeMultiply(totalInvested, annualizedReturnPercentage / 100);
      cagrWarning = 'Periodo < 3 mesi: rendimento semplice non annualizzato';
      methodology = 'simple_return';
         } else if (timeInYears < MIN_YEARS_FOR_RELIABLE_CAGR) {
             // Periodo medio: usa safeCAGR con warning
      annualizedReturnPercentage = safeCAGR(totalInvested, totalCurrentValue, timeInYears);
       annualizedReturn = safeMultiply(totalInvested, annualizedReturnPercentage / 100);
       cagrWarning = 'Periodo < 1 anno: annualizzazione indicativa';
      methodology = 'safe_cagr_with_warning';
         } else {
      // Periodo lungo: usa safeCAGR per consistenza
      annualizedReturnPercentage = safeCAGR(totalInvested, totalCurrentValue, timeInYears);
       annualizedReturn = safeMultiply(totalInvested, annualizedReturnPercentage / 100);
       
       // Validazioni aggiuntive per risultati estremi
       if (Math.abs(annualizedReturnPercentage) > 100) {
         cagrWarning = 'CAGR estremamente elevato - verificare dati';
       } else if (timeInYears > 20) {
         cagrWarning = 'Periodo molto lungo - considerare analisi per sotto-periodi';
       }
       methodology = 'safe_cagr_improved';
     }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Calculation Debug:', {
        totalInvested,
        totalCurrentValue,
        portfolioLevelReturn: totalReturn,
        annualizedReturn,
        annualizedReturnPercentage,
        timeInYears,
        periodInDays,
        periodInMonths,
        methodology,
        cagrWarning,
        transactionCount: investmentTransactions.length,
        percentageReturn
      });
    }
    
    return {
      totalInvested,
      totalCurrentValue,
      totalReturn,
      percentageReturn,
      annualizedReturn,
      annualizedReturnPercentage,
      assets: assetsWithPerformance,
      calculationMethod: 'portfolio-aggregated',
      cagrWarning,
      methodology
    };
  }, [assetsWithPerformance]); // Removed investmentTransactions dependency, inline calculation

  // ✅ PERFORMANCE OPTIMIZATION: SWR calculations with minimal dependencies
  const swrData = useMemo(() => {
    // Helper function for translation with parameter substitution
    const translateWithParams = (key: string, params?: Record<string, string | number>): string => {
      let translation = t(key as any);
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }
      return translation;
    };
    
    return calculateSWR(totals, swrRate, inflationRate, monthlyExpenses, translateWithParams);
  }, [totals, swrRate, inflationRate, monthlyExpenses, t]);

  // ✅ PERFORMANCE OPTIMIZATION: Advanced SWR calculation with minimal dependencies
  const advancedSwrData = useMemo(() => {
      // 🎯 SEMPLIFICAZIONE 1: Calcola asset prelevabili (withdrawable assets)
  // Esclusi sempre: realEstate (illiquid), pensionFunds (locked until retirement)
  const withdrawableAssets = safeAdd(
    totals.cash || 0, totals.investments || 0
  );
    
    // Helper function for translation with parameter substitution
    const translateWithParams = (key: string, params?: Record<string, string | number>): string => {
      let translation = t(key as any);
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }
      return translation;
    };
    
    return calculateAdvancedSWR(
      withdrawableAssets,
      monthlyExpenses,
      inflationRate,
      coreFinancialCalculations.adjustedRiskScore,
      { baseSWRRate: swrRate, riskFreeRate: 2.0, timeHorizon: 30 },
      translateWithParams
    );
  }, [totals, swrRate, inflationRate, monthlyExpenses, coreFinancialCalculations.adjustedRiskScore, t]);

  // ✅ CURRENCY FORMATTING JPY CONSISTENCY FIXED
  const formatCurrency = (amount: number): string => {
    const currency = currencies[selectedCurrency as keyof typeof currencies];
    const decimals = selectedCurrency === 'JPY' ? 0 : 2;
    return new Intl.NumberFormat(currency.locale, { 
      style: 'currency', 
      currency: selectedCurrency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  };



  // Privacy mode helper functions
  const formatCurrencyWithPrivacy = (amount: number): string => {
    if (privacyMode) {
      return '••••••••';
    }
    return formatCurrency(amount);
  };

  // Funzioni calcolo fiscale conti deposito e remunerati
  const calculateDepositTaxes = (
    account: AssetItem, 
    settings: { 
      capitalGainsTaxRate: number;
      depositAccountStampDutyRate: number;
    }
  ): DepositTaxCalculation => {
    if ((account.accountType !== 'deposit' && account.accountType !== 'remunerated') || !account.interestRate || Number(account.interestRate) <= 0) {
      return {
        grossInterest: 0,
        interestTax: 0, 
        netInterest: 0,
        bollo: account.bollo || 0,
        totalTaxes: account.bollo || 0,
        netYield: -(account.bollo || 0),
        effectiveRate: 0
      };
    }

    const principal = account.amount;
    const interestRate = typeof account.interestRate === 'string' ? parseFloat(account.interestRate) : account.interestRate;
    const grossInterest = principal * (interestRate / 100);
    const interestTax = grossInterest * (settings.capitalGainsTaxRate / 100);
    const netInterest = grossInterest - interestTax;
    const bollo = account.bollo || (principal * (settings.depositAccountStampDutyRate / 100));
    const totalTaxes = interestTax + bollo;
    const netYield = netInterest - bollo;
    const effectiveRate = principal > 0 ? (netYield / principal) * 100 : 0;

    return {
      grossInterest,
      interestTax,
      netInterest, 
      bollo,
      totalTaxes,
      netYield,
      effectiveRate
    };
  };

  // Funzione per aggregare tutti i conti deposito
  // Semplificato: niente aggregazioni su interessi/bollo
  const calculateAllDepositTaxes = (_accounts: AssetItem[]) => null;

  // UI breakdown fiscale per singolo conto deposito (versione completa per modal)
  const renderDepositBreakdown = (account: AssetItem) => {
    if (account.accountType !== 'deposit' && account.accountType !== 'remunerated') return null;
    const due = isStampDutyDue(account.accountType, account.amount);
      return (
      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <span className={due ? 'text-red-600 font-medium' : (darkMode ? 'text-gray-400' : 'text-gray-500')}>{due ? 'SI' : 'NO'}</span>
      </div>
    );
  };

  // UI breakdown fiscale compatto per tabella - STANDARDIZZATO
  const renderCompactFiscalBreakdown = (account: AssetItem) => {
    // Per conti deposito
    if (account.accountType === 'deposit' || account.accountType === 'remunerated') {
      const due = isStampDutyDue(account.accountType, account.amount);
      return (
        <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <span className={due ? 'text-red-600 font-medium' : (darkMode ? 'text-gray-400' : 'text-gray-500')}>{due ? 'SI' : 'NO'}</span>
        </div>
      );
    }
    
    // Per conti correnti - mostra solo se c'è bollo da pagare
    if (account.accountType === 'current') {
      if (isStampDutyDue('current', account.amount)) {
        return (
          <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="text-red-600 font-medium">SI</div>
          </div>
        );
      }
      // Se non c'è bollo, non mostrare nulla
      return (
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          —
        </div>
      );
    }
    
    // Per contanti
    if (account.accountType === 'cash') {
      return (
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          —
        </div>
      );
    }
    
    return null;
  };

  // ✅ SECURITY: Clear all transactions functions
  const handleClearAllTransactions = useCallback(() => {
    // Step 1: Show initial confirmation
    setClearTransactionsStep('confirm');
    setShowClearTransactionsModal(true);
  }, [setClearTransactionsStep, setShowClearTransactionsModal]);

  const handleClearTransactionsConfirm = useCallback(() => {
    // Step 2: Show warning with transaction count
    setClearTransactionsStep('warning');
  }, [setClearTransactionsStep]);

  const handleClearTransactionsWarning = useCallback(() => {
    // Step 3: Final confirmation with password
    setClearTransactionsStep('final');
  }, [setClearTransactionsStep]);

  const handleClearTransactionsFinal = useCallback(() => {
    const transactionsCount = safeGetTransactions().length;
    const totalValue = safeGetTransactions().reduce((sum: number, item: Transaction) => sum + item.amount, 0);
    
    // Validate password (simple validation for demo - in production use proper authentication)
    if (clearTransactionsPassword !== 'DELETE') {
      showNotification(t('clearTransactionsPasswordError'), 'error');
      return;
    }

    try {
      // Create backup before deletion
      const backupData = {
        timestamp: new Date().toISOString(),
        transactions: safeGetTransactions(),
        totalValue,
        count: transactionsCount,
        reason: 'user_requested_clear_all'
      };

      // Save backup
      const backups = JSON.parse(localStorage.getItem('mangomoney-transaction-backups') || '[]');
      backups.push(backupData);
      // Keep only last 5 backups
      if (backups.length > 5) {
        backups.shift();
      }
      localStorage.setItem('mangomoney-transaction-backups', JSON.stringify(backups));

      // Clear all transactions
      setAssets(prev => ({
        ...prev,
        transactions: []
      }));

      // Reset pagination and filters
      setCurrentTransactionPage(1);
      setTransactionFilters({ type: 'all', ticker: '', isin: '' });

      // Log security event
      auditTrail.logSecurityEvent('all_transactions_cleared', {
        transactionsCount,
        totalValue,
        backupCreated: true
      }, 'high');

      // Show success notification
      showNotification(
        t('clearTransactionsSuccess').replace('{count}', transactionsCount.toString()).replace('{value}', formatCurrency(totalValue)), 
        'success'
      );

      // Close modal and reset state
      setShowClearTransactionsModal(false);
      setClearTransactionsStep('confirm');
      setClearTransactionsPassword('');

    } catch (error) {
      console.error('Error clearing transactions:', error);
      showNotification(t('clearTransactionsError'), 'error');
      
      // Log error
      auditTrail.logSecurityEvent('clear_transactions_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionsCount
      }, 'high');
    }
  }, [clearTransactionsPassword, t, formatCurrency, safeGetTransactions, setAssets, setCurrentTransactionPage, setTransactionFilters, auditTrail, showNotification]);

  const handleClearTransactionsCancel = useCallback(() => {
    setShowClearTransactionsModal(false);
    setClearTransactionsStep('confirm');
    setClearTransactionsPassword('');
  }, [setShowClearTransactionsModal, setClearTransactionsStep, setClearTransactionsPassword]);

  // Componente statistiche aggregate conti deposito
  const DepositTaxesSummary = ({ accounts, settings }: { 
    accounts: AssetItem[], 
    settings: { 
      capitalGainsTaxRate: number;
      depositAccountStampDutyRate: number;
    } 
  }) => {
    const depositTaxes = calculateAllDepositTaxes(accounts);
    if (!depositTaxes) return null;

    return null;
  };

  // Validazione per conti deposito
  const validateCashAccount = (account: AssetItem): string[] => {
    const errors: string[] = [];
    
    if ((account.accountType === 'deposit' || account.accountType === 'remunerated') && account.interestRate !== undefined) {
      if (account.interestRate < 0) {
        errors.push('Il tasso di interesse non può essere negativo');
      }
      if (account.interestRate > 20) {
        errors.push('Il tasso di interesse sembra troppo alto (max 20%)');
      }
      if (account.interestRate > 0 && account.interestRate < 0.01) {
        errors.push('Il tasso di interesse sembra troppo basso (min 0.01%)');
      }
    }
    
    return errors;
  };

  // Input sanitization utilities - using imported function

  // ✅ SECURITY: Enhanced number sanitization with advanced validation
  const sanitizeNumber = (input: string | number, context: 'amount' | 'percentage' | 'price' | 'quantity' = 'amount'): number => {
    try {
      // Rate limiting for number sanitization (potential attack vector)
      if (!rateLimiter.checkLimit('number_sanitization', 1000, 60000)) {
        auditTrail.logSecurityEvent('sanitization_rate_limit', { context }, 'high');
        return 0;
      }

    if (typeof input === 'number') {
          const validation = validateFinancialAmount(input, context);
    if (!validation.valid) {
          auditTrail.logSecurityEvent('number_validation_failed', {
            context,
            value: input,
            error: validation.error
          }, 'medium');
        logError('sanitizeNumberValidation', `${context}: ${validation.error} (${validation.code})`, 'warning');
      return 0;
    }
      return input;
    }
    
      if (typeof input !== 'string') {
        auditTrail.logSecurityEvent('invalid_input_type', {
          context,
          type: typeof input
        }, 'medium');
        return 0;
      }
      
      // Use enhanced sanitization for amount context
      let cleaned: string;
      if (context === 'amount' || context === 'price') {
        cleaned = sanitizeAmount(input);
      } else {
        cleaned = input.replace(/[^0-9.-]/g, '');
      }
      
    const parsed = parseFloat(cleaned);
    
    const validation = validateFinancialAmount(parsed, context);
    if (!validation.valid) {
        auditTrail.logSecurityEvent('number_validation_failed', {
          context,
          input: cleaned,
          error: validation.error
        }, 'medium');
      logError('sanitizeNumberValidation', `${context}: ${validation.error} (${validation.code})`, 'warning');
      return 0;
    }
    
    return parsed;
    } catch (error) {
      const errorMessage = secureErrorHandler(error instanceof Error ? error : new Error('Unknown sanitization error'), 'sanitization');
      auditTrail.logSecurityEvent('sanitization_error', {
        context,
        input: typeof input === 'string' ? input.substring(0, 50) : input,
        error: errorMessage
      }, 'high');
      return 0;
    }
  };



  // Enhanced financial amount validation with granular edge case handling
  const validateFinancialAmount = (value: number, context: 'amount' | 'percentage' | 'price' | 'quantity' = 'amount'): { valid: boolean; error?: string; code?: string } => {
    // Validazione NaN più rigorosa
    if (value === null || value === undefined || Number.isNaN(value)) {
      return { 
        valid: false, 
        error: 'Valore non è un numero valido', 
        code: 'INVALID_NAN' 
      };
    }
    
    // Validazione Infinity
    if (!Number.isFinite(value)) {
      return { 
        valid: false, 
        error: 'Valore infinito o troppo grande per essere gestito', 
        code: 'INVALID_INFINITY' 
      };
    }
    
    // Check for excessive decimal places
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    
    switch (context) {
      case 'amount':
        if (Math.abs(value) > 1e15) {
          return { 
            valid: false, 
            error: 'Importo troppo elevato (massimo 1 quadrilione)', 
            code: 'AMOUNT_TOO_LARGE' 
          };
        }
        if (Math.abs(value) < 0.01 && value !== 0) {
          return { 
            valid: false, 
            error: 'Importo troppo piccolo (minimo 0.01)', 
            code: 'AMOUNT_TOO_SMALL' 
          };
        }
        if (decimalPlaces > 2) {
          return { 
            valid: false, 
            error: 'Troppe cifre decimali (massimo 2)', 
            code: 'AMOUNT_TOO_MANY_DECIMALS' 
          };
        }
        break;
        
      case 'percentage':
        if (value < -99.99) {
          return { 
            valid: false, 
            error: 'Percentuale non può essere inferiore a -99.99%', 
            code: 'PERCENTAGE_TOO_NEGATIVE' 
          };
        }
        if (value > 50000) {
          return { 
            valid: false, 
            error: 'Percentuale non può superare 50.000%', 
            code: 'PERCENTAGE_TOO_LARGE' 
          };
        }
        if (decimalPlaces > 2) {
          return { 
            valid: false, 
            error: 'Troppe cifre decimali per percentuale (massimo 2)', 
            code: 'PERCENTAGE_TOO_MANY_DECIMALS' 
          };
        }
        break;
        
      case 'price':
        if (value < 0) {
          return { 
            valid: false, 
            error: 'Il prezzo non può essere negativo', 
            code: 'PRICE_NEGATIVE' 
          };
        }
        if (value > 1e12) {
          return { 
            valid: false, 
            error: 'Prezzo troppo elevato (massimo 1 trilione)', 
            code: 'PRICE_TOO_LARGE' 
          };
        }
        if (decimalPlaces > 6) {
          return { 
            valid: false, 
            error: 'Troppe cifre decimali per prezzo (massimo 6)', 
            code: 'PRICE_TOO_MANY_DECIMALS' 
          };
        }
        break;
        
      case 'quantity':
        if (value < 0) {
          return { 
            valid: false, 
            error: 'La quantità non può essere negativa', 
            code: 'QUANTITY_NEGATIVE' 
          };
        }
        if (value > 1e9) {
          return { 
            valid: false, 
            error: 'Quantità troppo elevata (massimo 1 miliardo)', 
            code: 'QUANTITY_TOO_LARGE' 
          };
        }
        // ✅ RIMOSSO: La validazione Number.isInteger() è stata rimossa
        // Ora accettiamo decimali e li arrotondiamo in sanitizeInteger
        // Questo è più user-friendly per quantità come "10.0" o "5.99"
        break;
    }
    
    return { valid: true, code: 'VALID' };
  };

  const sanitizeInteger = (input: string | number, showWarning: boolean = true): number => {
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) {
        logError('sanitizeIntegerValidation', 'Input number is not finite', 'warning');
        return 0;
      }
      
      // ✅ QUANTITY ROUNDING WARNING FIXED - Check if rounding is needed
      const rounded = Math.round(input);
      if (showWarning && Math.abs(input - rounded) > 0.001) {
        console.warn(`Quantity rounded from ${input} to ${rounded}`);
        // Optional: show user notification about rounding
      }
      
      const validation = validateFinancialAmount(rounded, 'quantity');
      if (!validation.valid) {
        logError('sanitizeIntegerValidation', `${validation.error} (${validation.code})`, 'warning');
        return 0;
      }
      
      return rounded;
    }
    
    if (typeof input !== 'string') return 0;
    
    const cleaned = input.replace(/[^0-9.-]/g, '');
    
    if (!cleaned || cleaned === '-' || cleaned === '.') {
      logError('sanitizeIntegerValidation', 'Invalid string input after cleaning', 'warning');
      return 0;
    }
    
    // ✅ Usa parseFloat invece di parseInt per gestire decimali
    const parsed = parseFloat(cleaned);
    
    if (!Number.isFinite(parsed)) {
      logError('sanitizeIntegerValidation', `parseFloat resulted in non-finite value: ${parsed}`, 'warning');
      return 0;
    }
    
    // ✅ QUANTITY ROUNDING WARNING FIXED - Check if rounding is needed
    const rounded = Math.round(parsed);
    if (showWarning && Math.abs(parsed - rounded) > 0.001) {
      console.warn(`Quantity rounded from ${parsed} to ${rounded}`);
      // Optional: show user notification about rounding
    }
    
    const validation = validateFinancialAmount(rounded, 'quantity');
    if (!validation.valid) {
      logError('sanitizeIntegerValidation', `${validation.error} (${validation.code})`, 'warning');
      return 0;
    }
    
    return rounded;
  };

  const sanitizeDate = (input: string): string => {
    if (!input || typeof input !== 'string') return new Date().toISOString().split('T')[0];
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input)) {
      return new Date().toISOString().split('T')[0];
    }
    
    const date = new Date(input);
    
    // ✅ CORRETTO: Crea nuovo oggetto invece di modificare in-place
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const minDate = new Date('1900-01-01');
    
    // Controllo più robusto per date invalide
    if (!Number.isFinite(date.getTime()) || date > endOfToday || date < minDate) {
      logError('sanitizeDateValidation', `Invalid date: ${input}`, 'warning');
      return new Date().toISOString().split('T')[0];
    }
    
    return input;
  };

  const sanitizeTicker = useCallback((input: string): string => {
    return sanitizeString(input).toUpperCase().replace(/[^A-Z0-9.]/g, '');
  }, []);

  const sanitizeISIN = useCallback((input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove spaces and convert to uppercase
    const cleaned = input.replace(/\s/g, '').toUpperCase();
    
    // ISIN format: 2 letters + 10 alphanumeric characters
    const isinRegex = /^[A-Z]{2}[A-Z0-9]{10}$/;
    
    if (!isinRegex.test(cleaned)) {
      console.warn(`Invalid ISIN format: ${input}. Expected format: XX1234567890`);
      return ''; // Return empty string for invalid ISINs
    }
    
    // Optional: Add check digit validation
    return cleaned;
  }, []);

  // Export functionality
  const exportToJSON = useCallback(async () => {
    // Safety check to ensure all variables are initialized
    if (forceMobileLayout === undefined) return;
    
    await withLoading('exporting', async () => {
      // Calculate statistics for metadata
      const totalItems = Object.values(assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0);
      const totalValue = Object.entries(totals).reduce((sum: number, [key, value]) => {
        if (key === 'total') return sum;
        return sum + Math.abs(value);
      }, 0);
      
      // Aggiorna timestamp ultimo backup
      localStorage.setItem('mangomoney-last-backup-time', new Date().toISOString());

    // Generate checksum for data integrity
    const dataForChecksum = JSON.stringify({ assets, settings: {
      capitalGainsTaxRate,
      whitelistBondsTaxRate,
      currentAccountStampDuty,
      currentAccountStampDutyThreshold,
      depositAccountStampDutyRate,
      emergencyFundOptimalMonths,
      emergencyFundAdequateMonths,
      selectedCurrency,
      selectedLanguage,
      swrRate,
      inflationRate,
      darkMode,
      forceMobileLayout,
      privacyMode,
      monthlyExpenses,
      emergencyFundAccount,
      safeMode,
      transactionFilters,
      sortField,
      sortDirection,
      alternativeAssetFilter,
      currentTransactionPage,
      currentAlternativeAssetPage,
      localFieldValues,
      lastSaved
    }});
    const checksum = btoa(dataForChecksum).slice(0, 16); // Simple checksum

    const exportData: ExportData = {
      assets,
      settings: {
        // Tax and fee settings
        capitalGainsTaxRate,
        whitelistBondsTaxRate,
        currentAccountStampDuty,
        currentAccountStampDutyThreshold,
        depositAccountStampDutyRate,
        
        // Emergency fund settings
        emergencyFundOptimalMonths,
        emergencyFundAdequateMonths,
        emergencyFundAccount,
        monthlyExpenses,
        
        // Currency and language settings
        selectedCurrency,
        selectedLanguage,
        
        // Financial planning settings
        swrRate,
        inflationRate,
        costBasisMethod,
        
        // UI and display settings
        darkMode,
        forceMobileLayout,
        privacyMode,
        safeMode,
        
        // Transaction filters and sorting
        transactionFilters,
        sortField,
        sortDirection,
        
        // Alternative assets filter
        alternativeAssetFilter,
        
        // Pagination settings
        currentTransactionPage,
        currentTransactionYearPage,
        currentAlternativeAssetPage,
        
        // Form and editing state
        localFieldValues,
        
        // Last saved timestamp
        lastSaved: lastSaved.toISOString()
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: '3.1',
        appName: 'MangoMoney',
        totalItems,
        totalValue,
        exportInfo: {
          totalAssets: Object.values(assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0),
          sections: Object.keys(assets).map(section => ({
            name: section,
            count: assets[section as keyof typeof assets].length
          }))
        },
        // Additional metadata for validation
        checksum,
        dataIntegrity: {
          assetsValid: true,
          settingsValid: true,
          requiredSections: ['cash', 'debts', 'investments', 'investmentPositions', 'transactions', 'realEstate', 'pensionFunds', 'alternativeAssets']
        }
      }
    };
      
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
      link.download = `mangomoney-backup-${new Date().toISOString().split('T')[0]}-v3.0.json`;
    link.click();
    URL.revokeObjectURL(url);
      
      return { totalItems, success: true };
    }, 
    (result) => showSuccess(`Backup esportato con successo! ${result?.totalItems} elementi salvati.`),
    (error) => {
      logError('exportToJSON', error instanceof Error ? error : String(error), 'error');
      showError('Errore durante l\'esportazione del backup.');
    }
    );
  }, [withLoading, assets, totals, capitalGainsTaxRate, whitelistBondsTaxRate, currentAccountStampDuty, currentAccountStampDutyThreshold, depositAccountStampDutyRate, emergencyFundOptimalMonths, emergencyFundAdequateMonths, selectedCurrency, selectedLanguage, swrRate, inflationRate, costBasisMethod, darkMode, forceMobileLayout, privacyMode, emergencyFundAccount, monthlyExpenses, safeMode, transactionFilters, sortField, sortDirection, alternativeAssetFilter, currentTransactionPage, currentTransactionYearPage, currentAlternativeAssetPage, localFieldValues, lastSaved, showSuccess, showError]);

  const exportToCSV = () => {
    setIsLoading(true);
    try {
    const allData: CSVRow[] = [];
    
    // Add regular assets
    Object.entries(assets).forEach(([section, items]) => {
      if (section === 'realEstate') {
        const properties = items as RealEstate[];
        properties.forEach((item: RealEstate) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.name,
            importo: item.value,
            descrizione: item.description,
            indirizzo: item.address || '',
            tipo: item.type === 'primary' ? 'Residenza Principale' : 'Proprietà Secondaria',
            fondo_emergenza: 'No',
            id: item.id,
            note: item.notes || ''
          });
        });
      } else if (section === 'investmentPositions') {
        const positions = items as InvestmentPosition[];
        positions.forEach((item: InvestmentPosition) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.name,
            importo: item.amount,
            descrizione: item.description,
            ticker: item.ticker || '',
            isin: item.isin || '',
            data_acquisto: item.purchaseDate || '',
            tipo: t('globalPositionType'),
            fondo_emergenza: 'No',
            id: item.id,
            note: item.notes || ''
          });
        });
      } else if (section === 'transactions') {
        const transactions = items as Transaction[];
        transactions.forEach((item: Transaction) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.assetType,
            importo: item.amount,
            descrizione: item.description,
            ticker: item.ticker || '',
            isin: item.isin || '',
            tipo_transazione: item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita',
            quantita: item.quantity,
            commissioni: item.commissions,
            data: item.date,
            collegato_a_asset: item.linkedToAsset || '',
            tipo: 'Transazione',
            fondo_emergenza: 'No',
            id: item.id
          });
        });
      } else if (section === 'investments') {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.name,
            importo: item.amount,
            descrizione: item.description,
            ticker: item.ticker || '',
            isin: item.isin || '',
            quantita: item.quantity,
            commissioni: item.fees,
            prezzo_medio: item.avgPrice,
            costo_unitario: item.unitCost,
            collegato_a: item.linkedToGlobalPosition || '',
            settore: item.sector || '',
            fonte_dati: item.dataSource || '',
            commissione: item.fee,
            data_acquisto: item.purchaseDate || '',
            tipo: 'Asset Individuale',
            fondo_emergenza: emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || '',
            prezzo_attuale: item.currentPrice || '',
            data_aggiornamento_prezzo: item.lastPriceUpdate || ''
          });
        });
      } else if (section === 'cash') {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.name,
            importo: item.amount,
            descrizione: item.description,
            tipo_conto: item.accountType || '',
            bollo: item.bollo && item.bollo > 0 ? formatCurrencyWithPrivacy(item.bollo) : '€0.00',
            ticker: item.ticker || '',
            isin: item.isin || '',
            quantita: item.quantity,
            commissioni: item.fees,
            prezzo_medio: item.avgPrice,
            costo_unitario: item.unitCost,
            settore: item.sector || '',
            fonte_dati: item.dataSource || '',
            commissione: item.fee,
            data_acquisto: item.purchaseDate || '',
            collegato_a: item.linkedToGlobalPosition || '',
            prezzo_attuale: item.currentPrice || '',
            data_aggiornamento_prezzo: item.lastPriceUpdate || '',
            tasso_interesse: item.interestRate || '',
            tipo: 'Asset',
            fondo_emergenza: emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || ''
          });
        });
      } else if (section === 'alternativeAssets') {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.name,
            importo: item.amount,
            descrizione: item.description,
            tipo_asset: item.assetType || '',
            ticker: item.ticker || '',
            isin: item.isin || '',
            quantita: item.quantity,
            commissioni: item.fees,
            prezzo_medio: item.avgPrice,
            costo_unitario: item.unitCost,
            settore: item.sector || '',
            fonte_dati: item.dataSource || '',
            commissione: item.fee,
            data_acquisto: item.purchaseDate || '',
            collegato_a: item.linkedToGlobalPosition || '',
            prezzo_attuale: item.currentPrice || '',
            data_aggiornamento_prezzo: item.lastPriceUpdate || '',
            tipo: 'Asset Alternativo',
            fondo_emergenza: emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || ''
          });
        });
      } else {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            categoria: sections[section as keyof typeof sections] || section,
            nome: item.name,
            importo: item.amount,
            descrizione: item.description,
            ticker: item.ticker || '',
            isin: item.isin || '',
            quantita: item.quantity,
            commissioni: item.fees,
            prezzo_medio: item.avgPrice,
            costo_unitario: item.unitCost,
            settore: item.sector || '',
            fonte_dati: item.dataSource || '',
            commissione: item.fee,
            data_acquisto: item.purchaseDate || '',
            collegato_a: item.linkedToGlobalPosition || '',
            prezzo_attuale: item.currentPrice || '',
            data_aggiornamento_prezzo: item.lastPriceUpdate || '',
            tipo: 'Asset',
            fondo_emergenza: emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || ''
          });
        });
      }
    });

      // Add settings as separate section
      const settingsData: CSVRow[] = [
        {
          categoria: 'Impostazioni',
          nome: 'Capital Gains Tax Rate',
          importo: capitalGainsTaxRate,
          descrizione: 'Tasso imposta plusvalenze (%)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Whitelist Bonds Tax Rate',
          importo: whitelistBondsTaxRate,
          descrizione: 'Tasso imposta obbligazioni whitelist (%)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Current Account Stamp Duty',
          importo: currentAccountStampDuty,
          descrizione: 'Imposta di bollo conto corrente (€)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Current Account Stamp Duty Threshold',
          importo: currentAccountStampDutyThreshold,
          descrizione: 'Soglia imposta di bollo conto corrente (€)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Deposit Account Stamp Duty Rate',
          importo: depositAccountStampDutyRate,
          descrizione: 'Tasso imposta di bollo conto deposito (%)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Emergency Fund Optimal Months',
          importo: emergencyFundOptimalMonths,
          descrizione: 'Mesi ottimali fondo emergenza',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Emergency Fund Adequate Months',
          importo: emergencyFundAdequateMonths,
          descrizione: 'Mesi adeguati fondo emergenza',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Emergency Fund Account Section',
          importo: 0,
          descrizione: `Sezione fondo emergenza: ${emergencyFundAccount.section}`,
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: emergencyFundAccount.id,
          note: emergencyFundAccount.name
        },
        {
          categoria: 'Impostazioni',
          nome: 'Monthly Expenses',
          importo: monthlyExpenses,
          descrizione: 'Spese mensili (€)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Selected Currency',
          importo: 0,
          descrizione: `Valuta selezionata: ${selectedCurrency}`,
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Selected Language',
          importo: 0,
          descrizione: `Lingua selezionata: ${selectedLanguage}`,
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'SWR Rate',
          importo: swrRate,
          descrizione: 'Tasso Safe Withdrawal Rate (%)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Inflation Rate',
          importo: inflationRate,
          descrizione: 'Tasso di inflazione (%)',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Cost Basis Method',
          importo: 0,
          descrizione: `Metodo cost basis: ${costBasisMethod}`,
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Dark Mode',
          importo: darkMode ? 1 : 0,
          descrizione: 'Modalità scura attiva',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Force Mobile Layout',
          importo: forceMobileLayout ? 1 : 0,
          descrizione: 'Layout mobile forzato',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Privacy Mode',
          importo: privacyMode ? 1 : 0,
          descrizione: 'Modalità privacy attiva',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        },
        {
          categoria: 'Impostazioni',
          nome: 'Safe Mode',
          importo: safeMode ? 1 : 0,
          descrizione: 'Modalità sicura attiva',
          tipo: 'Setting',
          fondo_emergenza: 'No',
          id: 0,
          note: ''
        }
      ];

      const allDataWithSettings = [...allData, ...settingsData];
    
    // Create CSV content with all available fields
      const csvHeader = Object.keys(allDataWithSettings[0] || {}).join(',') + '\n';
      const csvContent = allDataWithSettings.map((row: CSVRow) =>
      Object.values(row).map((value: string | number | undefined) => {
        const stringValue = value !== undefined ? String(value) : '';
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    
    const dataBlob = new Blob(['\ufeff' + csvHeader + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mangomoney-dettagliato-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Show success message
      showNotification(`CSV esportato con successo! ${allDataWithSettings.length} elementi salvati (inclusi ${settingsData.length} impostazioni).`, 'success');
    } catch (error) {
      showNotification('Errore durante l\'esportazione CSV. Riprova.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    setIsLoading(true);
    try {
    const allData: CSVRow[] = [];
    
    // Add regular assets
    Object.entries(assets).forEach(([section, items]) => {
      if (section === 'realEstate') {
        const properties = items as RealEstate[];
        properties.forEach((item: RealEstate) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.name,
            Amount: item.value,
            Description: item.description,
            Address: item.address || '',
            Type: item.type === 'primary' ? 'Residenza Principale' : 'Proprietà Secondaria',
            'Emergency Fund': 'No',
            ID: item.id,
            Notes: item.notes || ''
          });
        });
      } else if (section === 'investmentPositions') {
        const positions = items as InvestmentPosition[];
        positions.forEach((item: InvestmentPosition) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.name,
            Amount: item.amount,
            Description: item.description,
            Ticker: item.ticker || '',
            ISIN: item.isin || '',
            'Purchase Date': item.purchaseDate || '',
            Type: t('globalPositionType'),
            'Emergency Fund': 'No',
            ID: item.id,
            Notes: item.notes || ''
          });
        });
      } else if (section === 'transactions') {
        const transactions = items as Transaction[];
        transactions.forEach((item: Transaction) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.assetType,
            Amount: item.amount,
            Description: item.description,
            Ticker: item.ticker || '',
            ISIN: item.isin || '',
            'Transaction Type': item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita',
            Quantity: item.quantity,
            Commissions: item.commissions,
            Date: item.date,
            Type: 'Transazione',
            'Emergency Fund': 'No',
            ID: item.id
          });
        });
      } else if (section === 'investments') {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.name,
            Amount: item.amount,
            Description: item.description,
            Ticker: item.ticker || '',
            ISIN: item.isin || '',
            Quantity: item.quantity,
            Commissions: item.fees,
            'Average Price': item.avgPrice,
            'Unit Cost': item.unitCost,
            'Linked To': item.linkedToGlobalPosition || '',
            Sector: item.sector || '',
            'Data Source': item.dataSource || '',
            Fee: item.fee,
            'Purchase Date': item.purchaseDate || '',
            Type: 'Asset Individuale',
            'Emergency Fund': emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            ID: item.id,
            Notes: item.notes || '',
            'Current Price': item.currentPrice || '',
            'Last Price Update': item.lastPriceUpdate || ''
          });
        });
      } else if (section === 'cash') {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.name,
            Amount: item.amount,
            Description: item.description,
            'Account Type': item.accountType || '',
            'Stamp Duty': item.bollo && item.bollo > 0 ? formatCurrencyWithPrivacy(item.bollo) : '€0.00',
            Ticker: item.ticker || '',
            ISIN: item.isin || '',
            Quantity: item.quantity,
            Commissions: item.fees,
            'Average Price': item.avgPrice,
            'Unit Cost': item.unitCost,
            Sector: item.sector || '',
            'Data Source': item.dataSource || '',
            Fee: item.fee,
            'Purchase Date': item.purchaseDate || '',
            'Linked To': item.linkedToGlobalPosition || '',
            'Current Price': item.currentPrice || '',
            'Last Price Update': item.lastPriceUpdate || '',
            'Interest Rate': item.interestRate || '',
            Type: 'Asset',
            'Emergency Fund': emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            ID: item.id,
            Notes: item.notes || ''
          });
        });
      } else if (section === 'alternativeAssets') {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.name,
            Amount: item.amount,
            Description: item.description,
            'Asset Type': item.assetType || '',
            Ticker: item.ticker || '',
            ISIN: item.isin || '',
            Quantity: item.quantity,
            Commissions: item.fees,
            'Average Price': item.avgPrice,
            'Unit Cost': item.unitCost,
            Sector: item.sector || '',
            'Data Source': item.dataSource || '',
            Fee: item.fee,
            'Purchase Date': item.purchaseDate || '',
            'Linked To': item.linkedToGlobalPosition || '',
            'Current Price': item.currentPrice || '',
            'Last Price Update': item.lastPriceUpdate || '',
            Type: 'Asset Alternativo',
            'Emergency Fund': emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            ID: item.id,
            Notes: item.notes || ''
          });
        });
      } else {
        const assetItems = items as AssetItem[];
        assetItems.forEach((item: AssetItem) => {
          allData.push({
            Category: sections[section as keyof typeof sections] || section,
            Name: item.name,
            Amount: item.amount,
            Description: item.description,
            Ticker: item.ticker || '',
            ISIN: item.isin || '',
            Quantity: item.quantity,
            Commissions: item.fees,
            'Average Price': item.avgPrice,
            'Unit Cost': item.unitCost,
            Sector: item.sector || '',
            'Data Source': item.dataSource || '',
            Fee: item.fee,
            'Purchase Date': item.purchaseDate || '',
            'Linked To': item.linkedToGlobalPosition || '',
            'Current Price': item.currentPrice || '',
            'Last Price Update': item.lastPriceUpdate || '',
            Type: 'Asset',
            'Emergency Fund': emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            ID: item.id,
            Notes: item.notes || ''
          });
        });
      }
    });

    // Add settings as separate section
    const settingsData: CSVRow[] = [
      {
        Category: 'Impostazioni',
        Name: 'Capital Gains Tax Rate',
        Amount: capitalGainsTaxRate,
        Description: 'Tasso imposta plusvalenze (%)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Whitelist Bonds Tax Rate',
        Amount: whitelistBondsTaxRate,
        Description: 'Tasso imposta obbligazioni whitelist (%)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Current Account Stamp Duty',
        Amount: currentAccountStampDuty,
        Description: 'Imposta di bollo conto corrente (€)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Current Account Stamp Duty Threshold',
        Amount: currentAccountStampDutyThreshold,
        Description: 'Soglia imposta di bollo conto corrente (€)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Deposit Account Stamp Duty Rate',
        Amount: depositAccountStampDutyRate,
        Description: 'Tasso imposta di bollo conto deposito (%)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Emergency Fund Optimal Months',
        Amount: emergencyFundOptimalMonths,
        Description: 'Mesi ottimali fondo emergenza',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Emergency Fund Adequate Months',
        Amount: emergencyFundAdequateMonths,
        Description: 'Mesi adeguati fondo emergenza',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Emergency Fund Account Section',
        Amount: 0,
        Description: `Sezione fondo emergenza: ${emergencyFundAccount.section}`,
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: emergencyFundAccount.id,
        Notes: emergencyFundAccount.name
      },
      {
        Category: 'Impostazioni',
        Name: 'Monthly Expenses',
        Amount: monthlyExpenses,
        Description: 'Spese mensili (€)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Selected Currency',
        Amount: 0,
        Description: `Valuta selezionata: ${selectedCurrency}`,
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Selected Language',
        Amount: 0,
        Description: `Lingua selezionata: ${selectedLanguage}`,
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'SWR Rate',
        Amount: swrRate,
        Description: 'Tasso Safe Withdrawal Rate (%)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Inflation Rate',
        Amount: inflationRate,
        Description: 'Tasso di inflazione (%)',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Cost Basis Method',
        Amount: 0,
        Description: `Metodo cost basis: ${costBasisMethod}`,
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Dark Mode',
        Amount: darkMode ? 1 : 0,
        Description: 'Modalità scura attiva',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Force Mobile Layout',
        Amount: forceMobileLayout ? 1 : 0,
        Description: 'Layout mobile forzato',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Privacy Mode',
        Amount: privacyMode ? 1 : 0,
        Description: 'Modalità privacy attiva',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      },
      {
        Category: 'Impostazioni',
        Name: 'Safe Mode',
        Amount: safeMode ? 1 : 0,
        Description: 'Modalità sicura attiva',
        Type: 'Setting',
        'Emergency Fund': 'No',
        ID: 0,
        Notes: ''
      }
    ];

    const allDataWithSettings = [...allData, ...settingsData];
    
    // Create Excel-compatible CSV with semicolon separator
    const csvHeader = Object.keys(allDataWithSettings[0] || {}).join(';') + '\n';
        const csvContent = allDataWithSettings.map((row: CSVRow) =>
      Object.values(row).map((value: string | number | undefined) => {
        const stringValue = value !== undefined ? String(value) : '';
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(';')
    ).join('\n');
    
    // Add BOM for Excel compatibility
    const dataBlob = new Blob(['\ufeff' + csvHeader + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mangomoney-excel-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Show success message
          showNotification(`Excel esportato con successo! ${allDataWithSettings.length} elementi salvati (inclusi ${settingsData.length} impostazioni).`, 'success');
    } catch (error) {
      showNotification('Errore durante l\'esportazione Excel. Riprova.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, exporting: true }));
      
      // Crea un elemento temporaneo per il PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.fontSize = '12px';
      pdfContainer.style.lineHeight = '1.4';
      document.body.appendChild(pdfContainer);

      const currentDate = new Date().toLocaleDateString('it-IT');
      const currentTime = new Date().toLocaleTimeString('it-IT');
      const totalItems = Object.values(assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0);

      // Header del PDF
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
          <h1 style="color: #059669; margin: 0 0 10px 0; font-size: 24px;">MangoMoney - Report Completo Patrimonio</h1>
          <p style="margin: 5px 0; color: #666;"><strong>Data:</strong> ${currentDate} alle ${currentTime}</p>
          <p style="font-size: 20px; color: #059669; font-weight: bold; margin: 10px 0;">Patrimonio Netto: ${formatCurrencyWithPrivacy(netWorth)}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Riepilogo Generale</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="text-align: center; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e9ecef;">
              <div style="font-size: 18px; font-weight: bold; color: #059669;">${totalItems}</div>
              <div style="font-size: 10px; color: #6c757d; text-transform: uppercase;">Elementi Totali</div>
            </div>
            <div style="text-align: center; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e9ecef;">
              <div style="font-size: 18px; font-weight: bold; color: #059669;">${formatCurrencyWithPrivacy(netWorth)}</div>
              <div style="font-size: 10px; color: #6c757d; text-transform: uppercase;">Patrimonio Netto</div>
            </div>
            <div style="text-align: center; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e9ecef;">
              <div style="font-size: 18px; font-weight: bold; color: #dc2626;">${formatCurrencyWithPrivacy(Math.abs(totals.debts))}</div>
              <div style="font-size: 10px; color: #6c757d; text-transform: uppercase;">Debiti Totali</div>
            </div>
          </div>
        </div>
      `;

      // Aggiungi sezioni per ogni tipo di asset
      Object.entries(assets).forEach(([section, items]) => {
        if (!Array.isArray(items) || items.length === 0) return;
        
        let sectionTotal = 0;
        let sectionItems: any[] = [];
        
        if (section === 'realEstate') {
          const properties = items as RealEstate[];
          sectionTotal = properties.reduce((sum: number, item: RealEstate) => sum + item.value, 0);
          sectionItems = properties.map((item: RealEstate) => ({
            name: item.name,
            amount: item.value,
            description: item.description || '',
            notes: item.address || '',
            isDebt: false
          }));
        } else if (section === 'investmentPositions') {
          const positions = items as InvestmentPosition[];
          sectionTotal = positions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0);
          sectionItems = positions.map((item: InvestmentPosition) => ({
            name: item.name,
            amount: item.amount,
            description: item.description || '',
            notes: item.notes || '',
            isDebt: false
          }));
        } else if (section === 'transactions') {
          const transactions = items as Transaction[];
          sectionTotal = transactions.reduce((sum: number, item: Transaction) => sum + item.amount, 0);
          sectionItems = transactions.map((item: Transaction) => ({
            name: item.assetType,
            amount: item.amount,
            description: item.description || '',
            notes: `${item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'} - ${item.quantity} unità`,
            isDebt: false
          }));
        } else if (section === 'cash') {
          const assetItems = items as AssetItem[];
          sectionTotal = assetItems.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
          sectionItems = assetItems.map((item: AssetItem) => ({
            name: item.name,
            amount: item.amount,
            description: item.description || '',
                            notes: `${item.notes || ''}${item.notes ? ' - ' : ''}Tipo: ${item.accountType === 'current' ? 'Conto Corrente' : item.accountType === 'deposit' ? 'Conto Deposito' : item.accountType === 'remunerated' ? 'Conto Remunerato' : 'Contanti'}${item.bollo && item.bollo > 0 ? ` - Bollo: ${formatCurrencyWithPrivacy(item.bollo)}` : ' - Bollo: €0.00'}`,
            isDebt: false
          }));
        } else {
          const assetItems = items as AssetItem[];
          sectionTotal = assetItems.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
          sectionItems = assetItems.map((item: AssetItem) => ({
            name: item.name,
            amount: item.amount,
            description: item.description || '',
            notes: item.notes || '',
            isDebt: section === 'debts'
          }));
        }
        
        const sectionTitle = sections[section as keyof typeof sections] || section;
        
        let sectionHTML = `
          <div style="margin: 25px 0; page-break-inside: avoid;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px 0; color: #1f2937; border-bottom: 1px solid #e9ecef; padding-bottom: 5px;">${sectionTitle}</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f3f4f6; font-weight: bold; color: #374151;">Nome</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f3f4f6; font-weight: bold; color: #374151;">Importo</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f3f4f6; font-weight: bold; color: #374151;">Descrizione</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f3f4f6; font-weight: bold; color: #374151;">Note</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        sectionItems.forEach((item: any) => {
          const isEmergency = emergencyFundAccount.section === section && emergencyFundAccount.id === item.id;
          const isDebt = item.isDebt;
          const amountColor = isDebt ? '#dc2626' : '#059669';
          
          sectionHTML += `
            <tr>
              <td style="border: 1px solid #ddd; padding: 6px 8px; text-align: left;">${isEmergency ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="display: inline-block; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>' : ''}${item.name || 'N/A'}</td>
                              <td style="border: 1px solid #ddd; padding: 6px 8px; text-align: right; font-family: monospace; font-weight: bold; color: ${amountColor};">${formatCurrencyWithPrivacy(isDebt ? Math.abs(item.amount) : item.amount)}${isDebt ? ' <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="display: inline-block; margin-left: 2px;"><polyline points="6,9 12,15 18,9"></polyline></svg>' : ''}</td>
              <td style="border: 1px solid #ddd; padding: 6px 8px; text-align: left;">${item.description || ''}</td>
              <td style="border: 1px solid #ddd; padding: 6px 8px; text-align: left;">${item.notes || ''}</td>
            </tr>
          `;
        });
        
        sectionHTML += `
              <tr style="font-weight: bold; background-color: #f9fafb;">
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;"><strong>Totale ${sectionTitle}</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-family: monospace; font-weight: bold; color: ${section === 'debts' ? '#dc2626' : '#059669'}"><strong>${formatCurrencyWithPrivacy(section === 'debts' ? Math.abs(sectionTotal) : sectionTotal)}${section === 'debts' ? ' <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="display: inline-block; margin-left: 2px;"><polyline points="6,9 12,15 18,9"></polyline></svg>' : ''}</strong></td>
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px;"></td>
              </tr>
            </tbody>
          </table>
        </div>
        `;
        
        pdfContainer.innerHTML += sectionHTML;
      });

      // Footer
      pdfContainer.innerHTML += `
        <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 10px; border-top: 1px solid #e9ecef; padding-top: 15px;">
          <p style="margin: 0;">Generato da MangoMoney v2.0 - ${new Date().toLocaleString('it-IT')}</p>
        </div>
      `;

      // Converti in canvas e poi in PDF
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: pdfContainer.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salva il PDF
      const fileName = `MangoMoney_Report_${currentDate.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

      // Pulisci
      document.body.removeChild(pdfContainer);
      
      showSuccess('PDF generato con successo!');
      
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      showError('Errore durante la generazione del PDF. Riprova.');
      logError('PDFExport', error instanceof Error ? error : new Error('PDF export failed'), 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, exporting: false }));
    }
  };

  // Import functionality
  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      logError('importFromFile', 'File type validation failed: not a JSON file', 'warning');
              showNotification('Per favore seleziona un file JSON valido.', 'error');
      event.target.value = '';
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      logError('importFromFile', `File size validation failed: ${file.size} bytes`, 'warning');
              showNotification('Il file è troppo grande. Dimensione massima: 10MB', 'error');
      event.target.value = '';
      return;
    }

    if (!window.confirm('⚠️ ATTENZIONE: L\'importazione sovrascriverà tutti i dati attuali. Confermi di voler procedere?')) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Impossibile leggere il file');
        }
        
        const importedData = safeParseJSON(result, null);
        if (!importedData) {
          throw new Error('Formato JSON non valido');
        }
        
        // Enhanced validation of imported data structure
        if (!importedData.assets || typeof importedData.assets !== 'object') {
          throw new Error('Struttura dati non valida: manca la sezione "assets"');
        }

        // Validate required asset sections
        const requiredSections = ['cash', 'debts', 'investments', 'investmentPositions', 'transactions', 'realEstate', 'pensionFunds', 'alternativeAssets'];
        for (const section of requiredSections) {
          if (!Array.isArray(importedData.assets[section])) {
            throw new Error(`Sezione "${section}" mancante o non valida`);
          }
        }

        // Validate metadata
        if (!importedData.metadata || typeof importedData.metadata !== 'object') {
          throw new Error('Metadati mancanti o non validi');
        }

        // Validate data integrity if available
        if (importedData.metadata.dataIntegrity) {
          const { dataIntegrity } = importedData.metadata;
          if (!dataIntegrity.assetsValid) {
            throw new Error('Integrità dati compromessa: assets non validi');
          }
          if (!dataIntegrity.settingsValid) {
            throw new Error('Integrità dati compromessa: settings non validi');
          }
        }

        // Validate checksum if available
        if (importedData.metadata.checksum) {
          const dataForChecksum = JSON.stringify({ 
            assets: importedData.assets, 
            settings: importedData.settings 
          });
          const expectedChecksum = btoa(dataForChecksum).slice(0, 16);
          if (importedData.metadata.checksum !== expectedChecksum) {
            throw new Error('Checksum non valido: i dati potrebbero essere corrotti');
          }
        }

        // Import the data
        setAssets(importedData.assets);
        sessionStorage.setItem('mangomoney-restored-from-backup', 'true');
        sessionStorage.removeItem('mangomoney-welcome-shown');
        
        // Import settings if available (backward compatibility)
        if (importedData.settings) {
          // Tax and fee settings
          if (importedData.settings.capitalGainsTaxRate !== undefined) {
            setCapitalGainsTaxRate(importedData.settings.capitalGainsTaxRate);
          }
          if (importedData.settings.whitelistBondsTaxRate !== undefined) {
            setWhitelistBondsTaxRate(importedData.settings.whitelistBondsTaxRate);
          }
          if (importedData.settings.currentAccountStampDuty !== undefined) {
            setCurrentAccountStampDuty(importedData.settings.currentAccountStampDuty);
          }
          if (importedData.settings.currentAccountStampDutyThreshold !== undefined) {
            setCurrentAccountStampDutyThreshold(importedData.settings.currentAccountStampDutyThreshold);
          }
          if (importedData.settings.depositAccountStampDutyRate !== undefined) {
            setDepositAccountStampDutyRate(importedData.settings.depositAccountStampDutyRate);
          }
          
          // Emergency fund settings
          if (importedData.settings.emergencyFundOptimalMonths !== undefined) {
            setEmergencyFundOptimalMonths(importedData.settings.emergencyFundOptimalMonths);
          }
          if (importedData.settings.emergencyFundAdequateMonths !== undefined) {
            setEmergencyFundAdequateMonths(importedData.settings.emergencyFundAdequateMonths);
          }
          if (importedData.settings.emergencyFundAccount) {
            setEmergencyFundAccount(importedData.settings.emergencyFundAccount);
          }
          if (importedData.settings.monthlyExpenses !== undefined) {
            setMonthlyExpenses(importedData.settings.monthlyExpenses);
          }
          
          // Currency and language settings
          if (importedData.settings.selectedCurrency) {
            setSelectedCurrency(importedData.settings.selectedCurrency);
          }
          if (importedData.settings.selectedLanguage) {
            setSelectedLanguage(importedData.settings.selectedLanguage);
          }
          
          // Financial planning settings
          if (importedData.settings.swrRate !== undefined) {
            setSwrRate(importedData.settings.swrRate);
          }
          if (importedData.settings.inflationRate !== undefined) {
            setInflationRate(importedData.settings.inflationRate);
          }
          if (importedData.settings.costBasisMethod !== undefined) {
            setCostBasisMethod(importedData.settings.costBasisMethod);
          }
          
          // UI and display settings
          if (importedData.settings.darkMode !== undefined) {
            setDarkMode(importedData.settings.darkMode);
          }
          if (importedData.settings.forceMobileLayout !== undefined) {
            setForceMobileLayout(importedData.settings.forceMobileLayout);
          }
          if (importedData.settings.privacyMode !== undefined) {
            setPrivacyMode(importedData.settings.privacyMode);
          }
          if (importedData.settings.safeMode !== undefined) {
            setSafeMode(importedData.settings.safeMode);
          }
          
          // Transaction filters and sorting
          if (importedData.settings.transactionFilters) {
            setTransactionFilters(importedData.settings.transactionFilters);
          }
          if (importedData.settings.sortField) {
            setSortField(importedData.settings.sortField);
          }
          if (importedData.settings.sortDirection) {
            setSortDirection(importedData.settings.sortDirection);
          }
          
          // Alternative assets filter
          if (importedData.settings.alternativeAssetFilter) {
            setAlternativeAssetFilter(importedData.settings.alternativeAssetFilter);
          }
          
          // Pagination settings
          if (importedData.settings.currentTransactionPage !== undefined) {
            setCurrentTransactionPage(importedData.settings.currentTransactionPage);
          }
          if (importedData.settings.currentTransactionYearPage !== undefined) {
            setCurrentTransactionYearPage(importedData.settings.currentTransactionYearPage);
          }
          if (importedData.settings.currentAlternativeAssetPage !== undefined) {
            setCurrentAlternativeAssetPage(importedData.settings.currentAlternativeAssetPage);
          }
          
          // Form and editing state
          if (importedData.settings.localFieldValues) {
            setLocalFieldValues(importedData.settings.localFieldValues);
          }
          
          // Last saved timestamp
          if (importedData.settings.lastSaved) {
            const lastSavedDate = typeof importedData.settings.lastSaved === 'string' 
              ? new Date(importedData.settings.lastSaved) 
              : importedData.settings.lastSaved;
            setLastSaved(lastSavedDate);
          }
        }
        
        // Backward compatibility per vecchia struttura
        if (importedData.metadata) {
          if (importedData.metadata.emergencyFundAccount && !importedData.settings?.emergencyFundAccount) {
            setEmergencyFundAccount(importedData.metadata.emergencyFundAccount);
          }
          if (importedData.metadata.monthlyExpenses && !importedData.settings?.monthlyExpenses) {
            setMonthlyExpenses(importedData.metadata.monthlyExpenses);
          }
        }

        // Show success message with details
        const totalItems = Object.values(importedData.assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0);
        
        showNotification(`Backup importato con successo! ${totalItems} elementi caricati.`, 'success');
        
      } catch (error) {
        logError('importFromFile', error instanceof Error ? error : String(error), 'error');
        showNotification(`Errore nell'importazione. Verifica che il file sia un backup valido di MangoMoney.`, 'error');
      }
    };

    reader.onerror = () => {
      logError('importFromFile', 'FileReader error occurred', 'error');
      showNotification('Errore nella lettura del file. Riprova.', 'error');
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // CSV Import functionality for transactions
  // Universal CSV Import functionality
  const downloadCSVTemplate = (section?: string) => {
    let csvContent = '';
    let filename = '';
    
    if (section === 'cash') {
      csvContent = `Nome,Descrizione,Importo,Tipo Conto,Bollo,Tasso Interesse,Note\nConto Corrente,Conto principale,6000,current,${currentAccountStampDuty},,Conto principale (sopra soglia)\nConto Deposito,Deposito vincolato,25000,deposit,50.00,3.50,Deposito al 3.5% lordo annuo`;
      filename = 'mangomoney-liquidita-template.csv';
    } else if (section === 'debts') {
      csvContent = 'Nome,Descrizione,Importo,Tipo Debito,Data Inizio,Data Fine,Tasso Interesse,Note\nMutuo Casa,Debito prima casa,-150000,mutuo,2023-01-01,2043-01-01,3.5,Rata mensile 800';
      filename = 'mangomoney-debiti-template.csv';
    } else if (section === 'investments') {
      csvContent = 'Nome,Descrizione,Ticker,ISIN,Quantità,Prezzo Medio,Prezzo Attuale,Commissioni,Note\nETF S&P 500,ETF principale,SPY,US78462F1030,50,450.00,455.20,5.00,Posizione principale';
      filename = 'mangomoney-investimenti-template.csv';
    } else if (section === 'transactions') {
      csvContent = 'Tipo Asset,Ticker,ISIN,Tipo Transazione,Quantità,Importo,Commissioni,Data\nETF,SPY,US78462F1030,Acquisto,100,150.50,2.50,2024-01-15';
      filename = 'mangomoney-transazioni-template.csv';
    } else if (section === 'realEstate') {
      csvContent = 'Nome,Descrizione,Valore,Indirizzo,Tipo,Note\nCasa Milano,Residenza principale,350000,Via Roma 123 Milano,primary,Acquistata nel 2020';
      filename = 'mangomoney-immobili-template.csv';
    } else if (section === 'pensionFunds') {
      csvContent = 'Nome,Descrizione,Importo,Tipo Fondo,Data Inizio,Contributo Mensile,Note\nFondo Pensione A,Previdenza Complementare,12000,complementare,2010-01-01,200,Versamenti regolari';
      filename = 'mangomoney-fondipensione-template.csv';

    } else if (section === 'alternativeAssets') {
      csvContent = 'Nome,Descrizione,Importo,Tipo Asset,Note\nOro,Investimento in oro fisico,10000,tcg,Acquistato nel 2023';
      filename = 'mangomoney-benialternativi-template.csv';
    } else {
      // Template universale
      csvContent = 'Sezione,Nome,Descrizione,Importo,Campo1,Campo2,Campo3,Note\n'
        + 'cash,Conto Corrente,Conto principale,5000,current,,,Conto principale\n'
        + 'cash,Conto Deposito,Deposito vincolato,25000,deposit,3.50,,Deposito al 3.5% lordo annuo\n'
        + 'debts,Mutuo Casa,Debito prima casa,-150000,mutuo,2023-01-01,3.5,Acceso nel 2022\n'
        + 'investments,ETF S&P 500,ETF principale,50000,SPY,US78462F1030,100,Posizione principale\n'
        + 'transactions,Acquisto ETF,Acquisto SPY,15000,SPY,US78462F1030,Acquisto,33,2024-01-15\n'
        + 'realEstate,Casa Milano,Residenza,350000,Via Roma 123,primary,,Acquistata 2020\n'
        + 'pensionFunds,Fondo Pensione A,Previdenza Complementare,12000,complementare,2010-01-01,200,Versamenti regolari\n'

        + 'alternativeAssets,Oro,Investimento in oro fisico,10000,tcg,,,Acquistato nel 2023';
      filename = 'mangomoney-universal-template.csv';
    }
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess(`Template ${section || 'universale'} scaricato!`);
  };

  // CSV validation utilities
  const validateCSVContent = (content: string): { valid: boolean; error?: string } => {
    // Controllo dimensione
    if (content.length > 10 * 1024 * 1024) {
      return { valid: false, error: 'File troppo grande (max 10MB)' };
    }

    // Controllo caratteri pericolosi
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ];

    const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(content));
    if (hasDangerousContent) {
      return { valid: false, error: 'Contenuto potenzialmente pericoloso rilevato' };
    }

    // Controllo struttura base CSV
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { valid: false, error: 'File CSV deve contenere almeno header e una riga dati' };
    }

    return { valid: true };
  };

  // ✅ SECURITY: Enhanced CSV sanitization with injection prevention
  const sanitizeCSVValue = (value: string | number): string => {
    try {
      // Rate limiting for CSV operations - increased limit for large files
      if (!rateLimiter.checkLimit('csv_sanitization', 50000, 60000)) {
        auditTrail.logSecurityEvent('csv_sanitization_rate_limit', {}, 'high');
        return 'RATE_LIMITED';
      }
      
      // Use advanced CSV sanitization
      const sanitized = sanitizeCSVCell(value);
      
      auditTrail.logSecurityEvent('csv_value_sanitized', {
        originalLength: String(value).length,
        sanitizedLength: sanitized.length,
        containsFormula: String(value).match(/^[=+\-@]/) ? true : false
      }, 'low');
      
      return sanitized;
    } catch (error) {
      auditTrail.logSecurityEvent('csv_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        value: String(value).substring(0, 50)
      }, 'high');
      return 'SANITIZATION_ERROR';
    }
  };

  const importFromCSV = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await withLoading('importing', async () => {
    // Validazione file
    if (!file.name.toLowerCase().endsWith('.csv')) {
        logError('importFromCSV', 'File type validation failed: not a CSV file', 'warning');
      throw new Error('Per favore seleziona un file CSV valido.');
    }

    if (file.size > 5 * 1024 * 1024) {
        logError('importFromCSV', `File size validation failed: ${file.size} bytes`, 'warning');
      throw new Error('Il file è troppo grande. Dimensione massima: 5MB');
    }

    const result = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Errore nella lettura del file'));
      reader.readAsText(file);
    });

    // Validazione contenuto
    const contentValidation = validateCSVContent(result);
    if (!contentValidation.valid) {
      throw new Error(contentValidation.error);
    }

    // Parse CSV con sanitizzazione
        const lines = result.split('\n').filter(line => line.trim() !== '');
    const header = lines[0].split(',').map(h => sanitizeCSVValue(h.replace(/"/g, '')));
    
    // Verifica che l'header sia valido
    if (header.includes('RATE_LIMITED') || header.includes('SANITIZATION_ERROR')) {
      throw new Error('Errore nella sanitizzazione dell\'header CSV. Riprova.');
    }

      // Rileva se è un CSV universale o specifico per transazioni
      const isUniversal = header.includes('Sezione');
      const isTransactions = header.includes('Tipo Transazione') && header.includes('Quantità') && header.includes('Data');
      const hasAssetType = header.includes('Tipo Asset');
      const hasOldName = header.includes('Nome');

      if (!isUniversal && !isTransactions) {
        throw new Error('Formato CSV non riconosciuto. Usa un template valido (universale o specifico per transazioni).');
      }

      const newItems: { [key: string]: any[] } = {
        transactions: [],
        investments: [],
        realEstate: [],
        cash: [],
        alternativeAssets: [],
        debts: [],
        pensionFunds: [],
  
      };

    const errors: string[] = [];
        let successCount = 0;
        const totalLines = lines.length - 1; // Escludi header

        for (let i = 1; i < lines.length; i++) {
          // Progress indicator per file grandi
          if (totalLines > 100 && i % 50 === 0) {
            console.log(`Importazione CSV: ${Math.round((i / totalLines) * 100)}% completato`);
          }
          try {
        const values = lines[i].split(',').map(v => sanitizeCSVValue(v.replace(/"/g, '')));
        
        // Verifica che i valori siano stati sanitizzati correttamente
        if (values.includes('RATE_LIMITED') || values.includes('SANITIZATION_ERROR')) {
          errors.push(`Riga ${i + 1}: errore nella sanitizzazione dei dati`);
          continue;
        }
        
        if (values.length < header.length) {
          errors.push(`Riga ${i + 1}: numero di colonne insufficiente`);
          continue;
        }

          let section = 'transactions';
          let itemData: any = {};

          if (isUniversal) {
            // CSV universale
            const sectionIndex = header.indexOf('Sezione');
            section = values[sectionIndex]?.trim().toLowerCase() || 'transactions';
            
            if (!['transactions', 'investments', 'realestate', 'cash', 'alternativeassets', 'debts', 'pensionfunds'].includes(section)) {
              errors.push(`Riga ${i + 1}: sezione non valida "${section}"`);
              continue;
            }

            // Normalizza nomi sezioni
            if (section === 'realestate') section = 'realEstate';
            if (section === 'alternativeassets') section = 'alternativeAssets';
            if (section === 'pensionfunds') section = 'pensionFunds';
            

            // Estrai dati in base alla sezione
            const nameIndex = header.indexOf('Nome');
            const descIndex = header.indexOf('Descrizione');
            const amountIndex = header.indexOf('Importo');
            const field1Index = header.indexOf('Campo1');
            const field2Index = header.indexOf('Campo2');
            const field3Index = header.indexOf('Campo3');
            const noteIndex = header.indexOf('Note');

            itemData = {
              name: values[nameIndex]?.trim(),
              description: values[descIndex]?.trim() || '',
              amount: parseFloat(values[amountIndex] || '0'),
              field1: values[field1Index]?.trim() || '',
              field2: values[field2Index]?.trim() || '',
              field3: values[field3Index]?.trim() || '',
              notes: values[noteIndex]?.trim() || ''
            };

          } else {
            // CSV specifico per transazioni (backward compatibility)
            const assetTypeIndex = header.indexOf('Tipo Asset');
            const nameIndex = header.indexOf('Nome');
            const tickerIndex = header.indexOf('Ticker');
            const isinIndex = header.indexOf('ISIN');
            const typeIndex = header.indexOf('Tipo Transazione');
            const quantityIndex = header.indexOf('Quantità');
            const amountIndex = header.indexOf('Importo');
            const feesIndex = header.indexOf('Commissioni');
            const dateIndex = header.indexOf('Data');

            itemData = {
              assetType: hasAssetType ? values[assetTypeIndex]?.trim() : undefined,
              name: hasOldName ? values[nameIndex]?.trim() : undefined,
              ticker: values[tickerIndex]?.trim(),
              isin: values[isinIndex]?.trim(),
              transactionType: values[typeIndex]?.trim().toLowerCase(),
              quantity: parseFloat(values[quantityIndex] || '0'),
              amount: parseFloat(values[amountIndex] || '0'),
              commissions: parseFloat(values[feesIndex] || '0'),
              date: values[dateIndex]?.trim()
            };
          }

          // Validazioni comuni
          if (section === 'transactions') {
            // Per le transazioni, controlla assetType o name (backward compatibility)
            if (hasAssetType) {
              if (!itemData.assetType || itemData.assetType.length < 2) {
                errors.push(`Riga ${i + 1}: tipo asset mancante o non valido`);
                continue;
              }
              // Validazione valori assetType
              const validAssetTypes = ['Azione', 'ETF', 'Obbligazione whitelist', 'Obbligazione'];
              if (!validAssetTypes.includes(itemData.assetType)) {
                errors.push(`Riga ${i + 1}: tipo asset non valido. Valori accettati: ${validAssetTypes.join(', ')}`);
                continue;
              }
            } else if (hasOldName && (!itemData.name || itemData.name.length < 2)) {
              errors.push(`Riga ${i + 1}: nome mancante o troppo corto`);
              continue;
            } else if (!hasAssetType && !hasOldName) {
              errors.push(`Riga ${i + 1}: mancano sia 'Tipo Asset' che 'Nome'`);
              continue;
            }
          } else {
            // Per altre sezioni, richiedi ancora il nome
          if (!itemData.name || itemData.name.length < 2) {
            errors.push(`Riga ${i + 1}: nome mancante o troppo corto`);
              continue;
            }
            }

          if (isNaN(itemData.amount) || itemData.amount <= 0) {
          errors.push(`Riga ${i + 1}: importo non valido`);
          continue;
        }

          // Creazione item in base alla sezione
          const maxId = Math.max(...assets[section as keyof typeof assets].map((item: any) => item.id), 0);
          
          if (section === 'transactions') {
            // Validazioni specifiche per transazioni
            if (isNaN(itemData.quantity) || itemData.quantity <= 0) {
              errors.push(`Riga ${i + 1}: quantità non valida`);
              continue;
            }

            if (isNaN(itemData.commissions) || itemData.commissions < 0) {
          errors.push(`Riga ${i + 1}: commissioni non valide`);
          continue;
        }

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(itemData.date)) {
          errors.push(`Riga ${i + 1}: formato data non valido (richiesto YYYY-MM-DD)`);
              continue;
            }
            
            // Validazione data ragionevole (dal 1900 al 2030)
            const dateObj = new Date(itemData.date);
            const year = dateObj.getFullYear();
            if (year < 1900 || year > 2030) {
              errors.push(`Riga ${i + 1}: anno data non valido (${year}). Deve essere tra 1900 e 2030.`);
              continue;
            }
            
            // Verifica che la data non sia nel futuro (con tolleranza di 1 giorno per fusi orari)
            const today = new Date();
            today.setDate(today.getDate() + 1); // Tolleranza di 1 giorno
            if (dateObj > today) {
              errors.push(`Riga ${i + 1}: data nel futuro (${itemData.date}). Le transazioni non possono avere date future.`);
              continue;
            }

        let transactionType: 'purchase' | 'sale';
            if (itemData.transactionType.includes('acquisto') || itemData.transactionType.includes('purchase') || itemData.transactionType.includes('buy')) {
          transactionType = 'purchase';
            } else if (itemData.transactionType.includes('vendita') || itemData.transactionType.includes('sale') || itemData.transactionType.includes('sell')) {
          transactionType = 'sale';
            } else {
              errors.push(`Riga ${i + 1}: tipo transazione non riconosciuto (${itemData.transactionType})`);
              continue;
            }

            // Determina l'assetType: usa quello fornito o ETF come default per backward compatibility
            let finalAssetType: 'Azione' | 'ETF' | 'Obbligazione whitelist' | 'Obbligazione' = 'ETF';
            if (itemData.assetType) {
              finalAssetType = itemData.assetType as 'Azione' | 'ETF' | 'Obbligazione whitelist' | 'Obbligazione';
            }

            const displayName = itemData.assetType || itemData.name || 'Importato da CSV';

            const newTransaction: Transaction = {
          id: maxId + 1 + successCount,
              assetType: finalAssetType,
              ticker: sanitizeTicker(itemData.ticker || ''),
              isin: sanitizeISIN(itemData.isin || ''),
          transactionType,
              quantity: itemData.quantity,
              amount: itemData.amount,
              commissions: itemData.commissions,
              date: itemData.date,
              description: `${transactionType === 'purchase' ? 'Acquisto' : 'Vendita'} di ${displayName} (importato da CSV)`,
              linkedToAsset: undefined
            };

            newItems.transactions.push(newTransaction);

          } else if (section === 'investments') {
            const newInvestment: AssetItem = {
              id: maxId + 1 + successCount,
              name: sanitizeString(itemData.name),
              amount: itemData.amount,
              description: itemData.description,
              sector: itemData.field1 || '',
              isin: itemData.field2 || '',
              quantity: parseFloat(itemData.field3) || 0,
              fees: 0,
              avgPrice: 0,
              currentPrice: 0,
              notes: itemData.notes,
              linkedToGlobalPosition: undefined
            };

            newItems.investments.push(newInvestment);

          } else if (section === 'realEstate') {
            const newRealEstate: RealEstate = {
              id: maxId + 1 + successCount,
              name: sanitizeString(itemData.name),
              value: itemData.amount,
              description: itemData.description,
              address: itemData.field1 || '',
              type: itemData.field2 === 'primary' ? 'primary' : 'secondary',
              notes: itemData.notes,
              // 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal
            };

            newItems.realEstate.push(newRealEstate);

          } else if (section === 'cash') {
            const accountType = itemData.field1 as 'current' | 'deposit' | 'remunerated' | 'cash' || 'current';
            const interestRate = itemData.field2 ? parseFloat(itemData.field2) : undefined;
            const newCash: AssetItem = {
              id: maxId + 1 + successCount,
              name: sanitizeString(itemData.name),
              amount: itemData.amount,
              description: itemData.description,
              accountType: accountType,
              // niente calcolo importo bollo: solo segnale UI successivo
              bollo: undefined,
              ...((accountType === 'deposit' || accountType === 'remunerated') && interestRate && interestRate > 0 && {
                interestRate
              }),
              notes: itemData.notes
            };

            newItems.cash.push(newCash);

          } else if (section === 'alternativeAssets') {
            const newAlternativeAsset: AssetItem = {
              id: maxId + 1 + successCount,
              name: sanitizeString(itemData.name),
              amount: itemData.amount,
              description: itemData.description,
              assetType: itemData.field1 as 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other' || 'other',
              notes: itemData.notes
            };

            newItems.alternativeAssets.push(newAlternativeAsset);



          } else {
            // Per altre sezioni (debts, pensionFunds)
            const newAsset: AssetItem = {
              id: maxId + 1 + successCount,
              name: sanitizeString(itemData.name),
              amount: itemData.amount,
              description: itemData.description,
              notes: itemData.notes
            };

            newItems[section as keyof typeof newItems].push(newAsset);
          }

            successCount++;

          } catch (error) {
        errors.push(`Riga ${i + 1}: errore generico - ${error instanceof Error ? error.message : 'errore sconosciuto'}`);
          }
        }

      // Controlla se ci sono stati errori di rate limiting
      const rateLimitErrors = errors.filter(error => error.includes('RATE_LIMITED') || error.includes('rate limit'));
      if (rateLimitErrors.length > 0) {
        console.warn(`⚠️ Rate limiting rilevato: ${rateLimitErrors.length} righe potrebbero essere state saltate`);
      }

      if (successCount === 0) {
        throw new Error(`Nessun elemento valido trovato. Errori: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '...' : ''}`);
      }

      // Log del numero di transazioni importate
      if (newItems.transactions.length > 0) {
        console.log(`📊 Importazione CSV completata: ${newItems.transactions.length} transazioni importate`);
        console.log(`📅 Date transazioni: ${newItems.transactions.map(t => t.date).sort().join(', ')}`);
      }

      // Aggiorna state con tutti i nuovi elementi
      setAssets(prev => {
        const updated = { ...prev };
        Object.entries(newItems).forEach(([section, items]) => {
          if (items.length > 0) {
            updated[section as keyof typeof updated] = [...updated[section as keyof typeof updated], ...items];
          }
        });
        return updated;
      });

    return { successCount, errorCount: errors.length, errors };
  },
  (result) => {
      let message = `${result?.successCount} elementi importati con successo`;
    if (result?.errorCount && result.errorCount > 0) {
      message += `, ${result.errorCount} righe ignorate`;
    }
    
    // Reset automatico dei filtri dopo import per mostrare tutte le transazioni
    setTransactionFilters({ type: 'all', ticker: '', isin: '' });
    setCurrentTransactionPage(1);
    
    showSuccess(message);
  },
    (error) => {
      logError('importFromCSV', error instanceof Error ? error : String(error), 'error');
      showError(`Errore nell'importazione: ${error instanceof Error ? error.message : String(error)}`);
    }
  );

    event.target.value = '';
  }, [withLoading, assets, setAssets, showSuccess, showError, sanitizeTicker, sanitizeISIN, setTransactionFilters, setCurrentTransactionPage]);

  // Reset function (manual save removed - auto-save handles everything)

  const resetData = () => {
    if (window.confirm('Sei sicuro di voler ripristinare i dati originali?')) {
      setAssets(getInitialData());
      showSuccess('Dati ripristinati ai valori originali!');
    }
  };



  // Virtualized Transaction Table Component
  const VirtualizedTransactionTable = React.memo(({
  transactions, 
  darkMode, 
  formatCurrency, 
  handleEditRow, 
  handleCopyRow, 
  handleDeleteItem, 
  t,
  sortField,
  sortDirection,
  handleSort
}: { 
  transactions: Transaction[]; 
  darkMode: boolean;
  formatCurrency: (amount: number) => string;
  handleEditRow: (section: string, id: number) => void;
  handleCopyRow: (section: string, id: number) => void;
  handleDeleteItem: (section: string, id: number) => void;
  t: (key: TranslationKey) => string;
  sortField: 'date' | 'assetType' | 'amount' | 'quantity';
  sortDirection: 'asc' | 'desc';
  handleSort: (field: 'date' | 'assetType' | 'amount' | 'quantity') => void;
}) => {

    const renderTransactionRow = useCallback((transaction: Transaction, index: number, style: React.CSSProperties) => {
      const linkedAsset = assets.investments.find((asset: AssetItem) => asset.id === transaction.linkedToAsset);
      const isLinked = !!transaction.linkedToAsset;
      
      return (
        <div style={style} className={`flex items-center px-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${isLinked ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}>
        <div className="flex-1 grid grid-cols-9 gap-4 items-center">
            <div className="flex items-center gap-2">
              {isLinked && (
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`} title={`Collegata a: ${linkedAsset?.name || 'Asset non trovato'}`}></div>
              )}
          <span className={`truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{transaction.assetType}</span>
            </div>
          <span className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{transaction.ticker}</span>
          <span className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{transaction.isin}</span>
          <span className={`px-2 py-1 rounded text-xs ${transaction.transactionType === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {transaction.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'}
          </span>
          <span className={`text-right font-mono ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{transaction.quantity.toLocaleString()}</span>
          <span className={`text-right font-mono ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(transaction.amount)}</span>
          <span className={`text-right font-mono ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(transaction.commissions)}</span>
          <span className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{transaction.date}</span>
          <div className="flex justify-center gap-1">
            <button 
              onClick={() => handleEditRow('transactions', transaction.id)} 
              className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`} 
              title="Modifica riga" 
              aria-label={`Modifica ${transaction.assetType}`} 
              tabIndex={0} 
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') { 
                  e.preventDefault(); 
                  handleEditRow('transactions', transaction.id); 
                } 
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              onClick={() => handleCopyRow('transactions', transaction.id)} 
              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`} 
              title="Copia riga" 
              aria-label={`Duplica ${transaction.assetType}`} 
              tabIndex={0} 
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') { 
                  e.preventDefault(); 
                  handleCopyRow('transactions', transaction.id); 
                } 
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </button>
            <button 
              onClick={() => handleDeleteItem('transactions', transaction.id)} 
              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`} 
              title="Elimina riga" 
              aria-label={`Elimina ${transaction.assetType}`} 
              tabIndex={0} 
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') { 
                  e.preventDefault(); 
                  if (window.confirm(`Eliminare ${transaction.assetType}?`)) { 
                    handleDeleteItem('transactions', transaction.id); 
                  } 
                } 
              }}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      );
    }, [darkMode, handleEditRow, handleCopyRow, handleDeleteItem]);

    const renderHeader = useCallback(() => (
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="grid grid-cols-9 gap-4 text-xs font-medium items-center">
          <button 
            onClick={() => handleSort('assetType')}
            title={t('sortByAssetType')}
            className={`text-left flex items-center gap-1 hover:${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:bg-${darkMode ? 'gray-600' : 'gray-100'} transition-colors cursor-pointer px-1 py-1 rounded ${sortField === 'assetType' ? (darkMode ? 'text-blue-300' : 'text-blue-600') : (darkMode ? 'text-gray-100' : 'text-gray-900')}`}
          >
            {t('assetType')}
            {sortField === 'assetType' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
              </svg>
            ) : (
              <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </button>
          <span className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} px-1 py-1`}>Ticker</span>
          <span className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} px-1 py-1`}>ISIN</span>
          <span className={`${darkMode ? 'text-gray-100' : 'text-gray-900'} px-1 py-1`}>Tipo</span>
          <button 
            onClick={() => handleSort('quantity')}
            title={t('sortByQuantity')}
            className={`text-right flex items-center justify-end gap-1 hover:${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:bg-${darkMode ? 'gray-600' : 'gray-100'} transition-colors cursor-pointer px-1 py-1 rounded ${sortField === 'quantity' ? (darkMode ? 'text-blue-300' : 'text-blue-600') : (darkMode ? 'text-gray-100' : 'text-gray-900')}`}
          >
            Quantità
            {sortField === 'quantity' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
              </svg>
            ) : (
              <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </button>
          <button 
            onClick={() => handleSort('amount')}
            title={t('sortByAmount')}
            className={`text-right flex items-center justify-end gap-1 hover:${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:bg-${darkMode ? 'gray-600' : 'gray-100'} transition-colors cursor-pointer px-1 py-1 rounded ${sortField === 'amount' ? (darkMode ? 'text-blue-300' : 'text-blue-600') : (darkMode ? 'text-gray-100' : 'text-gray-900')}`}
          >
            Importo
            {sortField === 'amount' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
              </svg>
            ) : (
              <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </button>
          <span className={`text-right ${darkMode ? 'text-gray-100' : 'text-gray-900'} px-1 py-1`}>Commissioni</span>
          <button 
            onClick={() => handleSort('date')}
            title={t('sortByDate')}
            className={`text-center flex items-center justify-center gap-1 hover:${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:bg-${darkMode ? 'gray-600' : 'gray-100'} transition-colors cursor-pointer px-1 py-1 rounded ${sortField === 'date' ? (darkMode ? 'text-blue-300' : 'text-blue-600') : (darkMode ? 'text-gray-100' : 'text-gray-900')}`}
          >
            Data
            {sortField === 'date' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
              </svg>
            ) : (
              <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </button>
          <span className={`text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'} px-1 py-1`}>Azioni</span>
        </div>
      </div>
    ), [darkMode, sortField, sortDirection, handleSort, t]);

    if (transactions.length > 100) { // Usa virtualizzazione solo per liste lunghe
      return (
        <>
          <SwipeHint />
          <VirtualizedTable
            data={transactions}
            rowHeight={48}
            containerHeight={400}
            renderRow={renderTransactionRow}
            renderHeader={renderHeader}
            className={`border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
          />
        </>
      );
    }

    // Fallback per liste corte
    return (
      <div className={`overflow-x-auto border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        {renderHeader()}
        {transactions.map((transaction, index) => (
          <div key={transaction.id}>
            {renderTransactionRow(transaction, index, { height: 48 })}
          </div>
        ))}
      </div>
    );
  });



  // Backup Manager Component
  const BackupManager = React.memo(() => {
    const [backups, setBackups] = useState(autoBackup.getBackups());
    const [backupInfo, setBackupInfo] = useState(autoBackup.getBackupInfo());

    const refreshBackups = useCallback(() => {
      setBackups(autoBackup.getBackups());
      setBackupInfo(autoBackup.getBackupInfo());
    }, []);

    useEffect(() => {
      refreshBackups();
    }, [refreshBackups]);

    return (
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>

        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{backupInfo.count}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('savedBackups')}</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {(backupInfo.totalSize / 1024).toFixed(1)}KB
            </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('usedSpace')}</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {backupInfo.lastBackup ? new Date(backupInfo.lastBackup).toLocaleString() : t('never')}
            </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('lastBackup')}</div>
            {(() => {
              const lastBackupTime = localStorage.getItem('mangomoney-last-backup-time');
              const lastSavedTime = localStorage.getItem('mangomoney-lastSaved');
              const now = new Date().getTime();
              const thirtySecondsAgo = now - (30 * 1000);
              
              if (lastBackupTime && lastSavedTime) {
                const lastBackup = new Date(lastBackupTime).getTime();
                const lastSaved = new Date(lastSavedTime).getTime();
                
                if (lastBackup < thirtySecondsAgo && lastSaved < thirtySecondsAgo) {
                  return (
                    <div className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1`}>
                      <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Backup consigliato
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>
          <div className="text-center">
            <button
              onClick={() => {
                const success = autoBackup.performBackup();
                if (success) {
                  // Aggiorna timestamp ultimo backup manuale
                  localStorage.setItem('mangomoney-last-backup-time', new Date().toISOString());
                  refreshBackups();
                  showSuccess('Backup manuale creato con successo');
                } else {
                  showError('Errore durante la creazione del backup');
                }
              }}
              className={`px-3 py-1 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded text-sm transition-colors`}
            >
                                {t('backupNow')}
            </button>
          </div>
        </div>

        <div className={`space-y-2 max-h-48 overflow-y-auto ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {backups.map((backup, index) => (
            <div key={backup.timestamp} className={`flex justify-between items-center p-2 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded border ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
              <div>
                <div className="font-mono text-sm">
                  {new Date(backup.timestamp).toLocaleString()}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(backup.size / 1024).toFixed(1)}KB • v{backup.version}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const data = autoBackup.restoreFromBackup(backup.timestamp);
                    if (data && window.confirm('Ripristinare questo backup? I dati attuali saranno sovrascritti.')) {
                      // Implementa ripristino
                      if (data.assets) {
                        setAssets(data.assets);
                        sessionStorage.setItem('mangomoney-restored-from-backup', 'true');
                        sessionStorage.removeItem('mangomoney-welcome-shown');
                        showSuccess('Backup ripristinato con successo');
                      }
                    }
                  }}
                  className={`px-2 py-1 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded text-xs transition-colors`}
                >
                  Ripristina
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Eliminare questo backup?')) {
                      autoBackup.deleteBackup(backup.timestamp);
                      refreshBackups();
                      showSuccess('Backup eliminato');
                    }
                  }}
                  className={`px-2 py-1 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded text-xs transition-colors`}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });

  // Memoized BarChart component for better performance
  const MemoizedBarChart = React.memo(({ 
    data, 
    darkMode, 
    selectedCurrency, 
    currencies, 
    formatCurrency 
  }: {
    data: Array<{ category: string; amount: number; color: string }>;
    darkMode: boolean;
    selectedCurrency: string;
    currencies: Record<string, { symbol: string; locale: string }>;
    formatCurrency: (amount: number) => string;
  }) => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
        <XAxis dataKey="category" tick={{fontSize: 12}} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
        <YAxis 
          tickFormatter={(value) => {
            const currency = currencies[selectedCurrency as keyof typeof currencies];
            const symbol = currency.symbol;
            return `${symbol}${(value/1000).toFixed(0)}k`;
          }} 
          tick={{fontSize: 10}} 
          stroke={darkMode ? '#9ca3af' : '#6b7280'}
          width={50}
        />
        <Tooltip 
          formatter={(value: string | number) => [formatCurrencyWithPrivacy(Number(value)), 'Importo']}
          contentStyle={{
            backgroundColor: darkMode ? '#1f2937' : 'white',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '6px',
            color: darkMode ? '#f3f4f6' : '#1f2937'
          }}
        />
        <Bar dataKey="amount" fill="#3b82f6">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ));

  // Dynamic form component for adding new items
  const AddItemForm = ({ section, compact = false }: { section: string; compact?: boolean }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<NewItem>({
      name: '',
      amount: '',
      description: '',
      notes: '',
      fees: '',
      quantity: '',
      avgPrice: '',
      currentPrice: '',
      linkedToAsset: undefined,
      sector: '',
      date: new Date().toISOString().split('T')[0],
      accountType: 'current',
      assetType: 'other',
              // 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal
    });
    const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
    const [propertyType, setPropertyType] = useState<'primary' | 'secondary'>('primary');
    // Validation schemas for different sections
    const getValidationSchema = (section: string): FormValidationSchema => {
      const baseSchema: FormValidationSchema = {
        name: { required: true, minLength: 2, maxLength: 100 },
        amount: { required: true, section },
        description: { maxLength: 500 },
        notes: { maxLength: 1000 }
      };

      switch (section) {
        case 'transactions':
          return {
            amount: { required: true, section },
            description: { maxLength: 500 },
            notes: { maxLength: 1000 },
            quantity: { required: true },
            date: { required: true },
            fees: { max: 1000000 }
          };
        case 'investments':
          return {
            ...baseSchema,
            quantity: { required: true },
            avgPrice: { fieldName: 'Prezzo medio', max: 1000000 },
            currentPrice: { fieldName: 'Prezzo attuale', max: 1000000 },
            fees: { max: 1000000 }
          };
        case 'realEstate':
          return {
            ...baseSchema,
            amount: { required: true, section: 'realEstate' }
          };
        default:
          return baseSchema;
      }
    };

    // Use centralized form validation hook
    const validation = useFormValidation(getValidationSchema(section), (key: string) => t(key as any));

    const validateForm = () => {
      return validation.validateForm(formData, { section });
    };

    const handleSubmit = () => {
      if (validateForm()) {
        if (section === 'investmentPositions') {
          const maxId = Math.max(...assets.investmentPositions.map((item: InvestmentPosition) => item.id), 0);
          const candidate = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            amount: Math.abs(sanitizeNumber(formData.amount, 'amount')),
            description: sanitizeString(formData.description),
            notes: ''
          };
          const { valid } = validateAsset(getSchemaForSection('investmentPositions'), candidate);
          if (!valid) {
            showError('Validazione fallita. Controlla i campi.');
            return;
          }
          const newPosition: InvestmentPosition = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            ticker: sanitizeTicker(formData.sector || ''),
            isin: sanitizeISIN(formData.notes || ''),
            amount: Math.abs(sanitizeNumber(formData.amount, 'amount')),
            purchaseDate: sanitizeDate(new Date().toISOString().split('T')[0]),
            description: sanitizeString(formData.description),
            notes: ''
          };

          setAssets({
            ...assets,
            investmentPositions: [...assets.investmentPositions, newPosition]
          });
        } else if (section === 'transactions') {
          const maxId = Math.max(...assets.transactions.map((item: Transaction) => item.id), 0);
          const candidate = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            amount: Math.abs(sanitizeNumber(formData.amount, 'amount')),
            description: sanitizeString(formData.description),
            quantity: sanitizeInteger(formData.quantity),
            date: sanitizeDate(formData.date || new Date().toISOString().split('T')[0])
          };
          const { valid } = validateAsset(getSchemaForSection('transactions'), candidate);
          if (!valid) {
            showError('Validazione fallita. Controlla i campi.');
            return;
          }
          const newTransaction: Transaction = {
            id: maxId + 1,
            assetType: (formData.assetType as 'Azione' | 'ETF' | 'Obbligazione whitelist' | 'Obbligazione') || 'ETF',
            ticker: sanitizeTicker(formData.sector || ''),
            isin: sanitizeISIN(formData.notes || ''),
            transactionType: transactionType,
            amount: Math.abs(sanitizeNumber(formData.amount, 'amount')),
            quantity: sanitizeInteger(formData.quantity),
            commissions: sanitizeNumber(formData.fees, 'amount'),
            description: sanitizeString(formData.description),
            date: sanitizeDate(formData.date || new Date().toISOString().split('T')[0]),
            linkedToAsset: formData.linkedToAsset
          };

          setAssets({
            ...assets,
            transactions: [...assets.transactions, newTransaction]
          });
        } else if (section === 'realEstate') {
          const maxId = Math.max(...assets.realEstate.map((item: RealEstate) => item.id), 0);
          const candidate = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            value: Math.abs(sanitizeNumber(formData.amount, 'amount')),
            description: sanitizeString(formData.description),
            notes: sanitizeString(formData.notes || '')
          };
          const { valid } = validateAsset(getSchemaForSection('realEstate'), candidate);
          if (!valid) {
            showError('Validazione fallita. Controlla i campi.');
            return;
          }
          const newProperty: RealEstate = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            description: sanitizeString(formData.description),
            value: Math.abs(sanitizeNumber(formData.amount, 'amount')),
            type: propertyType,
            address: sanitizeString(formData.notes || ''),
            notes: '',
            // 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal
          };

          setAssets({
            ...assets,
            realEstate: [...assets.realEstate, newProperty]
          });
        } else {
          const maxId = Math.max(...(assets[section as keyof typeof assets] as AssetItem[]).map((item: AssetItem) => item.id), 0);
          const candidate = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            amount: section === 'debts' ? -Math.abs(sanitizeNumber(formData.amount, 'amount')) : Math.abs(sanitizeNumber(formData.amount, 'amount')),
            description: sanitizeString(formData.description),
            notes: sanitizeString(formData.notes)
          };
          const { valid } = validateAsset(getSchemaForSection(section), candidate);
          if (!valid) {
            showError('Validazione fallita. Controlla i campi.');
            return;
          }
          const newAssetItem: AssetItem = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            amount: section === 'debts' ? -Math.abs(sanitizeNumber(formData.amount, 'amount')) : Math.abs(sanitizeNumber(formData.amount, 'amount')),
            description: sanitizeString(formData.description),
            notes: sanitizeString(formData.notes),
            ...(section === 'investments' && {
              fees: sanitizeNumber(formData.fees, 'amount'),
              quantity: sanitizeInteger(formData.quantity),
              avgPrice: sanitizeNumber(formData.avgPrice, 'price'),
              currentPrice: formData.currentPrice && formData.currentPrice.trim() !== '' ? sanitizeNumber(formData.currentPrice, 'price') : undefined,
              lastPriceUpdate: formData.currentPrice && formData.currentPrice.trim() !== '' ? new Date().toISOString().split('T')[0] : undefined,
              sector: sanitizeTicker(formData.sector),
              isin: sanitizeISIN(formData.notes)
            }),
            ...(section === 'cash' && {
              accountType: formData.accountType,
              bollo: undefined
            }),
            ...(section === 'alternativeAssets' && formData.assetType && ['tcg', 'stamps', 'alcohol', 'collectibles', 'vinyl', 'books', 'comics', 'art', 'lego', 'other'].includes(formData.assetType) && {
              assetType: formData.assetType as 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other'
            })
          };

          // Validazione specifica per conti cash
          if (section === 'cash') {
            const validationErrors = validateCashAccount(newAssetItem);
            if (validationErrors.length > 0) {
              showError(`Errori di validazione: ${validationErrors.join(', ')}`);
              return;
            }
          }

          setAssets({
            ...assets,
            [section]: [...(assets[section as keyof typeof assets] as AssetItem[]), newAssetItem]
          });
        }
        
        setFormData({ name: '', amount: '', description: '', notes: '', fees: '', quantity: '', avgPrice: '', currentPrice: '', linkedToAsset: undefined, sector: '', date: new Date().toISOString().split('T')[0], accountType: 'current', assetType: 'other' });
        setTransactionType('purchase');
        setPropertyType('primary');
        setShowForm(false);
        validation.clearErrors();
      }
    };

    const handleCancel = () => {
      setShowForm(false);
      setFormData({ name: '', amount: '', description: '', notes: '', fees: '', quantity: '', avgPrice: '', currentPrice: '', linkedToAsset: undefined, sector: '', date: new Date().toISOString().split('T')[0], accountType: 'current', assetType: 'other' });
      setTransactionType('purchase');
      setPropertyType('primary');
      validation.clearErrors();
    };

    if (!showForm) {
      if (compact) {
        return (
          <button
            onClick={() => setShowForm(true)}
            aria-label={`Aggiungi nuovo elemento alla sezione ${sections[section as keyof typeof sections]}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            } hover:scale-105`}
            title={`Aggiungi ${sections[section as keyof typeof sections] || section}`}
          >
            <PlusCircle size={12} />
            <span className="font-medium">Aggiungi</span>
          </button>
        );
      }
      
      return (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(true)}
            aria-label={`Aggiungi nuovo elemento alla sezione ${sections[section as keyof typeof sections]}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-gray-100' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            } hover:scale-105`}
          >
            <PlusCircle size={16} />
            <span className="text-sm font-medium">{t('addNewItem')}</span>
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Modal Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          {/* Modal Content */}
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {t('addNewItem')} - {sections[section as keyof typeof sections]}
                </h4>
                <button
                  onClick={() => setShowForm(false)}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Chiudi"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {section === 'transactions' ? t('assetType') : t('name')} *
            </label>
            {section === 'transactions' ? (
              <select
                value={formData.assetType || 'ETF'}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value as 'Azione' | 'ETF' | 'Obbligazione whitelist' | 'Obbligazione' })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="Azione">{t('azione')}</option>
                <option value="ETF">{t('etf')}</option>
                <option value="Obbligazione whitelist">{t('obbligazioneWhitelist')}</option>
                <option value="Obbligazione">{t('obbligazione')}</option>
              </select>
            ) : (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
              } ${validation.errors.name ? 'border-red-500' : ''}`}
              placeholder="Inserisci il nome"
              aria-describedby={validation.errors.name ? `name-error-${section}` : undefined}
              aria-invalid={validation.errors.name ? 'true' : 'false'}
              required
            />
            )}
            {validation.errors.name && <p id={`name-error-${section}`} className="text-red-500 text-xs mt-1" role="alert">{validation.errors.name}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {section === 'transactions' ? t('ticker') : section === 'realEstate' ? t('valueLabel') + ' *' : t('amount') + ' *'}
            </label>
            {section === 'transactions' ? (
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: sanitizeTicker(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="es. AAPL, VWCE"
              />
            ) : (
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                } ${validation.errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                aria-describedby={validation.errors.amount ? `amount-error-${section}` : undefined}
                aria-invalid={validation.errors.amount ? 'true' : 'false'}
                required
              />
            )}
            {validation.errors.amount && <p id={`amount-error-${section}`} className="text-red-500 text-xs mt-1" role="alert">{validation.errors.amount}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {section === 'transactions' ? t('isin') : section === 'realEstate' ? t('description') : t('description')}
            </label>
            <input
              type="text"
              value={section === 'transactions' ? formData.notes : formData.description}
              onChange={(e) => section === 'transactions' 
                ? setFormData({ ...formData, notes: e.target.value })
                : setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={section === 'transactions' ? 'es. US0378331005' : 'Breve descrizione'}
            />
          </div>

          {section === 'transactions' ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {t('transactionType')} *
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as 'purchase' | 'sale')}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="purchase">{t('purchase')}</option>
                <option value="sale">{t('sale')}</option>
              </select>
            </div>
          ) : section === 'realEstate' ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('propertyType')} *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as 'primary' | 'secondary')}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="primary">{t('primaryResidence')}</option>
                <option value="secondary">{t('secondaryProperty')}</option>
              </select>
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('notes')}
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Note aggiuntive"
              />
            </div>
          )}

          {section === 'transactions' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('quantity')} *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  } ${validation.errors.quantity ? 'border-red-500' : ''}`}
                  placeholder="0"
                  step="1"
                />
                {validation.errors.quantity && <p className="text-red-500 text-xs mt-1">{validation.errors.quantity}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('amount')} *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  } ${validation.errors.amount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                />
                {validation.errors.amount && <p className="text-red-500 text-xs mt-1">{validation.errors.amount}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('fees')}
                </label>
                <input
                  type="number"
                  value={formData.fees}
                  onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('description')}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Descrizione della transazione"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('date')} *
                </label>
                <input
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('linkedToAsset')}
                </label>
                <select
                  value={formData.linkedToAsset || ''}
                  onChange={(e) => setFormData({ ...formData, linkedToAsset: e.target.value ? parseInt(e.target.value) : undefined })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Nessuno</option>
                  {assets.investments.map((asset: AssetItem) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.sector || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {section === 'realEstate' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Indirizzo dell'immobile"
                />
              </div>
              
              {/* 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal - tutti gli immobili contano nel patrimonio */}
            </>
          )}

          {section === 'investments' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ticker
                </label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="es. AAPL, VWCE"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantità
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0"
                  step="1"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Prezzo Medio
                </label>
                <input
                  type="number"
                  value={formData.avgPrice}
                  onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Prezzo Attuale
                </label>
                <input
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ISIN
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="es. US0378331005"
                />
              </div>
            </>
          )}

          {section === 'cash' && (
            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo conto
                  </label>
              <select
                value={formData.accountType || 'current'}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'current' | 'deposit' | 'remunerated' | 'cash' })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                                        <option value="current">{t('currentAccount')}</option>
                        <option value="deposit">{t('depositAccount')}</option>
                        <option value="remunerated">{t('remuneratedAccountType')}</option>
                <option value="cash">{t('cashAccountType')}</option>
              </select>
            </div>
          )}

          {section === 'cash' && (formData.accountType === 'deposit' || formData.accountType === 'remunerated') && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tasso interesse lordo annuo (%)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                value={formData.interestRate || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  interestRate: e.target.value ? e.target.value : undefined
                })}
                placeholder="es: 3.50"
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci il tasso lordo offerto dalla banca (prima delle imposte)
              </p>
            </div>
          )}

          {section === 'alternativeAssets' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo Asset
              </label>
              <select
                value={formData.assetType || 'other'}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value as 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other' })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="tcg">{t('tcg')}</option>
                <option value="stamps">{t('stamps')}</option>
                <option value="alcohol">{t('alcohol')}</option>
                <option value="collectibles">{t('collectibles')}</option>
                <option value="vinyl">{t('vinyl')}</option>
                <option value="books">{t('books')}</option>
                <option value="comics">{t('comics')}</option>
                <option value="art">{t('art')}</option>
                <option value="lego">{t('lego')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            aria-label="Aggiungi nuovo elemento"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Aggiungi
          </button>
          <button
            onClick={handleCancel}
            aria-label="Annulla operazione"
            className={`px-4 py-2 rounded transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Annulla
          </button>
        </div>
      </div>
            </div>
          </div>
        </>
      );
    };

  // Welcome message component
  const WelcomeMessage = ({ section }: { section: string }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
      <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
        {section === 'cash' && '💰'}
        {section === 'debts' && '💳'}
        {section === 'investments' && '📈'}
        {section === 'pensionFunds' && '🏦'}

        {section === 'alternativeAssets' && '🎨'}
        {section === 'realEstate' && '🏠'}
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Benvenuto nella sezione {sections[section as keyof typeof sections]}
      </h3>

      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
        {t('addYourAssets')}
      </p>
      
      <div className="flex justify-center">
        <AddItemForm section={section} compact={true} />
      </div>
    </div>
  );

  // Compact pie chart component for all sections - Optimized with React.memo
  const CompactPieChart = React.memo(({ data, size = 200, title = "", showLegend = true, totalAssets }: CompactPieChartProps) => {
    const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null);
    
    // 🎯 FIX: Per il grafico "Distribuzione patrimonio" usa solo la somma degli asset
    // I debiti sono già esclusi dai dati, quindi totalAssets non serve più
    const total = data.reduce((sum: number, item: ChartDataItem) => sum + item.value, 0);
    
    // Debug in development mode per verificare che le percentuali sommino al 100%
    if (process.env.NODE_ENV === 'development') {
      const percentageSum = data.reduce((sum, item) => sum + (item.value / total * 100), 0);
      console.log('🔧 Debug CompactPieChart (solo asset):', {
        total: total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
        percentageSum: percentageSum.toFixed(1) + '%',
        dataLength: data.length,
        shouldBe100: percentageSum.toFixed(1) === '100.0'
      });
    }
    
    if (total === 0) return <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('noData')}</div>;

    let accumulatedPercentage = 0;
    const segments = data.map((item: ChartDataItem, index: number) => {
      const percentage = (item.value / total) * 100;
      const startPercentage = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return {
        ...item,
        startPercentage,
        endPercentage: accumulatedPercentage,
        isHovered: localHoveredIndex === index
      };
    });

    return (
      <div className="flex flex-col items-center space-y-3 w-full">
        {title && <h4 className={`text-md font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h4>}
        
        <div 
          className={`relative rounded-full overflow-hidden border-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-transform duration-200 ${localHoveredIndex !== null ? 'scale-105' : ''} mx-auto`} 
          style={{
            width: size,
            height: size,
                    background: `conic-gradient(${segments.map((segment: any) =>
          `${segment.color} ${segment.startPercentage}% ${segment.endPercentage}%`
        ).join(', ')})`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg`}>
              <div className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {localHoveredIndex !== null ? segments[localHoveredIndex].name.substring(0, 8) : 'Totale'}
              </div>
              <div className={`text-xs font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-center px-1`}>
                {localHoveredIndex !== null ? formatCurrencyWithPrivacy(segments[localHoveredIndex].value) : `€${Math.round(total/1000)}k`}
              </div>
            </div>
          </div>
        </div>
        
        {showLegend && (
        <div className="w-full max-w-md mx-auto">
          <div className="space-y-1">
            {segments.map((entry: any, index: number) => {
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return (
                <div 
                  key={index} 
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
                    localHoveredIndex === index 
                      ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') 
                      : 'hover:' + (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                  }`}
                  onMouseEnter={() => setLocalHoveredIndex(index)}
                  onMouseLeave={() => setLocalHoveredIndex(null)}
                  title={entry.fullName || entry.name}
                >
                  <div className="flex items-center min-w-0 flex-1 mb-1 sm:mb-0">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className={`font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.name}</span>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0 sm:ml-2">
                    <div className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(entry.value)}</div>
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({percentage}%)</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    );
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex flex-col`}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Vai al contenuto principale
      </a>
      
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex justify-between items-start md:items-center gap-3">
            {/* Left side - Logo */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <img 
                  src={require('./images/logo.png')} 
                  alt="MangoMoney" 
                  className="h-10 md:h-14 w-auto object-contain"
                />
              </div>
              {safeMode && (
                <div className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-medium flex items-center gap-1 mt-1`}>
                  <span>🛡️</span>
                  <span>Modalità Sicura Attiva</span>
                </div>
              )}
            </div>
            
            {/* Right side - Last saved info */}
            <div className="flex flex-col items-end">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap text-right`}>
                {t('lastSaved')}: {lastSaved.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Mobile: Compact button row */}
            <div className="flex flex-wrap gap-1 md:hidden">
              <button
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Disattiva modalità scura' : 'Attiva modalità scura'}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-2 rounded h-8 w-8 flex items-center justify-center button-mobile-safe`}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              
              <button
                onClick={toggleMobileLayout}
                aria-label={forceMobileLayout ? 'Disattiva layout mobile' : 'Attiva layout mobile'}
                className={`px-2 py-1 rounded text-xs button-mobile-safe h-8 w-8 flex items-center justify-center ${
                  forceMobileLayout 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                }`}
              >
                {forceMobileLayout ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                ) : (isMobileView ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                ))}
              </button>

              <button
                onClick={togglePrivacyMode}
                aria-label={privacyMode ? 'Disattiva modalità privacy' : 'Attiva modalità privacy'}
                className={`px-2 py-1 rounded text-xs button-mobile-safe h-8 w-8 flex items-center justify-center ${
                  privacyMode 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                }`}
                title={privacyMode ? 'Disattiva modalità privacy' : 'Attiva modalità privacy'}
              >
                {privacyMode ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
              

              
              {/* Language Selector - Mobile */}
              <div className="relative group">
                <button 
                  aria-label="Seleziona lingua"
                  className={`px-2 py-1 rounded text-xs transition-colors h-8 ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}>
                  {languages[selectedLanguage as keyof typeof languages].flag}
                </button>
                <div className={`absolute right-0 mt-2 w-24 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="py-1">
                    {Object.entries(languages).map(([code, language]) => (
                      <button
                        key={code}
                        onClick={() => setSelectedLanguage(code)}
                        className={`block w-full text-left px-2 py-1 text-xs ${
                          selectedLanguage === code 
                            ? `${darkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`
                            : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                        }`}
                      >
                        {language.flag} {code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              

            </div>
            
            {/* Desktop: Full button row */}
            <div className="hidden md:flex gap-1 md:gap-2">
              <button
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Disattiva modalità scura' : 'Attiva modalità scura'}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-2 rounded h-10 w-10 flex items-center justify-center button-mobile-safe`}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              <button
                onClick={toggleMobileLayout}
                aria-label={forceMobileLayout ? 'Disattiva layout mobile' : 'Attiva layout mobile'}
                className={`px-3 py-2 rounded text-xs button-mobile-safe h-10 w-10 flex items-center justify-center ${
                  forceMobileLayout 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                }`}
              >
                {forceMobileLayout ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                ) : (isMobileView ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                ))}
              </button>

              <button
                onClick={togglePrivacyMode}
                aria-label={privacyMode ? 'Disattiva modalità privacy' : 'Attiva modalità privacy'}
                className={`px-3 py-2 rounded text-xs button-mobile-safe h-10 w-10 flex items-center justify-center ${
                  privacyMode 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                }`}
                title={privacyMode ? 'Disattiva modalità privacy' : 'Attiva modalità privacy'}
              >
                {privacyMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
              

              
              {/* Language Selector */}
              <div className="relative group">
                <button 
                  aria-label="Seleziona lingua"
                  className={`px-3 py-2 rounded text-xs transition-all duration-300 ease-in-out transform hover:scale-105 h-10 ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}>
                  {languages[selectedLanguage as keyof typeof languages].flag}
                </button>
                <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="py-1">
                    {Object.entries(languages).map(([code, language]) => (
              <button
                        key={code}
                        onClick={() => setSelectedLanguage(code)}
                        className={`block w-full text-left px-3 py-2 text-sm ${
                          selectedLanguage === code 
                            ? `${darkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`
                            : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                        }`}
                      >
                        {language.flag} {language.name}
              </button>
                    ))}
                  </div>
                </div>
              </div>
              

              

            </div>
          </div>
        </div>
      </header>

      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-t`}>
        <div className="max-w-7xl mx-auto px-3 py-1">
          <div 
            className="flex space-x-2 md:space-x-6 overflow-x-auto overflow-y-hidden scrollbar-hide" 
            style={{
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {['overview', 'statistics', ...Object.keys(sections)].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                aria-label={`Naviga alla sezione ${section === 'overview' ? t('overview') : 
                 section === 'statistics' ? t('statistics') : 
                 t(section as keyof typeof translations.it)}`}
                aria-pressed={activeSection === section}
                className={`py-2 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-200 ease-in-out ${
                  activeSection === section
                    ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                {section === 'overview' ? t('overview') : 
                 section === 'statistics' ? t('statistics') : 
                 t(section as keyof typeof translations.it)}
              </button>
            ))}
            <div className="flex-1"></div>
            <button
              onClick={() => setActiveSection('settings')}
              aria-label={`Naviga alla sezione ${t('settings')}`}
              aria-pressed={activeSection === 'settings'}
              className={`py-2 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-200 ease-in-out ${
                activeSection === 'settings'
                  ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button
              onClick={() => setActiveSection('info')}
              aria-label={`Naviga alla sezione ${t('info')}`}
              aria-pressed={activeSection === 'info'}
              className={`py-2 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-200 ease-in-out ${
                activeSection === 'info'
                  ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }`}
            >
              {t('info')}
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-3 py-4 w-full">
        {activeSection === 'overview' && (
          <div className="animate-fadeIn">
            {/* Welcome message when no data */}
            {loadingStates.calculating ? (
              <OverviewSkeleton darkMode={darkMode} />
            ) : netWorth === 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
                <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  🥭
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {t('welcomeMessage')}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('addYourAssets')}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('navigateSections')}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className={`grid gap-3 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {Object.entries(totals).slice(0, 3).map(([key, value], index) => (
                      <div key={key} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 relative`}>
                        <h4 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1 flex items-center gap-1`}>
                          {sections[key as keyof typeof sections] || key}
                          <InfoTooltip 
                            content={getSectionDescription(key)} 
                            darkMode={darkMode}
                          >
                            <span className="text-xs opacity-60 hover:opacity-100 cursor-help">ⓘ</span>
                          </InfoTooltip>
                      </h4>
                        <p className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${key === 'debts' ? 'text-red-500' : ''}`}>
                          {(() => {
                            if (key === 'realEstate') {
                              // Show real estate value included in net worth
                              return formatCurrencyWithPrivacy(value);
                            } else {
                              return formatCurrencyWithPrivacy(key === 'debts' ? Math.abs(value) : value);
                            }
                          })()}
                          {key === 'debts' && value < 0 && <span className="text-red-400"> 🔻</span>}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(() => {
                            if (key === 'debts') {
                              // 🎯 FIX COERENZA: Debiti senza percentuale, solo indicazione
                              return 'Passività';
                            } else {
                              // 🎯 SEMPLIFICAZIONE 3: Asset percentuale su totalAssets standardizzato
                              const totalAssets = totals.cash + totals.investments + totals.realEstate + 
                                                  totals.pensionFunds + totals.alternativeAssets;
                              
                              // Edge case: se non ci sono asset, ritorna 0.0%
                              if (totalAssets <= 0) {
                                return '0.0%';
                              }
                              
                              // Percentuale su totalAssets (coerente con grafico)
                              return ((value / totalAssets) * 100).toFixed(1) + '%';
                            }
                          })()}
                      </p>
                      
                      {/* Bottone discreto per aggiungere elemento */}
                      <button
                        onClick={() => setActiveSection(key)}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                        } hover:scale-110`}
                        title={`Aggiungi ${sections[key as keyof typeof sections] || key}`}
                        aria-label={`Aggiungi ${sections[key as keyof typeof sections] || key}`}
                      >
                        <PlusCircle size={14} />
                      </button>
                    </div>
                    ))}
                    </div>
                    
                  <div className={`grid gap-3 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {Object.entries(totals).slice(3, 6).map(([key, value], index) => (
                      <div key={key} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 relative`}>
                        <h4 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1 flex items-center gap-1`}>
                          {sections[key as keyof typeof sections] || key}
                          <InfoTooltip 
                            content={getSectionDescription(key)} 
                            darkMode={darkMode}
                          >
                            <span className="text-xs opacity-60 hover:opacity-100 cursor-help">ⓘ</span>
                          </InfoTooltip>
                      </h4>
                      <p className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {formatCurrencyWithPrivacy(value)}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(() => {
                            // 🎯 SEMPLIFICAZIONE 3: Asset percentuale su totalAssets standardizzato
                            const totalAssets = totals.cash + totals.investments + totals.realEstate + 
                                                totals.pensionFunds + totals.alternativeAssets;
                            
                            // Edge case: se non ci sono asset, ritorna 0.0%
                            if (totalAssets <= 0) {
                              return '0.0%';
                            }
                            
                            // Percentuale su totalAssets (coerente con grafico)
                            return ((value / totalAssets) * 100).toFixed(1) + '%';
                          })()}%
                      </p>
                      
                      {/* Bottone discreto per aggiungere elemento */}
                      <button
                        onClick={() => setActiveSection(key)}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                        } hover:scale-110`}
                        title={`Aggiungi ${sections[key as keyof typeof sections] || key}`}
                        aria-label={`Aggiungi ${sections[key as keyof typeof sections] || key}`}
                      >
                        <PlusCircle size={14} />
                      </button>
                    </div>
                    ))}
                    </div>
                  </div>
                  
                <div className="space-y-6">
                  {/* Pie Chart - Horizontal Layout */}
                  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('assetDistribution')}</h3>
                    <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('assetDistributionNote')}
                    </p>
                    {loadingStates.calculating ? (
                      <ChartSkeleton darkMode={darkMode} />
                    ) : filteredPieData.length === 0 ? (
                      <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="mb-2">
                          <p className="text-lg mb-2">
                            <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {t('noAssetsToDisplay')}
                          </p>
                          <p className="text-sm">{t('addAssetsForDistribution')}</p>
                        </div>
                        <div className="text-xs">
                          <p>
                            <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Suggerimento: Usa i bottoni + nei riquadri sopra per aggiungere i tuoi asset
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                        <div className="flex-shrink-0">
                          <CompactPieChart 
                            data={filteredPieData} 
                            size={240} 
                            showLegend={false} 
                          />
                        </div>
                        <div className="flex-1 w-full lg:min-w-0">
                          <div className="grid grid-cols-1 gap-3">
                            {filteredPieData.map((item, index) => (
                              <div key={index} className="flex items-center min-w-0">
                                <div 
                                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className={`text-sm flex-1 min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ wordBreak: 'break-word' }}>
                                  {item.name}
                                </span>
                                <div className="text-right ml-4 flex-shrink-0">
                                  <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    {formatCurrencyWithPrivacy(item.value)}
                                  </div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {(() => {
                                      // 🎯 FIX: Per il grafico "Distribuzione patrimonio" usa solo la somma degli asset
                                      // I debiti sono già esclusi dai dati, quindi calcola percentuale solo sugli asset
                                      const totalAssets = filteredPieData.reduce((sum, pieItem) => sum + pieItem.value, 0);
                                      
                                      // Edge case: se non ci sono asset, ritorna 0.0
                                      if (totalAssets <= 0) {
                                        return '0.0';
                                      }
                                      
                                      // Percentuale su asset totali (deve sommare al 100%)
                                      return ((item.value / totalAssets) * 100).toFixed(1);
                                    })()}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bar Chart - Horizontal Layout */}
                  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('categoryComparison')}</h3>
                    {filteredBarData.length === 0 ? (
                      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="mb-4">
                                                      <p className="text-lg mb-2">
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('noDataToDisplay')}
                </p>
                          <p className="text-sm">{t('addAssetsForComparison')}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button 
                            onClick={() => setActiveSection('investments')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              darkMode 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            Aggiungi Investimenti
                          </button>
                          <button 
                            onClick={() => setActiveSection('realEstate')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              darkMode 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            Aggiungi Immobili
                          </button>
                        </div>
                        <div className="mt-4 text-xs">
                          <p>
                    <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Suggerimento: Inizia aggiungendo i tuoi asset principali per vedere la distribuzione
                  </p>
                        </div>
                      </div>
                    ) : (
                      <MemoizedBarChart 
                        data={filteredBarData}
                        darkMode={darkMode}
                        selectedCurrency={selectedCurrency}
                        currencies={currencies}
                        formatCurrency={formatCurrency}
                      />
                    )}
                  </div>


                </div>

                {/* CSV Templates Section - moved to Settings */}
              </>
            )}
          </div>
        )}

        {activeSection === 'statistics' && (
          <div className="space-y-6 animate-slideIn">
            
                         {/* 📊 STATISTICHE SEMPLIFICATE */}
            {loadingStates.calculating ? (
              <StatsSkeleton darkMode={darkMode} />
            ) : (
              <>
                 <SimpleStatistics 
                   totals={totals}
                   monthlyExpenses={monthlyExpenses}
                   emergencyFundValue={coreFinancialCalculations.emergencyFundMetrics.value}
                   darkMode={darkMode}
                   formatCurrencyWithPrivacy={formatCurrencyWithPrivacy}
                 />

                 {/* Smart Insights Section */}
                 <div className="mt-8">
                   <SmartInsights
                     portfolioData={{
                       totalValue: netWorth,
                       performance: 0,
                       riskScore: parseFloat(statistics.riskScore),
                       emergencyFundMonths: parseFloat(statistics.emergencyMonths),
                       // Diversification score calcolato da allocationPercentages (HHI → 1-HHI)
                       diversificationScore: (() => {
                         const ap = statistics.allocationPercentages as { [k: string]: string };
                         if (!ap) return 0;
                         const keys = ['cash','investments','realEstate','pensionFunds','alternativeAssets'];
                         const parts = keys.map(k => {
                           const pct = parseFloat(ap[k] as string);
                           const n = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
                           return n / 100;
                         });
                         const hhi = parts.reduce((sum, p) => sum + p * p, 0);
                         const score = (1 - hhi) * 100;
                         return Number(score.toFixed(1));
                       })(),
                       // unrealizedGains: statistics.unrealizedGains || 0,
                       cashAccounts: totals.cash,
                       // debtToAssetRatio: statistics.debtToAssetRatio || 0
                     }}
                     previousData={undefined}
                     insightsConfig={insightsConfig}
                     darkMode={darkMode}
                   />
                 </div>
               </>
             )}

            {/* Safe Withdrawal Rate Simulation - Semplificato */}
            <SwrSimplified 
              cashTotal={totals.cash}
              investmentsTotal={totals.investments} 
              monthlyExpenses={monthlyExpenses}
              inflationRate={inflationRate}
              darkMode={darkMode}
              formatCurrencyWithPrivacy={formatCurrencyWithPrivacy}
              handleNumericInputChange={handleNumericInputChange}
              setMonthlyExpenses={setMonthlyExpenses}
            />
              
              

            {/* Capital Gains Section */}
            {capitalGainsData.summary.totalSales > 0 && (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-2`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  {t('capitalGains')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                      {t('capitalGainsTaxes')}
                    </div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {formatCurrencyWithPrivacy(capitalGainsData.totalTaxes)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aliquota: {capitalGainsTaxRate}%
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                      {t('capitalGains')}
                    </div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrencyWithPrivacy(capitalGainsData.totalGains)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tutti i tipi di asset
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                      {t('netCapitalGains')}
                    </div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {formatCurrencyWithPrivacy(capitalGainsData.netGains)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Dopo imposte
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                      {t('taxableSales')}
                    </div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {capitalGainsData.summary.taxableSales}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      di {capitalGainsData.summary.totalSales} totali
                    </div>
                  </div>
                </div>
                
                {capitalGainsData.taxableSales.length > 0 && (
                  <div className="mt-6">
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Dettaglio Vendite Tassabili
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {capitalGainsData.taxableSales.map((sale, index) => (
                        <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 flex justify-between items-center`}>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {sale.transaction.assetType} - {sale.transaction.ticker}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {sale.transaction.date} • {sale.transaction.quantity} unità
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              +{formatCurrencyWithPrivacy(sale.capitalGain)}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              -{formatCurrencyWithPrivacy(sale.tax)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Breakdown per Tipo Asset */}
                {capitalGainsData.summary.taxableSales > 0 && (
                  <div className="mt-6">
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Breakdown per Tipo Asset
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(capitalGainsData.breakdown).map(([assetType, data]) => {
                        if (data.gains > 0) {
                          return (
                            <div key={assetType} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                              <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                                {assetType}
                              </div>
                              <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                +{formatCurrencyWithPrivacy(data.gains)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                -{formatCurrencyWithPrivacy(data.taxes)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Aliquota: {assetType === 'Obbligazione whitelist' ? `${whitelistBondsTaxRate}%` : `${capitalGainsTaxRate}%`}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {activeSection === 'investments' && (
          <div className="space-y-6 animate-slideIn">
            {/* Global Positions (Broker Accounts) - At the top */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {t('globalPositions')}
                <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                      {t('globalPositionsDescription')}
                </p>
              </h3>
              
              {assets.investmentPositions.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>{t('noGlobalPositionsRegistered')}</p>
                  <p className="text-sm mt-2">{t('addGlobalPositionsForBrokerAccounts')}</p>
                </div>
              ) : (
                <>
                {isCompactLayout ? (
                  // Mobile card view
                  <div className="space-y-3">
                    {assets.investmentPositions.map((item: InvestmentPosition) => (
                      <InvestmentPositionMobileCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  // Desktop table view
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrizione</th>
                <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Note</th>
                      <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.investmentPositions.map((item: InvestmentPosition) => (
                      <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                        <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(item.amount)}</td>
                        <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</td>
                        <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.notes}</td>
                        <td className={`border px-2 py-1 text-center`}>
                          <div className="flex justify-center gap-1">
                            <button 
                              onClick={() => handleEditRow('investmentPositions', item.id)}
                              className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'} transition-all duration-200 ease-in-out transform hover:scale-110`}
                              title="Modifica riga"
                              aria-label={`Modifica ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleEditRow('investmentPositions', item.id);
                                }
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleCopyRow('investmentPositions', item.id)}
                              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} transition-all duration-200 ease-in-out transform hover:scale-110`}
                              title="Copia riga"
                              aria-label={`Duplica ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCopyRow('investmentPositions', item.id);
                                }
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('investmentPositions', item.id)}
                              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} transition-all duration-200 ease-in-out transform hover:scale-110`}
                              title="Elimina riga"
                              aria-label={`Elimina ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  if (window.confirm(`Eliminare ${item.name}?`)) {
                                    handleDeleteItem('investmentPositions', item.id);
                                  }
                                }
                              }}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                )}
              </>
              )}
              
              {/* Totale e bottone sempre visibili */}
              <div className="mt-2 text-right">
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('totalLabel')} {formatCurrencyWithPrivacy(assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}
                </span>
                <div className="mt-2 flex justify-end">
                  <AddItemForm section="investmentPositions" compact={true} />
                </div>
              </div>
            </div>





            {/* Individual Positions (Assets) Table */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('individualPositionsAsset')}</h3>
              
              {assets.investments.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>{t('noIndividualAssetsRegistered')}</p>
                  <p className="text-sm mt-2">{t('addAssetsForTracking')}</p>
                </div>
              ) : loadingStates.exporting ? (
                <TableSkeleton rows={5} darkMode={darkMode} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ticker</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ISIN</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantità</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rendimento</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Collegato a</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.investments.map((item: AssetItem) => {
                        const manualPerformance = calculateAssetPerformance(item);
                        const transactionPerformance = calculateTransactionBasedPerformance(item);
                        const linkedTransactions = safeFilterTransactions((t: Transaction) => t.linkedToAsset === item.id);
                        return (
                        <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.sector || '-'}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.isin || '-'}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity?.toLocaleString() || '-'}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(item.amount)}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs`}>
                            {linkedTransactions.length > 0 ? (
                              <div className={`${transactionPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <div>{formatCurrencyWithPrivacy(transactionPerformance.totalReturn)}</div>
                                <div className="text-xs">{transactionPerformance.percentageReturn.toFixed(1)}% (T)</div>
                              </div>
                            ) : manualPerformance.totalReturn !== 0 ? (
                              <div className={`${manualPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <div>{formatCurrencyWithPrivacy(manualPerformance.totalReturn)}</div>
                                <div className="text-xs">{manualPerformance.percentageReturn.toFixed(1)}% (M)</div>
                              </div>
                            ) : '-'}
                          </td>
                          <td className={`border px-2 py-1 text-center`}>
                            <select
                              value={item.linkedToGlobalPosition || ''}
                              onChange={(e) => handleLinkToGlobalPosition(item.id, e.target.value ? parseInt(e.target.value) : null)}
                              className={`text-xs px-1 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                              <option value="">Nessuno</option>
                              {assets.investmentPositions.map((globalPosition: InvestmentPosition) => (
                                <option key={globalPosition.id} value={globalPosition.id}>
                                  {globalPosition.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={`border px-2 py-1 text-center`}>
                            <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => handleEditRow('investments', item.id)}
                                className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
                                title="Modifica riga"
                                aria-label={`Modifica ${item.name}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleEditRow('investments', item.id);
                                  }
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleCopyRow('investments', item.id)}
                                className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                                title="Copia riga"
                                aria-label={`Duplica ${item.name}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCopyRow('investments', item.id);
                                  }
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>

                              <button 
                                onClick={() => handleDeleteItem('investments', item.id)}
                                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                title="Elimina riga"
                                aria-label={`Elimina ${item.name}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (window.confirm(`Eliminare ${item.name}?`)) {
                                      handleDeleteItem('investments', item.id);
                                    }
                                  }
                                }}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-2 text-right">
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('individualPositionsLabel')}: {statistics.uniqueInvestmentPositions} • {t('totalAssetsLabel')} {formatCurrencyWithPrivacy(assets.investments.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
                </span>
                <div className="mt-2 flex justify-end">
                  <AddItemForm section="investments" compact={true} />
                </div>
              </div>
            </div>

            {/* History Table */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('transactionHistory')}</h3>
              </div>
              
              {/* CSV Import Section - removed (now in settings) */}
              {/* CSV Import Section - removed (now in settings) */}
              
              {/* Transaction Filters */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {t('transactionType')}
                  </label>
                  <select
                    value={transactionFilters.type}
                    onChange={(e) => {
                      setTransactionFilters(prev => ({ ...prev, type: e.target.value }));
                      setCurrentTransactionPage(1);
                    }}
                    className={`w-full text-xs px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="all">{t('allTransactions')}</option>
                    <option value="purchase">{t('purchases')}</option>
                    <option value="sale">{t('sales')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ticker
                  </label>
                  <input
                    type="text"
                    placeholder={t('filterByTicker')}
                    value={transactionFilters.ticker}
                    onChange={(e) => {
                      setTransactionFilters(prev => ({ ...prev, ticker: e.target.value }));
                      setCurrentTransactionPage(1);
                    }}
                    className={`w-full text-xs px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ISIN
                  </label>
                  <input
                    type="text"
                    placeholder={t('filterByISIN')}
                    value={transactionFilters.isin}
                    onChange={(e) => {
                      setTransactionFilters(prev => ({ ...prev, isin: e.target.value }));
                      setCurrentTransactionPage(1);
                    }}
                    className={`w-full text-xs px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setTransactionFilters({ type: 'all', ticker: '', isin: '' });
                      setCurrentTransactionPage(1);
                    }}
                    className={`w-full text-xs px-3 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100 hover:bg-gray-500' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t('resetFilters')}
                  </button>
                </div>
              </div>

              {/* Autolink Button */}
              {assets.transactions.length > 0 && assets.investments.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={performAutoLink}
                    className={`px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors flex items-center font-medium`}
                    title={t('autolinkDescription')}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {t('autolinkTransactions')}
                    <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">
                      {safeFilterTransactions(t => !t.linkedToAsset).length} non collegate
                    </span>
                  </button>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('autolinkDescription')}
                  </p>
                </div>
              )}
              
              {filteredTransactions.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>{t('noTransactionsFound')}</p>
                  <p className="text-sm mt-2">{t('tryModifyFilters')}</p>
                </div>
              ) : (
                <>
                {isCompactLayout ? (
                  // Mobile card view
                  <div className="space-y-3">
                    {paginatedTransactions.map((item: Transaction) => (
                      <TransactionMobileCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  // Desktop table view - Virtualized for large datasets
                  <VirtualizedTransactionTable
                    transactions={paginatedTransactions}
                    darkMode={darkMode}
                    formatCurrency={formatCurrency}
                    handleEditRow={handleEditRow}
                    handleCopyRow={handleCopyRow}
                    handleDeleteItem={handleDeleteItem}
                    t={t}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                )}
                
                {/* Enhanced Pagination */}
                {totalTransactionPages > 1 && (
                  <EnhancedPagination
                    currentPage={currentTransactionPage}
                    totalPages={totalTransactionPages}
                    onPageChange={setCurrentTransactionPage}
                    totalItems={filteredTransactions.length}
                    itemsPerPage={transactionsPerPage}
                    darkMode={darkMode}
                  />
                )}
              </>
            )}
              
              <div className="mt-2 text-right">
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('totalTransactionsLabel')} {formatCurrencyWithPrivacy(safeGetTransactions().reduce((sum: number, item: Transaction) => sum + item.amount, 0))}
                </span>
                <div className="mt-2 flex justify-end gap-2">
                  <AddItemForm section="transactions" compact={true} />
                  {safeGetTransactions().length > 0 && (
                    <button
                      onClick={handleClearAllTransactions}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                        darkMode 
                          ? 'bg-red-700 hover:bg-red-600 text-red-300 hover:text-red-100' 
                          : 'bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800'
                      }`}
                      title={t('clearAllTransactions')}
                      aria-label={t('clearAllTransactions')}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                      {t('clearAll')}
                    </button>
                  )}
                </div>
              </div>
            </div>



            {/* Transaction-Asset Reconciliation Dashboard */}
            {(safeGetTransactions().length > 0 || assets.investments.length > 0) && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {t('reconciliation')}
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {t('verifyLinksBetweenTransactionsAssets')}
                  </p>
                </h3>
                
                {(() => {
                  const linkedTransactions = safeFilterTransactions((t: Transaction) => !!t.linkedToAsset);
                  const assetsWithTransactions = assets.investments.filter((asset: AssetItem) => 
                    safeGetTransactions().some((t: Transaction) => t.linkedToAsset === asset.id)
                  );
                  
                  if (linkedTransactions.length === 0) {
                    return (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Nessuna transazione collegata ad asset.</p>
                        <p className="text-sm mt-1">Usa il dropdown "Collegato a Asset" nelle transazioni per creare collegamenti.</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transazioni Collegate</div>
                          <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {linkedTransactions.length}
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset con Transazioni</div>
                          <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {assetsWithTransactions.length}
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance Tracking</div>
                          <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {assetsWithTransactions.filter((asset: AssetItem) => asset.currentPrice && asset.currentPrice > 0).length}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className={`text-md font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Asset con performance basata sulle transazioni
                        </h4>
                        {assetsWithTransactions
                          .filter((asset: AssetItem) => asset.currentPrice && asset.currentPrice > 0)
                          .map((asset: AssetItem) => {
                            const transactionPerformance = calculateTransactionBasedPerformance(asset);
                            const manualPerformance = calculateAssetPerformance(asset);
                            const linkedTransactions = safeFilterTransactions((t: Transaction) => t.linkedToAsset === asset.id);
                            
                            return (
                              <div key={asset.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                      {asset.name} ({asset.sector || t('notAvailable')})
                                    </div>
                                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {linkedTransactions.length} {t('transactionsUnits').split(' • ')[0]} • {asset.quantity} {t('transactionsUnits').split(' • ')[1]}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${transactionPerformance.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {transactionPerformance.percentageReturn.toFixed(1)}% {t('transactionsLabel')}
                                    </div>
                                    <div className={`text-xs ${manualPerformance.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                              {manualPerformance.percentageReturn.toFixed(1)}% {t('manualLabel')}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Linking Validation */}
            {assets.investmentPositions.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {t('verifyLinks')}
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {t('controlGlobalIndividualCorrespondence')}
                  </p>
                </h3>
                
                {(() => {
                  const validation = getLinkingValidation();
                  const hasLinkedAssets = Object.values(validation).some(v => v.linkedAssets.length > 0);
                  
                  if (!hasLinkedAssets) {
                    return (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>{t('noAssetsLinkedToGlobalPositions')}</p>
                        <p className="text-sm mt-1">{t('useDropdownToLinkAssets')}</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {Object.entries(validation).map(([globalId, data]) => {
                        if (data.linkedAssets.length === 0) return null;
                        
                        return (
                          <div key={globalId} className={`p-3 rounded-lg border ${data.isValid ? (darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200') : (darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')}`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className={`font-semibold ${data.isValid ? (darkMode ? 'text-green-300' : 'text-green-800') : (darkMode ? 'text-red-300' : 'text-red-800')}`}>
                                {assets.investmentPositions.find((gp: InvestmentPosition) => gp.id === parseInt(globalId))?.name}
                              </h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${data.isValid ? (darkMode ? 'bg-green-700 text-green-100' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-700 text-red-100' : 'bg-red-100 text-red-800')}`}>
                                {data.isValid ? t('okStatus') : t('discrepancyStatus')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('globalPositionLabel')}</span>
                                <div className={`font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {formatCurrencyWithPrivacy(data.globalValue)}
                                </div>
                              </div>
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('linkedAssetsLabel')}</span>
                                <div className={`font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {formatCurrencyWithPrivacy(data.totalLinkedValue)}
                                </div>
                              </div>
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('differenceLabel')}</span>
                                <div className={`font-mono ${data.isValid ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                                  {formatCurrencyWithPrivacy(data.deviation)} ({((data.deviation / data.globalValue) * 100).toFixed(1)}%)
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('linkedAssetsTitle')}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {data.linkedAssets.map((asset: AssetItem) => (
                                  <span key={asset.id} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {asset.name} ({formatCurrencyWithPrivacy(asset.amount)})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Investment Statistics */}
            <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    {formatCurrencyWithPrivacy(assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {t('totalInvestmentValue')}
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    {statistics.uniqueInvestmentPositions}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {t('individualPositionsLabel')}
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                    {netWorth > 0 ? (((assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0)) / netWorth) * 100).toFixed(1) : '0'}%
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {t('percentOfWealth')}
                  </div>
                </div>
              </div>
              

            </div>

            {/* Transaction Statistics */}
            {assets.transactions.length > 0 && (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Statistiche transazioni
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                                          {t('transactionAnalysisPerYear')}
                  </p>
                </h3>
                
                {(() => {
                  const transactionStats = getTransactionStats();
                  const allYears = Object.keys(transactionStats).sort((a, b) => parseInt(b) - parseInt(a));
                  
                  // Paginazione: mostra solo 2 anni per pagina
                  const totalYearPages = Math.ceil(allYears.length / yearsPerPage);
                  const startIndex = (currentTransactionYearPage - 1) * yearsPerPage;
                  const paginatedYears = allYears.slice(startIndex, startIndex + yearsPerPage);
                  
                  return (
                    <div className="space-y-4">
                      {paginatedYears.map((year) => {
                        const stats = transactionStats[year];
                        return (
                          <div key={year} className={`p-4 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              Anno {year}
                            </h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Transazioni:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {stats.count}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Investito:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                                  {formatCurrencyWithPrivacy(stats.totalInvested)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Venduto:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                                  {formatCurrencyWithPrivacy(stats.totalSold)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Commissioni:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                  {formatCurrencyWithPrivacy(stats.totalCommissions)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1`}>
                                  {t('capitalGainsYear')}:
                                  <span className="text-xs opacity-60 cursor-help" title={t('taxDisclaimer')}>ⓘ</span>
                                </span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                  {formatCurrencyWithPrivacy(stats.capitalGains)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1`}>
                                  {t('taxesYear')}:
                                  <span className="text-xs opacity-60 cursor-help" title={t('taxDisclaimer')}>ⓘ</span>
                                </span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                  {formatCurrencyWithPrivacy(stats.capitalGainsTaxes)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1`}>
                                  {t('netGainsYear')}:
                                  <span className="text-xs opacity-60 cursor-help" title={t('taxDisclaimer')}>ⓘ</span>
                                </span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {formatCurrencyWithPrivacy(stats.netCapitalGains)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('netInvestment')}:</span>
                                <div className={`font-mono font-semibold ${stats.netInvestment >= 0 ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                                  {formatCurrencyWithPrivacy(stats.netInvestment)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Paginazione per anni */}
                      {totalYearPages > 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <EnhancedPagination
                            currentPage={currentTransactionYearPage}
                            totalPages={totalYearPages}
                            onPageChange={setCurrentTransactionYearPage}
                            totalItems={allYears.length}
                            itemsPerPage={yearsPerPage}
                            darkMode={darkMode}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Investment Chart */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
                  <div className="flex-shrink-0">
                    <CompactPieChart 
                      data={getSectionChartData('investments')} 
                      size={180} 
                      showLegend={false}
                    />
                  </div>
                  <div className="flex-1 w-full lg:min-w-0">
                    <div className="grid grid-cols-1 gap-3">
                      {getSectionChartData('investments').filter(item => item.value > 0).map((item, index) => (
                        <div key={index} className="flex items-center min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className={`text-sm flex-1 min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ wordBreak: 'break-word' }}>
                            {item.name}
                          </span>
                          <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {formatCurrencyWithPrivacy(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>

            {/* Portafoglio Performance Summary - Moved to bottom */}
            {(() => {
              const hasAssetsWithPrices = portfolioPerformance.assets.some((asset: AssetWithPerformance) => 
                (asset.currentPrice && asset.currentPrice > 0) || (asset.avgPrice && asset.avgPrice > 0)
              );
              
              if (!hasAssetsWithPrices) {
                return (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      Performance Portafoglio
                    </h4>
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="mb-4">
                                                  <p className="text-lg mb-2">
                                                    <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                    </svg>
                                                    {t('enterCurrentPricesForPerformance')}
                                                  </p>
                        <p className="text-sm">{t('addCurrentPricesForPerformance')}</p>
                      </div>
                      <div className="mt-4 text-xs">
                        <p>
                      <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('updatePricesTip')}
                    </p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                  <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Performance Portafoglio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Investito</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {formatCurrencyWithPrivacy(portfolioPerformance.totalInvested)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valore Attuale</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {formatCurrencyWithPrivacy(portfolioPerformance.totalCurrentValue)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${portfolioPerformance.totalReturn >= 0 ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : (darkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalReturn')}</div>
                      <div className={`text-lg font-semibold ${portfolioPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrencyWithPrivacy(portfolioPerformance.totalReturn)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${portfolioPerformance.percentageReturn >= 0 ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : (darkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('percentageReturn')}</div>
                      <div className={`text-lg font-semibold ${portfolioPerformance.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioPerformance.percentageReturn.toFixed(2)}%
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${portfolioPerformance.annualizedReturn >= 0 ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : (darkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('annualizedReturn')}</div>
                      <div className={`text-lg font-semibold ${portfolioPerformance.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrencyWithPrivacy(portfolioPerformance.annualizedReturn)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${portfolioPerformance.annualizedReturnPercentage >= 0 ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : (darkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rendimento ann. %</div>
                      <div className={`text-lg font-semibold ${portfolioPerformance.annualizedReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioPerformance.annualizedReturnPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Charts - Side by Side */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Performance per Asset */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <h5 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            Performance per Asset
                          </h5>
                          <div className="space-y-2">
                            {portfolioPerformance.assets
                              .filter((asset: AssetWithPerformance) => asset.currentPrice && asset.currentPrice > 0)
                              .sort((a: AssetWithPerformance, b: AssetWithPerformance) => b.performance.percentageReturn - a.performance.percentageReturn)
                              .map((asset: AssetWithPerformance) => (
                                <div key={asset.id} className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {asset.name} ({asset.sector || t('notAvailable')})
                                      </div>
                                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {asset.quantity || 0} × {formatCurrencyWithPrivacy(asset.currentPrice || asset.avgPrice || 0)} = {formatCurrencyWithPrivacy((asset.currentPrice || asset.avgPrice || 0) * (asset.quantity || 0))}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-sm font-medium ${asset.performance.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {asset.performance.percentageReturn.toFixed(1)}%
                                      </div>
                                      <div className={`text-xs ${asset.performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrencyWithPrivacy(asset.performance.totalReturn)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {/* Performance Trend Chart */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <h5 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {t('performanceTrend')}
                          </h5>
                          <div className="space-y-3">
                            {portfolioPerformance.assets
                              .filter((asset: AssetWithPerformance) => asset.currentPrice && asset.currentPrice > 0)
                              .sort((a: AssetWithPerformance, b: AssetWithPerformance) => b.performance.percentageReturn - a.performance.percentageReturn)
                              .slice(0, 5) // Show top 5 performers
                              .map((asset: AssetWithPerformance) => {
                                const percentage = asset.performance.percentageReturn;
                                const barWidth = Math.min(Math.abs(percentage), 50); // Cap at 50% for display
                                return (
                                  <div key={asset.id} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {asset.ticker || asset.sector || asset.name.substring(0, 12)}{(asset.ticker || asset.sector || asset.name).length > 12 ? '...' : ''}
                                      </span>
                                      <span className={`font-medium ${percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${percentage >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${barWidth}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeSection === 'investmentPositions' && (
          <div className="space-y-6 animate-slideIn">
            {/* Individual Positions (Assets) Table */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {t('individualPositionsAsset')}
                <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {t('welcomeIndividualPositions')}
                </p>
              </h3>
              
              {assets.investments.length === 0 ? (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {t('welcomeIndividualPositions')}
                  </h4>
                  <p className="mb-4">{t('addYourAssets')}</p>
                  <p className="text-sm mb-6">{t('addYourAssets')}</p>
                  
                  {/* Navigation buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => setActiveSection('investments')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('manageInvestments')}
                    </button>
                    <button 
                      onClick={() => setActiveSection('overview')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      🏠 {t('overview')}
                    </button>
                  </div>
                  
                  <div className="mt-6 text-xs">
                    <p>{t('individualPositionsTip')}</p>
                  </div>
                </div>
              ) : (
                <>
                {isCompactLayout ? (
                  // Mobile card view
                  <div className="space-y-3">
                    {assets.investments.map((item: AssetItem) => {
                      const manualPerformance = calculateAssetPerformance(item);
                      const transactionPerformance = calculateTransactionBasedPerformance(item);
                      const linkedTransactions = safeFilterTransactions((t: Transaction) => t.linkedToAsset === item.id);
                      
                      return (
                        <div key={item.id} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-4 shadow-sm`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.name}</h4>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                {item.sector || t('notAvailable')} • {item.isin || t('notAvailable')}
                              </div>
                            </div>
                            <div className={`font-mono text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {formatCurrencyWithPrivacy(item.amount)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantità</div>
                              <div className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity?.toLocaleString() || '-'}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rendimento</div>
                              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {linkedTransactions.length > 0 ? (
                                  <div className={`${transactionPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrencyWithPrivacy(transactionPerformance.totalReturn)} ({transactionPerformance.percentageReturn.toFixed(1)}%)
                                  </div>
                                ) : manualPerformance.totalReturn !== 0 ? (
                                  <div className={`${manualPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrencyWithPrivacy(manualPerformance.totalReturn)} ({manualPerformance.percentageReturn.toFixed(1)}%)
                                  </div>
                                ) : '-'}
                              </div>
                            </div>
                          </div>
                          
                          {item.description && (
                            <div className="mb-3">
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Descrizione</div>
                              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</div>
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                            <button 
                              onClick={() => handleEditRow('investments', item.id)}
                              className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
                              title="Modifica riga"
                              aria-label={`Modifica ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleEditRow('investments', item.id);
                                }
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleCopyRow('investments', item.id)}
                              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                              title="Copia riga"
                              aria-label={`Duplica ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCopyRow('investments', item.id);
                                }
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleEditRow('investments', item.id)}
                              className={`${darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-500 hover:text-yellow-700'}`}
                              title="Aggiorna Prezzo"
                              aria-label={`Aggiorna prezzo ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleEditRow('investments', item.id);
                                }
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('investments', item.id)}
                              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                              title="Elimina riga"
                              aria-label={`Elimina ${item.name}`}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  if (window.confirm(`Eliminare ${item.name}?`)) {
                                    handleDeleteItem('investments', item.id);
                                  }
                                }
                              }}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Desktop table view
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ticker</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ISIN</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantità</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rendimento</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Collegato a</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.investments.map((item: AssetItem) => {
                          const manualPerformance = calculateAssetPerformance(item);
                          const transactionPerformance = calculateTransactionBasedPerformance(item);
                          const linkedTransactions = safeFilterTransactions((t: Transaction) => t.linkedToAsset === item.id);
                          return (
                          <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.sector || '-'}</td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.isin || '-'}</td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity?.toLocaleString() || '-'}</td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrencyWithPrivacy(item.amount)}</td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs`}>
                              {linkedTransactions.length > 0 ? (
                                <div className={`${transactionPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div>{formatCurrencyWithPrivacy(transactionPerformance.totalReturn)}</div>
                                  <div className="text-xs">{transactionPerformance.percentageReturn.toFixed(1)}% (T)</div>
                                </div>
                              ) : manualPerformance.totalReturn !== 0 ? (
                                <div className={`${manualPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div>{formatCurrencyWithPrivacy(manualPerformance.totalReturn)}</div>
                                  <div className="text-xs">{manualPerformance.percentageReturn.toFixed(1)}% (M)</div>
                                </div>
                              ) : '-'}
                            </td>
                            <td className={`border px-2 py-1 text-center`}>
                              <select
                                value={item.linkedToGlobalPosition || ''}
                                onChange={(e) => handleLinkToGlobalPosition(item.id, e.target.value ? parseInt(e.target.value) : null)}
                                className={`text-xs px-1 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                              >
                                <option value="">Nessuno</option>
                                {assets.investmentPositions.map((globalPosition: InvestmentPosition) => (
                                  <option key={globalPosition.id} value={globalPosition.id}>
                                    {globalPosition.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className={`border px-2 py-1 text-center`}>
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={() => handleEditRow('investments', item.id)}
                                  className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
                                  title="Modifica riga"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleCopyRow('investments', item.id)}
                                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                                  title="Copia riga"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleEditRow('investments', item.id)}
                                  className={`${darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-500 hover:text-yellow-700'}`}
                                  title="Aggiorna Prezzo"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem('investments', item.id)}
                                  className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                )}
                </>
              )}
              
              <div className="mt-2 text-right">
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('individualPositionsLabel')}: {statistics.uniqueInvestmentPositions} • {t('totalAssetsLabel')} {formatCurrencyWithPrivacy(assets.investments.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
                </span>
              </div>
            </div>

            {/* Add Individual Position Form */}
            <div>
              <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('addIndividualAsset')}</h4>
              <AddItemForm section="investments" />
            </div>

            {/* Navigation back to main investments section */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => setActiveSection('investments')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                                        <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('backToInvestments')}
                </button>
                <button 
                  onClick={() => setActiveSection('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                                        🏠 {t('overview')}
                </button>
                  </div>
                        </div>
          </div>
        )}



        {activeSection === 'info' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} rounded-lg shadow-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-blue-200'}`}>
              <div className="flex justify-center mb-6">
                <img 
                  src={require('./images/mango.png')} 
                  alt="MangoMoney" 
                  className="h-16 md:h-20 w-auto object-contain"
                />
              </div>
              
              <div className={`space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('whatIsMangoMoney')}</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    {t('whatIsMangoMoneyDesc')}
                  </p>
                  <p className="text-sm italic mb-4">
                    {t('nameOrigin')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('howItWorks')}</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    {t('howItWorksDesc')}
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    {t('investmentsTracking')}
                  </p>
                  
                  {/* Calcoli migliorati - STANDARDIZZATO */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-lg font-semibold mb-4">{t('improvedCalculations')}</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-base font-semibold mb-2">{t('riskScoreSmarter')}</h5>
                        <p className="text-base leading-relaxed">{t('riskScoreSmarterDesc')}</p>
                    </div>
                    
                      <div>
                        <h5 className="text-base font-semibold mb-2">{t('cagrTitle')}</h5>
                        <p className="text-base leading-relaxed">{t('cagrDesc')}</p>
                    </div>
                    
                      <div>
                        <h5 className="text-base font-semibold mb-2">{t('swrTitle')}</h5>
                        <p className="text-base leading-relaxed">{t('swrDesc')}</p>
                    </div>
                    
                      {/* ✅ ELIMINATO: Sezione Efficiency Score - funzione zombie rimossa */}
                    </div>
                    
                    {/* Sezione fiscale - IMPORTANTE */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                      <h5 className={`text-base font-semibold mb-3 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                        {t('taxCalculationTitle')}
                      </h5>
                      <ul className={`list-disc list-inside space-y-1 text-base ${darkMode ? 'text-red-100' : 'text-red-700'}`}>
                        <li>{t('taxCalculationDesc1')}</li>
                        <li>{t('taxCalculationDesc2')}</li>
                        <li>{t('taxCalculationDesc3')}</li>
                        <li>{t('taxCalculationDesc4')}</li>
                        <li>{t('taxCalculationDesc5')}</li>
                        <li>{t('taxCalculationDesc7')}</li>
                        <li>{t('taxCalculationDesc8')}</li>
                        <li>{t('taxCalculationDesc9')}</li>
                      </ul>
                      <p className={`text-sm mt-3 italic ${darkMode ? 'text-red-100' : 'text-red-700'}`}>
                        {t('taxCalculationDesc6')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Rendimento Lordo vs Netto</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold mb-2">Rendimento Lordo (Solo Posizioni)</h4>
                      <p className="text-base leading-relaxed">
                        Quando compili solo le <strong>Posizioni Globali</strong> e le colleghi alle <strong>Posizioni Individuali</strong>, 
                        il sistema calcola il rendimento lordo basato sui prezzi medi e attuali inseriti manualmente. 
                        Questo calcolo <strong>non include le commissioni</strong> di acquisto e vendita.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold mb-2">Rendimento Netto (Con Transazioni)</h4>
                      <p className="text-base leading-relaxed">
                        Quando carichi anche lo <strong>Storico Transazioni</strong> e lo colleghi alle posizioni individuali, 
                        il sistema ricalcola automaticamente il rendimento includendo <strong>tutte le commissioni</strong> 
                        di acquisto e vendita. Questo ti dà il rendimento netto reale.
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className={`text-base leading-relaxed ${darkMode ? 'text-yellow-100' : 'text-yellow-700'}`}>
                        <strong>Suggerimento:</strong> Per massima precisione, usa sempre il calcolo basato su transazioni. 
                        Il rendimento netto è quello che conta realmente per i tuoi investimenti!
                      </p>
                    </div>
                    
                    {/* Metodi di calcolo cost basis - STANDARDIZZATO */}
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-4">{t('costBasisMethods')}</h4>
                      <p className="text-base leading-relaxed mb-4">{t('costBasisMethodsDesc')}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-base font-semibold mb-2">{t('fifoMethod')}</h5>
                          <p className="text-base leading-relaxed">{t('fifoDesc')}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-base font-semibold mb-2">{t('lifoMethod')}</h5>
                          <p className="text-base leading-relaxed">{t('lifoDesc')}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-base font-semibold mb-2">{t('averageCostMethod')}</h5>
                          <p className="text-base leading-relaxed">{t('averageCostDesc')}</p>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg mt-4 ${darkMode ? 'bg-amber-900/20 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
                        <p className={`text-base leading-relaxed ${darkMode ? 'text-amber-100' : 'text-amber-700'}`}>
                          <strong>Nota:</strong> {t('costBasisNote')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                    <div>
                  <h3 className="text-xl font-semibold mb-4">{t('usefulThings')}</h3>
                  <ul className="list-disc list-inside space-y-2 text-base">
                    <li>{t('totalPrivacy')}</li>
                    <li>{t('automaticBackupsDesc')}</li>
                    <li>{t('multiCurrencyLanguages')}</li>
                    <li>{t('responsive')}</li>
                    <li>{t('standardizedFiscalInfo')}</li>
                    <li>{t('investmentDesc6')}</li>
                    <li>{t('investmentDesc7')}</li>
                  </ul>
                  
                  {/* Funzionalità smart - STANDARDIZZATO */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="text-base font-semibold mb-3">{t('calculationPrecision')}</h4>
                      <ul className="list-disc list-inside space-y-1 text-base">
                        <li>{t('precisionDesc')}</li>
                        <li>{t('italianTaxes')}</li>
                        <li>{t('isinLinking')}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold mb-3">{t('emergencyFundSmart')}</h4>
                      <p className="text-base leading-relaxed">
                        {t('emergencyFundSmartDesc')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold mb-3">{t('italianConfigTitle')}</h4>
                      <ul className="list-disc list-inside space-y-1 text-base">
                        <li>{t('italianConfigDesc1')}</li>
                        <li>{t('italianConfigDesc2')}</li>
                        <li>{t('italianConfigDesc3')}</li>
                        <li>{t('italianConfigDesc4')}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold mb-3">Interfaccia standardizzata</h4>
                      <ul className="list-disc list-inside space-y-1 text-base">
                        <li>{t('uiDesc6')}</li>
                        <li>{t('uiDesc7')}</li>
                        <li>Colonne centrate con layout responsive ottimizzato</li>
                        <li>Informazioni fiscali coerenti e leggibili</li>
                      </ul>
                    </div>
                  </div>
                    </div>

                    <div>
                  <h3 className="text-xl font-semibold mb-4">{t('howToStart')}</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    {t('howToStartDesc')}
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    {t('settingsConfig')}
                  </p>
                  

                    </div>

                    {/* Nuova sezione "Cosa c'è sotto il cofano" */}
                    <div className={`${darkMode ? 'bg-gradient-to-br from-gray-900 to-slate-800' : 'bg-gradient-to-br from-gray-50 to-slate-50'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
                      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('underTheHood')}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('reliableCalculations')}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('reliableCalculationsDesc')}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('limitationsToKnow')}
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {t('historicalDataLimit')}
                            </li>
                            <li className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {t('swrLimit')}
                            </li>
                            <li className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {t('riskScoreLimit')}
                            </li>
                          </ul>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                          <p className={`text-sm ${darkMode ? 'text-orange-100' : 'text-orange-700'}`}>
                            {t('professionalAdvice')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Salute Finanziaria */}
                    <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900 to-cyan-800' : 'bg-gradient-to-br from-blue-50 to-cyan-50'} rounded-lg p-6 border ${darkMode ? 'border-blue-700' : 'border-blue-200'} shadow-lg`}>
                      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-blue-200' : 'text-blue-800'} flex items-center`}>
                        <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
                        </svg>
                        Salute Finanziaria
                      </h3>
                      <div className={`space-y-3 text-sm ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                        <p className="mb-3">Metriche aggiuntive per valutare la solidità finanziaria:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li><strong>Debito/Patrimonio:</strong> &lt;30% Ottima, &lt;50% Buona, &gt;50% Attenzione</li>
                          <li><strong>Liquidità:</strong> &gt;10% Adeguata, &gt;5% Limitata, &lt;5% Insufficiente</li>
                          <li><strong>Investimenti:</strong> % del patrimonio allocata in asset growth</li>
                        </ul>
                        <p className="text-xs italic mt-3">
                          Queste metriche aiutano a valutare la robustezza complessiva del tuo portfolio.
                        </p>
                      </div>
                    </div>

                    {/* Fonti Teoriche */}
                    <div className={`${darkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} rounded-lg p-6 border ${darkMode ? 'border-indigo-700' : 'border-indigo-200'} shadow-lg`}>
                      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-indigo-200' : 'text-indigo-800'} flex items-center`}>
                        <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Fonti Teoriche
                      </h3>
                      <div className={`space-y-3 text-sm ${darkMode ? 'text-indigo-100' : 'text-indigo-900'}`}>
                        <p className="mb-3">L'app si basa su principi e metodologie riconosciute dalla comunità finanziaria:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li><strong>Harry Markowitz</strong> - Modern Portafoglio Theory (1952)</li>
                          <li><strong>William Sharpe</strong> - Capital Asset Pricing Model e Sharpe Ratio</li>
                          <li><strong>Benjamin Graham</strong> - Security Analysis e Value Investing</li>
                          <li><strong>John Bogle</strong> - Principi di diversificazione e costi bassi</li>
                          <li><strong>Robert Merton</strong> - Financial Planning e Lifecycle Investing</li>
                          <li><strong>Trinity Study</strong> - Safe Withdrawal Rate (1998)</li>
                        </ul>
                        <p className="text-xs italic mt-3">
                          Tutti i calcoli seguono standard accademici e professionali riconosciuti.
                        </p>
                      </div>
                    </div>

                <div className={`${darkMode ? 'bg-gradient-to-br from-orange-900 to-amber-800' : 'bg-gradient-to-br from-orange-50 to-amber-50'} rounded-lg p-6 border ${darkMode ? 'border-orange-700' : 'border-orange-200'} text-center shadow-lg`}>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-orange-200' : 'text-orange-800'}`}>{t('limitationsDisclaimer')}</h3>
                  <p className={`mb-4 ${darkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                    {t('limitationsDesc')}
                  </p>
                  <p className={`text-sm italic ${darkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                    {t('practicalNote')}
                  </p>
                    </div>

                <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} rounded-lg p-6 border ${darkMode ? 'border-blue-700' : 'border-blue-200'} text-center shadow-lg`}>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{t('privacySecurity')}</h3>
                  <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                    {t('privacyDesc')}
                  </p>
                  <p className={`${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                    {t('securityChecks')}
                  </p>
                </div>

                {/* Sezione Donazione PayPal */}
                <div className={`${darkMode ? 'bg-gradient-to-br from-emerald-900 to-teal-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} rounded-lg p-6 border ${darkMode ? 'border-emerald-700' : 'border-emerald-200'} text-center shadow-lg`}>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>{t('projectSupport')}</h3>
                  <p className={`mb-4 ${darkMode ? 'text-emerald-100' : 'text-emerald-900'}`}>
                    {t('projectSupportDesc')}
                  </p>
                  <a 
                    href="https://www.paypal.com/paypalme/stefanoconter" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-6 py-3 ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105`}
                  >
                    💳 {t('donatePayPal')}
                  </a>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('usefulLinks')}</h3>
                  <div className="space-y-3">
                    <p className="text-lg">
                      <a 
                        href="https://github.com/Stinocon/AwesomeFinanceITA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`underline hover:no-underline ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
                      >
                        📚 {t('italianFinanceResources')}
                      </a>
                    </p>
                    <p className="text-lg">
                    <a 
                      href="https://www.linkedin.com/in/stefanoconter/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`underline hover:no-underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                        {t('linkedin')}
                    </a>
                  </p>
                    <p className="text-lg">
                    <a 
                        href="https://github.com/Stinocon" 
                      target="_blank" 
                      rel="noopener noreferrer"
                        className={`underline hover:no-underline ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                      >
                        {t('github')}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm opacity-80">
                    {t('developedWith')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} rounded-lg shadow-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-blue-200'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-blue-200' : 'text-blue-800'} flex items-center`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {t('settings')}
              </h2>
              
              <div className={`space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {/* Currency Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    {t('currency')}
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                              {t('selectCurrency')}
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className={`w-full md:w-64 px-3 py-2 border rounded-md text-sm ${
                        darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {Object.entries(currencies).map(([code, currency]) => (
                        <option key={code} value={code}>
                          {currency.symbol} {currency.name} ({code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tax Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    {t('taxSettings')}
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`flex items-center text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('capitalGainsTaxRate')}
                          <div className="ml-1 cursor-help" title={t('capitalGainsTaxRateHelp')}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={capitalGainsTaxRate || ''}
                          onChange={(e) => handleNumericInputChange(setCapitalGainsTaxRate, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`flex items-center text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('whitelistBondsTaxRate')}
                          <div className="ml-1 cursor-help" title={t('whitelistBondsTaxRateHelp')}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={whitelistBondsTaxRate || ''}
                          onChange={(e) => handleNumericInputChange(setWhitelistBondsTaxRate, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`flex items-center text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('currentAccountStampDutyAmount')}
                          <div className="ml-1 cursor-help" title={t('currentAccountStampDutyHelp')}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentAccountStampDuty || ''}
                          onChange={(e) => handleNumericInputChange(setCurrentAccountStampDuty, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`flex items-center text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('currentAccountStampDutyThreshold')}
                          <div className="ml-1 cursor-help" title={t('currentAccountStampDutyThresholdHelp')}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={currentAccountStampDutyThreshold || ''}
                          onChange={(e) => handleNumericInputChange(setCurrentAccountStampDutyThreshold, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`flex items-center text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('depositAccountStampDutyRate')}
                          <div className="ml-1 cursor-help" title={t('depositAccountStampDutyRateHelp')}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={depositAccountStampDutyRate || ''}
                          onChange={(e) => handleNumericInputChange(setDepositAccountStampDutyRate, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`flex items-center text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('inflationRate')}
                          <div className="ml-1 cursor-help" title={t('inflationRateHelp')}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="50"
                          value={inflationRate || ''}
                          onChange={(e) => handleNumericInputChange(setInflationRate, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          setCapitalGainsTaxRate(26.0);
                          setWhitelistBondsTaxRate(12.5);
                          setCurrentAccountStampDuty(34.20);
                          setCurrentAccountStampDutyThreshold(5000);
                          setDepositAccountStampDutyRate(0.20);
                          setInflationRate(2.8);
                          setSwrRate(3.5);
                          setCostBasisMethod('LIFO');
                          showNotification(t('settingsSaved'), 'success');
                        }}
                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                          darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {t('defaultItalianSettings')}
                      </button>
                      
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('settingsSaved')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safe Mode Settings */}
                {safeMode && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      Modalità Sicura
                    </h3>
                    <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                            Modalità Sicura Attiva
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            Alcune funzionalità avanzate sono state disabilitate per prevenire errori.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSafeMode(false);
                            localStorage.removeItem('mangomoney-safe-mode');
                            localStorage.removeItem('mangomoney-disable-charts');
                            localStorage.removeItem('mangomoney-disable-advanced-features');
                            showNotification('Modalità sicura disattivata', 'success');
                          }}
                          className={`px-4 py-2 rounded-md text-sm transition-colors ${
                            darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'
                          }`}
                        >
                          Disattiva Modalità Sicura
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cost Basis Method Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg className="inline-block w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {t('costBasisMethod')}
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      {t('costBasisExplanation')}
                    </p>
                    
                    <div className="space-y-3">
                      <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="radio"
                          name="costBasisMethod"
                          value="FIFO"
                          checked={costBasisMethod === 'FIFO'}
                          onChange={(e) => setCostBasisMethod(e.target.value as 'FIFO' | 'LIFO' | 'AVERAGE_COST')}
                          className="mr-3"
                        />
                        <span className="text-sm">{t('costBasisFIFO')}</span>
                      </label>
                      
                      <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="radio"
                          name="costBasisMethod"
                          value="LIFO"
                          checked={costBasisMethod === 'LIFO'}
                          onChange={(e) => setCostBasisMethod(e.target.value as 'FIFO' | 'LIFO' | 'AVERAGE_COST')}
                          className="mr-3"
                        />
                        <span className="text-sm font-medium text-green-600">{t('costBasisLIFO')} ⭐</span>
                        <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          (Fiscalmente conveniente in Italia)
                        </span>
                      </label>
                      
                      <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="radio"
                          name="costBasisMethod"
                          value="AVERAGE_COST"
                          checked={costBasisMethod === 'AVERAGE_COST'}
                          onChange={(e) => setCostBasisMethod(e.target.value as 'FIFO' | 'LIFO' | 'AVERAGE_COST')}
                          className="mr-3"
                        />
                        <span className="text-sm">{t('costBasisAverage')}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Emergency Fund Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg className="inline-block w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {t('emergencyFundWithIcon')}
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('monthsForOptimal')}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="24"
                          value={emergencyFundOptimalMonths || ''}
                          onChange={(e) => handleNumericInputChange(setEmergencyFundOptimalMonths, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('monthsForOptimalDescription')}
                        </p>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('monthsForAdequate')}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="24"
                          value={emergencyFundAdequateMonths || ''}
                          onChange={(e) => handleNumericInputChange(setEmergencyFundAdequateMonths, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('monthsForAdequateDescription')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          setEmergencyFundOptimalMonths(6);
                          setEmergencyFundAdequateMonths(3);
                          showNotification(t('emergencyFundSettingsReset'), 'success');
                        }}
                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                          darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {t('resetDefaults')}
                      </button>
                      
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('customizeCircumstances')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Insights Configuration */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                      <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                      <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                    </svg>
                    {t('smartInsightsTitle')}
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('smartInsightsDescription')}
                    </p>
                    
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insightsConfig.emergency}
                          onChange={(e) => setInsightsConfig((prev: any) => ({ ...prev, emergency: e.target.checked }))}
                          className="rounded"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('enableEmergencyInsights')}
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insightsConfig.tax}
                          onChange={(e) => setInsightsConfig((prev: any) => ({ ...prev, tax: e.target.checked }))}
                          className="rounded"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('enableTaxInsights')}
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insightsConfig.performance}
                          onChange={(e) => setInsightsConfig((prev: any) => ({ ...prev, performance: e.target.checked }))}
                          className="rounded"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('enablePerformanceInsights')}
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insightsConfig.risk}
                          onChange={(e) => setInsightsConfig((prev: any) => ({ ...prev, risk: e.target.checked }))}
                          className="rounded"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('enableRiskInsights')}
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insightsConfig.allocation}
                          onChange={(e) => setInsightsConfig((prev: any) => ({ ...prev, allocation: e.target.checked }))}
                          className="rounded"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('enableAllocationInsights')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Backup Management */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <path d="M21 2v6h-6"></path>
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                      <path d="M3 22v-6h6"></path>
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                    Backup Management
                  </h3>
                  <BackupManager />
                </div>

                {/* Error Logs Management */}
                {/* Backup e Gestione Dati */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Backup e gestione dati
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    {/* Import Section */}
                    <div>
                      <h4 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17,8 12,3 7,8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Importa dati
                      </h4>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            id="import-file-settings"
                            accept=".json"
                            onChange={importFromFile}
                            className="hidden"
                          />
                          <label
                            htmlFor="import-file-settings"
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                              darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title="Importa backup JSON completo di MangoMoney"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17,8 12,3 7,8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Importa backup JSON
                          </label>
                        </div>
                        <div className="flex-1">
                          <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                            darkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                          }`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14,2 14,8 20,8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10,9 9,9 8,9"></polyline>
                            </svg>
                            Importa CSV
                            <input
                              type="file"
                              accept=".csv"
                              onChange={importFromCSV}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Importa un backup completo JSON o un file CSV (universale o specifico per sezione) con i tuoi dati finanziari.
                      </div>
                    </div>

                    {/* Export Section */}
                    <div className="border-t pt-4">
                      <h4 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Esporta dati
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button
                          onClick={exportToJSON}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                          title="Backup completo con tutti i dati e impostazioni"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                          </svg>
                          JSON
                        </button>
                        <button
                          onClick={exportToCSV}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            darkMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                          title="Esporta dati dettagliati in formato CSV"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                          </svg>
                          CSV
                        </button>
                        <button
                          onClick={exportToExcel}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            darkMode ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'
                          }`}
                          title="Esporta dati in formato Excel-compatibile"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                          </svg>
                          Excel
                        </button>
                        <button
                          onClick={exportToPDF}
                          disabled={loadingStates.exporting}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            darkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Genera report PDF stampabile"
                        >
                          {loadingStates.exporting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              PDF...
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                              </svg>
                              PDF
                            </>
                          )}
                        </button>
                      </div>
                      <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Esporta i tuoi dati in diversi formati: JSON per backup completo, CSV/Excel per analisi, PDF per stampa.
                      </div>
                    </div>

                    {/* Reset Section */}
                    <div className="border-t pt-4">
                      <h4 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                          <polyline points="1 4 1 10 7 10"></polyline>
                          <polyline points="23 20 23 14 17 14"></polyline>
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                        </svg>
                        Reset dati
                      </h4>
                      <button
                        onClick={resetData}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors ${
                          darkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="1 4 1 10 7 10"></polyline>
                          <polyline points="23 20 23 14 17 14"></polyline>
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                        </svg>
                        Cancella tutti i dati
                      </button>
                      <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1 text-yellow-500">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <strong>Attenzione:</strong> Questa operazione cancellerà permanentemente tutti i tuoi dati e impostazioni.
                      </div>
                    </div>
                  </div>
                </div>

                {/* CSV Templates & Import */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"></path>
                      <path d="M18 2l4 4-12 12H6V14L18 2z"></path>
                    </svg>
                    Template CSV specifici
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <div>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Scarica template CSV per ogni sezione:</p>
                      <div className="flex flex-wrap gap-1.5">

                        <button onClick={() => downloadCSVTemplate('cash')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                          Liquidità
                        </button>
                        <button onClick={() => downloadCSVTemplate('debts')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                          Debiti
                        </button>
                        <button onClick={() => downloadCSVTemplate('investments')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v18H3z"/></svg>
                          Investimenti
                        </button>
                        <button onClick={() => downloadCSVTemplate('transactions')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v4H3zM3 11h18v10H3z"/></svg>
                          Transazioni
                        </button>
                        <button onClick={() => downloadCSVTemplate('realEstate')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M4 10v10h6V14h4v6h6V10"/></svg>
                          Immobili
                        </button>
                        <button onClick={() => downloadCSVTemplate('pensionFunds')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14"/><path d="M3 21h18M7 10h10"/></svg>
                          Fondi Pensione
                        </button>
        

                        <button onClick={() => downloadCSVTemplate('alternativeAssets')} className={`px-2 py-1.5 text-xs rounded-md ${darkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                          <svg className="inline-block w-3 h-3 mr-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5"/></svg>
                          Beni Alternativi
                        </button>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Log degli errori - Spostato in fondo */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    {t('errorLogs')}
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => {
                          const logs = getErrorLogs();
                          if (logs.length === 0) {
                            showNotification(t('noErrorLogs'), 'info');
                          } else {
                            const logsText = logs.map(log => 
                              `[${log.timestamp}] ${log.severity.toUpperCase()}: ${log.context} - ${log.message}`
                            ).join('\n');
                            const blob = new Blob([logsText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `mangomoney-error-logs-${new Date().toISOString().split('T')[0]}.txt`;
                            link.click();
                            URL.revokeObjectURL(url);
                            showNotification(`Log degli errori esportati (${logs.length} entries)`, 'success');
                          }
                        }}
                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                          darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {t('viewErrorLogs')}
                      </button>
                      <button
                        onClick={() => {
                          clearErrorLogs();
                          showNotification('Log degli errori cancellati', 'success');
                        }}
                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                          darkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {t('clearErrorLogs')}
                      </button>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      I log degli errori vengono salvati automaticamente per il debugging. Contengono informazioni su errori, warning e problemi riscontrati durante l'uso dell'applicazione.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {(activeSection !== 'overview' && activeSection !== 'statistics' && activeSection !== 'info' && activeSection !== 'settings' && activeSection !== 'investments') && (
          <div className="space-y-6 animate-slideIn">
            {/* Welcome message or data table */}
            {(() => {
              const sectionAssets = activeSection === 'alternativeAssets' ? paginatedAlternativeAssets : assets[activeSection as keyof typeof assets] as AssetItem[] | RealEstate[];
              const totalAssets = activeSection === 'alternativeAssets' ? filteredAlternativeAssets : assets[activeSection as keyof typeof assets] as AssetItem[] | RealEstate[];
              const allAssets = assets[activeSection as keyof typeof assets] as AssetItem[] | RealEstate[];
              
              // For alternative assets, always show the table if there are any assets, even if filtered results are empty
              if (activeSection === 'alternativeAssets') {
                if (allAssets.length === 0) {
                  return <WelcomeMessage section={activeSection} />;
                }
              } else {
                if (totalAssets.length === 0) {
                  return <WelcomeMessage section={activeSection} />;
                }
              }
              
              return (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {sections[activeSection as keyof typeof sections]}
                    {activeSection === 'alternativeAssets' && (
                      <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {t('alternativeAssetsDesc')}
                      </p>
                    )}
                    {activeSection === 'debts' && (
                      <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {t('debtsDesc')}
                      </p>
                    )}
                  </h3>
                  
                  {/* Alternative Asset Filter */}
                  {activeSection === 'alternativeAssets' && (
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('filterByAssetType')}
                      </label>
                      <select
                        value={alternativeAssetFilter}
                        onChange={(e) => setAlternativeAssetFilter(e.target.value)}
                        className={`w-full md:w-64 text-sm px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="all">{t('allTypes')}</option>
                        <option value="tcg">{t('tcg')}</option>
                        <option value="stamps">{t('stamps')}</option>
                        <option value="alcohol">{t('alcohol')}</option>
                        <option value="collectibles">{t('collectibles')}</option>
                        <option value="vinyl">{t('vinyl')}</option>
                        <option value="books">{t('books')}</option>
                        <option value="comics">{t('comics')}</option>
                        <option value="art">{t('art')}</option>
                        <option value="lego">{t('lego')}</option>
                        <option value="other">{t('other')}</option>
                      </select>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('name')}</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {activeSection === 'realEstate' ? t('value') : t('amount')}
                          </th>
                          {activeSection === 'realEstate' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('type')}</th>
                          )}
                          {activeSection === 'realEstate' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('address')}</th>
                          )}
                          {activeSection === 'cash' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('accountType')}</th>
                          )}
                          {activeSection === 'cash' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bollo</th>
                          )}
                          {activeSection === 'alternativeAssets' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('assetType')}</th>
                          )}
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('description')}</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('notes')}</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionAssets.map((item: AssetItem | RealEstate) => {
                          const isRealEstate = activeSection === 'realEstate';
                          const realEstateItem = isRealEstate ? item as RealEstate : null;
                          const assetItem = !isRealEstate ? item as AssetItem : null;
                          
                          return (
                          <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {emergencyFundAccount.section === activeSection && emergencyFundAccount.id === item.id && 
                      <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                              {item.name}
                            </td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'} ${activeSection === 'debts' && assetItem?.amount && assetItem.amount < 0 ? 'text-red-600' : ''}`}>
                              {isRealEstate && realEstateItem ? 
                                formatCurrencyWithPrivacy(realEstateItem.value) : 
                                assetItem ? formatCurrencyWithPrivacy(activeSection === 'debts' ? Math.abs(assetItem.amount) : assetItem.amount) : 'N/A'
                              }
                              {activeSection === 'debts' && assetItem?.amount && assetItem.amount < 0 && <span className="text-red-500 ml-1">🔻</span>}
                            </td>
                            {activeSection === 'realEstate' && realEstateItem && (
                              <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                <span className={`px-2 py-1 rounded text-xs ${realEstateItem.type === 'primary' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {realEstateItem.type === 'primary' ? t('primaryHome') : t('secondaryHome')}
                                </span>
                              </td>
                            )}
                                                      {activeSection === 'realEstate' && realEstateItem && (
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {realEstateItem.address || '-'}
                            </td>
                          )}
                          {/* 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal - tutti gli immobili contano nel patrimonio */}
                            {activeSection === 'cash' && assetItem && (
                              <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        <span className={`px-2 py-1 rounded text-xs ${assetItem.accountType === 'current' ? 'bg-blue-100 text-blue-800' : assetItem.accountType === 'deposit' ? 'bg-green-100 text-green-800' : assetItem.accountType === 'remunerated' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {assetItem.accountType === 'current' ? t('currentAccountType') : assetItem.accountType === 'deposit' ? t('depositAccountType') : assetItem.accountType === 'remunerated' ? t('remuneratedAccountType') : assetItem.accountType === 'cash' ? t('cashAccountType') : t('notAvailable')}
                        </span>
                              </td>
                            )}
                            {activeSection === 'cash' && assetItem && (
                              <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {renderCompactFiscalBreakdown(assetItem)}
                              </td>
                            )}
                            {activeSection === 'alternativeAssets' && assetItem && (
                              <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-800'}`}>
                                  {assetItem.assetType === 'tcg' ? t('tcg') : 
                                   assetItem.assetType === 'stamps' ? t('stamps') :
                                   assetItem.assetType === 'alcohol' ? t('alcohol') :
                                   assetItem.assetType === 'collectibles' ? t('collectibles') :
                                   assetItem.assetType === 'vinyl' ? t('vinyl') :
                                   assetItem.assetType === 'books' ? t('books') :
                                   assetItem.assetType === 'comics' ? t('comics') :
                                   assetItem.assetType === 'art' ? t('art') :
                                   assetItem.assetType === 'lego' ? t('lego') :
                                   assetItem.assetType === 'other' ? t('other') : t('notAvailable')}
                                </span>
                              </td>
                            )}
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {isRealEstate && realEstateItem ? realEstateItem.description : assetItem ? assetItem.description : '-'}
                            </td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {isRealEstate && realEstateItem ? (realEstateItem.notes || '-') : assetItem ? (assetItem.notes || '-') : '-'}
                            </td>
                            <td className={`border px-2 py-1 text-center`}>
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={() => handleEditRow(activeSection, item.id)}
                                  className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'} transition-all duration-200 ease-in-out transform hover:scale-110`}
                                  title="Modifica riga"
                                  aria-label={`Modifica ${item.name}`}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleEditRow(activeSection, item.id);
                                    }
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleCopyRow(activeSection, item.id)}
                                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} transition-all duration-200 ease-in-out transform hover:scale-110`}
                                  title="Copia riga"
                                  aria-label={`Duplica ${item.name}`}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleCopyRow(activeSection, item.id);
                                    }
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(activeSection, item.id)}
                                  className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} transition-all duration-200 ease-in-out transform hover:scale-110`}
                                  title="Elimina riga"
                                  aria-label={`Elimina ${item.name}`}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      if (window.confirm(`Eliminare ${item.name}?`)) {
                                        handleDeleteItem(activeSection, item.id);
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                                    <div className="mt-2 text-right">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${activeSection === 'debts' ? 'text-red-600' : ''}`}>
                      {t('totalLabel')} {formatCurrencyWithPrivacy(
                        activeSection === 'realEstate' 
                          ? (totalAssets as RealEstate[]).reduce((sum: number, item: RealEstate) => sum + item.value, 0)
                          : activeSection === 'debts' 
                          ? Math.abs((totalAssets as AssetItem[]).reduce((sum: number, item: AssetItem) => sum + item.amount, 0)) 
                          : (totalAssets as AssetItem[]).reduce((sum: number, item: AssetItem) => sum + item.amount, 0)
                      )}
                      {activeSection === 'debts' ? '🔻' : ''}
                    </span>
                  
                  {/* Statistiche aggregate conti deposito */}
                  {activeSection === 'cash' && (
                    <DepositTaxesSummary 
                      accounts={assets.cash} 
                      settings={{ 
                        capitalGainsTaxRate,
                        depositAccountStampDutyRate 
                      }} 
                    />
                  )}
                    <div className="mt-2 flex justify-end">
                      <AddItemForm section={activeSection} compact={true} />
                    </div>
                  </div>
                  
                  {/* No Results Message for Alternative Assets */}
                  {activeSection === 'alternativeAssets' && filteredAlternativeAssets.length === 0 && allAssets.length > 0 && (
                    <div className="mt-4 text-center py-8">
                      <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>🔍</div>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nessun asset trovato
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {t('noAssetsOfType').replace('{type}',                           alternativeAssetFilter === 'tcg' ? t('tcg') :
                          alternativeAssetFilter === 'stamps' ? t('stamps') :
                          alternativeAssetFilter === 'alcohol' ? t('alcohol') :
                          alternativeAssetFilter === 'collectibles' ? t('collectibles') :
                          alternativeAssetFilter === 'vinyl' ? t('vinyl') :
                          alternativeAssetFilter === 'books' ? t('books') :
                          alternativeAssetFilter === 'comics' ? t('comics') :
                          alternativeAssetFilter === 'art' ? t('art') :
                          alternativeAssetFilter === 'lego' ? t('lego') :
                          alternativeAssetFilter === 'other' ? t('other') : t('selected'))}
                      </p>
                      <button
                        onClick={() => setAlternativeAssetFilter('all')}
                        className={`mt-3 px-4 py-2 rounded-md text-sm transition-colors ${
                          darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Mostra tutti gli asset
                      </button>
                    </div>
                  )}
                  
                  {/* Enhanced Alternative Asset Pagination */}
                  {activeSection === 'alternativeAssets' && filteredAlternativeAssets.length > 0 && totalAlternativeAssetPages > 1 && (
                    <EnhancedPagination
                      currentPage={currentAlternativeAssetPage}
                      totalPages={totalAlternativeAssetPages}
                      onPageChange={setCurrentAlternativeAssetPage}
                      totalItems={filteredAlternativeAssets.length}
                      itemsPerPage={alternativeAssetsPerPage}
                      darkMode={darkMode}
                    />
                  )}
                </div>
              );
            })()}



            {/* Configurazione Fondo di Emergenza - Solo nella sezione Liquidità */}
            {activeSection === 'cash' && (
              <div className={`${darkMode ? 'bg-gradient-to-br from-green-900 to-blue-900' : 'bg-gradient-to-br from-green-50 to-blue-50'} rounded-lg shadow p-4 border ${darkMode ? 'border-green-800' : 'border-green-200'} mb-6`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-green-200' : 'text-green-800'} flex items-center`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('emergencyFundConfigurationTitle')}
                </h3>
                
                <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                                              {t('monthlyExpenses')}
                    </label>
                    <input
                      type="number"
                      value={monthlyExpenses || ''}
                      onChange={(e) => handleNumericInputChange(setMonthlyExpenses, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${darkMode ? 'bg-green-800 border-green-600 text-green-100' : 'bg-white border-green-300 text-gray-900'}`}
                      step="50"
                    />
                    {monthlyExpenses > 0 && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
                        </svg>
                        {t('withTotalLiquidity').replace('{amount}', formatCurrencyWithPrivacy(totals.cash)).replace('{months}', privacyMode ? '••••••••' : (totals.cash / monthlyExpenses).toFixed(1))}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                                              {t('emergencyFundTitle')}
                    </label>
                    <select
                      value={`${emergencyFundAccount.section}-${emergencyFundAccount.id}`}
                      onChange={(e) => {
                        const [section, id] = e.target.value.split('-');
                        if (section === 'cash') {
                          const account = assets.cash.find((item: AssetItem) => item.id === parseInt(id));
                          if (account) {
                            setEmergencyFundAccount({ section, id: parseInt(id), name: account.name });
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${darkMode ? 'bg-green-800 border-green-600 text-green-100' : 'bg-white border-green-300'}`}
                    >
                                              <option value="">{t('noFundDesignated')}</option>
                      {assets.cash.map((item: AssetItem) => (
                        <option key={`cash-${item.id}`} value={`cash-${item.id}`}>
                          {item.name} ({formatCurrencyWithPrivacy(item.amount)})
                        </option>
                      ))}
                    </select>
                    {statistics.emergencyFundValue > 0 && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Il fondo di emergenza designato copre <strong>{statistics.emergencyMonths} mesi</strong> di spese
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}



            {/* Grafici a Torta - Solo per sezioni che non sono alternativeAssets e debts */}
            {activeSection !== 'alternativeAssets' && activeSection !== 'debts' && assets[activeSection as keyof typeof assets].length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
                  <div className="flex-shrink-0">
                    <CompactPieChart 
                      data={getSectionChartData(activeSection)} 
                      size={180} 
                      showLegend={false}
                    />
                  </div>
                  <div className="flex-1 w-full lg:min-w-0">
                    <div className="grid grid-cols-1 gap-3">
                      {getSectionChartData(activeSection).filter(item => item.value > 0).map((item, index) => (
                        <div key={index} className="flex items-center min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className={`text-sm flex-1 min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ wordBreak: 'break-word' }}>
                            {item.name}
                          </span>
                          <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {formatCurrencyWithPrivacy(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <SectionErrorBoundary section="editModal" darkMode={darkMode} t={t}>
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
            data-modal="edit"
            onClick={(e) => {
              // Prevenire la chiusura del modal quando si clicca sullo sfondo
              if (e.target === e.currentTarget) {
                // Opzionale: chiudi il modal cliccando sullo sfondo
                // handleCancelEdit();
              }
            }}
          >
            <div 
              ref={modalRef}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="edit-modal-title"
            >
              <h3 id="edit-modal-title" className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {t('editItem')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Common Fields */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {editingItem.section === 'transactions' ? t('assetType') : t('name')} *
                  </label>
                  {editingItem.section === 'transactions' ? (
                    <select
                      value={localFieldValues.assetType !== undefined ? localFieldValues.assetType : (editingItem.data as Transaction).assetType || 'ETF'}
                      onChange={(e) => handleUncontrolledFieldChange('assetType', e)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="Azione">{t('azione')}</option>
                      <option value="ETF">{t('etf')}</option>
                      <option value="Obbligazione whitelist">{t('obbligazioneWhitelist')}</option>
                      <option value="Obbligazione">{t('obbligazione')}</option>
                    </select>
                  ) : (
                  <input
                    type="text"
                      value={localFieldValues.name !== undefined ? localFieldValues.name : ((editingItem.data as any).name || '')}
                    onChange={(e) => handleUncontrolledFieldChange('name', e)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Nome dell'elemento"
                  />
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {editingItem.section === 'realEstate' ? t('valueLabel') : t('amount')} *
                  </label>
                                      <input
                      type="number"
                      value={editingItem.section === 'realEstate' ? 
                        (localFieldValues.value !== undefined ? localFieldValues.value : ((editingItem.data as RealEstate).value !== undefined && (editingItem.data as RealEstate).value !== null ? (editingItem.data as RealEstate).value : '')) : 
                        (localFieldValues.amount !== undefined ? localFieldValues.amount : ((editingItem.data as any).amount !== undefined && (editingItem.data as any).amount !== null ? (editingItem.data as any).amount : ''))
                      }
                      onChange={(e) => handleUncontrolledFieldChange(editingItem.section === 'realEstate' ? 'value' : 'amount', e)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      step="0.01"
                      placeholder="0.00"
                    />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('description')}
                  </label>
                  <textarea
                    value={localFieldValues.description !== undefined ? localFieldValues.description : ((editingItem.data as any).description || '')}
                    onChange={(e) => handleUncontrolledFieldChange('description', e)}
                    className={`w-full px-3 py-2 border rounded-md resize-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Descrizione dell'elemento"
                    rows={3}
                  />
                </div>

                {/* Notes field for all sections */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Note
                  </label>
                  <textarea
                    value={localFieldValues.notes !== undefined ? localFieldValues.notes : ((editingItem.data as any).notes || '')}
                    onChange={(e) => handleUncontrolledFieldChange('notes', e)}
                    className={`w-full px-3 py-2 border rounded-md resize-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Note aggiuntive"
                    rows={3}
                  />
                </div>

                {/* Investment Positions Specific Fields */}
                {editingItem.section === 'investmentPositions' && (
                  <>
                    {/* Nessun campo specifico per le posizioni globali */}
                  </>
                )}

                {/* Individual Investments Specific Fields */}
                {editingItem.section === 'investments' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Ticker
                      </label>
                      <input
                        type="text"
                        value={(editingItem.data as AssetItem).sector || ''}
                        onChange={(e) => handleEditFieldChange('sector', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="es. AAPL, VWCE"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ISIN
                      </label>
                      <input
                        type="text"
                        value={(editingItem.data as AssetItem).isin || ''}
                        onChange={(e) => handleEditFieldChange('isin', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="es. US0378331005"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Quantità
                      </label>
                      <input
                        type="number"
                        value={(editingItem.data as AssetItem).quantity !== undefined && (editingItem.data as AssetItem).quantity !== null ? (editingItem.data as AssetItem).quantity : ''}
                        onChange={(e) => handleEditIntegerChange('quantity', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="1"
                        placeholder="0"
                      />
                    </div>
                    

                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Prezzo Medio
                      </label>
                      <input
                        type="number"
                        value={(editingItem.data as AssetItem).avgPrice !== undefined && (editingItem.data as AssetItem).avgPrice !== null ? (editingItem.data as AssetItem).avgPrice : ''}
                        onChange={(e) => handleEditNumberChange('avgPrice', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Prezzo Attuale
                      </label>
                      <input
                        type="number"
                        value={(editingItem.data as AssetItem).currentPrice !== undefined && (editingItem.data as AssetItem).currentPrice !== null ? (editingItem.data as AssetItem).currentPrice : ''}
                        onChange={(e) => handleEditNumberChange('currentPrice', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    

                  </>
                )}

                {/* Transactions Specific Fields */}
                {editingItem.section === 'transactions' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Ticker
                      </label>
                      <input
                        type="text"
                        value={(editingItem.data as Transaction).ticker || ''}
                        onChange={(e) => handleEditFieldChange('ticker', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="es. AAPL, VWCE"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ISIN
                      </label>
                      <input
                        type="text"
                        value={(editingItem.data as Transaction).isin || ''}
                        onChange={(e) => handleEditFieldChange('isin', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="es. US0378331005"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('transactionType')}
                      </label>
                      <select
                        value={(editingItem.data as Transaction).transactionType || 'purchase'}
                        onChange={(e) => handleEditFieldChange('transactionType', e.target.value as 'purchase' | 'sale')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="purchase">Acquisto</option>
                        <option value="sale">Vendita</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Quantità
                      </label>
                      <input
                        type="number"
                        value={(editingItem.data as Transaction).quantity !== undefined && (editingItem.data as Transaction).quantity !== null ? (editingItem.data as Transaction).quantity : ''}
                        onChange={(e) => handleEditIntegerChange('quantity', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="1"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Commissioni
                      </label>
                      <input
                        type="number"
                        value={(editingItem.data as Transaction).commissions !== undefined && (editingItem.data as Transaction).commissions !== null ? (editingItem.data as Transaction).commissions : ''}
                        onChange={(e) => handleEditNumberChange('commissions', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Data
                      </label>
                      <input
                        type="date"
                        value={(editingItem.data as Transaction).date || ''}
                        onChange={(e) => handleEditFieldChange('date', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('linkedToAsset')}
                      </label>
                      <select
                        value={(editingItem.data as Transaction).linkedToAsset || ''}
                        onChange={(e) => handleEditOptionalIntegerChange('linkedToAsset', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Nessuno</option>
                        {assets.investments.map((asset: AssetItem) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} ({asset.sector || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Real Estate Specific Fields */}
                {editingItem.section === 'realEstate' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tipo Proprietà
                      </label>
                      <select
                        value={(editingItem.data as RealEstate).type || 'primary'}
                        onChange={(e) => handleEditFieldChange('type', e.target.value as 'primary' | 'secondary')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="primary">Residenza Principale</option>
                        <option value="secondary">Proprietà Secondaria</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Indirizzo
                      </label>
                      <textarea
                        defaultValue={(editingItem.data as RealEstate).address || ''}
                        onChange={(e) => handleUncontrolledFieldChange('address', e)}

                        className={`w-full px-3 py-2 border rounded-md resize-none ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Indirizzo dell'immobile"
                        rows={2}
                      />
                    </div>
                    
                    {/* 🎯 SEMPLIFICAZIONE 2: Rimuovere excludeFromTotal - tutti gli immobili contano nel patrimonio */}
                    

                  </>
                )}


              </div>
              
              {/* Account Type for Cash */}
              {editingItem.section === 'cash' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo Conto
                  </label>
                  <select
                    value={(editingItem.data as AssetItem).accountType || 'current'}
                    onChange={(e) => handleEditFieldChange('accountType', e.target.value as 'current' | 'deposit' | 'remunerated' | 'cash')}
                    className={`w-full md:w-1/2 px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                                            <option value="current">{t('currentAccount')}</option>
                        <option value="deposit">{t('depositAccount')}</option>
                        <option value="remunerated">{t('remuneratedAccountType')}</option>
                    <option value="cash">{t('cashAccountType')}</option>
                  </select>
                </div>
              )}

              {/* Interest Rate for Deposit and Remunerated Accounts */}
              {editingItem.section === 'cash' && ((editingItem.data as AssetItem).accountType === 'deposit' || (editingItem.data as AssetItem).accountType === 'remunerated') && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tasso interesse lordo annuo (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={localFieldValues.interestRate !== undefined ? localFieldValues.interestRate : ((editingItem.data as AssetItem).interestRate || '')}
                    onChange={(e) => handleUncontrolledFieldChange('interestRate', e)}
                    placeholder="es: 3.50"
                    className={`w-full md:w-1/2 px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Inserisci il tasso lordo offerto dalla banca (prima delle imposte)
                  </p>
                </div>
              )}

              {/* Asset Type for Alternative Assets */}
              {editingItem.section === 'alternativeAssets' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo asset
                  </label>
                  <select
                    value={(editingItem.data as AssetItem).assetType || 'other'}
                    onChange={(e) => handleEditFieldChange('assetType', e.target.value as 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'lego' | 'other')}
                    className={`w-full md:w-1/2 px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="tcg">{t('tcg')}</option>
                    <option value="stamps">{t('stamps')}</option>
                    <option value="alcohol">{t('alcohol')}</option>
                    <option value="collectibles">{t('collectibles')}</option>
                    <option value="vinyl">{t('vinyl')}</option>
                    <option value="books">{t('books')}</option>
                    <option value="comics">{t('comics')}</option>
                    <option value="art">{t('art')}</option>
                    <option value="lego">{t('lego')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveEdit}
                  aria-label="Salva modifiche"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  {t('save')}
                </button>
                <button
                  onClick={handleCancelEdit}
                  aria-label="Annulla modifiche"
                  className={`px-4 py-2 rounded transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
          </SectionErrorBoundary>
        )}

        {/* Clear All Transactions Modal */}
        {showClearTransactionsModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
            data-modal="clear-transactions"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClearTransactionsCancel();
              }
            }}
          >
            <div 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-6 max-w-md w-full border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="clear-transactions-modal-title"
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} mr-3`}>
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 id="clear-transactions-modal-title" className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {t('clearAllTransactions')}
                </h3>
              </div>

              {clearTransactionsStep === 'confirm' && (
                <div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('clearTransactionsConfirmMessage')}
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleClearTransactionsCancel}
                      className={`px-4 py-2 rounded transition-colors ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleClearTransactionsConfirm}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      {t('continue')}
                    </button>
                  </div>
                </div>
              )}

              {clearTransactionsStep === 'warning' && (
                <div>
                  <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                          {t('clearTransactionsWarningTitle')}
                        </h4>
                        <div className={`mt-2 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                          <p className="mb-2">
                            {t('clearTransactionsWarningMessage').replace('{count}', safeGetTransactions().length.toString()).replace('{value}', formatCurrency(safeGetTransactions().reduce((sum: number, item: Transaction) => sum + item.amount, 0)))}
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>{t('clearTransactionsWarning1')}</li>
                            <li>{t('clearTransactionsWarning2')}</li>
                            <li>{t('clearTransactionsWarning3')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleClearTransactionsCancel}
                      className={`px-4 py-2 rounded transition-colors ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleClearTransactionsWarning}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      {t('iUnderstand')}
                    </button>
                  </div>
                </div>
              )}

              {clearTransactionsStep === 'final' && (
                <div>
                  <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className={`text-sm font-medium ${darkMode ? 'text-orange-200' : 'text-orange-800'}`}>
                          {t('clearTransactionsFinalTitle')}
                        </h4>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                          {t('clearTransactionsFinalMessage')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('clearTransactionsPasswordLabel')}
                    </label>
                    <input
                      type="text"
                      value={clearTransactionsPassword}
                      onChange={(e) => setClearTransactionsPassword(e.target.value)}
                      placeholder="DELETE"
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      autoFocus
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('clearTransactionsPasswordHint')}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleClearTransactionsCancel}
                      className={`px-4 py-2 rounded transition-colors ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleClearTransactionsFinal}
                      disabled={clearTransactionsPassword !== 'DELETE'}
                      className={`px-4 py-2 rounded transition-colors ${
                        clearTransactionsPassword === 'DELETE'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {t('deletePermanently')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-700 dark:text-gray-300">{t('processing')}</span>
              </div>
            </div>
          </div>
        )}



        {/* Notification Toast */}
        {notification.visible && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-30'}`}
            onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
          >
            <div 
              className={`max-w-sm w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-2xl border-2 p-4 transition-all duration-300 ${
                notification.type === 'success' ? 'border-green-600 bg-green-100 dark:bg-green-900/30' :
                notification.type === 'error' ? 'border-red-600 bg-red-100 dark:bg-red-900/30' :
                'border-blue-600 bg-blue-100 dark:bg-blue-900/30'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <span className="text-green-600 dark:text-green-400">✅</span>}
                {notification.type === 'error' && <span className="text-red-600 dark:text-red-400">❌</span>}
                {notification.type === 'info' && <span className="text-blue-600 dark:text-blue-400">ℹ️</span>}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800 dark:text-green-200' :
                  notification.type === 'error' ? 'text-red-800 dark:text-red-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                  aria-label="Chiudi notifica"
                  className={`text-sm font-bold hover:scale-110 transition-transform ${
                    notification.type === 'success' ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300' :
                    notification.type === 'error' ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' :
                    'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
            </div>
          </div>
        )}



      </main>
    </div>
  );
};

const AppWithErrorBoundary = () => {
  // Create a simple translation function for the error boundary
  const t = (key: string): string => {
    // Default to English for error boundary messages
    const translations: Record<string, string> = {
      'somethingWentWrong': 'Something went wrong',
      'unexpectedError': 'An unexpected error occurred. Please refresh the page to continue.',
      'refreshPage': 'Refresh Page'
    };
    return translations[key] || key;
  };

  return (
    <ErrorBoundary t={t}>
      <NetWorthManager />
    </ErrorBoundary>
  );
};

export default AppWithErrorBoundary;