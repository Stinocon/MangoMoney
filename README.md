<!--
 * MangoMoney - Portfolio Tracker
 * Copyright (c) 2025 Stefano Conter
 * Licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
-->

<img width="1229" height="376" alt="logo" src="https://github.com/user-attachments/assets/2e6cae76-f5bf-4ed9-81a2-7cea45fa919c" />

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://stinocon.github.io/MangoMoney/) [![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![Privacy](https://img.shields.io/badge/privacy-100%25%20offline-brightgreen)](docs/legal/privacy-policy.md) [![Vibe Coding](https://img.shields.io/badge/vibe%20coding-100%25-ff69b4?style=flat&logo=sparkles)](https://github.com/Stinocon/MangoMoney)

---

## Chi può usare MangoMoney?

### 🇮🇹 **Per investitori italiani (target principale)**
Progettato specificamente per il sistema fiscale italiano: calcolo automatico delle plusvalenze (26% standard, 12.5% obbligazioni whitelist), bollo titoli e valuta EUR. Setup rapido con configurazioni preimpostate per l'Italia.

### 🇬🇧 **For international investors (full support)**  
Complete English interface, multiple currencies (USD, GBP, CHF, JPY, EUR), universal calculations (CAGR, SWR, Risk Score), customizable tax rates for any country. All features available with international market standards.

---

## 🚀 **[Prova subito l'app](https://stinocon.github.io/MangoMoney/)**
*Niente registrazioni, niente server, i tuoi dati restano sul tuo dispositivo*

---

## Cos'è MangoMoney?

Un tracker di patrimonio pensato per chi vuole tenere sotto controllo i propri soldi senza troppe complicazioni. Nato perché gestire tutto su Excel non è il massimo esteticamente, e i servizi online... Beh, preferisco tenere i miei dati per me.

Il nome viene da "**mangano i money**" → mancano i soldi. Un po' stupido, ma mi diverte! 😄

---

> ## 🛠️ **Disclaimer Sviluppo**
> 
> Giusto per essere trasparenti: io non sono uno sviluppatore di professione e non ho particolare interesse a diventarlo. Questo progetto è nato dal bisogno personale di avere uno strumento decente per tracciare il patrimonio, e ho fatto largo, larghissimo uso dell'intelligenza artificiale per svilupparlo. Alcuni potrebbero chiamarlo "vibe coding" - io lo chiamo pragmatismo.
>
> Il risultato è un'app funzionante (credo) che fa quello che deve fare, ma probabilmente troverete codice scritto in modo poco ortodosso, soluzioni creative (eufemismo per "accrocchi") e magari qualche bug qua e là. Il bello dell'open source è che se trovate problemi potete segnalarmeli e, ancora meglio, fixarli voi stessi. Win-win per tutti! 🚀

---

### Come funziona

Inserisci tutti i tuoi asset: conti bancari, investimenti, immobili, persino i Pokémon se li consideri un investimento.

L'app calcola automaticamente:
- **Net Worth totale** con breakdown per tipologia
- **Performance** con CAGR e confronti temporali  
- **Risk Score** basato su volatilità del portafoglio
- **Efficiency Score** (Sharpe Ratio) per misurare rendimento/rischio
- **Safe Withdrawal Rate** per pianificare la pensione
- **Tasse** su plusvalenze (configurabile per paese)

Tutte le funzionalità sono pensate per essere semplici ma complete. L'app ti dirà se i conti tornano.

Per le impostazioni, c'è una configurazione rapida per l'Italia che imposta automaticamente le aliquote fiscali più comuni.

---

## ☕ **Ti piace MangoMoney?**

<div align="center">

### 💝 **[Supporta il progetto con una donazione](https://www.paypal.com/paypalme/stefanoconter)**

🎯 **Aiuta a mantenerlo gratuito e open source**  
🚀 **Contribuisci alle nuove funzionalità**  

*Ogni caffè conta! Grazie a chi ha già contribuito* 🙏

</div>

---

## ✨ Caratteristiche principali

### **📊 Gestione Portfolio Avanzata**
- **Multi-asset**: Azioni, ETF, obbligazioni, crypto, immobili, liquidità, asset alternativi
- **Posizioni globali e individuali** con collegamento automatico
- **Transazioni complete** con calcoli cost basis (FIFO, LIFO, Average Cost)
- **Import/Export** CSV, Excel, JSON, PDF con template predefiniti

### **🧮 Calcoli Finanziari Avanzati** 
- **CAGR** (Compound Annual Growth Rate) per performance temporali
- **SWR** (Safe Withdrawal Rate) basato su Trinity Study
- **Risk Score** semplificato basato su categorie asset (adatto per il 95% degli utenti)
- **Efficiency Score** (Sharpe Ratio) per analisi rendimento/rischio
- **Simulazioni** vendite con impatto fiscale

### **🇮🇹 Fisco Italiano Integrato**
- **Plusvalenze automatiche**: 26% standard, 12.5% obbligazioni whitelist
- **Regime amministrato vs dichiarativo**
- **Bollo titoli** su depositi superiori a €5K
- **Breakdown fiscale** per anno e tipologia asset
- **Simulazioni vendite** con calcolo tasse in tempo reale

### **🔒 Privacy e Sicurezza**
- **100% offline**: Dati solo nel browser (localStorage)
- **Zero tracking**: Nessun analytics o raccolta dati
- **Backup automatici** ogni 5 minuti
- **Crittografia locale** per dati sensibili
- **CSV injection protection** e Content Security Policy
- **Audit trail** per operazioni critiche
- **Checksum verification** integrità dati

### **🌐 Internazionalizzazione**
- **🇮🇹 Italiano** (default) - Sistema fiscale italiano completo
- **🇬🇧 English** - Traduzioni complete, calcoli universali
- **EUR** (default per Italia)
- **USD, GBP, CHF, JPY** per mercati internazionali
- **Configurazione tasse** personalizzabile per ogni paese

### **🔒 Cosa non c'è **
- **Dati storici**: Non c'è dietro un DB, quindi non è possibile mantenere storico o altro
- **API**: Non faccio uso di API esterne per il valore degli asset, scomodo ma per ora è così

E sicuramente un sacco di altra roba che non mi viene in mente.

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
- 📖 **[Documentazione utente](docs/UserDocumentation.md)** - Guida completa ai calcoli finanziari
- 🛠️ **[Developer docs](docs/developers/README.md)** - Per gli smanettoni
- ⚖️ **[Privacy Policy](docs/legal/privacy-policy.md)** - Trasparenza totale

## 🔗 Risorse Utili

**[📚 AwesomeFinanceITA](https://github.com/Stinocon/AwesomeFinanceITA)** - Raccolta di risorse finanziarie per investitori italiani

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

*Ultimo aggiornamento: 25 Agosto 2025 - Versione 3.2.0*