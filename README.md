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
Complete English interface, multiple currencies (USD, GBP, CHF, JPY, EUR), universal calculations (SWR, Risk Profile, Emergency Fund), customizable tax rates for any country. All features available with international market standards.

---

## 🚀 **[Prova subito l'app](https://stinocon.github.io/MangoMoney/)**
*Niente registrazioni, niente server, i tuoi dati restano sul tuo dispositivo*

---

## Cos'è MangoMoney?

Un tracker di patrimonio pensato per chi vuole tenere sotto controllo i propri soldi senza troppe complicazioni. Nato perché gestire tutto su Excel non è il massimo esteticamente, e i servizi online... Beh, preferisco tenere i miei dati per me.

Il nome viene da "**mangano i money**" → mancano i soldi. Un po' stupido, ma mi diverte! 😄

---

> ## 🛠️ **Note sullo Sviluppo**
> 
> Questo progetto è stato sviluppato con un approccio pragmatico, facendo ampio uso di strumenti AI per accelerare lo sviluppo. Il risultato è un'applicazione funzionale che fa quello che promette, anche se il codice potrebbe non seguire sempre le convenzioni accademiche.
>
> Se trovi problemi o hai suggerimenti, sentiti libero di aprire una issue su GitHub. Il bello dell'open source è la collaborazione! 🚀

---

### Come funziona

Inserisci tutti i tuoi asset: conti bancari, investimenti, immobili, persino i Pokémon se li consideri un investimento.

L'app calcola basandosi sui dati inseriti manualmente:
- **Patrimonio Netto** con breakdown per tipologia
- **Profilo Rischio** semplificato basato su % investimenti  
- **Safe Withdrawal Rate** per pianificare la pensione
- **Emergency Fund** per coprire le spese impreviste
- **Tasse** su plusvalenze (configurabile per Italia)

Tutte le funzionalità sono pensate per essere semplici ma complete. Strumenti per verificare la coerenza dei dati.

Per le impostazioni, c'è una configurazione preimpostata con aliquote italiane standard.

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

### **🧮 Analisi Finanziarie Semplici e Oneste**
- **Patrimonio Netto**: Totale asset meno debiti (il tuo valore reale)
- **Safe Withdrawal Rate**: Quanto puoi prelevare per il pensionamento  
- **Profilo Rischio**: Basato su % investimenti (Conservativo/Bilanciato/Aggressivo)  
- **Emergency Fund**: Quanti mesi di spese hai coperti
- **Simulazioni** vendite con impatto fiscale

### **🇮🇹 Fisco Italiano Integrato**
- **Plusvalenze automatiche**: 26% standard, 12.5% obbligazioni whitelist
- **Regime amministrato vs dichiarativo**
- **Bollo titoli** su depositi superiori a €5K
- **Breakdown fiscale** per anno e tipologia asset
- **Simulazioni vendite** con calcolo tasse basato sui dati inseriti

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
- **Risk Score semplificato** basato su categorie asset
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
3. **Configura le impostazioni** - Per Italia c'è una configurazione preimpostata
4. **Aggiungi il tuo primo asset** - Inizia dalla liquidità
5. **Guarda le statistiche** basate sui dati inseriti

### **Configurazione Avanzata**
- **Import da CSV**: Scarica i template dall'app per il formato corretto
- **Collegamento posizioni**: Collega posizioni globali ↔ individuali ↔ transazioni  
- **Fondo emergenza**: Configura spese mensili per calcoli del fondo
- **Tasse personalizzate**: Imposta le tue aliquote fiscali

## 🎯 Funzionalità Avanzate

### **Smart Insights** 
L'app include insights di base su portfolio e allocazione:
- **Profilo rischio**: Valutazione semplificata basata su categorie asset
- **Asset allocation**: Suggerimenti di bilanciamento conservativo/aggressivo  
- **Emergency fund**: Valutazione adeguatezza del fondo emergenza
- **Risk management**: Alert su concentrazione eccessiva in asset volatili

### **Riconciliazione dei Dati**
- **Strumenti per verificare** corrispondenza tra posizioni e transazioni
- **Rilevamento discrepanze** con soglie configurabili
- **Calcolo cost basis** multipli (FIFO, LIFO, Average Cost)
- **Supporto manuale** per correzione inconsistenze

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

### **⚠️ IMPORTANTE - COSA FA E NON FA**

✅ **COSA FA L'APP**:
- Organizza e calcola il tuo patrimonio
- Applica formule finanziarie standard (CAGR, SWR)  
- Calcola tasse indicative (sistema italiano)
- Fornisce metriche di rischio semplificate

❌ **COSA NON FA**:
- Non fornisce consigli di investimento
- Non aggiorna prezzi automaticamente
- Non garantisce accuratezza dei calcoli
- Non sostituisce consulenza professionale
- Non ha accesso a dati di mercato in tempo reale

**DISCLAIMER**: MangoMoney è uno strumento di **monitoraggio**, non fornisce consigli di investimento. I calcoli sono indicativi e basati su dati storici. Per decisioni importanti consulta sempre un **consulente finanziario qualificato**.

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

*Ultimo aggiornamento: 25 Agosto 2025 - Versione 3.3.0*