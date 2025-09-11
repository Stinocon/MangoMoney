/**
 * InfoSection - Redesigned Info Section for MangoMoney
 * 
 * @description
 * Modern, user-friendly info section with progressive disclosure
 * and action-oriented design with proper dark theme management
 * 
 * @version 4.0.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Calculator, 
  Globe, 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  Bug,
  Github,
  CheckCircle,
  ArrowRight,
  Coffee
} from 'lucide-react';

// ===== TYPES =====
interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  iconColor: string;
  darkMode: boolean; // Added darkMode prop
}

interface HeroSectionProps {
  darkMode: boolean;
}

interface InfoSectionProps {
  darkMode: boolean;
  onNavigateToSection: (section: string) => void;
  t: (key: any) => string;
}

// ===== COMPONENTS =====

// Hero Section with Gradient Background
const HeroSection: React.FC<HeroSectionProps> = ({ darkMode }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-8 border ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
        : 'bg-gradient-to-br from-blue-100 to-indigo-200 border-blue-300'
    }`}>
      {/* Background Pattern */}
      <div className={`absolute inset-0 opacity-10 ${
        darkMode ? 'bg-slate-600' : 'bg-blue-600'
      }`} style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Benvenuto in MangoMoney
            </h2>
            <p className={`text-base ${
              darkMode ? 'text-slate-400' : 'text-slate-700'
            }`}>
              Il tuo patrimonio, i tuoi dati, il tuo controllo
            </p>
          </div>
        </div>
        
        <div className={`prose prose-base ${
          darkMode ? 'text-slate-300' : 'text-slate-800'
        }`}>
          <p className="text-lg mb-6">MangoMoney è progettato per essere semplice e intuitivo. Inizia dalla sezione Liquidità per inserire i tuoi conti correnti e depositi, poi passa agli Investimenti per il tuo portafoglio.</p>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            <li className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-slate-800/50' : 'bg-white/50'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Inserisci i dati una volta sola</span>
            </li>
            <li className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-slate-800/50' : 'bg-white/50'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>L'app calcola tutto automaticamente</span>
            </li>
            <li className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-slate-800/50' : 'bg-white/50'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Esporta i dati quando vuoi</span>
            </li>
            <li className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-slate-800/50' : 'bg-white/50'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Backup automatico ogni 5 minuti</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Modern Card Design with proper theme management
