import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Trash2, Download, Upload, RotateCcw, Moon, Sun, Calculator, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';


// Translation system
const translations = {
  it: {
    // Navigation
    overview: 'Panoramica',
    liquidity: 'Liquidità',
    investmentsNav: 'Investimenti',
    realEstateNav: 'Immobili',
    statistics: 'Statistiche',
    info: 'Info',
    
    // Common
    name: 'Nome',
    amount: 'Importo',
    description: 'Descrizione',
    notes: 'Note',
    actions: 'Azioni',
    total: 'Totale',
    totalLabel: 'Totale:',
    add: 'Aggiungi',
    edit: 'Modifica',
    delete: 'Elimina',
    copy: 'Copia',
    save: 'Salva',
    cancel: 'Annulla',
    close: 'Chiudi',
    
    // Asset categories
    cash: 'Liquidità',
    debts: 'Debiti',
    investments: 'Investimenti',
    realEstate: 'Immobili',
    pensionFunds: 'Fondi pensione',
    otherAccounts: 'Altri conti',
    alternativeAssets: 'Beni alternativi',
    
    // Investment specific
    globalPositions: 'Posizioni Globali',
    individualPositions: 'Posizioni Individuali',
    transactions: 'Transazioni',
    ticker: 'Ticker',
    isin: 'ISIN',
    quantity: 'Quantità',
    avgPrice: 'Prezzo medio',
    purchaseDate: 'Data acquisto',
    transactionType: 'Tipo transazione',
    purchase: 'Acquisto',
    sale: 'Vendita',
    commissions: 'Commissioni',
    date: 'Data',
    linkedTo: 'Collegato a',
    verifyLinks: 'Verifica Collegamenti',
    
    // Real estate
    primary: 'Primaria',
    secondary: 'Secondaria',
    address: 'Indirizzo',
    propertyType: 'Tipo proprietà',
    
    // Statistics
    riskScore: 'Score di Rischio',
    emergencyFund: 'Fondo Emergenza',
    diversification: 'Diversificazione',
    concentration: 'Concentrazione',
    debtToAssetRatio: 'Rapporto Debiti/Patrimonio',
    liquidityRatio: 'Rapporto Liquidità',
    investmentEfficiency: 'Efficienza Investimenti',
    growthPotential: 'Potenziale di Crescita',
    
    // Safe Withdrawal Rate
    swrSimulation: 'Simulazione Safe Withdrawal Rate',
    swrRate: 'Tasso di Prelievo Sicuro',
    swrMonthlyWithdrawal: 'Prelievo Mensile',
    swrYearsOfSupport: 'Anni di Sostentamento',
    swrNetLiquidAssets: 'Asset Liquidi Netti',
    swrMonthlyExpenses: 'Spese Mensili',
    swrAnnualWithdrawal: 'Prelievo Annuo',
    swrExplanation: 'Questa simulazione calcola se il prelievo di una certa percentuale dei tuoi asset liquidi netti (contanti + investimenti + altri conti) può coprire le tue spese mensili. Il "Prelievo Mensile" mostra quanto riceveresti ogni mese con il tasso di prelievo selezionato.',
    swrDisclaimer: '⚠️ Calcolo estremamente indicativo e non esaustivo',
    
    // Messages
    noData: 'Nessun dato',
    welcomeMessage: 'Benvenuto in MangoMoney!',
    addYourAssets: 'Inizia ad aggiungere i tuoi asset finanziari per tenere traccia del tuo patrimonio netto.',
    navigateSections: 'Naviga nelle sezioni per aggiungere conti bancari, investimenti, debiti e altro ancora.',
    lastSaved: 'Ultimo salvataggio',
    totalAssets: 'Patrimonio totale',
    
    // Forms
    addItem: 'Aggiungi Elemento',
    editItem: 'Modifica Elemento',
    addProperty: 'Aggiungi Immobile',
    addTransaction: 'Aggiungi Transazione',
    
    // Charts
    assetDistribution: 'Distribuzione patrimonio',
    categoryComparison: 'Confronto categorie',
    realEstateDistribution: 'Distribuzione immobili',
    
    // Toolbar
    darkMode: 'Modalità scura/chiara',
    mobileLayout: 'Layout mobile',
    import: 'Importa',
    export: 'Esporta',
    reset: 'Reset',
    currency: 'Valuta',
    language: 'Lingua',
    
    // Info section
    projectPurpose: 'Scopo del progetto',
    mainFeatures: 'Funzionalità principali',
    dataEntryGuide: 'Guida all\'inserimento dati',
    controlsGuide: 'Controlli e funzionalità',
    privacySecurity: 'Privacy e sicurezza',
    supportProject: 'Supporta il progetto',
    legalDisclaimer: 'Disclaimer legale',
    
    // Info section detailed
    projectPurposeTitle: '🎯 Scopo del progetto',
    projectPurposeText: 'MangoMoney è un portfolio tracker completo e assolutamente non professionale progettato per aiutarti a monitorare, analizzare e ottimizzare il tuo patrimonio netto. Il sistema supporta la gestione degli assett più comuni fornendo analisi avanzate basate su principi di finanza moderna.',
    mainFeaturesTitle: '🚀 Funzionalità principali',
    liquidityManagement: 'Gestione Liquidità & Contanti',
    investmentManagement: 'Gestione Investimenti Avanzata',
    realEstateManagement: 'Gestione Immobili',
    advancedAnalytics: 'Analisi Avanzate & Statistiche',
    assetLinking: 'Sistema di Collegamento Asset',
    backupSecurity: 'Backup & Sicurezza Avanzati',
    advancedUI: 'Interfaccia Utente Avanzata',
    
    // Info section content
    liquidityDesc1: 'Conti bancari, contanti e altri strumenti liquidi',
    liquidityDesc2: 'Configurazione avanzata del fondo di emergenza',
    liquidityDesc3: 'Calcolo autonomia finanziaria in mesi',
    liquidityDesc4: 'Gestione spese mensili per calcoli di sicurezza',
    
    investmentDesc1: 'Valore totale per broker/banca con gestione completa',
    investmentDesc2: 'Asset specifici con ticker, ISIN, quantità, prezzo medio',
    investmentDesc3: 'Collegamento tra posizioni individuali e globali con validazione automatica',
    investmentDesc4: 'Registro completo con date, quantità, prezzi e commissioni',
    investmentDesc5: 'Analisi per anno con totale investito/venduto',
    
    realEstateDesc1: 'Proprietà immobiliari (primaria e secondarie)',
    realEstateDesc2: 'Valutazioni immobiliari con indirizzi',
    realEstateDesc3: 'Gestione tipologie (primaria/secondaria)',
    realEstateDesc4: 'Note e descrizioni dettagliate',
    
    analyticsDesc1: 'Calcolo basato su Modern Portfolio Theory (0-10)',
    analyticsDesc2: 'Indice Herfindahl-Hirschman per misurare la concentrazione',
    analyticsDesc3: 'Debt-to-Asset, Liquidity Ratio, Investment Efficiency',
    analyticsDesc4: 'Potenziale di crescita basato su allocazione asset',
    analyticsDesc5: 'Distribuzione patrimonio e confronto categorie con colori coordinati',
    
    linkingDesc1: 'Collegamento posizioni individuali a posizioni globali',
    linkingDesc2: 'Validazione automatica con tolleranza del 5%',
    linkingDesc3: 'Verifica discrepanze e stato collegamenti',
    linkingDesc4: 'Gestione completa delle relazioni tra asset',
    
    backupDesc1: 'Backup completo con metadati e timestamp',
    backupDesc2: 'Esportazione per analisi esterne',
    backupDesc3: 'Report professionali per documentazione',
    backupDesc4: 'Validazione e sovrascrittura completa',
    backupDesc5: 'Persistenza locale nel browser',
    
    uiDesc1: 'Tema personalizzabile per comfort visivo',
    uiDesc2: 'Ottimizzato per desktop, tablet e mobile',
    uiDesc3: 'Per presentazioni e schermi piccoli',
    uiDesc4: 'Colori consistenti tra pie chart e bar chart',
    uiDesc5: 'Interfaccia completa per editing avanzato',
    
    dataEntryDesc1: 'Nome broker/banca, valore totale, ticker principale',
    dataEntryDesc2: 'Ticker, ISIN, quantità, prezzo medio, collegamento opzionale',
    dataEntryDesc3: 'Ticker, tipo (acquisto/vendita), quantità, prezzo, commissioni, data',
    dataEntryDesc4: 'Ticker ufficiale, quantità, prezzo medio',
    dataEntryDesc5: 'Nome/ISIN, valore nominale, prezzo di acquisto',
    dataEntryDesc6: 'Symbol standard (BTC, ETH, ADA), quantità posseduta',
    dataEntryDesc7: 'Nome, descrizione, valore stimato, tipo (primaria/secondaria), indirizzo',
    dataEntryDesc8: 'Descrizione dettagliata, valore stimato corrente',
    
    bestPracticesDesc1: 'Usa sempre ticker ufficiali per accuratezza dei dati',
    bestPracticesDesc2: 'Mantieni aggiornate quantità e prezzi dopo ogni operazione',
    bestPracticesDesc3: 'Collega posizioni individuali alle globali per tracciabilità',
    bestPracticesDesc4: 'Registra tutte le transazioni per analisi complete',
    bestPracticesDesc5: 'Aggiorna periodicamente le valutazioni immobiliari',
    bestPracticesDesc6: 'Configura correttamente il fondo di emergenza',
    bestPracticesDesc7: 'Esporta regolarmente i dati come backup',
    
    toolbarDesc1: 'Alterna tra tema scuro e chiaro per comfort visivo',
    toolbarDesc2: 'Forza il layout mobile anche su desktop',
    toolbarDesc3: 'Carica backup JSON con sovrascrittura completa',
    toolbarDesc4: 'Esporta in JSON (backup), CSV, Excel o PDF',
    toolbarDesc5: 'Ripristina tutti i dati ai valori iniziali',
    dataEntryTitle: '📝 Guida all\'inserimento dati',
    dataEntryCategory: 'Inserimento per categoria',
    bestPractices: 'Best Practices',
    controlsTitle: '🔧 Controlli e funzionalità',
    toolbarButtons: 'Pulsanti della toolbar',
    advancedOperations: 'Operazioni avanzate',
    metricsAnalysis: 'Metriche e analisi',
    privacyTitle: '🔒 Privacy e sicurezza',
    localData: 'Dati completamente locali',
    localDataText1: 'Tutti i dati sono memorizzati localmente nel tuo browser',
    localDataText2: 'Nessuna trasmissione a server esterni o terze parti',
    localDataText3: 'Nessun tracking, analytics o raccolta dati',
    localDataText4: 'Salvataggio automatico in localStorage',
    localDataText5: 'Backup manuale tramite esportazione JSON',
    localDataText6: 'Controllo completo sui tuoi dati finanziari',
    supportTitle: '💖 Supporta il progetto',
    supportText: 'Se MangoMoney ti è stato utile, considera di supportare lo sviluppo con una piccola donazione.',
    donatePayPal: 'Dona con PayPal',
    supportNote: 'Ogni contributo aiuta a mantenere il progetto gratuito e open source',
    disclaimerTitle: '⚠️ Disclaimer legale',
    disclaimerText: 'MangoMoney è uno strumento di monitoraggio portfolio a scopo informativo. Non ci assumiamo alcuna responsabilità sulla validità, accuratezza o completezza dei dati inseriti. I prezzi e le valutazioni sono indicativi e potrebbero non riflettere i valori reali di mercato. Non forniamo consigli di investimento. L\'uso di questo strumento è a vostro rischio e pericolo. Consultate sempre un professionista finanziario per decisioni di investimento.',
    developedWith: 'Sviluppato con ❤️ per il controllo finanziario personale',
    
    // Welcome messages
    welcomeCash: 'Gestisci i tuoi conti bancari e liquidità',
    welcomeDebts: 'Traccia i tuoi debiti e passività',
    welcomeInvestments: 'Gestisci i tuoi investimenti e posizioni',
    welcomeRealEstate: 'Gestisci le tue proprietà immobiliari',
    welcomePensionFunds: 'Traccia i tuoi fondi pensione',
    welcomeOtherAccounts: 'Gestisci altri conti finanziari',
    welcomeAlternativeAssets: 'Traccia beni alternativi e collezionabili',
    
    // Section descriptions
    alternativeAssetsDesc: 'Collezionabili, arte, alcolici o altro',
    debtsDesc: 'Mutui, prestiti e altre passività',
    
    // Table totals
    totalAssetsLabel: 'Totale Asset:',
    totalTransactionsLabel: 'Totale Transazioni:',
    totalPropertiesLabel: 'Totale Immobili:',
  },
  en: {
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
    quantity: 'Quantity',
    avgPrice: 'Avg Price',
    purchaseDate: 'Purchase Date',
    transactionType: 'Transaction Type',
    purchase: 'Purchase',
    sale: 'Sale',
    commissions: 'Commissions',
    date: 'Date',
    linkedTo: 'Linked to',
    verifyLinks: 'Verify Links',
    
    // Real estate
    primary: 'Primary',
    secondary: 'Secondary',
    address: 'Address',
    propertyType: 'Property Type',
    
    // Statistics
    riskScore: 'Risk Score',
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
    swrYearsOfSupport: 'Years of Support',
    swrNetLiquidAssets: 'Net Liquid Assets',
    swrMonthlyExpenses: 'Monthly Expenses',
    swrAnnualWithdrawal: 'Annual Withdrawal',
    swrExplanation: 'This simulation calculates whether withdrawing a certain percentage of your net liquid assets (cash + investments + other accounts) can cover your monthly expenses. The "Monthly Withdrawal" shows how much you would receive each month with the selected withdrawal rate.',
    swrDisclaimer: '⚠️ Extremely indicative and non-exhaustive calculation',
    
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
    currency: 'Currency',
    language: 'Language',
    
    // Info section
    projectPurpose: 'Project Purpose',
    mainFeatures: 'Main Features',
    dataEntryGuide: 'Data Entry Guide',
    controlsGuide: 'Controls and Features',
    privacySecurity: 'Privacy and Security',
    supportProject: 'Support the Project',
    legalDisclaimer: 'Legal Disclaimer',
    
    // Info section detailed
    projectPurposeTitle: '🎯 Project Purpose',
    projectPurposeText: 'MangoMoney is a complete and absolutely non-professional portfolio tracker designed to help you monitor, analyze and optimize your net worth. The system supports management of the most common assets providing advanced analysis based on modern finance principles.',
    mainFeaturesTitle: '🚀 Main Features',
    liquidityManagement: 'Liquidity & Cash Management',
    investmentManagement: 'Advanced Investment Management',
    realEstateManagement: 'Real Estate Management',
    advancedAnalytics: 'Advanced Analytics & Statistics',
    assetLinking: 'Asset Linking System',
    backupSecurity: 'Advanced Backup & Security',
    advancedUI: 'Advanced User Interface',
    
    // Info section content
    liquidityDesc1: 'Bank accounts, cash and other liquid instruments',
    liquidityDesc2: 'Advanced emergency fund configuration',
    liquidityDesc3: 'Financial autonomy calculation in months',
    liquidityDesc4: 'Monthly expenses management for security calculations',
    
    investmentDesc1: 'Total value per broker/bank with complete management',
    investmentDesc2: 'Specific assets with ticker, ISIN, quantity, average price',
    investmentDesc3: 'Linking between individual and global positions with automatic validation',
    investmentDesc4: 'Complete registry with dates, quantities, prices and commissions',
    investmentDesc5: 'Annual analysis with total invested/sold',
    
    realEstateDesc1: 'Real estate properties (primary and secondary)',
    realEstateDesc2: 'Real estate valuations with addresses',
    realEstateDesc3: 'Type management (primary/secondary)',
    realEstateDesc4: 'Detailed notes and descriptions',
    
    analyticsDesc1: 'Calculation based on Modern Portfolio Theory (0-10)',
    analyticsDesc2: 'Herfindahl-Hirschman Index to measure concentration',
    analyticsDesc3: 'Debt-to-Asset, Liquidity Ratio, Investment Efficiency',
    analyticsDesc4: 'Growth potential based on asset allocation',
    analyticsDesc5: 'Asset distribution and category comparison with coordinated colors',
    
    linkingDesc1: 'Linking individual positions to global positions',
    linkingDesc2: 'Automatic validation with 5% tolerance',
    linkingDesc3: 'Discrepancy verification and link status',
    linkingDesc4: 'Complete management of asset relationships',
    
    backupDesc1: 'Complete backup with metadata and timestamp',
    backupDesc2: 'Export for external analysis',
    backupDesc3: 'Professional reports for documentation',
    backupDesc4: 'Validation and complete overwrite',
    backupDesc5: 'Local persistence in browser',
    
    uiDesc1: 'Customizable theme for visual comfort',
    uiDesc2: 'Optimized for desktop, tablet and mobile',
    uiDesc3: 'For presentations and small screens',
    uiDesc4: 'Consistent colors between pie chart and bar chart',
    uiDesc5: 'Complete interface for advanced editing',
    
    dataEntryDesc1: 'Broker/bank name, total value, main ticker',
    dataEntryDesc2: 'Ticker, ISIN, quantity, average price, optional linking',
    dataEntryDesc3: 'Ticker, type (buy/sell), quantity, price, commissions, date',
    dataEntryDesc4: 'Official ticker, quantity, average price',
    dataEntryDesc5: 'Name/ISIN, nominal value, purchase price',
    dataEntryDesc6: 'Standard symbol (BTC, ETH, ADA), quantity owned',
    dataEntryDesc7: 'Name, description, estimated value, type (primary/secondary), address',
    dataEntryDesc8: 'Detailed description, current estimated value',
    
    bestPracticesDesc1: 'Always use official tickers for data accuracy',
    bestPracticesDesc2: 'Keep quantities and prices updated after each operation',
    bestPracticesDesc3: 'Link individual positions to global ones for traceability',
    bestPracticesDesc4: 'Record all transactions for complete analysis',
    bestPracticesDesc5: 'Update real estate valuations periodically',
    bestPracticesDesc6: 'Configure emergency fund correctly',
    bestPracticesDesc7: 'Export data regularly as backup',
    
    toolbarDesc1: 'Toggle between dark and light theme for visual comfort',
    toolbarDesc2: 'Force mobile layout even on desktop',
    toolbarDesc3: 'Load JSON backup with complete overwrite',
    toolbarDesc4: 'Export to JSON (backup), CSV, Excel or PDF',
    toolbarDesc5: 'Restore all data to initial values',
    dataEntryTitle: '📝 Data Entry Guide',
    dataEntryCategory: 'Entry by category',
    bestPractices: 'Best Practices',
    controlsTitle: '🔧 Controls and Features',
    toolbarButtons: 'Toolbar buttons',
    advancedOperations: 'Advanced operations',
    metricsAnalysis: 'Metrics and analysis',
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
    disclaimerText: 'MangoMoney is a portfolio monitoring tool for informational purposes. We assume no responsibility for the validity, accuracy or completeness of the data entered. Prices and valuations are indicative and may not reflect actual market values. We do not provide investment advice. Use of this tool is at your own risk. Always consult a financial professional for investment decisions.',
    developedWith: 'Developed with ❤️ for personal financial control',
    
    // Welcome messages
    welcomeCash: 'Manage your bank accounts and liquidity',
    welcomeDebts: 'Track your debts and liabilities',
    welcomeInvestments: 'Manage your investments and positions',
    welcomeRealEstate: 'Manage your real estate properties',
    welcomePensionFunds: 'Track your pension funds',
    welcomeOtherAccounts: 'Manage other financial accounts',
    welcomeAlternativeAssets: 'Track alternative assets and collectibles',
    
    // Section descriptions
    alternativeAssetsDesc: 'Collectibles, art, alcohol or other',
    debtsDesc: 'Mortgages, loans and other liabilities',
    
    // Table totals
    totalAssetsLabel: 'Total Assets:',
    totalTransactionsLabel: 'Total Transactions:',
    totalPropertiesLabel: 'Total Properties:',
  }
};

