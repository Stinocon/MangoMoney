/**
 * Smart Insights Tests - Realistici
 * 
 * @description
 * Test completi per verificare che gli Smart Insights realistici funzionino
 * correttamente con le nuove categorie e logiche oneste.
 * 
 * @version 2.0.0
 */

import { generateInsights } from '../../components/AccessibleCharts';

describe('Smart Insights - Realistici', () => {
  const basePortfolioData = {
    totalValue: 100000,
    emergencyFundMonths: 3,
    cashAccounts: 5000,
    debtToAssetRatio: 0.2,
    unrealizedGains: 1000,
    realEstateValue: 200000,
    alternativeAssetsValue: 50000,
    pensionFundsValue: 30000
  };

  const baseUserSettings = {
    emergencyFundOptimalMonths: 6,
    emergencyFundAdequateMonths: 3,
    swrRate: 4.0,
    inflationRate: 2.0,
    monthlyExpenses: 2000
  };



  describe('Emergency Fund Insights', () => {
    test('usa configurazione utente per soglie', () => {
      const customSettings = {
        ...baseUserSettings,
        emergencyFundOptimalMonths: 8,    // User custom
        emergencyFundAdequateMonths: 4    // User custom
      };
      const portfolioData = {
        ...basePortfolioData,
        emergencyFundMonths: 5  // 5 mesi
      };
      const insights = generateInsights(
        portfolioData,
        undefined,
        { emergency: true },
        customSettings
      );

      const emergencyInsight = insights.find(i => i.type === 'emergency');
      expect(emergencyInsight).toBeDefined();
      expect(emergencyInsight?.severity).toBe('warning'); // 5 è tra 4-8, dovrebbe essere warning
      expect(emergencyInsight?.description).toContain('5.0 mesi');
      expect(emergencyInsight?.description).toContain('obiettivo: 8');
    });

    test('rispetta soglie configurabili per tutti i livelli', () => {
      const customSettings = {
        ...baseUserSettings,
        emergencyFundOptimalMonths: 6,
        emergencyFundAdequateMonths: 2
      };
      
      // Test critical: 1 mese < 2 mesi
      const criticalData = { ...basePortfolioData, emergencyFundMonths: 1 };
      const criticalInsights = generateInsights(criticalData, undefined, { emergency: true }, customSettings);
      const criticalInsight = criticalInsights.find(i => i.type === 'emergency');
      expect(criticalInsight?.severity).toBe('critical');
      
      // Test warning: 4 mesi tra 2-6 mesi
      const warningData = { ...basePortfolioData, emergencyFundMonths: 4 };
      const warningInsights = generateInsights(warningData, undefined, { emergency: true }, customSettings);
      const warningInsight = warningInsights.find(i => i.type === 'emergency');
      expect(warningInsight?.severity).toBe('warning');
      
      // Test success: 6 mesi = optimal
      const successData = { ...basePortfolioData, emergencyFundMonths: 6 };
      const successInsights = generateInsights(successData, undefined, { emergency: true }, customSettings);
      const successInsight = successInsights.find(i => i.type === 'emergency');
      expect(successInsight?.severity).toBe('positive');
      
      // Test info: 15 mesi > 12 mesi (2x optimal)
      const infoData = { ...basePortfolioData, emergencyFundMonths: 15 };
      const infoInsights = generateInsights(infoData, undefined, { emergency: true }, customSettings);
      const infoInsight = infoInsights.find(i => i.type === 'emergency');
      expect(infoInsight?.severity).toBe('info');
    });
  });

  describe('SWR Insights', () => {
    test('calcola SWR con aggiustamenti inflazione', () => {
      const portfolioData = {
        ...basePortfolioData,
        totalValue: 800000,  // Portfolio grande
        cashAccounts: 50000
      };
      const settings = {
        ...baseUserSettings,
        monthlyExpenses: 3000,
        inflationRate: 3.0  // Inflazione alta
      };
      
      const insights = generateInsights(portfolioData, undefined, { swr: true }, settings);
      const swrInsight = insights.find(i => i.type === 'swr');
      
      expect(swrInsight).toBeDefined();
      expect(swrInsight?.description).toContain('SWR');
    });
  });

  describe('Debt-to-Asset Insights', () => {
    test('identifica debiti eccessivi', () => {
      const highDebtData = { ...basePortfolioData, debtToAssetRatio: 0.8 }; // 80%
      const insights = generateInsights(highDebtData, undefined, { debt: true }, baseUserSettings);
      const debtInsight = insights.find(i => i.type === 'debt');
      
      expect(debtInsight).toBeDefined();
      expect(debtInsight?.severity).toBe('critical');
      expect(debtInsight?.description).toContain('80%');
    });
  });

  describe('Portfolio Size Insights', () => {
    test('identifica portfolio in fase iniziale', () => {
      const smallPortfolio = { ...basePortfolioData, totalValue: 5000 };
      const insights = generateInsights(smallPortfolio, undefined, { size: true }, baseUserSettings);
      const sizeInsight = insights.find(i => i.type === 'size');
      
      expect(sizeInsight).toBeDefined();
      expect(sizeInsight?.description).toContain('fase iniziale');
    });
  });

  describe('Tax Optimization Insights', () => {
    test('identifica opportunità tax harvesting in dicembre', () => {
      // Mock dicembre
      const originalDate = global.Date;
      global.Date = class extends Date {
        constructor() {
          super('2023-12-15');
        }
        getMonth() { return 11; } // Dicembre
      } as any;
      
      const portfolioData = { ...basePortfolioData, unrealizedGains: 5000 };
      const insights = generateInsights(portfolioData, undefined, { tax: true }, baseUserSettings);
      
      // Restore original Date
      global.Date = originalDate;
      
      const taxInsight = insights.find(i => i.type === 'tax' && i.description.includes('Plusvalenze'));
      expect(taxInsight).toBeDefined();
    });

    test('identifica bollo titoli per liquidità elevata', () => {
      const portfolioData = { ...basePortfolioData, cashAccounts: 10000 };
      const insights = generateInsights(portfolioData, undefined, { tax: true }, baseUserSettings);
      const taxInsight = insights.find(i => i.type === 'tax' && i.description.includes('bollo'));
      
      expect(taxInsight).toBeDefined();
      expect(taxInsight?.description).toContain('€5K');
    });
  });

  describe('Allocation Warnings', () => {
    test('identifica concentrazione eccessiva in investimenti', () => {
      const concentratedPortfolio = { 
        ...basePortfolioData, 
        totalValue: 100000,
        cashAccounts: 1000  // Solo 1% in liquidità
      };
      const insights = generateInsights(concentratedPortfolio, undefined, { allocation: true }, baseUserSettings);
      const allocationInsight = insights.find(i => i.type === 'allocation');
      
      expect(allocationInsight).toBeDefined();
      expect(allocationInsight?.description).toContain('Concentrazione eccessiva');
    });
  });

  describe('Configurazione Default', () => {
    test('usa configurazione default quando non specificata', () => {
      const portfolioData = { ...basePortfolioData, emergencyFundMonths: 3 };
      const insights = generateInsights(portfolioData, undefined, { emergency: true });
      
      const emergencyInsight = insights.find(i => i.type === 'emergency');
      expect(emergencyInsight).toBeDefined();
      expect(emergencyInsight?.severity).toBe('warning');
    });
  });
});
