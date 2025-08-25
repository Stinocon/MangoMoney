// English translations for MangoMoney
/*
 * MangoMoney - Portfolio Tracker
 * Copyright (c) 2025 Stefano Conter
 * Licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

export const en = {
  // Navigation
  overview: 'Overview',
  liquidity: 'Liquidity',
  investmentsNav: 'Investments',
  realEstateNav: 'Real Estate',
  statistics: 'Statistics',
  info: 'Info',
  
  // Common
  name: 'Name',
  amount: 'Amount',
  description: 'Description',
  notes: 'Notes',
  actions: 'Actions',
  total: 'Total',
  totalLabel: 'Total:',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  copy: 'Copy',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  
  // Asset categories
  cash: 'Cash',
  debts: 'Debts',
  investments: 'Investments',
  investmentPositions: 'Investments',
  realEstate: 'Real Estate',
  pensionFunds: 'Pension Funds',
  otherAccounts: 'Other Accounts',
  alternativeAssets: 'Alternative Assets',
  
  // Investment specific
  globalPositions: 'Global Positions',
  individualPositions: 'Individual Positions',
  transactions: 'Transactions',
  ticker: 'Ticker',
  isin: 'ISIN',
  azione: 'Stock',
  etf: 'ETF',
  obbligazioneWhitelist: 'Whitelist Bond',
  obbligazione: 'Bond',
  quantity: 'Quantity',
  avgPrice: 'Avg Price',
  currentPrice: 'Current Price',
  purchaseDate: 'Purchase Date',
  transactionType: 'Transaction Type',
  purchase: 'Purchase',
  sale: 'Sale',
  commissions: 'Commissions',
  date: 'Date',
  linkedTo: 'Linked to',
  linkedToAsset: 'Linked to Asset',
  verifyLinks: 'Verify Links',
  performance: 'Performance',
  totalReturn: 'Total Return',
  percentageReturn: 'Return %',
  annualizedReturn: 'Annualized Return',
  annualizedReturnPercentage: 'Annualized Return %',

  performanceChart: 'Performance Chart',
  portfolioPerformance: 'Portfolio Performance',

  reconciliation: 'Reconciliation',
  costBasis: 'Cost Basis',
  transactionBased: 'Transaction Based',
  manualBased: 'Manual Based',
  
  // Real estate
  primary: 'Primary',
  secondary: 'Secondary',
  address: 'Address',
  propertyType: 'Property Type',
  value: 'Value',
  type: 'Type',
  primaryHome: 'Primary Home',
  secondaryHome: 'Secondary Home',
  excludeFromTotal: 'Exclude from total net worth',
  status: 'Status',
  
  // Statistics
  riskScore: 'Portfolio Risk Level',
  efficiencyScore: 'Efficiency (Sharpe Ratio)',
  emergencyFund: 'Emergency Fund',
  diversification: 'Diversification',
  concentration: 'Concentration',
  debtToAssetRatio: 'Debt-to-Asset Ratio',
  liquidityRatio: 'Liquidity Ratio',
  investmentEfficiency: 'Investment Efficiency',
  growthPotential: 'Growth Potential',
  
  // Safe Withdrawal Rate
  swrSimulation: 'Safe Withdrawal Rate Simulation',
  swrRate: 'Safe Withdrawal Rate',
  swrMonthlyWithdrawal: 'Monthly Withdrawal',
  swrYearsOfSupport: 'Years of SWR Support',

  // Clear All Transactions
  clearAllTransactions: 'Clear All Transactions',
  clearAll: 'Clear All',
  clearTransactionsConfirmMessage: 'Are you sure you want to clear all transactions? This action will require additional confirmations.',
  clearTransactionsWarningTitle: 'Warning: Irreversible Action',
  clearTransactionsWarningMessage: 'You are about to delete {count} transactions for a total value of {value}.',
  clearTransactionsWarning1: 'All transactions will be permanently deleted',
  clearTransactionsWarning2: 'Performance calculations based on transactions will no longer be available',
  clearTransactionsWarning3: 'An automatic backup will be created before deletion',
  clearTransactionsFinalTitle: 'Final Confirmation',
  clearTransactionsFinalMessage: 'To confirm deletion, type "DELETE" in the field below.',
  clearTransactionsPasswordLabel: 'Confirmation Password',
  clearTransactionsPasswordHint: 'Type "DELETE" to confirm permanent deletion',
  clearTransactionsPasswordError: 'Incorrect password. Type "DELETE" to confirm.',
  clearTransactionsSuccess: 'Deleted {count} transactions for a value of {value}. Backup created automatically.',
  clearTransactionsError: 'Error clearing transactions.',
  continue: 'Continue',
  iUnderstand: 'I Understand',
  deletePermanently: 'Delete Permanently',
  swrAdvancedCalculation: 'Advanced SWR Calculation',
  swrRiskAdjusted: 'Risk-adjusted SWR',
  swrInflationAdjusted: 'Inflation-adjusted SWR',
  swrNetLiquidAssets: 'Net Liquid Assets',
  swrMonthlyExpenses: 'Monthly Expenses',
  swrAnnualWithdrawal: 'Annual Withdrawal',
  swrExplanation: 'This simulation calculates whether withdrawing a certain percentage of your net liquid assets (cash + investments + other accounts) can cover your monthly expenses. The "Monthly Withdrawal" shows how much you would receive each month with the selected withdrawal rate.',
  swrDisclaimer: '⚠️ Extremely indicative and non-exhaustive calculation',
  
  // SWR Warning Messages
  swrHighInflationWarning: 'High inflation ({rate}%) reduces safe withdrawal rate by {adjustment}%',
  swrConservativePortfolioWarning: 'Conservative portfolio ({score}/10) allows slightly higher SWR (+{bonus}%)',
  swrInsufficientAssetsWarning: 'Asset base may be insufficient for long-term retirement',
  swrSmallPortfolioWarning: 'Portfolio size may be too small for reliable SWR application',
  swrInsufficientWithdrawalWarning: 'SWR withdrawal insufficient to cover monthly expenses',
  swrHighRiskWarning: 'High portfolio risk ({score}/10) reduces SWR by {adjustment}%',
  swrMonthlyExpensesNotSet: 'Monthly expenses not set - cannot calculate sustainability',
  swrRateTooHigh: 'SWR rate above 5% is considered risky',
  
  // Cost Basis Method
  costBasisMethod: 'Cost Basis Calculation Method',
  costBasisFIFO: 'FIFO (First In, First Out)',
  costBasisLIFO: 'LIFO (Last In, First Out)',
  costBasisAverage: 'Weighted Average Cost',
  costBasisExplanation: 'The cost basis calculation method determines how capital gains/losses are calculated. LIFO is often more tax-efficient in Italy.',
  
  // Messages
  noData: 'No data',
  welcomeMessage: 'Welcome to MangoMoney!',
  addYourAssets: 'Start adding your financial assets to track your net worth.',
  navigateSections: 'Navigate through sections to add bank accounts, investments, debts and more.',
  lastSaved: 'Last saved',
  totalAssets: 'Total Assets',
  
  // Forms
  addItem: 'Add Item',
  editItem: 'Edit Item',
  addProperty: 'Add Property',
  addTransaction: 'Add Transaction',
  
  // Charts
  assetDistribution: 'Asset Distribution',
  categoryComparison: 'Category Comparison',
  realEstateDistribution: 'Real Estate Distribution',
  
  // Toolbar
  darkMode: 'Dark/light mode',
  mobileLayout: 'Mobile layout',
  import: 'Import',
  export: 'Export',
  reset: 'Reset',

  language: 'Language',
  
  // Info section
  projectPurpose: 'Project Purpose',
  mainFeatures: 'Main Features',
  dataEntryGuide: 'Data Entry Guide',
  privacySecurity: 'Privacy and Security',
  supportProject: 'Support the Project',
  legalDisclaimer: 'Legal Disclaimer',
  
  // Info section detailed
  projectPurposeTitle: '🎯 Project Purpose',
  projectPurposeText: 'MangoMoney is a complete and absolutely non-professional portfolio tracker designed to help you monitor, analyze and optimize your net worth. The system supports management of the most common assets providing advanced analysis based on modern finance principles.',
  mainFeaturesTitle: '🚀 Main Features',
  liquidityManagement: 'Liquidity Management',
  investmentManagement: 'Investment Management',
  realEstateManagement: 'Real Estate Management',
  advancedAnalytics: 'Advanced Analytics',
  fiscalManagement: 'Integrated Fiscal Management',

  backupSecurity: 'Backup and Security',
  advancedUI: 'Advanced Interface',
  
  // Info section content
  liquidityDesc1: 'Bank accounts, cash and liquid instruments',
  liquidityDesc2: 'Emergency fund configuration',
  liquidityDesc3: 'Financial autonomy calculation',
  liquidityDesc4: 'Account type distinction (current, deposit, cash)',
  liquidityDesc5: 'Standardized fiscal column with consistent information',
  
  investmentDesc1: 'Global and individual positions',
  investmentDesc2: 'Transaction history with advanced filters',
  investmentDesc3: 'Performance tracking and annualized returns',
  investmentDesc4: 'Transaction linking to positions',
  investmentDesc5: 'Performance charts and trends',
  investmentDesc6: 'Complete asset typing (Stock, ETF, Bond, Whitelist Bond)',
  investmentDesc7: 'Automatic linking between asset type and integrated tax calculations',
  
  realEstateDesc1: 'Primary and secondary properties',
  realEstateDesc2: 'Real estate valuations',
  realEstateDesc3: 'Address and notes management',
  realEstateDesc4: 'Detailed notes and descriptions',
  
  analyticsDesc1: 'Risk score (0-10)',
  analyticsDesc2: 'Financial health metrics',
  analyticsDesc3: 'Safe Withdrawal Rate simulation',
  analyticsDesc4: 'Emergency fund analysis',
  analyticsDesc5: 'Commission and cost statistics',
  
  // Tax section
  taxCalculationTitle: 'Integrated tax system',
  taxCalculationDesc1: 'Automatic capital gains calculation on profitable sales',
  taxCalculationDesc2: 'Differentiated rates by asset type: standard vs whitelist bonds',
  taxCalculationDesc3: 'Capital gains monitoring per year in transaction statistics',
  taxCalculationDesc4: 'Tax application only on sales transactions with positive gains',
  taxCalculationDesc5: 'Detailed analysis by asset type with applied rates',
  taxCalculationDesc6: 'Calculations based on Italian tax regulations',
  taxCalculationDesc7: 'Standardized fiscal column with consistent information',
  taxCalculationDesc8: 'Stamp duty always highlighted in red for visual clarity',
  taxCalculationDesc9: 'Net yields highlighted with increased font weight',
  
  linkingDesc1: 'Linking global and individual positions',
  linkingDesc2: 'Automatic validation with 5% tolerance',
  linkingDesc3: 'Discrepancy verification and link status',
  linkingDesc4: 'Complete asset relationship management',
  
  backupDesc1: 'JSON, CSV, Excel, PDF export',
  backupDesc2: 'Secure import with validation',
  backupDesc3: 'Automatic local saving',
  backupDesc4: 'Completely local data',
  backupDesc5: 'Local persistence in browser',
  
  uiDesc1: 'Dark/light mode',
  uiDesc2: 'Responsive and mobile layout',
  uiDesc3: 'Advanced filters and pagination',
  uiDesc4: 'Centered notifications',
  uiDesc5: 'Dedicated settings section',
  uiDesc6: 'Centered columns with optimized responsive layout',
  uiDesc7: 'Standardized and readable fiscal information',
  
  configuration: 'Configuration',
  configDesc1: 'Tax settings (capital gains, stamp duty)',
  configDesc2: 'Currency selection (EUR, USD, GBP, CHF, JPY)',
  configDesc3: 'Quick configuration for Italy',
  configDesc4: 'Alternative assets management (TCG, collectibles, etc.)',
  
  dataEntryCategories: 'Data Categories',
  dataEntryDesc1: 'Global and individual positions',
  dataEntryDesc2: 'Transactions (purchases/sales)',
  dataEntryDesc3: 'Stocks, ETFs, bonds, crypto',
  dataEntryDesc4: 'Real estate and alternative assets',
  dataEntryDesc5: 'Bank accounts and liquidity',
  dataEntryDesc6: 'Symbol (BTC, ETH), quantity',
  dataEntryDesc7: 'Name, value, type, address',
  dataEntryDesc8: 'Description, estimated value',
  
  bestPractices: 'Best Practices',
  bestPracticesDesc1: 'Enter global positions first',
  bestPracticesDesc2: 'Link individual positions',
  bestPracticesDesc3: 'Record all transactions',
  bestPracticesDesc4: 'Update current prices',
  bestPracticesDesc5: 'Use filters for large datasets',
  bestPracticesDesc6: 'Configure emergency fund',
  bestPracticesDesc7: 'Export data regularly',
  bestPracticesDesc8: 'Configure tax rates for your country',
  bestPracticesDesc9: 'Verify tax calculations with an accountant',
  
  dataEntryTitle: '📝 Data Entry Guide',
  dataEntryCategory: 'Data Categories',

  privacyTitle: '🔒 Privacy and Security',
  localData: 'Completely local data',
  localDataText1: 'All data is stored locally in your browser',
  localDataText2: 'No transmission to external servers or third parties',
  localDataText3: 'No tracking, analytics or data collection',
  localDataText4: 'Automatic saving in localStorage',
  localDataText5: 'Manual backup via JSON export',
  localDataText6: 'Complete control over your financial data',
  supportTitle: '💖 Support the Project',
  supportText: 'If MangoMoney has been useful to you, consider supporting development with a small donation.',
  donatePayPal: 'Donate with PayPal',
  supportNote: 'Every contribution helps keep the project free and open source',
  disclaimerTitle: '⚠️ Legal Disclaimer',
  disclaimerText: 'MangoMoney is a portfolio monitoring tool for informational purposes. We assume no responsibility for the validity, accuracy or completeness of the data entered. Prices and valuations are indicative and may not reflect actual market values. Tax calculations are indicative and based on Italian regulations. We do not provide investment or tax advice. Use of this tool is at your own risk. Always consult a financial professional and accountant for investment decisions and official tax calculations.',
  developedWith: 'Developed with ❤️ for personal financial control',
  
  // Welcome messages
  welcomeCash: 'Welcome to the Liquidity section',
  welcomeDebts: 'Welcome to the Debts section',
  welcomeInvestments: 'Welcome to the Investments section',
  welcomeRealEstate: 'Welcome to the Real Estate section',
  welcomePensionFunds: 'Welcome to the Pension Funds section',
  welcomeOtherAccounts: 'Welcome to the Other Accounts section',
  welcomeAlternativeAssets: 'Welcome to the Alternative Assets section',
  
  // Individual positions specific
  individualPositionsAsset: 'Individual positions',
  welcomeIndividualPositions: 'Welcome to Individual Positions',
  individualPositionsTip: '💡 Tip: Individual positions allow you to track individual stocks, ETFs, bonds and other specific assets',
  linkIndividualPositions: 'Link individual positions',
  
  // Add asset messages
  addAssetsForDistribution: 'Add your assets to see the portfolio distribution.',
  addAssetsForComparison: 'Add assets to see the comparison between categories.',
  addAssetsForTracking: 'Add assets to track individual securities.',
  addAsset: 'Add Asset',
  addIndividualAsset: 'Add Individual Asset',
  addCurrentPricesForPerformance: 'To view performance charts and statistics, add current prices to your assets.',
  noIndividualAssetsRegistered: 'No individual assets registered.',
  noDataToDisplay: 'No data to display',
  noAssetsToDisplay: 'No assets to display',
  enterCurrentPricesForPerformance: 'Enter current prices to see performance',
  
  // Transaction history and filters
  transactionHistory: 'Transaction History',
  allTransactions: 'All',
  sortByDate: 'Sort by date',
  sortByName: 'Sort by name',
  sortByAmount: 'Sort by amount',
  sortByQuantity: 'Sort by quantity',
  purchases: 'Purchases',
  sales: 'Sales',
  filterByTicker: 'Filter by ticker...',
  filterByISIN: 'Filter by ISIN...',
  resetFilters: 'Reset Filters',
  noTransactionsFound: 'No transactions found with the applied filters.',
  tryModifyFilters: 'Try modifying the filters or add new transactions.',
  
  // Navigation buttons
  backToInvestments: 'Back to Investments',
  manageInvestments: 'Manage Investments',
  
  // Form labels and validation
  quantityRequired: 'Quantity is required',
  quantityTooHigh: 'Quantity is too high',
  
  // Info section content
  transactionHistoryAdvanced: 'Transaction history with advanced filters',
  transactionsPurchasesSales: 'Transactions (purchases/sales)',
  recordAllTransactions: 'Record all transactions',
  
  // Info section headings
  liquidityManagementHeading: 'Liquidity Management',
  investmentManagementHeading: 'Investment Management',
  realEstateManagementHeading: 'Real Estate Management',
  advancedAnalyticsHeading: 'Advanced Analytics',
  
  // Info section list items
  bankAccountsCashInstruments: 'Bank accounts, cash and liquid instruments',
  emergencyFundConfiguration: 'Emergency fund configuration',
  emergencyFundConfigurationTitle: 'Emergency Fund Configuration',
  financialAutonomyCalculation: 'Financial autonomy calculation',
  accountTypeDistinction: 'Account type distinction (current, deposit, cash)',
  globalIndividualPositions: 'Global and individual positions',
  linkingGlobalIndividualPositions: 'Linking global and individual positions',
  controlGlobalIndividualCorrespondence: 'Control of correspondence between global positions and individual assets',
  performanceTrackingAnnualized: 'Performance tracking and annualized returns',
  transactionPositionLinking: 'Transaction linking to positions',
  performanceChartsTrends: 'Performance charts and trends',
  primarySecondaryProperties: 'Primary and secondary properties',
  realEstateValuations: 'Real estate valuations',
  addressNotesManagement: 'Address and notes management',
  riskScore010: 'Risk score (0-10)',
  financialHealthMetrics: 'Financial health metrics',
  swrSimulationList: 'Safe Withdrawal Rate simulation',
  emergencyFundAnalysis: 'Emergency fund analysis',
  commissionCostStatistics: 'Commission and cost statistics',
  assetLinking: 'Asset Linking',
  automaticValidationTolerance: 'Automatic validation with 5% tolerance',
  
  // Autolink functionality
  autolinkTransactions: 'Autolink Transactions',
  autolinkDescription: 'Automatically link transactions to individual positions based on ISIN',
  autolinkCompleted: 'Autolink completed',
  autolinkNoTransactions: 'No transactions to link. Verify that ISINs match.',
  investmentValuesInfo: 'Investment Values Information',
  calculatedFromTransactions: 'Value calculated from transactions',
  manualGlobalPositions: 'Manual global positions value',
  difference: 'Difference',
  investmentValuesExplanation: 'The value shown in the overview is automatically calculated from transactions. To align the values, update manual global positions or use autolink to connect transactions.',
  discrepancyVerificationStatus: 'Discrepancy verification and link status',
  backupSecurityHeading: 'Backup and Security',
  jsonCsvExcelPdfExport: 'JSON, CSV, Excel, PDF export',
  secureImportValidation: 'Secure import with validation',
  automaticLocalSaving: 'Automatic local saving',
  completelyLocalData: 'Completely local data',
  advancedInterfaceHeading: 'Advanced Interface',
  darkLightMode: 'Dark/light mode',
  responsiveMobileLayout: 'Responsive and mobile layout',
  advancedFiltersPagination: 'Advanced filters and pagination',
  centeredNotifications: 'Centered notifications',
  dedicatedSettingsSection: 'Dedicated settings section',
  configurationHeading: 'Configuration',
  taxSettings: 'Tax settings (capital gains, stamp duty)',
  quickItalyConfiguration: 'Quick configuration for Italy',
  currencySelection: 'Currency selection (EUR, USD, GBP, CHF, JPY)',
  alternativeAssetsManagement: 'Alternative assets management (TCG, collectibles, etc.)',
  dataCategoriesHeading: 'Data Categories',
  bestPracticesHeading: 'Best Practices',
  enterGlobalPositionsFirst: 'Enter global positions first',
  updateCurrentPrices: 'Update current prices',
  useFiltersForLargeDatasets: 'Use filters for large datasets',
  stocksEtfsBondsCrypto: 'Stocks, ETFs, bonds, crypto',
  realEstateAlternativeAssets: 'Real estate and alternative assets',
  bankAccountsLiquidity: 'Bank accounts and liquidity',
  riskScoreFormula: 'Formula: (Σ(% allocation × risk weight) ÷ Σ(% allocation)) × (10 ÷ 5.0)',
  
  // Statistics section
  advancedStatistics: 'Advanced Statistics',
  transactionStatistics: 'Transaction Statistics',
  riskScoreTitle: 'Risk Score',
  
  // Risk score descriptions
  liquidityRiskDescription: 'Liquidity: 1.0 (minimal risk - high liquidity)',
  pensionFundsRiskDescription: 'Pension Funds: 2.0 (medium risk - regulated, long-term)',
  realEstateRiskDescription: 'Real Estate: 2.0 (medium risk - stable but illiquid)',
  globalPositionsRiskDescription: 'Global Positions: 3.0 (medium-high risk - broker accounts)',
  alternativeAssetsRiskDescription: 'Alternative Assets: 5.0 (very high risk - speculative assets)',
  otherAccountsRiskDescription: 'Other Accounts: 1.5 (low risk - various financial products)',
  investmentsTransactionsRiskDescription: 'Investments/Transactions: 4.0 (high risk - market volatility)',
  riskScoreBasedOnVolatility: 'Based on portfolio volatility calculated with Modern Portfolio Theory.',
  efficiencyBasedOnSharpe: 'Based on risk-adjusted return ratio.',
  transactionAnalysisPerYear: 'Transaction analysis per year',
  verifyLinksBetweenTransactionsAssets: 'Verify links between transactions and individual assets',
  filterByAssetType: 'Filter by asset type',
  sortByAssetType: 'Sort by asset type',
  assetTypeRequired: 'Asset type required',
  notAvailable: 'N/A',
  other: 'Other',
  transactionsUnits: 'transactions • units',
  transactionsLabel: '(Transactions)',
  manualLabel: '(Manual)',
  noAssetsLinkedToGlobalPositions: 'No assets linked to global positions.',
  useDropdownToLinkAssets: 'Use the "Linked to" dropdown to link individual assets.',
  okStatus: '✅ OK',
  discrepancyStatus: '⚠️ Discrepancy',
  globalPositionLabel: 'Global Position:',
  linkedAssetsLabel: 'Linked Assets:',
  differenceLabel: 'Difference:',
  linkedAssetsTitle: 'Linked assets:',
  
  // Statistics section main boxes
  netWorth: 'Net Worth',
  completeWealthReport: 'Complete Wealth Report',
  debtToWealthRatio: 'Debt/Wealth',
  debtToWealthRatioDescription: '<30% Excellent, <50% Good, >50% Attention',
  investmentsDescription: '% of wealth allocated to growth assets',
  ofWealth: 'of wealth',
  percentOfWealth: '% of Wealth',
  
  // Health status
  excellent: 'Excellent',
  good: 'Good',
  attention: 'Attention',
  additionalMetricsForFinancialHealth: 'Additional metrics to assess financial health:',
  liquidityDescription: '>10% Adequate, >5% Limited, <5% Insufficient',
  financialHealth: 'Financial Health',
  performanceTrend: 'Performance Trend',
  noGlobalPositionsRegistered: 'No global positions registered.',
  addGlobalPosition: 'Add Global Position',
  addGlobalPositionsForBrokerAccounts: 'Add global positions to track your broker accounts.',
  dateAt: 'Date: at',
  globalPositionType: 'Global Position',
  
  // Emergency Fund
  emergencyFundTitle: 'Emergency Fund',
  emergencyFundHeading: 'Emergency Fund',

  emergencyFundDesignated: 'The designated emergency fund covers months of expenses',
  basedOnFinancialPlanning: 'Based on Financial Planning and Behavioral Economics principles. Automatic classification:',
  optimalMonths: '≥6 months of expenses',
  adequateMonths: '3-6 months of expenses',
  insufficientMonths: '<3 months of expenses',
  emergencyFundFormula: 'Formula: Designated fund value ÷ Monthly expenses',
  
  // Emergency Fund Configuration
  noFundDesignated: 'No fund designated',
  veryConservative: 'Very Conservative',
  emergencyFundWithIcon: 'Emergency Fund',
  monthsForOptimal: 'Months for "Optimal"',
  monthsForAdequate: 'Months for "Adequate"',
  monthsForOptimalDescription: 'Number of months of expenses to consider the fund optimal',
  monthsForAdequateDescription: 'Number of months of expenses to consider the fund adequate',
  resetDefaults: 'Reset Defaults',
  emergencyFundSettingsReset: 'Emergency fund settings reset to default values',
  errorLogs: 'Error logs',
  viewErrorLogs: 'View error logs',
  clearErrorLogs: 'Clear error logs',
  noErrorLogs: 'No errors logged',
  errorLogContext: 'Context',
  errorLogMessage: 'Message',
  errorLogTimestamp: 'Timestamp',
  errorLogSeverity: 'Severity',
  
  // Global Positions
  globalPositionsDescription: 'General indication of value invested with brokers or banks',
  
  // Transactions
  addNewItem: 'Add new item',
  
  // Investment Values
  totalInvestmentValue: 'Total Investment Value',
  
  // Tips and Suggestions
  updatePricesTip: 'Tip: Update prices regularly to monitor your portfolio performance',
  customizeCircumstances: 'Customize based on your circumstances',
  

  
  // Risk Levels
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
  
  // Individual Positions
  individualPositionsLabel: 'Unique Assets',
  
  // Financial Principles
  johnBoglePrinciples: 'Diversification and low-cost principles',
  
  // GitHub Resources
  usefulFinancialResources: 'Useful financial resources on GitHub',
  
  // CSV Import
  importTransactions: 'Import Transactions',
  importTransactionsFromCSV: 'Import transactions from CSV',
  downloadCSVTemplate: 'Download CSV Template',
  csvImportInstructions: 'Upload a CSV file with transactions. The file must contain: Name, Ticker, ISIN, Transaction Type, Quantity, Amount, Fees, Date',
  csvImportSuccess: 'Transactions imported successfully',
  csvImportError: 'Error during import',
  csvInvalidFormat: 'Invalid CSV format',
  csvMissingRequiredFields: 'Missing required fields',
  csvInvalidData: 'Invalid data in CSV file',
  csvTemplateHeaders: 'Asset Type,Ticker,ISIN,Transaction Type,Quantity,Amount,Fees,Date',
  csvTemplateExample: 'ETF,SPY,US78462F1030,Purchase,100,150.50,2.50,2024-01-15',
  csvTemplateNote: 'The "Asset Type" field supports: Stock, ETF, Bond, Whitelist Bond',
  
  // Methodologies and Theoretical Bases
  methodologiesTheoreticalBases: 'Methodologies and Theoretical Bases',
  
  // Liquidity
  addLiquidity: 'Add Liquidity',
  addInvestments: 'Add Investments',
  withTotalLiquidity: 'With total liquidity ({amount}) you can survive for {months} months',
  
  // Investments
  totalPositions: 'Total Positions (Global)',
  active: 'active',
  
  // Monthly Expenses
  monthlyExpenses: 'Monthly Expenses',
  
  // Insufficient
  insufficient: 'Insufficient',
  optimal: 'Optimal',
  adequate: 'Adequate',
  limited: 'Limited',
  
  // Tax Settings


  
  // Currency

  currency: 'Currency',
  selectCurrency: 'Select currency',
  
  // Section descriptions
  alternativeAssetsDesc: 'Collectibles, art, alcohol or other',
  debtsDesc: 'Mortgages, loans and other liabilities',
  
  // Table totals
  totalAssetsLabel: 'Total Assets:',
  totalTransactionsLabel: 'Total Transactions:',
  totalPropertiesLabel: 'Total Properties:',
  netInvestment: 'Net Investment',
  
  // Settings
  settings: 'Settings',
  capitalGainsTax: 'Capital Gains Tax',
  capitalGainsTaxRate: 'Capital Gains Tax Rate (%)',
  whitelistBondsTaxRate: 'Whitelist Bonds Tax Rate (%)',
  capitalGains: 'Capital Gains',
  capitalGainsTaxes: 'Capital Gains Taxes',
  netCapitalGains: 'Net Capital Gains',
  taxableSales: 'Taxable Sales',
  exemptSales: 'Exempt Sales',
  totalProceeds: 'Total Proceeds',
  totalCostBasis: 'Total Cost Basis',
  capitalGainsYear: 'Capital Gains',
  taxesYear: 'Taxes',
  netGainsYear: 'Net Gains',
  taxDisclaimer: 'Indicative calculation based on Italian taxation. Consult an accountant for official calculations.',
  currentAccountStampDuty: 'Current Account Stamp Duty',
  currentAccountStampDutyAmount: 'Current Account Stamp Duty Amount (€)',
  currentAccountStampDutyThreshold: 'Current Account Stamp Duty Threshold (€)',
  depositAccountStampDuty: 'Deposit Account Stamp Duty',
  depositAccountStampDutyRate: 'Deposit Account Stamp Duty Rate (%)',
  inflationRate: 'Inflation Rate (%)',
  
  // Help tooltips for tax settings
  capitalGainsTaxRateHelp: 'Tax rate on capital gains from securities sales (Italy: 26%)',
  whitelistBondsTaxRateHelp: 'Reduced rate for Italian/EU government bonds (Italy: 12.5%)',
  currentAccountStampDutyHelp: 'Fixed stamp duty for current accounts with average balance >€5000 (Italy: €34.20)',
  currentAccountStampDutyThresholdHelp: 'Average balance threshold for current account stamp duty (Italy: €5000)',
  depositAccountStampDutyRateHelp: 'Proportional stamp duty rate for deposit accounts (Italy: 0.2%)',
  inflationRateHelp: 'Inflation rate for purchasing power and real SWR calculations (default: 2%)',
  
  saveSettings: 'Save Settings',
  settingsSaved: 'Settings saved',
  defaultItalianSettings: 'Default Italian Settings',
  
  // Validation messages
  amountMustBeValid: 'Amount must be a valid number',
  amountMustBePositive: 'Amount must be positive for assets',
  quantityMustBeInteger: 'Quantity must be an integer',
  quantityMustBePositive: 'Quantity must be greater than zero',
  fieldRequired: 'Field required',
  minLength: 'Minimum {min} characters',
  maxLength: 'Maximum {max} characters',
  minValue: 'Minimum value: {min}',
  maxValue: 'Maximum value: {max}',

  
  // Account types
  accountType: 'Account Type',
  currentAccountType: 'Current',
  depositAccountType: 'Deposit',
  remuneratedAccountType: 'Remunerated',
  cashAccountType: 'Cash',
  currentAccount: 'Current Account',
  depositAccount: 'Deposit Account',
  
  // Asset types
  assetType: 'Asset Type',
  allTypes: 'All Types',
  tcg: 'TCG',
  stamps: 'Stamps',
  alcohol: 'Alcohol',
  collectibles: 'Collectibles',
  vinyl: 'Vinyl',
  books: 'Books',
  comics: 'Comics',
  art: 'Art',
  selected: 'Selected',
  fees: 'Fees',
  primaryResidence: 'Primary Residence',
  secondaryProperty: 'Secondary Property',
  automaticBackups: 'Automatic Backups',
  backupNow: 'Backup Now',
  never: 'Never',
  lastBackup: 'Last Backup',
  usedSpace: 'Used Space',
  detailedCSV: 'Detailed CSV',
  whatIsMangoMoney: 'What is MangoMoney?',
  whatIsMangoMoneyDesc: 'MangoMoney is a portfolio tracker designed for those who want to keep track of their wealth without complications. The idea was born because managing everything in Excel isn\'t the best from an aesthetic point of view, and online services... well, I prefer to keep my data to myself.',
  nameOrigin: 'The name comes from "mangano i money" → mancano i soldi (they eat the money → money is missing). A bit ironic, but effective.',
  howItWorks: 'How it works',
  howItWorksDesc: 'You can enter all your assets: bank accounts, investments, real estate, even Pokémon if you consider them an investment. The app automatically calculates your net worth and gives you some interesting statistics, such as how much you could "withdraw" each month without affecting your capital or how long your emergency fund would last.',
  investmentsTracking: 'For investments, you can track both overall positions (what you have in your broker account) and individual securities. If you also record buy and sell transactions, the app will calculate performance more accurately.',
  
  // Sections for implemented calculations
  improvedCalculations: 'Advanced Calculations',
  riskScoreSmarter: 'Smarter Risk Score',
  riskScoreSmarterDesc: 'The app now uses historical volatilities calculated on real market data (instead of made-up weights) that are built into the app. For example: liquidity 0.5% volatility, stocks 18%, real estate 15%. It also considers how different assets affect each other. Result: a much more realistic score than before.',
  cagrTitle: 'CAGR (annualized return)',
  cagrDesc: 'Tells you how much an investment has grown "on average" each year. Example: if you invest €10,000 and after 5 years you have €15,000, the CAGR is 8.45% annually. Useful for comparing investments over different periods.',
  swrTitle: 'Safe Withdrawal Rate (SWR)',
  swrDesc: 'Based on American studies: how much you can withdraw each year from your portfolio without ever running out. The 4% rule says that from €1 million you can withdraw €40,000 per year (€3,333 per month) for 30+ years.',
  
  // Cost basis calculation methods
  costBasisMethods: 'Cost Basis Calculation Methods',
  costBasisMethodsDesc: 'The app supports three methods for calculating gains and losses:',
  fifoMethod: 'FIFO (First In, First Out)',
  fifoDesc: 'Sell first what you bought first',
  lifoMethod: 'LIFO (Last In, First Out)',
  lifoDesc: 'Sell first what you bought last (often more convenient in Italy for taxes)',
  averageCostMethod: 'Average Cost',
  averageCostDesc: 'Averages all your purchases',
  costBasisNote: 'You can choose the method in settings. LIFO is default because it usually works better fiscally.',
  
  // Precision and implemented features
  calculationPrecision: 'Calculation precision',
  precisionDesc: 'Uses precise financial mathematics (no rounding errors)',
  italianTaxes: 'Automatically calculates Italian taxes (capital gains, account stamps)',
  italianConfigTitle: 'Italian tax presets',
  italianConfigDesc1: 'Default configuration with Italian tax rates',
  italianConfigDesc2: 'Integrated and automatic tax calculation system',
  italianConfigDesc3: 'Complete whitelist bonds management with preferential rate',
  italianConfigDesc4: 'CSV templates optimized for Italian regulations',
  isinLinking: 'Automatically links transactions and assets via ISIN code',
  emergencyFundSmart: 'Intelligent emergency fund',
  emergencyFundSmartDesc: 'Automatically calculates how many months of expenses it covers. Tells you if it\'s adequate (3-6 months) or optimal (6+ months). Takes into account your specific situation.',
  
  // "Under the hood" section
  underTheHood: 'What\'s Under the Hood',
  reliableCalculations: 'Reliable calculations',
  reliableCalculationsDesc: 'Calculations aren\'t made up but follow recognized standards (like those used by real financial advisors). Every formula has precise logic behind it.',
  limitationsToKnow: 'Limits to know',
  historicalDataLimit: 'Historical data doesn\'t predict the future',
  swrLimit: 'Safe Withdrawal Rate is based on American markets',
  riskScoreLimit: 'Risk score assumes markets behave "normally" (spoiler: they don\'t always)',
  professionalAdvice: 'For serious stuff like buying a house or planning retirement, always consult a professional. This app helps you see the situation, but doesn\'t replace advice from someone who really knows.',
  
  // Sharpe Ratio translations
  sharpeRatio: 'Sharpe Ratio',
  sharpeRatioDesc: 'Measures how much return you get for each unit of risk. Higher = better.',
  riskAdjustedReturn: 'Risk-adjusted return',
  excellentSharpe: 'Excellent risk-return ratio',
  goodSharpe: 'Good risk-return ratio',
  poorSharpe: 'Poor risk-return ratio',
  veryPoorSharpe: 'Very poor risk-return ratio',
  sharpeRatioTooltip: 'Each unit of risk generates {sharpe} units of excess return compared to government bonds.',
  sharpeRatioInfo: 'The Sharpe Ratio measures your portfolio efficiency: how much excess return you get for each additional unit of risk compared to government bonds.',
  sharpeRatioExample: 'Example: Sharpe 1.5 = for each 1% of extra risk, you gain 1.5% more than BOT.',
  sharpeRatioLimitations: 'Limitations: Based on historical data, assumes normal distribution of returns (not always true in real markets).',
  insufficientData: 'Insufficient data for calculation',
  preliminaryCalculation: 'Preliminary calculation - limited data',
  
  // Theoretical sources
  theoreticalSources: 'Theoretical Sources',
  theoreticalSourcesDesc: 'The app is based on principles and methodologies recognized by the financial community:',
  markowitz: 'Harry Markowitz - Modern Portfolio Theory (1952)',
  sharpe: 'William Sharpe - Capital Asset Pricing Model and Sharpe Ratio',
  graham: 'Benjamin Graham - Security Analysis and Value Investing',
  bogle: 'John Bogle - Diversification principles and low costs',
  merton: 'Robert Merton - Financial Planning and Lifecycle Investing',
  trinityStudy: 'Trinity Study - Safe Withdrawal Rate (1998)',
  academicStandards: 'All calculations follow recognized academic and professional standards.',
  usefulThings: 'Some useful things to know',
  totalPrivacy: 'Total privacy: Everything stays in your browser. No data is ever sent anywhere. You can also download the app and use it completely offline.',
  automaticBackupsDesc: 'Automatic backups: The app automatically saves a copy of your data every 5 minutes. You can also export everything in various formats whenever you want.',
  multiCurrencyLanguages: 'Multi-currency and languages: Supports various currencies (EUR, USD, GBP, CHF, JPY) and two languages (Italian and English).',
  responsive: 'Responsive: Works well on both desktop and mobile, with interfaces optimized for each device.',
  standardizedFiscalInfo: 'Standardized fiscal information: Stamp duty always highlighted in red, net yields highlighted for clarity.',
  howToStart: 'How to start',
  howToStartDesc: 'The advice is to start with the basics: first add bank accounts and liquidity, then main investments. If you have a broker, first enter the total account value, then individual securities. The app will tell you if the accounts balance.',
  settingsConfig: 'For settings, there\'s a quick configuration for Italy that automatically sets the most common tax rates.',
  limitationsDisclaimer: 'Limitations and disclaimer',
  limitationsDesc: 'Prices don\'t update automatically - you have to enter them yourself. Calculations are purely indicative and do not replace in any way professional financial advice. This software is provided "as is" without any warranty of accuracy, completeness or suitability for specific purposes. The app does not provide investment advice and does not constitute an offer to sell or solicitation to purchase securities or other financial instruments. It is always advisable and recommended to rely on qualified professionals for investment decisions.',
  practicalNote: 'In practice: use at your own risk, but it should help you see the situation more clearly.',
  privacyDesc: 'Your data remains exclusively in your browser (localStorage) and is never transmitted to external servers. Data can be lost in the following cases: clearing browser cache, using incognito mode, deleting browsing data, browser updates, or hardware problems with the device.',
  securityChecks: 'The app includes various security checks to prevent problems with corrupted files or malformed data. To protect your data, regularly use automatic backups (every 5 minutes) and manual export in JSON format. We recommend saving a backup copy on an external device or personal cloud.',
  projectSupport: 'Project support',
  projectSupportDesc: 'If you find MangoMoney useful, you can buy me a coffee via PayPal. Every contribution helps keep the project free and open source.',
  usefulLinks: 'Useful links',
  italianFinanceResources: 'Italian Finance Resources - A collection of tools and resources for personal finance',
  linkedin: '💼 LinkedIn - My professional profile',
  github: '🐙 GitHub - Other projects',
  
  // Error messages
  errorInSection: 'Error in section {section}',
  errorLoadingSection: 'An error occurred while loading this section.',
  errorDetails: 'Error Details',
  retry: 'Retry',
  reloadPage: 'Reload Page',
  somethingWentWrong: 'Something went wrong',
  unexpectedError: 'An unexpected error occurred. Please refresh the page to continue.',
  invalidFormat: 'Invalid format',
  
  // Notifications and warnings
  dataLoadedSuccessfully: 'Data loaded successfully from local backup',
  dataNotSavedWarning: 'Your data might not have been saved. Are you sure you want to close the browser?',
  dataNotSavedRecentlyWarning: 'Your data might not have been saved in the last 30 seconds. We remind you to make a backup before closing the browser.',
  transactionCopiedSuccess: 'Transaction copied successfully. Filters reset to show the new transaction.',
  
  // UI messages
  noAssetsOfType: 'No assets of type "{type}" in your portfolio.',
  inYourPortfolio: 'in your portfolio',
  addRealEstate: 'Add Real Estate',
  processing: 'Processing...',
  valueLabel: 'Value',
  confirmDelete: 'Are you sure you want to delete this item? This action cannot be undone.',
  savedBackups: 'Saved Backups',
};