// Language configuration
const languages = {
  it: { name: 'Italiano', flag: '🇮🇹' },
  en: { name: 'English', flag: '🇺🇸' }
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
  sector: string;
  date?: string;
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

const NetWorthManager = () => {
  // State management
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mangomoney-darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('mangomoney-assets');
    return saved ? JSON.parse(saved) : getInitialData();
  });
  const [lastSaved, setLastSaved] = useState(() => {
    const saved = localStorage.getItem('mangomoney-lastSaved');
    return saved ? new Date(saved) : new Date();
  });
  // Auto-save handles all saving - no manual save needed
  const [activeSection, setActiveSection] = useState('overview');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);
  const [forceMobileLayout, setForceMobileLayout] = useState(() => {
    const saved = localStorage.getItem('mangomoney-forceMobileLayout');
    return saved ? JSON.parse(saved) : false;
  });
  const [emergencyFundAccount, setEmergencyFundAccount] = useState<EmergencyFundAccount>(() => {
    const saved = localStorage.getItem('mangomoney-emergencyFundAccount');
    return saved ? JSON.parse(saved) : { section: '', id: 0, name: '' };
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => {
    const saved = localStorage.getItem('mangomoney-monthlyExpenses');
    return saved ? JSON.parse(saved) : 0;
  });
  
  // Language configuration
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem('mangomoney-language');
    return saved ? JSON.parse(saved) : 'it';
  });

  // Safe Withdrawal Rate simulation
  const [swrRate, setSwrRate] = useState(() => {
    const saved = localStorage.getItem('mangomoney-swr-rate');
    return saved ? JSON.parse(saved) : 4.0;
  });

  // Notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 5000);
  };



  // Translation helper function
  const t = (key: string): string => {
    return translations[selectedLanguage as keyof typeof translations]?.[key as keyof typeof translations.it] || key;
  };

  // Currency configuration
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const saved = localStorage.getItem('mangomoney-currency');
    return saved ? JSON.parse(saved) : 'EUR';
  });
  
  // Currency definitions
  const currencies = {
    EUR: { symbol: '€', name: 'Euro', locale: 'it-IT' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' }
  };
  
  // Initial portfolio data - Realistic sample data for testing
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

  // Mobile detection hook
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const isCompactLayout = isMobileView || forceMobileLayout;

  // UI toggle functions
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMobileLayout = () => setForceMobileLayout(!forceMobileLayout);

  // Financial calculations
  const totals = useMemo(() => {
    const cash = assets.cash.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
    const debts = assets.debts.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
    const investments = assets.investments.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
    const investmentPositions = assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0);
    const realEstate = assets.realEstate.reduce((sum: number, item: RealEstate) => sum + item.value, 0);
    const pensionFunds = assets.pensionFunds.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
    const otherAccounts = assets.otherAccounts.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
    const alternativeAssets = assets.alternativeAssets.reduce((sum: number, item: AssetItem) => sum + item.amount, 0);
    
    return {
      cash,
      debts,
      investments,
      realEstate,
      pensionFunds,
      otherAccounts,
      alternativeAssets,
      total: cash + debts + investments + investmentPositions + realEstate + pensionFunds + otherAccounts + alternativeAssets
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
      investmentPositions: 3, // Medium-high risk - broker accounts
      investments: 4,    // High risk - market volatility
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
    
    const emergencyFundStatus = parseFloat(emergencyMonths) >= 6 ? 'Ottimale' :
                               parseFloat(emergencyMonths) >= 3 ? 'Adeguato' : 'Insufficiente';


    
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
    const debtHealth = debtToAssetRatio < 0.3 ? 'Ottima' : debtToAssetRatio < 0.5 ? 'Buona' : 'Attenzione';

    const liquidityRatio = total > 0 ? (cash / total) : 0;
    const liquidityPercentage = (liquidityRatio * 100).toFixed(1);
    const liquidityHealth = liquidityRatio > 0.1 ? 'Adeguata' : liquidityRatio > 0.05 ? 'Limitata' : 'Insufficiente';

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
  }, [totals, assets, emergencyFundAccount, monthlyExpenses]);

  // Chart data preparation
  const pieData = [
    { name: t('cash'), value: totals.cash, color: '#3b82f6' },
    { name: t('debts'), value: Math.abs(totals.debts), color: '#dc2626' },
    { name: t('investments'), value: totals.investments + assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0), color: '#10b981' },
    { name: t('realEstate'), value: totals.realEstate, color: '#8b5cf6' },
    { name: t('pensionFunds'), value: totals.pensionFunds, color: '#ef4444' },
    { name: t('otherAccounts'), value: totals.otherAccounts, color: '#06b6d4' },
    { name: t('alternativeAssets'), value: totals.alternativeAssets, color: '#84cc16' }
  ];

  const barData = [
    { category: t('cash'), amount: totals.cash, color: '#3b82f6' },
    { category: t('debts'), amount: totals.debts, color: '#dc2626' },
    { category: t('investments'), amount: totals.investments + assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0), color: '#10b981' },
    { category: t('realEstate'), amount: totals.realEstate, color: '#8b5cf6' },
    { category: t('pensionFunds'), amount: totals.pensionFunds, color: '#ef4444' },
    { category: t('otherAccounts'), amount: totals.otherAccounts, color: '#06b6d4' },
    { category: t('alternativeAssets'), amount: totals.alternativeAssets, color: '#84cc16' }
  ];

  const sections = {
    cash: t('cash'),
    debts: t('debts'),
    investments: t('investments'),
    realEstate: t('realEstate'),
    pensionFunds: t('pensionFunds'),
    otherAccounts: t('otherAccounts'),
    alternativeAssets: t('alternativeAssets')
  };

  // Generate section-specific chart data
  const getSectionChartData = (section: string): ChartDataItem[] => {
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
  };

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

  const handleDeleteItem = (section: string, id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.')) {
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
  };

  // Add missing functions
  const handleEditRow = (section: string, id: number) => {
    let itemToEdit: any;
    
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
      setEditingItem({ ...itemToEdit, section });
    }
  };

  const handleCopyRow = (section: string, itemId: number) => {
    let itemToCopy: any;
    
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
    
    const { section, id, ...data } = editingItem;
    
    // Sanitize the data based on section type
    const sanitizedData = { ...data };
    
    if (section === 'investmentPositions') {
      sanitizedData.name = sanitizeString(data.name || '');
      sanitizedData.ticker = sanitizeTicker(data.ticker || '');
      sanitizedData.isin = sanitizeISIN(data.isin || '');
      sanitizedData.amount = Math.abs(sanitizeNumber(data.amount || 0));
      sanitizedData.purchaseDate = sanitizeDate(data.purchaseDate || '');
      sanitizedData.description = sanitizeString(data.description || '');
      sanitizedData.notes = sanitizeString(data.notes || '');
      
      setAssets({
        ...assets,
        investmentPositions: assets.investmentPositions.map((item: InvestmentPosition) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else if (section === 'transactions') {
      sanitizedData.name = sanitizeString(data.name || '');
      sanitizedData.ticker = sanitizeTicker(data.ticker || '');
      sanitizedData.isin = sanitizeISIN(data.isin || '');
      sanitizedData.amount = Math.abs(sanitizeNumber(data.amount || 0));
      sanitizedData.quantity = sanitizeInteger(data.quantity || 0);
      sanitizedData.commissions = sanitizeNumber(data.commissions || 0);
      sanitizedData.description = sanitizeString(data.description || '');
      sanitizedData.date = sanitizeDate(data.date || '');
      
      setAssets({
        ...assets,
        transactions: assets.transactions.map((item: Transaction) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else if (section === 'realEstate') {
      sanitizedData.name = sanitizeString(data.name || '');
      sanitizedData.description = sanitizeString(data.description || '');
      sanitizedData.value = Math.abs(sanitizeNumber(data.value || 0));
      sanitizedData.address = sanitizeString(data.address || '');
      sanitizedData.notes = sanitizeString(data.notes || '');
      
      setAssets({
        ...assets,
        realEstate: assets.realEstate.map((item: RealEstate) => 
          item.id === id ? { ...item, ...sanitizedData } : item
        )
      });
    } else {
      sanitizedData.name = sanitizeString(data.name || '');
      sanitizedData.amount = section === 'debts' ? -Math.abs(sanitizeNumber(data.amount || 0)) : Math.abs(sanitizeNumber(data.amount || 0));
      sanitizedData.description = sanitizeString(data.description || '');
      sanitizedData.notes = sanitizeString(data.notes || '');
      
      if (section === 'investments') {
        sanitizedData.fees = sanitizeNumber(data.fees || 0);
        sanitizedData.quantity = sanitizeInteger(data.quantity || 0);
        sanitizedData.avgPrice = sanitizeNumber(data.avgPrice || 0);
        sanitizedData.sector = sanitizeTicker(data.sector || '');
        sanitizedData.isin = sanitizeISIN(data.isin || '');
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

  // Function to calculate linking validation
  const getLinkingValidation = () => {
    const validation: { [key: number]: { linkedAssets: AssetItem[], totalLinkedValue: number, globalValue: number, deviation: number, isValid: boolean } } = {};
    
    assets.investmentPositions.forEach((globalPosition: InvestmentPosition) => {
      const linkedAssets = assets.investments.filter((asset: AssetItem) => asset.linkedToGlobalPosition === globalPosition.id);
      const totalLinkedValue = linkedAssets.reduce((sum: number, asset: AssetItem) => sum + asset.amount, 0);
      const deviation = Math.abs(totalLinkedValue - globalPosition.amount);
      const tolerance = globalPosition.amount * LINKING_TOLERANCE_PERCENTAGE;
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
    const stats: { [year: string]: { count: number, totalInvested: number, totalSold: number, netInvested: number } } = {};
    
    assets.transactions.forEach((transaction: Transaction) => {
      const year = transaction.date.split('-')[0];
      
      if (!stats[year]) {
        stats[year] = { count: 0, totalInvested: 0, totalSold: 0, netInvested: 0 };
      }
      
      stats[year].count++;
      
      if (transaction.transactionType === 'purchase') {
        stats[year].totalInvested += transaction.amount;
        stats[year].netInvested += transaction.amount;
      } else {
        stats[year].totalSold += transaction.amount;
        stats[year].netInvested -= transaction.amount;
      }
    });
    
    return stats;
  };

  // Function to calculate Safe Withdrawal Rate simulation
  const calculateSWR = () => {
    // Net liquid assets: cash + investments + other accounts
    const netLiquidAssets = totals.cash + totals.investments + totals.otherAccounts;
    
    // Annual withdrawal amount (SWR rate as percentage of net liquid assets)
    const annualWithdrawal = (netLiquidAssets * swrRate) / 100;
    
    // Monthly withdrawal amount (what the SWR percentage provides monthly)
    const monthlyWithdrawal = annualWithdrawal / 12;
    
    // Years of support based on monthly expenses
    const yearsOfSupport = monthlyExpenses > 0 ? netLiquidAssets / (monthlyExpenses * 12) : 0;
    
    return {
      netLiquidAssets,
      annualWithdrawal,
      monthlyWithdrawal,
      yearsOfSupport: Math.max(0, yearsOfSupport)
    };
  };

  // Currency formatting utility
  const formatCurrency = (amount: number): string => {
    const currency = currencies[selectedCurrency as keyof typeof currencies];
    return new Intl.NumberFormat(currency.locale, { 
      style: 'currency', 
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'JPY' ? 0 : 2
    }).format(amount);
  };

  // Input sanitization utilities
  const sanitizeString = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
  };

  const sanitizeNumber = (input: string | number): number => {
    if (typeof input === 'number') return isNaN(input) ? 0 : input;
    const parsed = parseFloat(input);
    return isNaN(parsed) ? 0 : parsed;
  };

  const sanitizeInteger = (input: string | number): number => {
    if (typeof input === 'number') return isNaN(input) ? 0 : Math.floor(input);
    const parsed = parseInt(input);
    return isNaN(parsed) ? 0 : parsed;
  };

  const sanitizeDate = (input: string): string => {
    if (!input || typeof input !== 'string') return new Date().toISOString().split('T')[0];
    const date = new Date(input);
    return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : input;
  };

  const sanitizeTicker = (input: string): string => {
    return sanitizeString(input).toUpperCase().replace(/[^A-Z0-9.]/g, '');
  };

  const sanitizeISIN = (input: string): string => {
    return sanitizeString(input).toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  // Export functionality
  const exportToJSON = () => {
    try {
      // Calculate statistics for metadata
      const totalItems = Object.values(assets).reduce((sum: number, section: any) => sum + section.length, 0);
      const totalValue = Object.entries(totals).reduce((sum: number, [key, value]) => {
        if (key === 'total') return sum;
        return sum + Math.abs(value);
      }, 0);

      const exportData = {
        assets,
        metadata: {
          exportDate: new Date().toISOString(),
          version: '2.2',
          appName: 'MangoMoney',
          totalItems,
          totalValue,
          emergencyFundAccount,
          monthlyExpenses,
          exportInfo: {
            totalAssets: Object.values(assets).reduce((sum: number, section: any) => sum + section.length, 0),
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
      link.download = `mangomoney-backup-${new Date().toISOString().split('T')[0]}-v2.2.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      // Show success message
      showNotification(`✅ Backup JSON esportato con successo!\n\n📊 Dati esportati:\n• ${totalItems} elementi totali\n• ${formatCurrency(totalValue)} valore totale\n• Data: ${new Date().toLocaleDateString('it-IT')}\n\n💾 File salvato come: mangomoney-backup-${new Date().toISOString().split('T')[0]}-v2.2.json`, 'success');
    } catch (error) {
      showNotification('❌ Errore durante l\'esportazione del backup. Riprova.', 'error');
    }
  };

  const exportToCSV = () => {
    try {
      const allData: any[] = [];
    
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
            tipo: 'Posizione Globale',
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
    const csvContent = allData.map((row: any) => 
      Object.values(row).map((value: any) => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const dataBlob = new Blob(['\ufeff' + csvHeader + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mangomoney-dettagliato-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification(`✅ CSV esportato con successo!\n\n📊 Dati esportati:\n• ${allData.length} elementi totali\n• Data: ${new Date().toLocaleDateString('it-IT')}\n\n💾 File salvato come: mangomoney-dettagliato-${new Date().toISOString().split('T')[0]}.csv`, 'success');
    } catch (error) {
      showNotification('❌ Errore durante l\'esportazione CSV. Riprova.', 'error');
    }
  };

  const exportToExcel = () => {
    try {
      const allData: any[] = [];
    
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
            Type: 'Posizione Globale',
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
    const csvContent = allData.map((row: any) => 
      Object.values(row).map((value: any) => `"${String(value).replace(/"/g, '""')}"`).join(';')
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
    showNotification(`✅ Excel (CSV) esportato con successo!\n\n📊 Dati esportati:\n• ${allData.length} elementi totali\n• Data: ${new Date().toLocaleDateString('it-IT')}\n\n💾 File salvato come: mangomoney-excel-${new Date().toISOString().split('T')[0]}.csv\n\n📝 Nota: Apri il file con Excel per una migliore visualizzazione.`, 'success');
    } catch (error) {
      showNotification('❌ Errore durante l\'esportazione Excel. Riprova.', 'error');
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const currentDate = new Date().toLocaleDateString('it-IT');
    const currentTime = new Date().toLocaleTimeString('it-IT');
    const totalItems = Object.values(assets).reduce((sum: number, section: any) => sum + section.length, 0);
    
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
          <h1>🥭 MangoMoney - Report Patrimonio Completo</h1>
          <p><strong>Data:</strong> ${currentDate} alle ${currentTime}</p>
          <p class="total">Patrimonio Netto: ${formatCurrency(totals.total)}</p>
        </div>
        
        <div class="summary">
          <h3>📊 Riepilogo Generale</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${totalItems}</div>
              <div class="summary-label">Elementi Totali</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totals.total)}</div>
              <div class="summary-label">Patrimonio Netto</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(Math.abs(totals.debts))}</div>
              <div class="summary-label">Debiti Totali</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totals.cash)}</div>
              <div class="summary-label">Liquidità</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totals.investments + assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}</div>
              <div class="summary-label">Investimenti</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totals.realEstate)}</div>
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
        
        const importedData = JSON.parse(result);
        
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
        
        // Import settings
        if (importedData.metadata.emergencyFundAccount) {
          setEmergencyFundAccount(importedData.metadata.emergencyFundAccount);
        }
        if (importedData.metadata.monthlyExpenses) {
          setMonthlyExpenses(importedData.metadata.monthlyExpenses);
        }

        // Show success message with details
        const totalItems = Object.values(importedData.assets).reduce((sum: number, section: any) => sum + section.length, 0);
        const exportDate = importedData.metadata.exportDate ? new Date(importedData.metadata.exportDate).toLocaleDateString('it-IT') : 'Sconosciuta';
        
        showNotification(`✅ Backup importato con successo!\n\n📊 Dati importati:\n• ${totalItems} elementi totali\n• Data backup: ${exportDate}\n• Versione: ${importedData.metadata.version || 'Sconosciuta'}\n\n💾 I dati sono stati sovrascritti e salvati automaticamente.`, 'success');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        showNotification(`❌ Errore nell'importazione:\n\n${errorMessage}\n\nAssicurati di aver selezionato un file di backup JSON valido di MangoMoney.`, 'error');
      }
    };

    reader.onerror = () => {
      showNotification('❌ Errore nella lettura del file. Riprova.', 'error');
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // Reset function (manual save removed - auto-save handles everything)

  const resetData = () => {
    if (window.confirm('Sei sicuro di voler ripristinare i dati originali?')) {
      setAssets(getInitialData());
      showNotification('Dati ripristinati ai valori originali!', 'success');
    }
  };

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
      sector: '',
      date: new Date().toISOString().split('T')[0]
    });
    const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
    const [propertyType, setPropertyType] = useState<'primary' | 'secondary'>('primary');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name.trim()) newErrors.name = 'Il nome è obbligatorio';
      if (formData.amount === '') newErrors.amount = 'L\'importo è obbligatorio';
      if (formData.amount !== '' && (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) && section !== 'debts') newErrors.amount = 'L\'importo deve essere un numero positivo';
      if (section === 'transactions' && formData.quantity === '') newErrors.quantity = 'La quantità è obbligatoria';
      if (section === 'transactions' && formData.quantity !== '' && (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) <= 0)) newErrors.quantity = 'La quantità deve essere un numero intero positivo';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
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
            date: sanitizeDate(formData.date || new Date().toISOString().split('T')[0])
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
              sector: sanitizeTicker(formData.sector),
              isin: sanitizeISIN(formData.notes)
            })
          };

          setAssets({
            ...assets,
            [section]: [...(assets[section as keyof typeof assets] as AssetItem[]), newAssetItem]
          });
        }
        
        setFormData({ name: '', amount: '', description: '', notes: '', fees: '', quantity: '', avgPrice: '', sector: '', date: new Date().toISOString().split('T')[0] });
        setTransactionType('purchase');
        setPropertyType('primary');
        setShowForm(false);
        setErrors({});
      }
    };

    const handleCancel = () => {
      setShowForm(false);
      setFormData({ name: '', amount: '', description: '', notes: '', fees: '', quantity: '', avgPrice: '', sector: '', date: new Date().toISOString().split('T')[0] });
      setTransactionType('purchase');
      setPropertyType('primary');
      setErrors({});
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
            <span>Aggiungi nuovo elemento</span>
          </div>
        </button>
      );
    }

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Aggiungi nuovo elemento
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: sanitizeString(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
              } ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Inserisci il nome"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {section === 'transactions' ? 'Ticker' : section === 'realEstate' ? 'Valore *' : 'Importo *'}
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
                } ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
              />
            )}
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {section === 'transactions' ? 'ISIN' : section === 'realEstate' ? 'Descrizione' : 'Descrizione'}
            </label>
            <input
              type="text"
              value={section === 'transactions' ? formData.notes : formData.description}
              onChange={(e) => section === 'transactions' 
                ? setFormData({ ...formData, notes: sanitizeISIN(e.target.value) })
                : setFormData({ ...formData, description: sanitizeString(e.target.value) })
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
                Tipo Transazione *
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as 'purchase' | 'sale')}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                }`}
              >
                <option value="purchase">Acquisto</option>
                <option value="sale">Vendita</option>
              </select>
            </div>
          ) : section === 'realEstate' ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo Proprietà *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as 'primary' | 'secondary')}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                }`}
              >
                <option value="primary">Residenza Principale</option>
                <option value="secondary">Proprietà Secondaria</option>
              </select>
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Note
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
                  Quantità *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  } ${errors.quantity ? 'border-red-500' : ''}`}
                  placeholder="0"
                  step="1"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Importo *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  } ${errors.amount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Commissioni
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
                  Descrizione
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
                  Data *
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
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Benvenuto in {sections[section as keyof typeof sections]}
      </h3>
      <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Inizia ad aggiungere i tuoi {section === 'cash' ? 'conti bancari' : 
                                   section === 'debts' ? 'debiti' :
                                   section === 'investments' ? 'investimenti' :
                                   section === 'pensionFunds' ? 'fondi pensione' :
                                   section === 'otherAccounts' ? 'altri conti' : 'beni alternativi'} per tenere traccia del tuo patrimonio.
      </p>
      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        Clicca su "Aggiungi nuovo elemento" per iniziare
      </p>
    </div>
  );

  // Compact pie chart component for all sections
  const CompactPieChart = ({ data, size = 200, title = "", showLegend = true }: CompactPieChartProps) => {
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
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <h1 className={`text-2xl md:text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>🥭 MangoMoney</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {t('totalAssets')}: <span className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(totals.total)}</span>
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('lastSaved')}: {lastSaved.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Mobile: Compact button row */}
            <div className="flex flex-wrap gap-1 md:hidden">
              <button
                onClick={toggleDarkMode}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-2 rounded h-8 w-8 flex items-center justify-center`}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              
              <button
                onClick={toggleMobileLayout}
                className={`px-2 py-1 rounded text-xs transition-colors h-8 ${
                  forceMobileLayout 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                }`}
              >
                {forceMobileLayout ? '📱' : (isMobileView ? '📱' : '💻')}
              </button>
              
              {/* Currency Selector - Mobile */}
              <div className="relative group">
                <button className={`px-2 py-1 rounded text-xs transition-colors h-8 ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}>
                  {currencies[selectedCurrency as keyof typeof currencies].symbol}
                </button>
                <div className={`absolute right-0 mt-2 w-24 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="py-1">
                    {Object.entries(currencies).map(([code, currency]) => (
                      <button
                        key={code}
                        onClick={() => setSelectedCurrency(code)}
                        className={`block w-full text-left px-2 py-1 text-xs ${
                          selectedCurrency === code 
                            ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`
                            : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                        }`}
                      >
                        {currency.symbol} {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Language Selector - Mobile */}
              <div className="relative group">
                <button className={`px-2 py-1 rounded text-xs transition-colors h-8 ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}>
                  {languages[selectedLanguage as keyof typeof languages].flag}
                </button>
                <div className={`absolute right-0 mt-2 w-24 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center justify-center cursor-pointer h-8 w-8"
                  title="Importa backup JSON di MangoMoney"
                >
                  <Upload size={14} />
                </label>
              </div>
              
              <div className="relative group">
                <button className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 flex items-center justify-center h-8 w-8">
                  <Download size={14} />
                </button>
                <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="py-1">
                    <button
                      onClick={() => exportToJSON()}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
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
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} p-2 rounded h-10 w-10 flex items-center justify-center`}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              <button
                onClick={toggleMobileLayout}
                className={`px-3 py-2 rounded text-xs transition-colors h-10 ${
                  forceMobileLayout 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                }`}
              >
                {forceMobileLayout ? '📱 Mobile' : (isMobileView ? '📱 Auto' : '💻 Desktop')}
              </button>
              
              {/* Currency Selector */}
              <div className="relative group">
                <button className={`px-3 py-2 rounded text-xs transition-colors h-10 ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}>
                  {currencies[selectedCurrency as keyof typeof currencies].symbol} {selectedCurrency}
                </button>
                <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="py-1">
                    {Object.entries(currencies).map(([code, currency]) => (
                      <button
                        key={code}
                        onClick={() => setSelectedCurrency(code)}
                        className={`block w-full text-left px-3 py-2 text-sm ${
                          selectedCurrency === code 
                            ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`
                            : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                        }`}
                      >
                        {currency.symbol} {code} - {currency.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="relative group">
                <button className={`px-3 py-2 rounded text-xs transition-colors h-10 ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}>
                  {languages[selectedLanguage as keyof typeof languages].flag} {selectedLanguage.toUpperCase()}
                </button>
                <div className={`absolute right-0 mt-2 w-32 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center gap-1 cursor-pointer h-10"
                  title="Importa backup JSON di MangoMoney"
                >
                  <Upload size={16} />
                  <span className="hidden md:inline">{t('import')} Backup</span>
                </label>
              </div>
              
              <div className="relative group">
                <button className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 flex items-center gap-1 h-10">
                  <Download size={16} />
                  <span className="hidden md:inline">{t('export')}</span>
                </button>
                <div className={`absolute right-0 mt-2 w-36 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="py-1">
                    <button
                      onClick={exportToJSON}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Backup completo con tutti i dati e impostazioni"
                    >
                      💾 JSON Backup Completo
                    </button>
                    <button
                      onClick={exportToCSV}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Esporta dati dettagliati in formato CSV"
                    >
                      📊 CSV Dettagliato
                    </button>
                    <button
                      onClick={exportToExcel}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Esporta dati in formato Excel-compatibile"
                    >
                      📈 Excel (CSV)
                    </button>
                    <button
                      onClick={exportToPDF}
                      className={`block w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Genera report PDF stampabile"
                    >
                      📄 PDF Report
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={resetData}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center gap-1 h-10"
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
                className={`py-3 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
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
              onClick={() => setActiveSection('info')}
              className={`py-3 px-2 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
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
          <div>
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
                    {Object.entries(totals).slice(0, 4).map(([key, value]) => (
                      <div key={key} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
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
                    {Object.entries(totals).slice(4, 7).map(([key, value]) => (
                      <div key={key} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
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
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CompactPieChart data={pieData.filter(item => item.value > 0)} size={240} showLegend={false} />
                      </div>
                      <div className="flex-1 ml-8 min-w-0">
                        <div className="grid grid-cols-1 gap-3">
                          {pieData.filter(item => item.value > 0).map((item, index) => (
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
                  </div>

                  {/* Bar Chart - Horizontal Layout */}
                  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('categoryComparison')}</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={barData.filter(item => item.amount !== 0)} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
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
                          formatter={(value: any) => [formatCurrency(Number(value)), 'Importo']}
                          contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : 'white',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '6px',
                            color: darkMode ? '#f3f4f6' : '#1f2937'
                          }}
                        />
                        <Bar dataKey="amount" fill="#3b82f6">
                          {barData.filter(item => item.amount !== 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Safe Withdrawal Rate Simulation */}
                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
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
                            {formatCurrency(swrData.netLiquidAssets)}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('swrNetLiquidAssets')}
                          </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {formatCurrency(swrData.annualWithdrawal)}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('swrAnnualWithdrawal')} ({swrRate}%)
                          </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {formatCurrency(swrData.monthlyWithdrawal)}
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
                              <strong>Confronto:</strong> Con spese mensili di {formatCurrency(monthlyExpenses)}, il prelievo del {swrRate}% degli asset liquidi ({formatCurrency(swrData.monthlyWithdrawal)}/mese) 
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
          <div className="space-y-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>📊 Statistiche avanzate</h2>
            
            {/* Main Statistics Grid */}
            <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {/* Risk Score */}
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} mr-3`}>
                    <Calculator className={`h-6 w-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Score di Rischio</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.riskScore}/10</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {parseFloat(statistics.riskScore) < 3 ? 'Molto Conservativo' : 
                       parseFloat(statistics.riskScore) < 5 ? 'Conservativo' :
                       parseFloat(statistics.riskScore) < 7 ? 'Moderato' : 'Aggressivo'}
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
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fondo Emergenza</p>
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
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Debito/Patrimonio</p>
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
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Liquidità</p>
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
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Investimenti</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.investmentPercentage}%</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      del patrimonio
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
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Posizioni Totali</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{statistics.totalPositions}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {statistics.activePositions} attive
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metodologie e Basi Teoriche - SPOSTATO QUI ALLA FINE */}
            <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} rounded-lg shadow-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : 'text-indigo-800'} flex items-center`}>
                📊 Metodologie e basi teoriche
              </h3>
              
              <div className={`space-y-4 text-sm ${darkMode ? 'text-gray-200' : 'text-indigo-900'}`}>
                <div>
                  <h4 className="font-semibold mb-2">📊 Score di Rischio (0-10)</h4>
                  <p className="mb-2">Basato sul <strong>Modern Portfolio Theory</strong> e sulla volatilità degli asset. Calcolo ponderato e normalizzato:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Liquidità:</strong> 1.0 (rischio minimo - alta liquidità)</li>
                    <li><strong>Altri conti:</strong> 1.5 (rischio basso - prodotti finanziari vari)</li>
                    <li><strong>Fondi pensione:</strong> 2.0 (rischio medio - regolamentati, lungo termine)</li>
                    <li><strong>Immobili:</strong> 2.0 (rischio medio - stabili ma illiquidi)</li>
                    <li><strong>Posizioni globali:</strong> 3.0 (rischio medio-alto - conti broker)</li>
                    <li><strong>Investimenti/Transazioni:</strong> 4.0 (rischio alto - volatilità di mercato)</li>
                    <li><strong>Beni alternativi:</strong> 5.0 (rischio molto alto - asset speculativi)</li>
                  </ul>
                  <p className="mt-2 italic">Formula: (Σ(% allocazione × peso rischio) ÷ Σ(% allocazione)) × 2</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🛡️ Fondo di Emergenza</h4>
                  <p>Basato sui principi di <strong>Financial Planning</strong> e <strong>Behavioral Economics</strong>. Classificazione automatica:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Ottimale:</strong> ≥6 mesi di spese</li>
                    <li><strong>Adeguato:</strong> 3-6 mesi di spese</li>
                    <li><strong>Insufficiente:</strong> &lt;3 mesi di spese</li>
                  </ul>
                  <p className="italic">Formula: Valore fondo designato ÷ Spese mensili</p>
                </div>



                <div>
                  <h4 className="font-semibold mb-2">💰 Salute Finanziaria</h4>
                  <p>Metriche aggiuntive per valutare la solidità finanziaria:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Debito/Patrimonio:</strong> &lt;30% Ottima, &lt;50% Buona, &gt;50% Attenzione</li>
                    <li><strong>Liquidità:</strong> &gt;10% Adeguata, &gt;5% Limitata, &lt;5% Insufficiente</li>
                    <li><strong>Investimenti:</strong> % del patrimonio allocata in asset growth</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">💡 Fonti Teoriche</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Harry Markowitz</strong> - Modern Portfolio Theory (1952)</li>
                    <li><strong>William Sharpe</strong> - Capital Asset Pricing Model</li>
                    <li><strong>Benjamin Graham</strong> - Security Analysis e Value Investing</li>
                    <li><strong>John Bogle</strong> - Principi di diversificazione e costi bassi</li>
                    <li><strong>Robert Merton</strong> - Financial Planning e Lifecycle Investing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'investments' && (
          <div className="space-y-6">
            {/* Global Positions (Broker Accounts) - At the top */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Posizioni Globali
                <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Indicazione generale del valore investito presso broker o banche
                </p>
              </h3>
              
              {assets.investmentPositions.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Nessuna posizione globale registrata.</p>
                  <p className="text-sm mt-2">Aggiungi posizioni globali per tenere traccia dei tuoi conti broker.</p>
                </div>
              ) : (
                <>
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
                            <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.amount)}</td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</td>
                            <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.notes}</td>
                            <td className={`border px-2 py-1 text-center`}>
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={() => handleEditRow('investmentPositions', item.id)}
                                  className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
                                  title="Modifica riga"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleCopyRow('investmentPositions', item.id)}
                                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                                  title="Copia riga"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem('investmentPositions', item.id)}
                                  className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-right">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {t('totalLabel')} {formatCurrency(assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0))}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Add Global Position Form */}
            <div>
              <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Aggiungi Posizione Globale</h4>
              <AddItemForm section="investmentPositions" />
            </div>

            {/* Individual Positions (Assets) Table */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Posizioni Individuali - Asset</h3>
              
              {assets.investments.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Nessun asset individuale registrato.</p>
                  <p className="text-sm mt-2">Aggiungi asset per tenere traccia dei singoli titoli.</p>
                </div>
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
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Collegato a</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.investments.map((item: AssetItem) => (
                        <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.sector || '-'}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.isin || '-'}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity?.toLocaleString() || '-'}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.amount)}</td>
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
                                onClick={() => handleDeleteItem('investments', item.id)}
                                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                              >
                                <Trash2 size={14} />
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
                                      {t('totalAssetsLabel')} {formatCurrency(assets.investments.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
                </span>
              </div>
            </div>

            {/* Add Individual Position Form */}
            <div>
              <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Aggiungi Asset</h4>
              <AddItemForm section="investments" />
            </div>

            {/* History Table */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Storico Transazioni</h3>
              
              {assets.transactions.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Nessuna transazione registrata.</p>
                  <p className="text-sm mt-2">Aggiungi transazioni per tenere traccia delle operazioni sui broker.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ticker</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ISIN</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tipo</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantità</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Importo</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Commissioni</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrizione</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.transactions.map((item: Transaction) => (
                        <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.ticker}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.isin}</td>
                          <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            <span className={`px-2 py-1 rounded text-xs ${item.transactionType === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'}
                            </span>
                          </td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity.toLocaleString()}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.amount)}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.commissions)}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.date}</td>
                          <td className={`border px-2 py-1 text-center`}>
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleDeleteItem('transactions', item.id)}
                                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                              >
                                <Trash2 size={14} />
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
                                      {t('totalTransactionsLabel')} {formatCurrency(assets.transactions.reduce((sum: number, item: Transaction) => sum + item.amount, 0))}
                </span>
              </div>
            </div>

            {/* Add Transaction Form */}
            <div>
              <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Aggiungi Transazione</h4>
              <AddItemForm section="transactions" />
            </div>

            {/* Linking Validation */}
            {assets.investmentPositions.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  🔗 Verifica Collegamenti
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Controllo della corrispondenza tra posizioni globali e asset individuali
                  </p>
                </h3>
                
                {(() => {
                  const validation = getLinkingValidation();
                  const hasLinkedAssets = Object.values(validation).some(v => v.linkedAssets.length > 0);
                  
                  if (!hasLinkedAssets) {
                    return (
                      <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Nessun asset collegato a posizioni globali.</p>
                        <p className="text-sm mt-1">Usa il dropdown "Collegato a" per collegare gli asset individuali.</p>
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
                                {data.isValid ? '✅ OK' : '⚠️ Discrepanza'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posizione Globale:</span>
                                <div className={`font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {formatCurrency(data.globalValue)}
                                </div>
                              </div>
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset Collegati:</span>
                                <div className={`font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {formatCurrency(data.totalLinkedValue)}
                                </div>
                              </div>
                              <div>
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Differenza:</span>
                                <div className={`font-mono ${data.isValid ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                                  {formatCurrency(data.deviation)} ({((data.deviation / data.globalValue) * 100).toFixed(1)}%)
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset collegati:</span>
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
                    Valore Totale Investimenti
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    {assets.investmentPositions.length + assets.investments.length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Posizioni Totali
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                    {totals.total > 0 ? (((assets.investmentPositions.reduce((sum: number, item: InvestmentPosition) => sum + item.amount, 0)) / totals.total) * 100).toFixed(1) : '0'}%
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    % del Patrimonio
                  </div>
                </div>
              </div>
              

            </div>

            {/* Transaction Statistics */}
            {assets.transactions.length > 0 && (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  📊 Statistiche Transazioni
                  <p className={`text-sm font-normal ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    Analisi delle transazioni per anno
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
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Netto:</span>
                                <div className={`font-mono font-semibold ${stats.netInvested >= 0 ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                                  {formatCurrency(stats.netInvested)}
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
          </div>
        )}

        {activeSection === 'realEstate' && (
          <div className="space-y-6">
            {/* Real Estate Table */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Immobili
                <p className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Residenza principale e altre proprietà immobiliari
                </p>
              </h3>
              
              {assets.realEstate.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Nessun immobile registrato.</p>
                  <p className="text-sm mt-2">Aggiungi la tua residenza principale e altre proprietà.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tipo</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrizione</th>
                        <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valore</th>
                        <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Indirizzo</th>
                        <th className={`border px-2 py-1 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.realEstate.map((item: RealEstate) => (
                        <tr key={item.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                          <td className={`border px-2 py-1 text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            <span className={`px-2 py-1 rounded text-xs ${item.type === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                              {item.type === 'primary' ? 'Principale' : 'Secondaria'}
                            </span>
                          </td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</td>
                          <td className={`border px-2 py-1 text-right font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(item.value)}</td>
                          <td className={`border px-2 py-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.address || '-'}</td>
                          <td className={`border px-2 py-1 text-center`}>
                            <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => handleEditRow('realEstate', item.id)}
                                className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
                                title="Modifica riga"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleCopyRow('realEstate', item.id)}
                                className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                                title="Copia riga"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteItem('realEstate', item.id)}
                                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                              >
                                <Trash2 size={14} />
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
                                      {t('totalPropertiesLabel')} {formatCurrency(assets.realEstate.reduce((sum: number, item: RealEstate) => sum + item.value, 0))}
                </span>
              </div>
            </div>

            {/* Real Estate Statistics */}
            <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatCurrency(totals.realEstate)}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Valore Totale Immobili
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {assets.realEstate.length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('total')}
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {totals.total > 0 ? ((totals.realEstate / totals.total) * 100).toFixed(1) : '0'}%
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    % del Patrimonio
                  </div>
                </div>
              </div>
              

            </div>

            {/* Add Form */}
            <div>
              <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Aggiungi Immobile</h4>
              <AddItemForm section="realEstate" />
            </div>

            {/* Real Estate Chart */}
            {assets.realEstate.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CompactPieChart 
                      data={getSectionChartData('realEstate')} 
                      size={180} 
                      showLegend={false}
                    />
                  </div>
                  <div className="flex-1 ml-6 min-w-0">
                    <div className="grid grid-cols-1 gap-3">
                      {getSectionChartData('realEstate').filter(item => item.value > 0).map((item, index) => (
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

        {activeSection === 'info' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} rounded-lg shadow-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-blue-200'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-blue-200' : 'text-blue-800'} flex items-center`}>
                🥭 MangoMoney <span className="text-sm font-normal ml-2">v3.0</span>
              </h2>
              
              <div className={`space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('projectPurposeTitle')}</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    {t('projectPurposeText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('mainFeaturesTitle')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">💰 {t('liquidityManagement')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('liquidityDesc1')}</li>
                        <li>{t('liquidityDesc2')}</li>
                        <li>{t('liquidityDesc3')}</li>
                        <li>{t('liquidityDesc4')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">📈 {t('investmentManagement')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Posizioni Globali:</strong> {t('investmentDesc1')}</li>
                        <li><strong>Posizioni Individuali:</strong> {t('investmentDesc2')}</li>
                        <li><strong>Sistema di Collegamento:</strong> {t('investmentDesc3')}</li>
                        <li><strong>Storico Transazioni:</strong> {t('investmentDesc4')}</li>
                        <li><strong>Statistiche Transazioni:</strong> {t('investmentDesc5')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">🏠 {t('realEstateManagement')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('realEstateDesc1')}</li>
                        <li>{t('realEstateDesc2')}</li>
                        <li>{t('realEstateDesc3')}</li>
                        <li>{t('realEstateDesc4')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">📊 {t('advancedAnalytics')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Score di Rischio:</strong> {t('analyticsDesc1')}</li>
                        <li><strong>Metriche di Salute Finanziaria:</strong> {t('analyticsDesc3')}</li>
                        <li><strong>Grafici Interattivi:</strong> {t('analyticsDesc5')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">🔗 {t('assetLinking')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('linkingDesc1')}</li>
                        <li>{t('linkingDesc2')}</li>
                        <li>{t('linkingDesc3')}</li>
                        <li>{t('linkingDesc4')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">💾 {t('backupSecurity')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>JSON Completo:</strong> {t('backupDesc1')}</li>
                        <li><strong>CSV/Excel:</strong> {t('backupDesc2')}</li>
                        <li><strong>PDF:</strong> {t('backupDesc3')}</li>
                        <li><strong>Importazione Sicura:</strong> {t('backupDesc4')}</li>
                        <li><strong>Salvataggio Automatico:</strong> {t('backupDesc5')}</li>
                      </ul>
                    </div>



                    <div>
                      <h4 className="text-lg font-medium mb-2">🎨 {t('advancedUI')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Modalità Scura/Chiara:</strong> {t('uiDesc1')}</li>
                        <li><strong>Layout Responsive:</strong> {t('uiDesc2')}</li>
                        <li><strong>Layout Mobile Forzato:</strong> {t('uiDesc3')}</li>
                        <li><strong>Grafici Coordinati:</strong> {t('uiDesc4')}</li>
                        <li><strong>Modali di Modifica:</strong> {t('uiDesc5')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('dataEntryTitle')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">📊 {t('dataEntryCategory')}</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Posizioni Globali:</strong> {t('dataEntryDesc1')}</li>
                        <li><strong>Posizioni Individuali:</strong> {t('dataEntryDesc2')}</li>
                        <li><strong>Transazioni:</strong> {t('dataEntryDesc3')}</li>
                        <li><strong>Azioni/ETF:</strong> {t('dataEntryDesc4')}</li>
                        <li><strong>Obbligazioni:</strong> {t('dataEntryDesc5')}</li>
                        <li><strong>Crypto:</strong> {t('dataEntryDesc6')}</li>
                        <li><strong>Immobili:</strong> {t('dataEntryDesc7')}</li>
                        <li><strong>Beni alternativi:</strong> {t('dataEntryDesc8')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">💡 {t('bestPractices')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('bestPracticesDesc1')}</li>
                        <li>{t('bestPracticesDesc2')}</li>
                        <li>{t('bestPracticesDesc3')}</li>
                        <li>{t('bestPracticesDesc4')}</li>
                        <li>{t('bestPracticesDesc5')}</li>
                        <li>{t('bestPracticesDesc6')}</li>
                        <li>{t('bestPracticesDesc7')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('controlsTitle')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-3">🎛️ {t('toolbarButtons')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center mb-2">
                            <div className={`w-10 h-10 ${darkMode ? 'bg-slate-600' : 'bg-gray-100'} rounded-lg flex items-center justify-center mr-3`}>
                              <Moon className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-gray-600'}`} />
                            </div>
                            <strong className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('darkMode')}</strong>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('toolbarDesc1')}</p>
                        </div>

                        <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center mb-2">
                            <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg flex items-center justify-center mr-3 text-sm`}>
                              📱
                            </div>
                            <strong className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('mobileLayout')}</strong>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('toolbarDesc2')}</p>
                        </div>



                        <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                              <Upload className="w-5 h-5" />
                            </div>
                            <strong className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('import')}</strong>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('toolbarDesc3')}</p>
                        </div>

                        <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3">
                              <Download className="w-5 h-5" />
                            </div>
                            <strong className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('export')}</strong>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('toolbarDesc4')}</p>
                        </div>

                        <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center mr-3">
                              <RotateCcw className="w-5 h-5" />
                            </div>
                            <strong className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{t('reset')}</strong>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('toolbarDesc5')}</p>
                        </div>

                        <div className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">
                              💱
                            </div>
                            <strong className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Valuta</strong>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Seleziona valuta (EUR, USD, GBP, CHF, JPY)</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">⚡ Operazioni avanzate</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Modifica elementi:</strong> Click su "✏️" per modificare qualsiasi campo</li>
                        <li><strong>Copia elementi:</strong> Click su "📋" per duplicare rapidamente</li>
                        <li><strong>Elimina elementi:</strong> Click su "🗑️" per rimuovere</li>
                        <li><strong>Collegamento asset:</strong> Usa dropdown per collegare posizioni individuali a globali</li>
                        <li><strong>Verifica collegamenti:</strong> Controlla automaticamente discrepanze</li>
                        <li><strong>Statistiche transazioni:</strong> Analizza performance per anno</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">📈 Metriche e analisi</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Score di Rischio (0-10):</strong> Basato su allocazione asset e volatilità</li>
                        <li><strong>Diversificazione HHI:</strong> Indice di concentrazione (0-100, più alto = migliore)</li>
                        <li><strong>Debt-to-Asset Ratio:</strong> Rapporto debiti/patrimonio totale</li>
                        <li><strong>Liquidity Ratio:</strong> Percentuale di asset liquidi</li>
                        <li><strong>Investment Efficiency:</strong> Percentuale investita vs. totale</li>
                        <li><strong>Growth Potential:</strong> Potenziale di crescita basato su asset allocation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('privacyTitle')}</h3>
                  <div className={`p-4 ${darkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg border-l-4 ${darkMode ? 'border-green-600' : 'border-green-400'}`}>
                    <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>🛡️ {t('localData')}</h4>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-green-100' : 'text-green-700'}`}>
                      <li>• {t('localDataText1')}</li>
                      <li>• {t('localDataText2')}</li>
                      <li>• {t('localDataText3')}</li>
                      <li>• {t('localDataText4')}</li>
                      <li>• {t('localDataText5')}</li>
                      <li>• {t('localDataText6')}</li>
                    </ul>
                  </div>
                </div>

                {/* Sezione Donazione PayPal */}
                <div className={`${darkMode ? 'bg-gradient-to-br from-emerald-900 to-teal-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} rounded-lg p-6 border ${darkMode ? 'border-emerald-700' : 'border-emerald-200'} text-center shadow-lg`}>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>{t('supportTitle')}</h3>
                  <p className={`mb-4 ${darkMode ? 'text-emerald-100' : 'text-emerald-900'}`}>
                    {t('supportText')}
                  </p>
                  <a 
                    href="https://www.paypal.com/paypalme/stefanoconter" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-6 py-3 ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105`}
                  >
                    💳 {t('donatePayPal')}
                  </a>
                  <p className={`text-xs mt-3 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    {t('supportNote')}
                  </p>
                </div>

                <div className={`p-4 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} rounded-lg border-l-4 ${darkMode ? 'border-yellow-600' : 'border-yellow-400'}`}>
                  <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>{t('disclaimerTitle')}</h4>
                  <p className={`text-sm ${darkMode ? 'text-yellow-100' : 'text-yellow-700'}`}>
                    {t('disclaimerText')}
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <p className="text-sm opacity-80">
                    {t('developedWith')}
                  </p>
                  <p className="text-sm mt-2">
                    <a 
                      href="https://www.linkedin.com/in/stefanoconter/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`underline hover:no-underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      Stefano Conter su LinkedIn
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeSection !== 'overview' && activeSection !== 'statistics' && activeSection !== 'info' && activeSection !== 'investments' && activeSection !== 'realEstate') && (
          <div className="space-y-6">
            {/* Welcome message or data table */}
            {(() => {
              const sectionAssets = assets[activeSection as keyof typeof assets] as AssetItem[];
              return sectionAssets.length === 0 ? (
                <WelcomeMessage section={activeSection} />
              ) : (
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
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <th className={`border px-2 py-1 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('name')}</th>
                          <th className={`border px-2 py-1 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('amount')}</th>
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
                                  className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-700'}`}
                                  title="Modifica riga"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleCopyRow(activeSection, item.id)}
                                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                                  title="Copia riga"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(activeSection, item.id)}
                                  className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                >
                                  <Trash2 size={14} />
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
                      {t('totalLabel')} {formatCurrency(activeSection === 'debts' ? Math.abs(sectionAssets.reduce((sum: number, item: AssetItem) => sum + item.amount, 0)) : sectionAssets.reduce((sum: number, item: AssetItem) => sum + item.amount, 0))}
                      {activeSection === 'debts' ? '🔻' : ''}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Configurazione Fondo di Emergenza - Solo nella sezione Liquidità */}
            {activeSection === 'cash' && (
              <div className={`${darkMode ? 'bg-gradient-to-br from-green-900 to-blue-900' : 'bg-gradient-to-br from-green-50 to-blue-50'} rounded-lg shadow p-4 border ${darkMode ? 'border-green-800' : 'border-green-200'} mb-6`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-green-200' : 'text-green-800'} flex items-center`}>
                  ⚙️ Configurazione fondo di emergenza
                </h3>
                
                <div className={`grid gap-4 ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                      Spese Mensili
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
                        💰 Con la liquidità totale ({formatCurrency(totals.cash)}) puoi sopravvivere per <strong>{(totals.cash / monthlyExpenses).toFixed(1)} mesi</strong>
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                      Fondo Emergenza
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
                      <option value="">Nessun fondo designato</option>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Modifica Elemento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Fields */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nome *
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
                    {editingItem.section === 'realEstate' ? 'Valore' : 'Importo'} *
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
                    Descrizione
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
                        Tipo Transazione
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
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Salva
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={`px-4 py-2 rounded transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.visible && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-4 transition-all duration-300 ${
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
        )}

      </main>
    </div>
  );
};

export default NetWorthManager;