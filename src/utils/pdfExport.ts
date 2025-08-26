import jsPDF from 'jspdf';
// Type definitions for PDF export

interface PDFExportOptions {
  filename?: string;
  darkMode?: boolean;
  includeCharts?: boolean;
  includeDetailedAnalysis?: boolean;
}

interface ExportData {
  assets: any;
  totals: any;
  netWorth: number;
  statistics: any;
  emergencyFundAccount: { section: string; id: number; name: string };
  formatCurrency: (amount: number) => string;
}

export class PDFExporter {
  private data: ExportData;
  private options: PDFExportOptions;
  private pdf: jsPDF;
  private pageHeight: number = 297; // A4 height in mm
  private pageWidth: number = 210; // A4 width in mm
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 6;

  constructor(data: ExportData, options: PDFExportOptions = {}) {
    this.data = data;
    this.options = {
      filename: `MangoMoney_Report_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.pdf`,
      darkMode: false,
      includeCharts: true,
      includeDetailedAnalysis: true,
      ...options
    };
    this.pdf = new jsPDF('p', 'mm', 'a4');
  }

  async exportToPDF(): Promise<void> {
    try {
      this.addHeader();
      this.addSummary();
      await this.addSections();
      
      if (this.options.includeDetailedAnalysis) {
        this.addDetailedAnalysis();
      }
      
      this.addFooter();
      this.pdf.save(this.options.filename!);
    } catch (error) {
      console.error('PDF Export Error:', error);
      throw new Error(`Errore durante l'esportazione PDF: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  private addHeader(): void {
    // Logo and title
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(5, 150, 105); // Green color
    this.pdf.text('MangoMoney', this.margin, this.currentY);
    
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(107, 114, 128); // Gray color
    this.pdf.text('Report Completo Patrimonio', this.margin, this.currentY + 10);
    
    // Date and time
    const currentDate = new Date().toLocaleDateString('it-IT');
    const currentTime = new Date().toLocaleTimeString('it-IT');
    this.pdf.setFontSize(10);
    this.pdf.text(`Generato il: ${currentDate} alle ${currentTime}`, this.margin, this.currentY + 18);
    
    // Line separator
    this.pdf.setDrawColor(5, 150, 105);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY + 25, this.pageWidth - this.margin, this.currentY + 25);
    
    this.currentY += 35;
  }

  private addSummary(): void {
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text('Riepilogo Generale', this.margin, this.currentY);
    this.currentY += 10;

    // Summary box
    const boxHeight = 40;
    this.pdf.setFillColor(248, 249, 250);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 'F');
    
    // Net worth
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(5, 150, 105);
    this.pdf.text('Patrimonio Netto:', this.margin + 10, this.currentY + 15);
    this.pdf.text(this.data.formatCurrency(this.data.netWorth), this.margin + 80, this.currentY + 15);
    
    // Total assets and debts
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(107, 114, 128);
    // 🎯 FIX ERRORE 4: Patrimonio Lordo = somma asset reali (non patrimonio netto + debiti)
    const totalAssets = this.data.totals.cash + this.data.totals.investments + 
                        this.data.totals.realEstate + this.data.totals.pensionFunds + 
                        this.data.totals.alternativeAssets;
    this.pdf.text(`Patrimonio Lordo: ${this.data.formatCurrency(totalAssets)}`, this.margin + 10, this.currentY + 25);
    this.pdf.text(`Debiti Totali: ${this.data.formatCurrency(Math.abs(this.data.totals.debts))}`, this.margin + 10, this.currentY + 32);
    
    this.currentY += boxHeight + 15;
  }

  private async addSections(): Promise<void> {
    const sections = {
      cash: 'Liquidità',
      investments: 'Investimenti',
      investmentPositions: 'Posizioni di Investimento',
      realEstate: 'Immobili',
      pensionFunds: 'Fondi Pensione',

      alternativeAssets: 'Beni Alternativi',
      debts: 'Debiti',
      transactions: 'Transazioni'
    };

    for (const [section, title] of Object.entries(sections)) {
      const sectionData = this.data.assets[section as keyof typeof this.data.assets];
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        await this.addSection(section, title, sectionData);
      }
    }
  }

  private async addSection(section: string, title: string, items: any[]): Promise<void> {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }

    // Section title
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;

    // Create table
    await this.addTable(section, items);
    
    this.currentY += 10;
  }

  private async addTable(section: string, items: any[]): Promise<void> {
    const tableWidth = this.pageWidth - 2 * this.margin;
    const colWidths = [50, 35, 60, 45]; // Name, Amount, Description, Notes
    const rowHeight = 8;
    const headerHeight = 10;

    // Table header
    this.pdf.setFillColor(243, 244, 246);
    this.pdf.rect(this.margin, this.currentY, tableWidth, headerHeight, 'F');
    
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(55, 65, 81);
    this.pdf.text('Nome', this.margin + 2, this.currentY + 7);
    this.pdf.text('Importo', this.margin + colWidths[0] + 2, this.currentY + 7);
    this.pdf.text('Descrizione', this.margin + colWidths[0] + colWidths[1] + 2, this.currentY + 7);
    this.pdf.text('Note', this.margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, this.currentY + 7);
    
    this.currentY += headerHeight;

    // Table rows
    let sectionTotal = 0;
    for (const item of items) {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 30) {
        this.pdf.addPage();
        this.currentY = this.margin;
        
        // Redraw header on new page
        this.pdf.setFillColor(243, 244, 246);
        this.pdf.rect(this.margin, this.currentY, tableWidth, headerHeight, 'F');
        this.pdf.setFontSize(9);
        this.pdf.setTextColor(55, 65, 81);
        this.pdf.text('Nome', this.margin + 2, this.currentY + 7);
        this.pdf.text('Importo', this.margin + colWidths[0] + 2, this.currentY + 7);
        this.pdf.text('Descrizione', this.margin + colWidths[0] + colWidths[1] + 2, this.currentY + 7);
        this.pdf.text('Note', this.margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, this.currentY + 7);
        this.currentY += headerHeight;
      }

      // Row background (alternating)
      const isEven = items.indexOf(item) % 2 === 0;
      if (isEven) {
        this.pdf.setFillColor(249, 250, 251);
        this.pdf.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');
      }

      // Row data
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(31, 41, 55);
      
      const itemValue = this.getItemValue(section, item);
      const isDebt = section === 'debts';
      
      // Name or Asset Type
      const displayName = section === 'transactions' 
        ? this.truncateText(item.assetType || 'N/A', colWidths[0] - 4)
        : this.truncateText(item.name || 'N/A', colWidths[0] - 4);
      this.pdf.text(displayName, this.margin + 2, this.currentY + 6);
      
      // Amount
      if (isDebt) {
        this.pdf.setTextColor(220, 38, 38);
      } else {
        this.pdf.setTextColor(5, 150, 105);
      }
      const amount = this.data.formatCurrency(isDebt ? Math.abs(itemValue) : itemValue);
      this.pdf.text(amount, this.margin + colWidths[0] + 2, this.currentY + 6);
      
      // Description
      this.pdf.setTextColor(31, 41, 55);
      const description = this.truncateText(item.description || '', colWidths[2] - 4);
      this.pdf.text(description, this.margin + colWidths[0] + colWidths[1] + 2, this.currentY + 6);
      
      // Notes
      const notes = this.truncateText(this.getItemNotes(section, item), colWidths[3] - 4);
      this.pdf.text(notes, this.margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, this.currentY + 6);
      
      sectionTotal += itemValue;
      this.currentY += rowHeight;
    }

    // Section total
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.rect(this.margin, this.currentY, tableWidth, rowHeight + 2, 'F');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(`Totale ${section === 'debts' ? 'Debiti' : 'Sezione'}:`, this.margin + 2, this.currentY + 7);
    if (section === 'debts') {
      this.pdf.setTextColor(220, 38, 38);
    } else {
      this.pdf.setTextColor(5, 150, 105);
    }
    this.pdf.text(this.data.formatCurrency(section === 'debts' ? Math.abs(sectionTotal) : sectionTotal), this.margin + colWidths[0] + 2, this.currentY + 7);
    
    this.currentY += rowHeight + 5;

    // Draw table borders
    this.pdf.setDrawColor(229, 231, 235);
    this.pdf.setLineWidth(0.1);
    
    // Vertical lines
    let x = this.margin;
    for (let i = 0; i <= colWidths.length; i++) {
      this.pdf.line(x, this.currentY - (items.length + 1) * rowHeight - headerHeight - 5, x, this.currentY - 5);
      if (i < colWidths.length) x += colWidths[i];
    }
    
    // Horizontal lines
    const tableStartY = this.currentY - (items.length + 1) * rowHeight - headerHeight - 5;
    this.pdf.line(this.margin, tableStartY, this.margin + tableWidth, tableStartY);
    this.pdf.line(this.margin, tableStartY + headerHeight, this.margin + tableWidth, tableStartY + headerHeight);
    this.pdf.line(this.margin, this.currentY - 5, this.margin + tableWidth, this.currentY - 5);
  }

  private getItemValue(section: string, item: any): number {
    if (section === 'realEstate') {
      return item.value || 0;
    }
    return item.amount || 0;
  }

  private getItemNotes(section: string, item: any): string {
    if (section === 'realEstate') {
      return item.address || item.notes || '';
    }
    if (section === 'cash') {
      const accountType = item.accountType === 'current' ? 'C.C.' : 
                         item.accountType === 'deposit' ? 'C.D.' : 'Contanti';
      const bollo = item.bollo && item.bollo > 0 ? ` - Bollo: ${this.data.formatCurrency(item.bollo)}` : '';
      return `${accountType}${bollo}`;
    }
    if (section === 'transactions') {
      return `${item.transactionType === 'purchase' ? 'Acquisto' : 'Vendita'} - ${item.quantity} unità`;
    }
    return item.notes || '';
  }

  private truncateText(text: string, maxWidth: number): string {
    const charWidth = 2.5; // Approximate character width in mm for font size 8
    const maxChars = Math.floor(maxWidth / charWidth);
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 3) + '...';
  }

  private addDetailedAnalysis(): void {
    if (this.currentY > this.pageHeight - 80) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }

    this.pdf.setFontSize(14);
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text('Analisi Dettagliata', this.margin, this.currentY);
    this.currentY += 15;

    // Asset allocation
    this.pdf.setFontSize(12);
    this.pdf.text('Allocazione Patrimonio:', this.margin, this.currentY);
    this.currentY += 10;

    const total = this.data.netWorth + Math.abs(this.data.totals.debts);
    if (total > 0) {
      const allocations = [
        { name: 'Liquidità', value: this.data.totals.cash, percentage: (this.data.totals.cash / total) * 100 },
        { name: 'Investimenti', value: this.data.totals.investments, percentage: (this.data.totals.investments / total) * 100 },
        { name: 'Immobili', value: this.data.totals.realEstate, percentage: (this.data.totals.realEstate / total) * 100 },
        { name: 'Fondi Pensione', value: this.data.totals.pensionFunds, percentage: (this.data.totals.pensionFunds / total) * 100 },
                { name: 'Beni Alternativi', value: this.data.totals.alternativeAssets,
          percentage: (this.data.totals.alternativeAssets / total) * 100 }
      ];

      this.pdf.setFontSize(9);
      allocations.forEach(allocation => {
        if (allocation.percentage > 0.1) {
          this.pdf.text(
            `${allocation.name}: ${this.data.formatCurrency(allocation.value)} (${allocation.percentage.toFixed(1)}%)`,
            this.margin + 5, this.currentY
          );
          this.currentY += 6;
        }
      });
    }

    this.currentY += 10;

    // Risk analysis (if available)
    if (this.data.statistics && this.data.statistics.riskScore !== undefined) {
      this.pdf.setFontSize(12);
      this.pdf.text('Analisi del Rischio:', this.margin, this.currentY);
      this.currentY += 8;
      
      this.pdf.setFontSize(9);
      this.pdf.text(`Punteggio di Rischio: ${this.data.statistics.riskScore.toFixed(1)}/10`, this.margin + 5, this.currentY);
      this.currentY += 6;
    }
  }

  private addFooter(): void {
    const totalPages = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(229, 231, 235);
      this.pdf.setLineWidth(0.1);
      this.pdf.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // Footer text
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(107, 114, 128);
      this.pdf.text(
        `MangoMoney Report - Pagina ${i} di ${totalPages}`,
        this.margin, this.pageHeight - 8
      );
      
      this.pdf.text(
        `Generato il ${new Date().toLocaleString('it-IT')}`,
        this.pageWidth - this.margin - 50, this.pageHeight - 8
      );
    }
  }
}

// Export function for use in components
export async function exportToPDF(
  data: ExportData,
  options: PDFExportOptions = {}
): Promise<void> {
  const exporter = new PDFExporter(data, options);
  await exporter.exportToPDF();
}
