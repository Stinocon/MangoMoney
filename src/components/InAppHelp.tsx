/**
 * In-App Help System for MangoMoney
 * 
 * @description
 * Interactive help system with contextual tooltips and explanations
 * for financial terms and features.
 * 
 * @version 3.2.0
 * @accessibility WCAG 2.1 AA compliant
 */

import React, { useState } from 'react';
import { Tooltip as AccessibleTooltip, Button, Modal } from './AccessibleComponents';

// ===== HELP DATABASE =====
interface HelpContent {
  definition: string;
  example: string;
  formula?: string;
  methodology?: string;
  calculation?: string;
  rebalancing?: string;
  interpretation: string;
  warnings: string;
  relatedTerms?: string[];
}

const HELP_DATABASE: Record<string, HelpContent> = {
  'cagr': {
    definition: 'Il CAGR (Compound Annual Growth Rate) misura il rendimento annualizzato di un investimento.',
    example: 'Se investi €1,000 e dopo 3 anni hai €1,331, il CAGR è 10% annuo.',
    formula: 'CAGR = ((Valore Finale / Valore Iniziale)^(1/anni)) - 1',
    interpretation: 'Un CAGR del 7-10% è considerato buono per investimenti a lungo termine.',
    warnings: 'Il CAGR è una media: i rendimenti annuali reali varieranno.',
    relatedTerms: ['swr', 'risk-score', 'performance']
  },
  
  'swr': {
    definition: 'Il Safe Withdrawal Rate indica quanto puoi prelevare annualmente dal tuo portfolio senza esaurirlo.',
    example: 'Con €500,000 e SWR del 4%, puoi prelevare €20,000/anno (€1,667/mese).',
    methodology: 'Basato sul Trinity Study: analisi storica di 30 anni di prelievi.',
    interpretation: 'Per l\'Italia consideriamo inflazione e tasse locali.',
    warnings: 'SWR non garantisce successo futuro, è una stima statistica.',
    relatedTerms: ['cagr', 'emergency-fund', 'retirement']
  },
  
  'risk-score': {
    definition: 'Il Risk Score (0-10) valuta la volatilità del tuo portfolio.',
    example: 'Portfolio 60% azioni, 30% obbligazioni, 10% liquidità = Risk Score 6.5.',
    calculation: 'Basato su Modern Portfolio Theory con correlazioni storiche asset.',
    interpretation: '0-3: Conservativo, 4-6: Moderato, 7-10: Aggressivo',
    rebalancing: 'Score >8 suggerisce di aggiungere asset meno volatili.',
    warnings: 'Alto rischio = alte potenziali perdite, non solo guadagni.',
    relatedTerms: ['diversification', 'asset-allocation', 'volatility']
  },
  
  'emergency-fund': {
    definition: 'Il fondo di emergenza copre spese impreviste senza vendere investimenti.',
    example: 'Se spendi €2,000/mese, un fondo di €12,000 copre 6 mesi.',
    interpretation: '3-6 mesi di spese è lo standard consigliato.',
    warnings: 'Usa conti liquidi e facilmente accessibili.',
    relatedTerms: ['liquidity', 'cash', 'risk-management']
  },
  
  'diversification': {
    definition: 'Distribuire investimenti tra diverse categorie per ridurre il rischio.',
    example: 'Portfolio diversificato: 60% azioni, 30% obbligazioni, 10% liquidità.',
    interpretation: 'Più diversificato = meno rischio di perdite concentrate.',
    warnings: 'Troppa diversificazione può ridurre i rendimenti.',
    relatedTerms: ['asset-allocation', 'risk-score', 'correlation']
  },
  
  'cost-basis': {
    definition: 'Il prezzo di acquisto originale di un asset per calcoli fiscali.',
    example: 'Comprato VWCE a €80, venduto a €100. Cost basis = €80.',
    methodology: 'FIFO, LIFO, o Average Cost per determinare quale lotto vendere.',
    interpretation: 'Importante per calcolare plusvalenze/minusvalenze.',
    warnings: 'Mantieni traccia delle transazioni per calcoli accurati.',
    relatedTerms: ['capital-gains', 'fifo', 'lifo']
  },
  
  'fifo': {
    definition: 'First In, First Out: vendi prima gli asset acquistati per primi.',
    example: 'Comprato 100 azioni a €10, poi 100 a €15. Vendi 50: cost basis = €10.',
    interpretation: 'Spesso più conveniente fiscalmente in Italia.',
    warnings: 'Può risultare in plusvalenze maggiori.',
    relatedTerms: ['lifo', 'cost-basis', 'capital-gains']
  },
  
  'lifo': {
    definition: 'Last In, First Out: vendi prima gli asset acquistati per ultimi.',
    example: 'Comprato 100 azioni a €10, poi 100 a €15. Vendi 50: cost basis = €15.',
    interpretation: 'Può ridurre le plusvalenze tassabili.',
    warnings: 'Verifica la conformità con le normative locali.',
    relatedTerms: ['fifo', 'cost-basis', 'capital-gains']
  },
  
  'capital-gains': {
    definition: 'Plusvalenze/minusvalenze realizzate vendendo asset.',
    example: 'Comprato a €1,000, venduto a €1,200. Capital gain = €200.',
    methodology: 'Tassate al 26% in Italia (12.5% per obbligazioni whitelist).',
    interpretation: 'Solo realizzate quando vendi, non quando salgono di valore.',
    warnings: 'Considera l\'impatto fiscale nelle decisioni di vendita.',
    relatedTerms: ['cost-basis', 'taxes', 'fifo', 'lifo']
  },
  
  'asset-allocation': {
    definition: 'Distribuzione percentuale del portfolio tra diverse categorie di asset.',
    example: '60% azioni, 30% obbligazioni, 10% liquidità.',
    interpretation: 'Determina il rischio e rendimento atteso del portfolio.',
    warnings: 'Ribilanciare periodicamente per mantenere l\'allocazione target.',
    relatedTerms: ['diversification', 'risk-score', 'rebalancing']
  },
  
  'rebalancing': {
    definition: 'Riportare il portfolio all\'allocazione target originale.',
    example: 'Target 60% azioni, ora 70%. Vendi azioni per tornare al 60%.',
    interpretation: 'Mantiene il rischio sotto controllo e può migliorare i rendimenti.',
    warnings: 'Considera i costi di transazione e impatti fiscali.',
    relatedTerms: ['asset-allocation', 'risk-management', 'diversification']
  }
};

