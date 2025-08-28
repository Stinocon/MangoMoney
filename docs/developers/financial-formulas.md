# 📊 Financial Formulas - MangoMoney

**Formule matematiche implementate e riferimenti teorici.**

**Ultimo aggiornamento:** 28 Agosto 2025 - Versione 4.0.0

---

## 📈 CAGR (Compound Annual Growth Rate)

### **Formula Matematica**
```
CAGR = (Valore Finale / Valore Iniziale)^(1/Anni) - 1
```

### **Implementazione TypeScript**
```typescript
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (years <= 0 || initialValue <= 0) return 0;
  
  const ratio = finalValue / initialValue;
  const cagr = Math.pow(ratio, 1 / years) - 1;
  
  return cagr;
}
```

### **Esempio**
- **Valore iniziale**: €10,000
- **Valore finale**: €15,000
- **Anni**: 5
- **CAGR**: (15,000 / 10,000)^(1/5) - 1 = 8.45%

### **Limitazioni**
- Assume crescita costante (non realistico)
- Non considera volatilità
- Basato su dati storici

---

## 💰 SWR (Safe Withdrawal Rate)

### **Base Teorica: Trinity Study**
- **Periodo**: 1926-1995 (dati USA)
- **Portafoglio**: 50% azioni, 50% obbligazioni
- **Periodo pensionamento**: 30 anni
- **Success rate**: 95%

### **Formula Implementata**
```
SWR = Patrimonio × 0.04 (4% Rule)
```

### **Implementazione TypeScript**
```typescript
export function calculateSWR(
  portfolioValue: number,
  withdrawalRate: number = 0.04
): number {
  return portfolioValue * withdrawalRate;
}

export function calculateMonthlySWR(
  portfolioValue: number,
  withdrawalRate: number = 0.04
): number {
  const annualSWR = calculateSWR(portfolioValue, withdrawalRate);
  return annualSWR / 12;
}
```

### **Esempio**
- **Patrimonio**: €1,000,000
- **SWR 4%**: €40,000 annui
- **SWR mensile**: €3,333

---

## ⚖️ Risk Score (Semplificato)

### **Formula**
```
Risk Score = Σ(Asset Weight × Category Risk Weight) / Total Weight

Categorie di Rischio:
- Contanti: 1 (molto sicuro)
- Fondi Pensione: 3 (moderato)
- Immobili: 4 (medio)
- Investimenti: 7 (alto)
- Beni Alternativi: 9 (molto alto)
```

### **Implementazione TypeScript**
```typescript
interface Asset {
  value: number;
  category: 'cash' | 'pension' | 'real_estate' | 'investments' | 'alternatives';
}

const RISK_WEIGHTS = {
  cash: 1,
  pension: 3,
  real_estate: 4,
  investments: 7,
  alternatives: 9
};

export function calculateRiskScore(assets: Asset[]): number {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  if (totalValue === 0) return 0;
  
  const weightedRisk = assets.reduce((sum, asset) => {
    const weight = asset.value / totalValue;
    const riskWeight = RISK_WEIGHTS[asset.category];
    return sum + (weight * riskWeight);
  }, 0);
  
  return weightedRisk;
}
```

### **Interpretazione**
- **0-2**: Molto Conservativo
- **3-4**: Conservativo
- **5-6**: Moderato
- **7-8**: Aggressivo
- **9-10**: Molto Aggressivo

---

## 🛡️ Emergency Fund

### **Formula**
```
Mesi Coperti = Liquidità Designata / Spese Mensili
```

### **Implementazione TypeScript**
```typescript
export function calculateEmergencyFund(
  liquidAssets: number,
  monthlyExpenses: number
): number {
  if (monthlyExpenses <= 0) return 0;
  return liquidAssets / monthlyExpenses;
}

export function getEmergencyFundStatus(months: number): string {
  if (months < 3) return 'insufficient';
  if (months < 6) return 'adequate';
  return 'optimal';
}
```

### **Soglie Standard**
- **< 3 mesi**: Insufficiente
- **3-6 mesi**: Adeguato
- **> 6 mesi**: Ottimale

---

## 📊 Patrimonio Netto

### **Formula**
```
Patrimonio Netto = Totale Asset - Totale Debiti
```

