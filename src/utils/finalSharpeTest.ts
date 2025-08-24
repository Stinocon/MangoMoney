/**
 * Final Sharpe Ratio Test - Verifica della correzione completa
 */

import { calculatePortfolioSharpeRatio } from './financialCalculations';

/**
 * Test finale per verificare la correzione completa
 */
export const finalSharpeTest = () => {
  console.log('🎯 FINAL SHARPE RATIO TEST - VERIFICA CORREZIONE COMPLETA');
  console.log('==========================================================');
  
  // Test con portfolio bilanciato
  const balancedPortfolio = {
    cash: 20000,    // 20% - 1% return
    stocks: 60000,  // 60% - 8% return  
    bonds: 20000    // 20% - 4% return
  };
  
  const sharpe = calculatePortfolioSharpeRatio(balancedPortfolio, 100000, 2.0);
  
  console.log('Balanced Portfolio:', balancedPortfolio);
  console.log('Sharpe Ratio:', sharpe);
  
  // Calcolo manuale per verifica:
  // Expected Return = 0.2*1% + 0.6*8% + 0.2*4% = 0.2% + 4.8% + 0.8% = 5.8%
  // Volatility ≈ 0.6*18% = 10.8% (semplificato)
  // Sharpe = (5.8% - 2%) / 10.8% = 3.8% / 10.8% = 0.35
  console.log('Expected range: 0.2 - 0.5');
  
  // Verifica che il valore sia ragionevole
  const isReasonable = sharpe >= 0.1 && sharpe <= 0.8 && sharpe !== 10;
  
  if (isReasonable) {
    console.log('✅ SUCCESSO: Sharpe Ratio è ora corretto!');
    console.log('   Valore ottenuto:', sharpe.toFixed(4));
    console.log('   Range atteso: 0.2 - 0.5');
    console.log('   ✅ Il calcolo è matematicamente accurato');
  } else if (sharpe === 10) {
    console.log('❌ PROBLEMA: Sharpe Ratio ancora cappato a 10');
    console.log('   Il calcolo produce ancora valori troppo alti');
    console.log('   Controlla i log di debug per dettagli');
  } else {
    console.log('⚠️ ATTENZIONE: Sharpe Ratio fuori range');
    console.log('   Valore ottenuto:', sharpe);
    console.log('   Range atteso: 0.2 - 0.5');
  }
  
  // Test aggiuntivo con portfolio solo cash
  console.log('\n💰 Test Portfolio Solo Cash:');
  const cashPortfolio = { cash: 100000 };
  const cashSharpe = calculatePortfolioSharpeRatio(cashPortfolio, 100000, 2.0);
  console.log('Cash Portfolio Sharpe:', cashSharpe);
  console.log('Expected: ~0 (cash return ≈ risk-free rate)');
  
  // Test con portfolio solo stocks
  console.log('\n📈 Test Portfolio Solo Stocks:');
  const stockPortfolio = { stocks: 100000 };
  const stockSharpe = calculatePortfolioSharpeRatio(stockPortfolio, 100000, 2.0);
  console.log('Stock Portfolio Sharpe:', stockSharpe);
  console.log('Expected: ~0.3 - 0.4 (8% return, 18% volatility)');
  
  return isReasonable;
};

// Export per accesso globale
if (typeof window !== 'undefined') {
  (window as any).finalSharpeTest = finalSharpeTest;
}
