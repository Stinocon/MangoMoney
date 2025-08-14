# 🥭 MangoMoney

[![Live Demo](https://img.shields.io/badge/🌐_Live-Demo-green?style=for-the-badge)](https://stinocon.github.io/MangoMoney/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0-orange?style=for-the-badge)](https://github.com/Stinocon/MangoMoney)

**Portfolio tracker completo e moderno, pensato per monitorare investimenti e patrimonio in modo (non)professionale, semplice e — soprattutto — senza che i tuoi dati vadano a spasso per Internet.**

Gli utenti che potrebbero usarlo e trovarlo utile/comodo non sono sicuramente i pignolazzi, ma gli utenti che si sono appena affacciati al mondo della finanza personale e hanno quindi poche pretese. Inoltre è pensato principalmente per utenti italiani, tuttavia è stata aggiunta una traduzione inglese (più o meno completa) e la possibilità di usare diverse valute.

L'idea nasce perché per anni ho gestito il mio *Net Worth* su Excel... e diciamolo, gli Excel non brillano per estetica. Ho fatto largo uso di IA per costruirlo, quindi se pensi "questo pezzo sembra scritto da un'IA", probabilmente hai ragione.

L'ho condiviso per gentilezza e spirito divulgativo, non come prodotto commerciale finito. Eventuali *issue*? Potrei sistemarle… oppure no. 

## 📛 Origine del Nome

**MangoMoney** = gioco di parole da *"Mangano i money"* → *mancano i soldi*  
Un nome simpatico per un problema serio: il portafoglio sempre vuoto! 🥭

---

## ✨ Caratteristiche Principali

### 💰 **Gestione Patrimonio Avanzata**
- **Liquidità Smart**: Conti bancari (corrente/deposito/cash) con fondo emergenza configurabile
- **Investimenti Professionali**: 
  - Posizioni globali (broker/banche) + individuali (singoli titoli)
  - Collegamento automatico con validazione (tolleranza 5%)
  - Performance tracking con rendimenti annualizzati (CAGR)
  - Storico transazioni completo con filtri avanzati
- **Immobili**: Residenza principale e proprietà secondarie con indirizzi
- **Asset Alternativi**: TCG, collezionabili, arte, vinili, libri, fumetti
- **Altri Asset**: Fondi pensione, debiti, crypto con categorizzazione avanzata

### 📊 **Analisi Finanziarie Avanzate**
- **Score di Rischio**: Basato su Modern Portfolio Theory (0-10) con pesi scientifici
- **Metriche di Salute**: Debt-to-asset ratio, liquidity ratio, investment efficiency
- **Safe Withdrawal Rate**: Simulazione prelievi sostenibili personalizzabile (0-10%)
- **Performance Analytics**: 
  - Calcolo manuale vs basato su transazioni
  - Rendimenti annualizzati con controllo periodi minimi
  - Analisi costi e commissioni
- **Reconciliation Dashboard**: Verifica coerenza tra posizioni globali e individuali

### 🧮 **Metodologie di Calcolo**
- **Risk Score**: Media ponderata basata su allocazione e volatilità asset
- **Performance**: Due modalità (manuale + transaction-based) con inclusione commissioni
- **CAGR**: Formula compound con controllo distorsioni per periodi <1 mese
- **SWR**: Calcolo sostenibilità prelievi su base scientifica
- **Linking Validation**: Tolleranza dinamica (5% o soglia minima per valuta)

### 🎨 **Esperienza Utente Premium**
- **Multi-Lingua**: Italiano e Inglese completo
- **Multi-Valuta**: EUR, USD, GBP, CHF, JPY con formattazione locale
- **Temi**: Modalità scura/chiara con transizioni fluide
- **Layout Responsivo**: 
  - Desktop: Tabelle complete e grafici avanzati
  - Mobile: Card view ottimizzate con swipe
  - Tablet: Layout ibrido adattivo
- **Filtri Avanzati**: Ricerca, paginazione e ordinamento intelligente
- **Auto-Save**: Salvataggio istantaneo ad ogni modifica

### 🔄 **Import/Export Professionale**
- **Backup Completi**: JSON con metadati, impostazioni e validazione
- **Export Multipli**: 
  - CSV dettagliato per analisi
  - Excel-compatible per spreadsheet
  - PDF professionale per report
- **Importazione Sicura**: Validazione struttura, conferma e rollback

### ⚙️ **Configurazione Avanzata**
- **Impostazioni Fiscali**: Plusvalenze, bolli (preset Italia)
- **Fondo Emergenza**: Soglie personalizzabili (ottimale/adeguato)
- **Performance**: Controlli periodo e tolleranze linking
- **Layout**: Forzatura mobile e preferenze display

---

## 📐 Metodologie e Calcoli

### 🎯 **Score di Rischio (0-10)**
Basato su **Modern Portfolio Theory** con pesi scientifici:

```
Formula: (Σ(% allocazione × peso rischio) ÷ Σ(% allocazione)) × 2

Pesi di Rischio:
💰 Liquidità: 1.0 (rischio minimo - alta liquidità)
🏦 Altri conti: 1.5 (prodotti finanziari diversi)
🏛️ Fondi pensione: 2.0 (regolamentati, lungo termine)
🏠 Immobili: 2.0 (stabili ma illiquidi)
📊 Investimenti: 3.0-4.0 (volatilità mercato)
🎨 Beni alternativi: 5.0 (speculativi, alta volatilità)
```

### 📈 **Performance degli Investimenti**

**Due modalità di calcolo per massima precisione:**

**A) Performance Manuale:**
```
Rendimento = (Prezzo Attuale × Quantità) - (Prezzo Medio × Quantità)
Rendimento % = (Rendimento / Investimento Iniziale) × 100
```

**B) Performance da Transazioni (raccomandato):**
```
Cost Basis = Σ Acquisti + Σ Commissioni - Vendite Proporzionali
Rendimento = Valore Attuale - Cost Basis
Rendimento % = (Rendimento / Cost Basis) × 100
```

