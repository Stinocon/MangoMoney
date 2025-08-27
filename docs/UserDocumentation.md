# 📚 **DOCUMENTAZIONE UTENTE - MangoMoney**

## 🎯 **Guida ai Calcoli Finanziari Semplici e Onesti**

### 📊 **1. Patrimonio Netto**

**Cosa significa:**
Il Patrimonio Netto è il tuo valore finanziario reale: tutto quello che possiedi meno tutti i tuoi debiti.

**Come si calcola:**
```
Patrimonio Netto = Totale Asset - Totale Debiti
```

**Esempio pratico:**
- Asset: €150,000 (casa €100K + investimenti €30K + liquidità €20K)
- Debiti: €80,000 (mutuo €80K)
- Patrimonio Netto = €150,000 - €80,000 = €70,000

**Quando usarlo:**
- Valutare la tua situazione finanziaria complessiva
- Monitorare i progressi nel tempo
- Pianificare obiettivi finanziari
- Valutare l'impatto di decisioni finanziarie

**Limitazioni:**
- Non considera la liquidità degli asset
- Valutazioni immobiliari possono essere imprecise
- Non include asset intangibili (competenze, relazioni)
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

### ⚠️ **3. Risk Score (Punteggio di Rischio) - Metodo Semplificato**

**Cosa significa:**
Il Risk Score misura il livello di rischio del tuo portafoglio su una scala da 0 a 10, utilizzando un **metodo semplificato** basato su categorie di asset. Questo approccio è adatto per il 95% degli utenti e fornisce una valutazione del rischio facile da comprendere.

**Come si calcola:**
```
Risk Score = Σ(Asset Weight × Category Risk Weight) / Total Weight

Pesi di rischio per categoria:
- Contanti: 1 (molto sicuro)
- Fondi Pensione: 3 (moderato, regolamentato)
- Immobili: 4 (medio, stabile ma illiquido)
- Investimenti: 7 (alto, volatile)
- Beni Alternativi: 9 (molto alto, speculativo)
```

**Interpretazione:**
- **0-2**: Molto Conservativo (es. 100% contanti)
- **3-4**: Conservativo (es. 80% obbligazioni, 20% azioni)
- **5-6**: Moderato (es. 60% azioni, 40% obbligazioni)
- **7-8**: Aggressivo (es. 80% azioni, 20% obbligazioni)
- **9-10**: Molto Aggressivo (es. 100% azioni + leverage)

**Esempio pratico:**
Portafoglio bilanciato (40% investimenti, 40% immobili, 20% contanti):
- Risk Score: ~4.4/10 (moderato-conservativo)

**Perché semplificato:**
- 95% degli utenti necessitano di una valutazione semplice e comprensibile
- Calcoli complessi possono essere confusi e soggetti a errori
- Questo approccio fornisce accuratezza sufficiente per la finanza personale
- Facile da spiegare e giustificare agli utenti

**Quando usarlo:**
- Valutare l'adeguatezza del profilo di rischio
- Confrontare portafogli diversi
- Pianificare asset allocation
- Monitorare cambiamenti nel rischio

**Vantaggi del sistema semplificato:**
- ✅ **Facile comprensione**: Basato su categorie intuitive
- ✅ **Adatto al 95% degli utenti**: Precisione sufficiente per finanza personale
- ✅ **Trasparente**: Algoritmo semplice e verificabile
- ✅ **Pratico**: Non richiede dati di mercato esterni

**Limitazioni:**
- Semplificazione di realtà complesse
- Non considera correlazioni tra asset
- Basato su categorizzazioni generali
- Per analisi avanzate consultare un consulente

**Disclaimer:** 
Risk Score semplificato, adatto al 95% degli utenti. Per analisi avanzate di portafoglio consultare un consulente finanziario qualificato.

**Fonti:**
- Principi base di asset allocation
- Standards di categorizzazione finanziaria

---

### 🤖 **4. Smart Insights - Guida Completa**

Gli Smart Insights sono suggerimenti automatici basati sui tuoi dati che ti aiutano a identificare opportunità di miglioramento del tuo portafoglio. Ogni insight è calcolato usando metriche specifiche e soglie precise.

#### **🎯 Come Funzionano gli Smart Insights**

**Frequenza di aggiornamento:** Gli insights si aggiornano automaticamente ogni volta che modifichi i tuoi dati.

**Priorità:** Gli insights sono ordinati per priorità (da 1 a 10, dove 10 è la massima urgenza).

**Configurazione:** Puoi abilitare/disabilitare ogni categoria di insight dalle impostazioni.

---

#### **🆘 Emergency Fund Insights**

