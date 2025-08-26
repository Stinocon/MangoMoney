import React, { useState, useMemo } from 'react';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface SwrSimplifiedProps {
  cashTotal: number;           // Solo liquidità (dai totals)
  investmentsTotal: number;    // Solo investimenti (dai totals)  
  monthlyExpenses: number;     // Spese mensili (dalle impostazioni)
  inflationRate: number;       // Inflazione (dalle impostazioni - DINAMICA)
  darkMode: boolean;
  formatCurrencyWithPrivacy: (amount: number) => string;
  handleNumericInputChange: (setter: (value: number) => void, value: string) => void;
  setMonthlyExpenses: (value: number) => void;
}

const SwrSimplified: React.FC<SwrSimplifiedProps> = ({ 
  cashTotal,
  investmentsTotal,
  monthlyExpenses, 
  inflationRate,
  darkMode,
  formatCurrencyWithPrivacy,
  handleNumericInputChange,
  setMonthlyExpenses
}) => {
  
  // 🎯 SEMPLIFICAZIONE: Solo 3 opzioni predefinite invece del slider
  const [swrMode, setSwrMode] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  
  const swrRates = {
    conservative: 3.5,  // Trinity Study - Sicuro
    balanced: 4.0,      // Standard - Classico 4%
    aggressive: 4.5     // Aggressivo - Per portfolio giovani
  };
  
  const currentRate = swrRates[swrMode];
  
  // 🎯 CORREZIONE: Solo asset veramente liquidabili (liquidità + investimenti)
  const withdrawableAssets = cashTotal + investmentsTotal;
  
  const calculations = useMemo(() => {
    // 🎯 CORREZIONE INFLAZIONE: SWR reale = SWR nominale - inflazione
    // Se inflazione è 2% e SWR nominale è 4%, SWR reale è ~2%
    // Ma per sicurezza riduciamo solo 50% dell'inflazione eccedente il 2% storico
    const historicalInflation = 2.0; // Inflazione storica media
    const excessInflation = Math.max(0, inflationRate - historicalInflation);
    const inflationAdjustment = excessInflation * 0.5; // Riduzione 50% dell'eccesso
    const adjustedRate = Math.max(1.5, currentRate - inflationAdjustment); // Min 1.5% SWR
    
    const annualWithdrawal = withdrawableAssets * (adjustedRate / 100);
    const monthlyWithdrawal = annualWithdrawal / 12;
    const coverage = monthlyExpenses > 0 ? (monthlyWithdrawal / monthlyExpenses) * 100 : 100;
    const yearsOfSupport = monthlyExpenses > 0 ? withdrawableAssets / (monthlyExpenses * 12) : 99;
    
    // Calcolo potere d'acquisto futuro (dopo 10 anni di inflazione)
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, 10);
    const futureCoverage = monthlyExpenses > 0 ? (monthlyWithdrawal / futureMonthlyExpenses) * 100 : 100;
    
    return {
      annualWithdrawal,
      monthlyWithdrawal,
      coverage,
      futureCoverage,
      yearsOfSupport,
      adjustedRate,
      inflationImpact: inflationAdjustment,
      futureMonthlyExpenses,
      status: coverage >= 100 ? 'success' : coverage >= 80 ? 'warning' : 'danger'
    };
  }, [withdrawableAssets, currentRate, monthlyExpenses, inflationRate]);

  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Simulazione Pensionamento (SWR)
        </h3>
      </div>

      {/* 🎯 SEMPLIFICAZIONE 1: 3 bottoni invece del slider */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.entries(swrRates).map(([mode, rate]) => (
          <button
            key={mode}
            onClick={() => setSwrMode(mode as 'conservative' | 'balanced' | 'aggressive')}
            className={`p-3 rounded-lg text-sm font-medium transition-all ${
              swrMode === mode
                ? darkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-semibold capitalize">
              {mode === 'balanced' ? 'Bilanciato' : mode === 'conservative' ? 'Conservativo' : 'Aggressivo'}
            </div>
            <div className="text-xs">{rate}% SWR</div>
          </button>
        ))}
      </div>

      {/* 🎯 SEMPLIFICAZIONE 2: Solo le info essenziali - 1 RIQUADRO */}
      <div className={`${
        calculations.status === 'success' 
          ? darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
          : calculations.status === 'warning'
          ? darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'  
          : darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
      } rounded-lg border p-4 mb-4`}>
        
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className={`text-2xl font-bold ${
              calculations.status === 'success' 
                ? darkMode ? 'text-green-400' : 'text-green-600'
                : calculations.status === 'warning'
                ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                : darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {formatCurrencyWithPrivacy(calculations.monthlyWithdrawal)}
              <span className="text-sm font-normal ml-1">/mese</span>
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Con il {calculations.adjustedRate.toFixed(1)}% di prelievo annuo
              {calculations.inflationImpact > 0 && (
                <div className="text-xs text-orange-500">
                  (ridotto di {calculations.inflationImpact.toFixed(1)}% per inflazione {inflationRate}%)
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {calculations.status === 'success' ? (
              <CheckCircle className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            ) : (
              <AlertCircle className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
            )}
          </div>
        </div>

        {/* Status message - UNICO riquadro informativo */}
        <div className={`text-sm ${
          calculations.status === 'success' 
            ? darkMode ? 'text-green-300' : 'text-green-700'
            : calculations.status === 'warning'
            ? darkMode ? 'text-yellow-300' : 'text-yellow-700'
            : darkMode ? 'text-red-300' : 'text-red-700'
        }`}>
          {calculations.status === 'success' && (
            <>
              ✅ <strong>Pensionamento sostenibile</strong> - Il prelievo SWR copre il {calculations.coverage.toFixed(0)}% delle tue spese attuali
              {calculations.coverage > 120 && (
                <div className="mt-1 text-xs">💡 Hai un margine di sicurezza del {(calculations.coverage - 100).toFixed(0)}%</div>
              )}
              {inflationRate > 2 && (
                <div className="mt-1 text-xs text-orange-600">
                  ⚠️ In 10 anni con inflazione {inflationRate}%, coprirà il {calculations.futureCoverage.toFixed(0)}% delle spese
                </div>
              )}
            </>
          )}
          {calculations.status === 'warning' && (
            <>
              ⚠️ <strong>Attenzione</strong> - Il prelievo SWR copre il {calculations.coverage.toFixed(0)}% delle spese attuali.
              <div className="mt-1 text-xs">
                Serve {formatCurrencyWithPrivacy((monthlyExpenses - calculations.monthlyWithdrawal) * 12)} in più all'anno
              </div>
              {inflationRate > 2 && (
                <div className="mt-1 text-xs text-red-600">
                  ❌ Con inflazione {inflationRate}%, tra 10 anni coprirà solo il {calculations.futureCoverage.toFixed(0)}%
                </div>
              )}
            </>
          )}
          {calculations.status === 'danger' && (
            <>
              ❌ <strong>Insufficiente</strong> - Il prelievo copre solo il {calculations.coverage.toFixed(0)}% delle spese attuali.
              <div className="mt-1 text-xs">
                Considera di ridurre le spese o aumentare gli investimenti
              </div>
              {inflationRate > 2 && (
                <div className="mt-1 text-xs">
                  Con inflazione {inflationRate}%, la situazione peggiorerà nel tempo
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🎯 SEMPLIFICAZIONE 3: Input spese + info base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Spese mensili attuali
          </label>
          <input
            type="number"
            value={monthlyExpenses || ''}
            onChange={(e) => handleNumericInputChange(setMonthlyExpenses, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            placeholder="2500"
            step="100"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Asset prelevabili
          </label>
          <div className={`px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-md text-sm`}>
            {formatCurrencyWithPrivacy(withdrawableAssets)}
            <div className="text-xs opacity-75 space-y-1">
              <div>• Liquidità: {formatCurrencyWithPrivacy(cashTotal)}</div>
              <div>• Investimenti: {formatCurrencyWithPrivacy(investmentsTotal)}</div>
              <div className="text-xs text-gray-500 pt-1">
                (Esclusi: immobili, fondi pensione - non liquidabili)
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 🎯 DISCLAIMER aggiornato con inflazione */}
      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        ⚠️ Simulazione basata sul Trinity Study (1998) con aggiustamento inflazione ({inflationRate}%). 
        Solo asset facilmente liquidabili. Non include tasse su capital gains.
      </div>
    </div>
  );
};

export default SwrSimplified;
