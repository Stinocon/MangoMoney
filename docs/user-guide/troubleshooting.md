# 🆘 Troubleshooting - MangoMoney

**Risoluzione problemi comuni e FAQ.**

---

## 🚨 Problemi Critici

### **App Non Si Carica**
**Sintomi**: Pagina bianca, errore JavaScript, app non risponde

**Soluzioni**:
1. **Browser diverso**: Prova Chrome, Firefox, Safari
2. **Cache pulita**: Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)
3. **Modalità incognito**: Testa senza estensioni
4. **JavaScript**: Verifica che sia abilitato

**Se non funziona**:
- [GitHub Issues](https://github.com/Stinocon/MangoMoney/issues)
- Includi: Browser, versione, screenshot errore

---

### **Dati Persi**
**Sintomi**: Asset scomparsi, calcoli azzerati, app vuota

**Soluzioni**:
1. **Backup automatici**: Controlla localStorage
2. **Refresh pagina**: Spesso risolve problemi temporanei
3. **Browser diverso**: Prova su altro dispositivo
4. **Export recente**: Ripristina da backup

**Prevenzione**:
- Export regolari in JSON
- Backup automatici ogni 5 minuti
- Non cancellare cache browser

---

### **Calcoli Sbagliati**
**Sintomi**: Numeri strani, percentuali impossibili, errori matematici

**Soluzioni**:
1. **Verifica input**: Controlla date e valori inseriti
2. **Impostazioni**: Verifica aliquote fiscali
3. **Refresh**: Ricarica app per ricalcoli
4. **Export/Import**: Reset dati se necessario

**Controlli**:
- Date in formato corretto (DD/MM/YYYY)
- Valori numerici senza simboli
- Aliquote fiscali aggiornate

---

## ⚙️ Problemi Import/Export

### **Import CSV Non Funziona**
**Sintomi**: File non caricato, errori parsing, dati mancanti

**Soluzioni**:
1. **Formato file**: Verifica che sia CSV
2. **Template**: Usa template dall'app
3. **Encoding**: File in UTF-8
4. **Colonne**: Verifica intestazioni

**Template corretto**:
```csv
Nome,Quantità,Prezzo Medio,Data Acquisto,Descrizione
ETF MSCI World,100,45.50,01/01/2023,Investimento principale
```

---

### **Export Non Si Scarica**
**Sintomi**: Nessun download, errore browser, file vuoto

**Soluzioni**:
1. **Popup blocker**: Disabilita temporaneamente
2. **Browser diverso**: Prova Chrome/Firefox
3. **Formato diverso**: Prova JSON invece di CSV
4. **Dati**: Verifica che ci siano dati da esportare

**Alternative**:
- Copy/paste dati manualmente
- Screenshot delle sezioni
- Backup automatico in localStorage

---

## 📊 Problemi Calcoli

### **CAGR Strano**
**Sintomi**: Percentuali negative, valori impossibili

**Cause comuni**:
- **Date sbagliate**: Verifica anno acquisto/vendita
- **Valori negativi**: Controlla prezzi inseriti
- **Periodo troppo breve**: CAGR ha senso su 1+ anni

**Verifica**:
- Prezzo acquisto < Prezzo vendita
- Date in ordine cronologico
- Periodo minimo 1 anno

---

### **SWR Non Appare**
**Sintomi**: Sezione SWR vuota, calcoli mancanti

**Cause**:
- **Patrimonio insufficiente**: Minimo €10,000
- **Dati mancanti**: Inserisci spese mensili
- **Configurazione**: Verifica impostazioni

**Soluzioni**:
1. Aggiungi più asset
2. Configura spese mensili
3. Verifica impostazioni SWR

---

### **Risk Score Zero**
**Sintomi**: Risk Score sempre 0, nessuna valutazione

**Cause**:
- **Solo contanti**: Risk Score = 1 (molto basso)
- **Dati mancanti**: Asset non categorizzati
- **Configurazione**: Verifica categorie asset

**Soluzioni**:
1. Aggiungi investimenti
2. Categorizza asset correttamente
3. Verifica configurazione risk score

---

## 🛡️ Problemi Privacy/Sicurezza

### **Backup Non Funzionano**
**Sintomi**: Nessun backup automatico, dati persi

**Soluzioni**:
1. **localStorage**: Verifica spazio disponibile
2. **Browser**: Prova browser diverso
3. **Estensioni**: Disabilita ad blocker
4. **Manuale**: Export regolari

**Verifica backup**:
- Menu → Impostazioni → Backup
- Controlla ultimo backup
- Verifica dimensione file

---

### **Crittografia Errori**
**Sintomi**: Dati non crittografati, errori sicurezza

**Soluzioni**:
1. **Browser aggiornato**: Usa versione recente
2. **HTTPS**: Verifica connessione sicura
3. **Estensioni**: Disabilita temporaneamente
4. **Reset**: Cancella e ricrea dati

---

## 🌐 Problemi Internazionali

### **Valute Non Convertite**
**Sintomi**: Valute miste, conversioni sbagliate

**Soluzioni**:
1. **Configurazione**: Imposta valuta principale
2. **Tassi**: Verifica tassi di cambio
3. **Omogeneità**: Usa stessa valuta per asset simili

**Valute supportate**:
- EUR (default)
- USD, GBP, CHF, JPY

---

### **Tasse Sbagliate**
**Sintomi**: Aliquote non corrette, calcoli fiscali errati

**Soluzioni**:
1. **Impostazioni**: Verifica aliquote nazionali
2. **Regime**: Controlla regime fiscale
3. **Aggiornamenti**: Verifica norme fiscali

---

## 📱 Problemi Mobile

### **App Lenta su Mobile**
**Sintomi**: Caricamento lento, lag, crash

**Soluzioni**:
1. **Browser**: Usa Chrome mobile
2. **Dati**: Riduci numero asset
3. **Cache**: Pulisci cache browser
4. **Connessione**: Verifica WiFi/4G

---

### **Touch Non Funziona**
**Sintomi**: Click non registrati, scroll bloccato

**Soluzioni**:
1. **Zoom**: Reset zoom browser
2. **Orientamento**: Prova landscape/portrait
3. **Browser**: Prova Safari/Chrome
4. **Dispositivo**: Testa su altro device

---

## 🔧 Problemi Avanzati

### **Performance Lenta**
**Sintomi**: App lenta, calcoli che impiegano tempo

**Cause**:
- **Troppi asset**: Riduci numero elementi
- **Browser vecchio**: Aggiorna browser
- **Dispositivo**: Prova su PC più potente

**Ottimizzazioni**:
- Raggruppa asset simili
- Usa import CSV per grandi dataset
- Chiudi altre tab browser

---

### **Errori JavaScript**
**Sintomi**: Errori console, funzionalità rotte

**Soluzioni**:
1. **Console**: Apri DevTools (F12)
2. **Errori**: Copia messaggi errore
3. **Report**: Invia su GitHub Issues
4. **Reset**: Cancella localStorage

---

## 📞 Supporto Tecnico

### **Quando Contattare**
- **Bug confermato**: Dopo aver provato soluzioni
- **Dati persi**: Se backup non funzionano
- **Calcoli errati**: Se verifiche non risolvono

### **Come Reportare**
1. **GitHub Issues**: [Crea issue](https://github.com/Stinocon/MangoMoney/issues)
2. **Includi**:
   - Browser e versione
   - Screenshot errore
   - Passi per riprodurre
   - Console errori (se disponibile)

### **Alternative**
- **GitHub Discussions**: [Domande generali](https://github.com/Stinocon/MangoMoney/discussions)
- **GitHub**: [@Stinocon](https://github.com/Stinocon)

---

## ✅ Checklist Prevenzione

### **Ogni Sessione**
- [ ] Export dati prima di chiudere
- [ ] Verifica backup automatici
- [ ] Controlla calcoli principali

### **Settimanale**
- [ ] Backup completo in JSON
- [ ] Verifica impostazioni
- [ ] Controlla aggiornamenti app

### **Mensile**
- [ ] Review asset e transazioni
- [ ] Verifica calcoli fiscali
- [ ] Update configurazione se necessario

---

<div align="center">

**💡 Problema non risolto?** Apri una [issue](https://github.com/Stinocon/MangoMoney/issues) su GitHub!

</div>