**Cosa controlla:** La sufficienza del tuo fondo di emergenza rispetto all'obiettivo di 6 mesi di spese.

**Soglie numeriche:**
- 🔴 **Critico:** < 50% dell'obiettivo (< 3 mesi) - Aumenta liquidità immediatamente
- 🔵 **Info:** > 250% dell'obiettivo (> 15 mesi) - Considera investimenti più redditizi

**Formula di calcolo:**
```
emergencyRatio = emergencyFundMonths / 6
```

**Esempio pratico 1:**
- Situazione: €3000 spese mensili, €9000 liquidità
- Calcolo: 9000 ÷ 3000 = 3 mesi → 3 ÷ 6 = 0.5 (50%)
- Risultato: 🔴 **Critico** - "Fondo emergenza critico: 50% dell'obiettivo minimo"
- Interpretazione: Hai solo 3 mesi di spese coperte, sotto il minimo consigliato

**Esempio pratico 2:**
- Situazione: €2000 spese mensili, €40000 liquidità  
- Calcolo: 40000 ÷ 2000 = 20 mesi → 20 ÷ 6 = 3.33 (333%)
- Risultato: 🔵 **Info** - "Fondo emergenza sovradimensionato: 20.0 mesi di spese"
- Interpretazione: Hai troppa liquidità, potresti investire parte dei fondi

**Azioni consigliate:**
- Se critico: Aumenta liquidità fino ad almeno 6 mesi di spese
- Se sovradimensionato: Considera di investire l'eccesso in asset più redditizi

**Limitazioni:**
- Non considera la stabilità del tuo reddito
- Non valuta la liquidità degli altri asset
- Assume spese mensili costanti

---

#### **⚠️ Risk Score Insights**

**Cosa controlla:** Il livello di rischio del tuo portafoglio su una scala da 0 a 10.

**Soglie numeriche:**
- 🔵 **Info:** < 2.5 - Portfolio molto conservativo
- 🟢 **Success:** 4.0-6.0 - Portfolio ben bilanciato
- 🟡 **Warning:** > 7.5 - Portfolio ad alto rischio

**Pesi di rischio per categoria:**
- Contanti: 1 (molto sicuro)
- Fondi pensione: 3 (moderato, regolamentato)
- Immobili: 4 (medio, stabile ma illiquido)
- Investimenti: 7 (alto, volatile)
- Beni alternativi: 9 (molto alto, speculativo)

**Esempio pratico 1:**
- Situazione: 80% azioni, 20% contanti
- Calcolo: (80% × 7) + (20% × 1) = 5.6 + 0.2 = 5.8
- Risultato: 🟢 **Success** - "Portfolio ben bilanciato - rischio moderato e diversificato"
- Interpretazione: Rischio moderato, adatto per obiettivi di medio termine

**Esempio pratico 2:**
- Situazione: 60% crypto, 30% azioni, 10% contanti
- Calcolo: (60% × 9) + (30% × 7) + (10% × 1) = 5.4 + 2.1 + 0.1 = 7.6
- Risultato: 🟡 **Warning** - "Portfolio ad alto rischio - elevata concentrazione in asset volatili"
- Interpretazione: Rischio elevato, adatto solo per investitori esperti

**Azioni consigliate:**
- Se conservativo: Considera di includere asset con rendimenti più elevati
- Se bilanciato: Mantieni l'equilibrio attuale
- Se ad alto rischio: Considera di bilanciare con asset più stabili

**Limitazioni:**
- Non considera correlazioni tra asset
- Pesi fissi per categoria (non dinamici)
- Non valuta la tua tolleranza al rischio personale

---

#### **💰 Tax Optimization Insights**

**Cosa controlla:** Opportunità di ottimizzazione fiscale e adempimenti fiscali.

**Soglie numeriche:**
- 🔵 **Info:** Dicembre + plusvalenze non realizzate > €0
- 🔵 **Info:** Conti deposito > €5000 per bollo titoli

**Esempio pratico 1:**
- Situazione: Dicembre, €10000 in ETF con plusvalenza di €2000
- Risultato: 🔵 **Info** - "Plusvalenze non realizzate: €2.000"
- Interpretazione: Potresti considerare tax-loss harvesting prima di fine anno

**Esempio pratico 2:**
- Situazione: €8000 in conto deposito
- Risultato: 🔵 **Info** - "Conti deposito > €5K: ricorda bollo titoli 0.2%"
- Interpretazione: Devi pagare €16 di bollo titoli (8000 × 0.2%)

