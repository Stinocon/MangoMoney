import React, { useState, useMemo, useEffect, useCallback, Component, ReactNode } from 'react';
import { VirtualizedTable } from './components/VirtualizedTable';
import { useAutoBackup } from './hooks/useAutoBackup';
import { useFormValidation, ValidationSchema } from './hooks/useFormValidation';
import { safeCAGR, safeSubtract, safeAdd, safeMultiply, safeDivide, safePercentage, safeSWR } from './utils/financialCalculations';
import { PlusCircle, Trash2, Download, Upload, RotateCcw, Moon, Sun, Calculator, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { translations, languages, type TranslationKey, type Language } from './translations';

// Section Error Boundary Component
interface SectionErrorBoundaryProps {
  section: string;
  children: React.ReactNode;
  darkMode?: boolean;
  onRetry?: () => void;
  t: (key: any) => string;
}

class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, { hasError: boolean; error?: Error }> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in section ${this.props.section}:`, error, errorInfo);
    
    // Opzionalmente invia errore a servizio di monitoring
    // logErrorToService(error, { section: this.props.section, ...errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      const { section, darkMode = false, t } = this.props;
      
      return (
        <div className={`${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-6 text-center`}>
          <div className={`text-4xl mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>⚠️</div>
                          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                  {t('errorInSection').replace('{section}', section)}
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  {t('errorLoadingSection')}
                </p>
          {this.state.error && (
            <details className={`text-xs mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                              <summary>{t('errorDetails')}</summary>
              <pre className="mt-2 text-left overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className={`px-4 py-2 rounded transition-colors ${
                darkMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {t('retry')}
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
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  t: (key: any) => string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{t('somethingWentWrong')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('unexpectedError')}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('refreshPage')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom debounce hook for performance optimization
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



// TypeScript interfaces
interface AssetItem {
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
  accountType?: 'current' | 'deposit' | 'cash'; // For cash accounts
  assetType?: 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'other'; // For alternative assets
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

interface Transaction {
  id: number;
  name: string;
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
  otherAccounts: AssetItem[];
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
  accountType?: 'current' | 'deposit' | 'cash';
  assetType?: 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'other';
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

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface ExportData {
  assets: Assets;
  settings: {
    capitalGainsTaxRate: number;
    currentAccountStampDuty: number;
    currentAccountStampDutyThreshold: number;
    depositAccountStampDutyRate: number;
    emergencyFundOptimalMonths: number;
    emergencyFundAdequateMonths: number;
    selectedCurrency: string;
    selectedLanguage: string;
    swrRate: number;
    darkMode: boolean;
    forceMobileLayout: boolean;
  };
  metadata: {
    exportDate: string;
    version: string;
    appName: string;
    totalItems: number;
    totalValue: number;
    emergencyFundAccount: EmergencyFundAccount;
    monthlyExpenses: number;
    exportInfo: {
      totalAssets: number;
      sections: Array<{
        name: string;
        count: number;
      }>;
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
  assetType?: 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'other';
  type?: 'primary' | 'secondary';
  address?: string;
  value?: number;
}

interface CSVRow {
  [key: string]: string | number | undefined;
}

// Additional interfaces to replace 'any' types
// Note: These interfaces are defined for future use and type safety improvements

// Safe localStorage utilities with validation
const safeParseJSON = (data: string, fallback: any): any => {
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch {
    return fallback;
  }
};

const validateAssets = (data: unknown): Assets | null => {
  if (!data || typeof data !== 'object') return null;
  
  const assets = data as Partial<Assets>;
  const requiredSections = ['cash', 'debts', 'investments', 'investmentPositions', 'transactions', 'realEstate', 'pensionFunds', 'otherAccounts', 'alternativeAssets'];
  
  for (const section of requiredSections) {
    if (!Array.isArray(assets[section as keyof Assets])) {
      return null;
    }
  }
  
  return data as Assets;
};

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
      return validatedAssets || getInitialData();
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
    return saved ? safeParseJSON(saved, { section: 'otherAccounts', id: 2, name: 'Conto Emergenza' }) : { section: 'otherAccounts', id: 2, name: 'Conto Emergenza' };
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
    return saved ? safeParseJSON(saved, 4.0) : 4.0;
  });

  // Notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const [isLoading, setIsLoading] = useState(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 5000) => {
    setNotification({ message, type, visible: true });
    
    // Auto-hide con possibilità di personalizzare durata
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  // Varianti per facilità d'uso
  const showSuccess = useCallback((message: string, duration?: number) => 
    showNotification(message, 'success', duration), [showNotification]);

  const showError = useCallback((message: string, duration?: number) => 
    showNotification(message, 'error', duration), [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => 
    showNotification(message, 'info', duration), [showNotification]);



  // Translation helper function
  const t = useCallback((key: TranslationKey): string => {
    return translations[selectedLanguage as Language]?.[key] || key;
  }, [selectedLanguage]);

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

  // Auto-backup system
  const autoBackup = useAutoBackup(
    assets,
    {
      capitalGainsTaxRate,
      currentAccountStampDuty,
      currentAccountStampDutyThreshold,
      depositAccountStampDutyRate,
      emergencyFundOptimalMonths,
      emergencyFundAdequateMonths,
      selectedCurrency,
      selectedLanguage,
      swrRate,
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
      otherAccounts: [],
      alternativeAssets: []
    };
  }

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
    const updateLoadingState = useCallback((operation: keyof typeof loadingStates, isLoading: boolean) => {
      setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
    }, []);

    const withLoading = useCallback(async <T,>(
      operation: keyof typeof loadingStates,
      asyncFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | undefined> => {
      updateLoadingState(operation, true);
      try {
        const result = await asyncFn();
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
        showError(`Errore durante ${operation}: ${err.message}`);
        throw err;
      } finally {
        updateLoadingState(operation, false);
      }
    }, [updateLoadingState]);

    return { loadingStates, withLoading };
  };

  const { withLoading } = useAsyncOperation();


  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('mangomoney-darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('mangomoney-assets', JSON.stringify(assets));
    localStorage.setItem('mangomoney-lastSaved', new Date().toISOString());
    setLastSaved(new Date());
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('mangomoney-forceMobileLayout', JSON.stringify(forceMobileLayout));
  }, [forceMobileLayout]);

  useEffect(() => {
    localStorage.setItem('mangomoney-privacyMode', JSON.stringify(privacyMode));
  }, [privacyMode]);

  useEffect(() => {
    localStorage.setItem('mangomoney-emergencyFundAccount', JSON.stringify(emergencyFundAccount));
  }, [emergencyFundAccount]);

  useEffect(() => {
    localStorage.setItem('mangomoney-monthlyExpenses', JSON.stringify(monthlyExpenses));
  }, [monthlyExpenses]);

  useEffect(() => {
    localStorage.setItem('mangomoney-currency', JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('mangomoney-language', JSON.stringify(selectedLanguage));
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('mangomoney-swr-rate', JSON.stringify(swrRate));
  }, [swrRate]);

  useEffect(() => {
    localStorage.setItem('mangomoney-capital-gains-tax', JSON.stringify(capitalGainsTaxRate));
  }, [capitalGainsTaxRate]);

  useEffect(() => {
    localStorage.setItem('mangomoney-current-account-stamp-duty', JSON.stringify(currentAccountStampDuty));
  }, [currentAccountStampDuty]);

  useEffect(() => {
    localStorage.setItem('mangomoney-current-account-stamp-duty-threshold', JSON.stringify(currentAccountStampDutyThreshold));
  }, [currentAccountStampDutyThreshold]);

  useEffect(() => {
    localStorage.setItem('mangomoney-deposit-account-stamp-duty', JSON.stringify(depositAccountStampDutyRate));
  }, [depositAccountStampDutyRate]);

  useEffect(() => {
    localStorage.setItem('mangomoney-emergency-fund-optimal-months', JSON.stringify(emergencyFundOptimalMonths));
  }, [emergencyFundOptimalMonths]);

  useEffect(() => {
    localStorage.setItem('mangomoney-emergency-fund-adequate-months', JSON.stringify(emergencyFundAdequateMonths));
  }, [emergencyFundAdequateMonths]);

  // Mobile card view component for transactions
  const TransactionMobileCard = ({ item }: { item: Transaction }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-3 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.name}</h4>
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
          <div className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.amount)}</div>
        </div>
        <div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Commissioni</div>
          <div className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.commissions)}</div>
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
          {formatCurrency(item.amount)}
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
      // Focus sul primo input quando si apre il modal
      const timer = setTimeout(() => {
        const firstInput = document.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
          firstInput.select();
        }
      }, 100);

      // Gestione ESC per chiudere
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancelEdit();
        }
      };

      document.addEventListener('keydown', handleEscape);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleEscape);
      };
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
    const debts = assets.debts.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    const investments = assets.investments.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    const investmentPositions = assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => safeAdd(sum, item.amount), 0);
    const realEstate = assets.realEstate.reduce((sum: number, item: RealEstate) => safeAdd(sum, item.value), 0);
    const pensionFunds = assets.pensionFunds.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    const otherAccounts = assets.otherAccounts.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    const alternativeAssets = assets.alternativeAssets.reduce((sum: number, item: AssetItem) => safeAdd(sum, item.amount), 0);
    
    const total = safeAdd(safeAdd(safeAdd(safeAdd(cash, debts), safeAdd(investments, investmentPositions)), 
                                 safeAdd(safeAdd(realEstate, pensionFunds), safeAdd(otherAccounts, alternativeAssets))), 0);
    
    return {
      cash,
      debts,
      investments,
      realEstate,
      pensionFunds,
      otherAccounts,
      alternativeAssets,
      total
    };
  }, [assets]);

  // Advanced statistics calculations
  const statistics = useMemo(() => {
    const { cash, investments, realEstate, pensionFunds, alternativeAssets, total } = totals;
    const investmentPositions = assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0);
    const totalDebts = Math.abs(totals.debts);
    
    const emergencyFundValue = emergencyFundAccount.section === 'cash' 
      ? assets.cash?.find((item: AssetItem) => item.id === emergencyFundAccount.id)?.amount || 0
      : 0;
    
    // Asset allocation percentages
    const allocationPercentages = {
      cash: total > 0 ? ((cash / total) * 100).toFixed(1) : '0.0',
      investments: total > 0 ? (((investments + investmentPositions) / total) * 100).toFixed(1) : '0.0',
      realEstate: total > 0 ? ((realEstate / total) * 100).toFixed(1) : '0.0',
      pensionFunds: total > 0 ? ((pensionFunds / total) * 100).toFixed(1) : '0.0',
      alternativeAssets: total > 0 ? ((alternativeAssets / total) * 100).toFixed(1) : '0.0'
    };

    // Enhanced Risk Score Calculation (Properly normalized 0-10 scale)
    const riskWeights: { [key: string]: number } = {
      cash: 1,           // Lowest risk - highly liquid
      otherAccounts: 1.5, // Low-medium risk - various financial products
      pensionFunds: 2,   // Medium risk - long-term, regulated
      realEstate: 2,     // Medium risk - illiquid but stable
      investments: 3,    // Medium-high risk - aggregated positions
      investmentPositions: 4, // High risk - specific individual positions
      alternativeAssets: 5 // Highest risk - speculative assets
    };
    
    // Calculate weighted risk score with proper normalization
    let totalWeightedRisk = 0;
    let totalAllocation = 0;
    
    Object.entries(totals).forEach(([key, value]) => {
      if (key !== 'total' && key !== 'debts' && value > 0) {
        const weight = riskWeights[key] || 2;
        const percentage = (value / total) * 100;
        totalWeightedRisk += percentage * weight;
        totalAllocation += percentage;
      }
    });
    
    // Normalize to 0-10 scale: (weighted risk / total allocation) * (10 / max_weight)
    // Since max_weight = 5, we multiply by 2 to get 0-10 scale
    const riskScore = totalAllocation > 0 ? (totalWeightedRisk / totalAllocation) * 2 : 0;

    // Emergency Fund Analysis
    const emergencyMonths = emergencyFundValue > 0 && monthlyExpenses > 0 
      ? (emergencyFundValue / monthlyExpenses).toFixed(1) 
      : monthlyExpenses === 0 ? '0' : '0';
    
    const emergencyFundStatus = parseFloat(emergencyMonths) >= emergencyFundOptimalMonths ? t('optimal') :
                               parseFloat(emergencyMonths) >= emergencyFundAdequateMonths ? t('adequate') : t('insufficient');


    
    // Count active positions for additional context
    const totalPositions = assets.cash.length + assets.debts.length + assets.investments.length + 
                          assets.investmentPositions.length + assets.realEstate.length + 
                          assets.pensionFunds.length + assets.otherAccounts.length + 
                          assets.alternativeAssets.length;
    
    const activePositions = assets.cash.filter((item: AssetItem) => item.amount > 0).length +
                           assets.debts.filter((item: AssetItem) => item.amount < 0).length +
                           assets.investments.filter((item: AssetItem) => item.amount > 0).length +
                           assets.investmentPositions.filter((item: InvestmentPosition) => item.amount > 0).length +
                           assets.realEstate.filter((item: RealEstate) => item.value > 0).length +
                           assets.pensionFunds.filter((item: AssetItem) => item.amount > 0).length +
                           assets.otherAccounts.filter((item: AssetItem) => item.amount > 0).length +
                           assets.alternativeAssets.filter((item: AssetItem) => item.amount > 0).length;



    // Financial Health Metrics
    const debtToAssetRatio = total > 0 ? (totalDebts / total) : 0;
    const debtToAssetPercentage = (debtToAssetRatio * 100).toFixed(1);
          const debtHealth = debtToAssetRatio < 0.3 ? t('excellent') : debtToAssetRatio < 0.5 ? t('good') : t('attention');

    const liquidityRatio = total > 0 ? (cash / total) : 0;
    const liquidityPercentage = (liquidityRatio * 100).toFixed(1);
    const liquidityHealth = liquidityRatio > 0.1 ? t('adequate') : liquidityRatio > 0.05 ? t('limited') : t('insufficient');

    // Investment Efficiency
    const totalInvestments = investments + investmentPositions;
    const investmentEfficiency = total > 0 ? (totalInvestments / total) : 0;
    const investmentPercentage = (investmentEfficiency * 100).toFixed(1);



    return {
      allocationPercentages,
      totalPositions,
      activePositions,
      riskScore: riskScore.toFixed(1),
      emergencyMonths,
      emergencyFundValue,
      emergencyFundStatus,
      debtToAssetPercentage,
      debtHealth,
      liquidityPercentage,
      liquidityHealth,
      investmentPercentage
    };
  }, [totals, assets, emergencyFundAccount, monthlyExpenses, emergencyFundOptimalMonths, emergencyFundAdequateMonths, t]);

  // Chart data preparation with memoization for performance
  const pieData = useMemo(() => [
    { name: t('cash'), value: totals.cash, color: '#3b82f6' },
    { name: t('debts'), value: Math.abs(totals.debts), color: '#dc2626' },
    { name: t('investments'), value: totals.investments + assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0), color: '#10b981' },
    { name: t('realEstate'), value: totals.realEstate, color: '#8b5cf6' },
    { name: t('pensionFunds'), value: totals.pensionFunds, color: '#ef4444' },
    { name: t('otherAccounts'), value: totals.otherAccounts, color: '#06b6d4' },
    { name: t('alternativeAssets'), value: totals.alternativeAssets, color: '#84cc16' }
  ], [totals, assets.investmentPositions, t]);

  const barData = useMemo(() => [
    { category: t('cash'), amount: totals.cash, color: '#3b82f6' },
    { category: t('debts'), amount: totals.debts, color: '#dc2626' },
    { category: t('investments'), amount: totals.investments + assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0), color: '#10b981' },
    { category: t('realEstate'), amount: totals.realEstate, color: '#8b5cf6' },
    { category: t('pensionFunds'), amount: totals.pensionFunds, color: '#ef4444' },
    { category: t('otherAccounts'), amount: totals.otherAccounts, color: '#06b6d4' },
    { category: t('alternativeAssets'), amount: totals.alternativeAssets, color: '#84cc16' }
  ], [totals, assets.investmentPositions, t]);

  // Memoized filtered data for better performance
  const filteredPieData = useMemo(() => pieData.filter(item => item.value > 0), [pieData]);
  const filteredBarData = useMemo(() => barData.filter(item => item.amount !== 0), [barData]);

  const sections = useMemo(() => ({
    cash: t('cash'),
    debts: t('debts'),
    investments: t('investments'),
    realEstate: t('realEstate'),
    pensionFunds: t('pensionFunds'),
    otherAccounts: t('otherAccounts'),
    alternativeAssets: t('alternativeAssets')
  }), [t]);

  // Generate section-specific chart data - Optimized with memoization
  const getSectionChartData = useCallback((section: string): ChartDataItem[] => {
    if (!assets[section as keyof typeof assets]) return [];
    
    const sectionAssets = assets[section as keyof typeof assets];
    const colors = ['#3b82f6', '#10b981', '#f97316', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#a855f7', '#ec4899'];
    
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
        .map((item: AssetItem, index: number) => ({
          name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
          value: item.amount,
          color: colors[index % colors.length],
          fullName: item.name,
          description: item.description
        }));
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
    setHasUnsavedChanges(true);
  };
  */

  const handleDeleteItem = useCallback((section: string, id: number) => {
          if (window.confirm(t('confirmDelete'))) {
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
    }
  }, [assets, t]);

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
          name: `${itemToCopy.name} (copia)`,
          date: new Date().toISOString().split('T')[0]
        };
        setAssets({
          ...assets,
          transactions: [...assets.transactions, newItem]
        });
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

  // Function to save edited row
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const { section, id, data } = editingItem;
    
    // Sanitize the data based on section type
    const sanitizedData: any = { ...(data as any) };
    
    if (section === 'investmentPositions') {
      const investmentData = data as InvestmentPosition;
      sanitizedData.name = sanitizeString(investmentData.name || '');
      sanitizedData.ticker = sanitizeTicker(investmentData.ticker || '');
      sanitizedData.isin = sanitizeISIN(investmentData.isin || '');
      sanitizedData.amount = Math.abs(sanitizeNumber(investmentData.amount || 0));
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
      const transactionData = data as Transaction;
      sanitizedData.name = sanitizeString(transactionData.name || '');
      sanitizedData.ticker = sanitizeTicker(transactionData.ticker || '');
      sanitizedData.isin = sanitizeISIN(transactionData.isin || '');
      sanitizedData.amount = Math.abs(sanitizeNumber(transactionData.amount || 0));
      sanitizedData.quantity = sanitizeInteger(transactionData.quantity || 0);
      sanitizedData.commissions = sanitizeNumber(transactionData.commissions || 0);
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
      const realEstateData = data as RealEstate;
      sanitizedData.name = sanitizeString(realEstateData.name || '');
      sanitizedData.description = sanitizeString(realEstateData.description || '');
      sanitizedData.value = Math.abs(sanitizeNumber(realEstateData.value || 0));
      sanitizedData.address = sanitizeString(realEstateData.address || '');
      sanitizedData.notes = sanitizeString(realEstateData.notes || '');
      
      setAssets({
        ...assets,
        realEstate: assets.realEstate.map((item: RealEstate) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else {
      // Handle other sections (cash, debts, investments, alternativeAssets, etc.)
      const assetData = data as AssetItem;
      sanitizedData.name = sanitizeString(assetData.name || '');
      sanitizedData.amount = section === 'debts' ? -Math.abs(sanitizeNumber(assetData.amount || 0)) : Math.abs(sanitizeNumber(assetData.amount || 0));
      sanitizedData.description = sanitizeString(assetData.description || '');
      sanitizedData.notes = sanitizeString(assetData.notes || '');
      
      if (section === 'investments') {
        sanitizedData.fees = sanitizeNumber(assetData.fees || 0);
        sanitizedData.quantity = sanitizeInteger(assetData.quantity || 0);
        sanitizedData.avgPrice = sanitizeNumber(assetData.avgPrice || 0);
        sanitizedData.currentPrice = sanitizeNumber(assetData.currentPrice || 0);
        sanitizedData.lastPriceUpdate = new Date().toISOString().split('T')[0];
        sanitizedData.sector = sanitizeTicker(assetData.sector || '');
        sanitizedData.isin = sanitizeISIN(assetData.isin || '');
      }
      
      if (section === 'cash') {
        sanitizedData.accountType = assetData.accountType;
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
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

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

  // Constants
  const LINKING_TOLERANCE_PERCENTAGE = 0.05; // 5% tolerance for linking validation
  // Minimum tolerance amount varies by currency to account for different monetary scales
  const MIN_LINKING_TOLERANCE_AMOUNT = selectedCurrency === 'JPY' ? 1000 : // ¥1000 for JPY
                                      selectedCurrency === 'USD' ? 10 : // $10 for USD
                                      selectedCurrency === 'GBP' ? 8 : // £8 for GBP
                                      selectedCurrency === 'CHF' ? 10 : // CHF 10 for CHF
                                      10; // €10 default for EUR

  // Function to calculate linking validation
  const getLinkingValidation = () => {
    const validation: { [key: number]: { linkedAssets: AssetItem[], totalLinkedValue: number, globalValue: number, deviation: number, isValid: boolean } } = {};
    
    assets.investmentPositions.forEach((globalPosition: InvestmentPosition) => {
      const linkedAssets = assets.investments.filter((asset: AssetItem) => asset.linkedToGlobalPosition === globalPosition.id);
      const totalLinkedValue = linkedAssets.reduce((sum: number, asset: AssetItem) => sum + asset.amount, 0);
      const deviation = Math.abs(totalLinkedValue - globalPosition.amount);
      // Variable tolerance: 5% of amount, but minimum amount for small positions
      // This prevents overly strict validation for small amounts where percentage differences
      // can be misleading due to rounding, fees, or timing differences
      const tolerance = Math.max(globalPosition.amount * LINKING_TOLERANCE_PERCENTAGE, MIN_LINKING_TOLERANCE_AMOUNT);
      const isValid = deviation <= tolerance;
      
      validation[globalPosition.id] = {
        linkedAssets,
        totalLinkedValue,
        globalValue: globalPosition.amount,
        deviation,
        isValid
      };
    });
    
    return validation;
  };

  // Function to calculate transaction statistics by year
  const getTransactionStats = () => {
    const stats: { [year: string]: { count: number, totalInvested: number, totalSold: number, netInvestment: number, totalCommissions: number } } = {};
    
    assets.transactions.forEach((transaction: Transaction) => {
      const year = transaction.date.split('-')[0];
      
      if (!stats[year]) {
        stats[year] = { count: 0, totalInvested: 0, totalSold: 0, netInvestment: 0, totalCommissions: 0 };
      }
      
      stats[year].count++;
      stats[year].totalCommissions += transaction.commissions;
      
      if (transaction.transactionType === 'purchase') {
        stats[year].totalInvested += transaction.amount;
      } else {
        stats[year].totalSold += transaction.amount;
      }
    });
    
    // Calculate net investment as total invested - total sold - total commissions
    Object.keys(stats).forEach(year => {
      stats[year].netInvestment = stats[year].totalInvested - stats[year].totalSold - stats[year].totalCommissions;
    });
    
    return stats;
  };

  // Calculate performance for individual assets
  const calculateAssetPerformance = (asset: AssetItem) => {
    if (!asset.currentPrice || !asset.avgPrice || !asset.quantity) {
      return { totalReturn: 0, percentageReturn: 0, currentValue: 0 };
    }

    const currentValue = asset.currentPrice * asset.quantity;
    const investedValue = asset.avgPrice * asset.quantity;
    const totalReturn = currentValue - investedValue;
    const percentageReturn = investedValue > 0 ? (totalReturn / investedValue) * 100 : 0;

    return {
      totalReturn,
      percentageReturn,
      currentValue
    };
  };

  // Calculate transaction-based performance for individual assets
  const calculateTransactionBasedPerformance = useCallback((asset: AssetItem) => {
    if (!asset.currentPrice || !asset.quantity) {
      return { totalReturn: 0, percentageReturn: 0, currentValue: 0, costBasis: 0, totalInvested: 0 };
    }

    // Get all transactions linked to this asset
    const linkedTransactions = assets.transactions.filter((t: Transaction) => t.linkedToAsset === asset.id);
    
    if (linkedTransactions.length === 0) {
      // Fallback to manual calculation if no transactions
      const manualPerformance = calculateAssetPerformance(asset);
      return {
        ...manualPerformance,
        costBasis: (asset.avgPrice || 0) * (asset.quantity || 0),
        totalInvested: (asset.avgPrice || 0) * (asset.quantity || 0)
      };
    }

    // Calculate cost basis from transactions using safe operations
    let totalInvested = 0;
    let totalQuantity = 0;
    let totalCommissions = 0;

    linkedTransactions.forEach((transaction: Transaction) => {
      if (transaction.transactionType === 'purchase') {
        totalInvested = safeAdd(totalInvested, transaction.amount);
        totalQuantity = safeAdd(totalQuantity, transaction.quantity);
        totalCommissions = safeAdd(totalCommissions, transaction.commissions);
      } else {
        // For sales, reduce the cost basis proportionally
        if (totalQuantity > 0) {
          const saleRatio = safeDivide(transaction.quantity, totalQuantity);
          totalInvested = safeSubtract(totalInvested, safeMultiply(totalInvested, saleRatio));
          totalQuantity = safeSubtract(totalQuantity, transaction.quantity);
        }
        totalCommissions = safeAdd(totalCommissions, transaction.commissions);
      }
    });

    // Calculate current value and performance using safe operations
    const costBasis = safeAdd(totalInvested, totalCommissions);
    const currentValue = safeMultiply(asset.currentPrice, asset.quantity);
    const totalReturn = safeSubtract(currentValue, costBasis);
    
    // Use safe percentage calculation
    const percentageReturn = safePercentage(totalReturn, costBasis);

    // Additional validation for edge cases
    if (totalQuantity <= 0) {
      return { 
        totalReturn: 0, 
        percentageReturn: 0, 
        currentValue: 0, 
        costBasis: 0, 
        totalInvested: 0,
        warning: 'No valid quantity for performance calculation'
      };
    }

    return {
      totalReturn,
      percentageReturn,
      currentValue,
      costBasis,
      totalInvested: costBasis
    };
  }, [assets.transactions]);

  // Filter and paginate transactions - Optimized with debounced filters
  const filteredTransactions = useMemo(() => {
    return assets.transactions.filter((transaction: Transaction) => {
      const filters = debouncedTransactionFilters as { type: string; ticker: string; isin: string };
      const matchesType = filters.type === 'all' || 
                         transaction.transactionType === filters.type;
      const matchesTicker = !filters.ticker || 
                           transaction.ticker.toLowerCase().includes(filters.ticker.toLowerCase());
      const matchesIsin = !filters.isin || 
                         transaction.isin.toLowerCase().includes(filters.isin.toLowerCase());
      
      return matchesType && matchesTicker && matchesIsin;
    });
  }, [assets.transactions, debouncedTransactionFilters]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + transactionsPerPage);
  }, [filteredTransactions, currentTransactionPage]);

  const totalTransactionPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

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

  // Calculate annualized performance based on transaction history
  // Edge case: For periods < 1 month, annualized returns become misleading and are set to 0
  const calculateAnnualizedPerformance = useCallback(() => {
    if (assets.transactions.length === 0) {
      return { annualizedReturn: 0, annualizedReturnPercentage: 0 };
    }

    // Get all investment transactions
    const investmentTransactions = assets.transactions.filter((t: Transaction) => 
      t.transactionType === 'purchase' && t.linkedToAsset
    );

    if (investmentTransactions.length === 0) {
      return { annualizedReturn: 0, annualizedReturnPercentage: 0 };
    }

    // Find the earliest purchase date
    const earliestDate = new Date(Math.min(...investmentTransactions.map((t: Transaction) => new Date(t.date).getTime())));
    const currentDate = new Date();
    
    // Calculate time period in years
    const timeInYears = (currentDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Handle edge cases for very short periods
    // Less than 1 month (0.083 years) - annualizing such short periods is misleading
    if (timeInYears <= 0.083) {
      return { annualizedReturn: 0, annualizedReturnPercentage: 0 };
    }

    // Additional validation: ensure time period is reasonable (not negative or too long)
    if (timeInYears < 0 || timeInYears > 50) {
      return { 
        annualizedReturn: 0, 
        annualizedReturnPercentage: 0,
        warning: timeInYears < 0 ? 'Invalid time period (negative)' : 'Period too long for reliable calculation'
      };
    }

    // Calculate total invested and current value using safe operations
    const totalInvested = investmentTransactions.reduce((sum: number, t: Transaction) => safeAdd(sum, t.amount), 0);
    const totalCommissions = investmentTransactions.reduce((sum: number, t: Transaction) => safeAdd(sum, t.commissions), 0);
    
    // Get current portfolio value using safe operations
    const currentPortfolioValue = assets.investments.reduce((sum: number, asset: AssetItem) => {
      if (asset.currentPrice && asset.quantity) {
        return safeAdd(sum, safeMultiply(asset.currentPrice, asset.quantity));
      }
      return sum;
    }, 0);

    const totalCost = safeAdd(totalInvested, totalCommissions);
    // totalReturn is calculated but not used in this context - removed to avoid unused variable warning

    // Use safe CAGR calculation
    let annualizedReturnPercentage = 0;
    if (totalCost > 0 && timeInYears > 0.083) { // Only calculate for periods >= 1 month
      annualizedReturnPercentage = safeCAGR(totalCost, currentPortfolioValue, timeInYears);
    }

    const annualizedReturn = safeMultiply(totalCost, annualizedReturnPercentage / 100);

    return {
      annualizedReturn,
      annualizedReturnPercentage,
      warning: timeInYears <= 0.083 ? 'Period too short for meaningful annualization' : 
               timeInYears > 50 ? 'Period too long for reliable calculation' : undefined
    };
  }, [assets.transactions, assets.investments]);

  // Calculate portfolio performance with annualized returns - Optimized with useMemo
  const portfolioPerformance = useMemo(() => {
    const assetsWithPerformance = assets.investments.map((asset: AssetItem) => {
      const performance = calculateTransactionBasedPerformance(asset);
      return {
        ...asset,
        performance
      };
    });

    const totalInvested = assetsWithPerformance.reduce((sum: number, asset: AssetWithPerformance) => {
      return sum + asset.performance.totalInvested;
    }, 0);

    const totalCurrentValue = assetsWithPerformance.reduce((sum: number, asset: AssetWithPerformance) => {
      return sum + asset.performance.currentValue;
    }, 0);

    const totalReturn = totalCurrentValue - totalInvested;
    const percentageReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Calculate annualized performance
    const annualizedPerformance = calculateAnnualizedPerformance();

    return {
      totalInvested,
      totalCurrentValue,
      totalReturn,
      percentageReturn,
      annualizedReturn: annualizedPerformance.annualizedReturn,
      annualizedReturnPercentage: annualizedPerformance.annualizedReturnPercentage,
      assets: assetsWithPerformance
    };
  }, [assets.investments, calculateAnnualizedPerformance, calculateTransactionBasedPerformance]);

  // Function to calculate Safe Withdrawal Rate simulation
  const calculateSWR = useCallback(() => {
    // Net liquid assets: cash + investments + other accounts
    const netLiquidAssets = safeAdd(safeAdd(totals.cash, totals.investments), totals.otherAccounts);
    
    // Annual withdrawal amount (SWR rate as percentage of net liquid assets)
    const annualWithdrawal = safeSWR(netLiquidAssets, swrRate);
    
    // Monthly withdrawal amount (what the SWR percentage provides monthly)
    const monthlyWithdrawal = safeDivide(annualWithdrawal, 12);
    
    // Years of support based on monthly expenses and SWR rate
    // Formula: years = netLiquidAssets / (monthlyExpenses * 12 * (swrRate/100))
    // This calculates how long the assets would last if you withdraw the SWR percentage
    // instead of withdrawing 100% of monthly expenses
    const yearsOfSupport = monthlyExpenses > 100 ? 
      safeDivide(netLiquidAssets, safeMultiply(safeMultiply(monthlyExpenses, 12), swrRate / 100)) : 0;
    
    return {
      netLiquidAssets,
      annualWithdrawal,
      monthlyWithdrawal,
      yearsOfSupport: Math.max(0, yearsOfSupport)
    };
  }, [totals.cash, totals.investments, totals.otherAccounts, swrRate, monthlyExpenses]);

  // Currency formatting utility
  const formatCurrency = (amount: number): string => {
    const currency = currencies[selectedCurrency as keyof typeof currencies];
    return new Intl.NumberFormat(currency.locale, { 
      style: 'currency', 
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'JPY' ? 0 : 2
    }).format(amount);
  };

  // Privacy mode helper functions
  const formatCurrencyWithPrivacy = (amount: number): string => {
    if (privacyMode) {
      return '••••••••';
    }
    return formatCurrency(amount);
  };



  // Input sanitization utilities
  const sanitizeString = useCallback((input: string): string => {
    if (typeof input !== 'string') return '';
    // Whitelist approach: only allow safe characters
    // Allow letters, numbers, spaces, common punctuation, and currency symbols
    return input.trim().replace(/[^a-zA-Z0-9\s\-_.,()€$%£¥@#&+]/g, '');
  }, []);

  const sanitizeNumber = (input: string | number, context: 'amount' | 'percentage' | 'price' = 'amount'): number => {
    if (typeof input === 'number') {
      const validation = validateFinancialAmount(input, context);
      if (!validation.valid) {
        console.warn(`Validation failed: ${validation.error}`);
        return 0;
      }
      return input;
    }
    
    if (typeof input !== 'string') return 0;
    
    const cleaned = input.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    const validation = validateFinancialAmount(parsed, context);
    if (!validation.valid) {
      console.warn(`Validation failed: ${validation.error}`);
      return 0;
    }
    
    return parsed;
  };



  // AGGIUNGERE QUESTA FUNZIONE
  const validateFinancialAmount = (value: number, context: 'amount' | 'percentage' | 'price' = 'amount'): { valid: boolean; error?: string } => {
    if (!Number.isFinite(value)) return { valid: false, error: 'Valore non valido o infinito' };
    if (Number.isNaN(value)) return { valid: false, error: 'Valore non è un numero' };
    
    switch (context) {
      case 'amount':
        if (Math.abs(value) > 1e15) return { valid: false, error: 'Importo troppo elevato (max 1 quadrilione)' };
        if (Math.abs(value) < 0.01 && value !== 0) return { valid: false, error: 'Importo troppo piccolo (min 0.01)' };
        break;
      case 'percentage':
        if (value < -99.99) return { valid: false, error: 'Percentuale non può essere inferiore a -99.99%' };
        if (value > 50000) return { valid: false, error: 'Percentuale non può superare 50000%' };
        break;
      case 'price':
        if (value < 0) return { valid: false, error: 'Il prezzo non può essere negativo' };
        if (value > 1e12) return { valid: false, error: 'Prezzo troppo elevato' };
        break;
    }
    
    return { valid: true };
  };

  const sanitizeInteger = (input: string | number): number => {
    if (typeof input === 'number') return isNaN(input) || !isFinite(input) ? 0 : Math.floor(input);
    if (typeof input !== 'string') return 0;
    const parsed = parseInt(input);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  const sanitizeDate = (input: string): string => {
    if (!input || typeof input !== 'string') return new Date().toISOString().split('T')[0];
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input)) {
      return new Date().toISOString().split('T')[0];
    }
    
    const date = new Date(input);
    const today = new Date();
    // Set today's time to end of day to allow same-day transactions
    today.setHours(23, 59, 59, 999);
    
    // Validate: date must be valid, not in the future, and not too far in the past
    const minDate = new Date('1900-01-01');
    if (isNaN(date.getTime()) || date > today || date < minDate) {
      return new Date().toISOString().split('T')[0];
    }
    return input;
  };

  const sanitizeTicker = useCallback((input: string): string => {
    return sanitizeString(input).toUpperCase().replace(/[^A-Z0-9.]/g, '');
  }, [sanitizeString]);

  const sanitizeISIN = useCallback((input: string): string => {
    return sanitizeString(input).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }, [sanitizeString]);

  // Export functionality
  const exportToJSON = useCallback(async () => {
    await withLoading('exporting', async () => {
      // Calculate statistics for metadata
      const totalItems = Object.values(assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0);
      const totalValue = Object.entries(totals).reduce((sum: number, [key, value]) => {
        if (key === 'total') return sum;
        return sum + Math.abs(value);
      }, 0);
      
      // Aggiorna timestamp ultimo backup
      localStorage.setItem('mangomoney-last-backup-time', new Date().toISOString());

    const exportData: ExportData = {
      assets,
      settings: {
        capitalGainsTaxRate,
        currentAccountStampDuty,
        currentAccountStampDutyThreshold,
        depositAccountStampDutyRate,
        emergencyFundOptimalMonths,
        emergencyFundAdequateMonths,
        selectedCurrency,
        selectedLanguage,
        swrRate,
        darkMode,
        forceMobileLayout
      },
      metadata: {
        exportDate: new Date().toISOString(),
          version: '3.0',
        appName: 'MangoMoney',
        totalItems,
        totalValue,
        emergencyFundAccount,
        monthlyExpenses,
        exportInfo: {
          totalAssets: Object.values(assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0),
          sections: Object.keys(assets).map(section => ({
            name: section,
            count: assets[section as keyof typeof assets].length
          }))
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
    (error) => showError('Errore durante l\'esportazione del backup.')
    );
  }, [withLoading, assets, totals, capitalGainsTaxRate, currentAccountStampDuty, currentAccountStampDutyThreshold, depositAccountStampDutyRate, emergencyFundOptimalMonths, emergencyFundAdequateMonths, selectedCurrency, selectedLanguage, swrRate, darkMode, forceMobileLayout, emergencyFundAccount, monthlyExpenses, showSuccess, showError]);

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
            nome: item.name,
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
            ticker: item.sector || '',
            isin: item.isin || '',
            quantita: item.quantity,
            commissioni: item.fees,
            prezzo_medio: item.avgPrice,
            collegato_a: item.linkedToGlobalPosition || '',
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
            tipo: 'Asset',
            fondo_emergenza: emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || ''
          });
        });
      }
    });
    
    // Create CSV content with all available fields
    const csvHeader = Object.keys(allData[0] || {}).join(',') + '\n';
        const csvContent = allData.map((row: CSVRow) =>
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
          showNotification(`CSV esportato con successo! ${allData.length} elementi salvati.`, 'success');
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
            Name: item.name,
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
            Ticker: item.sector || '',
            ISIN: item.isin || '',
            Quantity: item.quantity,
            Commissions: item.fees,
            'Average Price': item.avgPrice,
            'Linked To': item.linkedToGlobalPosition || '',
            Type: 'Asset Individuale',
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
            Type: 'Asset',
            'Emergency Fund': emergencyFundAccount.section === section && emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            ID: item.id,
            Notes: item.notes || ''
          });
        });
      }
    });
    
    // Create Excel-compatible CSV with semicolon separator
    const csvHeader = Object.keys(allData[0] || {}).join(';') + '\n';
        const csvContent = allData.map((row: CSVRow) =>
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
          showNotification(`Excel esportato con successo! ${allData.length} elementi salvati.`, 'success');
    } catch (error) {
      showNotification('Errore durante l\'esportazione Excel. Riprova.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const currentDate = new Date().toLocaleDateString('it-IT');
    const currentTime = new Date().toLocaleTimeString('it-IT');
    const totalItems = Object.values(assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MangoMoney - Report ${currentDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px; }
          .total { font-size: 28px; color: #059669; font-weight: bold; margin: 10px 0; }
          .summary { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
          .summary-item { text-align: center; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e9ecef; }
          .summary-value { font-size: 18px; font-weight: bold; color: #059669; }
          .summary-label { font-size: 12px; color: #6c757d; text-transform: uppercase; }
          .section { margin: 25px 0; page-break-inside: avoid; }
          .section-title { font-size: 20px; font-weight: bold; margin: 20px 0 15px 0; color: #1f2937; border-bottom: 1px solid #e9ecef; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; color: #374151; }
          .amount { text-align: right; font-family: monospace; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f9fafb; }
          .emergency { color: #dc2626; font-weight: bold; }
          .debt { color: #dc2626; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; padding-top: 15px; }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
                          <h1>🥭 MangoMoney - {t('completeWealthReport')}</h1>
                      <p><strong>{t('dateAt').split(':')[0]}:</strong> ${currentDate} {t('dateAt').split(':')[1]} ${currentTime}</p>
                      <p class="total">{t('netWorth')}: ${formatCurrencyWithPrivacy(totals.total)}</p>
        </div>
        
        <div class="summary">
          <h3>📊 Riepilogo Generale</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${totalItems}</div>
              <div class="summary-label">Elementi Totali</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrencyWithPrivacy(totals.total)}</div>
              <div class="summary-label">{t('netWorth')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrencyWithPrivacy(Math.abs(totals.debts))}</div>
              <div class="summary-label">Debiti Totali</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrencyWithPrivacy(totals.cash)}</div>
              <div class="summary-label">{t('liquidity')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrencyWithPrivacy(totals.investments + assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}</div>
              <div class="summary-label">{t('investments')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrencyWithPrivacy(totals.realEstate)}</div>
              <div class="summary-label">Immobili</div>
            </div>
          </div>
        </div>
    `);

    Object.entries(assets).forEach(([section, items]) => {
      let sectionTotal = 0;
      let sectionItems: any[] = [];
      
      if (section === 'realEstate') {
        const properties = items as RealEstate[];
        sectionTotal = properties.reduce((sum: number, item: RealEstate) => sum + item.value, 0);
        sectionItems = properties.map((item: RealEstate) => ({
          name: item.name,
          amount: item.value,
          description: item.description,
          notes: item.address || '',
          isDebt: false
        }));
      } else if (section === 'investmentPositions') {
        const positions = items as InvestmentPosition[];
        sectionTotal = positions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0);
        sectionItems = positions.map((item: InvestmentPosition) => ({
          name: item.name,
          amount: item.amount,
          description: item.description,
          notes: item.notes,
          isDebt: false
        }));
      } else if (section === 'transactions') {
        const transactions = items as Transaction[];
        sectionTotal = transactions.reduce((sum: number, item: Transaction) => sum + item.amount, 0);
        sectionItems = transactions.map((item: Transaction) => ({
          name: item.name,
          amount: item.amount,
          description: item.description,
          notes: `${item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'} - ${item.quantity} unità`,
          isDebt: false
        }));
      } else {
        const assetItems = items as AssetItem[];
        sectionTotal = assetItems.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
        sectionItems = assetItems.map((item: AssetItem) => ({
          name: item.name,
          amount: item.amount,
          description: item.description,
          notes: item.notes,
          isDebt: section === 'debts'
        }));
      }
      
      printWindow.document.write(`
        <div class="section">
          <h2 class="section-title">${sections[section as keyof typeof sections]}</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Importo</th>
                <th>Descrizione</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
      `);
      
      sectionItems.forEach((item: any) => {
        const isEmergency = emergencyFundAccount.section === section && emergencyFundAccount.id === item.id;
        const isDebt = item.isDebt;
        printWindow.document.write(`
          <tr>
            <td>${isEmergency ? '🚨 ' : ''}${item.name}</td>
            <td class="amount ${isDebt ? 'debt' : ''}">${formatCurrency(isDebt ? Math.abs(item.amount) : item.amount)}${isDebt ? ' 🔻' : ''}</td>
            <td>${item.description}</td>
            <td>${item.notes}</td>
          </tr>
        `);
      });
      
      printWindow.document.write(`
              <tr class="total-row">
                <td><strong>Totale ${sections[section as keyof typeof sections]}</strong></td>
                <td class="amount"><strong>${formatCurrency(section === 'debts' ? Math.abs(sectionTotal) : sectionTotal)}${section === 'debts' ? ' 🔻' : ''}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
    });

    printWindow.document.write(`
        <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Generato da MangoMoney v2.0 - ${new Date().toLocaleString('it-IT')}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Import functionality
  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.json')) {
              showNotification('Per favore seleziona un file JSON valido.', 'error');
      event.target.value = '';
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
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
        
        // Validate the imported data structure
        if (!importedData.assets || typeof importedData.assets !== 'object') {
          throw new Error('Struttura dati non valida: manca la sezione "assets"');
        }

        // Validate required asset sections
        const requiredSections = ['cash', 'debts', 'investments', 'investmentPositions', 'transactions', 'realEstate', 'pensionFunds', 'otherAccounts', 'alternativeAssets'];
        for (const section of requiredSections) {
          if (!Array.isArray(importedData.assets[section])) {
            throw new Error(`Sezione "${section}" mancante o non valida`);
          }
        }

        // Validate metadata
        if (!importedData.metadata || typeof importedData.metadata !== 'object') {
          throw new Error('Metadati mancanti o non validi');
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
          
          // Currency and language settings
          if (importedData.settings.selectedCurrency) {
            setSelectedCurrency(importedData.settings.selectedCurrency);
          }
          if (importedData.settings.selectedLanguage) {
            setSelectedLanguage(importedData.settings.selectedLanguage);
          }
          
          // SWR settings
          if (importedData.settings.swrRate !== undefined) {
            setSwrRate(importedData.settings.swrRate);
          }
          
          // UI settings
          if (importedData.settings.darkMode !== undefined) {
            setDarkMode(importedData.settings.darkMode);
          }
          if (importedData.settings.forceMobileLayout !== undefined) {
            setForceMobileLayout(importedData.settings.forceMobileLayout);
          }
        }
        
        // Import legacy settings from metadata (backward compatibility)
        if (importedData.metadata.emergencyFundAccount) {
          setEmergencyFundAccount(importedData.metadata.emergencyFundAccount);
        }
        if (importedData.metadata.monthlyExpenses) {
          setMonthlyExpenses(importedData.metadata.monthlyExpenses);
        }

        // Show success message with details
        const totalItems = Object.values(importedData.assets).reduce((sum: number, section: unknown) => sum + (Array.isArray(section) ? section.length : 0), 0);
        
        showNotification(`Backup importato con successo! ${totalItems} elementi caricati.`, 'success');
        
      } catch (error) {
        showNotification(`Errore nell'importazione. Verifica che il file sia un backup valido di MangoMoney.`, 'error');
      }
    };

    reader.onerror = () => {
      showNotification('Errore nella lettura del file. Riprova.', 'error');
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // CSV Import functionality for transactions
  const downloadCSVTemplate = () => {
    const csvContent = `${t('csvTemplateHeaders')}\n${t('csvTemplateExample')}`;
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mangomoney-transactions-template.csv';
    link.click();
    URL.revokeObjectURL(url);
          showSuccess(t('downloadCSVTemplate'));
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

  const sanitizeCSVValue = (value: string): string => {
    return value
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:text\/html/gi, '') // Remove data:text/html
      .replace(/vbscript:/gi, '') // Remove vbscript:
      .replace(/expression\s*\(/gi, '') // Remove CSS expressions
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/&/g, '&amp;') // Encode ampersands
      .replace(/"/g, '&quot;') // Encode quotes
      .replace(/'/g, '&#x27;') // Encode apostrophes
      .trim();
  };

  const importTransactionsFromCSV = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await withLoading('importing', async () => {
    // Validazione file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Per favore seleziona un file CSV valido.');
    }

    if (file.size > 5 * 1024 * 1024) {
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

        const requiredFields = ['Nome', 'Ticker', 'ISIN', 'Tipo Transazione', 'Quantità', 'Importo', 'Commissioni', 'Data'];
        const missingFields = requiredFields.filter(field => !header.includes(field));
    
        if (missingFields.length > 0) {
      throw new Error(`Campi obbligatori mancanti: ${missingFields.join(', ')}`);
        }

        // Get field indices
    const indices = {
      name: header.indexOf('Nome'),
      ticker: header.indexOf('Ticker'),
      isin: header.indexOf('ISIN'),
      type: header.indexOf('Tipo Transazione'),
      quantity: header.indexOf('Quantità'),
      amount: header.indexOf('Importo'),
      fees: header.indexOf('Commissioni'),
      date: header.indexOf('Data')
    };

    // Parse data rows con validazione avanzata
        const newTransactions: Transaction[] = [];
    const errors: string[] = [];
        let successCount = 0;

        for (let i = 1; i < lines.length; i++) {
          try {
        const values = lines[i].split(',').map(v => sanitizeCSVValue(v.replace(/"/g, '')));
        
        if (values.length < header.length) {
          errors.push(`Riga ${i + 1}: numero di colonne insufficiente`);
          continue;
        }

        // Estrazione e validazione valori
        const rowData = {
          name: values[indices.name]?.trim(),
          ticker: values[indices.ticker]?.trim(),
          isin: values[indices.isin]?.trim(),
          type: values[indices.type]?.trim().toLowerCase(),
          quantity: values[indices.quantity]?.trim(),
          amount: values[indices.amount]?.trim(),
          fees: values[indices.fees]?.trim() || '0',
          date: values[indices.date]?.trim()
        };

        // Validazioni specifiche
        if (!rowData.name || rowData.name.length < 2) {
          errors.push(`Riga ${i + 1}: nome mancante o troppo corto`);
              continue;
            }

        const numQuantity = parseFloat(rowData.quantity);
        const numAmount = parseFloat(rowData.amount);
        const numFees = parseFloat(rowData.fees);

        if (isNaN(numQuantity) || numQuantity <= 0) {
          errors.push(`Riga ${i + 1}: quantità non valida`);
              continue;
            }

        if (isNaN(numAmount) || numAmount <= 0) {
          errors.push(`Riga ${i + 1}: importo non valido`);
          continue;
        }

        if (isNaN(numFees) || numFees < 0) {
          errors.push(`Riga ${i + 1}: commissioni non valide`);
          continue;
        }

        // Validazione data
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(rowData.date)) {
          errors.push(`Riga ${i + 1}: formato data non valido (richiesto YYYY-MM-DD)`);
              continue;
            }

        const transactionDate = new Date(rowData.date);
        if (isNaN(transactionDate.getTime())) {
          errors.push(`Riga ${i + 1}: data non valida`);
          continue;
        }

        // Validazione tipo transazione
        let transactionType: 'purchase' | 'sale';
        if (rowData.type.includes('acquisto') || rowData.type.includes('purchase') || rowData.type.includes('buy')) {
          transactionType = 'purchase';
        } else if (rowData.type.includes('vendita') || rowData.type.includes('sale') || rowData.type.includes('sell')) {
          transactionType = 'sale';
            } else {
          errors.push(`Riga ${i + 1}: tipo transazione non riconosciuto (${rowData.type})`);
              continue;
            }

        // Creazione transazione
        const maxId = Math.max(...assets.transactions.map((t: Transaction) => t.id), 0);
            const newTransaction: Transaction = {
          id: maxId + 1 + successCount,
          name: sanitizeString(rowData.name),
          ticker: sanitizeTicker(rowData.ticker),
          isin: sanitizeISIN(rowData.isin),
          transactionType,
              quantity: numQuantity,
              amount: numAmount,
              commissions: numFees,
          date: rowData.date,
          description: `${transactionType === 'purchase' ? 'Acquisto' : 'Vendita'} di ${rowData.name} (importato da CSV)`,
              linkedToAsset: undefined
            };

            newTransactions.push(newTransaction);
            successCount++;

          } catch (error) {
        errors.push(`Riga ${i + 1}: errore generico - ${error instanceof Error ? error.message : 'errore sconosciuto'}`);
          }
        }

        if (newTransactions.length === 0) {
      throw new Error(`Nessuna transazione valida trovata. Errori: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '...' : ''}`);
        }

    // Aggiorna state
        setAssets(prev => ({
          ...prev,
          transactions: [...prev.transactions, ...newTransactions]
        }));

    return { successCount, errorCount: errors.length, errors };
  },
  (result) => {
    let message = `${result?.successCount} transazioni importate con successo`;
    if (result?.errorCount && result.errorCount > 0) {
      message += `, ${result.errorCount} righe ignorate`;
    }
    showSuccess(message);
  },
  (error) => showError(`Errore nell'importazione: ${error.message}`)
  );

    event.target.value = '';
}, [withLoading, assets.transactions, setAssets, showSuccess, showError, sanitizeString, sanitizeTicker, sanitizeISIN]);

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
    handleDeleteItem
  }: { 
    transactions: Transaction[]; 
    darkMode: boolean;
    formatCurrency: (amount: number) => string;
    handleEditRow: (section: string, id: number) => void;
    handleCopyRow: (section: string, id: number) => void;
    handleDeleteItem: (section: string, id: number) => void;
  }) => {
    const renderTransactionRow = useCallback((transaction: Transaction, index: number, style: React.CSSProperties) => (
      <div style={style} className={`flex items-center px-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex-1 grid grid-cols-8 gap-4 items-center">
          <span className="truncate">{transaction.name}</span>
          <span className="truncate">{transaction.ticker}</span>
          <span className="truncate">{transaction.isin}</span>
          <span className={`px-2 py-1 rounded text-xs ${transaction.transactionType === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {transaction.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'}
          </span>
          <span className="text-right font-mono">{transaction.quantity.toLocaleString()}</span>
                          <span className="text-right font-mono">{formatCurrencyWithPrivacy(transaction.amount)}</span>
                <span className="text-right font-mono">{formatCurrencyWithPrivacy(transaction.commissions)}</span>
          <div className="flex justify-center gap-1">
            <button 
              onClick={() => handleEditRow('transactions', transaction.id)} 
              className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`} 
              title="Modifica riga" 
              aria-label={`Modifica ${transaction.name}`} 
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
              aria-label={`Duplica ${transaction.name}`} 
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
              aria-label={`Elimina ${transaction.name}`} 
              tabIndex={0} 
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') { 
                  e.preventDefault(); 
                  if (window.confirm(`Eliminare ${transaction.name}?`)) { 
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
    ), [darkMode, handleEditRow, handleCopyRow, handleDeleteItem]);

    const renderHeader = useCallback(() => (
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="grid grid-cols-8 gap-4 text-xs font-medium">
          <span>Nome</span>
          <span>Ticker</span>
          <span>ISIN</span>
          <span>Tipo</span>
          <span className="text-right">Quantità</span>
          <span className="text-right">Importo</span>
          <span className="text-right">Commissioni</span>
          <span className="text-center">Azioni</span>
        </div>
      </div>
    ), [darkMode]);

    if (transactions.length > 100) { // Usa virtualizzazione solo per liste lunghe
      return (
        <VirtualizedTable
          data={transactions}
          rowHeight={48}
          containerHeight={400}
          renderRow={renderTransactionRow}
          renderHeader={renderHeader}
          className="border border-gray-200"
        />
      );
    }

    // Fallback per liste corte
    return (
      <div className="overflow-x-auto">
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
                        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>🔄 {t('automaticBackups')}</h4>
        
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
                      ⚠️ Backup consigliato
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
              autoBackup.performBackup();
              // Aggiorna timestamp ultimo backup manuale
              localStorage.setItem('mangomoney-last-backup-time', new Date().toISOString());
              refreshBackups();
              showSuccess('Backup manuale creato');
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
          formatter={(value: string | number) => [formatCurrency(Number(value)), 'Importo']}
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
  const AddItemForm = ({ section }: { section: string }) => {
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
      assetType: 'other'
    });
    const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
    const [propertyType, setPropertyType] = useState<'primary' | 'secondary'>('primary');
    // Validation schemas for different sections
    const getValidationSchema = (section: string): ValidationSchema => {
      const baseSchema: ValidationSchema = {
        name: { required: true, minLength: 2, maxLength: 100 },
        amount: { required: true, section },
        description: { maxLength: 500 },
        notes: { maxLength: 1000 }
      };

      switch (section) {
        case 'transactions':
          return {
            ...baseSchema,
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
          const newPosition: InvestmentPosition = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            ticker: sanitizeTicker(formData.sector || ''),
            isin: sanitizeISIN(formData.notes || ''),
            amount: Math.abs(sanitizeNumber(formData.amount)),
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
          const newTransaction: Transaction = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            ticker: sanitizeTicker(formData.sector || ''),
            isin: sanitizeISIN(formData.notes || ''),
            transactionType: transactionType,
            amount: Math.abs(sanitizeNumber(formData.amount)),
            quantity: sanitizeInteger(formData.quantity),
            commissions: sanitizeNumber(formData.fees),
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
          const newProperty: RealEstate = {
            id: maxId + 1,
            name: sanitizeString(formData.name),
            description: sanitizeString(formData.description),
            value: Math.abs(sanitizeNumber(formData.amount)),
            type: propertyType,
            address: sanitizeString(formData.notes || ''),
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
            name: sanitizeString(formData.name),
            amount: section === 'debts' ? -Math.abs(sanitizeNumber(formData.amount)) : Math.abs(sanitizeNumber(formData.amount)),
            description: sanitizeString(formData.description),
            notes: sanitizeString(formData.notes),
            ...(section === 'investments' && {
              fees: sanitizeNumber(formData.fees),
              quantity: sanitizeInteger(formData.quantity),
              avgPrice: sanitizeNumber(formData.avgPrice),
              currentPrice: sanitizeNumber(formData.currentPrice),
              lastPriceUpdate: new Date().toISOString().split('T')[0],
              sector: sanitizeTicker(formData.sector),
              isin: sanitizeISIN(formData.notes)
            }),
            ...(section === 'cash' && {
              accountType: formData.accountType
            }),
            ...(section === 'alternativeAssets' && {
              assetType: formData.assetType
            })
          };

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
      return (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full p-3 border-2 border-dashed rounded-lg transition-colors ${
            darkMode 
              ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300' 
              : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <PlusCircle size={20} />
                                    <span>{t('addNewItem')}</span>
          </div>
        </button>
      );
    }

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                  {t('addNewItem')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
              } ${validation.errors.name ? 'border-red-500' : ''}`}
              placeholder="Inserisci il nome"
            />
            {validation.errors.name && <p className="text-red-500 text-xs mt-1">{validation.errors.name}</p>}
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
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                }`}
                placeholder="es. AAPL, VWCE"
              />
            ) : (
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                } ${validation.errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
              />
            )}
            {validation.errors.amount && <p className="text-red-500 text-xs mt-1">{validation.errors.amount}</p>}
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
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Indirizzo
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                }`}
                placeholder="Indirizzo dell'immobile"
              />
            </div>
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
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
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'current' | 'deposit' })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                }`}
              >
                                        <option value="current">{t('currentAccount')}</option>
                        <option value="deposit">{t('depositAccount')}</option>
                <option value="cash">{t('cashAccountType')}</option>
              </select>
            </div>
          )}

          {section === 'alternativeAssets' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo Asset
              </label>
              <select
                value={formData.assetType || 'other'}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value as 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'other' })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                <option value="other">{t('other')}</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Aggiungi
          </button>
          <button
            onClick={handleCancel}
            className={`px-4 py-2 rounded transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Annulla
          </button>
        </div>
      </div>
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
        {section === 'otherAccounts' && '🏛️'}
        {section === 'alternativeAssets' && '🎨'}
        {section === 'realEstate' && '🏠'}
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Benvenuto nella sezione {sections[section as keyof typeof sections]}
      </h3>

      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        {t('addYourAssets')}
      </p>
    </div>
  );

  // Compact pie chart component for all sections - Optimized with React.memo
  const CompactPieChart = React.memo(({ data, size = 200, title = "", showLegend = true }: CompactPieChartProps) => {
    const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null);
    const total = data.reduce((sum: number, item: ChartDataItem) => sum + item.value, 0);
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
                {localHoveredIndex !== null ? formatCurrency(segments[localHoveredIndex].value) : `€${Math.round(total/1000)}k`}
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
                  className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
                    localHoveredIndex === index 
                      ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') 
                      : 'hover:' + (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                  }`}
                  onMouseEnter={() => setLocalHoveredIndex(index)}
                  onMouseLeave={() => setLocalHoveredIndex(null)}
                  title={entry.fullName || entry.name}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className={`font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(entry.value)}</div>
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <div className="flex items-center">
                <img 
                  src={require('./images/logo.png')} 
                  alt="MangoMoney" 
                  className="h-10 md:h-14 w-auto object-contain"
                />
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {t('totalAssets')}: <span className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrencyWithPrivacy(totals.total)}</span>
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('lastSaved')}: {lastSaved.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Mobile: Compact button row */}
            <div className="flex flex-wrap gap-1 md:hidden">
              <button
                onClick={toggleDarkMode}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-2 rounded h-8 w-8 flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12`}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              
              <button
                onClick={toggleMobileLayout}
                className={`px-2 py-1 rounded text-xs transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12 h-8 w-8 flex items-center justify-center ${
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
                className={`px-2 py-1 rounded text-xs transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12 h-8 w-8 flex items-center justify-center ${
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
                <button className={`px-2 py-1 rounded text-xs transition-colors h-8 ${
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
              
              {/* Import/Export - Mobile */}
              <div className="relative">
                <input
                  type="file"
                  id="import-file-mobile"
                  accept=".json"
                  onChange={importFromFile}
                  className="hidden"
                />
                <label
                  htmlFor="import-file-mobile"
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center justify-center cursor-pointer h-8 w-8 transition-all duration-300 ease-in-out transform hover:scale-110"
                  title="Importa backup JSON di MangoMoney"
                >
                  <Upload size={14} />
                </label>
              </div>
              
              <div className="relative group">
                <button className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 flex items-center justify-center h-8 w-8 transition-all duration-300 ease-in-out transform hover:scale-110">
                  <Download size={14} />
                </button>
                <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="py-1">
                    <button
                      onClick={() => exportToJSON()}
                      className={`block w-full text-left px-3 py-2 text-sm transition-all duration-200 ease-in-out transform hover:scale-105 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      📄 {t('export')} JSON
                    </button>
                    <button
                      onClick={() => exportToCSV()}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      📊 {t('export')} CSV
                    </button>
                    <button
                      onClick={() => exportToPDF()}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      📋 {t('export')} PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop: Full button row */}
            <div className="hidden md:flex gap-1 md:gap-2">
              <button
                onClick={toggleDarkMode}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-2 rounded h-10 w-10 flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12`}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              <button
                onClick={toggleMobileLayout}
                className={`px-3 py-2 rounded text-xs transition-all duration-300 ease-in-out transform hover:scale-105 hover:rotate-12 h-10 w-10 flex items-center justify-center ${
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
                className={`px-3 py-2 rounded text-xs transition-all duration-300 ease-in-out transform hover:scale-105 hover:rotate-12 h-10 w-10 flex items-center justify-center ${
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
                <button className={`px-3 py-2 rounded text-xs transition-all duration-300 ease-in-out transform hover:scale-105 h-10 ${
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
              

              
              <div className="relative">
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={importFromFile}
                  className="hidden"
                />
                <label
                  htmlFor="import-file"
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center gap-1 cursor-pointer h-10 transition-all duration-300 ease-in-out transform hover:scale-105"
                  title="Importa backup JSON di MangoMoney"
                >
                  <Upload size={16} />
                  <span className="hidden md:inline">{t('import')} backup</span>
                </label>
              </div>
              
              <div className="relative group">
                <button className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 flex items-center gap-1 h-10 transition-all duration-300 ease-in-out transform hover:scale-105">
                  <Download size={16} />
                  <span className="hidden md:inline">{t('export')}</span>
                </button>
                <div className={`absolute right-0 mt-2 w-36 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="py-1">
                    <button
                      onClick={exportToJSON}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Backup completo con tutti i dati e impostazioni"
                    >
                      JSON Backup
                    </button>
                    <button
                      onClick={exportToCSV}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Esporta dati dettagliati in formato CSV"
                    >
                      {t('detailedCSV')}
                    </button>
                    <button
                      onClick={exportToExcel}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Esporta dati in formato Excel-compatibile"
                    >
                      Excel (CSV)
                    </button>
                    <button
                      onClick={exportToPDF}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Genera report PDF stampabile"
                    >
                      PDF Report
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={resetData}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center gap-1 h-10 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <RotateCcw size={16} />
                <span className="hidden md:inline">{t('reset')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-t`}>
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex space-x-2 md:space-x-6 overflow-x-auto">
            {['overview', 'statistics', ...Object.keys(sections)].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-3 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-300 ease-in-out transform hover:scale-105 ${
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
              className={`py-3 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeSection === 'settings'
                  ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={() => setActiveSection('info')}
              className={`py-3 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-300 ease-in-out transform hover:scale-105 ${
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

      <main className="max-w-7xl mx-auto px-3 py-4">
        {activeSection === 'overview' && (
          <div className="animate-fadeIn">
            {/* Welcome message when no data */}
            {totals.total === 0 ? (
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
                  <div className={`grid gap-3 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-4'}`}>
                    {Object.entries(totals).slice(0, 4).map(([key, value], index) => (
                      <div key={key} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 animate-scaleIn`} style={{ animationDelay: `${index * 100}ms` }}>
                        <h4 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                          {sections[key as keyof typeof sections] || key}
                      </h4>
                        <p className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${key === 'debts' ? 'text-red-500' : ''}`}>
                          {formatCurrency(key === 'debts' ? Math.abs(value) : value)}
                          {key === 'debts' && value < 0 && <span className="text-red-400"> 🔻</span>}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {totals.total > 0 && key !== 'debts' ? ((value / totals.total) * 100).toFixed(1) : key === 'debts' ? ((Math.abs(value) / (totals.total + Math.abs(totals.debts))) * 100).toFixed(1) : '0'}%
                      </p>
                    </div>
                    ))}
                    </div>
                    
                  <div className={`grid gap-3 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {Object.entries(totals).slice(4, 7).map(([key, value], index) => (
                      <div key={key} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 animate-scaleIn`} style={{ animationDelay: `${(index + 4) * 100}ms` }}>
                        <h4 className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                          {sections[key as keyof typeof sections] || key}
                      </h4>
                      <p className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {formatCurrency(value)}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {totals.total > 0 ? ((value / totals.total) * 100).toFixed(1) : '0'}%
                      </p>
                    </div>
                    ))}
                    </div>
                  </div>
                  
                <div className="space-y-6">
                  {/* Pie Chart - Horizontal Layout */}
                  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('assetDistribution')}</h3>
                    {filteredPieData.length === 0 ? (
                      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="mb-4">
                                                      <p className="text-lg mb-2">📊 {t('noAssetsToDisplay')}</p>
                          <p className="text-sm">{t('addAssetsForDistribution')}</p>
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
                            💼 {t('addInvestments')}
                          </button>
                          <button 
                            onClick={() => setActiveSection('realEstate')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              darkMode 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            🏠 {t('addRealEstate')}
                          </button>
                          <button 
                            onClick={() => setActiveSection('cash')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              darkMode 
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            }`}
                          >
                            💰 {t('addLiquidity')}
                          </button>
                        </div>
                        <div className="mt-4 text-xs">
                          <p>💡 Suggerimento: Inizia con i tuoi asset principali per vedere la distribuzione</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <CompactPieChart data={filteredPieData} size={240} showLegend={false} />
                        </div>
                        <div className="flex-1 ml-8 min-w-0">
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
                                    {formatCurrency(item.value)}
                                  </div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {totals.total > 0 ? ((item.value / totals.total) * 100).toFixed(1) : '0'}%
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
                                                      <p className="text-lg mb-2">📊 {t('noDataToDisplay')}</p>
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
                            💼 Aggiungi Investimenti
                          </button>
                          <button 
                            onClick={() => setActiveSection('realEstate')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              darkMode 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            🏠 Aggiungi Immobili
                          </button>
                        </div>
                        <div className="mt-4 text-xs">
                          <p>💡 Suggerimento: Inizia aggiungendo i tuoi asset principali per vedere la distribuzione</p>
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

                {/* Safe Withdrawal Rate Simulation */}
                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow mt-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('swrSimulation')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('swrRate')} ({swrRate}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={swrRate}
                        onChange={(e) => setSwrRate(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: darkMode ? '#374151' : '#e5e7eb',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>5%</span>
                        <span>10%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('swrMonthlyExpenses')}
                      </label>
                      <input
                        type="number"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                        placeholder="0"
                        step="50"
                      />
                    </div>
                  </div>

                  {(() => {
                    const swrData = calculateSWR();
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {formatCurrencyWithPrivacy(swrData.netLiquidAssets)}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('swrNetLiquidAssets')}
                          </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {formatCurrencyWithPrivacy(swrData.annualWithdrawal)}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('swrAnnualWithdrawal')} ({swrRate}%)
                          </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {formatCurrencyWithPrivacy(swrData.monthlyWithdrawal)}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('swrMonthlyWithdrawal')}
                          </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            {swrData.yearsOfSupport.toFixed(1)}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('swrYearsOfSupport')}
                          </div>
                        </div>
                      </div>
                      
                      {monthlyExpenses > 0 && (
                        <div className={`${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg p-4 mb-4 border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                          <div className="text-center">
                            <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
                              <strong>Confronto:</strong> Con spese mensili di {formatCurrencyWithPrivacy(monthlyExpenses)}, il prelievo del {privacyMode ? '••••••••' : swrRate}% degli asset liquidi ({formatCurrencyWithPrivacy(swrData.monthlyWithdrawal)}/mese) 
                              {swrData.monthlyWithdrawal >= monthlyExpenses ? ' copre' : ' non copre'} le tue spese
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {swrData.monthlyWithdrawal >= monthlyExpenses 
                                ? `✅ Copertura: ${((swrData.monthlyWithdrawal / monthlyExpenses) * 100).toFixed(1)}% delle spese`
                                : `⚠️ Copertura: ${((swrData.monthlyWithdrawal / monthlyExpenses) * 100).toFixed(1)}% delle spese`
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                    {t('swrExplanation')}
                  </div>
                  
                  <div className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-600'} font-medium`}>
                    {t('swrDisclaimer')}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeSection === 'statistics' && (
          <div className="space-y-4 animate-slideIn">
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>📊 {t('advancedStatistics')}</h2>
            
            {/* Main Statistics Grid */}
            {loadingStates.calculating ? (
              <StatsSkeleton darkMode={darkMode} />
            ) : (
            <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {/* Risk Score */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 animate-scaleIn`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} mr-3`}>
                    <Calculator className={`h-6 w-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <div>
                                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('riskScoreTitle')}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.riskScore}/10</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {parseFloat(statistics.riskScore) < 3 ? t('veryConservative') : 
                                                parseFloat(statistics.riskScore) < 5 ? t('conservative') :
                         parseFloat(statistics.riskScore) < 7 ? t('moderate') : t('aggressive')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Fund */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'} mr-3`}>
                    <Target className={`h-6 w-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                  </div>
                  <div>
                                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('emergencyFundTitle')}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.emergencyMonths}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {statistics.emergencyFundStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Debt to Asset */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} mr-3`}>
                    <span className={`text-sm font-bold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>D</span>
                  </div>
                  <div>
                                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('debtToWealthRatio')}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.debtToAssetPercentage}%</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {statistics.debtHealth}
                    </p>
                  </div>
                </div>
              </div>

              {/* Liquidity */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} mr-3`}>
                    <span className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>L</span>
                  </div>
                  <div>
                                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('liquidity')}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.liquidityPercentage}%</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {statistics.liquidityHealth}
                    </p>
                  </div>
                </div>
              </div>

              {/* Investments */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'} mr-3`}>
                    <span className={`text-sm font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>I</span>
                  </div>
                  <div>
                                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('investments')}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.investmentPercentage}%</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {t('ofWealth')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Positions */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'} mr-3`}>
                    <span className={`text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>P</span>
                  </div>
                  <div>
                                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('totalPositions')}</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.totalPositions}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {statistics.activePositions} {t('active')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Metodologie e Basi Teoriche - SPOSTATO QUI ALLA FINE */}
            <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} rounded-lg shadow-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : 'text-indigo-800'} flex items-center`}>
                📊 {t('methodologiesTheoreticalBases')}
              </h3>
              
              <div className={`space-y-4 text-sm ${darkMode ? 'text-gray-200' : 'text-indigo-900'}`}>
                <div>
                  <h4 className="font-semibold mb-2">📊 {t('riskScoreTitle')} (0-10)</h4>
                                      <p className="mb-2">{t('riskScoreBasedOnMPT')}</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                                          <li><strong>{t('liquidity')}:</strong> {t('liquidityRiskDescription')}</li>
                                          <li><strong>{t('otherAccounts')}:</strong> {t('otherAccountsRiskDescription')}</li>
                                          <li><strong>{t('pensionFunds')}:</strong> {t('pensionFundsRiskDescription')}</li>
                                          <li><strong>{t('realEstate')}:</strong> {t('realEstateRiskDescription')}</li>
                                          <li><strong>{t('globalPositions')}:</strong> {t('globalPositionsRiskDescription')}</li>
                                          <li><strong>{t('investments')}/{t('transactions')}:</strong> {t('investmentsTransactionsRiskDescription')}</li>
                                          <li><strong>{t('alternativeAssets')}:</strong> {t('alternativeAssetsRiskDescription')}</li>
                  </ul>
                                          <p className="mt-2 italic">{t('riskScoreFormula')}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🛡️ {t('emergencyFundHeading')}</h4>
                                      <p>{t('basedOnFinancialPlanning')}</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li><strong>{t('optimal')}:</strong> {t('optimalMonths')}</li>
                                            <li><strong>{t('adequate')}:</strong> {t('adequateMonths')}</li>
                                            <li><strong>{t('insufficient')}:</strong> {t('insufficientMonths')}</li>
                  </ul>
                                      <p className="italic">{t('emergencyFundFormula')}</p>
                </div>



                <div>
                                      <h4 className="font-semibold mb-2">💰 {t('financialHealth')}</h4>
                                      <p>{t('additionalMetricsForFinancialHealth')}</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li><strong>{t('debtToWealthRatio')}:</strong> {t('debtToWealthRatioDescription')}</li>
                                            <li><strong>{t('liquidity')}:</strong> {t('liquidityDescription')}</li>
                                            <li><strong>{t('investments')}:</strong> {t('investmentsDescription')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">💡 Fonti Teoriche</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Harry Markowitz</strong> - Modern Portfolio Theory (1952)</li>
                    <li><strong>William Sharpe</strong> - Capital Asset Pricing Model</li>
                    <li><strong>Benjamin Graham</strong> - Security Analysis e Value Investing</li>
                                            <li><strong>John Bogle</strong> - {t('johnBoglePrinciples')}</li>
                    <li><strong>Robert Merton</strong> - Financial Planning e Lifecycle Investing</li>
                  </ul>
                </div>
              </div>
            </div>
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
                      <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                      <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                      <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrizione</th>
                      <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Note</th>
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
              <div className="mt-2 text-right">
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {t('totalLabel')} {formatCurrencyWithPrivacy(assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}
                </span>
              </div>
                </>
              )}
            </div>

            {/* Add Global Position Form */}
            <div>
                                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('addGlobalPosition')}</h4>
              <AddItemForm section="investmentPositions" />
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
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ticker</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ISIN</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantità</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rendimento</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Collegato a</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.investments.map((item: AssetItem) => {
                        const manualPerformance = calculateAssetPerformance(item);
                        const transactionPerformance = calculateTransactionBasedPerformance(item);
                        const linkedTransactions = assets.transactions.filter((t: Transaction) => t.linkedToAsset === item.id);
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
                              className={`text-xs px-1 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
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
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
                  {t('individualPositionsLabel')}: {assets.investments.length} • {t('totalAssetsLabel')} {formatCurrency(assets.investments.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
                </span>
              </div>
            </div>



            {/* Add Individual Position Form */}
            <div>
              <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('addAsset')}</h4>
              <AddItemForm section="investments" />
            </div>

            {/* History Table */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('transactionHistory')}</h3>
              
              {/* CSV Import Section */}
              <div className={`mb-4 p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('importTransactionsFromCSV')}</h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('csvImportInstructions')}</p>
                      </div>
                  <div className="flex gap-2">
                        <button 
                      onClick={downloadCSVTemplate}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                            darkMode 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                      📥 {t('downloadCSVTemplate')}
                        </button>
                    <label className={`px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            darkMode 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                    }`}>
                      📤 {t('importTransactions')}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={importTransactionsFromCSV}
                        className="hidden"
                      />
                    </label>
                      </div>
                      </div>
                    </div>
              
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
                    className={`w-full text-xs px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
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
                    className={`w-full text-xs px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
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
                    className={`w-full text-xs px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
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
                  />
                )}
                
                {/* Pagination */}
                {totalTransactionPages > 1 && (
                  <div className="mt-4 flex justify-between items-center">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Mostrando {((currentTransactionPage - 1) * transactionsPerPage) + 1} - {Math.min(currentTransactionPage * transactionsPerPage, filteredTransactions.length)} di {filteredTransactions.length} transazioni
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentTransactionPage(prev => Math.max(1, prev - 1))}
                        disabled={currentTransactionPage === 1}
                        className={`px-3 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500' : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400'}`}
                      >
                        ←
                      </button>
                      {Array.from({ length: Math.min(5, totalTransactionPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalTransactionPages - 4, currentTransactionPage - 2)) + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentTransactionPage(page)}
                            className={`px-3 py-1 text-xs border rounded ${currentTransactionPage === page ? 
                              (darkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-500 border-blue-500 text-white') :
                              (darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentTransactionPage(prev => Math.min(totalTransactionPages, prev + 1))}
                        disabled={currentTransactionPage === totalTransactionPages}
                        className={`px-3 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500' : 'bg-white border-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400'}`}
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
              
              <div className="mt-2 text-right">
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                      {t('totalTransactionsLabel')} {formatCurrency(assets.transactions.reduce((sum: number, item: Transaction) => sum + item.amount, 0))}
                </span>
              </div>
            </div>

            {/* Add Transaction Form */}
            <div>
                                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('addTransaction')}</h4>
              <AddItemForm section="transactions" />
            </div>

            {/* Transaction-Asset Reconciliation Dashboard */}
            {(assets.transactions.length > 0 || assets.investments.length > 0) && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  🔗 {t('reconciliation')}
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {t('verifyLinksBetweenTransactionsAssets')}
                  </p>
                </h3>
                
                {(() => {
                  const linkedTransactions = assets.transactions.filter((t: Transaction) => t.linkedToAsset);
                  const assetsWithTransactions = assets.investments.filter((asset: AssetItem) => 
                    assets.transactions.some((t: Transaction) => t.linkedToAsset === asset.id)
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
                          📊 Asset con Performance Basata su Transazioni
                        </h4>
                        {assetsWithTransactions
                          .filter((asset: AssetItem) => asset.currentPrice && asset.currentPrice > 0)
                          .map((asset: AssetItem) => {
                            const transactionPerformance = calculateTransactionBasedPerformance(asset);
                            const manualPerformance = calculateAssetPerformance(asset);
                            const linkedTransactions = assets.transactions.filter((t: Transaction) => t.linkedToAsset === asset.id);
                            
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
                  🔗 {t('verifyLinks')}
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
                                  {formatCurrency(data.globalValue)}
                                </div>
                              </div>
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('linkedAssetsLabel')}</span>
                                <div className={`font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {formatCurrency(data.totalLinkedValue)}
                                </div>
                              </div>
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('differenceLabel')}</span>
                                <div className={`font-mono ${data.isValid ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                                  {formatCurrency(data.deviation)} ({((data.deviation / data.globalValue) * 100).toFixed(1)}%)
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('linkedAssetsTitle')}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {data.linkedAssets.map((asset: AssetItem) => (
                                  <span key={asset.id} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {asset.name} ({formatCurrency(asset.amount)})
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
                    {formatCurrency(assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {t('totalInvestmentValue')}
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    {assets.investmentPositions.length + assets.investments.length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {t('totalPositions')}
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                    {totals.total > 0 ? (((assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0)) / totals.total) * 100).toFixed(1) : '0'}%
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
                  📊 {t('transactionStatistics')}
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                                          {t('transactionAnalysisPerYear')}
                  </p>
                </h3>
                
                {(() => {
                  const transactionStats = getTransactionStats();
                  const years = Object.keys(transactionStats).sort((a, b) => parseInt(b) - parseInt(a));
                  
                  return (
                    <div className="space-y-4">
                      {years.map((year) => {
                        const stats = transactionStats[year];
                        return (
                          <div key={year} className={`p-4 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              Anno {year}
                            </h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Transazioni:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {stats.count}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Investito:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                                  {formatCurrency(stats.totalInvested)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Venduto:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                                  {formatCurrency(stats.totalSold)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Commissioni:</span>
                                <div className={`font-mono font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                  {formatCurrency(stats.totalCommissions)}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('netInvestment')}:</span>
                                <div className={`font-mono font-semibold ${stats.netInvestment >= 0 ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                                  {formatCurrency(stats.netInvestment)}
                                </div>
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

            {/* Investment Chart */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                              <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CompactPieChart 
                      data={getSectionChartData('investments')} 
                      size={180} 
                      showLegend={false}
                    />
                  </div>
                  <div className="flex-1 ml-6 min-w-0">
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
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>

            {/* Portfolio Performance Summary - Moved to bottom */}
            {(() => {
              const hasAssetsWithPrices = portfolioPerformance.assets.some((asset: AssetWithPerformance) => asset.currentPrice && asset.currentPrice > 0);
              
              if (!hasAssetsWithPrices) {
                return (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      📊 Performance Portfolio
                    </h4>
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="mb-4">
                                                  <p className="text-lg mb-2">📈 {t('enterCurrentPricesForPerformance')}</p>
                        <p className="text-sm">{t('addCurrentPricesForPerformance')}</p>
                      </div>
                      <div className="mt-4 text-xs">
                        <p>💡 {t('updatePricesTip')}</p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                  <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    📊 Performance Portfolio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Investito</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {formatCurrency(portfolioPerformance.totalInvested)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Valore Attuale</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {formatCurrency(portfolioPerformance.totalCurrentValue)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${portfolioPerformance.totalReturn >= 0 ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : (darkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalReturn')}</div>
                      <div className={`text-lg font-semibold ${portfolioPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(portfolioPerformance.totalReturn)}
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
                        {formatCurrency(portfolioPerformance.annualizedReturn)}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${portfolioPerformance.annualizedReturnPercentage >= 0 ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : (darkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rendimento ann. %</div>
                      <div className={`text-lg font-semibold ${portfolioPerformance.annualizedReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioPerformance.annualizedReturnPercentage.toFixed(2)}%
                      </div>
                    </div>
                    
                    {/* Performance Chart */}
                    <div className="mt-4 col-span-full">
                      <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        📈 Performance per Asset
                      </h5>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Performance List */}
                        <div className="space-y-2">
                          {portfolioPerformance.assets
                            .filter((asset: AssetWithPerformance) => asset.currentPrice && asset.currentPrice > 0)
                            .sort((a: AssetWithPerformance, b: AssetWithPerformance) => b.performance.percentageReturn - a.performance.percentageReturn)
                            .map((asset: AssetWithPerformance) => (
                              <div key={asset.id} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                      {asset.name} ({asset.sector || t('notAvailable')})
                                    </div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {asset.quantity || 0} × {formatCurrency(asset.currentPrice || asset.avgPrice || 0)} = {formatCurrency((asset.currentPrice || asset.avgPrice || 0) * (asset.quantity || 0))}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${asset.performance.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {asset.performance.percentageReturn.toFixed(1)}%
                                    </div>
                                    <div className={`text-xs ${asset.performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(asset.performance.totalReturn)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        {/* Performance Trend Chart */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <h6 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            📊 {t('performanceTrend')}
                          </h6>
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
                                        {asset.name.substring(0, 15)}{asset.name.length > 15 ? '...' : ''}
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
                      📊 {t('manageInvestments')}
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
                      const linkedTransactions = assets.transactions.filter((t: Transaction) => t.linkedToAsset === item.id);
                      
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
                              {formatCurrency(item.amount)}
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
                                    {formatCurrency(transactionPerformance.totalReturn)} ({transactionPerformance.percentageReturn.toFixed(1)}%)
                                  </div>
                                ) : manualPerformance.totalReturn !== 0 ? (
                                  <div className={`${manualPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(manualPerformance.totalReturn)} ({manualPerformance.percentageReturn.toFixed(1)}%)
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
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ticker</th>
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ISIN</th>
                          <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantità</th>
                          <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                          <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rendimento</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Collegato a</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.investments.map((item: AssetItem) => {
                          const manualPerformance = calculateAssetPerformance(item);
                          const transactionPerformance = calculateTransactionBasedPerformance(item);
                          const linkedTransactions = assets.transactions.filter((t: Transaction) => t.linkedToAsset === item.id);
                          return (
                          <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.sector || '-'}</td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.isin || '-'}</td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity?.toLocaleString() || '-'}</td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.amount)}</td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs`}>
                              {linkedTransactions.length > 0 ? (
                                <div className={`${transactionPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div>{formatCurrency(transactionPerformance.totalReturn)}</div>
                                  <div className="text-xs">{transactionPerformance.percentageReturn.toFixed(1)}% (T)</div>
                                </div>
                              ) : manualPerformance.totalReturn !== 0 ? (
                                <div className={`${manualPerformance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div>{formatCurrency(manualPerformance.totalReturn)}</div>
                                  <div className="text-xs">{manualPerformance.percentageReturn.toFixed(1)}% (M)</div>
                                </div>
                              ) : '-'}
                            </td>
                            <td className={`border px-2 py-1 text-center`}>
                              <select
                                value={item.linkedToGlobalPosition || ''}
                                onChange={(e) => handleLinkToGlobalPosition(item.id, e.target.value ? parseInt(e.target.value) : null)}
                                className={`text-xs px-1 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
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
                  {t('individualPositionsLabel')}: {assets.investments.length} • {t('totalAssetsLabel')} {formatCurrency(assets.investments.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
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
                                        📊 {t('backToInvestments')}
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
                    </div>

                    <div>
                  <h3 className="text-xl font-semibold mb-4">{t('usefulThings')}</h3>
                  <ul className="list-disc list-inside space-y-2 text-lg">
                    <li>{t('totalPrivacy')}</li>
                    <li>{t('automaticBackupsDesc')}</li>
                    <li>{t('multiCurrencyLanguages')}</li>
                    <li>{t('responsive')}</li>
                      </ul>
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
                ⚙️ {t('settings')}
              </h2>
              
              <div className={`space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {/* Currency Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">💱 {t('currency')}</h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                              {t('selectCurrency')}
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className={`w-full md:w-64 px-3 py-2 border rounded-md text-sm ${
                        darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
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
                  <h3 className="text-xl font-semibold mb-4">💰 {t('taxSettings')}</h3>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 space-y-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('capitalGainsTaxRate')}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={capitalGainsTaxRate}
                          onChange={(e) => setCapitalGainsTaxRate(parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('currentAccountStampDutyAmount')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentAccountStampDuty}
                          onChange={(e) => setCurrentAccountStampDuty(parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('currentAccountStampDutyThreshold')}
                        </label>
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={currentAccountStampDutyThreshold}
                          onChange={(e) => setCurrentAccountStampDutyThreshold(parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('depositAccountStampDutyRate')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={depositAccountStampDutyRate}
                          onChange={(e) => setDepositAccountStampDutyRate(parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          setCapitalGainsTaxRate(26.0);
                          setCurrentAccountStampDuty(34.20);
                          setCurrentAccountStampDutyThreshold(5000);
                          setDepositAccountStampDutyRate(0.20);
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

                {/* Emergency Fund Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('emergencyFundWithIcon')}</h3>
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
                          value={emergencyFundOptimalMonths}
                          onChange={(e) => setEmergencyFundOptimalMonths(parseFloat(e.target.value) || 6)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
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
                          value={emergencyFundAdequateMonths}
                          onChange={(e) => setEmergencyFundAdequateMonths(parseFloat(e.target.value) || 3)}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'
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

                {/* Backup Management */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">🔄 Backup Management</h3>
                  <BackupManager />
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeSection !== 'overview' && activeSection !== 'statistics' && activeSection !== 'info' && activeSection !== 'settings' && activeSection !== 'investments') && (
          <div className="space-y-6 animate-slideIn">
            {/* Welcome message or data table */}
            {(() => {
              const sectionAssets = activeSection === 'alternativeAssets' ? paginatedAlternativeAssets : assets[activeSection as keyof typeof assets] as AssetItem[];
              const totalAssets = activeSection === 'alternativeAssets' ? filteredAlternativeAssets : assets[activeSection as keyof typeof assets] as AssetItem[];
              const allAssets = assets[activeSection as keyof typeof assets] as AssetItem[];
              
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
                        className={`w-full md:w-64 text-sm px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
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
                        <option value="other">{t('other')}</option>
                      </select>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('name')}</th>
                          <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('amount')}</th>
                          {activeSection === 'cash' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('accountType')}</th>
                          )}
                          {activeSection === 'alternativeAssets' && (
                            <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('assetType')}</th>
                          )}
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('description')}</th>
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('notes')}</th>
                          <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionAssets.map((item: AssetItem) => (
                          <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {emergencyFundAccount.section === activeSection && emergencyFundAccount.id === item.id && '🚨 '}
                              {item.name}
                            </td>
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'} ${activeSection === 'debts' && item.amount < 0 ? 'text-red-600' : ''}`}>
                              {formatCurrency(activeSection === 'debts' ? Math.abs(item.amount) : item.amount)}
                              {activeSection === 'debts' && item.amount < 0 && <span className="text-red-500 ml-1">🔻</span>}
                            </td>
                            {activeSection === 'cash' && (
                              <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                <span className={`px-2 py-1 rounded text-xs ${item.accountType === 'current' ? 'bg-blue-100 text-blue-800' : item.accountType === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {item.accountType === 'current' ? t('currentAccountType') : item.accountType === 'deposit' ? t('depositAccountType') : item.accountType === 'cash' ? t('cashAccountType') : t('notAvailable')}
                                </span>
                              </td>
                            )}
                            {activeSection === 'alternativeAssets' && (
                              <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-800'}`}>
                                  {item.assetType === 'tcg' ? t('tcg') : 
                                   item.assetType === 'stamps' ? t('stamps') :
                                   item.assetType === 'alcohol' ? t('alcohol') :
                                   item.assetType === 'collectibles' ? t('collectibles') :
                                   item.assetType === 'vinyl' ? t('vinyl') :
                                   item.assetType === 'books' ? t('books') :
                                   item.assetType === 'comics' ? t('comics') :
                                   item.assetType === 'art' ? t('art') :
                                   item.assetType === 'other' ? t('other') : t('notAvailable')}
                                </span>
                              </td>
                            )}
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {item.description}
                            </td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {item.notes}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-right">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${activeSection === 'debts' ? 'text-red-600' : ''}`}>
                      {t('totalLabel')} {formatCurrency(activeSection === 'debts' ? Math.abs(totalAssets.reduce((sum: number, item: AssetItem) => sum + item.amount, 0)) : totalAssets.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
                      {activeSection === 'debts' ? '🔻' : ''}
                    </span>
                  </div>
                  
                  {/* No Results Message for Alternative Assets */}
                  {activeSection === 'alternativeAssets' && filteredAlternativeAssets.length === 0 && allAssets.length > 0 && (
                    <div className="mt-4 text-center py-8">
                      <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>🔍</div>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nessun asset trovato
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {t('noAssetsOfType').replace('{type}', alternativeAssetFilter === 'tcg' ? t('tcg') :
                          alternativeAssetFilter === 'stamps' ? t('stamps') :
                          alternativeAssetFilter === 'alcohol' ? t('alcohol') :
                          alternativeAssetFilter === 'collectibles' ? t('collectibles') :
                          alternativeAssetFilter === 'vinyl' ? t('vinyl') :
                          alternativeAssetFilter === 'books' ? t('books') :
                          alternativeAssetFilter === 'comics' ? t('comics') :
                          alternativeAssetFilter === 'art' ? t('art') :
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
                  
                  {/* Alternative Asset Pagination */}
                  {activeSection === 'alternativeAssets' && filteredAlternativeAssets.length > 0 && totalAlternativeAssetPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Pagina {currentAlternativeAssetPage} di {totalAlternativeAssetPages} ({filteredAlternativeAssets.length} asset totali)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentAlternativeAssetPage(Math.max(1, currentAlternativeAssetPage - 1))}
                          disabled={currentAlternativeAssetPage === 1}
                          className={`px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'}`}
                        >
                          Precedente
                        </button>
                        <button
                          onClick={() => setCurrentAlternativeAssetPage(Math.min(totalAlternativeAssetPages, currentAlternativeAssetPage + 1))}
                          disabled={currentAlternativeAssetPage === totalAlternativeAssetPages}
                          className={`px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'}`}
                        >
                          Successiva
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Configurazione Fondo di Emergenza - Solo nella sezione Liquidità */}
            {activeSection === 'cash' && (
              <div className={`${darkMode ? 'bg-gradient-to-br from-green-900 to-blue-900' : 'bg-gradient-to-br from-green-50 to-blue-50'} rounded-lg shadow p-4 border ${darkMode ? 'border-green-800' : 'border-green-200'} mb-6`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-green-200' : 'text-green-800'} flex items-center`}>
                  ⚙️ {t('emergencyFundConfigurationTitle')}
                </h3>
                
                <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                                              {t('monthlyExpenses')}
                    </label>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${darkMode ? 'bg-green-800 border-green-600 text-green-100' : 'bg-white border-green-300'}`}
                      step="50"
                    />
                    {monthlyExpenses > 0 && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        💰 {t('withTotalLiquidity').replace('{amount}', formatCurrencyWithPrivacy(totals.cash)).replace('{months}', privacyMode ? '••••••••' : (totals.cash / monthlyExpenses).toFixed(1))}
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
                          {item.name} ({formatCurrency(item.amount)})
                        </option>
                      ))}
                    </select>
                    {statistics.emergencyFundValue > 0 && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        🚨 Il fondo di emergenza designato copre <strong>{statistics.emergencyMonths} mesi</strong> di spese
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add Item Form */}
            <AddItemForm section={activeSection} />

            {/* Grafici a Torta - Solo per sezioni che non sono alternativeAssets e debts */}
            {activeSection !== 'alternativeAssets' && activeSection !== 'debts' && assets[activeSection as keyof typeof assets].length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CompactPieChart 
                      data={getSectionChartData(activeSection)} 
                      size={180} 
                      showLegend={false}
                    />
                  </div>
                  <div className="flex-1 ml-6 min-w-0">
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
                            {formatCurrency(item.value)}
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {t('editItem')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Common Fields */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {editingItem.section === 'realEstate' ? t('valueLabel') : t('amount')} *
                  </label>
                  <input
                    type="number"
                    value={editingItem.section === 'realEstate' ? editingItem.value || '' : editingItem.amount || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingItem.section === 'realEstate') {
                        setEditingItem({...editingItem, value});
                      } else {
                        setEditingItem({...editingItem, amount: value});
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                    }`}
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('description')}
                  </label>
                  <input
                    type="text"
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {/* Investment Positions Specific Fields */}
                {editingItem.section === 'investmentPositions' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Ticker
                      </label>
                      <input
                        type="text"
                        value={editingItem.ticker || ''}
                        onChange={(e) => setEditingItem({...editingItem, ticker: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                        value={editingItem.isin || ''}
                        onChange={(e) => setEditingItem({...editingItem, isin: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        placeholder="es. US0378331005"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Data Acquisto
                      </label>
                      <input
                        type="date"
                        value={editingItem.purchaseDate || ''}
                        onChange={(e) => setEditingItem({...editingItem, purchaseDate: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Note
                      </label>
                      <input
                        type="text"
                        value={editingItem.notes || ''}
                        onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
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
                        value={editingItem.sector || ''}
                        onChange={(e) => setEditingItem({...editingItem, sector: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                        value={editingItem.isin || ''}
                        onChange={(e) => setEditingItem({...editingItem, isin: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                        value={editingItem.quantity || ''}
                        onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Commissioni
                      </label>
                      <input
                        type="number"
                        value={editingItem.fees || ''}
                        onChange={(e) => setEditingItem({...editingItem, fees: parseFloat(e.target.value) || 0})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Prezzo Medio
                      </label>
                      <input
                        type="number"
                        value={editingItem.avgPrice || ''}
                        onChange={(e) => setEditingItem({...editingItem, avgPrice: parseFloat(e.target.value) || 0})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Prezzo Attuale
                      </label>
                      <input
                        type="number"
                        value={editingItem.currentPrice || ''}
                        onChange={(e) => setEditingItem({...editingItem, currentPrice: parseFloat(e.target.value) || 0})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Note
                      </label>
                      <input
                        type="text"
                        value={editingItem.notes || ''}
                        onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
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
                        value={editingItem.ticker || ''}
                        onChange={(e) => setEditingItem({...editingItem, ticker: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                        value={editingItem.isin || ''}
                        onChange={(e) => setEditingItem({...editingItem, isin: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        placeholder="es. US0378331005"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('transactionType')}
                      </label>
                      <select
                        value={editingItem.transactionType || 'purchase'}
                        onChange={(e) => setEditingItem({...editingItem, transactionType: e.target.value as 'purchase' | 'sale'})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                        value={editingItem.quantity || ''}
                        onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Commissioni
                      </label>
                      <input
                        type="number"
                        value={editingItem.commissions || ''}
                        onChange={(e) => setEditingItem({...editingItem, commissions: parseFloat(e.target.value) || 0})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Data
                      </label>
                      <input
                        type="date"
                        value={editingItem.date || ''}
                        onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('linkedToAsset')}
                      </label>
                      <select
                        value={editingItem.linkedToAsset || ''}
                        onChange={(e) => setEditingItem({...editingItem, linkedToAsset: e.target.value ? parseInt(e.target.value) : undefined})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                        value={editingItem.type || 'primary'}
                        onChange={(e) => setEditingItem({...editingItem, type: e.target.value as 'primary' | 'secondary'})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                      <input
                        type="text"
                        value={editingItem.address || ''}
                        onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        placeholder="Indirizzo dell'immobile"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Note
                      </label>
                      <input
                        type="text"
                        value={editingItem.notes || ''}
                        onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* Other Assets (Cash, Debts, Pension Funds, Other Accounts, Alternative Assets) */}
                {(editingItem.section === 'cash' || editingItem.section === 'debts' || editingItem.section === 'pensionFunds' || editingItem.section === 'otherAccounts' || editingItem.section === 'alternativeAssets') && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Note
                    </label>
                    <input
                      type="text"
                      value={editingItem.notes || ''}
                      onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
              
              {/* Account Type for Cash */}
              {editingItem.section === 'cash' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo Conto
                  </label>
                  <select
                    value={editingItem.accountType || 'current'}
                    onChange={(e) => setEditingItem({...editingItem, accountType: e.target.value as 'current' | 'deposit' | 'cash'})}
                    className={`w-full md:w-1/2 px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                    }`}
                  >
                                            <option value="current">{t('currentAccount')}</option>
                        <option value="deposit">{t('depositAccount')}</option>
                    <option value="cash">{t('cashAccountType')}</option>
                  </select>
                </div>
              )}

              {/* Asset Type for Alternative Assets */}
              {editingItem.section === 'alternativeAssets' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo asset
                  </label>
                  <select
                    value={editingItem.assetType || 'other'}
                    onChange={(e) => setEditingItem({...editingItem, assetType: e.target.value as 'tcg' | 'stamps' | 'alcohol' | 'collectibles' | 'vinyl' | 'books' | 'comics' | 'art' | 'other'})}
                    className={`w-full md:w-1/2 px-3 py-2 border rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
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
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  {t('save')}
                </button>
                <button
                  onClick={handleCancelEdit}
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
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-30'}`}>
            <div className={`max-w-sm w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-2xl border-2 p-4 transition-all duration-300 ${
              notification.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
              notification.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <span className="text-green-500">✅</span>}
                {notification.type === 'error' && <span className="text-red-500">❌</span>}
                {notification.type === 'info' && <span className="text-blue-500">ℹ️</span>}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                  className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
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