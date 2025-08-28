# 🔒 Privacy Policy - MangoMoney

**Ultimo aggiornamento:** 28 Agosto 2025  
**Versione:** 4.0.0 

---

## 1. Chi siamo
MangoMoney è un'applicazione web di gestione portfolio sviluppata come progetto personale e open source. 

**Sviluppatore:** Stefano Conter 
**Sede:** Italia  

---

## 2. Dati che NON raccogliamo

### ✅ Nessun Tracking
- **No cookies** di profilazione
- **No analytics** comportamentali  
- **No social media tracking**
- **No fingerprinting** del dispositivo

### ✅ Nessuna Raccolta Server
- **No registrazione account** richiesta
- **No dati finanziari** inviati ai nostri server
- **No backup automatico** su cloud esterni
- **No condivisione** con terze parti

---

## 3. Dati che gestiamo localmente

### 🏠 Solo sul Tuo Dispositivo
I tuoi dati finanziari sono memorizzati esclusivamente nel localStorage del tuo browser:

```javascript
// Esempi di dati salvati localmente:
{
  "assets": {
    "investments": [...],     // I tuoi investimenti
    "realEstate": [...],      // I tuoi immobili  
    "cash": [...]            // I tuoi conti correnti
  },
  "settings": {
    "currency": "EUR",        // Valuta preferita
    "language": "it",         // Lingua interfaccia
    "taxRates": {...}        // Aliquote fiscali
  }
}
```

### 🔐 Controllo Completo
- **Tu possiedi** tutti i tuoi dati
- **Tu controlli** backup e export
- **Tu decidi** quando eliminare i dati
- **Nessuno** può accedere ai tuoi dati senza il tuo dispositivo

---

## 4. Sicurezza Dati

### 🛡️ Misure di Sicurezza
- **Crittografia localStorage:** Dati sensibili crittografati con AES-256
- **Input sanitization:** Prevenzione XSS e injection attacks  
- **No data transmission:** Dati mai inviati a server esterni

### 🚨 Cosa Fare in Caso di Problemi
Se sospetti compromissione dati:
1. Cancella dati browser (localStorage)
2. Aggiorna l'applicazione all'ultima versione
3. Ripristina da backup personale
4. Apri una issue

---

## 5. I Tuoi Diritti (GDPR)

### ✅ Diritto di Accesso
I tuoi dati sono sempre visibili nell'app. Per esportazione completa:
- Menu → Export → JSON completo

### ✅ Diritto di Portabilità  
Puoi esportare tutti i tuoi dati in formati standard:
- **JSON:** Backup completo strutturato
- **CSV:** Per Excel/Google Sheets
- **PDF:** Report per commercialista

### ✅ Diritto alla Cancellazione
Per eliminare tutti i tuoi dati:
- Menu → Impostazioni → Reset Completo
- Oppure cancella manualmente localStorage browser

### ✅ Diritto di Rettifica
Puoi modificare tutti i tuoi dati direttamente nell'applicazione.

---

## 6. Uso di Servizi Esterni

### 📊 Solo per Funzionalità Essenziali
- **GitHub Pages:** Hosting applicazione (no data collection)
- **CDN Fonts/Icons:** Caricamento risorse (no tracking)

### ❌ NON Utilizziamo
- Google Analytics
- Facebook Pixel  
- Cookie pubblicitari
- Servizi di profilazione

---

**💡 Promessa di Trasparenza**
Questo progetto è open source. Puoi verificare personalmente nel codice che non raccogliamo alcun dato: [Link al repository GitHub]

---

*Ultimo aggiornamento: 24 Agosto 2025*