### **Implementazione TypeScript**
```typescript
interface Asset {
  value: number;
  category: string;
}

interface Debt {
  value: number;
  type: string;
}

export function calculateNetWorth(assets: Asset[], debts: Debt[]): number {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.value, 0);
  
  return totalAssets - totalDebts;
}
```

---

## 🧾 Calcoli Fiscali (Italia)

### **Plusvalenze**
```
Plusvalenza = (Valore Vendita - Valore Acquisto) × Aliquota

Aliquote:
- Azioni, ETF, Fondi: 26%
- Obbligazioni whitelist: 12.5%
- Crypto: 26%
```

### **Implementazione TypeScript**
```typescript
export const TAX_RATES = {
  CAPITAL_GAINS: 0.26,
  WHITELIST_BONDS: 0.125,
  CRYPTO: 0.26
};

export function calculateCapitalGains(
  purchaseValue: number,
  saleValue: number,
  assetType: 'stocks' | 'bonds' | 'crypto' = 'stocks'
): number {
  const gain = saleValue - purchaseValue;
  if (gain <= 0) return 0;
  
  const taxRate = assetType === 'bonds' 
    ? TAX_RATES.WHITELIST_BONDS 
    : TAX_RATES.CAPITAL_GAINS;
  
  return gain * taxRate;
}
```

### **Bollo Titoli**
```
Bollo Titoli = Saldo × 0.002 (0.2% annuo)
Soglia: €5,000 per conto
```

### **Implementazione TypeScript**
```typescript
export function calculateStampDuty(
  accountBalance: number,
  threshold: number = 5000
): number {
  if (accountBalance <= threshold) return 0;
  return accountBalance * 0.002;
}
```

---

## 📈 Allocazione Portfolio

### **Formula Percentuale**
```
Percentuale Asset = (Valore Asset / Patrimonio Totale) × 100
```

### **Implementazione TypeScript**
```typescript
export function calculateAllocation(
  assetValue: number,
  totalPortfolio: number
): number {
  if (totalPortfolio <= 0) return 0;
  return (assetValue / totalPortfolio) * 100;
}

export function getAssetAllocation(assets: Asset[]): Record<string, number> {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  return assets.reduce((allocation, asset) => {
    allocation[asset.category] = calculateAllocation(asset.value, totalValue);
    return allocation;
  }, {} as Record<string, number>);
}
```

---

## 🔢 Precisione Matematica

### **Decimal.js**
Per evitare errori di floating point:

```typescript
import Decimal from 'decimal.js';

export function preciseCalculation(a: number, b: number): number {
  return new Decimal(a).plus(b).toNumber();
}

export function precisePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return new Decimal(part).dividedBy(total).times(100).toNumber();
}
```

### **Rounding**
```typescript
export function roundToCurrency(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
```

---

## 📚 Riferimenti Teorici

### **Studi di Riferimento**
- **Trinity Study** (1998): Safe Withdrawal Rate
- **Bengen** (1994): 4% Rule
- **Markowitz** (1952): Modern Portfolio Theory
- **Sharpe** (1964): Capital Asset Pricing Model

### **Standard di Settore**
- **CFA Institute**: Quantitative Methods
- **Bodie, Kane, Marcus**: Investments (11th Edition)
- **Bogle**: Principi di diversificazione

### **Fonti Fiscali**
- **Agenzia Entrate**: Norme fiscali italiane
- **Testo Unico**: D.Lgs. 58/1998 (TUF)
- **Circolari**: Aggiornamenti normativi

---

## ⚠️ Limitazioni e Disclaimer

### **Limitazioni Implementate**
- **Risk Score**: Semplificato, non sostituisce analisi professionale
- **SWR**: Basato su dati USA storici
- **CAGR**: Assume crescita costante
- **Tasse**: Indicative, verifica con commercialista

### **Responsabilità**
- **Verifica**: Sempre i calcoli prima di decisioni
- **Aggiornamenti**: Norme fiscali possono cambiare
- **Consulenza**: Per decisioni importanti consulta esperti

---

<div align="center">

**💡 Dubbio su una formula?** Apri una [discussion](https://github.com/Stinocon/MangoMoney/discussions) su GitHub!

</div>
