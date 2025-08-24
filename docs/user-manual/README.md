# 📖 MangoMoney - Manuale Utente Completo

**Versione:** 3.2.0  
**Data:** 24 Agosto 2025  
**Lingua:** Italiano  

---

## 🚀 Guida Rapida (5 minuti)

### Primo Accesso
1. **Apri l'applicazione**: Vai su [GitHub](https://stinocon.github.io/MangoMoney/)
2. **Benvenuto**: L'app è completamente offline - i tuoi dati restano sul tuo dispositivo
3. **Primo asset**: Clicca "Aggiungi Asset" per iniziare

### Il Tuo Primo Portfolio
```javascript
// Esempio pratico: Portfolio bilanciato italiano
const portfolioEsempio = {
  liquidità: {
    contoCorrente: 10000,      // €10,000 BNL/Intesa
    contoDeposito: 15000       // €15,000 FCA Bank 3.5%
  },
  investimenti: {
    vwce: 30000,               // €30,000 VANGUARD FTSE All-World
    btps: 20000,               // €20,000 BTP Italia 2030
    etfEmergenti: 5000         // €5,000 ETF Mercati Emergenti
  },
  immobili: {
    casaPrincipale: 300000     // €300,000 Residenza principale Milano
  }
};

// Risultato automatico:
// - Patrimonio Netto: €380,000
// - Risk Score: 6.5/10 (moderato-aggressivo)
// - SWR: €1,267/mese (4% regola)
// - Fondo Emergenza: 8.3 mesi (ottimale)
```

---

## 📊 Capire i Tuoi Dati

### CAGR (Rendimento Annualizzato)
> **Cosa significa:** Quanto è cresciuto il tuo investimento "in media" ogni anno
> 
> **Esempio pratico:** Hai investito €10,000 e dopo 5 anni hai €15,000
> - CAGR = 8.45% annuo
> - Significa: "Come se avessi guadagnato 8.45% ogni anno per 5 anni"
>
> **⚠️ Importante:** È una media! Alcuni anni +20%, altri anni -10%
>
> **🎯 Benchmark Italia 2024:**
> - Azioni italiane (FTSE MIB): ~12% CAGR
> - BTP 10 anni: ~4% CAGR  
> - Conti deposito: ~3.5% CAGR

### SWR (Tasso Prelievo Sicuro)
> **Cosa significa:** Quanto puoi prelevare ogni anno senza finire mai i soldi
>
> **La Regola del 4%:** Da €1 milione puoi prelevare €40,000/anno (€3,333/mese) per 30+ anni
>
> **🧮 Come lo calcoliamo:**
> ```
> Portfolio: €500,000
> SWR 4%: €20,000/anno = €1,667/mese
> 
> Se le tue spese sono €2,000/mese:
> - Ti servono €600,000 per essere "finanziariamente libero"
> ```
>
> **⚠️ Adattamenti Italia:**
> - Inflazione più alta: SWR ridotto a 3.5%
> - Tasse capital gains 26%: SWR ridotto
> - Portfolio più prudente: SWR aumentato leggermente

### Risk Score (Punteggio Rischio)
> **Cosa significa:** Quanto è volatile il tuo portfolio (0-10)
>
> **Interpretazione:**
> - **0-3:** Conservativo (bassa volatilità)
> - **4-6:** Moderato (volatilità media)
> - **7-10:** Aggressivo (alta volatilità)
>
> **🎯 Target consigliato:** 5-7 per la maggior parte delle persone
>
> **⚠️ Attenzione:** Alto rischio = potenziali perdite maggiori, non solo guadagni

---

## 🔧 Funzionalità Avanzate

### Import/Export Portfolio
1. **Esporta i tuoi dati**:
   - Formato JSON (backup completo)
   - Formato CSV (per Excel/Google Sheets)
   - Formato PDF (per commercialista)

2. **Importa da Excel/CSV**:
   - Template scaricabile
   - Mappatura automatica colonne
   - Validazione dati

### Calcolo Tasse Automatico
> **🇮🇹 Specializzato per Italia:**
> - Capital Gains: 26% su plusvalenze
> - Obbligazioni whitelist: 12.5% 
> - Bollo conto corrente: €34.20 se giacenza >€5,000
> - Bollo conto deposito: 0.2% annuo

### Cost Basis FIFO/LIFO
> **Perché importante:** Per calcolare tasse su vendite parziali
>
> **FIFO (First In First Out):** Vendi prima quello che hai comprato per primo
> **LIFO (Last In First Out):** Vendi prima quello che hai comprato per ultimo
>
> **💡 Suggerimento Italia:** LIFO spesso più conveniente fiscalmente

---

## 🆘 Risoluzione Problemi

### Problemi Comuni

**❓ "Il mio CAGR è negativo, è normale?"**
- ✅ Sì, se hai perso soldi il CAGR sarà negativo
- ✅ Guarda il periodo: 1-2 anni possono essere volatili
- ⚠️ Se negativo per >5 anni, rivedi la strategia

