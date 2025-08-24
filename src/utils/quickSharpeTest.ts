/**
 * Quick Sharpe Ratio Test - Verifica della correzione
 */

import { calculatePortfolioSharpeRatio } from './financialCalculations';

/**
 * Test rapido per verificare la correzione
 */
export const quickSharpeTest = () => {
  console.log('🚀 QUICK SHARPE RATIO TEST - VERIFICA CORREZIONE');
  console.log('================================================');
  
  // Test con portfolio semplice
  const testPortfolio = {
    cash: 20000,    // 20%
    stocks: 60000,  // 60%
    bonds: 20000    // 20%
  };
  
  const sharpe = calculatePortfolioSharpeRatio(testPortfolio, 100000, 2.0);
  
  console.log('Test Portfolio:', testPortfolio);
  console.log('Sharpe Ratio:', sharpe);
  
  // Verifica che il valore sia ragionevole
  const isReasonable = sharpe >= -2 && sharpe <= 2 && sharpe !== 10;
  
  if (isReasonable) {
    console.log('✅ SUCCESSO: Sharpe Ratio è ora ragionevole!');
    console.log('   Valore atteso: 0.2 - 0.5');
    console.log('   Valore ottenuto:', sharpe);
  } else if (sharpe === 10) {
    console.log('❌ PROBLEMA: Sharpe Ratio ancora cappato a 10');
    console.log('   Il calcolo produce ancora valori troppo alti');
  } else {
    console.log('⚠️ ATTENZIONE: Sharpe Ratio fuori range');
    console.log('   Valore ottenuto:', sharpe);
  }
  
  return isReasonable;
};

// Export per accesso globale
if (typeof window !== 'undefined') {
  (window as any).quickSharpeTest = quickSharpeTest;
}