// ===== CONTEXTUAL HELP COMPONENT =====
interface ContextualHelpProps {
  term: string;
  children: React.ReactNode;
  explanation?: string;
  learnMoreUrl?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  term,
  children,
  explanation,
  learnMoreUrl
}) => {
  const [showDetailedHelp, setShowDetailedHelp] = useState(false);
  const helpContent = HELP_DATABASE[term.toLowerCase()];

  if (!helpContent) {
    return <span>{children}</span>;
  }

  const tooltipContent = (
    <div className="help-tooltip-content">
      <div className="help-term-title">{term.toUpperCase()}</div>
      <div className="help-definition">{helpContent.definition}</div>
      <div className="help-example">
        <strong>Esempio:</strong> {helpContent.example}
      </div>
      {helpContent.warnings && (
        <div className="help-warning">
          <strong>⚠️ Attenzione:</strong> {helpContent.warnings}
        </div>
      )}
      <div className="help-actions">
        <button
          onClick={() => setShowDetailedHelp(true)}
          className="help-learn-more-btn"
        >
          📖 Scopri di più
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AccessibleTooltip
        content={tooltipContent}
        trigger="hover"
        placement="top"
      >
        <button 
          type="button"
          className="contextual-help-trigger"
          aria-label={`Spiegazione di ${term}`}
        >
          {children}
          <span className="help-icon" aria-hidden="true">ⓘ</span>
        </button>
      </AccessibleTooltip>

      {showDetailedHelp && (
        <DetailedHelpModal
          term={term}
          content={helpContent}
          onClose={() => setShowDetailedHelp(false)}
          learnMoreUrl={learnMoreUrl}
        />
      )}
    </>
  );
};