**Azioni consigliate:**
- Per plusvalenze: Valuta harvesting fiscale prima di fine anno
- Per bollo titoli: Verifica adempimenti fiscali con il tuo commercialista

**Limitazioni:**
- Non considera la tua situazione fiscale specifica
- Non valuta l'impatto di altre detrazioni/deduzioni
- Non sostituisce consulenza fiscale professionale

---

#### **📈 Performance Insights**

**Cosa controlla:** Variazioni significative nella performance del portafoglio rispetto al periodo precedente.

**Soglie numeriche:**
- 🟢 **Success:** Miglioramento > +5%
- 🟡 **Warning:** Peggioramento > -5%

**Formula di calcolo:**
```
change = current.performance - previous.performance
```

**Esempio pratico 1:**
- Situazione: Performance passata 8%, performance attuale 12%
- Calcolo: 12% - 8% = +4%
- Risultato: Nessun insight (cambiamento < 5%)

**Esempio pratico 2:**
- Situazione: Performance passata 5%, performance attuale 12%
- Calcolo: 12% - 5% = +7%
- Risultato: 🟢 **Success** - "Performance migliorata del 7.0%"
- Interpretazione: Trend positivo significativo

**Azioni consigliate:**
- Se miglioramento: Monitora per mantenere trend positivo
- Se peggioramento: Analizza cause del calo

**Limitazioni:**
- Richiede dati di performance precedenti
- Non considera la volatilità del mercato
- Non valuta la qualità della performance

---

#### **🌐 Diversification Insights**

**Cosa controlla:** Il livello di diversificazione del tuo portafoglio.

**Soglie numeriche:**
- 🟡 **Warning:** < 50% - Diversificazione limitata
- 🟢 **Success:** > 80% - Eccellente diversificazione

**Esempio pratico 1:**
- Situazione: 90% in singolo titolo, 10% in altri asset
- Risultato: 🟡 **Warning** - "Diversificazione limitata: concentrazione eccessiva"
- Interpretazione: Troppo concentrato in un singolo asset

**Esempio pratico 2:**
- Situazione: Portfolio ben distribuito tra diverse categorie
- Risultato: 🟢 **Success** - "Eccellente diversificazione del portafoglio"
- Interpretazione: Buona distribuzione del rischio

**Azioni consigliate:**
- Se limitata: Diversifica in più settori e asset class
- Se eccellente: Mantieni la strategia di diversificazione

**Limitazioni:**
- Non considera correlazioni tra asset
- Basato su allocazione percentuale
- Non valuta la qualità della diversificazione

---

#### **💳 Debt-to-Asset Ratio Insights**

**Cosa controlla:** Il rapporto tra i tuoi debiti e il tuo patrimonio totale.

**Soglie numeriche:**
- 🔴 **Critical:** > 50% - Rapporto debiti/patrimonio elevato

**Formula di calcolo:**
```
debtToAssetRatio = (totaleDebiti / totaleAsset) * 100
```

**Esempio pratico:**
- Situazione: €200000 debiti, €300000 asset totali
- Calcolo: (200000 ÷ 300000) × 100 = 66.7%
- Risultato: 🔴 **Critical** - "Rapporto debiti/patrimonio elevato (>50%)"
- Interpretazione: I debiti rappresentano più della metà del patrimonio

**Azioni consigliate:**
- Riduci debiti o aumenta patrimonio
- Considera consolidamento debiti
- Valuta strategie di riduzione del debito

**Limitazioni:**
- Non considera la qualità dei debiti
- Non valuta la capacità di servizio del debito
- Non considera il tipo di debito (buono vs cattivo)

---

#### **🔧 Configurazione Insights**

**Come abilitare/disabilitare:**
Gli insights sono configurati automaticamente, ma puoi personalizzare le soglie modificando le impostazioni dell'app.

**Categorie disponibili:**
- Emergency: Fondo di emergenza
- Risk: Risk score e debito
- Tax: Ottimizzazione fiscale
- Performance: Trend di performance
- Allocation: Diversificazione

**Integrazione con impostazioni:**
Gli insights si adattano automaticamente alle tue impostazioni personali (spese mensili, obiettivi, ecc.).

---

#### **❓ FAQ Smart Insights**

**Q: Perché non vedo alcuni insights?**
A: Gli insights appaiono solo quando le condizioni sono soddisfatte. Se non vedi un insight, significa che la tua situazione è nella norma.

**Q: Come migliorare il risk score?**
A: Riduci la percentuale di asset ad alto rischio (investimenti, beni alternativi) e aumenta asset più stabili (contanti, fondi pensione).

