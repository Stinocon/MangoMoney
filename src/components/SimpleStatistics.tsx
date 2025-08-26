import React from 'react';
import { TrendingUp, Shield, PieChart, AlertCircle, CheckCircle } from 'lucide-react';

interface SimpleStatisticsProps {
  totals: {
    cash: number;
    investments: number;
    realEstate: number;
    pensionFunds: number;
    alternativeAssets: number;
    debts: number;
  };
  monthlyExpenses: number;
  emergencyFundValue: number;
  darkMode: boolean;
  formatCurrencyWithPrivacy: (amount: number) => string;
}

const SimpleStatistics: React.FC<SimpleStatisticsProps> = ({
  totals,
  monthlyExpenses,
  emergencyFundValue,
  darkMode,
  formatCurrencyWithPrivacy
}) => {
  
  // 🎯 CALCOLI ONESTI (non finti)
  const totalAssets = totals.cash + totals.investments + totals.realEstate + totals.pensionFunds + totals.alternativeAssets;
  const netWorth = totalAssets - totals.debts;
  
  // 💰 LIQUIDITÀ DISPONIBILE: quanto rapidamente liquidabile
  const liquidAssets = totals.cash + totals.investments;
  const liquidityPerc = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;
  
  // 🛡️ RISK LEVEL SEMPLIFICATO: basato su % investimenti (onesto!)
  const investmentPerc = totalAssets > 0 ? (totals.investments / totalAssets) * 100 : 0;
  let riskLevel = 'Conservativo';
  let riskColor = 'green';
  
  if (investmentPerc > 70) { 
    riskLevel = 'Aggressivo'; 
    riskColor = 'red'; 
  } else if (investmentPerc > 40) { 
    riskLevel = 'Bilanciato'; 
    riskColor = 'yellow'; 
  }
  
  // 💰 EMERGENCY FUND - Using the same calculation as main app
  const emergencyMonths = monthlyExpenses > 0 ? emergencyFundValue / monthlyExpenses : 0;
  let emergencyStatus: 'success' | 'warning' | 'danger' = 'danger';
  if (emergencyMonths >= 6) emergencyStatus = 'success';
  else if (emergencyMonths >= 3) emergencyStatus = 'warning';

  return (
    <div className="space-y-6">
      
      {/* 📊 PANORAMICA ESSENZIALE */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-2`}>
          <PieChart className="w-5 h-5" />
          Panoramica Patrimonio
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Patrimonio Netto */}
          <div className={`${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {formatCurrencyWithPrivacy(netWorth)}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Patrimonio Netto
            </div>
          </div>
          
          {/* Liquidità Disponibile */}
          <div className={`${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg p-4 text-center`}>
            <div className={`flex items-center justify-center gap-1 text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <TrendingUp className="w-4 h-4" />
              {liquidityPerc.toFixed(0)}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Asset Liquidi
            </div>
            <div className="text-xs opacity-75">
              {formatCurrencyWithPrivacy(liquidAssets)}
            </div>
          </div>
          
          {/* Profilo Rischio ONESTO */}
          <div className={`${
            riskColor === 'green' ? darkMode ? 'bg-green-900/20' : 'bg-green-50' :
            riskColor === 'yellow' ? darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50' :
            darkMode ? 'bg-red-900/20' : 'bg-red-50'
          } rounded-lg p-4 text-center`}>
            <div className={`flex items-center justify-center gap-1 text-lg font-bold ${
              riskColor === 'green' ? darkMode ? 'text-green-400' : 'text-green-600' :
              riskColor === 'yellow' ? darkMode ? 'text-yellow-400' : 'text-yellow-600' :
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              <Shield className="w-4 h-4" />
              {riskLevel}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Profilo Rischio
            </div>
            <div className="text-xs opacity-75">
              {investmentPerc.toFixed(0)}% in investimenti
            </div>
          </div>
          
          {/* Emergency Fund */}
          <div className={`${
            emergencyStatus === 'success' ? darkMode ? 'bg-green-900/20' : 'bg-green-50' :
            emergencyStatus === 'warning' ? darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50' :
            darkMode ? 'bg-red-900/20' : 'bg-red-50'
          } rounded-lg p-4 text-center`}>
            <div className={`flex items-center justify-center gap-1 text-lg font-bold ${
              emergencyStatus === 'success' ? darkMode ? 'text-green-400' : 'text-green-600' :
              emergencyStatus === 'warning' ? darkMode ? 'text-yellow-400' : 'text-yellow-600' :
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {emergencyStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {emergencyMonths.toFixed(1)}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Mesi di spese coperte
            </div>
            <div className="text-xs opacity-75">
              Fondo emergenza
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleStatistics;
