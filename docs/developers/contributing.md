# 🤝 Contributing - MangoMoney

**Come contribuire al progetto MangoMoney.**

**Ultimo aggiornamento:** 28 Agosto 2025 - Versione 4.0.0

---

## 🎯 Come Contribuire

### **Tipi di Contribuzione**
- **🐛 Bug fixes**: Correzione errori
- **✨ Nuove funzionalità**: Aggiunte utili
- **📚 Documentazione**: Miglioramenti guide
- **🎨 UI/UX**: Miglioramenti interfaccia
- **🧪 Test**: Aggiunta test coverage
- **🌐 Traduzioni**: Nuove lingue

### **Prima di Iniziare**
1. **Leggi** [README](../README.md) e [Architecture](architecture.md)
2. **Controlla** [Issues](https://github.com/Stinocon/MangoMoney/issues)
3. **Discuti** su [Discussions](https://github.com/Stinocon/MangoMoney/discussions)

---

## 🚀 Setup Sviluppo

### **Prerequisiti**
- **Node.js**: Versione 18+
- **npm**: Versione 9+
- **Git**: Versione 2.30+

### **Setup Locale**
```bash
# 1. Fork del repository
git clone https://github.com/TUO_USERNAME/MangoMoney.git
cd MangoMoney

# 2. Installazione dipendenze
npm install

# 3. Avvio server sviluppo
npm start

# 4. Test
npm test
```

### **Verifica Setup**
- [ ] App si carica su http://localhost:3000
- [ ] Test passano: `npm test`
- [ ] Linter OK: `npm run lint`
- [ ] TypeScript OK: `npm run type-check`

---

## 📋 Workflow Contribuzione

### **1. Issue o Discussion**
- **Bug**: Apri issue con dettagli completi
- **Feature**: Discuti prima su Discussions
- **Documentazione**: Proponi miglioramenti

### **2. Branch**
```bash
# Crea branch per la feature
git checkout -b feature/nome-feature
# oppure
git checkout -b fix/nome-bug
```

### **3. Sviluppo**
- **Codice**: Segui standard del progetto
- **Test**: Aggiungi test per nuove funzionalità
- **Documentazione**: Aggiorna guide se necessario

### **4. Commit**
```bash
# Commit con messaggio chiaro
git commit -m "feat: aggiunge calcolo CAGR personalizzato"
git commit -m "fix: risolve bug import CSV con caratteri speciali"
git commit -m "docs: aggiorna guida calcoli finanziari"
```

### **5. Push e Pull Request**
```bash
git push origin feature/nome-feature
# Crea Pull Request su GitHub
```

---

## 📝 Standard di Codice

### **TypeScript**
- **Strict mode**: Sempre abilitato
- **Types**: Definisci sempre i tipi
- **Interfaces**: Usa interfaces per oggetti complessi

```typescript
// ✅ Buono
interface Asset {
  id: string;
  name: string;
  value: number;
  category: AssetCategory;
}

// ❌ Evita
const asset = { id: '1', name: 'ETF', value: 1000 };
```

### **React**
- **Functional components**: Usa sempre hooks
- **Props interface**: Definisci sempre i tipi
- **Performance**: Usa useMemo/useCallback quando necessario

```typescript
// ✅ Buono
interface PortfolioProps {
  assets: Asset[];
  onAssetUpdate: (asset: Asset) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ assets, onAssetUpdate }) => {
  const totalValue = useMemo(() => 
    assets.reduce((sum, asset) => sum + asset.value, 0), 
    [assets]
  );
  
  return <div>...</div>;
};
```

### **Naming Conventions**
- **Files**: camelCase.tsx
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types**: PascalCase

---

## 🧪 Testing

### **Strategia Testing**
- **Unit tests**: Funzioni pure e utilities
- **Component tests**: Componenti React
- **Integration tests**: Flussi completi
- **E2E tests**: Scenari utente reali

### **Scrivere Test**
```typescript
// Test funzione pura
describe('calculateCAGR', () => {
  it('should calculate CAGR correctly', () => {
    const result = calculateCAGR(10000, 15000, 5);
    expect(result).toBeCloseTo(0.0845, 4);
  });
  
  it('should return 0 for invalid inputs', () => {
    expect(calculateCAGR(0, 15000, 5)).toBe(0);
    expect(calculateCAGR(10000, 15000, 0)).toBe(0);
  });
});

// Test componente
describe('Portfolio', () => {
  it('should render assets correctly', () => {
    const assets = [{ id: '1', name: 'ETF', value: 1000 }];
    render(<Portfolio assets={assets} />);
    expect(screen.getByText('ETF')).toBeInTheDocument();
  });
});
```

### **Coverage Target**
- **Overall**: > 80%
- **Financial calculations**: 100%
- **Critical paths**: 100%

---

## 📚 Documentazione

### **Quando Aggiornare**
- **Nuove funzionalità**: Aggiorna guide utente
- **API changes**: Aggiorna developer docs
- **Bug fixes**: Aggiorna troubleshooting

### **Standard Documentazione**
- **Markdown**: Usa sempre .md
- **Headers**: Gerarchia chiara (##, ###)
- **Code blocks**: Specifica linguaggio
- **Links**: Usa link relativi quando possibile

### **Esempi**
```markdown
## 🧮 Nuova Funzionalità

### **Come Usare**
1. Vai in Impostazioni
2. Seleziona "Nuova Funzionalità"
3. Configura parametri

### **Esempio Codice**
```typescript
const result = newFeature(config);
```

### **Note**
- Funziona solo con dati validi
- Richiede configurazione iniziale
```

---

## 🎨 UI/UX Guidelines

### **Design System**
- **Tailwind CSS**: Usa classi esistenti
- **Colors**: Usa palette definita
- **Spacing**: Sistema 4px base
- **Typography**: Gerarchia consistente

### **Accessibility**
- **ARIA labels**: Sempre per elementi interattivi
- **Keyboard navigation**: Testa sempre
- **Color contrast**: Minimo 4.5:1
- **Screen readers**: Testa con NVDA/VoiceOver

### **Responsive**
- **Mobile-first**: Design da mobile
- **Breakpoints**: Usa quelli definiti
- **Touch targets**: Minimo 44px

---

## 🔒 Sicurezza

### **Validazione Input**
- **Sanitizzazione**: Sempre per input utente
- **Type checking**: Valida tipi TypeScript
- **CSV injection**: Proteggi import CSV

### **Privacy**
- **Zero tracking**: Non aggiungere analytics
- **Local storage**: Dati solo locali
- **Crittografia**: Mantieni standard esistenti

---

## 📋 Checklist Pull Request

### **Prima di Inviare**
- [ ] **Codice**: Segue standard del progetto
- [ ] **Test**: Tutti i test passano
- [ ] **Linter**: Nessun errore/warning
- [ ] **TypeScript**: Nessun errore di tipo
- [ ] **Documentazione**: Aggiornata se necessario
- [ ] **Commit**: Messaggi chiari e descrittivi

### **Template Pull Request**
```markdown
## 📝 Descrizione
Breve descrizione delle modifiche

## 🎯 Tipo di Modifica
- [ ] Bug fix
- [ ] Nuova funzionalità
- [ ] Miglioramento documentazione
- [ ] Refactoring

## 🧪 Test
- [ ] Test unitari aggiunti/aggiornati
- [ ] Test manuali completati
- [ ] Nessuna regressione

## 📚 Documentazione
- [ ] Guide utente aggiornate
- [ ] Developer docs aggiornate
- [ ] Commenti codice aggiunti

## 🔍 Checklist
- [ ] Codice segue standard del progetto
- [ ] Self-review completata
- [ ] Commenti aggiunti per codice complesso
- [ ] Test coverage mantenuta/improved
```

---

## 🚨 Problemi Comuni

### **Build Fails**
```bash
# Pulisci cache
npm run clean
rm -rf node_modules
npm install

# Verifica versioni
node --version
npm --version
```

### **Test Fail**
```bash
# Debug test specifico
npm test -- --testNamePattern="nome test"

# Coverage report
npm run test:coverage
```

### **TypeScript Errors**
```bash
# Type check
npm run type-check

# Fix automatico
npm run lint:fix
```

---

## 📞 Supporto

### **Domande Tecniche**
- **GitHub Discussions**: [Domande generali](https://github.com/Stinocon/MangoMoney/discussions)
- **Issues**: [Bug e feature requests](https://github.com/Stinocon/MangoMoney/issues)
- **GitHub**: [@Stinocon](https://github.com/Stinocon)

### **Risorse**
- **[Architecture](architecture.md)**: Decisioni tecniche
- **[Financial Formulas](financial-formulas.md)**: Formule matematiche
- **[README](../README.md)**: Panoramica progetto

---

<div align="center">

**💡 Pronto a contribuire?** Inizia da una [issue](https://github.com/Stinocon/MangoMoney/issues) o [discussion](https://github.com/Stinocon/MangoMoney/discussions)!

</div>
