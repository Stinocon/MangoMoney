/**
 * InfoSection - Redesigned Info Section for MangoMoney
 * 
 * @description
 * Modern, user-friendly info section with progressive disclosure
 * and action-oriented design
 * 
 * @version 4.0.0
 */

import React, { useState } from 'react';
import { 
  Rocket, 
  Shield, 
  Calculator, 
  Globe, 
  Smartphone, 
  BookOpen, 
  HelpCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Star,
  Coffee,
  Bug,
  Github
} from 'lucide-react';

// ===== TYPES =====
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

interface QuickStartStepProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

interface FeatureGridProps {
  features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
}

// ===== COMPONENTS =====

export const InfoCard: React.FC<InfoCardProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => {
  return (
    <div className={`p-6 rounded-lg border transition-all hover:shadow-md ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              {action.label}
              <ExternalLink className="ml-1 w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const QuickStartStep: React.FC<QuickStartStepProps> = ({ 
  step, 
  icon, 
  title, 
  description, 
  onClick 
}) => {
  return (
    <div 
      className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {step}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {feature.title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

// ===== MAIN INFO SECTION =====

interface InfoSectionProps {
  darkMode: boolean;
  onNavigateToSection: (section: string) => void;
  t: (key: any) => string;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ 
  darkMode, 
  onNavigateToSection, 
  t 
}) => {
  const quickStartSteps = [
    {
      step: 1,
      icon: <Rocket className="w-5 h-5 text-blue-600" />,
      title: 'Liquidità',
      description: 'Inizia dai conti correnti e depositi',
      onClick: () => onNavigateToSection('cash')
    },
    {
      step: 2,
      icon: <Calculator className="w-5 h-5 text-green-600" />,
      title: 'Investimenti',
      description: 'Aggiungi il tuo portafoglio',
      onClick: () => onNavigateToSection('investments')
    },
    {
      step: 3,
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      title: 'Immobili',
      description: 'Inserisci le tue proprietà',
      onClick: () => onNavigateToSection('realEstate')
    }
  ];

  const mainFeatures = [
    {
      icon: <Calculator className="w-6 h-6 text-blue-600" />,
      title: 'Calcoli Smart',
      description: 'CAGR, SWR, Risk Score per pianificare il pensionamento'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Privacy Totale',
      description: 'Dati solo sul tuo browser, zero server, zero tracking'
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-600" />,
      title: 'Tasse Italia',
      description: 'Calcoli automatici plusvalenze e bollo titoli'
    },
    {
      icon: <Smartphone className="w-6 h-6 text-orange-600" />,
      title: 'Multi-Device',
      description: 'Desktop e mobile, sempre sincronizzato'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Accogliente */}
      <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} rounded-lg shadow-lg p-8 border ${darkMode ? 'border-slate-700' : 'border-blue-200'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={require('../images/mango.png')} 
              alt="MangoMoney" 
              className="h-20 md:h-24 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            MangoMoney
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Il tuo patrimonio, i tuoi dati, il tuo controllo
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <a 
              href="https://github.com/Stinocon/MangoMoney" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Github className="w-5 h-5 mr-2" />
              <Star className="w-4 h-4 mr-1" />
              4.0.0
            </a>
          </div>
        </div>
      </div>

      {/* Quick Start Visuale */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Inizia in 2 Minuti
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStartSteps.map((step) => (
            <QuickStartStep key={step.step} {...step} />
          ))}
        </div>
      </div>

      {/* Funzionalità Principali */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Cosa Fa per Te
        </h2>
        <FeatureGrid features={mainFeatures} />
      </div>

      {/* Sezioni Espandibili */}
      <div className="space-y-4">
        <AccordionSection 
          title="Come Usare l'App" 
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          defaultExpanded={true}
        >
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              MangoMoney è progettato per essere semplice e intuitivo. Inizia dalla sezione Liquidità per inserire i tuoi conti correnti e depositi, poi passa agli Investimenti per il tuo portafoglio.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Inserisci i dati una volta sola</li>
              <li>L'app calcola tutto automaticamente</li>
              <li>Esporta i dati quando vuoi</li>
              <li>Backup automatico ogni 5 minuti</li>
            </ul>
          </div>
        </AccordionSection>

        <AccordionSection 
          title="Spiegazione Calcoli" 
          icon={<Calculator className="w-5 h-5 text-green-600" />}
        >
          <div className="prose dark:prose-invert max-w-none">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">CAGR (Compound Annual Growth Rate)</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Tasso di crescita annuale composto. Mostra quanto cresce il tuo investimento in media ogni anno.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">SWR (Safe Withdrawal Rate)</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Basato sul Trinity Study. Quanto puoi prelevare annualmente senza esaurire il capitale in 30 anni.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Risk Score</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Punteggio di rischio semplificato basato sulla composizione del portafoglio.
                </p>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection 
          title="Privacy & Sicurezza" 
          icon={<Shield className="w-5 h-5 text-purple-600" />}
        >
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              I tuoi dati sono sempre al sicuro perché rimangono solo sul tuo dispositivo.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Nessun server, nessun database esterno</li>
              <li>Dati crittografati nel browser</li>
              <li>Backup automatico ogni 5 minuti</li>
              <li>Export completo in JSON, CSV, PDF</li>
              <li>Zero tracking, zero analytics</li>
            </ul>
          </div>
        </AccordionSection>

        <AccordionSection 
          title="Configurazione Internazionale" 
          icon={<Globe className="w-5 h-5 text-orange-600" />}
        >
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              MangoMoney supporta utenti da tutto il mondo con valute e tasse configurabili.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Valute Supportate</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  <li>EUR (Euro)</li>
                  <li>USD (Dollaro USA)</li>
                  <li>GBP (Sterlina)</li>
                  <li>CHF (Franco Svizzero)</li>
                  <li>JPY (Yen Giapponese)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tasse Configurabili</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  <li>Aliquote personalizzabili</li>
                  <li>Regimi fiscali diversi</li>
                  <li>Calcoli universali</li>
                </ul>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection 
          title="FAQ & Problemi Comuni" 
          icon={<HelpCircle className="w-5 h-5 text-red-600" />}
        >
          <div className="prose dark:prose-invert max-w-none">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">I miei dati sono al sicuro?</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Sì, i tuoi dati rimangono solo sul tuo dispositivo. Non vengono mai inviati a server esterni.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Come faccio il backup?</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  L'app fa backup automatici ogni 5 minuti. Puoi anche esportare manualmente in JSON, CSV o PDF.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Posso usare l'app offline?</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Sì, una volta caricata l'app funziona completamente offline.
                </p>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Footer Utile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          icon={<BookOpen className="w-6 h-6 text-blue-600" />}
          title="Documentazione Completa"
          description="Guida dettagliata ai calcoli finanziari e all'uso dell'app"
          action={{
            label: 'Leggi la documentazione',
            href: 'https://github.com/Stinocon/MangoMoney/blob/main/docs/UserDocumentation.md'
          }}
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
        
        <InfoCard
          icon={<Coffee className="w-6 h-6 text-orange-600" />}
          title="Offri un Caffè"
          description="Supporta lo sviluppo di MangoMoney"
          action={{
            label: 'Dona su PayPal',
            href: 'https://www.paypal.com/paypalme/stefanoconter'
          }}
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
        
        <InfoCard
          icon={<Bug className="w-6 h-6 text-red-600" />}
          title="Segnala Bug"
          description="Aiutaci a migliorare MangoMoney"
          action={{
            label: 'Apri una issue',
            href: 'https://github.com/Stinocon/MangoMoney/issues'
          }}
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  );
};
