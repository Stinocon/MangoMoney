# 📚 **DOCUMENTAZIONE UTENTE - MangoMoney**

## 🎯 **Guida Completa ai Calcoli Finanziari**

### 📊 **1. CAGR (Tasso di Crescita Annuo Composto)**

**Cosa significa:**
Il CAGR ti dice quanto è cresciuto il tuo investimento in media ogni anno, considerando l'effetto dell'interesse composto. È il tasso di crescita costante che, se applicato ogni anno, ti porterebbe dal valore iniziale al valore finale.

**Come si calcola:**
```
CAGR = ((Valore Finale / Valore Iniziale)^(1/anni)) - 1
```

**Esempio pratico:**
- Investimento iniziale: €10,000
- Valore finale: €15,000  
- Periodo: 5 anni
- CAGR = ((15,000/10,000)^(1/5)) - 1 = 8.45%

**Quando usarlo:**
- Confrontare performance di investimenti diversi
- Valutare crescita a lungo termine
- Pianificare obiettivi finanziari
- Analizzare performance storiche

**Limitazioni:**
- Non considera volatilità (crescita non è costante)
- Non include depositi/prelievi durante il periodo
- Periodo minimo: 1 mese
- Assume crescita costante (non realistico per investimenti volatili)

**Fonti:**
- CFA Institute, "Quantitative Methods" (2023)
- Bodie, Kane, Marcus, "Investments" (11th Edition)

---

### 💰 **2. SWR (Safe Withdrawal Rate - Tasso di Prelievo Sicuro)**

**Cosa significa:**
Lo SWR determina la percentuale massima del tuo portafoglio che puoi prelevare annualmente senza esaurirlo durante un periodo di pensionamento di 30 anni. È basato sul famoso "Trinity Study".

**Come si calcola:**
```
Prelievo Mensile = (Patrimonio Liquido × Tasso SWR) ÷ 100 ÷ 12
```

**Esempio pratico:**
- Patrimonio: €1,000,000
- Tasso SWR: 4%
- Prelievo mensile = (1,000,000 × 4) ÷ 100 ÷ 12 = €3,333.33

**Quando usarlo:**
- Pianificare il pensionamento
- Determinare quanto risparmiare
- Valutare sostenibilità del reddito pensionistico
- Pianificare FIRE (Financial Independence, Retire Early)

