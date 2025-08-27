import React from 'react';
import { PlusCircle, FileText, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  section: string;
  onAddClick: () => void;
  darkMode?: boolean;
}

export const GuidedEmptyState: React.FC<EmptyStateProps> = ({ 
  section, onAddClick, darkMode 
}) => {
  const getEmptyStateConfig = (section: string) => {
    const configs: Record<string, any> = {
      cash: {
        icon: <PlusCircle size={48} />,
        title: "Inizia con la liquidità",
        description: "Aggiungi i tuoi conti bancari e la liquidità disponibile. È il primo passo per tracciare il tuo patrimonio.",
        suggestions: ["Conto corrente", "Conto deposito", "Contanti"],
        buttonText: "Aggiungi primo conto"
      },
      investments: {
        icon: <TrendingUp size={48} />,
        title: "Traccia i tuoi investimenti", 
        description: "Inserisci azioni, ETF e obbligazioni per monitorare performance e allocazione.",
        suggestions: ["ETF diversificati", "Azioni individuali", "Obbligazioni"],
        buttonText: "Aggiungi investimento"
      },
      realEstate: {
        icon: <FileText size={48} />,
        title: "Aggiungi i tuoi immobili",
        description: "Traccia il valore delle tue proprietà e calcola il patrimonio immobiliare.",
        suggestions: ["Casa principale", "Seconda casa", "Terreni"],
        buttonText: "Aggiungi immobile"
      },
      alternativeAssets: {
        icon: <TrendingUp size={48} />,
        title: "Beni alternativi",
        description: "Inserisci collezioni, oggetti di valore e altri asset non tradizionali.",
        suggestions: ["Oro", "Collezioni", "Criptovalute"],
        buttonText: "Aggiungi bene alternativo"
      },
      debts: {
        icon: <FileText size={48} />,
        title: "Traccia i tuoi debiti",
        description: "Inserisci mutui, prestiti e altri debiti per avere una visione completa del patrimonio netto.",
        suggestions: ["Mutuo casa", "Prestito auto", "Carte di credito"],
        buttonText: "Aggiungi debito"
      }
    };
    
    return configs[section] || configs.cash;
  };

  const config = getEmptyStateConfig(section);

  return (
    <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      <div className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
        {config.icon}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-sm mb-6 max-w-md mx-auto">{config.description}</p>
      
      <div className="mb-6">
        <div className="text-xs text-gray-500 mb-2">Esempi:</div>
        <div className="flex flex-wrap justify-center gap-2">
          {config.suggestions.map((suggestion: string, idx: number) => (
            <span 
              key={idx}
              className={`px-2 py-1 text-xs rounded-full ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>
      
      <button
        onClick={onAddClick}
        className="btn-primary btn-md touch-target"
      >
        {config.buttonText}
      </button>
    </div>
  );
};
