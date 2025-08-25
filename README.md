<!--
 * MangoMoney - Portfolio Tracker
 * Copyright (c) 2025 Stefano Conter
 * Licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
-->

<img width="1229" height="376" alt="logo" src="https://github.com/user-attachments/assets/f0f18c09-2bd6-42e0-aa81-dfaf04d9867d" />

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://stinocon.github.io/MangoMoney/) [![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![Privacy](https://img.shields.io/badge/privacy-100%25%20offline-brightgreen)](docs/legal/privacy-policy.md) [![Vibe Coding](https://img.shields.io/badge/vibe%20coding-100%25-ff69b4?style=flat&logo=sparkles)](https://github.com/Stinocon/MangoMoney)

---

## 🌍 Who can use MangoMoney? | Chi può usare MangoMoney?

**🇮🇹 For Italian investors (main target)** | **🇮🇹 Per investitori italiani (target principale)**
Designed specifically for Italian tax system: automatic capital gains calculation (26% standard, 12.5% whitelist bonds), stamp duty, EUR currency.
Pensato specificatamente per il sistema fiscale italiano: calcolo automatico plusvalenze (26% standard, 12.5% obbligazioni whitelist), bollo, valuta EUR.

**🌐 For international investors (full support)** | **🌐 Per investitori internazionali (supporto completo)**  
Complete English interface, multiple currencies (USD, GBP, CHF, JPY, EUR), universal calculations (CAGR, SWR, Risk Score), customizable tax rates.
Interfaccia inglese completa, valute multiple (USD, GBP, CHF, JPY, EUR), calcoli universali (CAGR, SWR, Risk Score), aliquote tasse personalizzabili.

---

## 🚀 **[Prova subito l'app](https://stinocon.github.io/MangoMoney/)**
*Niente registrazioni, niente server, i tuoi dati restano sul tuo dispositivo*

---

## Cos'è MangoMoney?

Un tracker di patrimonio pensato per chi vuole tenere sotto controllo i propri soldi senza complicazioni. Nato perché gestire tutto su Excel non è il massimo esteticamente, e i servizi online... beh, preferisco tenere i miei dati per me.

Il nome viene da "**mangano i money**" → mancano i soldi. Un po' stupido, ma mi diverte! 😄

### Come funziona

Inserisci tutti i tuoi asset: conti bancari, investimenti, immobili, persino i Pokémon se li consideri un investimento. L'app calcola automaticamente il tuo patrimonio netto e ti dà statistiche interessanti come:

- Quanto potresti "prelevare" ogni mese senza intaccare il capitale (SWR)
- Quanto durerebbe il tuo fondo di emergenza  
- Il rischio del tuo portfolio (con calcoli veri, non a caso)
- Le tasse che dovrai pagare sui tuoi guadagni (per Italia)
- Performance reali dei tuoi investimenti (CAGR)

## ✨ Caratteristiche principali