### 📊 **Rendimento Annualizzato (CAGR)**
```
Formula: [(1 + Rendimento Totale/Investito)^(1/Anni)] - 1

Controlli di Sicurezza:
- Solo per periodi > 1 mese (evita distorsioni)
- Cap a ±10.000% per valori estremi
- Basato sulla transazione più antica
```

### 🛡️ **Fondo di Emergenza**
```
Mesi di Copertura = Valore Fondo Designato / Spese Mensili

Classificazione:
✅ Ottimale: ≥ 6 mesi (configurabile)
⚠️ Adeguato: 3-6 mesi (configurabile)  
❌ Insufficiente: < 3 mesi
```

### 💸 **Safe Withdrawal Rate (SWR)**
Simulazione sostenibilità finanziaria basata su Trinity Study:
```
Asset Liquidi Netti = Liquidità + Investimenti + Altri Conti
Prelievo Annuo = Asset Liquidi × (Tasso SWR / 100)
Prelievo Mensile = Prelievo Annuo / 12
Anni di Sostentamento = Asset Liquidi / (Spese Mensili × 12)
```

### 🔗 **Validazione Collegamenti**
Controllo coerenza tra posizioni globali (broker) e asset individuali:
```
Tolleranza = max 5% del valore, soglia minima per valuta
Soglie: €10 (EUR), $10 (USD), £8 (GBP), ¥1000 (JPY), CHF10

Status: ✅ Valido | ⚠️ Discrepanza oltre tolleranza
```

### 💰 **Metriche Salute Finanziaria**
```
Rapporto Debiti/Patrimonio = |Debiti| / Patrimonio Totale
- Ottima: < 30% | Buona: < 50% | Attenzione: > 50%

Rapporto Liquidità = Liquidità / Patrimonio Totale  
- Adeguata: > 10% | Limitata: > 5% | Insufficiente: < 5%

Efficienza Investimenti = Investimenti / Patrimonio Totale
```

---

## 🔒 Privacy e Sicurezza

> **100% Privacy-Friendly**: Tutto nel tuo browser, zero server esterni.

- ✅ **Elaborazione Locale**: Nessuna connessione esterna
- ✅ **Zero Tracking**: Nessun analytics o raccolta dati  
- ✅ **Input Sanitization**: Protezione XSS e injection
- ✅ **Type Safety**: TypeScript per robustezza
- ✅ **Open Source**: Codice trasparente su GitHub
- ✅ **Uso Offline**: Scaricabile per uso locale

---

## 🚀 Come Iniziare

