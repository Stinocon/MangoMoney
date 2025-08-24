/**
 * Sharpe Ratio Test Suite
 * 
 * @description
 * Test specifico per identificare e correggere il problema del Sharpe Ratio
 * che sta restituendo valori impossibili come 5362.28
 */

import { calculatePortfolioSharpeRatio } from './financialCalculations';

/**
 * Test specifico per il Sharpe Ratio
 */
export const testSharpeRatioCalculation = () => {
  console.log('🧪 SHARPE RATIO TEST SUITE');
  console.log('==========================');
  
  // Test case 1: Portfolio semplice e realistico
  console.log('\n📊 Test 1: Portfolio Semplice');
  const simplePortfolio = {
    cash: 20000,    // 20% - 1% return
    stocks: 60000,  // 60% - 8% return
    bonds: 20000    // 20% - 4% return
  };
  
  const simpleSharpe = calculatePortfolioSharpeRatio(simplePortfolio, 100000, 2.0);
  console.log('Simple Portfolio Sharpe Ratio:', simpleSharpe);
  
  // Calcolo manuale per verifica:
  // Expected Return = 0.2*1% + 0.6*8% + 0.2*4% = 0.2% + 4.8% + 0.8% = 5.8%
  // Volatility ≈ 0.6*18% = 10.8% (semplificato)
  // Sharpe = (5.8% - 2%) / 10.8% = 3.8% / 10.8% = 0.35
  console.log('Expected range: 0.2 - 0.5');
  
  // Test case 2: Portfolio solo cash (basso rischio)
  console.log('\n💰 Test 2: Portfolio Solo Cash');
  const cashPortfolio = {
    cash: 100000
  };
  
  const cashSharpe = calculatePortfolioSharpeRatio(cashPortfolio, 100000, 2.0);
  console.log('Cash Portfolio Sharpe Ratio:', cashSharpe);
  console.log('Expected: ~0 (cash return ≈ risk-free rate)');
  
  // Test case 3: Portfolio solo stocks (alto rischio)
  console.log('\n📈 Test 3: Portfolio Solo Stocks');
  const stockPortfolio = {
    stocks: 100000
  };
  
  const stockSharpe = calculatePortfolioSharpeRatio(stockPortfolio, 100000, 2.0);
  console.log('Stock Portfolio Sharpe Ratio:', stockSharpe);
  console.log('Expected: ~0.3 - 0.4 (8% return, 18% volatility)');
  
  // Test case 4: Portfolio con valori estremi
  console.log('\n⚠️ Test 4: Portfolio con Valori Estremi');
  const extremePortfolio = {
    cash: 1000,      // 0.1%
    stocks: 999000   // 99.9%
  };
  
  const extremeSharpe = calculatePortfolioSharpeRatio(extremePortfolio, 1000000, 2.0);
  console.log('Extreme Portfolio Sharpe Ratio:', extremeSharpe);
  console.log('Expected: ~0.3 - 0.4 (quasi tutto in stocks)');
  
  // Test case 5: Portfolio vuoto
  console.log('\n🚫 Test 5: Portfolio Vuoto');
  const emptyPortfolio = {};
  
  const emptySharpe = calculatePortfolioSharpeRatio(emptyPortfolio, 0, 2.0);
  console.log('Empty Portfolio Sharpe Ratio:', emptySharpe);
  console.log('Expected: 0');
  
  // Analisi dei risultati
  console.log('\n📋 ANALISI RISULTATI');
  console.log('====================');
  
  const results = [
    { name: 'Simple', value: simpleSharpe, expected: '0.2-0.5' },
    { name: 'Cash', value: cashSharpe, expected: '~0' },
    { name: 'Stocks', value: stockSharpe, expected: '0.3-0.4' },
    { name: 'Extreme', value: extremeSharpe, expected: '0.3-0.4' },
    { name: 'Empty', value: emptySharpe, expected: '0' }
  ];
  
  let allReasonable = true;
  
  results.forEach(result => {
    const isReasonable = result.value >= -10 && result.value <= 10 && Number.isFinite(result.value);
    const status = isReasonable ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.value} (expected: ${result.expected})`);
    
    if (!isReasonable) {
      allReasonable = false;
    }
  });
  
  if (allReasonable) {
    console.log('\n🎉 Tutti i test del Sharpe Ratio sono ragionevoli!');
  } else {
    console.log('\n❌ Alcuni valori del Sharpe Ratio sono anomali!');
  }
  
  return allReasonable;
};

// Export per accesso globale in development
if (typeof window !== 'undefined') {
  (window as any).testSharpeRatioCalculation = testSharpeRatioCalculation;
}