const InfoCard: React.FC<InfoCardProps> = ({ 
  icon: Icon, 
  title, 
  children, 
  isExpanded, 
  onToggle, 
  iconColor,
  darkMode 
}) => {
  return (
    <div className={`group rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
      darkMode 
        ? 'border-slate-600 bg-slate-800' 
        : 'border-slate-300 bg-white'
    }`}>
      <button
        onClick={onToggle}
        className={`w-full p-6 flex items-center justify-between text-left transition-colors ${
          darkMode 
            ? 'hover:bg-slate-700/50' 
            : 'hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {title}
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Click per espandere
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`w-6 h-6 transition-transform duration-200 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          } ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isExpanded && (
        <div className={`px-6 pb-6 pt-0 border-t ${
          darkMode 
            ? 'border-slate-600 bg-slate-700/20' 
            : 'border-slate-200 bg-slate-100/50'
        }`}>
          <div className={`prose prose-base max-w-none pt-4 ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Info Section Component
export const InfoSection: React.FC<InfoSectionProps> = ({ 
  darkMode, 
  onNavigateToSection, 
  t 
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['quick-start']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navigateToAssets = () => {
    onNavigateToSection('assets');
  };

  // Visual Hierarchy with Colors - Fixed theme management
  const INFO_SECTIONS = [
    {
      id: 'quick-start',
      icon: BookOpen,
      title: 'Come Iniziare',
      iconColor: 'bg-blue-600',
      content: (
        <div className="space-y-6">
          <h4 className={`text-lg font-semibold ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>Setup in 3 step:</h4>
          <ol className="list-decimal list-inside space-y-4 text-base">
            <li className={`p-3 rounded-lg ${
              darkMode ? 'bg-slate-800' : 'bg-slate-50'
            }`}>
              Aggiungi il tuo primo conto corrente nella sezione <strong>Liquidità</strong>
            </li>
            <li className={`p-3 rounded-lg ${
              darkMode ? 'bg-slate-800' : 'bg-slate-50'
            }`}>
              Inserisci investimenti principali nella sezione <strong>Investimenti</strong>
            </li>  
            <li className={`p-3 rounded-lg ${
              darkMode ? 'bg-slate-800' : 'bg-slate-50'
            }`}>
              Configura le impostazioni fiscali per l'Italia (già preimpostate)
            </li>
          </ol>
          
          <div className={`p-4 rounded-xl border ${
            darkMode 
              ? 'bg-blue-900/30 border-blue-700' 
              : 'bg-blue-100 border-blue-300'
          }`}>
            <p className={`text-base ${
              darkMode ? 'text-blue-100' : 'text-blue-900'
            }`}>
              💡 <strong>Tip:</strong> Inizia sempre dalla liquidità, ti aiuta a capire come funziona l'app
            </p>
          </div>
        </div>
      )
    },
    
    {
      id: 'calculations',
      icon: Calculator,
      title: 'Calcoli e Metriche',
      iconColor: 'bg-green-600',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-green-900/30 border-green-700' 
                : 'bg-green-100 border-green-300'
            }`}>
              <h5 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-green-100' : 'text-green-900'
              }`}>CAGR (Rendimento Annualizzato)</h5>
              <p className={`text-base ${
                darkMode ? 'text-green-200' : 'text-green-800'
              }`}>
                Crescita annua composta dei tuoi investimenti. L&apos;app usa automaticamente 
                il metodo più appropriato: rendimento semplice per periodi molto brevi (&lt; 1 mese), 
                CAGR standard per periodi lunghi (&ge; 3 mesi).
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-green-900/30 border-green-700' 
                : 'bg-green-100 border-green-300'
            }`}>
              <h5 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-green-100' : 'text-green-900'
              }`}>SWR</h5>
              <p className={`text-base ${
                darkMode ? 'text-green-200' : 'text-green-800'
              }`}>Quanto puoi prelevare per il pensionamento</p>
            </div>
          </div>
          <p className={`text-base p-4 rounded-xl ${
            darkMode ? 'bg-slate-800' : 'bg-slate-100'
          }`}>Tutti i calcoli sono trasparenti e basati su formule finanziarie standard. Non facciamo "magia", solo matematica onesta.</p>
          
          <div className={`p-4 rounded-xl border mt-4 ${
            darkMode 
              ? 'bg-blue-900/30 border-blue-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm ${
              darkMode ? 'text-blue-100' : 'text-blue-900'
            }`}>
              <strong>📊 Metodologia Smart:</strong> L'app sceglie automaticamente il calcolo 
              più accurato in base alla durata dell'investimento. Per periodi molto brevi 
              evita l'annualizzazione che potrebbe essere fuorviante.
            </p>
          </div>
        </div>
      )
    },
    
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy e Sicurezza',
      iconColor: 'bg-orange-600',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-base">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                darkMode ? 'text-green-300' : 'text-green-700'
              }`} />
              <span className="font-medium">100% Offline</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                darkMode ? 'text-green-300' : 'text-green-700'
              }`} />
              <span className="font-medium">Zero Tracking</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                darkMode ? 'text-green-300' : 'text-green-700'
              }`} />
              <span className="font-medium">Open Source</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                darkMode ? 'text-green-300' : 'text-green-700'
              }`} />
              <span className="font-medium">Crittografia Locale</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${
            darkMode 
              ? 'bg-orange-900/30 border-orange-700' 
              : 'bg-orange-100 border-orange-300'
          }`}>
            <p className={`text-base font-medium ${
              darkMode ? 'text-orange-100' : 'text-orange-900'
            }`}>
              🔒 I tuoi dati finanziari restano SEMPRE nel tuo browser. Mai inviati a server esterni.
            </p>
          </div>
        </div>
      )
    },
    
    {
      id: 'international',
      icon: Globe,
      title: 'Configurazione Internazionale',
      iconColor: 'bg-purple-600',
      content: (
        <div className="space-y-6">
          <p className={`text-base p-4 rounded-xl ${
            darkMode ? 'bg-slate-800' : 'bg-slate-100'
          }`}>MangoMoney supporta utenti da tutto il mondo con valute e tasse configurabili.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-purple-900/30 border-purple-700' 
                : 'bg-purple-100 border-purple-300'
            }`}>
              <h4 className={`text-lg font-semibold mb-3 ${
                darkMode ? 'text-purple-100' : 'text-purple-900'
              }`}>Valute Supportate</h4>
              <ul className={`list-disc list-inside text-base space-y-2 ${
                darkMode ? 'text-purple-200' : 'text-purple-800'
              }`}>
                <li>EUR (Euro)</li>
                <li>USD (Dollaro USA)</li>
                <li>GBP (Sterlina)</li>
                <li>CHF (Franco Svizzero)</li>
                <li>JPY (Yen Giapponese)</li>
              </ul>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-purple-900/30 border-purple-700' 
                : 'bg-purple-100 border-purple-300'
            }`}>
              <h4 className={`text-lg font-semibold mb-3 ${
                darkMode ? 'text-purple-100' : 'text-purple-900'
              }`}>Tasse Configurabili</h4>
              <ul className={`list-disc list-inside text-base space-y-2 ${
                darkMode ? 'text-purple-200' : 'text-purple-800'
              }`}>
                <li>Aliquote personalizzabili</li>
                <li>Regimi fiscali diversi</li>
                <li>Calcoli automatici</li>
                <li>Report per commercialisti</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    
    {
      id: 'support',
      icon: HelpCircle,
      title: 'Supporto e Risorse',
      iconColor: 'bg-red-600',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <a 
              href="https://github.com/Stinocon/MangoMoney/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-lg ${
                darkMode 
                  ? 'border-slate-600 hover:bg-slate-700' 
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-red-900/30' : 'bg-red-100'
                }`}>
                  <Bug className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h5 className={`font-semibold text-lg ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>Segnala un Bug</h5>
                  <p className={`text-base ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>GitHub Issues per problemi tecnici</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://github.com/Stinocon/MangoMoney" 
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-lg ${
                darkMode 
                  ? 'border-slate-600 hover:bg-slate-700' 
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <Github className={`w-5 h-5 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`} />
                </div>
                <div>
                  <h5 className={`font-semibold text-lg ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>Codice Sorgente</h5>
                  <p className={`text-base ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>Open source su GitHub</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://github.com/Stinocon/MangoMoney/blob/main/docs/README.md" 
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-lg ${
                darkMode 
                  ? 'border-slate-600 hover:bg-slate-700' 
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className={`font-semibold text-lg ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>Documentazione</h5>
                  <p className={`text-base ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>Guide complete e FAQ</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://www.paypal.com/paypalme/stefanoconter" 
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-lg ${
                darkMode 
                  ? 'border-slate-600 hover:bg-slate-700' 
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-orange-900/30' : 'bg-orange-100'
                }`}>
                  <Coffee className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h5 className={`font-semibold text-lg ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>Offri un Caffè</h5>
                  <p className={`text-base ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>Supporta lo sviluppo di MangoMoney</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-screen">
      <div className="space-y-8">
        {/* Hero Section */}
        <HeroSection darkMode={darkMode} />
        
        {/* Accordion Sections */}
        <div className="space-y-6">
          {INFO_SECTIONS.map((section) => (
            <InfoCard
              key={section.id}
              icon={section.icon}
              title={section.title}
              iconColor={section.iconColor}
              isExpanded={expandedSections.includes(section.id)}
              onToggle={() => toggleSection(section.id)}
              darkMode={darkMode}
            >
              {section.content}
            </InfoCard>
          ))}
        </div>
        
        {/* Footer CTA */}
        <div className={`mt-12 text-center p-8 rounded-2xl border shadow-lg ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <h3 className={`text-xl font-semibold mb-3 ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            Pronto per iniziare?
          </h3>
          <p className={`mb-6 text-lg ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Aggiungi il tuo primo asset e vedi MangoMoney in azione
          </p>
          <button 
            onClick={navigateToAssets}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Aggiungi Primo Asset
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