// ===== DETAILED HELP MODAL =====
interface DetailedHelpModalProps {
  term: string;
  content: HelpContent;
  onClose: () => void;
  learnMoreUrl?: string;
}

const DetailedHelpModal: React.FC<DetailedHelpModalProps> = ({
  term,
  content,
  onClose,
  learnMoreUrl
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`📚 ${term.toUpperCase()} - Guida Completa`}
      size="lg"
    >
      <div className="detailed-help-content">
        {/* Definition Section */}
        <section className="help-section">
          <h3>📖 Definizione</h3>
          <p>{content.definition}</p>
        </section>

        {/* Example Section */}
        <section className="help-section">
          <h3>💡 Esempio Pratico</h3>
          <div className="example-box">
            <p>{content.example}</p>
          </div>
        </section>

        {/* Formula Section */}
        {content.formula && (
          <section className="help-section">
            <h3>🧮 Formula</h3>
            <div className="formula-box">
              <code>{content.formula}</code>
            </div>
          </section>
        )}

        {/* Methodology Section */}
        {content.methodology && (
          <section className="help-section">
            <h3>🔬 Metodologia</h3>
            <p>{content.methodology}</p>
          </section>
        )}

        {/* Interpretation Section */}
        <section className="help-section">
          <h3>🎯 Come Interpretarlo</h3>
          <p>{content.interpretation}</p>
        </section>

        {/* Warnings Section */}
        <section className="help-section">
          <h3>⚠️ Limitazioni e Avvertimenti</h3>
          <div className="warning-box">
            <p>{content.warnings}</p>
          </div>
        </section>

        {/* Related Terms */}
        {content.relatedTerms && content.relatedTerms.length > 0 && (
          <section className="help-section">
            <h3>🔗 Termini Correlati</h3>
            <div className="related-terms">
              {content.relatedTerms.map(relatedTerm => (
                <ContextualHelp key={relatedTerm} term={relatedTerm}>
                  <span className="related-term-link">{relatedTerm}</span>
                </ContextualHelp>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="help-actions-section">
          <div className="help-actions-buttons">
            {learnMoreUrl && (
              <Button
                variant="primary"
                onClick={() => window.open(learnMoreUrl, '_blank')}
              >
                📖 Documentazione Completa
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => window.open('/docs/user-manual', '_blank')}
            >
              📚 Manuale Utente
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  );
};

// ===== QUICK HELP COMPONENT =====
interface QuickHelpProps {
  topic: 'getting-started' | 'portfolio' | 'calculations' | 'export' | 'security';
}

export const QuickHelp: React.FC<QuickHelpProps> = ({ topic }) => {
  const [showHelp, setShowHelp] = useState(false);

  const helpTopics = {
    'getting-started': {
      title: '🚀 Primi Passi',
      content: [
        '1. Clicca "Aggiungi Asset" per inserire il tuo primo investimento',
        '2. Compila i campi: nome, valore, categoria',
        '3. I calcoli si aggiornano automaticamente',
        '4. Usa i grafici per visualizzare la distribuzione',
        '5. Esporta i dati per backup'
      ]
    },
    'portfolio': {
      title: '📊 Gestione Portfolio',
      content: [
        '• Aggiorna regolarmente i valori degli asset',
        '• Monitora il Risk Score per il livello di rischio',
        '• Usa la diversificazione per ridurre il rischio',
        '• Considera il fondo di emergenza (3-6 mesi spese)',
        '• Rivedi l\'allocazione periodicamente'
      ]
    },
    'calculations': {
      title: '🧮 Calcoli Finanziari',
      content: [
        '• CAGR: rendimento annualizzato medio',
        '• SWR: quanto puoi prelevare mensilmente',
        '• Risk Score: volatilità del portfolio (0-10)',
        '• Tasse: calcoli automatici per l\'Italia',
        '• Cost Basis: FIFO/LIFO per vendite parziali'
      ]
    },
    'export': {
      title: '💾 Import/Export',
      content: [
        '• JSON: backup completo strutturato',
        '• CSV: per Excel/Google Sheets',
        '• PDF: report per commercialista',
        '• Import: da file CSV con validazione',
        '• Backup automatico in localStorage'
      ]
    },
    'security': {
      title: '🔒 Sicurezza',
      content: [
        '• Dati crittografati in localStorage',
        '• Nessun dato inviato ai nostri server',
        '• Controllo completo sui tuoi dati',
        '• Backup manuali quando vuoi',
        '• Eliminazione completa possibile'
      ]
    }
  };

  const topicData = helpTopics[topic];

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowHelp(true)}
        className="quick-help-trigger"
      >
        ❓ Aiuto Rapido
      </Button>

      {showHelp && (
        <Modal
          isOpen={true}
          onClose={() => setShowHelp(false)}
          title={topicData.title}
          size="md"
        >
          <div className="quick-help-content">
            <ul className="help-list">
              {topicData.content.map((item, index) => (
                <li key={index} className="help-list-item">
                  {item}
                </li>
              ))}
            </ul>
            
            <div className="help-footer">
              <Button
                variant="primary"
                onClick={() => window.open('/docs/user-manual', '_blank')}
              >
                📖 Manuale Completo
              </Button>
              <Button variant="secondary" onClick={() => setShowHelp(false)}>
                Chiudi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// ===== HELP SEARCH COMPONENT =====
export const HelpSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = Object.keys(HELP_DATABASE).filter(term =>
      term.toLowerCase().includes(query.toLowerCase()) ||
      HELP_DATABASE[term].definition.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results.slice(0, 5));
  };

  return (
    <div className="help-search-container">
      <input
        type="text"
        placeholder="Cerca aiuto..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="help-search-input"
      />
      
      {searchResults.length > 0 && (
        <div className="help-search-results">
          {searchResults.map(term => (
            <ContextualHelp key={term} term={term}>
              <div className="search-result-item">
                <strong>{term.toUpperCase()}</strong>
                <span className="search-result-definition">
                  {HELP_DATABASE[term].definition.substring(0, 100)}...
                </span>
              </div>
            </ContextualHelp>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== STYLES =====
const helpStyles = `
.contextual-help-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: var(--color-primary-600);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.contextual-help-trigger:hover {
  color: var(--color-primary-700);
}

.help-icon {
  font-size: 0.875rem;
  opacity: 0.7;
}

.help-tooltip-content {
  max-width: 300px;
  padding: 0.5rem;
}

.help-term-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-primary-600);
}

.help-definition {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.help-example {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-style: italic;
}

.help-warning {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-warning-600);
}

.help-actions {
  margin-top: 0.5rem;
}

.help-learn-more-btn {
  background: var(--color-primary-600);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.detailed-help-content {
  max-height: 70vh;
  overflow-y: auto;
}

.help-section {
  margin-bottom: 1.5rem;
}

.help-section h3 {
  color: var(--color-primary-600);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.example-box {
  background: var(--color-gray-50);
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid var(--color-primary-600);
}

.formula-box {
  background: var(--color-gray-900);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
}

.warning-box {
  background: var(--color-warning-50);
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid var(--color-warning-600);
}

.related-terms {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.related-term-link {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.help-actions-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
}

.help-actions-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-help-trigger {
  margin: 0.5rem 0;
}

.help-list {
  list-style: none;
  padding: 0;
}

.help-list-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.help-list-item:last-child {
  border-bottom: none;
}

.help-footer {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.help-search-container {
  position: relative;
  margin: 1rem 0;
}

.help-search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.help-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-gray-100);
  cursor: pointer;
}

.search-result-item:hover {
  background: var(--color-gray-50);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-definition {
  display: block;
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-top: 0.25rem;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = helpStyles;
  document.head.appendChild(styleElement);
}