**❓ "Il Risk Score è 9/10, devo preoccuparmi?"**
- ⚠️ Portfolio molto aggressivo
- 💡 Considera di aggiungere obbligazioni/liquidità
- 🎯 Target 5-7/10 per la maggior parte delle persone

**❓ "L'SWR dice €500/mese ma spendo €3,000"**
- 📊 Significa che non hai abbastanza capitale per sostenerti
- 🎯 Ti servono circa €900,000 per €3,000/mese
- 💡 Continua ad investire e/o riduci le spese

**❓ "Come aggiungere un nuovo asset?"**
- 📱 Clicca "Aggiungi Asset" in alto a destra
- 📝 Compila i campi richiesti (nome, valore, categoria)
- 💾 Clicca "Salva" - i dati si salvano automaticamente

**❓ "I miei dati sono sicuri?"**
- 🔒 Sì, tutto rimane sul tuo dispositivo
- 🚫 Nessun dato viene inviato ai nostri server
- 💾 Puoi fare backup manuali quando vuoi

---

## 📱 Guida Mobile

### Ottimizzazioni Mobile
- **Touch-friendly:** Tutti i bottoni sono grandi abbastanza per il touch
- **Responsive:** L'interfaccia si adatta automaticamente al tuo schermo
- **Offline:** Funziona senza connessione internet
- **Backup:** I tuoi dati sono sempre salvati localmente

### Suggerimenti Mobile
- **Orizzontale:** Ruota il telefono per vedere meglio le tabelle
- **Zoom:** Usa il pinch-to-zoom per i dettagli
- **Scrolling:** Scorri orizzontalmente nelle tabelle grandi

---

## 🔒 Sicurezza e Privacy

### I Tuoi Dati Sono Sicuri
- **Crittografia:** I dati sensibili sono crittografati
- **Locale:** Tutto rimane sul tuo dispositivo
- **Nessun tracking:** Non raccogliamo dati personali
- **Controllo completo:** Tu decidi quando eliminare i dati

### Backup e Ripristino
1. **Backup automatico:** I dati si salvano automaticamente
2. **Backup manuale:** Menu → Export → JSON
3. **Ripristino:** Menu → Import → Seleziona file JSON
4. **Reset completo:** Menu → Impostazioni → Reset Completo

---

## 🎯 Suggerimenti per l'Uso

### Best Practices
1. **Aggiorna regolarmente:** Inserisci i valori attuali ogni mese
2. **Diversifica:** Non concentrare tutto in un asset
3. **Monitora il rischio:** Mantieni il Risk Score sotto controllo
4. **Fondo emergenza:** Mantieni 3-6 mesi di spese in liquidità
5. **Consulenza:** Consulta un professionista per decisioni importanti

### Pianificazione Finanziaria
- **Obiettivi:** Definisci i tuoi obiettivi finanziari
- **Orizzonte:** Considera il tuo orizzonte temporale
- **Tolleranza rischio:** Sii onesto sulla tua tolleranza al rischio
- **Revisione:** Rivedi il portfolio periodicamente

---

## 📞 Supporto

### Come Ottenere Aiuto
- **📖 Documentazione:** Questa guida e le sezioni di aiuto in-app
- **🐛 Bug report:** GitHub Issues per problemi tecnici
- **💡 Suggerimenti:** GitHub Discussions per idee e feedback
- **📧 Email:** support@mangomoney.app per supporto diretto

### Community
- **GitHub:** [Repository ufficiale](https://github.com/Stinocon/MangoMoney)
- **Discussions:** Condividi esperienze con altri utenti
- **Contributi:** Aiuta a migliorare l'applicazione

---

## 📋 Changelog

### Versione 3.2.0 (23 Agosto 2025)
- ✅ **Nuovo:** Sistema di sicurezza avanzato con crittografia
- ✅ **Migliorato:** Accessibilità completa (WCAG 2.1 AA)
- ✅ **Nuovo:** Design system responsive mobile-first
- ✅ **Migliorato:** Calcoli finanziari più precisi
- ✅ **Nuovo:** Smart insights automatici
- ✅ **Migliorato:** Documentazione completa

### Versioni Precedenti
- **3.1.0:** Calcoli SWR avanzati e cost basis methods
- **3.0.0:** Riscrittura completa con React e TypeScript
- **2.0.0:** Aggiunta calcoli fiscali italiani
- **1.0.0:** Prima versione pubblica

---

## ⚖️ Disclaimer

**⚠️ IMPORTANTE:** MangoMoney è uno strumento di monitoraggio portfolio. Non fornisce consigli di investimento e non sostituisce la consulenza di un professionista qualificato. I calcoli sono indicativi e basati su dati storici. Consulta sempre un consulente finanziario per decisioni importanti.

**🔒 Privacy:** I tuoi dati rimangono sempre sul tuo dispositivo. Non raccogliamo o condividiamo alcuna informazione personale.

---

*Ultimo aggiornamento: 24 Agosto 2025*
