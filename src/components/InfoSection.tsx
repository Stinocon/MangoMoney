/**
 * InfoSection - Redesigned Info Section for MangoMoney
 * 
 * @description
 * Modern, user-friendly info section with progressive disclosure
 * and action-oriented design optimized for light theme
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
  ArrowRight
} from 'lucide-react';

// ===== TYPES =====
interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  iconColor: string;
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
            <li className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Inserisci i dati una volta sola</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>L'app calcola tutto automaticamente</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Esporta i dati quando vuoi</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Backup automatico ogni 5 minuti</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Modern Card Design
const InfoCard: React.FC<InfoCardProps> = ({ 
  icon: Icon, 
  title, 
  children, 
  isExpanded, 
  onToggle, 
  iconColor 
}) => {
  return (
    <div className="group rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click per espandere
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-200 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-700/20">
          <div className="prose prose-base max-w-none text-slate-700 dark:text-slate-300 pt-4">
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

  // Visual Hierarchy with Colors
  const INFO_SECTIONS = [
    {
      id: 'quick-start',
      icon: BookOpen,
      title: 'Come Iniziare',
      iconColor: 'bg-blue-600',
      content: (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Setup in 3 step:</h4>
          <ol className="list-decimal list-inside space-y-4 text-base">
            <li className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              Aggiungi il tuo primo conto corrente nella sezione <strong>Liquidità</strong>
            </li>
            <li className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              Inserisci investimenti principali nella sezione <strong>Investimenti</strong>
            </li>  
            <li className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              Configura le impostazioni fiscali per l'Italia (già preimpostate)
            </li>
          </ol>
          
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-300 dark:border-blue-700">
            <p className="text-base text-blue-900 dark:text-blue-100">
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
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-300 dark:border-green-700">
              <h5 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">CAGR</h5>
              <p className="text-base text-green-800 dark:text-green-200">Crescita annua composta dei tuoi investimenti</p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-300 dark:border-green-700">
              <h5 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">SWR</h5>
              <p className="text-base text-green-800 dark:text-green-200">Quanto puoi prelevare per il pensionamento</p>
            </div>
          </div>
          <p className="text-base p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">Tutti i calcoli sono trasparenti e basati su formule finanziarie standard. Non facciamo "magia", solo matematica onesta.</p>
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
            <div className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0" />
              <span className="font-medium">100% Offline</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0" />
              <span className="font-medium">Zero Tracking</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0" />
              <span className="font-medium">Open Source</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0" />
              <span className="font-medium">Crittografia Locale</span>
            </div>
          </div>
          
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl border border-orange-300 dark:border-orange-700">
            <p className="text-base text-orange-900 dark:text-orange-100 font-medium">
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
          <p className="text-base p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">MangoMoney supporta utenti da tutto il mondo con valute e tasse configurabili.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-300 dark:border-purple-700">
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">Valute Supportate</h4>
              <ul className="list-disc list-inside text-base text-purple-800 dark:text-purple-200 space-y-2">
                <li>EUR (Euro)</li>
                <li>USD (Dollaro USA)</li>
                <li>GBP (Sterlina)</li>
                <li>CHF (Franco Svizzero)</li>
                <li>JPY (Yen Giapponese)</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-300 dark:border-purple-700">
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">Tasse Configurabili</h4>
              <ul className="list-disc list-inside text-base text-purple-800 dark:text-purple-200 space-y-2">
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
              className="p-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Segnala un Bug</h5>
                  <p className="text-base text-slate-600 dark:text-slate-400">GitHub Issues per problemi tecnici</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://github.com/Stinocon/MangoMoney" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Github className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Codice Sorgente</h5>
                  <p className="text-base text-slate-600 dark:text-slate-400">Open source su GitHub</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://github.com/Stinocon/MangoMoney/blob/main/docs/README.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Documentazione</h5>
                  <p className="text-base text-slate-600 dark:text-slate-400">Guide complete e FAQ</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white dark:bg-slate-900 min-h-screen">
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
            >
              {section.content}
            </InfoCard>
          ))}
        </div>
        
        {/* Footer CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-blue-200 dark:border-slate-600 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Pronto per iniziare?
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6 text-lg">
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
