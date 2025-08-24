/**
 * Debug Sharpe Ratio - Analisi specifica per dati reali
 * 
 * @description
 * Debug specifico per capire perché il Sharpe Ratio sta restituendo valori alti
 * che vengono poi cappati a 10.00
 */

import { calculatePortfolioSharpeRatio } from './financialCalculations';

/**
 * Debug function per analizzare il Sharpe Ratio con dati reali
 */
export const debugSharpeRatioWithRealData = () => {
  console.log('🔍 DEBUG SHARPE RATIO - ANALISI DATI REALI');
  console.log('==========================================');
  
  // Simula diversi scenari per capire il problema
  
  // Scenario 1: Portfolio molto sbilanciato (tutto in un asset)
  console.log('\n📊 Scenario 1: Portfolio tutto in stocks');
  const allStocksPortfolio = {
    stocks: 100000
  };
  
  const sharpe1 = calculatePortfolioSharpeRatio(allStocksPortfolio, 100000, 2.0);
  console.log('Sharpe Ratio (all stocks):', sharpe1);
  
  // Scenario 2: Portfolio con cash predominante
  console.log('\n💰 Scenario 2: Portfolio tutto in cash');
  const allCashPortfolio = {
    cash: 100000
  };
  
  const sharpe2 = calculatePortfolioSharpeRatio(allCashPortfolio, 100000, 2.0);
  console.log('Sharpe Ratio (all cash):', sharpe2);
  
  // Scenario 3: Portfolio con valori molto piccoli
  console.log('\n🔬 Scenario 3: Portfolio con valori piccoli');
  const smallPortfolio = {
    cash: 100,
    stocks: 900
  };
  
  const sharpe3 = calculatePortfolioSharpeRatio(smallPortfolio, 1000, 2.0);
  console.log('Sharpe Ratio (small portfolio):', sharpe3);
  
  // Scenario 4: Portfolio con un solo asset di valore molto alto
  console.log('\n🚀 Scenario 4: Portfolio con un asset molto alto');
  const highValuePortfolio = {
    stocks: 1000000
  };
  
  const sharpe4 = calculatePortfolioSharpeRatio(highValuePortfolio, 1000000, 2.0);
  console.log('Sharpe Ratio (high value):', sharpe4);
  
  // Scenario 5: Portfolio con totalValue molto basso
  console.log('\n⚠️ Scenario 5: Portfolio con totalValue basso');
  const lowTotalPortfolio = {
    cash: 50,
    stocks: 50
  };
  
  const sharpe5 = calculatePortfolioSharpeRatio(lowTotalPortfolio, 100, 2.0);
  console.log('Sharpe Ratio (low total):', sharpe5);
  
  // Analisi dei risultati
  console.log('\n📋 ANALISI RISULTATI');
  console.log('====================');
  
  const scenarios = [
    { name: 'All Stocks', value: sharpe1, expected: '0.3-0.4' },
    { name: 'All Cash', value: sharpe2, expected: '~0' },
    { name: 'Small Portfolio', value: sharpe3, expected: '0.3-0.4' },
    { name: 'High Value', value: sharpe4, expected: '0.3-0.4' },
    { name: 'Low Total', value: sharpe5, expected: '0.3-0.4' }
  ];
  
  scenarios.forEach(scenario => {
    const isCapped = scenario.value === 10;
    const status = isCapped ? '🔴 CAPPED' : '✅ OK';
    console.log(`${status} ${scenario.name}: ${scenario.value} (expected: ${scenario.expected})`);
    
    if (isCapped) {
      console.log(`   ⚠️ Questo scenario produce un valore > 10 e viene cappato!`);
    }
  });
  
  // Suggerimenti per il debug
  console.log('\n💡 SUGGERIMENTI PER IL DEBUG');
  console.log('============================');
  console.log('1. Controlla la console per i log di debug dettagliati');
  console.log('2. Verifica che totalValue sia corretto');
  console.log('3. Controlla che le allocazioni siano ragionevoli');
  console.log('4. Verifica che non ci siano divisioni per zero');
  console.log('5. Controlla che le volatilità degli asset siano corrette');
};

/**
 * Funzione per testare con dati specifici dell'utente
 */
export const testUserSpecificData = (allocations: any, totalValue: number) => {
  console.log('🔍 TEST CON DATI UTENTE SPECIFICI');
  console.log('==================================');
  console.log('Allocations:', allocations);
  console.log('Total Value:', totalValue);
  
  const sharpe = calculatePortfolioSharpeRatio(allocations, totalValue, 2.0);
  console.log('Sharpe Ratio risultante:', sharpe);
  
  if (sharpe === 10) {
    console.log('⚠️ RISULTATO CAPPATO A 10 - Il calcolo produce un valore troppo alto!');
    console.log('💡 Possibili cause:');
    console.log('   - Volatilità del portafoglio troppo bassa');
    console.log('   - Expected return troppo alto');
    console.log('   - Risk-free rate troppo basso');
    console.log('   - Errori nel calcolo delle correlazioni');
  }
};

// Export per accesso globale
if (typeof window !== 'undefined') {
  (window as any).debugSharpeRatioWithRealData = debugSharpeRatioWithRealData;
  (window as any).testUserSpecificData = testUserSpecificData;
}
