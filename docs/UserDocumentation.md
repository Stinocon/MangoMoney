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

### 🤖 **4. Smart Insights Realistici - Guida Completa**

#### **🎯 Filosofia: Solo Insights Verificabili**

MangoMoney calcola **esclusivamente** insights basati su dati disponibili e accurati. Non forniamo analisi fake o imprecise per "sembrare più smart".

#### **✅ Insights Implementati**

##### **🛡️ Fondo di Emergenza**
**Cosa controlla:** Mesi di spese mensili coperti da liquidità designata

**Soglie configurabili:**
- **Insufficiente:** < mesi adeguati (default: 3)
- **Adeguato:** tra mesi adeguati e ottimali (default: 3-6)  
- **Ottimale:** ≥ mesi ottimali (default: 6)
- **Sovradimensionato:** > 2× mesi ottimali (default: >12)

**Formula:** `Valore Fondo Designato ÷ Spese Mensili`

**Esempio:**
- Fondo designato: €15,000
- Spese mensili: €2,500  
- Risultato: 6 mesi = "Ottimale"

##### **💰 Safe Withdrawal Rate (SWR)**
**Cosa controlla:** Sostenibilità prelievi per indipendenza finanziaria

**Formula base:** `(Patrimonio Liquido × SWR%) ÷ 12`
**Aggiustamenti:**
- Inflazione > 2%: -30% dell'eccesso
- Range finale: 2.5% - 6.0%

**Soglie:**
- **Insufficiente:** < 80% copertura spese mensili
- **Quasi raggiunto:** 80-100% copertura
- **Indipendenza:** > 100% copertura

**Esempio:**
- Patrimonio liquido: €800,000
- SWR: 4% (€32,000/anno = €2,667/mese)
- Spese: €2,200/mese
- Risultato: 121% = "Indipendenza raggiunta"

##### **⚖️ Gestione Debiti** 
**Cosa controlla:** Rapporto debiti totali su patrimonio totale

**Formula:** `Debiti Totali ÷ Patrimonio Totale × 100`

**Soglie:**
- **Moderato:** < 30%
- **Elevato:** 30-50%  
- **Eccessivo:** > 50%
- **Critico:** > 70%

##### **📊 Maturità Portfolio**
**Cosa controlla:** Appropriatezza strategie in base alle dimensioni

**Soglie:**
- **Fase iniziale:** < €10,000 - Focus su risparmio costante
- **Crescita:** €10,000-100,000 - SWR prematuro  
- **Maturo:** > €100,000 - Strategie avanzate appropriate
- **High Net Worth:** > €1,000,000 - Consulenza professionale raccomandata

##### **🧾 Ottimizzazione Fiscale**
**Cosa controlla:** Opportunità timing fiscale e soglie normative

**Controlli:**
- Tax harvesting in dicembre se plusvalenze > €0
- Bollo titoli se liquidità > €5,000
- Timing vendite strategiche

#### **❌ Insights NON Implementati (e Perché)**

##### **Risk Score Dettagliato**  
**Motivo:** Richiede composizione specifica investimenti (ETF equity vs bond vs crypto)
**Impossibile perché:** App vede solo macro-categoria "Investimenti"
**Alternative:** Consulenza professionale con analisi portfolio dettagliata

##### **Diversificazione Precisa**
**Motivo:** Serve asset class specifiche, settori, geografie  
**Impossibile perché:** HHI su macro-categorie è misleading
**Alternative:** Analisi contenuto specifico investimenti

##### **Asset Allocation Advice**
**Motivo:** "Aumenta esposizione azionaria" senza sapere composizione attuale
**Impossibile perché:** Consigli specifici richiedono dati specifici  
**Alternative:** Consulente finanziario qualificato

#### **⚙️ Personalizzazione**
Tutti gli insights utilizzano **parametri configurabili** nelle Impostazioni:
- Soglie emergency fund (adeguato/ottimale mesi)
- Tasso SWR base e inflazione
- Abilitazione/disabilitazione categorie insights

#### **🔬 Limitazioni e Disclaimer**
- Insights basati su **dati inseriti manualmente** 
- **Non sostituiscono consulenza finanziaria** professionale
- Accurati per **macro-allocazione**, limitati per analisi dettagliate
- Per decisioni importanti consultare **esperti qualificati**



---

---

#### **❓ FAQ Smart Insights Realistici**

**Q: Perché non calcolate un risk score dettagliato?**
A: Per calcolare un risk score accurato servirebbero dati specifici sulla composizione dei tuoi investimenti (ETF equity vs bond vs crypto). L'app vede solo macro-categorie, quindi preferiamo non fornire analisi imprecise.

**Q: Gli insights sono consigli di investimento?**
A: **NO.** Gli insights sono suggerimenti basati sui tuoi dati, ma non sostituiscono la consulenza professionale. Le decisioni di investimento sono sempre tue.

**Q: Perché non ci sono consigli di asset allocation?**
A: Per dare consigli specifici servirebbero dati dettagliati sulla composizione attuale del tuo portfolio. Preferiamo rimandare a consulenti finanziari qualificati per analisi approfondite.

**Q: Quanto spesso si aggiornano gli insights?**
A: Gli insights si aggiornano automaticamente ogni volta che modifichi i tuoi dati nel portafoglio.

---

#### **⚠️ Disclaimer Insights Realistici**

**Solo insights verificabili:**
MangoMoney calcola esclusivamente insights basati su dati disponibili e accurati. Non forniamo analisi fake o imprecise.

**Non sostituiscono consulenza professionale:**
Gli insights sono strumenti informativi, non raccomandazioni di investimento. Consulta sempre un consulente finanziario per decisioni importanti.

**Privacy prima di tutto:**
Preferiamo dire "non lo sappiamo" piuttosto che fornire analisi imprecise con i tuoi dati.

**Per analisi avanzate:**
Per analisi portfolio dettagliate, risk score specifici e consigli di asset allocation, consulta un consulente finanziario qualificato.

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
