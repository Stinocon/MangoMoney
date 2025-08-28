# 🇮🇹 Guida Fiscale Italia - MangoMoney

**Configurazione automatica per il sistema fiscale italiano.**

---

## 🧾 Plusvalenze

### **Aliquote Standard**
- **Azione, ETF, Fondi**: **26%**
- **Obbligazioni whitelist**: **12.5%**
- **Crypto**: **26%** (dal 2023)

### **Calcolo Automatico**
```
Plusvalenza = (Valore Vendita - Valore Acquisto) × Aliquota
```

### **Esempio Pratico**
- **Acquisto ETF**: €10,000
- **Vendita ETF**: €12,000
- **Plusvalenza**: €2,000
- **Tasse**: €2,000 × 26% = **€520**

### **Configurazione in MangoMoney**
1. Vai in **Impostazioni** → **Tasse**
2. **Capital Gains**: 26% (preimpostato)
3. **Whitelist Bonds**: 12.5% (preimpostato)

---

## 🏦 Bollo Titoli

### **Soglie e Aliquote**
- **Soglia**: €5,000 per conto
- **Aliquota**: 0.2% annuo
- **Calcolo**: Saldo × 0.002

### **Esempio**
- **Saldo conto**: €20,000
- **Bollo titoli**: €20,000 × 0.002 = **€40 annui**

### **Quando si Paga**
- **Conti titoli**: Sempre se > €5,000
- **Conti correnti**: Solo se > €5,000
- **Scadenza**: 30 giugno anno successivo

---

## 📊 Regimi Fiscali

### **Regime Amministrato**
- **Gestione**: Banca/Intermediario
- **Calcolo tasse**: Automatico
- **Dichiarazione**: Non necessaria
- **Vantaggi**: Semplicità
- **Svantaggi**: Meno controllo

### **Regime Dichiarativo**
- **Gestione**: Tu stesso
- **Calcolo tasse**: Manuale
- **Dichiarazione**: Obbligatoria
- **Vantaggi**: Controllo totale
- **Svantaggi**: Complessità

### **Configurazione in App**
- **Impostazioni** → **Tasse** → **Regime**
- Seleziona il tuo regime
- L'app calcola automaticamente

---

## 📅 Timing Fiscale

### **Anno Fiscale**
- **Periodo**: 1 gennaio - 31 dicembre
- **Dichiarazione**: Entro 30 giugno
- **Pagamento**: Entro 30 giugno

### **Tax Harvesting**
- **Vendita perdite**: Entro 31 dicembre
- **Compensazione**: Con plusvalenze
- **Limite**: €500,000 annui

### **Promemoria in App**
- **Alert**: Scadenze fiscali
- **Simulazioni**: Impatto vendite
- **Report**: Per commercialista

---

## 🏠 Immobili

### **Plusvalenze Immobiliari**
- **Aliquota**: 26% (dal 2023)
- **Detrazione**: Costi di acquisto/vendita
- **Esenzione**: Casa principale (5+ anni)

### **Rendite Catastali**
- **Calcolo**: Automatico in app
- **Tassazione**: IRPEF ordinaria
- **Dichiarazione**: Quadro RW

### **Configurazione**
- **Tipo immobile**: Casa, affitto, investimento
- **Anno acquisto**: Per calcolo plusvalenza
- **Costi**: Spese notarili, agenzia

---

## 💰 Fondi Pensione

### **Tassazione**
- **Contributi**: Deducibili fino a €5,164
- **Rendimenti**: Tassazione differita
- **Riscatto**: 15% o 23% (età dipendente)

### **Configurazione in App**
- **Tipo**: Fondo pensione
- **Contributi**: Annuali
- **Rendimenti**: Automatici

---

## 📋 Report per Commercialista

### **Export Automatico**
- **Formato**: PDF, CSV, JSON
- **Contenuto**: Tutti i calcoli fiscali
- **Periodo**: Anno fiscale completo

### **Informazioni Incluse**
- **Plusvalenze**: Per asset e periodo
- **Bollo titoli**: Per conto
- **Simulazioni**: Impatto vendite
- **Dettagli**: Transazioni complete

### **Come Esportare**
1. **Menu** → **Export**
2. **Seleziona**: Report fiscale
3. **Periodo**: Anno fiscale
4. **Formato**: PDF per commercialista

---

## ⚠️ Limitazioni e Disclaimer

### **Cosa NON Include**
- **Dichiarazione automatica**: Devi farla tu
- **Calcoli complessi**: Regimi speciali
- **Aggiornamenti norme**: Controlla sempre

### **Responsabilità**
- **Verifica**: Sempre i calcoli
- **Commercialista**: Consulta per dubbi
- **Norme**: Aggiornamenti fiscali

### **Disclaimer Legale**
MangoMoney fornisce calcoli indicativi. Per decisioni fiscali consulta sempre un commercialista qualificato.

---

## 🆘 Problemi Comuni

### **Calcoli Sbagliati**
1. **Verifica input**: Date e valori corretti
2. **Controlla regime**: Amministrato vs dichiarativo
3. **Aggiorna aliquote**: Se cambiate

### **Export Non Funziona**
1. **Browser**: Prova Chrome/Firefox
2. **Dati**: Verifica che ci siano transazioni
3. **Periodo**: Seleziona anno fiscale corretto

### **Tasse Non Aggiornate**
1. **Impostazioni**: Controlla aliquote
2. **Regime**: Verifica configurazione
3. **Ricalcola**: Refresh app

---

## 📞 Supporto

### **Domande Fiscali**
- **Commercialista**: Per questioni specifiche
- **Agenzia Entrate**: Per norme ufficiali
- **GitHub**: [Discussions](https://github.com/Stinocon/MangoMoney/discussions)

### **Bug App**
- **GitHub Issues**: [Segnala problema](https://github.com/Stinocon/MangoMoney/issues)
- **GitHub**: [@Stinocon](https://github.com/Stinocon)

---

<div align="center">

**💡 Dubbio fiscale?** Consulta sempre un commercialista qualificato!

</div>
