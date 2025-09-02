# 🏗️ Architecture - MangoMoney

**Decisioni tecniche e struttura del codice.**

**Ultimo aggiornamento:** 28 Agosto 2025 - Versione 4.0.0

---

## 🎯 Principi Architetturali

### **Privacy-First**
- **Zero server**: Tutto client-side
- **localStorage**: Dati solo sul dispositivo
- **Crittografia**: Dati sensibili sempre crittografati

### **Performance**
- **Bundle size**: Target < 500kB
- **Lazy loading**: Componenti caricati on-demand
- **Memoization**: Calcoli pesanti ottimizzati

### **Accessibility**
- **WCAG 2.1**: Conformità AA
- **Keyboard navigation**: Navigazione completa da tastiera
- **Screen readers**: Supporto completo

---

## 🏛️ Struttura Progetto

```
src/
├── components/           # Componenti React
│   ├── IconSystem.tsx   # Sistema icone unificato
│   ├── InfoSection.tsx  # Sezione info dell'app
│   ├── AccessibleCharts.tsx  # Grafici e insights
│   └── AccessibleComponents.tsx  # Componenti UI
├── utils/               # Utility e calcoli
│   ├── appConstants.ts  # Costanti centralizzate
│   ├── financialCalculations.ts  # Calcoli finanziari
│   └── advancedSecurity.ts  # Sicurezza avanzata
├── translations/        # Internazionalizzazione
│   ├── it.ts           # Italiano (default)
│   └── en.ts           # English
└── App.tsx             # Componente principale
```

---

## 🧮 Calcoli Finanziari

### **Precisione**
- **Decimal.js**: Precisione matematica finanziaria
- **Rounding**: Arrotondamento corretto per valute
- **Validation**: Controlli sui dati di input

### **Formule Implementate**
```typescript
// CAGR (Compound Annual Growth Rate)
CAGR = (Valore Finale / Valore Iniziale)^(1/Anni) - 1

// SWR (Safe Withdrawal Rate)
SWR = Patrimonio × 0.04 (Trinity Study)

// Risk Score
Risk Score = Σ(Asset Weight × Category Risk) / Total Weight
```

### **Ottimizzazioni**
- **useMemo**: Calcoli pesanti memorizzati
- **useCallback**: Funzioni ottimizzate
- **Lazy evaluation**: Calcoli solo quando necessario

---

## 🔒 Sicurezza

### **Crittografia**
- **CryptoJS**: Crittografia AES-256
- **Salt**: Salt unico per ogni utente
- **Key derivation**: PBKDF2 per chiavi

### **Validazione Input**
- **CSV injection**: Protezione completa
- **XSS**: Sanitizzazione output
- **Content Security Policy**: Headers di sicurezza

### **Backup**
- **Automatico**: Ogni 5 minuti
- **Integrità**: Checksum verification
- **Recovery**: Ripristino automatico

---

## 🎨 UI/UX Design

### **Design System**
- **Tailwind CSS**: Utility-first CSS
- **Consistent spacing**: Sistema 4px base
- **Color palette**: Dark/light mode support

### **Componenti**
- **Reusable**: Componenti modulari
- **Accessible**: ARIA labels e focus management
- **Responsive**: Mobile-first design

### **Icone**
- **lucide-react**: Icone principali
- **IconSystem**: Sistema unificato
- **Consistent sizing**: 16px, 20px, 24px, 32px

---

## 📊 Gestione Stato

### **React Hooks**
- **useState**: Stato locale componenti
- **useEffect**: Side effects
- **useMemo**: Calcoli ottimizzati
- **useCallback**: Funzioni ottimizzate

### **localStorage**
- **Persistence**: Dati persistenti
- **Synchronization**: Sync automatico
- **Migration**: Versioning dati

### **Performance**
- **Debouncing**: Input ottimizzati
- **Throttling**: Eventi limitati
- **Virtualization**: Liste grandi

---

## 🌐 Internazionalizzazione

### **Sistema i18n**
- **Translation keys**: Sistema centralizzato
- **Pluralization**: Supporto plurali
- **Date formatting**: Locale-aware

### **Lingue Supportate**
- **Italiano**: Lingua principale
- **English**: Traduzione completa
- **Estensibile**: Facile aggiungere lingue

### **Implementazione**
```typescript
// Translation key system
type TranslationKey = 
  | 'portfolio.netWorth'
  | 'calculations.cagr'
  | 'settings.privacy';

// Usage
const t = (key: TranslationKey): string => translations[key];
```

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Strategie**
- **Mobile-first**: Design da mobile
- **Progressive enhancement**: Funzionalità aggiuntive
- **Touch-friendly**: Target size 44px+

### **Performance Mobile**
- **Bundle splitting**: Chunk ottimizzati
- **Image optimization**: WebP support
- **Service worker**: Caching intelligente

---

## 🧪 Testing

### **Strategia**
- **Unit tests**: Funzioni pure
- **Integration tests**: Componenti
- **E2E tests**: Flussi completi

### **Tools**
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Cypress**: E2E testing

### **Coverage**
- **Target**: > 80% coverage
- **Critical paths**: 100% coverage
- **Financial calculations**: 100% coverage

---

## 🚀 Build & Deploy

### **Build Process**
- **Webpack**: Bundling ottimizzato
- **Tree shaking**: Dead code elimination
- **Minification**: CSS/JS compression

### **Bundle Analysis**
- **Bundle size**: Monitoraggio continuo
- **Chunk splitting**: Code splitting
- **Performance**: Lighthouse scores

### **Deployment**
- **GitHub Pages**: Hosting statico
- **CDN**: Distribuzione globale
- **HTTPS**: Sicurezza obbligatoria

---

## 🔧 Configurazione

### **Environment**
- **Development**: Hot reload, debug tools
- **Production**: Ottimizzazioni, minification
- **Testing**: Mock data, test utilities

### **Constants**
```typescript
// appConstants.ts
export const PORTFOLIO_THRESHOLDS = {
  EMERGENCY_FUND_MIN: 3,
  EMERGENCY_FUND_OPTIMAL: 6,
  SWR_MIN_PATRIMONY: 10000
};

export const TAX_CONSTANTS = {
  ITALY_CAPITAL_GAINS: 0.26,
  ITALY_WHITELIST_BONDS: 0.125
};
```

---

## 📈 Monitoring

### **Performance**
- **Lighthouse**: Core Web Vitals
- **Bundle analyzer**: Size monitoring
- **Error tracking**: Crash reporting

### **Analytics**
- **Privacy-first**: Zero tracking
- **Self-hosted**: Analytics locali
- **User feedback**: GitHub issues

---

## 🔮 Roadmap Tecnica

### **Short Term**
- **PWA**: Progressive Web App
- **Offline support**: Service worker
- **Performance**: Bundle optimization

### **Medium Term**
- **TypeScript strict**: Strict mode completo
- **Testing**: E2E test coverage
- **Accessibility**: WCAG AAA compliance

### **Long Term**
- **Micro-frontends**: Architettura modulare
- **Real-time**: WebSocket support
- **Advanced analytics**: ML insights

---

<div align="center">

**💡 Domande tecniche?** Apri una [issue](https://github.com/Stinocon/MangoMoney/issues) su GitHub!

</div>
