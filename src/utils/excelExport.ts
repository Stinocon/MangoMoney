import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  filename?: string;
  includeCharts?: boolean;
  includeDetailedAnalysis?: boolean;
  includeTransactions?: boolean;
}

interface ExportData {
  assets: any;
  totals: any;
  statistics: any;
  emergencyFundAccount: { section: string; id: number; name: string };
  formatCurrency: (amount: number) => string;
}

export class ExcelExporter {
  private data: ExportData;
  private options: ExcelExportOptions;
  private workbook: XLSX.WorkBook;

  constructor(data: ExportData, options: ExcelExportOptions = {}) {
    this.data = data;
    this.options = {
      filename: `MangoMoney_Report_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.xlsx`,
      includeCharts: true,
      includeDetailedAnalysis: true,
      includeTransactions: true,
      ...options
    };
    this.workbook = XLSX.utils.book_new();
  }

  async exportToExcel(): Promise<void> {
    try {
      // Create summary sheet
      this.createSummarySheet();
      
      // Create assets sheets
      this.createAssetsSheets();
      
      // Create transactions sheet if enabled
      if (this.options.includeTransactions) {
        this.createTransactionsSheet();
      }
      
      // Create analysis sheet if enabled
      if (this.options.includeDetailedAnalysis) {
        this.createAnalysisSheet();
      }
      
      // Save the workbook
      XLSX.writeFile(this.workbook, this.options.filename!);
    } catch (error) {
      console.error('Excel Export Error:', error);
      throw new Error(`Errore durante l'esportazione Excel: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  private createSummarySheet(): void {
    const summaryData = [
      ['MangoMoney - Report Completo Patrimonio'],
      [''],
      ['Data Generazione:', new Date().toLocaleString('it-IT')],
      [''],
      ['RIEPILOGO GENERALE'],
      [''],
      ['Patrimonio Netto', this.data.formatCurrency(this.data.totals.total)],
      // 🎯 FIX ERRORE 4: Patrimonio Lordo = somma asset reali (non patrimonio netto + debiti)
      ['Patrimonio Lordo', this.data.formatCurrency(this.data.totals.cash + this.data.totals.investments + 
                                                    this.data.totals.realEstate + this.data.totals.pensionFunds + 
                                                    this.data.totals.otherAccounts + this.data.totals.alternativeAssets)],
      ['Debiti Totali', this.data.formatCurrency(Math.abs(this.data.totals.debts))],
      [''],
      ['ALLOCAZIONE PATRIMONIO'],
      [''],
      ['Liquidità', this.data.formatCurrency(this.data.totals.cash)],
      ['Investimenti', this.data.formatCurrency(this.data.totals.investments)],
      ['Immobili', this.data.formatCurrency(this.data.totals.realEstate)],
      ['Fondi Pensione', this.data.formatCurrency(this.data.totals.pensionFunds)],
      ['Altri Asset', this.data.formatCurrency(this.data.totals.otherAccounts + this.data.totals.alternativeAssets)],
      [''],
      ['STATISTICHE'],
      [''],
      ['Punteggio di Rischio', this.data.statistics?.riskScore ? `${this.data.statistics.riskScore.toFixed(1)}/10` : 'N/A'],
      ['SWR Mensile', this.data.statistics?.monthlySWR ? this.data.formatCurrency(this.data.statistics.monthlySWR) : 'N/A'],
      ['CAGR Portfolio', this.data.statistics?.portfolioCAGR ? `${this.data.statistics.portfolioCAGR.toFixed(2)}%` : 'N/A']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Apply formatting
    this.applySummaryFormatting(worksheet);
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Riepilogo');
  }

  private createAssetsSheets(): void {
    const sections = {
      cash: 'Liquidità',
      investments: 'Investimenti',
      investmentPositions: 'Posizioni di Investimento',
      realEstate: 'Immobili',
      pensionFunds: 'Fondi Pensione',
      otherAccounts: 'Altri Conti',
      alternativeAssets: 'Beni Alternativi',
      debts: 'Debiti'
    };

    for (const [section, title] of Object.entries(sections)) {
      const sectionData = this.data.assets[section];
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        this.createAssetSheet(section, title, sectionData);
      }
    }
  }

  private createAssetSheet(section: string, title: string, items: any[]): void {
    // Prepare headers based on section type
    let headers: string[] = [];
    let data: any[][] = [];

    if (section === 'realEstate') {
      headers = ['Nome', 'Valore', 'Descrizione', 'Indirizzo', 'Tipo', 'Note'];
      data = items.map(item => [
        item.name || 'N/A',
        item.value || 0,
        item.description || '',
        item.address || '',
        item.type === 'primary' ? 'Primaria' : 'Secondaria',
        item.notes || ''
      ]);
    } else if (section === 'investmentPositions') {
      headers = ['Nome', 'Importo', 'Descrizione', 'Ticker', 'ISIN', 'Data Acquisto', 'Note'];
      data = items.map(item => [
        item.name || 'N/A',
        item.amount || 0,
        item.description || '',
        item.ticker || '',
        item.isin || '',
        item.purchaseDate || '',
        item.notes || ''
      ]);
    } else if (section === 'cash') {
      headers = ['Nome', 'Importo', 'Descrizione', 'Tipo Conto', 'Bollo', 'Note'];
      data = items.map(item => [
        item.name || 'N/A',
        item.amount || 0,
        item.description || '',
        item.accountType === 'current' ? 'Conto Corrente' : 
        item.accountType === 'deposit' ? 'Conto Deposito' : 'Contanti',
        item.bollo || 0,
        item.notes || ''
      ]);
    } else if (section === 'alternativeAssets') {
      headers = ['Nome', 'Importo', 'Descrizione', 'Tipo Asset', 'Note'];
      data = items.map(item => [
        item.name || 'N/A',
        item.amount || 0,
        item.description || '',
        item.assetType || '',
        item.notes || ''
      ]);
    } else {
      headers = ['Nome', 'Importo', 'Descrizione', 'Note'];
      data = items.map(item => [
        item.name || 'N/A',
        item.amount || 0,
        item.description || '',
        item.notes || ''
      ]);
    }

    // Add total row
    const totalAmount = items.reduce((sum: number, item: any) => {
      const value = section === 'realEstate' ? item.value : item.amount;
      return sum + (value || 0);
    }, 0);

    data.push(['TOTALE', totalAmount, '', '', '', '']);

    // Create worksheet
    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Apply formatting
    this.applyAssetSheetFormatting(worksheet, section);
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, title);
  }

  private createTransactionsSheet(): void {
    const transactions = this.data.assets.transactions;
    if (!Array.isArray(transactions) || transactions.length === 0) return;

    const headers = ['Tipo Asset', 'Importo', 'Descrizione', 'Ticker', 'ISIN', 'Tipo', 'Quantità', 'Commissioni', 'Data', 'Note'];
    const data = transactions.map(item => [
      item.assetType || 'N/A',
      item.amount || 0,
      item.description || '',
      item.ticker || '',
      item.isin || '',
      item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita',
      item.quantity || 0,
      item.commissions || 0,
      item.date || '',
      item.notes || ''
    ]);

    // Add total row
    const totalAmount = transactions.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    data.push(['TOTALE', totalAmount, '', '', '', '', '', '', '', '']);

    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Apply formatting
    this.applyTransactionSheetFormatting(worksheet);
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Transazioni');
  }

  private createAnalysisSheet(): void {
    const analysisData = [
      ['ANALISI DETTAGLIATA'],
      [''],
      ['ALLOCAZIONE PERCENTUALE'],
      [''],
    ];

    const total = this.data.totals.total + Math.abs(this.data.totals.debts);
    if (total > 0) {
      const allocations = [
        ['Liquidità', this.data.totals.cash, (this.data.totals.cash / total) * 100],
        ['Investimenti', this.data.totals.investments, (this.data.totals.investments / total) * 100],
        ['Immobili', this.data.totals.realEstate, (this.data.totals.realEstate / total) * 100],
        ['Fondi Pensione', this.data.totals.pensionFunds, (this.data.totals.pensionFunds / total) * 100],
        ['Altri Asset', this.data.totals.otherAccounts + this.data.totals.alternativeAssets, 
         ((this.data.totals.otherAccounts + this.data.totals.alternativeAssets) / total) * 100]
      ];

      analysisData.push(['Categoria', 'Importo', 'Percentuale']);
      allocations.forEach(([name, amount, percentage]) => {
        if (percentage > 0.1) {
          analysisData.push([name, this.data.formatCurrency(amount), `${percentage.toFixed(1)}%`]);
        }
      });
    }

    analysisData.push(['']);
    analysisData.push(['METRICHE DI PERFORMANCE']);
    analysisData.push(['']);
    analysisData.push(['Metrica', 'Valore']);
    analysisData.push(['Punteggio di Rischio', this.data.statistics?.riskScore ? `${this.data.statistics.riskScore.toFixed(1)}/10` : 'N/A']);
    analysisData.push(['SWR Mensile', this.data.statistics?.monthlySWR ? this.data.formatCurrency(this.data.statistics.monthlySWR) : 'N/A']);
    analysisData.push(['CAGR Portfolio', this.data.statistics?.portfolioCAGR ? `${this.data.statistics.portfolioCAGR.toFixed(2)}%` : 'N/A']);

    const worksheet = XLSX.utils.aoa_to_sheet(analysisData);
    this.applyAnalysisSheetFormatting(worksheet);
    
    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Analisi');
  }

  private applySummaryFormatting(worksheet: XLSX.WorkSheet): void {
    // Title formatting
    worksheet['A1'] = { v: 'MangoMoney - Report Completo Patrimonio', s: { font: { bold: true, size: 16 } } };
    
    // Section headers
    worksheet['A5'] = { v: 'RIEPILOGO GENERALE', s: { font: { bold: true, size: 14 } } };
    worksheet['A11'] = { v: 'ALLOCAZIONE PATRIMONIO', s: { font: { bold: true, size: 14 } } };
    worksheet['A19'] = { v: 'STATISTICHE', s: { font: { bold: true, size: 14 } } };

    // Currency formatting for amounts
    const currencyColumns = ['B7', 'B8', 'B9', 'B14', 'B15', 'B16', 'B17'];
    currencyColumns.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = { numFmt: '€#,##0.00' };
      }
    });
  }

  private applyAssetSheetFormatting(worksheet: XLSX.WorkSheet, section: string): void {
    // Header formatting
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { 
          font: { bold: true }, 
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Amount column formatting
    const amountCol = 1; // Second column (B)
    const dataRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let row = 1; row <= dataRange.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: amountCol });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { 
          numFmt: '€#,##0.00',
          font: { bold: row === dataRange.e.r } // Bold for total row
        };
      }
    }

    // Total row formatting
    const totalRow = dataRange.e.r;
    for (let col = 0; col <= dataRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRow, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { 
          font: { bold: true },
          fill: { fgColor: { rgb: "E6E6E6" } }
        };
      }
    }
  }

  private applyTransactionSheetFormatting(worksheet: XLSX.WorkSheet): void {
    // Header formatting
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { 
          font: { bold: true }, 
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Amount and quantity columns formatting
    const amountCol = 1; // Amount column (B)
    const quantityCol = 6; // Quantity column (G)
    const commissionsCol = 7; // Commissions column (H)
    const dataRange = XLSX.utils.decode_range(worksheet['!ref']!);
    
    for (let row = 1; row <= dataRange.e.r; row++) {
      // Amount formatting
      const amountCell = XLSX.utils.encode_cell({ r: row, c: amountCol });
      if (worksheet[amountCell]) {
        worksheet[amountCell].s = { numFmt: '€#,##0.00' };
      }
      
      // Quantity formatting
      const quantityCell = XLSX.utils.encode_cell({ r: row, c: quantityCol });
      if (worksheet[quantityCell]) {
        worksheet[quantityCell].s = { numFmt: '#,##0.00' };
      }
      
      // Commissions formatting
      const commissionsCell = XLSX.utils.encode_cell({ r: row, c: commissionsCol });
      if (worksheet[commissionsCell]) {
        worksheet[commissionsCell].s = { numFmt: '€#,##0.00' };
      }
    }

    // Total row formatting
    const totalRow = dataRange.e.r;
    for (let col = 0; col <= dataRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRow, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { 
          font: { bold: true },
          fill: { fgColor: { rgb: "E6E6E6" } }
        };
      }
    }
  }

  private applyAnalysisSheetFormatting(worksheet: XLSX.WorkSheet): void {
    // Title formatting
    worksheet['A1'] = { v: 'ANALISI DETTAGLIATA', s: { font: { bold: true, size: 16 } } };
    
    // Section headers
    worksheet['A4'] = { v: 'ALLOCAZIONE PERCENTUALE', s: { font: { bold: true, size: 14 } } };
    worksheet['A12'] = { v: 'METRICHE DI PERFORMANCE', s: { font: { bold: true, size: 14 } } };

    // Currency and percentage formatting
    const dataRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let row = 0; row <= dataRange.e.r; row++) {
      for (let col = 0; col <= dataRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          const value = worksheet[cellAddress].v;
          if (typeof value === 'string' && value.includes('€')) {
            worksheet[cellAddress].s = { numFmt: '€#,##0.00' };
          } else if (typeof value === 'string' && value.includes('%')) {
            worksheet[cellAddress].s = { numFmt: '0.0%' };
          }
        }
      }
    }
  }
}

// Export function for use in components
export async function exportToExcel(
  data: ExportData,
  options: ExcelExportOptions = {}
): Promise<void> {
  const exporter = new ExcelExporter(data, options);
  await exporter.exportToExcel();
}
