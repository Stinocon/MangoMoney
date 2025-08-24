interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalItems: number;
    totalValue: number;
    sections: { [key: string]: number };
    dataIntegrity: number; // Percentage of valid data
  };
}

interface ExportData {
  assets: any;
  totals: any;
  statistics: any;
  emergencyFundAccount: { section: string; id: number; name: string };
  formatCurrency: (amount: number) => string;
  settings?: any;
}

export class ExportValidator {
  private data: ExportData;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(data: ExportData) {
    this.data = data;
  }

  validateData(): ValidationResult {
    this.errors = [];
    this.warnings = [];
    
    const summary = this.calculateSummary();
    
    // Validate basic structure
    this.validateStructure();
    
    // Validate assets
    this.validateAssets();
    
    // Validate totals consistency
    this.validateTotals();
    
    // Validate settings
    this.validateSettings();
    
    // Validate emergency fund
    this.validateEmergencyFund();
    
    // Calculate data integrity percentage
    const dataIntegrity = this.calculateDataIntegrity(summary.totalItems);
    
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
      summary: {
        ...summary,
        dataIntegrity
      }
    };
  }

  private validateStructure(): void {
    if (!this.data.assets || typeof this.data.assets !== 'object') {
      this.errors.push('Struttura assets non valida');
      return;
    }

    if (!this.data.totals || typeof this.data.totals !== 'object') {
      this.errors.push('Struttura totals non valida');
      return;
    }

    if (!this.data.emergencyFundAccount || typeof this.data.emergencyFundAccount !== 'object') {
      this.errors.push('Configurazione fondo emergenza non valida');
      return;
    }

    if (typeof this.data.formatCurrency !== 'function') {
      this.errors.push('Funzione formatCurrency non valida');
      return;
    }
  }

  private validateAssets(): void {
    const sections = ['cash', 'investments', 'realEstate', 'pensionFunds', 'otherAccounts', 'alternativeAssets', 'debts', 'transactions'];
    
    sections.forEach(section => {
      const items = this.data.assets[section];
      
      if (!Array.isArray(items)) {
        this.warnings.push(`Sezione ${section}: dati non in formato array`);
        return;
      }

      items.forEach((item: any, index: number) => {
        this.validateAssetItem(item, section, index);
      });
    });
  }

  private validateAssetItem(item: any, section: string, index: number): void {
    const rowPrefix = `${section}[${index}]`;

    // Required fields validation
    if (!item.id || typeof item.id !== 'number') {
      this.errors.push(`${rowPrefix}: ID mancante o non valido`);
    }

    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      this.errors.push(`${rowPrefix}: Nome mancante o non valido`);
    }

    // ✅ ENHANCED AMOUNT VALIDATION
    const amount = section === 'realEstate' ? item.value : item.amount;
    
    // Validate amount type and value
    if (typeof amount !== 'number' && typeof amount !== 'string') {
      this.errors.push(`${rowPrefix}: Importo deve essere numero o stringa`);
      return;
    }
    
    let numericAmount: number;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        this.errors.push(`${rowPrefix}: Importo stringa non valido: "${amount}"`);
        return;
      }
    } else {
      numericAmount = amount;
    }
    
    if (!Number.isFinite(numericAmount)) {
      this.errors.push(`${rowPrefix}: Importo non finito: ${numericAmount}`);
    } else if (numericAmount < 0 && section !== 'debts') {
      this.warnings.push(`${rowPrefix}: Importo negativo per asset non-debito`);
    }

    // Section-specific validation
    if (section === 'realEstate') {
      this.validateRealEstateItem(item, rowPrefix);
    } else if (section === 'investmentPositions') {
      this.validateInvestmentPositionItem(item, rowPrefix);
    } else if (section === 'transactions') {
      this.validateTransactionItem(item, rowPrefix);
    } else if (section === 'cash') {
      this.validateCashItem(item, rowPrefix);
    } else if (section === 'alternativeAssets') {
      this.validateAlternativeAssetItem(item, rowPrefix);
    }
  }

  private validateRealEstateItem(item: any, rowPrefix: string): void {
    if (!item.type || !['primary', 'secondary'].includes(item.type)) {
      this.warnings.push(`${rowPrefix}: Tipo immobile non specificato o non valido`);
    }

    if (item.address && typeof item.address !== 'string') {
      this.warnings.push(`${rowPrefix}: Indirizzo non in formato stringa`);
    }
  }

  private validateInvestmentPositionItem(item: any, rowPrefix: string): void {
    if (item.ticker && typeof item.ticker !== 'string') {
      this.warnings.push(`${rowPrefix}: Ticker non in formato stringa`);
    }

    if (item.isin && typeof item.isin !== 'string') {
      this.warnings.push(`${rowPrefix}: ISIN non in formato stringa`);
    }

    if (item.purchaseDate && !this.isValidDate(item.purchaseDate)) {
      this.warnings.push(`${rowPrefix}: Data acquisto non valida`);
    }
  }

  private validateTransactionItem(item: any, rowPrefix: string): void {
    if (!item.transactionType || !['purchase', 'sale'].includes(item.transactionType)) {
      this.errors.push(`${rowPrefix}: Tipo transazione non valido`);
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      this.errors.push(`${rowPrefix}: Quantità non valida`);
    }

    if (typeof item.commissions !== 'number' || item.commissions < 0) {
      this.warnings.push(`${rowPrefix}: Commissioni non valide`);
    }

    if (!item.date || !this.isValidDate(item.date)) {
      this.errors.push(`${rowPrefix}: Data transazione non valida`);
    }
  }

  private validateCashItem(item: any, rowPrefix: string): void {
    if (item.accountType && !['current', 'deposit', 'remunerated', 'cash'].includes(item.accountType)) {
      this.warnings.push(`${rowPrefix}: Tipo conto non valido`);
    }

    if (item.bollo && (typeof item.bollo !== 'number' || item.bollo < 0)) {
      this.warnings.push(`${rowPrefix}: Bollo non valido`);
    }
  }

  private validateAlternativeAssetItem(item: any, rowPrefix: string): void {
    const validTypes = ['tcg', 'stamps', 'alcohol', 'collectibles', 'vinyl', 'books', 'comics', 'art', 'other'];
    if (item.assetType && !validTypes.includes(item.assetType)) {
      this.warnings.push(`${rowPrefix}: Tipo asset alternativo non valido`);
    }
  }

  private validateTotals(): void {
    const calculatedTotals = this.calculateTotals();
    const providedTotals = this.data.totals;

    // Compare calculated vs provided totals
    Object.keys(calculatedTotals).forEach(section => {
      const calculated = calculatedTotals[section];
      const provided = providedTotals[section];
      
      if (typeof provided !== 'number') {
        this.errors.push(`Totale ${section}: valore mancante o non numerico`);
        return;
      }

      const difference = Math.abs(calculated - provided);
      const tolerance = Math.max(calculated * 0.01, 0.01); // 1% tolerance

      if (difference > tolerance) {
        this.warnings.push(`Totale ${section}: discrepanza di ${this.data.formatCurrency(difference)} (calcolato: ${this.data.formatCurrency(calculated)}, fornito: ${this.data.formatCurrency(provided)})`);
      }
    });

    // Validate net worth calculation
    const calculatedNetWorth = calculatedTotals.total;
    const providedNetWorth = providedTotals.total;
    
    if (typeof providedNetWorth !== 'number') {
      this.errors.push('Patrimonio netto totale: valore mancante o non numerico');
    } else {
      const difference = Math.abs(calculatedNetWorth - providedNetWorth);
      const tolerance = Math.max(calculatedNetWorth * 0.01, 0.01);
      
      if (difference > tolerance) {
        this.warnings.push(`Patrimonio netto: discrepanza di ${this.data.formatCurrency(difference)}`);
      }
    }
  }

  private validateSettings(): void {
    if (!this.data.settings) {
      this.warnings.push('Impostazioni non incluse nei dati di export');
      return;
    }

    const settings = this.data.settings;
    const requiredSettings = [
      'capitalGainsTaxRate',
      'whitelistBondsTaxRate',
      'currentAccountStampDuty', 
      'swrRate',
      'inflationRate',
      'monthlyExpenses'
    ];

    requiredSettings.forEach(setting => {
      if (typeof settings[setting] !== 'number') {
        this.warnings.push(`Impostazione ${setting}: valore mancante o non numerico`);
      }
    });

    // Validate setting ranges
    if (settings.capitalGainsTaxRate && (settings.capitalGainsTaxRate < 0 || settings.capitalGainsTaxRate > 100)) {
      this.warnings.push('Capital Gains Tax Rate: valore fuori range (0-100%)');
    }

    if (settings.whitelistBondsTaxRate && (settings.whitelistBondsTaxRate < 0 || settings.whitelistBondsTaxRate > 100)) {
      this.warnings.push('Whitelist Bonds Tax Rate: valore fuori range (0-100%)');
    }

    if (settings.swrRate && (settings.swrRate < 0 || settings.swrRate > 10)) {
      this.warnings.push('SWR Rate: valore fuori range (0-10%)');
    }

    if (settings.inflationRate && (settings.inflationRate < -50 || settings.inflationRate > 100)) {
      this.warnings.push('Inflation Rate: valore fuori range (-50% - 100%)');
    }

    if (settings.monthlyExpenses && settings.monthlyExpenses < 0) {
      this.warnings.push('Monthly Expenses: valore negativo');
    }
  }

  private validateEmergencyFund(): void {
    const emergency = this.data.emergencyFundAccount;
    
    if (!emergency.section || typeof emergency.section !== 'string') {
      this.errors.push('Sezione fondo emergenza non specificata');
      return;
    }

    if (typeof emergency.id !== 'number') {
      this.errors.push('ID fondo emergenza non valido');
      return;
    }

    // Check if emergency fund account exists
    const sectionItems = this.data.assets[emergency.section];
    if (!Array.isArray(sectionItems)) {
      this.errors.push(`Sezione fondo emergenza (${emergency.section}) non trovata`);
      return;
    }

    const emergencyAccount = sectionItems.find((item: any) => item.id === emergency.id);
    if (!emergencyAccount) {
      this.errors.push(`Account fondo emergenza (ID: ${emergency.id}) non trovato nella sezione ${emergency.section}`);
    }
  }

  private calculateTotals(): { [key: string]: number } {
    const totals: { [key: string]: number } = {
      cash: 0,
      investments: 0,
      realEstate: 0,
      pensionFunds: 0,
      otherAccounts: 0,
      alternativeAssets: 0,
      debts: 0,
      total: 0
    };

    Object.entries(this.data.assets).forEach(([section, items]) => {
      if (!Array.isArray(items)) return;

      const sectionTotal = items.reduce((sum: number, item: any) => {
        const value = section === 'realEstate' ? item.value : item.amount;
        return sum + (value || 0);
      }, 0);

      if (section === 'debts') {
        totals.debts = sectionTotal;
      } else {
        totals[section] = sectionTotal;
      }
    });

    // Calculate net worth
    totals.total = totals.cash + totals.investments + totals.realEstate + 
                  totals.pensionFunds + totals.otherAccounts + totals.alternativeAssets - Math.abs(totals.debts);

    return totals;
  }

  private calculateSummary(): { totalItems: number; totalValue: number; sections: { [key: string]: number } } {
    let totalItems = 0;
    let totalValue = 0;
    const sections: { [key: string]: number } = {};

    Object.entries(this.data.assets).forEach(([section, items]) => {
      if (Array.isArray(items)) {
        const sectionCount = items.length;
        const sectionValue = items.reduce((sum: number, item: any) => {
          const value = section === 'realEstate' ? item.value : item.amount;
          return sum + (value || 0);
        }, 0);

        sections[section] = sectionCount;
        totalItems += sectionCount;
        totalValue += sectionValue;
      }
    });

    return { totalItems, totalValue, sections };
  }

  private calculateDataIntegrity(totalItems: number): number {
    if (totalItems === 0) return 100;
    
    const errorWeight = this.errors.length * 10; // Each error reduces integrity by 10%
    const warningWeight = this.warnings.length * 2; // Each warning reduces integrity by 2%
    
    const integrity = Math.max(0, 100 - errorWeight - warningWeight);
    return Math.round(integrity);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Static method for quick validation
  static quickValidate(data: ExportData): ValidationResult {
    const validator = new ExportValidator(data);
    return validator.validateData();
  }

  // Method to generate validation report
  generateReport(): string {
    const result = this.validateData();
    
    let report = '=== REPORT VALIDAZIONE EXPORT ===\n\n';
    
    report += `Stato: ${result.isValid ? '✅ VALIDO' : '❌ NON VALIDO'}\n`;
    report += `Integrità dati: ${result.summary.dataIntegrity}%\n\n`;
    
    report += `Riepilogo:\n`;
    report += `- Elementi totali: ${result.summary.totalItems}\n`;
    report += `- Valore totale: ${this.data.formatCurrency(result.summary.totalValue)}\n`;
    report += `- Sezioni: ${Object.keys(result.summary.sections).length}\n\n`;
    
    if (result.errors.length > 0) {
      report += `❌ ERRORI (${result.errors.length}):\n`;
      result.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += `⚠️  AVVISI (${result.warnings.length}):\n`;
      result.warnings.forEach(warning => {
        report += `  - ${warning}\n`;
      });
      report += '\n';
    }
    
    if (result.errors.length === 0 && result.warnings.length === 0) {
      report += '✅ Nessun problema rilevato. I dati sono pronti per l\'export.\n';
    }
    
    return report;
  }
}

// Export function for use in components
export function validateExportData(data: ExportData): ValidationResult {
  return ExportValidator.quickValidate(data);
}
