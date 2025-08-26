// Italian translations for MangoMoney
/*
 * MangoMoney - Portfolio Tracker
 * Copyright (c) 2025 Stefano Conter
 * Licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

export const it = {
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
  investmentPositions: 'Investimenti',
  realEstate: 'Immobili',
  pensionFunds: 'Fondi pensione',

  alternativeAssets: 'Beni alternativi',
  
  // Investment specific
  globalPositions: 'Posizioni globali',
  individualPositions: 'Posizioni individuali',
  transactions: 'Transazioni',
  ticker: 'Ticker',
  isin: 'ISIN',
  azione: 'Azione',
  etf: 'ETF',
  obbligazioneWhitelist: 'Obbligazione whitelist',
  obbligazione: 'Obbligazione',
  quantity: 'Quantità',
  avgPrice: 'Prezzo medio',
  currentPrice: 'Prezzo attuale',
  purchaseDate: 'Data acquisto',
  transactionType: 'Tipo transazione',
  purchase: 'Acquisto',
  sale: 'Vendita',
  commissions: 'Commissioni',
  date: 'Data',
  linkedTo: 'Collegato a',
  linkedToAsset: 'Collegato a asset',
  verifyLinks: 'Verifica collegamenti',
  performance: 'Performance',
  totalReturn: 'Rendimento totale',
  percentageReturn: 'Rendimento %',
  annualizedReturn: 'Rendimento annualizzato',
  annualizedReturnPercentage: 'Rendimento annualizzato %',

  performanceChart: 'Grafico performance',
  portfolioPerformance: 'Performance portafoglio',

  reconciliation: 'Riconciliazione',
  costBasis: 'Costo base',
  transactionBased: 'Basato su transazioni',
  manualBased: 'Basato su manuale',
  
  // Real estate
  primary: 'Primaria',
  secondary: 'Secondaria',
  address: 'Indirizzo',
  propertyType: 'Tipo proprietà',
  value: 'Valore',
  type: 'Tipo',
  primaryHome: 'Casa principale',
  secondaryHome: 'Casa secondaria',

  status: 'Stato',
  
  // Statistics
  riskScore: 'Livello di rischio semplificato',
  efficiencyScore: 'Efficienza (Sharpe Ratio)',
  emergencyFund: 'Fondo emergenza',
  diversification: 'Diversificazione',
  concentration: 'Concentrazione',
  debtToAssetRatio: 'Rapporto debiti/patrimonio',
  liquidityRatio: 'Rapporto liquidità',
  investmentEfficiency: 'Efficienza investimenti',
  growthPotential: 'Potenziale di crescita',
  
  // Safe Withdrawal Rate
  swrSimulation: 'Simulazione safe withdrawal rate',
  swrRate: 'Tasso di prelievo sicuro',
  swrMonthlyWithdrawal: 'Prelievo mensile',
  swrYearsOfSupport: 'Anni di sostentamento SWR',

  // Clear All Transactions
  clearAllTransactions: 'Cancella tutte le transazioni',
  clearAll: 'Cancella tutto',
  clearTransactionsConfirmMessage: 'Sei sicuro di voler cancellare tutte le transazioni? Questa azione richiederà ulteriori conferme.',
  clearTransactionsWarningTitle: 'Attenzione: Azione irreversibile',
  clearTransactionsWarningMessage: 'Stai per cancellare {count} transazioni per un valore totale di {value}.',
  clearTransactionsWarning1: 'Tutte le transazioni verranno eliminate permanentemente',
  clearTransactionsWarning2: 'I calcoli di performance basati su transazioni non saranno più disponibili',
  clearTransactionsWarning3: 'Un backup automatico verrà creato prima della cancellazione',
  clearTransactionsFinalTitle: 'Conferma finale',
  clearTransactionsFinalMessage: 'Per confermare la cancellazione, digita "DELETE" nel campo sottostante.',
  clearTransactionsPasswordLabel: 'Password di conferma',
  clearTransactionsPasswordHint: 'Digita "DELETE" per confermare la cancellazione permanente',
  clearTransactionsPasswordError: 'Password non corretta. Digita "DELETE" per confermare.',
  clearTransactionsSuccess: 'Cancellate {count} transazioni per un valore di {value}. Backup creato automaticamente.',
  clearTransactionsError: 'Errore durante la cancellazione delle transazioni.',
  continue: 'Continua',
  iUnderstand: 'Ho capito',
  deletePermanently: 'Elimina definitivamente',
  swrAdvancedCalculation: 'Calcolo SWR Avanzato',
  swrRiskAdjusted: 'SWR aggiustato per rischio',
  swrInflationAdjusted: 'SWR aggiustato per inflazione',
  withdrawableAssets: 'Asset prelevabili',
  swrMonthlyExpenses: 'Spese mensili',
  swrAnnualWithdrawal: 'Prelievo annuo',
  swrExplanation: 'Questa simulazione calcola se il prelievo di una certa percentuale dei tuoi asset liquidi netti (contanti + investimenti + altri conti) può coprire le tue spese mensili. Il "Prelievo mensile" mostra quanto riceveresti ogni mese con il tasso di prelievo selezionato.',
  swrDisclaimer: '⚠️ Calcolo estremamente indicativo e non esaustivo',
  
  // SWR Warning Messages
  swrHighInflationWarning: 'Alta inflazione ({rate}%) riduce il tasso di prelievo sicuro di {adjustment}%',
  swrConservativePortfolioWarning: 'Portafoglio conservativo ({score}/10) permette un SWR leggermente più alto (+{bonus}%)',
  swrInsufficientAssetsWarning: 'Il patrimonio potrebbe essere insufficiente per il pensionamento a lungo termine',
  swrSmallPortfolioWarning: 'La dimensione del portafoglio potrebbe essere troppo piccola per un\'applicazione affidabile del SWR',
  swrInsufficientWithdrawalWarning: 'Il prelievo SWR insufficiente per coprire le spese mensili',
  swrHighRiskWarning: 'Alto rischio portafoglio ({score}/10) riduce il SWR di {adjustment}%',
  swrMonthlyExpensesNotSet: 'Spese mensili non impostate - impossibile calcolare la sostenibilità',
  swrRateTooHigh: 'Tasso SWR superiore al 5% è considerato rischioso',
  
  // Cost Basis Method
  costBasisMethod: 'Metodo di calcolo cost basis',
  costBasisFIFO: 'FIFO (Primi entrati, primi usciti)',
  costBasisLIFO: 'LIFO (Ultimi entrati, primi usciti)',
  costBasisAverage: 'Prezzo medio ponderato',
  costBasisExplanation: 'Il metodo di calcolo del cost basis determina come vengono calcolate le plusvalenze/minusvalenze. LIFO è spesso fiscalmente più conveniente in Italia.',
  
  // Messages
  noData: 'Nessun dato',
  welcomeMessage: 'Benvenuto in MangoMoney!',
  addYourAssets: 'Inizia ad aggiungere i tuoi asset finanziari per tenere traccia del tuo patrimonio netto.',
  navigateSections: 'Naviga nelle sezioni per aggiungere conti bancari, investimenti, debiti e altro ancora.',
  lastSaved: 'Ultimo salvataggio',
  totalAssets: 'Patrimonio totale',
  
  // Forms
  addItem: 'Aggiungi elemento',
  editItem: 'Modifica elemento',
  addProperty: 'Aggiungi immobile',
  addTransaction: 'Aggiungi transazione',
  
  // Charts
  assetDistribution: 'Distribuzione asset',
  assetDistributionNote: 'Distribuzione degli asset (esclusi i debiti). Il patrimonio netto è calcolato come asset - passività.',
  categoryComparison: 'Confronto categorie',
  realEstateDistribution: 'Distribuzione immobili',
  
  // Toolbar
  darkMode: 'Modalità scura/chiara',
  mobileLayout: 'Layout mobile',
  import: 'Importa',
  export: 'Esporta',
  reset: 'Reset',

  language: 'Lingua',
  
  // Info section
  projectPurpose: 'Scopo del progetto',
  mainFeatures: 'Funzionalità principali',
  dataEntryGuide: 'Guida all\'inserimento dati',
  privacySecurity: 'Privacy e sicurezza',
  supportProject: 'Supporta il progetto',
  legalDisclaimer: 'Disclaimer legale',
  
  // Info section detailed - AGGIORNATO v3.2.0
  projectPurposeTitle: '🎯 Scopo del progetto',
  projectPurposeText: 'MangoMoney è un portafoglio tracker completo e assolutamente non professionale progettato per aiutarti a monitorare, analizzare e ottimizzare il tuo patrimonio netto. Il sistema supporta la gestione degli assett più comuni fornendo analisi avanzate basate su principi di finanza moderna.',
  mainFeaturesTitle: '🚀 Funzionalità principali',
  liquidityManagement: 'Gestione liquidità & contanti',
  investmentManagement: 'Gestione investimenti avanzata',
  realEstateManagement: 'Gestione immobili',
  advancedAnalytics: 'Analisi avanzate & statistiche',
  fiscalManagement: 'Gestione fiscale integrata',
  backupSecurity: 'Backup e sicurezza',
  advancedUI: 'Interfaccia utente avanzata',
  
  // Info section content - AGGIORNATO v3.2.0
  liquidityDesc1: 'Conti bancari, contanti e altri strumenti liquidi',
  liquidityDesc2: 'Configurazione avanzata del fondo di emergenza',
  liquidityDesc3: 'Calcolo autonomia finanziaria in mesi',
  liquidityDesc4: 'Gestione spese mensili per calcoli di sicurezza',
  liquidityDesc5: 'Colonna Fisco standardizzata con informazioni coerenti',
  
  investmentDesc1: 'Valore totale per broker/banca con gestione completa',
  investmentDesc2: 'Asset specifici con ticker, ISIN, quantità, prezzo medio',
  investmentDesc3: 'Collegamento tra posizioni individuali e globali con validazione automatica',
  investmentDesc4: 'Registro completo con date, quantità, prezzi e commissioni',
  investmentDesc5: 'Analisi per anno con totale investito/venduto',
  investmentDesc6: 'Tipizzazione asset completa (Azione, ETF, Obbligazione, Obbligazione whitelist)',
  investmentDesc7: 'Collegamento automatico tra tipo asset e calcoli fiscali integrati',
  
  realEstateDesc1: 'Proprietà immobiliari (primaria e secondarie)',
  realEstateDesc2: 'Valutazioni immobiliari con indirizzi',
  realEstateDesc3: 'Gestione tipologie (primaria/secondaria)',
  realEstateDesc4: 'Note e descrizioni dettagliate',
  
  analyticsDesc1: 'Calcolo basato su modern portafoglio theory (0-10)',
  analyticsDesc2: 'Debt-to-Asset, Liquidity Ratio, Investment Efficiency',
  analyticsDesc3: 'Distribuzione patrimonio e confronto categorie con colori coordinati',
  analyticsDesc4: 'Simulazione safe withdrawal rate (SWR) personalizzabile',
  analyticsDesc5: 'Analisi fondo di emergenza e autonomia finanziaria',
  
  // Sezione fiscale - AGGIORNATO v3.2.0
  taxCalculationTitle: 'Sistema fiscale integrato',
  taxCalculationDesc1: 'Calcolo automatico delle plusvalenze su vendite in profitto',
  taxCalculationDesc2: 'Aliquote differenziate per tipo di asset: standard vs obbligazioni whitelist',
  taxCalculationDesc3: 'Monitoraggio capital gains per anno nelle statistiche transazioni',
  taxCalculationDesc4: 'Applicazione tasse solo su transazioni di vendita con guadagno positivo',
  taxCalculationDesc5: 'Analisi dettagliata per tipo di asset con aliquote applicate',
  taxCalculationDesc6: 'Calcoli basati sulla normativa fiscale italiana',
  taxCalculationDesc7: 'Colonna Fisco con informazioni standardizzate e coerenti',
  taxCalculationDesc8: 'Bollo sempre evidenziato in rosso per chiarezza visiva',
  taxCalculationDesc9: 'Rendimenti netti evidenziati con font weight aumentato',
  
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
  uiDesc6: 'Colonne centrate con layout responsive ottimizzato',
  uiDesc7: 'Informazioni fiscali standardizzate e leggibili',
  
  dataEntryDesc1: 'Nome broker/banca, valore totale',
  dataEntryDesc2: 'Ticker, ISIN, quantità, prezzo medio',
  dataEntryDesc3: 'Tipo Asset, Ticker, ISIN, Tipo Transazione, Quantità, Importo, Commissioni, Data',
  dataEntryDesc4: 'Ticker, quantità, prezzo medio',
  dataEntryDesc5: 'Nome/ISIN, valore nominale, prezzo',
  dataEntryDesc6: 'Symbol (BTC, ETH), quantità',
  dataEntryDesc7: 'Nome, valore, tipo, indirizzo',
  dataEntryDesc8: 'Descrizione, valore stimato',
  
  bestPracticesDesc1: 'Usa ticker ufficiali per accuratezza',
  bestPracticesDesc2: 'Aggiorna quantità e prezzi regolarmente',
  bestPracticesDesc3: 'Collega posizioni per tracciabilità',
  bestPracticesDesc4: 'Registra tutte le transazioni',
  bestPracticesDesc5: 'Aggiorna valutazioni immobiliari',
  bestPracticesDesc6: 'Configura il fondo di emergenza',
  bestPracticesDesc7: 'Esporta regolarmente i dati',
  bestPracticesDesc8: 'Configura le aliquote fiscali per il tuo paese',
  bestPracticesDesc9: 'Verifica i calcoli fiscali con un commercialista',
  

  dataEntryTitle: '📝 Guida all\'inserimento dati',
  dataEntryCategory: 'Inserimento per categoria',
  bestPractices: 'Best practices',

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
  disclaimerText: 'MangoMoney è uno strumento di monitoraggio portafoglio a scopo informativo. Non ci assumiamo alcuna responsabilità sulla validità, accuratezza o completezza dei dati inseriti. I prezzi e le valutazioni sono indicativi e potrebbero non riflettere i valori reali di mercato. I calcoli fiscali sono indicativi e basati sulla normativa italiana. Non forniamo consigli di investimento o fiscali. L\'uso di questo strumento è a vostro rischio e pericolo. Consultate sempre un professionista finanziario e un commercialista per decisioni di investimento e calcoli fiscali ufficiali.',
  developedWith: 'Sviluppato con ❤️ per il controllo finanziario personale',
  
  // Welcome messages
  welcomeCash: 'Benvenuto nella sezione Liquidità',
  welcomeDebts: 'Benvenuto nella sezione Debiti',
  welcomeInvestments: 'Benvenuto nella sezione Investimenti',
  welcomeRealEstate: 'Benvenuto nella sezione Immobili',
  welcomePensionFunds: 'Benvenuto nella sezione Fondi Pensione',

  welcomeAlternativeAssets: 'Benvenuto nella sezione Beni Alternativi',
  
  // Individual positions specific
  individualPositionsAsset: 'Posizioni individuali',
  welcomeIndividualPositions: 'Benvenuto nelle Posizioni Individuali',
  individualPositionsTip: '💡 Suggerimento: Le posizioni individuali ti permettono di tracciare singoli titoli, ETF, obbligazioni e altri asset specifici',
  linkIndividualPositions: 'Collegare le posizioni individuali',
  
  // Add asset messages
  addAssetsForDistribution: 'Aggiungi i tuoi asset per vedere la distribuzione del patrimonio.',
  addAssetsForComparison: 'Aggiungi asset per vedere il confronto tra le categorie.',
  addAssetsForTracking: 'Aggiungi asset per tenere traccia dei singoli titoli.',
  addAsset: 'Aggiungi Asset',
  addIndividualAsset: 'Aggiungi Asset Individuale',
  addCurrentPricesForPerformance: 'Per visualizzare grafici e statistiche di performance, aggiungi i prezzi attuali ai tuoi asset.',
  noIndividualAssetsRegistered: 'Nessun asset individuale registrato.',
  noDataToDisplay: 'Nessun dato da visualizzare',
  noAssetsToDisplay: 'Nessun asset da visualizzare',
  enterCurrentPricesForPerformance: 'Inserisci i prezzi attuali per vedere la performance',
  
  // Transaction history and filters
  transactionHistory: 'Storico Transazioni',
  allTransactions: 'Tutte',
  sortByDate: 'Ordina per data',
  sortByName: 'Ordina per nome',
  sortByAmount: 'Ordina per importo',
  sortByQuantity: 'Ordina per quantità',
  purchases: 'Acquisti',
  sales: 'Vendite',
  filterByTicker: 'Filtra per ticker...',
  filterByISIN: 'Filtra per ISIN...',
  resetFilters: 'Reset Filtri',
  noTransactionsFound: 'Nessuna transazione trovata con i filtri applicati.',
  tryModifyFilters: 'Prova a modificare i filtri o aggiungi nuove transazioni.',
  
  // Navigation buttons
  backToInvestments: 'Torna agli Investimenti',
  manageInvestments: 'Gestisci Investimenti',
  
  // Form labels and validation
  quantityRequired: 'La quantità è obbligatoria',
  quantityTooHigh: 'La quantità è troppo elevata',
  
  // Info section content
  transactionHistoryAdvanced: 'Storico transazioni con filtri avanzati',
  transactionsPurchasesSales: 'Transazioni (acquisti/vendite)',
  recordAllTransactions: 'Registrare tutte le transazioni',
  
  // Info section headings
  liquidityManagementHeading: 'Gestione liquidità',
  investmentManagementHeading: 'Gestione investimenti',
  realEstateManagementHeading: 'Gestione immobili',
  advancedAnalyticsHeading: 'Analisi avanzate',
  
  // Info section list items
  bankAccountsCashInstruments: 'Conti bancari, contanti e strumenti liquidi',
  emergencyFundConfiguration: 'Configurazione fondo di emergenza',
  emergencyFundConfigurationTitle: 'Configurazione fondo di emergenza',
  financialAutonomyCalculation: 'Calcolo autonomia finanziaria',
  accountTypeDistinction: 'Distinzione tipo conto (corrente, deposito, cash)',
  globalIndividualPositions: 'Posizioni globali e individuali',
  linkingGlobalIndividualPositions: 'Collegamento posizioni globali e individuali',
  controlGlobalIndividualCorrespondence: 'Controllo della corrispondenza tra posizioni globali e asset individuali',
  performanceTrackingAnnualized: 'Performance tracking e rendimenti annualizzati',
  transactionPositionLinking: 'Collegamento transazioni a posizioni',
  performanceChartsTrends: 'Grafici performance e trend',
  primarySecondaryProperties: 'Proprietà primarie e secondarie',
  realEstateValuations: 'Valutazioni immobiliari',
  addressNotesManagement: 'Gestione indirizzi e note',
  riskScore010: 'Score di rischio (0-10)',
  financialHealthMetrics: 'Metriche salute finanziaria',
  swrSimulationList: 'Simulazione Safe Withdrawal Rate',
  emergencyFundAnalysis: 'Analisi fondo di emergenza',
  commissionCostStatistics: 'Statistiche commissioni e costi',
  assetLinking: 'Collegamenti asset',
  automaticValidationTolerance: 'Validazione automatica con tolleranza dinamica',
  
  // Autolink functionality
  dynamicToleranceExplanation: 'Tolleranza variabile: ±10% per importi < €1K, ±5% per importi < €10K, ±3% per importi < €100K, ±2% per importi maggiori',
  
  // Smart Insights Configuration
  smartInsightsTitle: 'Insights Intelligenti',
  smartInsightsDescription: 'Suggerimenti personalizzati basati sul tuo portafoglio',
  insightsConfiguration: 'Configurazione Insights',
  enableEmergencyInsights: 'Abilita insights fondo emergenza',
  enableTaxInsights: 'Abilita insights fiscali',
  enablePerformanceInsights: 'Abilita insights performance',
  enableRiskInsights: 'Abilita insights rischio',
  enableAllocationInsights: 'Abilita insights allocazione',
  autolinkTransactions: 'Autolink Transazioni',
  autolinkDescription: 'Collega automaticamente le transazioni alle posizioni individuali basandosi sull\'ISIN',
  autolinkCompleted: 'Autolink completato',
  autolinkNoTransactions: 'Nessuna transazione da collegare. Verifica che gli ISIN corrispondano.',
  investmentValuesInfo: 'Informazioni sui valori degli investimenti',
  calculatedFromTransactions: 'Valore calcolato dalle transazioni',
  manualGlobalPositions: 'Valore posizioni globali manuali',
  difference: 'Differenza',
  investmentValuesExplanation: 'Il valore mostrato nella panoramica è calcolato automaticamente dalle transazioni. Per allineare i valori, aggiorna le posizioni globali manuali o usa l\'autolink per collegare le transazioni.',
  discrepancyVerificationStatus: 'Verifica discrepanze e stato collegamenti',
  backupSecurityHeading: 'Backup e sicurezza',
  jsonCsvExcelPdfExport: 'Esportazione JSON, CSV, Excel, PDF',
  secureImportValidation: 'Importazione sicura con validazione',
  automaticLocalSaving: 'Salvataggio automatico locale',
  completelyLocalData: 'Dati completamente locali',
  advancedInterfaceHeading: 'Interfaccia avanzata',
  darkLightMode: 'Modalità scura/chiara',
  responsiveMobileLayout: 'Layout responsive e mobile',
  advancedFiltersPagination: 'Filtri e paginazione avanzati',
  centeredNotifications: 'Notifiche centrate',
  dedicatedSettingsSection: 'Sezione impostazioni dedicata',
  configurationHeading: 'Configurazione',
  taxSettings: 'Impostazioni fiscali (plusvalenze, bolli)',
  quickItalyConfiguration: 'Configurazione rapida per l\'Italia',
  currencySelection: 'Selezione valuta (EUR, USD, GBP, CHF, JPY)',
  alternativeAssetsManagement: 'Gestione asset alternativi (TCG, collezionabili, etc.)',
  dataCategoriesHeading: 'Categorie di dati',
  bestPracticesHeading: 'Best practices',
  enterGlobalPositionsFirst: 'Inserire prima le posizioni globali',
  updateCurrentPrices: 'Aggiornare i prezzi attuali',
  useFiltersForLargeDatasets: 'Utilizzare i filtri per grandi dataset',
  stocksEtfsBondsCrypto: 'Azioni, ETF, obbligazioni, crypto',
  realEstateAlternativeAssets: 'Immobili e beni alternativi',
  bankAccountsLiquidity: 'Conti bancari e liquidità',
  riskScoreFormula: 'Formula: (Σ(% allocazione × peso rischio) ÷ Σ(% allocazione)) × (10 ÷ 5.0)',
  
  // Statistics section
  advancedStatistics: 'Statistiche avanzate',
  transactionStatistics: 'Statistiche Transazioni',
  riskScoreTitle: 'Score di rischio semplificato',
  
  // Risk score descriptions
  riskScoreDescription: 'Calcolo semplificato basato su categorie di asset. Adatto per la maggior parte degli utenti.',
  riskScoreMethod: 'Metodo: Media ponderata per categoria (non Modern Portfolio Theory completa)',
  liquidityRiskDescription: 'Liquidità: 1.0 (rischio minimo - alta liquidità)',
  pensionFundsRiskDescription: 'Fondi pensione: 2.0 (rischio medio - regolamentati, lungo termine)',
  realEstateRiskDescription: 'Immobili: 2.0 (rischio medio - stabili ma illiquidi)',
  globalPositionsRiskDescription: 'Posizioni globali: 3.0 (rischio medio-alto - conti broker)',
  alternativeAssetsRiskDescription: 'Beni alternativi: 5.0 (rischio molto alto - asset speculativi)',

  investmentsTransactionsRiskDescription: 'Investimenti/Transazioni: 4.0 (rischio alto - volatilità di mercato)',
  riskScoreBasedOnVolatility: 'Basato sulla volatilità del portafoglio calcolata con Modern Portafoglio Theory.',
  efficiencyBasedOnSharpe: 'Basato sul rapporto rischio-rendimento aggiustato.',
  transactionAnalysisPerYear: 'Analisi delle transazioni per anno',
  verifyLinksBetweenTransactionsAssets: 'Verifica collegamenti tra transazioni e asset individuali',
  filterByAssetType: 'Filtra per tipo asset',
  sortByAssetType: 'Ordina per tipo asset',
  assetTypeRequired: 'Tipo asset obbligatorio',
  notAvailable: 'N/A',
  other: 'Altro',
  transactionsUnits: 'transazioni • unità',
  transactionsLabel: '(Transazioni)',
  manualLabel: '(Manuale)',
  noAssetsLinkedToGlobalPositions: 'Nessun asset collegato a posizioni globali.',
  useDropdownToLinkAssets: 'Usa il dropdown "Collegato a" per collegare gli asset individuali.',
  okStatus: '✅ OK',
  discrepancyStatus: '⚠️ Discrepanza',
  globalPositionLabel: 'Posizione Globale:',
  linkedAssetsLabel: 'Asset Collegati:',
  differenceLabel: 'Differenza:',
  linkedAssetsTitle: 'Asset collegati:',
  
  // Statistics section main boxes
  netWorth: 'Patrimonio Netto',
  completeWealthReport: 'Report Patrimonio Completo',
  debtToWealthRatio: 'Debito/Patrimonio',
  debtToWealthRatioDescription: '<30% Ottima, <50% Buona, >50% Attenzione',
  investmentsDescription: '% del patrimonio allocata in asset growth',
  ofWealth: 'del patrimonio',
  percentOfWealth: '% del Patrimonio',
  
  // Health status
  excellent: 'Ottima',
  good: 'Buona',
  attention: 'Attenzione',
  additionalMetricsForFinancialHealth: 'Metriche aggiuntive per valutare la solidità finanziaria:',
  liquidityDescription: '>10% Adeguata, >5% Limitata, <5% Insufficiente',
  financialHealth: 'Salute Finanziaria',
  performanceTrend: 'Trend Performance',
  noGlobalPositionsRegistered: 'Nessuna posizione globale registrata.',
  addGlobalPosition: 'Aggiungi Posizione Globale',
  addGlobalPositionsForBrokerAccounts: 'Aggiungi posizioni globali per tenere traccia dei tuoi conti broker.',
  dateAt: 'Data: alle',
  globalPositionType: 'Posizione Globale',
  
  // Emergency Fund
  emergencyFundTitle: 'Fondo emergenza',
  emergencyFundHeading: 'Fondo di emergenza',

  emergencyFundDesignated: 'Il fondo di emergenza designato copre mesi di spese',
  basedOnFinancialPlanning: 'Basato sui principi di Financial Planning e Behavioral Economics. Classificazione automatica:',
  optimalMonths: '≥6 mesi di spese',
  adequateMonths: '3-6 mesi di spese',
  insufficientMonths: '<3 mesi di spese',
  emergencyFundFormula: 'Formula: Valore fondo designato ÷ Spese mensili',
  
  // Emergency Fund Configuration
  noFundDesignated: 'Nessun fondo designato',
  veryConservative: 'Molto Conservativo',
  emergencyFundWithIcon: 'Fondo di emergenza',
  monthsForOptimal: 'Mesi per "Ottimale"',
  monthsForAdequate: 'Mesi per "Adeguato"',
  monthsForOptimalDescription: 'Numero di mesi di spese per considerare il fondo ottimale',
  monthsForAdequateDescription: 'Numero di mesi di spese per considerare il fondo adeguato',
  resetDefaults: 'Reimposta predefiniti',
  emergencyFundSettingsReset: 'Impostazioni fondo di emergenza reimpostate ai valori predefiniti',
  errorLogs: 'Log degli errori',
  viewErrorLogs: 'Visualizza log errori',
  clearErrorLogs: 'Cancella log errori',
  noErrorLogs: 'Nessun errore registrato',
  errorLogContext: 'Contesto',
  errorLogMessage: 'Messaggio',
  errorLogTimestamp: 'Timestamp',
  errorLogSeverity: 'Severità',
  
  // Global Positions
  globalPositionsDescription: 'Indicazione generale del valore investito presso broker o banche',
  
  // Transactions
  addNewItem: 'Aggiungi nuovo elemento',
  
  // Investment Values
  totalInvestmentValue: 'Valore Totale Investimenti',
  
  // Tips and Suggestions
  updatePricesTip: 'Suggerimento: Aggiorna regolarmente i prezzi per monitorare la performance del tuo portfolio',
  customizeCircumstances: 'Personalizza in base alle tue circostanze',
  
  // Risk Levels
  conservative: 'Conservativo',
  moderate: 'Moderato',
  aggressive: 'Aggressivo',
  
  // Individual Positions
  individualPositionsLabel: 'Asset unici',
  
  // Financial Principles
  johnBoglePrinciples: 'Principi di diversificazione e costi bassi',
  
  // GitHub Resources
  usefulFinancialResources: 'Risorse finanziarie utili su GitHub',
  
  // CSV Import
  importTransactions: 'Importa Transazioni',
  importTransactionsFromCSV: 'Importa transazioni da CSV',
  downloadCSVTemplate: 'Scarica Template CSV',
  csvImportInstructions: 'Carica un file CSV con le transazioni. Il file deve contenere: Nome, Ticker, ISIN, Tipo Transazione, Quantità, Importo, Commissioni, Data',
  csvImportSuccess: 'Transazioni importate con successo',
  csvImportError: 'Errore durante l\'importazione',
  csvInvalidFormat: 'Formato CSV non valido',
  csvMissingRequiredFields: 'Campi obbligatori mancanti',
  csvInvalidData: 'Dati non validi nel file CSV',
  csvTemplateHeaders: 'Tipo Asset,Ticker,ISIN,Tipo Transazione,Quantità,Importo,Commissioni,Data',
  csvTemplateExample: 'ETF,SPY,US78462F1030,Acquisto,100,150.50,2.50,2024-01-15',
  csvTemplateNote: 'Il campo "Tipo Asset" supporta: Azione, ETF, Obbligazione, Obbligazione whitelist',
  
  // Methodologies and Theoretical Bases
  methodologiesTheoreticalBases: 'Metodologie e basi teoriche',
  
  // Liquidity
  addLiquidity: 'Aggiungi Liquidità',
  addInvestments: 'Aggiungi Investimenti',
  withTotalLiquidity: 'Con la liquidità totale ({amount}) puoi sopravvivere per {months} mesi',
  
  // Investments
  totalPositions: 'Posizioni Totali (Globali)',
  active: 'attive',
  
  // Monthly Expenses
  monthlyExpenses: 'Spese Mensili',
  
  // Insufficient
  insufficient: 'Insufficiente',
  optimal: 'Ottimale',
  adequate: 'Adeguato',
  limited: 'Limitata',
  
  // Tax Settings


  
  // Currency

  currency: 'Valuta',
  selectCurrency: 'Seleziona valuta',
  
  // Section descriptions
  alternativeAssetsDesc: 'Collezionabili, arte, alcolici o altro',
  debtsDesc: 'Mutui, prestiti e altre passività',
  
  // Table totals
  totalAssetsLabel: 'Totale asset:',
  totalTransactionsLabel: 'Totale transazioni:',
  totalPropertiesLabel: 'Totale immobili:',
  netInvestment: 'Netto investito',
  
  // Settings
  settings: 'Impostazioni',
  capitalGainsTax: 'Imposta sulle plusvalenze',
  capitalGainsTaxRate: 'Aliquota plusvalenze (%)',
  whitelistBondsTaxRate: 'Aliquota obbligazioni whitelist (%)',
  capitalGains: 'Plusvalenze',
  capitalGainsTaxes: 'Imposte Plusvalenze',
  netCapitalGains: 'Plusvalenze Nette',
  taxableSales: 'Vendite Tassabili',
  exemptSales: 'Vendite Esenti',
  totalProceeds: 'Ricavi Totali',
  totalCostBasis: 'Costo Base Totale',
  capitalGainsYear: 'Capital Gains',
  taxesYear: 'Tasse',
  netGainsYear: 'Guadagno Netto',
  taxDisclaimer: 'Calcolo indicativo basato su tassazione italiana. Consultare commercialista per calcoli ufficiali.',
  currentAccountStampDuty: 'Bollo conto corrente',
  currentAccountStampDutyAmount: 'Importo bollo conto corrente (€)',
  currentAccountStampDutyThreshold: 'Soglia bollo conto corrente (€)',
  depositAccountStampDuty: 'Bollo conto deposito',
  depositAccountStampDutyRate: 'Aliquota bollo conto deposito (%)',
  inflationRate: 'Tasso di inflazione (%)',
  
  // Help tooltips for tax settings
  capitalGainsTaxRateHelp: 'Aliquota tasse su plusvalenze da vendita titoli (Italia: 26%)',
  whitelistBondsTaxRateHelp: 'Aliquota agevolata per obbligazioni statali italiane/EU (Italia: 12.5%)',
  currentAccountStampDutyHelp: 'Importo fisso bollo per conti correnti con giacenza media >5000€ (Italia: €34.20)',
  currentAccountStampDutyThresholdHelp: 'Soglia giacenza media per applicazione bollo conto corrente (Italia: €5000)',
  depositAccountStampDutyRateHelp: 'Aliquota bollo proporzionale per conti deposito (Italia: 0.2%)',
  inflationRateHelp: 'Tasso inflazione per calcoli potere d\'acquisto e SWR reale (default: 2%)',
  
  saveSettings: 'Salva impostazioni',
  settingsSaved: 'Impostazioni salvate',
  defaultItalianSettings: 'Impostazioni predefinite Italia',
  
  // Validation messages
  amountMustBeValid: 'L\'importo deve essere un numero valido',
  amountMustBePositive: 'L\'importo deve essere positivo per gli asset',
  quantityMustBeInteger: 'La quantità deve essere un numero intero',
  quantityMustBePositive: 'La quantità deve essere maggiore di zero',
  fieldRequired: 'Campo obbligatorio',
  minLength: 'Minimo {min} caratteri',
  maxLength: 'Massimo {max} caratteri',
  minValue: 'Valore minimo: {min}',
  maxValue: 'Valore massimo: {max}',

  
  // Account types
  accountType: 'Tipo conto',
  currentAccountType: 'Corrente',
  depositAccountType: 'Deposito',
  remuneratedAccountType: 'Remunerato',
  cashAccountType: 'Cash',
  currentAccount: 'Conto corrente',
  depositAccount: 'Conto deposito',
  
  // Asset types
  assetType: 'Tipo asset',
  allTypes: 'Tutti i tipi',
  tcg: 'TCG',
  stamps: 'Francobolli',
  alcohol: 'Alcolici',
  collectibles: 'Collezionabili',
  vinyl: 'Vinili',
  books: 'Libri',
  comics: 'Fumetti',
  art: 'Arte',
  lego: 'LEGO',
  selected: 'Selezionato',
  fees: 'Commissioni',
  primaryResidence: 'Residenza Principale',
  secondaryProperty: 'Proprietà Secondaria',
  automaticBackups: 'Backup Automatici',
  backupNow: 'Backup Ora',
  never: 'Mai',
  lastBackup: 'Ultimo Backup',
  usedSpace: 'Spazio Usato',
  detailedCSV: 'CSV Dettagliato',
  whatIsMangoMoney: 'Cos\'è MangoMoney?',
  whatIsMangoMoneyDesc: 'MangoMoney è un portfolio tracker pensato per chi vuole tenere sotto controllo il proprio patrimonio senza complicazioni. L\'idea è nata perché gestire tutto su Excel non è il massimo dal punto di vista estetico, e i servizi online... beh, preferisco tenere i miei dati per me.',
  nameOrigin: 'Il nome viene da "mangano i money" → mancano i soldi. Un po\' stupido, ma mi diverte.',
  howItWorks: 'Come funziona',
  howItWorksDesc: 'Puoi inserire tutti i tuoi asset: conti bancari, investimenti, immobili, persino i Pokémon se li consideri un investimento. L\'app calcola automaticamente il tuo patrimonio netto e ti dà alcune statistiche interessanti, come quanto potresti "prelevare" ogni mese senza intaccare il capitale o quanto durerebbe il tuo fondo di emergenza.',
  investmentsTracking: 'Per gli investimenti, puoi tracciare sia le posizioni complessive (quello che hai sul conto del broker) sia i singoli titoli. Se registri anche le transazioni di acquisto e vendita, l\'app calcolerà le performance in modo più preciso.',
  
  // Sezioni per calcoli implementati
  improvedCalculations: 'Calcoli Avanzati',
  riskScoreSmarter: 'Risk Score più intelligente',
  riskScoreSmarterDesc: 'L\'app ora usa volatilità storiche calcolate su dati di mercato reali (invece di pesi inventati) che sono incorporate nell\'app. Per esempio: liquidità 0.5% volatilità, azioni 18%, immobili 15%. Considera anche come si influenzano tra loro i diversi asset. Risultato: un punteggio molto più realistico di prima.',
  cagrTitle: 'CAGR (rendimento annualizzato)',
  cagrDesc: 'Ti dice quanto è cresciuto un investimento "in media" ogni anno. Esempio: se investi €10,000 e dopo 5 anni hai €15,000, il CAGR è 8.45% annuo. Utile per confrontare investimenti su periodi diversi.',
  swrTitle: 'Safe Withdrawal Rate (SWR)',
  swrDesc: 'Basato su studi americani: quanto puoi prelevare ogni anno dal tuo patrimonio senza finire mai a secco. La regola del 4% dice che da €1 milione puoi prelevare €40,000 l\'anno (€3,333 al mese) per 30+ anni.',
  

  
  // Metodi di calcolo cost basis
  costBasisMethods: 'Metodi di Calcolo Cost Basis',
  costBasisMethodsDesc: 'L\'app supporta tre metodi per calcolare guadagni e perdite:',
  fifoMethod: 'FIFO (First In, First Out)',
  fifoDesc: 'Vendi prima quello che hai comprato per primo',
  lifoMethod: 'LIFO (Last In, First Out)',
  lifoDesc: 'Vendi prima quello che hai comprato per ultimo (spesso più conveniente in Italia per le tasse)',
  averageCostMethod: 'Average Cost',
  averageCostDesc: 'Fa la media di tutti i tuoi acquisti',
  costBasisNote: 'Puoi scegliere il metodo nelle impostazioni. LIFO è il default perché di solito conviene di più fiscalmente.',
  
  // Precisione e funzionalità implementate
  calculationPrecision: 'Precisione dei calcoli',
  precisionDesc: 'Usa matematica finanziaria precisa (niente errori di arrotondamento)',
  italianTaxes: 'Calcola automaticamente le imposte italiane (plusvalenze, bolli conti)',
  italianConfigTitle: 'Preset fiscali italiani',
  italianConfigDesc1: 'Configurazione predefinita con aliquote italiane',
  italianConfigDesc2: 'Sistema di calcolo imposte integrato e automatico',
  italianConfigDesc3: 'Gestione completa obbligazioni whitelist con aliquota agevolata',
  italianConfigDesc4: 'Template CSV ottimizzati per la normativa italiana',
  isinLinking: 'Collega automaticamente transazioni e asset tramite codice ISIN',
  emergencyFundSmart: 'Fondo di emergenza intelligente',
  emergencyFundSmartDesc: 'Calcola automaticamente quanti mesi di spese copre. Ti dice se è adeguato (3-6 mesi) o ottimale (6+ mesi). Tiene conto della tua situazione specifica.',
  
  // Sezione "Cosa c'è sotto il cofano"
  underTheHood: 'Cosa c\'è sotto il cofano',
  reliableCalculations: 'Calcoli affidabili',
  reliableCalculationsDesc: 'I calcoli non sono inventati ma seguono standard riconosciuti (tipo quelli che usano i consulenti finanziari veri). Ogni formula ha una logica precisa dietro.',
  limitationsToKnow: 'Limiti da sapere',
  historicalDataLimit: 'I dati storici non predicono il futuro',
  swrLimit: 'Il Safe Withdrawal Rate è basato sui mercati americani',
  riskScoreLimit: 'Il risk score assume che i mercati si comportino "normalmente" (spoiler: non sempre è così)',
  professionalAdvice: 'Per roba seria tipo comprare casa o pianificare la pensione, consulta sempre un professionista. Quest\'app ti aiuta a vedere la situazione, ma non sostituisce il consiglio di chi ne sa davvero.',
  
  // Sharpe Ratio translations
  sharpeRatio: 'Sharpe Ratio',
  sharpeRatioDesc: 'Misura quanto rendimento ottieni per ogni unità di rischio. Più alto = meglio.',
  riskAdjustedReturn: 'Rendimento aggiustato per il rischio',
  excellentSharpe: 'Eccellente rapporto rischio-rendimento',
  goodSharpe: 'Buon rapporto rischio-rendimento',
  poorSharpe: 'Scarso rapporto rischio-rendimento',
  veryPoorSharpe: 'Rapporto rischio-rendimento molto scarso',
  sharpeRatioTooltip: 'Ogni unità di rischio genera {sharpe} unità di rendimento extra rispetto ai titoli di stato.',
  sharpeRatioInfo: 'Il Sharpe Ratio misura l\'efficienza del tuo portafoglio: quanto rendimento extra ottieni per ogni unità di rischio aggiuntivo rispetto ai titoli di stato.',
  sharpeRatioExample: 'Esempio: Sharpe 1.5 = per ogni 1% di rischio extra, guadagni 1.5% in più rispetto ai BOT.',
  sharpeRatioLimitations: 'Limitazioni: Basato su dati storici, assume distribuzione normale dei rendimenti (non sempre vero nei mercati reali).',
  insufficientData: 'Dati insufficienti per il calcolo',
  preliminaryCalculation: 'Calcolo preliminare - dati limitati',
  
  // Fonti teoriche
  theoreticalSources: 'Fonti Teoriche',
  theoreticalSourcesDesc: 'L\'app si basa su principi e metodologie riconosciute dalla comunità finanziaria:',
  markowitz: 'Harry Markowitz - modern portfolio theory (1952)',
  sharpe: 'William Sharpe - Capital Asset Pricing Model e Sharpe Ratio',
  graham: 'Benjamin Graham - Security Analysis e Value Investing',
  bogle: 'John Bogle - Principi di diversificazione e costi bassi',
  merton: 'Robert Merton - Financial Planning e Lifecycle Investing',
  trinityStudy: 'Trinity Study - Safe Withdrawal Rate (1998)',
  academicStandards: 'Tutti i calcoli seguono standard accademici e professionali riconosciuti.',
  

  usefulThings: 'Alcune cose utili da sapere',
  totalPrivacy: 'Privacy totale: Tutto rimane nel tuo browser. Nessun dato viene mai inviato da nessuna parte. Puoi anche scaricare l\'app e usarla completamente offline.',
  automaticBackupsDesc: 'Backup automatici: L\'app salva automaticamente ogni 5 minuti una copia dei tuoi dati. Puoi anche esportare tutto in vari formati quando vuoi.',
  multiCurrencyLanguages: 'Multi-valuta e lingue: Supporta diverse valute (EUR, USD, GBP, CHF, JPY) e due lingue (italiano e inglese).',
  responsive: 'Responsive: Funziona bene sia su desktop che su mobile, con interfacce ottimizzate per ogni dispositivo.',
  standardizedFiscalInfo: 'Informazioni fiscali standardizzate: Bollo sempre evidenziato in rosso, rendimenti netti evidenziati per chiarezza.',
  howToStart: 'Come iniziare',
  howToStartDesc: 'Il consiglio è di partire dalle basi: aggiungi prima i conti bancari e la liquidità, poi gli investimenti principali. Se hai un broker, inserisci prima il valore totale del conto, poi i singoli titoli. L\'app ti dirà se i conti tornano.',
  settingsConfig: 'Per le impostazioni, c\'è una configurazione rapida per l\'Italia che imposta automaticamente le aliquote fiscali più comuni.',
  limitationsDisclaimer: 'Limitazioni e disclaimer',
  limitationsDesc: 'I prezzi non si aggiornano automaticamente - devi inserirli tu. I calcoli sono puramente indicativi e non sostituiscono in alcun modo una consulenza finanziaria professionale. Questo software viene fornito "così com\'è" senza alcuna garanzia di accuratezza, completezza o idoneità per scopi specifici. L\'app non fornisce consigli di investimento e non costituisce un\'offerta di vendita o sollecitazione all\'acquisto di titoli o altri strumenti finanziari. È sempre opportuno e consigliabile affidarsi a professionisti qualificati per decisioni di investimento.',
  practicalNote: 'In pratica: uso a tuo rischio e pericolo, ma dovrebbe aiutarti a vedere la situazione più chiaramente.',
  privacyDesc: 'I tuoi dati restano esclusivamente nel tuo browser (localStorage) e non vengono mai trasmessi a server esterni. I dati possono essere persi nei seguenti casi: svuotamento della cache del browser, utilizzo della modalità incognito, cancellazione dei dati di navigazione, aggiornamento del browser, o problemi hardware del dispositivo.',
  securityChecks: 'L\'app include diversi controlli di sicurezza per prevenire problemi con file danneggiati o dati malformati. Per proteggere i tuoi dati, utilizza regolarmente i backup automatici (ogni 5 minuti) e l\'esportazione manuale in formato JSON. Ti consigliamo di salvare una copia di backup su un dispositivo esterno o cloud personale.',
  projectSupport: 'Supporto al progetto',
  projectSupportDesc: 'Se trovi utile MangoMoney, puoi offrirmi un caffè tramite PayPal. Ogni contributo aiuta a mantenere il progetto gratuito e open source.',
  usefulLinks: 'Collegamenti utili',
  italianFinanceResources: 'Risorse finanziarie italiane - Una collezione di strumenti e risorse per la finanza personale',
  linkedin: '💼 LinkedIn - Il mio profilo professionale',
  github: '🐙 GitHub - Altri progetti',
  
  // Error messages
  errorInSection: 'Errore nella sezione {section}',
  errorLoadingSection: 'Si è verificato un errore durante il caricamento di questa sezione.',
  errorDetails: 'Dettagli errore',
  retry: 'Riprova',
  reloadPage: 'Ricarica pagina',
  somethingWentWrong: 'Qualcosa è andato storto',
  unexpectedError: 'Si è verificato un errore imprevisto. Ricarica la pagina per continuare.',
  invalidFormat: 'Formato non valido',
  
  // Notifications and warnings
  dataLoadedSuccessfully: 'Dati caricati con successo dal backup locale',
  dataNotSavedWarning: 'I tuoi dati potrebbero non essere stati salvati. Sei sicuro di voler chiudere il browser?',
  dataNotSavedRecentlyWarning: 'I tuoi dati potrebbero non essere stati salvati negli ultimi 30 secondi. Ti ricordiamo di fare un backup prima di chiudere il browser.',
  transactionCopiedSuccess: 'Transazione copiata con successo. Filtri resettati per visualizzare la nuova transazione.',
  
  // UI messages
  noAssetsOfType: 'Non ci sono asset di tipo "{type}" nel tuo portfolio.',
  inYourPortfolio: 'nel tuo portfolio',
  addRealEstate: 'Aggiungi Immobili',
  processing: 'Elaborazione in corso...',
  valueLabel: 'Valore',
  confirmDelete: 'Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.',
  savedBackups: 'Backup Salvati',
};
