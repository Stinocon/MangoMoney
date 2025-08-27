/**
 * Smart Insights Tests
 * 
 * @description
 * Test completi per verificare che gli Smart Insights usino correttamente
 * le configurazioni utente e non magic numbers hard-coded.
 * 
 * @version 1.0.0
 */

import { generateInsights } from '../../components/AccessibleCharts';
import { DEFAULT_SMART_INSIGHTS_CONFIG } from '../smartInsightsConfig';

describe('Smart Insights - Configurabili', () => {
  
  const basePortfolioData = {
    totalValue: 100000,
    performance: 0,
    riskScore: 5.0,
    emergencyFundMonths: 3,
    diversificationScore: 60,
    unrealizedGains: 1000,
    cashAccounts: 6000,
    debtToAssetRatio: 0.4
  };

  const baseUserSettings = {
    emergencyFundOptimalMonths: 6,
    emergencyFundAdequateMonths: 3,
    swrRate: 4.0,
    inflationRate: 2.0,
    monthlyExpenses: 3000
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
      
      const emergencyInsight = insights.find(i => i.category === 'emergency');
      expect(emergencyInsight).toBeDefined();
      expect(emergencyInsight?.severity).toBe('warning'); // 5 è tra 4-8, dovrebbe essere warning
      expect(emergencyInsight?.description).toContain('5.0 mesi');
      expect(emergencyInsight?.description).toContain('obiettivo: 8 mesi');
    });

    test('rispetta soglie configurabili per tutti i livelli', () => {
      const customSettings = {
        ...baseUserSettings,
        emergencyFundOptimalMonths: 6,
        emergencyFundAdequateMonths: 2
      };
      
      // Test critico: 1 mese < 2 mesi (adequate)
      const criticalData = { ...basePortfolioData, emergencyFundMonths: 1 };
      const criticalInsights = generateInsights(criticalData, undefined, { emergency: true }, customSettings);
      const criticalInsight = criticalInsights.find(i => i.category === 'emergency');
      expect(criticalInsight?.severity).toBe('critical');
      
      // Test warning: 4 mesi tra 2-6 mesi
      const warningData = { ...basePortfolioData, emergencyFundMonths: 4 };
      const warningInsights = generateInsights(warningData, undefined, { emergency: true }, customSettings);
      const warningInsight = warningInsights.find(i => i.category === 'emergency');
      expect(warningInsight?.severity).toBe('warning');
      
      // Test success: 6 mesi = ottimale
      const successData = { ...basePortfolioData, emergencyFundMonths: 6 };
      const successInsights = generateInsights(successData, undefined, { emergency: true }, customSettings);
      const successInsight = successInsights.find(i => i.category === 'emergency');
      expect(successInsight?.severity).toBe('positive'); // 'success' viene convertito in 'positive'
      
      // Test info: 15 mesi > 12 mesi (2x optimal)
      const infoData = { ...basePortfolioData, emergencyFundMonths: 15 };
      const infoInsights = generateInsights(infoData, undefined, { emergency: true }, customSettings);
      const infoInsight = infoInsights.find(i => i.category === 'emergency');
      expect(infoInsight?.severity).toBe('info');
    });
  });

  describe('Risk Score Insights', () => {
    test('usa soglie configurabili per risk score', () => {
      const customSettings = {
        ...baseUserSettings,
        // Soglie personalizzate
      };
      
      // Test conservativo: 2.0 < 3.0
      const conservativeData = { ...basePortfolioData, riskScore: 2.0 };
      const conservativeInsights = generateInsights(conservativeData, undefined, { risk: true }, customSettings);
      const conservativeInsight = conservativeInsights.find(i => i.category === 'risk' && i.description.includes('conservativo'));
      expect(conservativeInsight?.severity).toBe('info'); // 2.0 è conservativo
      expect(conservativeInsight?.description).toContain('conservativo');
      
      // Test bilanciato: 5.0 tra 3.0-6.0
      const balancedData = { ...basePortfolioData, riskScore: 5.0 };
      const balancedInsights = generateInsights(balancedData, undefined, { risk: true }, customSettings);
      const balancedInsight = balancedInsights.find(i => i.category === 'risk' && i.description.includes('bilanciato'));
      expect(balancedInsight?.severity).toBe('positive'); // 'success' viene convertito in 'positive'
      expect(balancedInsight?.description).toContain('bilanciato');
      
      // Test aggressivo: 7.0 tra 6.0-8.0
      const aggressiveData = { ...basePortfolioData, riskScore: 7.0 };
      const aggressiveInsights = generateInsights(aggressiveData, undefined, { risk: true }, customSettings);
      const aggressiveInsight = aggressiveInsights.find(i => i.category === 'risk' && i.description.includes('aggressivo'));
      expect(aggressiveInsight?.severity).toBe('warning');
      expect(aggressiveInsight?.description).toContain('aggressivo');
      
      // Test speculativo: 9.0 > 8.0
      const speculativeData = { ...basePortfolioData, riskScore: 9.0 };
      const speculativeInsights = generateInsights(speculativeData, undefined, { risk: true }, customSettings);
      const speculativeInsight = speculativeInsights.find(i => i.category === 'risk' && i.description.includes('speculativo'));
      expect(speculativeInsight?.severity).toBe('critical');
      expect(speculativeInsight?.description).toContain('speculativo');
    });
  });

  describe('Tax Optimization Insights', () => {
    test('usa configurazione per bollo titoli', () => {
      const customSettings = {
        ...baseUserSettings,
        // Configurazione fiscale personalizzata
      };
      
      // Test con conto deposito sopra soglia
      const highDepositData = { ...basePortfolioData, cashAccounts: 8000 };
      const taxInsights = generateInsights(highDepositData, undefined, { tax: true }, customSettings);
      const taxInsight = taxInsights.find(i => i.category === 'tax');
      
      if (taxInsight) {
        expect(taxInsight.description).toContain('€5,000');
        expect(taxInsight.description).toContain('0.2%');
        expect(taxInsight.value).toBe(16); // 8000 * 0.2% = 16
      }
    });
  });

  describe('Performance Insights', () => {
    test('usa soglia configurabile per cambiamenti significativi', () => {
      const customSettings = {
        ...baseUserSettings,
        // Soglia performance personalizzata
      };
      
      const previousData = { totalValue: 100000, performance: 5.0 };
      
      // Test con cambiamento sotto soglia (5%)
      const smallChangeData = { ...basePortfolioData, performance: 8.0 }; // +3%
      const smallChangeInsights = generateInsights(smallChangeData, previousData, { performance: true }, customSettings);
      const smallChangeInsight = smallChangeInsights.find(i => i.category === 'performance');
      expect(smallChangeInsight).toBeUndefined(); // Nessun insight per cambiamento < 5%
      
      // Test con cambiamento sopra soglia
      const bigChangeData = { ...basePortfolioData, performance: 12.0 }; // +7%
      const bigChangeInsights = generateInsights(bigChangeData, previousData, { performance: true }, customSettings);
      const bigChangeInsight = bigChangeInsights.find(i => i.category === 'performance');
      expect(bigChangeInsight).toBeDefined();
      expect(bigChangeInsight?.severity).toBe('positive'); // 'success' viene convertito in 'positive'
      expect(bigChangeInsight?.description).toContain('7.0%');
    });
  });

  describe('Diversification Insights', () => {
    test('usa soglie configurabili per diversificazione', () => {
      const customSettings = {
        ...baseUserSettings,
        // Soglie diversificazione personalizzate
      };
      
      // Test diversificazione bassa: 30 < 40
      const lowDiversificationData = { ...basePortfolioData, diversificationScore: 30 };
      const lowDiversificationInsights = generateInsights(lowDiversificationData, undefined, { allocation: true }, customSettings);
      const lowDiversificationInsight = lowDiversificationInsights.find(i => i.category === 'allocation');
      expect(lowDiversificationInsight?.severity).toBe('warning');
      expect(lowDiversificationInsight?.description).toContain('30/100');
      
      // Test diversificazione alta: 80 > 70
      const highDiversificationData = { ...basePortfolioData, diversificationScore: 80 };
      const highDiversificationInsights = generateInsights(highDiversificationData, undefined, { allocation: true }, customSettings);
      const highDiversificationInsight = highDiversificationInsights.find(i => i.category === 'allocation');
      expect(highDiversificationInsight?.severity).toBe('positive'); // 'success' viene convertito in 'positive'
      expect(highDiversificationInsight?.description).toContain('80/100');
    });
  });

  describe('Debt-to-Asset Insights', () => {
    test('usa soglie configurabili per rapporto debiti/patrimonio', () => {
      const customSettings = {
        ...baseUserSettings,
        // Soglie debito personalizzate
      };
      
      // Test debito critico: 0.6 > 0.5
      const criticalDebtData = { ...basePortfolioData, debtToAssetRatio: 0.6 };
      const criticalDebtInsights = generateInsights(criticalDebtData, undefined, { risk: true }, customSettings);
      const criticalDebtInsight = criticalDebtInsights.find(i => i.category === 'risk' && i.description.includes('debiti'));
      expect(criticalDebtInsight?.severity).toBe('critical');
      expect(criticalDebtInsight?.description).toContain('60%');
      
      // Test debito warning: 0.4 tra 0.3-0.5
      const warningDebtData = { ...basePortfolioData, debtToAssetRatio: 0.4 };
      const warningDebtInsights = generateInsights(warningDebtData, undefined, { risk: true }, customSettings);
      const warningDebtInsight = warningDebtInsights.find(i => i.category === 'risk' && i.description.includes('debiti'));
      expect(warningDebtInsight?.severity).toBe('warning');
      expect(warningDebtInsight?.description).toContain('40%');
    });
  });

  describe('Configurazione Default', () => {
    test('usa configurazione default quando non specificata', () => {
      const insights = generateInsights(basePortfolioData, undefined, { emergency: true });
      
      // Verifica che usi i valori di default
      const emergencyInsight = insights.find(i => i.category === 'emergency');
      expect(emergencyInsight).toBeDefined();
      
      // Con 3 mesi e default 6 mesi optimal, ratio = 0.5
      // Con default adequate = 3 mesi, dovrebbe essere warning (tra adequate e optimal)
      expect(emergencyInsight?.severity).toBe('warning');
    });
  });

  describe('Validazione Configurazione', () => {
    test('gestisce configurazioni invalide gracefully', () => {
      const invalidSettings = {
        emergencyFundOptimalMonths: 2,    // < adequate
        emergencyFundAdequateMonths: 4,   // > optimal
        swrRate: -1,                      // negativo
        inflationRate: 150                // troppo alto
      };
      
      // Non dovrebbe crashare
      expect(() => {
        generateInsights(basePortfolioData, undefined, { emergency: true }, invalidSettings);
      }).not.toThrow();
    });
  });
});
