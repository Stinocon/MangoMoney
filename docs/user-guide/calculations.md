# 🧮 Guida Calcoli Finanziari

**MangoMoney usa formule matematiche standard riconosciute dalla comunità finanziaria.**

---

## 📈 CAGR (Compound Annual Growth Rate)

### **Cos'è in Parole Semplici**
Il CAGR ti dice quanto cresce un investimento in media ogni anno, considerando l'effetto dell'interesse composto.

### **Formula Matematica**
```
CAGR = (Valore Finale / Valore Iniziale)^(1/Anni) - 1
```

### **Esempio Pratico**
- **Investimento iniziale**: €10,000
- **Dopo 5 anni**: €15,000
- **CAGR**: (15,000 / 10,000)^(1/5) - 1 = 8.45% annuo

### **Quando è Utile**
- Confrontare investimenti diversi
- Pianificare obiettivi di risparmio
- Valutare performance passate
- Stimare crescita futura

### **Limitazioni e Soglie**
- **Periodo minimo per calcoli**: 1 settimana (7 giorni)
- **Periodo minimo per CAGR**: 1 mese (per periodi < 1 mese usa rendimento semplice)
- **CAGR affidabile**: 3+ mesi (per periodi < 3 mesi mostra warning volatilità)
- **CAGR stabile**: 1+ anno (per periodi < 1 anno risultato indicativo)
- Assume crescita costante (non realistico)
- Non considera volatilità
- Non include depositi/prelievi durante il periodo
- Basato su dati storici

### **Metodologia Automatica**
L'app sceglie automaticamente il metodo di calcolo più appropriato:
- **< 1 settimana**: Nessun calcolo (dati insufficienti)
- **< 1 mese**: Rendimento semplice del periodo
- **< 3 mesi**: CAGR con warning alta volatilità  
- **< 1 anno**: CAGR con nota "risultato indicativo"
- **≥ 1 anno**: CAGR standard affidabile

---

## 💰 SWR (Safe Withdrawal Rate)

### **Cos'è in Parole Semplici**
Quanto puoi prelevare dal tuo portafoglio ogni anno senza finire i soldi durante il pensionamento.

### **Base Teorica**
- **Trinity Study** (1998): Analisi su dati USA 1926-1995
- **Periodo**: 30 anni di pensionamento
- **Portafoglio**: 50% azioni, 50% obbligazioni

### **Esempio Pratico**
- **Patrimonio**: €1,000,000
- **SWR 4%**: €40,000 annui = €3,333 mensili
- **Sicurezza**: 95% di successo su 30 anni

### **Quando è Utile**
- Pianificare pensionamento
- Calcolare FIRE (indipendenza finanziaria)
- Stimare bisogni futuri
- Valutare sostenibilità reddito

### **Limitazioni**
- Basato su dati USA storici
- Non considera tasse
- Assume periodo fisso di 30 anni

---

## ⚖️ Risk Score (Semplificato)

### **Come Funziona**
Punteggio da 0 a 10 basato sulla percentuale di investimenti nel portafoglio.

### **Calcolo**
```
Risk Score = Σ(Asset Weight × Category Risk Weight) / Total Weight

Categorie di Rischio:
- Contanti: 1 (molto sicuro)
- Fondi Pensione: 3 (moderato, regolamentato)
- Immobili: 4 (medio, stabile ma illiquido)
- Investimenti: 7 (alto, volatile)
- Beni Alternativi: 9 (molto alto, speculativo)
```

### **Interpretazione**
- **0-2**: Molto Conservativo (es. 100% contanti)
- **3-4**: Conservativo (es. 80% obbligazioni, 20% azioni)
- **5-6**: Moderato (es. 60% azioni, 40% obbligazioni)
- **7-8**: Aggressivo (es. 80% azioni, 20% obbligazioni)
- **9-10**: Molto Aggressivo (es. 100% azioni + leverage)

### **Esempio Pratico**
Portafoglio bilanciato:
- 40% investimenti (40% × 7 = 2.8)
- 40% immobili (40% × 4 = 1.6)
- 20% contanti (20% × 1 = 0.2)
- **Risk Score**: 4.6/10 (moderato-conservativo)

### **Perché Semplificato?**
Per il 95% delle persone basta questo approccio. Per analisi avanzate serve un consulente finanziario.

---

## 🛡️ Emergency Fund

### **Cos'è**
Quanti mesi di spese hai coperti con la liquidità disponibile.

### **Calcolo**
```
Mesi Coperti = Liquidità Designata / Spese Mensili
```

### **Soglie Standard**
- **< 3 mesi**: Insufficiente
- **3-6 mesi**: Adeguato
- **> 6 mesi**: Ottimale

### **Esempio**
- **Liquidità**: €15,000
- **Spese mensili**: €3,000
- **Emergency Fund**: 5 mesi (adeguato)

---

## 📊 Patrimonio Netto

### **Formula**
```
Patrimonio Netto = Totale Asset - Totale Debiti
```

### **Cosa Include**
**Asset:**
- Conti correnti e depositi
- Investimenti (azioni, ETF, obbligazioni)
- Immobili (casa, terreni)
- Beni alternativi (crypto, collezioni)

**Debiti:**
- Mutui
- Prestiti personali
- Carte di credito
- Altri debiti

### **Esempio**
- **Asset**: €500,000 (casa €300K + investimenti €150K + liquidità €50K)
- **Debiti**: €200,000 (mutuo €200K)
- **Patrimonio Netto**: €300,000

---

## 🧾 Calcoli Fiscali (Italia)

### **Plusvalenze**
- **Aliquota standard**: 26%
- **Obbligazioni whitelist**: 12.5%
- **Calcolo**: (Valore Vendita - Valore Acquisto) × Aliquota

### **Bollo Titoli**
- **Soglia**: €5,000 per conto
- **Aliquota**: 0.2% annuo
- **Calcolo**: Saldo × 0.002

### **Esempio Plusvalenza**
- **Acquisto**: €10,000
- **Vendita**: €12,000
- **Plusvalenza**: €2,000
- **Tasse**: €2,000 × 26% = €520

---

## ⚠️ Limitazioni Importanti

### **Cosa NON Calcoliamo**
- **Risk score dettagliato**: Serve composizione specifica investimenti
- **Diversificazione precisa**: Serve asset class specifiche
- **Consigli asset allocation**: Serve analisi professionale
- **Performance vs mercato**: Serve dati tempo reale

### **Perché Questi Limiti?**
Preferiamo dire "non lo sappiamo" piuttosto che fornire analisi imprecise. Per analisi portfolio avanzate raccomandiamo consulenti finanziari qualificati.

---

## 📚 Fonti Teoriche

### **Studi di Riferimento**
- **Trinity Study** (1998): Safe Withdrawal Rate
- **Bengen** (1994): 4% Rule
- **Markowitz** (1952): Modern Portfolio Theory
- **Sharpe** (1964): Capital Asset Pricing Model

### **Standard di Settore**
- **CFA Institute**: Quantitative Methods
- **Bodie, Kane, Marcus**: Investments (11th Edition)
- **Bogle**: Principi di diversificazione

---

<div align="center">

**💡 Dubbio su un calcolo?** Apri una [issue](https://github.com/Stinocon/MangoMoney/issues) su GitHub!

</div>
