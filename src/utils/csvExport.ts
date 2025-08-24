interface CSVExportOptions {
  filename?: string;
  includeSettings?: boolean;
  includeTransactions?: boolean;
  encoding?: 'UTF-8' | 'ISO-8859-1';
  separator?: ',' | ';' | '\t';
  decimalSeparator?: '.' | ',';
}

interface ExportData {
  assets: any;
  totals: any;
  statistics: any;
  emergencyFundAccount: { section: string; id: number; name: string };
  formatCurrency: (amount: number) => string;
  settings?: any;
}

export class CSVExporter {
  private data: ExportData;
  private options: CSVExportOptions;

  constructor(data: ExportData, options: CSVExportOptions = {}) {
    this.data = data;
    this.options = {
      filename: `MangoMoney_Report_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.csv`,
      includeSettings: true,
      includeTransactions: true,
      encoding: 'UTF-8',
      separator: ',',
      decimalSeparator: '.',
      ...options
    };
  }

  async exportToCSV(): Promise<void> {
    try {
      const csvData = this.prepareCSVData();
      const csvContent = this.generateCSVContent(csvData);
      this.downloadCSV(csvContent);
    } catch (error) {
      console.error('CSV Export Error:', error);
      throw new Error(`Errore durante l'esportazione CSV: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  private prepareCSVData(): any[] {
    const allData: any[] = [];
    
    // Add regular assets
    Object.entries(this.data.assets).forEach(([section, items]) => {
      if (!Array.isArray(items) || items.length === 0) return;
      
      if (section === 'realEstate') {
        const properties = items as any[];
        properties.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            nome: item.name || '',
            importo: item.value || 0,
            descrizione: item.description || '',
            indirizzo: item.address || '',
            tipo: item.type === 'primary' ? 'Residenza Principale' : 'Proprietà Secondaria',
            fondo_emergenza: 'No',
            id: item.id,
            note: item.notes || '',
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      } else if (section === 'investmentPositions') {
        const positions = items as any[];
        positions.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            nome: item.name || '',
            importo: item.amount || 0,
            descrizione: item.description || '',
            ticker: item.ticker || '',
            isin: item.isin || '',
            data_acquisto: item.purchaseDate || '',
            tipo: 'Posizione Globale',
            fondo_emergenza: 'No',
            id: item.id,
            note: item.notes || '',
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      } else if (section === 'transactions' && this.options.includeTransactions) {
        const transactions = items as any[];
        transactions.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            tipo_asset: item.assetType || '',
            importo: item.amount || 0,
            descrizione: item.description || '',
            ticker: item.ticker || '',
            isin: item.isin || '',
            tipo_transazione: item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita',
            quantita: item.quantity || 0,
            commissioni: item.commissions || 0,
            data: item.date || '',
            collegato_a_asset: item.linkedToAsset || '',
            tipo: 'Transazione',
            fondo_emergenza: 'No',
            id: item.id,
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      } else if (section === 'investments') {
        const assetItems = items as any[];
        assetItems.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            nome: item.name || '',
            importo: item.amount || 0,
            descrizione: item.description || '',
            ticker: item.sector || '',
            isin: item.isin || '',
            quantita: item.quantity || 0,
            commissioni: item.fees || 0,
            prezzo_medio: item.avgPrice || 0,
            collegato_a: item.linkedToGlobalPosition || '',
            tipo: 'Asset Individuale',
            fondo_emergenza: this.data.emergencyFundAccount.section === section && this.data.emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || '',
            prezzo_attuale: item.currentPrice || 0,
            data_aggiornamento_prezzo: item.lastPriceUpdate || '',
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      } else if (section === 'cash') {
        const assetItems = items as any[];
        assetItems.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            nome: item.name || '',
            importo: item.amount || 0,
            descrizione: item.description || '',
            tipo_conto: item.accountType || '',
            bollo: item.bollo || 0,
            tipo: 'Asset',
            fondo_emergenza: this.data.emergencyFundAccount.section === section && this.data.emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || '',
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      } else if (section === 'alternativeAssets') {
        const assetItems = items as any[];
        assetItems.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            nome: item.name || '',
            importo: item.amount || 0,
            descrizione: item.description || '',
            tipo_asset: item.assetType || '',
            tipo: 'Asset Alternativo',
            fondo_emergenza: this.data.emergencyFundAccount.section === section && this.data.emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || '',
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      } else {
        const assetItems = items as any[];
        assetItems.forEach((item: any) => {
          allData.push({
            categoria: this.getSectionName(section),
            nome: item.name || '',
            importo: item.amount || 0,
            descrizione: item.description || '',
            tipo: 'Asset',
            fondo_emergenza: this.data.emergencyFundAccount.section === section && this.data.emergencyFundAccount.id === item.id ? 'Sì' : 'No',
            id: item.id,
            note: item.notes || '',
            data_creazione: new Date().toISOString().split('T')[0]
          });
        });
      }
    });

    // Add settings if enabled
    if (this.options.includeSettings && this.data.settings) {
      const settingsData = this.prepareSettingsData();
      allData.push(...settingsData);
    }

    return allData;
  }

  private prepareSettingsData(): any[] {
    const settings = this.data.settings || {};
    return [
      {
        categoria: 'Impostazioni',
        nome: 'Capital Gains Tax Rate',
        importo: settings.capitalGainsTaxRate || 0,
        descrizione: 'Tasso imposta plusvalenze (%)',
        tipo: 'Setting',
        fondo_emergenza: 'No',
        id: 0,
        note: '',
        data_creazione: new Date().toISOString().split('T')[0]
      },
      {
        categoria: 'Impostazioni',
        nome: 'Current Account Stamp Duty',
        importo: settings.currentAccountStampDuty || 0,
        descrizione: 'Imposta di bollo conto corrente (€)',
        tipo: 'Setting',
        fondo_emergenza: 'No',
        id: 0,
        note: '',
        data_creazione: new Date().toISOString().split('T')[0]
      },
      {
        categoria: 'Impostazioni',
        nome: 'SWR Rate',
        importo: settings.swrRate || 0,
        descrizione: 'Tasso Safe Withdrawal Rate (%)',
        tipo: 'Setting',
        fondo_emergenza: 'No',
        id: 0,
        note: '',
        data_creazione: new Date().toISOString().split('T')[0]
      },
      {
        categoria: 'Impostazioni',
        nome: 'Inflation Rate',
        importo: settings.inflationRate || 0,
        descrizione: 'Tasso di inflazione (%)',
        tipo: 'Setting',
        fondo_emergenza: 'No',
        id: 0,
        note: '',
        data_creazione: new Date().toISOString().split('T')[0]
      },
      {
        categoria: 'Impostazioni',
        nome: 'Monthly Expenses',
        importo: settings.monthlyExpenses || 0,
        descrizione: 'Spese mensili (€)',
        tipo: 'Setting',
        fondo_emergenza: 'No',
        id: 0,
        note: '',
        data_creazione: new Date().toISOString().split('T')[0]
      }
    ];
  }

  private getSectionName(section: string): string {
    const sections: { [key: string]: string } = {
      cash: 'Liquidità',
      investments: 'Investimenti',
      investmentPositions: 'Posizioni di Investimento',
      realEstate: 'Immobili',
      pensionFunds: 'Fondi Pensione',
      otherAccounts: 'Altri Conti',
      alternativeAssets: 'Beni Alternativi',
      debts: 'Debiti',
      transactions: 'Transazioni'
    };
    return sections[section] || section;
  }

  private generateCSVContent(data: any[]): string {
    if (data.length === 0) {
      throw new Error('Nessun dato da esportare');
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys).sort();
    
    // Create header row
    const headerRow = headers.map(header => this.escapeCSVValue(header)).join(this.options.separator);
    
    // Create data rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return this.escapeCSVValue(this.formatValue(value));
      }).join(this.options.separator);
    });

    // Combine header and data
    const csvContent = [headerRow, ...dataRows].join('\n');
    
    // Add BOM for UTF-8 encoding
    if (this.options.encoding === 'UTF-8') {
      return '\ufeff' + csvContent;
    }
    
    return csvContent;
  }

  private escapeCSVValue(value: string): string {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '""';
    }

    const stringValue = String(value);
    
    // Check if value contains separator, newline, or quote
    const needsQuoting = stringValue.includes(this.options.separator!) || 
                        stringValue.includes('\n') || 
                        stringValue.includes('\r') || 
                        stringValue.includes('"');

    if (needsQuoting) {
      // Escape quotes by doubling them
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }

    return stringValue;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number') {
      // Format numbers with proper decimal separator
      return value.toString().replace('.', this.options.decimalSeparator || '.');
    }

    if (typeof value === 'boolean') {
      return value ? 'Sì' : 'No';
    }

    return String(value);
  }

  private downloadCSV(csvContent: string): void {
    const mimeType = this.options.encoding === 'UTF-8' 
      ? 'text/csv;charset=utf-8' 
      : 'text/csv;charset=iso-8859-1';

    const dataBlob = new Blob([csvContent], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = this.options.filename!;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Utility method to validate CSV data
  validateCSVData(data: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('I dati non sono in formato array');
      return { isValid: false, errors };
    }

    if (data.length === 0) {
      errors.push('Nessun dato da esportare');
      return { isValid: false, errors };
    }

    // Check for required fields
    const requiredFields = ['categoria', 'nome', 'importo'];
    const firstRow = data[0];
    
    requiredFields.forEach(field => {
      if (!(field in firstRow)) {
        errors.push(`Campo richiesto mancante: ${field}`);
      }
    });

    // Validate data types
    data.forEach((row, index) => {
      if (typeof row.importo !== 'number' && isNaN(Number(row.importo))) {
        errors.push(`Riga ${index + 1}: importo non valido`);
      }
      
      if (!row.nome || row.nome.trim() === '') {
        errors.push(`Riga ${index + 1}: nome mancante`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export function for use in components
export async function exportToCSV(
  data: ExportData,
  options: CSVExportOptions = {}
): Promise<void> {
  const exporter = new CSVExporter(data, options);
  await exporter.exportToCSV();
}