### 🔒 **Privacy Assoluta**
- **100% offline** - I tuoi dati non escono mai dal tuo dispositivo (se scarichi l'app localmente)
- **Niente tracking** - Zero analytics, zero cookie, zero spying  
- **Crittografia AES-256** - Dati sensibili protetti localmente

### 💰 **Gestione Completa Portfolio**

#### **Liquidità & Contanti**
- **Conti bancari**: Correnti, depositi, libretti postali
- **Contanti**: Wallet, cassaforte, contanti in casa
- **Fondo di emergenza**: Configurazione automatica con calcolo mesi di autonomia
- **Spese mensili**: Tracciamento per calcoli di sicurezza finanziaria

#### **Investimenti Avanzati** 
- **Posizioni globali**: Vista aggregata per broker/banca (es. "Totale su Fineco: €50.000")
- **Asset individuali**: Singoli titoli con ticker, ISIN, quantità, prezzi (es. "VWCE: 100 pezzi @ €105")
- **Storico transazioni**: Registro completo acquisti/vendite con commissioni
- **Collegamento intelligente**: Verifica automatica posizioni vs transazioni
- **Tipologie complete**: Azioni, ETF, Obbligazioni, Obbligazioni whitelist
- **Performance tracking**: CAGR, rendimenti lordi/netti

#### **Immobili**
- **Proprietà multiple**: Casa principale, seconde case, investimenti
- **Valutazioni aggiornabili**: Prezzi di mercato, stime, perizie
- **Indirizzi e dettagli**: Gestione completa informazioni

#### **Debiti & Passività**
- **Mutui**: Casa, investimenti, ristrutturazioni  
- **Prestiti personali**: Rate auto, prestiti famiglia
- **Carte di credito**: Saldi e limiti

### 📊 **Calcoli Finanziari Intelligenti**

#### **CAGR (Compound Annual Growth Rate)**
Rendimento annualizzato reale dei tuoi investimenti:
```javascript
// Calcolo con gestione edge cases e precisione finanziaria
const cagr = safeCAGR(initialValue, finalValue, years);
// Gestisce casi limite: valori negativi, zero, periodi brevi
```
```
Investiti €10.000 → Dopo 5 anni hai €15.000
CAGR = 8.45% annuo
```

#### **SWR (Safe Withdrawal Rate)** 
Quanto puoi prelevare senza finire mai i soldi (regola del 4%):
```javascript
// Basato su Trinity Study con inflazione e tasse
const swr = calculateSWR(portfolioData, swrRate, inflationRate, monthlyExpenses);
// Calcola prelievo sicuro mensile considerando inflazione e tasse
```
```
Portfolio €500.000 × 4% = €20.000/anno
€1.667/mese prelevabili per 30+ anni
```

#### **Risk Score Intelligente** 
Analisi rischio basata su **Modern Portfolio Theory**:
```javascript
// Basato su Modern Portfolio Theory
const riskScore = calculatePortfolioRiskScore(assets);
// Analizza volatilità, correlazioni e allocazione
```
- Usa volatilità storiche **reali** (liquidità 0.5%, azioni 18%, immobili 15%)
- Considera **correlazioni** tra asset diversi  
- Punteggio 0-10: Conservativo (0-3), Moderato (4-6), Aggressivo (7-10)

#### **Emergency Fund Metrics**
Analisi del fondo di emergenza:
```javascript
// Calcolo autonomia finanziaria e adeguatezza fondo
const metrics = calculateEmergencyFundMetrics(assets, monthlyExpenses);
// Valuta se il fondo copre i mesi ottimali/adeguati
```
- **3-6 mesi**: Adeguato per la maggior parte delle persone
- **6+ mesi**: Ottimale per massima sicurezza finanziaria

#### **Sistema Fiscale Italiano Integrato** 🇮🇹
- **Calcolo automatico plusvalenze** su vendite in profitto
- **Aliquote differenziate**: 26% standard, 12.5% obbligazioni whitelist
- **Monitoraggio capital gains** per anno fiscale
- **Bollo evidenziato** in rosso (0.20% su depositi titoli)
- **Rendimenti netti** al netto tasse

### 🎨 **Interfaccia & Usabilità**

#### **Design Moderno**
- **Dark/Light mode** - Per i cultori dello schermo nero
- **Responsive design** - Perfetto su desktop, tablet, smartphone
- **Accessibilità WCAG 2.1 AA** - Supporto screen reader completo

#### **Grafici & Visualizzazioni**
- **Grafici a torta interattivi** - Distribuzione patrimonio
- **Grafici a barre** - Confronti tra categorie  
- **Charts performance** - Trend nel tempo
- **Colori coordinati** - Consistenti in tutta l'app

#### **Export & Backup**
- **Export PDF professionale** - Report per commercialista
- **Export CSV** - Analisi su Excel/Google Sheets
- **Backup JSON completo** - Tutti i dati con metadata
- **Backup automatico** - Salvataggio ogni 5 minuti
- **Template CSV** - Import facile dei tuoi dati esistenti

### 🛡️ **Sicurezza Avanzata**

#### **Protezione Dati**
- **Input sanitization** completa (prevenzione XSS)
- **CSV injection protection** 
- **Content Security Policy** headers
- **Audit trail** per operazioni critiche
- **Checksum verification** integrità dati

#### **Validazioni Smart**
- **Controllo collegamenti** posizioni ↔ transazioni (tolleranza 5%)
- **Validazione import** con sanitizzazione
- **Controllo integrità** backup e restore
- **Error logging** avanzato per debugging

### 🌐 **Internazionalizzazione**

#### **Lingue Supportate**
- **🇮🇹 Italiano** (default) - Sistema fiscale italiano completo
- **🇬🇧 English** - Traduzioni complete, calcoli universali

#### **Valute Multiple**
- **EUR** (default per Italia)
- **USD, GBP, CHF, JPY** per mercati internazionali
- **Configurazione tasse** personalizzabile per ogni paese

## 💻 Per sviluppatori

### **Setup Rapido**
```bash
git clone https://github.com/Stinocon/MangoMoney.git
cd MangoMoney
npm install
npm start
```

### **Stack Tecnologico**
- **React 18 + TypeScript** in strict mode
- **Tailwind CSS** per styling responsivo
- **Recharts** per grafici accessibili  
- **Decimal.js** per precisione finanziaria
- **CryptoJS** per crittografia locale
- **jsPDF + html2canvas** per export PDF
- **Bundle size**: 406 kB (ottimizzato con tree shaking)

### **Architecture Highlights**
- **Modern Portfolio Theory** per calcoli rischio
- **Trinity Study** per calcoli SWR
- **Cost basis methods**: FIFO, LIFO, Average Cost
- **Accessibility-first**: Focus trap, keyboard navigation, ARIA labels
- **Privacy-by-design**: Zero data leakage, tutto localStorage

### **Testing**
```bash
npm test                 # Test interattivo
npm run test:coverage    # Con coverage report  
npm run lint            # Code quality check
npm run type-check      # TypeScript validation
```

## 📱 Come iniziare

### **Quick Start (5 minuti)**
1. **Apri** [stinocon.github.io/MangoMoney](https://stinocon.github.io/MangoMoney/)
2. **Scegli la tua lingua** (🇮🇹 Italiano / 🇬🇧 English) 
3. **Configura le impostazioni** - Per Italia c'è un setup automatico
4. **Aggiungi il tuo primo asset** - Inizia dalla liquidità
5. **Guarda le statistiche** aggiornarsi in tempo reale

### **Configurazione Avanzata**
- **Import da CSV**: Scarica i template dall'app per il formato corretto
- **Collegamento posizioni**: Collega posizioni globali ↔ individuali ↔ transazioni  
- **Fondo emergenza**: Configura spese mensili per calcoli automatici
- **Tasse personalizzate**: Imposta le tue aliquote fiscali

## 🎯 Funzionalità Avanzate

### **Smart Insights** 
L'app genera automaticamente insights intelligenti:
- **Performance alerts**: "Portfolio +15% vs periodo precedente"
- **Risk warnings**: "Rischio troppo alto, diversifica"  
- **Emergency fund alerts**: "Fondo emergenza sotto 3 mesi"
- **Tax optimization**: "Plusvalenze €5K, tasse stimate €1.3K"

### **Riconciliazione Automatica**
- **Verifica discrepanze** tra posizioni e transazioni
- **Tolleranza configurabile** (default 5%)
- **Highlighting problemi** con suggerimenti correzione
- **Calcolo cost basis** multipli (FIFO, LIFO, Average)

### **Analisi Fiscali Avanzate** 
Per utenti italiani:
- **Capital gains per anno** fiscale
- **Breakdown per tipo asset** (standard vs whitelist)  
- **Simulazione vendite** con calcolo tasse
- **Regime amministrato vs dichiarativo**

## 🆘 Supporto & Documentazione

### **Documentazione**
- 📖 **[Manuale completo](docs/user-manual/README.md)** - Guida step-by-step
- 🛠️ **[Developer docs](docs/developers/README.md)** - Per gli smanettoni
- ⚖️ **[Privacy Policy](docs/legal/privacy-policy.md)** - Trasparenza totale

## 🔗 Risorse Utili

**[📚 AwesomeFinanceITA](https://github.com/Stinocon/AwesomeFinanceITA)** - Raccolta di risorse finanziarie per investitori italiani

## ☕ Supporta il Progetto

Se MangoMoney ti è utile e vuoi supportare lo sviluppo, puoi offrirmi un caffè! ☕

**[💝 Dona su PayPal](https://www.paypal.com/paypalme/stefanoconter)**

Ogni contributo, anche piccolo, aiuta a:
- ✅ Mantenere il progetto **gratuito** e **open source**
- ✅ Aggiungere **nuove funzionalità** 
- ✅ Migliorare **sicurezza** e **performance**
- ✅ Supportare **hosting** e **domini**

*Grazie a tutti quelli che hanno già contribuito! 🙏*

---

## ⚖️ Disclaimer & Licenza

### **⚠️ IMPORTANTE** 
MangoMoney è uno strumento di **monitoraggio**, non fornisce consigli di investimento. I calcoli sono indicativi e basati su dati storici. Per decisioni importanti consulta sempre un **consulente finanziario qualificato**.

### **📄 Licenza**
Rilasciato sotto **Creative Commons BY-NC-SA 4.0**. 

✅ **Puoi:** Usare, modificare, distribuire liberamente  
❌ **Non puoi:** Rivendere o usare per scopi commerciali  
🔄 **Condizione:** Le modifiche devono mantenere la stessa licenza

[Testo completo della licenza](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

**💡 Ti è utile?** Lascia una ⭐ su GitHub!

*P.S. Se ti piace l'idea di tenere i tuoi dati finanziari per te, condividi MangoMoney con chi pensi possa interessare. La privacy finanziaria è importante!* 

---

*Ultimo aggiornamento: 23 Agosto 2025 - Versione 3.2.0*