**Limitazioni:**
- Basato su dati storici USA (1926-1995)
- Assume periodo di pensionamento di 30 anni
- Non considera rischio di sequenza (mercati ribassisti all'inizio)
- Non include aggiustamenti per inflazione

**Fonti:**
- Trinity Study (1998): "Retirement Savings: Choosing a Withdrawal Rate"
- Bengen, W.P. (1994): "Determining Withdrawal Rates Using Historical Data"

---

### ⚠️ **3. Risk Score (Punteggio di Rischio) - Modern Portfolio Theory**

**Cosa significa:**
Il Risk Score misura il livello di rischio del tuo portafoglio su una scala da 0 a 10, implementando la **Modern Portfolio Theory** di Markowitz. Utilizza volatilità storica e correlazioni tra asset class per calcolare un punteggio scientificamente accurato basato sulla volatilità del portfolio.

**Come si calcola:**
```
Portfolio Volatility = √(Σ(wi²σi²) + Σ(wiwjσiσjρij))

wi, wj = pesi degli asset
σi, σj = volatilità storica degli asset
ρij = correlazione tra asset
Risk Score = (Portfolio Volatility × 100 ÷ 30%) × 10

0% volatilità = 0 risk score
30%+ volatilità = 10 risk score
Scala lineare basata su volatilità portfolio
```

**Interpretazione:**
- **0-2**: Molto Conservativo (es. 100% contanti)
- **3-4**: Conservativo (es. 80% obbligazioni, 20% azioni)
- **5-6**: Moderato (es. 60% azioni, 40% obbligazioni)
- **7-8**: Aggressivo (es. 80% azioni, 20% obbligazioni)
- **9-10**: Molto Aggressivo (es. 100% azioni + leverage)

**Esempio pratico:**
Portafoglio bilanciato (40% azioni, 40% obbligazioni, 20% contanti):
- Risk Score: ~5/10 (moderato)

**Quando usarlo:**
- Valutare l'adeguatezza del profilo di rischio
- Confrontare portafogli diversi
- Pianificare asset allocation
- Monitorare cambiamenti nel rischio

**Vantaggi del nuovo sistema:**
- ✅ **Scientificamente accurato**: Basato su Modern Portfolio Theory
- ✅ **Volatilità storica**: Usa dati reali Vanguard/Morningstar (2000-2023)
- ✅ **Correlazioni dinamiche**: Considera relazioni tra asset class
- ✅ **Scala lineare**: Basata su volatilità portfolio (0-30%+)
- ✅ **Separazione concetti**: Risk Score separato da Efficiency Score

**Limitazioni:**
- Usa correlazioni e volatilità storiche (potrebbero cambiare)
- Assume distribuzione normale dei rendimenti
- Non considera eventi estremi (tail risk)
- Basato su dati di mercato globali

**Fonti:**
- Markowitz, H.M. (1952): "Portfolio Selection"
- Vanguard Research: "Global Capital Markets Assumptions" (2023)

---

### 📊 **4. Efficiency Score (Sharpe Ratio)**

**Cosa significa:**
L'Efficiency Score misura quanto bene il tuo portafoglio converte il rischio in rendimento. È basato sul Sharpe Ratio, una metrica standard dell'industria finanziaria per valutare l'efficienza risk-adjusted.

**Come si calcola:**
```
Sharpe Ratio = (Portfolio Return - Risk Free Rate) ÷ Portfolio Volatility
Efficiency Rating = Eccellente (>1.0) | Buono (0.5-1.0) | Scarso (<0.5)
```

**Esempio pratico:**
Portfolio Return: 8% annuo
Risk Free Rate: 2% (BOT)
Portfolio Volatility: 15%
Sharpe Ratio = (8-2) ÷ 15 = 0.4 ("Scarso")

**Interpretazione:**
- **> 1.0**: Eccellente efficienza (alto rendimento per unità di rischio)
- **0.5-1.0**: Buona efficienza (rendimento adeguato per il rischio)
- **0-0.5**: Scarsa efficienza (poco rendimento per il rischio assunto)
- **< 0**: Efficienza molto scarsa (rendimento sotto il risk-free)

**Quando usarlo:**
- Valutare se il rischio assunto "vale la pena"
- Confrontare efficienza di portafogli diversi
- Ottimizzare asset allocation per migliore risk-adjusted return
- Monitorare performance nel tempo

**Limitazioni:**
- Basato su rendimenti storici (non predice il futuro)
- Assume distribuzione normale dei rendimenti
- Non considera skewness o eventi estremi
- Dipende dalla qualità dei dati di input

**Fonti:**
- Sharpe, W.F. (1964): "Capital Asset Pricing Model"
- CFA Institute: "Investment Performance Measurement"

---

### 🏠 **5. Emergency Fund (Fondo di Emergenza)**

**Cosa significa:**
Il fondo di emergenza è la quantità di denaro liquido che hai disponibile per coprire spese impreviste. È misurato in mesi di spese mensili che puoi coprire.

**Come si calcola:**
```
Mesi di Copertura = Valore Fondo Emergenza ÷ Spese Mensili
```

**Esempio pratico:**
- Fondo emergenza: €15,000
- Spese mensili: €3,000
- Copertura = 15,000 ÷ 3,000 = 5 mesi

**Interpretazione:**
- **0-2 mesi**: Insufficiente
- **3-5 mesi**: Adeguato
- **6+ mesi**: Ottimale

**Quando usarlo:**
- Valutare sicurezza finanziaria
- Pianificare risparmi
- Prepararsi per emergenze
- Ridurre stress finanziario

**Raccomandazioni:**
- Obiettivo minimo: 3-6 mesi di spese
- Mantenere in conti liquidi
- Aggiornare con cambiamenti di reddito/spese
- Considerare stabilità del lavoro

**Fonti:**
- CFP Board: "Financial Planning Standards"
- Ramsey, D. (2013): "The Total Money Makeover"

---

### 📈 **6. Cost Basis (Base di Costo)**

**Cosa significa:**
La base di costo è il valore originale pagato per un investimento, utilizzato per calcolare plusvalenze/minusvalenze ai fini fiscali.

**Metodi disponibili:**

#### **FIFO (First In, First Out)**
- Vende prima le azioni acquistate per prime
- Standard GAAP e IRS
- Esempio: Se hai 100 azioni acquistate a €10 e 100 a €15, vendendo 50 azioni a €20, la base di costo è €10 per azione

#### **LIFO (Last In, First Out)**
- Vende prima le azioni acquistate per ultime
- Permesso in alcuni contesti fiscali
- Esempio: Con le stesse azioni, vendendo 50 azioni a €20, la base di costo è €15 per azione

#### **Average Cost (Costo Medio)**
- Calcola il costo medio ponderato di tutte le azioni
- Metodo semplificato per investitori retail
- Esempio: Base di costo = (100×€10 + 100×€15) ÷ 200 = €12.50 per azione

**Quando usarlo:**
- Calcolare plusvalenze/minusvalenze
- Pianificare strategie di vendita
- Ottimizzare la tassazione
- Tenere contabilità fiscale

**Limitazioni:**
- Metodo deve essere consistente
- Regole fiscali variano per paese
- Considerare wash sale rules
- Documentare tutte le transazioni

**Fonti:**
- IRS Publication 550: "Investment Income and Expenses"
- GAAP Standards: ASC 320-10-35
- Italian Tax Code: Art. 67, TUIR

---

### 🎯 **7. Asset Allocation (Allocazione degli Asset)**

**Cosa significa:**
L'asset allocation è la distribuzione del tuo patrimonio tra diverse classi di investimento (azioni, obbligazioni, contanti, immobili, ecc.).

**Classi di asset principali:**

#### **Contanti (Cash)**
- **Rischio**: Molto basso
- **Rendimento atteso**: 1-2%
- **Volatilità**: 0.5%
- **Uso**: Liquidità, emergenze, opportunità

#### **Obbligazioni (Bonds)**
- **Rischio**: Basso-Medio
- **Rendimento atteso**: 3-5%
- **Volatilità**: 5%
- **Uso**: Stabilità, reddito, diversificazione

#### **Azioni (Stocks)**
- **Rischio**: Alto
- **Rendimento atteso**: 7-10%
- **Volatilità**: 18%
- **Uso**: Crescita, inflazione, lungo termine

#### **Immobili (Real Estate)**
- **Rischio**: Medio-Alto
- **Rendimento atteso**: 6-8%
- **Volatilità**: 15%
- **Uso**: Diversificazione, inflazione, reddito

#### **Asset Alternativi**
- **Rischio**: Molto alto
- **Rendimento atteso**: 8-12%
- **Volatilità**: 20-25%
- **Uso**: Diversificazione, opportunità

**Strategie di allocazione:**

#### **Conservativa (20% azioni, 80% obbligazioni)**
- Età: 60+
- Orizzonte: <10 anni
- Risk Score: 2-3

#### **Moderata (60% azioni, 40% obbligazioni)**
- Età: 40-60
- Orizzonte: 10-20 anni
- Risk Score: 5-6

#### **Aggressiva (80% azioni, 20% obbligazioni)**
- Età: <40
- Orizzonte: >20 anni
- Risk Score: 7-8

**Quando rivalutare:**
- Cambiamenti di età
- Variazioni di reddito
- Cambiamenti di obiettivi
- Condizioni di mercato estreme

---

### 📊 **8. Performance Metrics (Metriche di Performance)**

**Cosa significa:**
Le metriche di performance ti aiutano a valutare come stanno performando i tuoi investimenti rispetto a benchmark e obiettivi.

#### **Total Return (Rendimento Totale)**
```
Total Return = (Valore Finale - Valore Iniziale + Dividendi) / Valore Iniziale
```

#### **Annualized Return (Rendimento Annualizzato)**
```
Annualized Return = ((1 + Total Return)^(1/anni)) - 1
```

#### **Volatility (Volatilità)**
```
Volatility = Standard Deviation of Returns
```

#### **Sharpe Ratio**
```
Sharpe Ratio = (Return - Risk Free Rate) / Volatility
```

**Benchmark di riferimento:**
- **Azioni Globali**: MSCI World Index
- **Obbligazioni**: Bloomberg Global Aggregate
- **Contanti**: EURIBOR 3M
- **Inflazione**: Eurostat HICP

**Quando usare:**
- Valutare performance manager
- Confrontare strategie
- Monitorare obiettivi
- Prendere decisioni di investimento

---

### 🎯 **9. Raccomandazioni Pratiche**

#### **Per Principianti:**
1. Inizia con un fondo di emergenza (3-6 mesi)
2. Usa allocazione moderata (60/40)
3. Investi regolarmente (dollar-cost averaging)
4. Mantieni costi bassi (index funds)
5. Non cercare di battere il mercato

#### **Per Investitori Esperti:**
1. Considera fattori di rischio (value, momentum, quality)
2. Implementa strategie di hedging
3. Usa alternative investments per diversificazione
4. Monitora correlazioni dinamiche
5. Considera tax-loss harvesting

#### **Per Pensionamento:**
1. Usa SWR conservativo (3-3.5%)
2. Considera sequence risk
3. Mantieni liquidità per 2-3 anni
4. Pianifica per 30+ anni
5. Considera inflazione

#### **Per FIRE (Financial Independence):**
1. Usa SWR più conservativo (3%)
2. Pianifica per 50+ anni
3. Considera multiple income streams
4. Mantieni flessibilità
5. Monitora costi di vita

---

### 📚 **10. Risorse e Riferimenti**

#### **Libri Consigliati:**
- "The Intelligent Investor" - Benjamin Graham
- "A Random Walk Down Wall Street" - Burton Malkiel
- "The Little Book of Common Sense Investing" - John Bogle
- "Your Money or Your Life" - Vicki Robin
- "The Simple Path to Wealth" - JL Collins

#### **Siti Web Utili:**
- Bogleheads.org (forum investimenti)
- Portfolio Visualizer (backtesting)
- Morningstar (analisi fondi)
- Yahoo Finance (dati di mercato)
- Bank of Italy (dati economici)

#### **Strumenti di Pianificazione:**
- Calcolatori di pensionamento
- Simulatori di portafoglio
- Strumenti di budget
- App di tracking spese
- Software di pianificazione fiscale

---

### ⚠️ **11. Disclaimer e Avvertenze**

**Importante:**
- Questa documentazione è a scopo educativo
- Non costituisce consulenza finanziaria
- I risultati passati non garantiscono performance future
- Consulta sempre un professionista qualificato
- Considera la tua situazione personale

**Limitazioni:**
- I calcoli sono semplificati
- Non considerano tutti i fattori di rischio
- I dati storici potrebbero non ripetersi
- Le tasse e i costi possono variare
- Le condizioni di mercato cambiano

**Raccomandazioni:**
- Diversifica sempre
- Investi per il lungo termine
- Mantieni costi bassi
- Monitora regolarmente
- Adatta la strategia alle tue esigenze