### **Demo Online**
👉 **[Prova MangoMoney](https://stinocon.github.io/MangoMoney/)** direttamente nel browser!

### **Workflow Consigliato**
1. **Configura**: Valuta, lingua, spese mensili e impostazioni fiscali
2. **Liquidità**: Aggiungi conti bancari e designa il fondo emergenza  
3. **Posizioni Globali**: Inserisci i valori totali presso broker/banche
4. **Asset Individuali**: Aggiungi singoli titoli con dettagli
5. **Collegamenti**: Collega titoli individuali alle posizioni globali
6. **Transazioni**: Registra acquisti/vendite per performance precise
7. **Analizza**: Esplora statistiche, score di rischio e SWR
8. **Backup**: Esporta regolarmente con JSON completo

### **Utilizzo Locale (Raccomandato)**
1. Scarica i file da GitHub  
2. Apri `index.html` nel browser  
3. Goditi l'app offline, al sicuro sul tuo PC

---

## 📊 Sezioni Principali

| Sezione | Descrizione |
|---------|-------------|
| **🏠 Panoramica** | Dashboard completa con totali, grafici interattivi e Safe Withdrawal Rate |
| **📈 Statistiche** | Score di rischio, salute finanziaria, metriche avanzate con basi teoriche |
| **💰 Liquidità** | Conti bancari per tipo, configurazione fondo emergenza e autonomia |
| **📊 Investimenti** | Posizioni globali/individuali, transazioni filtrate, reconciliation |
| **🏠 Immobili** | Residenza principale e proprietà secondarie con indirizzi |
| **🏦 Altri Asset** | Debiti, fondi pensione, crypto, asset alternativi categorizzati |
| **⚙️ Impostazioni** | Valuta, imposte, soglie emergenza, configurazioni avanzate |
| **ℹ️ Info** | Guida utilizzo, metodologie, privacy, supporto progetto |

---

## ⚠️ Dati e Privacy

**I tuoi dati sono salvati SOLO nel browser** (localStorage).

**✅ Restano quando:** chiudi browser, riavvii PC, navighi altrove  
**❌ Si perdono quando:** svuoti cache, modalità incognito, cambi browser

💡 **Consiglio**: Fai backup regolari con l'export JSON completo!

---

## 🛠️ Tecnologie

**Stack**: React 18 + TypeScript + Tailwind CSS + Recharts + Lucide Icons  
**Performance**: useMemo, useCallback, debouncing, lazy loading  
**Hosting**: GitHub Pages (demo) + Download locale (privacy massima)  
**Compatibility**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 📚 Basi Teoriche

**Score di Rischio**: Modern Portfolio Theory (Markowitz, 1952)  
**Performance**: Capital Asset Pricing Model (Sharpe, 1964)  
**SWR**: Trinity Study su prelievi sostenibili  
**Diversificazione**: Principi Bogle su allocazione asset  
**Emergency Fund**: Best practices Financial Planning (Merton)

---

## ⚠️ Limitazioni e Disclaimer

### **Limitazioni Tecniche**
- 📊 Prezzi non aggiornati automaticamente (inserimento manuale)
- 🌐 Nessuna connessione API di mercato (privacy > convenienza)
- 📱 Funzionalità limitate in modalità incognito
- 🧮 Calcoli indicativi, non sostituiscono consulenza professionale

### **Disclaimer Finanziario**
**MangoMoney è a scopo educativo e informativo. Non garantisco accuratezza dei dati e non fornisco consigli di investimento. Le performance passate non garantiscono risultati futuri. Uso a vostro rischio e responsabilità.**

---

## 💖 Supporta il Progetto

Se MangoMoney ti è utile, offrimi un caffè ☕ (o una birra 🍺):

[![PayPal](https://img.shields.io/badge/PayPal-Dona-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/stefanoconter)

Ogni contributo aiuta a mantenere il progetto gratuito e open source! 🙏

---

## 📈 Roadmap Future - Senza alcuna garanzia di implementazione

- [ ] **API Integration**: Prezzi automatici (opzionale)
- [ ] **Advanced Charts**: Grafici storici performance
- [ ] **Goal Tracking**: Obiettivi finanziari e FIRE calculator
- [ ] **Tax Optimization**: Calcoli fiscali avanzati
- [ ] **Mobile App**: PWA installabile
- [ ] **Data Sync**: Backup cloud opzionale

---

<div align="center">

**Creato con ❤️, IA e tanta pazienza**

*"Mangano i money, ma almeno sappiamo quanti"*

**⭐ Lascia una stella su GitHub se ti piace!**

---

### 🔗 Collegamenti Utili

[📚 AwesomeFinanceITA](https://github.com/Stinocon/AwesomeFinanceITA) • [💼 LinkedIn](https://www.linkedin.com/in/stefanoconter/) • [🐙 GitHub](https://github.com/Stinocon)

</div>