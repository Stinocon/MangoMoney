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
    <div className={`relative overflow-hidden rounded-xl p-6 mb-6 border ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50'
    }`}>
      {/* Background Pattern */}
      <div className={`absolute inset-0 opacity-5 ${
        darkMode ? 'bg-slate-600' : 'bg-blue-600'
      }`} style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Benvenuto in MangoMoney
            </h2>
            <p className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Il tuo patrimonio, i tuoi dati, il tuo controllo
            </p>
          </div>
        </div>
        
        <div className={`prose prose-sm ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <p>MangoMoney è progettato per essere semplice e intuitivo. Inizia dalla sezione Liquidità per inserire i tuoi conti correnti e depositi, poi passa agli Investimenti per il tuo portafoglio.</p>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Inserisci i dati una volta sola
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              L'app calcola tutto automaticamente  
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Esporta i dati quando vuoi
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Backup automatico ogni 5 minuti
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
    <div className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click per espandere
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
          <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300">
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
        <div className="space-y-3">
          <h4 className="font-medium text-slate-800 dark:text-slate-200">Setup in 3 step:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Aggiungi il tuo primo conto corrente nella sezione <strong>Liquidità</strong></li>
            <li>Inserisci investimenti principali nella sezione <strong>Investimenti</strong></li>  
            <li>Configura le impostazioni fiscali per l'Italia (già preimpostate)</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h5 className="font-medium text-green-800 dark:text-green-200">CAGR</h5>
              <p className="text-sm text-green-700 dark:text-green-300">Crescita annua composta dei tuoi investimenti</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h5 className="font-medium text-green-800 dark:text-green-200">SWR</h5>
              <p className="text-sm text-green-700 dark:text-green-300">Quanto puoi prelevare per il pensionamento</p>
            </div>
          </div>
          <p className="text-sm">Tutti i calcoli sono trasparenti e basati su formule finanziarie standard. Non facciamo "magia", solo matematica onesta.</p>
        </div>
      )
    },
    
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy e Sicurezza',
      iconColor: 'bg-orange-600',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              100% Offline
            </div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              Zero Tracking
            </div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              Open Source
            </div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              Crittografia Locale
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
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
        <div className="space-y-3">
          <p className="text-sm">MangoMoney supporta utenti da tutto il mondo con valute e tasse configurabili.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Valute Supportate</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
                <li>EUR (Euro)</li>
                <li>USD (Dollaro USA)</li>
                <li>GBP (Sterlina)</li>
                <li>CHF (Franco Svizzero)</li>
                <li>JPY (Yen Giapponese)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Tasse Configurabili</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
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
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <a 
              href="https://github.com/Stinocon/MangoMoney/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bug className="w-5 h-5 text-red-600" />
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-slate-100">Segnala un Bug</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400">GitHub Issues per problemi tecnici</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://github.com/Stinocon/MangoMoney" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-slate-100">Codice Sorgente</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Open source su GitHub</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://github.com/Stinocon/MangoMoney/blob/main/docs/README.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-slate-100">Documentazione</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Guide complete e FAQ</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="space-y-4">
        {/* Hero Section */}
        <HeroSection darkMode={darkMode} />
        
        {/* Accordion Sections */}
        <div className="space-y-3">
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
        <div className="mt-8 text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
            Pronto per iniziare?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Aggiungi il tuo primo asset e vedi MangoMoney in azione
          </p>
          <button 
            onClick={navigateToAssets}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Aggiungi Primo Asset
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