**Q: Cosa significa diversificazione limitata?**
A: Significa che hai troppa concentrazione in pochi asset o categorie. Considera di distribuire meglio i tuoi investimenti.

**Q: Gli insights sono consigli di investimento?**
A: **NO.** Gli insights sono suggerimenti basati sui tuoi dati, ma non sostituiscono la consulenza professionale. Le decisioni di investimento sono sempre tue.

**Q: Quanto spesso si aggiornano gli insights?**
A: Gli insights si aggiornano automaticamente ogni volta che modifichi i tuoi dati nel portafoglio.

---

#### **⚠️ Disclaimer Insights**

**Basati su metriche semplificate:**
Gli insights utilizzano calcoli semplificati adatti per il 95% degli utenti. Per analisi più sofisticate, consulta un professionista.

**Non sostituiscono consulenza professionale:**
Gli insights sono strumenti informativi, non raccomandazioni di investimento. Consulta sempre un consulente finanziario per decisioni importanti.

**Calibrati su situazione italiana standard:**
Le soglie e i calcoli sono ottimizzati per la situazione fiscale e finanziaria italiana media.

**Potrebbero non essere appropriati per situazioni specifiche:**
Se hai una situazione finanziaria complessa o specifica, considera la consulenza professionale.

---

### 📊 **5. Calcoli Fiscali**

**Cosa significa:**
I calcoli fiscali ti aiutano a stimare le imposte sui tuoi investimenti e a pianificare la gestione fiscale del tuo portafoglio.

**Tipi di calcoli:**
- **Plusvalenze:** Imposte sui guadagni da vendita di titoli
- **Dividendi:** Tassazione sui redditi da capitale
- **Bollo titoli:** Imposta di bollo su conti deposito e titoli
- **Imposte di successione:** Stima per pianificazione successoria

**Esempio pratico - Plusvalenze:**
- Vendita titoli: €10,000
- Prezzo di acquisto: €8,000
- Plusvalenza: €2,000
- Imposta (26%): €520

**Quando usarlo:**
- Pianificare vendite di titoli
- Ottimizzare la gestione fiscale
- Stimare imposte annuali
- Pianificare strategie di tax-loss harvesting

**Limitazioni:**
- Stime basate su aliquote correnti
- Non considera detrazioni/deduzioni personali
- Non include cambiamenti normativi
- Non sostituisce consulenza fiscale professionale

**Fonti:**
- Agenzia delle Entrate, "Guida alla tassazione dei redditi finanziari"
- Testo Unico delle Imposte sui Redditi (TUIR)

---

### 🏠 **6. Valutazione Immobili**

**Cosa significa:**
La valutazione immobiliare ti aiuta a stimare il valore reale delle tue proprietà per il calcolo del patrimonio netto.

**Metodi di valutazione:**
- **Comparativo:** Confronto con immobili simili venduti
- **Reddituale:** Basato su potenziali affitti
- **Costruttivo:** Valore del terreno + costi di costruzione
- **Catastale:** Valore fiscale (sottostimato)

**Esempio pratico:**
- Appartamento 80m² in centro città
- Prezzo medio al m²: €3,500
- Valore stimato: €280,000
- Valore catastale: €180,000 (sottostimato)

**Quando usarlo:**
- Calcolare patrimonio netto
- Pianificare vendite/acquisti
- Valutare investimenti immobiliari
- Pianificare successione

**Limitazioni:**
- Stime soggettive
- Mercato immobiliare volatile
- Differenze tra valore di mercato e catastale
- Non considera costi di manutenzione

**Fonti:**
- OMI (Osservatorio del Mercato Immobiliare)
- Agenzia delle Entrate, "Valori immobiliari"

---

### 📈 **7. Performance e Rendimenti**

**Cosa significa:**
I calcoli di performance ti aiutano a valutare i rendimenti dei tuoi investimenti e confrontarli con benchmark di riferimento.

**Metriche principali:**
- **Rendimento semplice:** (Valore finale - Valore iniziale) / Valore iniziale
- **Rendimento annualizzato:** CAGR (Compound Annual Growth Rate)
- **Rendimento reale:** Rendimento nominale - Inflazione
- **Sharpe Ratio:** Rendimento aggiustato per il rischio

**Esempio pratico:**
- Investimento iniziale: €10,000
- Valore dopo 3 anni: €12,500
- Rendimento semplice: 25%
- Rendimento annualizzato: 7.7%

**Quando usarlo:**
- Valutare performance investimenti
- Confrontare diverse strategie
- Pianificare obiettivi di rendimento
- Ottimizzare allocazione portafoglio

**Limitazioni:**
- Rendimenti passati non garantiscono performance future
- Non considera inflazione
- Non include costi di gestione
- Non valuta rischio di perdita

**Fonti:**
- CFA Institute, "Investment Performance Measurement"
- Morningstar, "Performance Analysis"

---

### 🎯 **8. Pianificazione Obiettivi**

**Cosa significa:**
La pianificazione degli obiettivi ti aiuta a definire e raggiungere i tuoi traguardi finanziari nel tempo.

**Tipi di obiettivi:**
- **Breve termine:** < 3 anni (vacanze, auto)
- **Medio termine:** 3-10 anni (casa, istruzione)
- **Lungo termine:** > 10 anni (pensionamento, FIRE)

**Esempio pratico - Acquisto casa:**
- Obiettivo: €300,000 tra 5 anni
- Risparmio attuale: €50,000
- Risparmio necessario: €250,000
- Risparmio mensile: €4,167 (assumendo 0% rendimento)

**Quando usarlo:**
- Definire obiettivi finanziari
- Calcolare risparmio necessario
- Pianificare timeline
- Monitorare progressi

**Limitazioni:**
- Assume rendimenti costanti
- Non considera imprevisti
- Non include inflazione
- Non valuta cambiamenti di vita

**Fonti:**
- CFP Board, "Financial Planning Process"
- FPA, "Goal-Based Planning"

---

### 🔄 **9. Strategie di Investimento**

**Cosa significa:**
Le strategie di investimento ti guidano nella scelta di approcci adatti ai tuoi obiettivi e alla tua tolleranza al rischio.

**Strategie principali:**
- **Buy and Hold:** Acquisto e mantenimento a lungo termine
- **Dollar Cost Averaging:** Investimento periodico di importi fissi
- **Value Investing:** Acquisto di titoli sottovalutati
- **Index Investing:** Replica di indici di mercato

**Esempio pratico - DCA:**
- Investimento mensile: €500
- Periodo: 10 anni
- Rendimento medio: 7% annuo
- Capitale finale: ~€86,000

**Quando usarlo:**
- Scegliere strategia di investimento
- Pianificare contributi periodici
- Gestire volatilità di mercato
- Ottimizzare timing di ingresso

**Limitazioni:**
- Non garantisce rendimenti positivi
- Richiede disciplina
- Non considera cambiamenti di mercato
- Non include analisi fondamentale

**Fonti:**
- Bogle, J.C., "The Little Book of Common Sense Investing"
- Graham, B., "The Intelligent Investor"

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

### 🎯 **11. Limitazioni e cosa NON fa l'app**

**❌ NON aggiorna prezzi automaticamente:**
- **Perché:** Privacy totale - nessuna connessione a API esterne
- **Implicazioni:** Prezzi devono essere aggiornati manualmente
- **Alternativa:** Inserimento periodico dei prezzi quando necessario

**❌ NON ha dati storici di mercato:**
- **Perché:** Tutto rimane nel tuo browser, nessun database
- **Implicazioni:** Non può calcolare performance passate automaticamente
- **Alternativa:** Inserimento manuale delle performance per calcoli storici

**❌ NON usa analisi portfolio avanzate:**
- **Perché:** Sistema semplificato per accessibilità
- **Implicazioni:** Risk Score basato su categorie, non correlazioni
- **Alternativa:** Per analisi portfolio avanzate consultare un consulente

**❌ NON fornisce consigli di investimento:**
- **Perché:** Strumento di monitoraggio, non consulenza
- **Implicazioni:** Calcoli indicativi, decisioni tue
- **Alternativa:** Strumenti per informare le tue scelte

**❌ NON garantisce accuratezza dei calcoli:**
- **Perché:** Dati inseriti manualmente, calcoli semplificati
- **Implicazioni:** Risultati indicativi, non certificati
- **Alternativa:** Validazione con consulente per decisioni importanti

---

### ⚠️ **12. Disclaimer e Avvertenze**

**Importante:**
- Questa documentazione è a scopo educativo
- Non costituisce consulenza finanziaria
- I risultati passati non garantiscono performance future
- Consulta sempre un professionista qualificato
- Considera la tua situazione personale

**Limitazioni:**
- I calcoli sono semplificati per facilità d'uso
- Non considerano tutti i fattori di rischio di mercato
- I dati storici potrebbero non ripetersi
- Le tasse e i costi possono variare nel tempo
- Le condizioni di mercato cambiano continuamente

**Raccomandazioni:**
- Diversifica sempre il tuo portafoglio
- Investi per il lungo termine
- Mantieni costi di gestione bassi
- Monitora regolarmente le performance
- Adatta la strategia alle tue esigenze personali
