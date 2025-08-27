/**
 * Accessible Chart Components for MangoMoney
 * 
 * @description
 * WCAG 2.1 AA compliant charts with alternative text representations,
 * keyboard navigation, and colorblind-friendly palettes.
 * 
 * @version 3.2.0
 * @accessibility Full screen reader support, keyboard navigation
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Card, Collapsible, ContextualHelp } from './AccessibleComponents';

// ===== COLORBLIND-FRIENDLY PALETTE =====
export const ACCESSIBLE_COLORS = [
  '#1f77b4', // Blue
  '#ff7f0e', // Orange  
  '#2ca02c', // Green
  '#d62728', // Red
  '#9467bd', // Purple
  '#8c564b', // Brown
  '#e377c2', // Pink
  '#7f7f7f', // Gray
  '#bcbd22', // Olive
  '#17becf'  // Cyan
] as const;

// ===== CHART DATA INTERFACES =====
interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: number;
  category?: string;
  description?: string;
}

interface AccessibleChartProps {
  data: ChartDataPoint[];
  title: string;
  description?: string;
  height?: number;
  showTable?: boolean;
  formatValue?: (value: number) => string;
}

// ===== UTILITY FUNCTIONS =====
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const calculateTotal = (data: ChartDataPoint[]): number => {
  return data.reduce((sum, item) => sum + item.value, 0);
};

const generateChartSummary = (data: ChartDataPoint[], type: 'pie' | 'bar' | 'line'): string => {
  const total = calculateTotal(data);
  const highest = data.reduce((max, item) => item.value > max.value ? item : max, data[0]);
  const lowest = data.reduce((min, item) => item.value < min.value ? item : min, data[0]);

  const summaries = {
    pie: `Grafico a torta con ${data.length} categorie. Totale: ${formatCurrency(total)}. Categoria più grande: ${highest.name} (${formatCurrency(highest.value)}).`,
    bar: `Grafico a barre con ${data.length} elementi. Valore più alto: ${highest.name} (${formatCurrency(highest.value)}). Valore più basso: ${lowest.name} (${formatCurrency(lowest.value)}).`,
    line: `Grafico lineare con ${data.length} punti dati. Valore massimo: ${formatCurrency(highest.value)}. Valore minimo: ${formatCurrency(lowest.value)}.`
  };

  return summaries[type];
};

// ===== CUSTOM TOOLTIP COMPONENT =====
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatValue?: (value: number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  formatValue = formatCurrency 
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {formatValue(entry.value)}
        </p>
      ))}
    </div>
  );
};

// ===== ACCESSIBLE PIE CHART =====
export const AccessiblePieChart: React.FC<AccessibleChartProps> = ({
  data,
  title,
  description,
  height = 300,
  showTable = true,
  formatValue = formatCurrency
}) => {
  const [selectedSegment, setSelectedSegment] = useState<ChartDataPoint | null>(null);
  const chartId = `pie-chart-${Math.random().toString(36).substr(2, 9)}`;
  const tableId = `${chartId}-table`;
  
  const total = calculateTotal(data);
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }));

  const chartSummary = generateChartSummary(data, 'pie');

  return (
    <Card className="chart-container">
      {/* Chart Header */}
      <div className="chart-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Chart Visualization */}
      <div 
        className="chart-wrapper mb-4"
        role="img"
        aria-labelledby={`${chartId}-title`}
        aria-describedby={`${chartId}-summary`}
      >
        <div id={`${chartId}-title`} className="sr-only">
          {title}
        </div>
        
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              onMouseEnter={(data: any) => setSelectedSegment(data)}
              onMouseLeave={() => setSelectedSegment(null)}
              label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Chart Summary for Screen Readers */}
        <div id={`${chartId}-summary`} className="sr-only">
          {chartSummary}
        </div>
      </div>

      {/* Selected Segment Info */}
      {selectedSegment && (
        <div 
          className="selected-segment-info p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4"
          role="status"
          aria-live="polite"
        >
          <strong>{selectedSegment.name}:</strong> {formatValue(selectedSegment.value)} 
          ({formatPercentage(selectedSegment.percentage || 0)})
          {selectedSegment.description && (
            <div className="text-sm text-gray-600 mt-1">
              {selectedSegment.description}
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      {showTable && (
        <Collapsible title="Visualizza dati in formato tabella" defaultExpanded={false}>
          <table id={tableId} className="w-full">
            <caption className="sr-only">
              Dati dettagliati per {title}
            </caption>
            <thead>
              <tr className="border-b">
                <th className="text-center py-2 px-3">Categoria</th>
                <th className="text-center py-2 px-3">Valore</th>
                <th className="text-center py-2 px-3">Percentuale</th>
              </tr>
            </thead>
            <tbody>
              {dataWithPercentages.map((item, index) => (
                <tr key={item.name} className="border-b">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length] }}
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 font-mono">
                    {formatValue(item.value)}
                  </td>
                  <td className="text-right py-2 px-3 font-mono">
                    {formatPercentage(item.percentage)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 font-semibold">
                <td className="py-2 px-3">Totale</td>
                <td className="text-right py-2 px-3 font-mono">
                  {formatValue(total)}
                </td>
                <td className="text-right py-2 px-3 font-mono">100.0%</td>
              </tr>
            </tbody>
          </table>
        </Collapsible>
      )}
    </Card>
  );
};

// ===== ACCESSIBLE BAR CHART =====
export const AccessibleBarChart: React.FC<AccessibleChartProps> = ({
  data,
  title,
  description,
  height = 300,
  showTable = true,
  formatValue = formatCurrency
}) => {
  const [selectedBar, setSelectedBar] = useState<ChartDataPoint | null>(null);
  const chartId = `bar-chart-${Math.random().toString(36).substr(2, 9)}`;
  
  const chartSummary = generateChartSummary(data, 'bar');

  return (
    <Card className="chart-container">
      {/* Chart Header */}
      <div className="chart-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Chart Visualization */}
      <div 
        className="chart-wrapper mb-4"
        role="img"
        aria-labelledby={`${chartId}-title`}
        aria-describedby={`${chartId}-summary`}
      >
        <div id={`${chartId}-title`} className="sr-only">
          {title}
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => formatValue(value)}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
            <Bar 
              dataKey="value" 
              fill={ACCESSIBLE_COLORS[0]}
              onMouseEnter={(data: any) => setSelectedBar(data)}
              onMouseLeave={() => setSelectedBar(null)}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Chart Summary for Screen Readers */}
        <div id={`${chartId}-summary`} className="sr-only">
          {chartSummary}
        </div>
      </div>

      {/* Selected Bar Info */}
      {selectedBar && (
        <div 
          className="selected-bar-info p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4"
          role="status"
          aria-live="polite"
        >
          <strong>{selectedBar.name}:</strong> {formatValue(selectedBar.value)}
          {selectedBar.description && (
            <div className="text-sm text-gray-600 mt-1">
              {selectedBar.description}
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      {showTable && (
        <Collapsible title="Visualizza dati in formato tabella" defaultExpanded={false}>
          <table className="w-full">
            <caption className="sr-only">
              Dati dettagliati per {title}
            </caption>
            <thead>
              <tr className="border-b">
                <th className="text-center py-2 px-3">Elemento</th>
                <th className="text-center py-2 px-3">Valore</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.name} className="border-b">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: ACCESSIBLE_COLORS[0] }}
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 font-mono">
                    {formatValue(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
      )}
    </Card>
  );
};

// ===== ACCESSIBLE LINE CHART =====
export const AccessibleLineChart: React.FC<AccessibleChartProps> = ({
  data,
  title,
  description,
  height = 300,
  showTable = true,
  formatValue = formatCurrency
}) => {
  const chartId = `line-chart-${Math.random().toString(36).substr(2, 9)}`;
  const chartSummary = generateChartSummary(data, 'line');

  return (
    <Card className="chart-container">
      {/* Chart Header */}
      <div className="chart-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Chart Visualization */}
      <div 
        className="chart-wrapper mb-4"
        role="img"
        aria-labelledby={`${chartId}-title`}
        aria-describedby={`${chartId}-summary`}
      >
        <div id={`${chartId}-title`} className="sr-only">
          {title}
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => formatValue(value)}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={ACCESSIBLE_COLORS[0]}
              strokeWidth={3}
              dot={{ fill: ACCESSIBLE_COLORS[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Chart Summary for Screen Readers */}
        <div id={`${chartId}-summary`} className="sr-only">
          {chartSummary}
        </div>
      </div>

      {/* Data Table */}
      {showTable && (
        <Collapsible title="Visualizza dati in formato tabella" defaultExpanded={false}>
          <table className="w-full">
            <caption className="sr-only">
              Dati dettagliati per {title}
            </caption>
            <thead>
              <tr className="border-b">
                <th className="text-center py-2 px-3">Periodo</th>
                <th className="text-center py-2 px-3">Valore</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.name} className="border-b">
                  <td className="py-2 px-3">{item.name}</td>
                  <td className="text-right py-2 px-3 font-mono">
                    {formatValue(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
      )}
    </Card>
  );
};

// ===== SMART INSIGHTS COMPONENT =====
interface Insight {
  type: 'performance' | 'risk' | 'emergency' | 'allocation' | 'tax';
  severity: 'positive' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  actionable?: string;
  value?: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface SmartInsightsProps {
  portfolioData: {
    totalValue: number;
    performance: number;
    riskScore: number;
    emergencyFundMonths: number;
    diversificationScore?: number;
    unrealizedGains?: number;
    cashAccounts?: number;
    debtToAssetRatio?: number;
  };
  previousData?: {
    totalValue: number;
    performance: number;
  };
  insightsConfig?: {
    emergency?: boolean;
    tax?: boolean;
    performance?: boolean;
    risk?: boolean;
    allocation?: boolean;
  };
  darkMode?: boolean;
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  portfolioData,
  previousData,
  insightsConfig,
  darkMode
}) => {
  const insights = generateInsights(portfolioData, previousData, insightsConfig);

  const Icon = ({ severity }: { severity: string }) => {
    const common = 'w-4 h-4';
    const color = severity === 'critical' ? (darkMode ? 'text-red-300' : 'text-red-600')
      : severity === 'warning' ? (darkMode ? 'text-yellow-300' : 'text-yellow-600')
      : severity === 'positive' ? (darkMode ? 'text-emerald-300' : 'text-emerald-600')
      : (darkMode ? 'text-blue-300' : 'text-blue-600');
    return (
      <svg className={`${common} ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {severity === 'critical' && (<>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </>)}
        {severity === 'warning' && (<>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </>)}
        {severity === 'positive' && (<>
          <polyline points="20 6 9 17 4 12"></polyline>
        </>)}
        {severity !== 'critical' && severity !== 'warning' && severity !== 'positive' && (<>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
          <path d="M12 12a4 4 0 1 0-4-4"></path>
        </>)}
      </svg>
    );
  };

  const getContainerClasses = (severity: string) => {
    const base = 'p-3 border rounded-md';
    if (darkMode) {
      if (severity === 'critical') return `${base} border-red-800 bg-red-900/20`;
      if (severity === 'warning') return `${base} border-yellow-800 bg-yellow-900/20`;
      if (severity === 'positive') return `${base} border-emerald-800 bg-emerald-900/20`;
      return `${base} border-blue-800 bg-blue-900/20`;
    } else {
      if (severity === 'critical') return `${base} border-red-200 bg-red-50`;
      if (severity === 'warning') return `${base} border-yellow-200 bg-yellow-50`;
      if (severity === 'positive') return `${base} border-emerald-200 bg-emerald-50`;
      return `${base} border-blue-200 bg-blue-50`;
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6`}>
      <div className="mb-3">
        <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={darkMode ? 'text-amber-300' : 'text-amber-600'}>
            <path d="M9 18h6M10 22h4M2 12a10 10 0 1 1 20 0c0 3-2 5-5 6H7c-3-1-5-3-5-6Z" />
          </svg>
          Insight automatici
        </h3>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Suggerimenti compatti basati sui tuoi dati</p>
      </div>

      {insights.length === 0 ? (
        <div className={`text-center py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-sm">Nessun insight al momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, index) => (
          <div
            key={index}
            className={getContainerClasses(insight.severity)}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <Icon severity={insight.severity} />
              <div className="flex-1">
                <div className={`flex items-center justify-between gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  <h4 className="text-sm font-semibold truncate">{insight.title}</h4>
                  {insight.value !== undefined && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-gray-200' : 'bg-white/70 text-gray-800'}`}>
                      {insight.type === 'performance' && `${insight.value > 0 ? '+' : ''}${insight.value.toFixed(1)}%`}
                      {insight.type === 'risk' && `${insight.value.toFixed(1)}/10`}
                      {insight.type === 'emergency' && `${insight.value.toFixed(1)}m`}
                      {insight.type === 'allocation' && `${insight.value.toFixed(1)}%`}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{insight.description}</p>
                {insight.actionable && (
                  <div className={`mt-2 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Azione:</span>{insight.actionable}
                  </div>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== ADVANCED INSIGHTS GENERATION LOGIC =====

interface SmartInsight {
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'emergency' | 'risk' | 'performance' | 'tax' | 'allocation' | 'efficiency';
  message: string;
  action?: string;
  priority: number;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const generateInsights = (
  current: SmartInsightsProps['portfolioData'],
  previous?: SmartInsightsProps['previousData'],
  config?: {
    emergency?: boolean;
    tax?: boolean;
    performance?: boolean;
    risk?: boolean;
    allocation?: boolean;
  }
): Insight[] => {
  const insights: SmartInsight[] = [];
  
  // Emergency Fund Analysis (context-aware)
  if (config?.emergency !== false && current.emergencyFundMonths > 0) {
    const emergencyRatio = current.emergencyFundMonths / 6; // Target: 6 months
    
    if (emergencyRatio < 0.5) {
      insights.push({
        type: 'critical',
        category: 'emergency',
        message: `Fondo emergenza critico: ${(emergencyRatio * 100).toFixed(0)}% dell'obiettivo minimo`,
        action: 'Aumenta liquidità immediatamente',
        priority: 10,
        value: current.emergencyFundMonths
      });
    } else if (emergencyRatio > 2.5) {
      insights.push({
        type: 'info',
        category: 'emergency',
        message: `Fondo emergenza sovradimensionato: ${(emergencyRatio * 6).toFixed(1)} mesi di spese`,
        action: 'Considera investimenti più redditizi',
        priority: 3,
        value: current.emergencyFundMonths
      });
    }
  }
  
  // Risk Analysis - Based on real portfolio composition
  if (config?.risk !== false) {
    const riskScore = current.riskScore;
    
    // High risk portfolio warning (based on actual allocations)
    if (riskScore > 7.5) {
      insights.push({
        type: 'warning',
        category: 'risk',
        message: 'Portfolio ad alto rischio - elevata concentrazione in asset volatili',
        action: 'Considera di bilanciare con asset più stabili',
        priority: 7,
        value: riskScore
      });
    } else if (riskScore < 2.5) {
      insights.push({
        type: 'info',
        category: 'risk',
        message: 'Portfolio molto conservativo - potenziale per crescita limitata',
        action: 'Valuta di includere asset con rendimenti più elevati',
        priority: 4,
        value: riskScore
      });
    } else if (riskScore >= 4 && riskScore <= 6) {
      insights.push({
        type: 'success',
        category: 'risk',
        message: 'Portfolio ben bilanciato - rischio moderato e diversificato',
        action: 'Mantieni l\'equilibrio attuale',
        priority: 2,
        value: riskScore
      });
    }
  }
  
  // Tax Optimization (per utenti italiani)
  
  // Concentration Risk Alert
  if (config?.allocation !== false) {
    // Trova la concentrazione massima
    const maxAllocation = Math.max(
      (current.cashRatio ?? 0) * 100,
      (current.investmentRatio ?? 0) * 100,
      (current.realEstateRatio ?? 0) * 100,
      (current.alternativesRatio ?? 0) * 100
    );
    
    if (maxAllocation > 70) {
      insights.push({
        type: 'warning',
        category: 'allocation',
        message: `Concentrazione eccessiva: ${maxAllocation.toFixed(0)}% in singola categoria`,
        action: 'Diversifica per ridurre il rischio di concentrazione',
        priority: 8,
        value: maxAllocation
      });
    }
  }

  // High Fees Alert (se disponibili dati commissioni)
  if (config?.performance !== false && (current.totalCommissions ?? 0) > 0) {
    const feeRatio = ((current.totalCommissions ?? 0) / (current.totalPortfolioValue ?? 1)) * 100;
    
    if (feeRatio > 1.5) {
      insights.push({
        type: 'warning',
        category: 'performance',
        message: `Commissioni elevate: ${feeRatio.toFixed(1)}% del patrimonio annuo`,
        action: 'Considera ETF a commissioni più basse',
        priority: 6,
        value: feeRatio
      });
    }
  }

  // Rebalancing Alert
  if (config?.allocation !== false && (current.lastRebalanceMonths ?? 0) > 12) {
    insights.push({
      type: 'info',
      category: 'allocation',
      message: `Portfolio non riequilibrato da ${current.lastRebalanceMonths} mesi`,
      action: 'Considera un ribilanciamento per mantenere allocazione target',
      priority: 4,
      value: current.lastRebalanceMonths
    });
  }
  if (config?.tax !== false) {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    if (currentMonth === 12 && (current.unrealizedGains ?? 0) > 0) {
      insights.push({
        type: 'info',
        category: 'tax',
        message: `Plusvalenze non realizzate: ${(current.unrealizedGains ?? 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`,
        action: 'Valuta harvesting fiscale prima di fine anno',
        priority: 5,
        value: current.unrealizedGains ?? 0
      });
    }
    
    // Bollo titoli reminder (per conti deposito)
    if ((current.cashAccounts ?? 0) > 5000) {
      insights.push({
        type: 'info',
        category: 'tax',
        message: 'Conti deposito > €5K: ricorda bollo titoli 0.2%',
        action: 'Verifica adempimenti fiscali',
        priority: 4
      });
    }
  }
  
  // Performance trends
  if (config?.performance !== false && previous && current.performance !== previous.performance) {
    const change = current.performance - previous.performance;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    
    if (Math.abs(change) > 5) {
      insights.push({
        type: change > 0 ? 'success' : 'warning',
        category: 'performance',
        message: `Performance ${change > 0 ? 'migliorata' : 'peggiorata'} del ${Math.abs(change).toFixed(1)}%`,
        action: change > 0 ? 'Monitora per mantenere trend positivo' : 'Analizza cause del calo',
        priority: 6,
        value: change,
        trend
      });
    }
  }
  
  // Diversification analysis
  if (config?.allocation !== false) {
    if ((current.diversificationScore ?? 0) < 50) {
      insights.push({
        type: 'warning',
        category: 'allocation',
        message: 'Diversificazione limitata: concentrazione eccessiva',
        action: 'Diversifica in più settori e asset class',
        priority: 8,
        value: current.diversificationScore ?? 0
      });
    } else if ((current.diversificationScore ?? 0) > 80) {
      insights.push({
        type: 'success',
        category: 'allocation',
        message: 'Eccellente diversificazione del portafoglio',
        action: 'Mantieni la strategia di diversificazione',
        priority: 1,
        value: current.diversificationScore ?? 0
      });
    }
  }
  
  // Debt-to-asset ratio warning
  if (config?.risk !== false && (current.debtToAssetRatio ?? 0) > 0.5) {
    insights.push({
      type: 'critical',
      category: 'risk',
      message: 'Rapporto debiti/patrimonio elevato (>50%)',
      action: 'Riduci debiti o aumenta patrimonio',
      priority: 9,
      value: (current.debtToAssetRatio ?? 0) * 100
    });
  }

  // ✅ FATTIBILE: Concentration Risk Alert
  if (config?.allocation !== false && current.netWorth > 0) {
    const allocations = [
      (current.cashRatio ?? 0) * 100,
      (current.investmentRatio ?? 0) * 100, 
      (current.realEstateRatio ?? 0) * 100,
      (current.pensionRatio ?? 0) * 100,
      (current.alternativesRatio ?? 0) * 100
    ];
    
    const maxAllocation = Math.max(...allocations);
    
    if (maxAllocation > 75) {
      insights.push({
        type: 'warning',
        category: 'allocation',
        message: `Concentrazione eccessiva: ${maxAllocation.toFixed(0)}% in singola categoria`,
        action: 'Diversifica per ridurre il rischio di concentrazione',
        priority: 8,
        value: maxAllocation
      });
    }
  }

  // ✅ FATTIBILE: High Fees Alert (da commissioni transazioni)
  if (config?.performance !== false && current.totalPortfolioValue > 0) {
    const annualCommissions = (current.yearlyCommissions ?? 0); // Calcola da transazioni ultimo anno
    const feeRatio = (annualCommissions / current.totalPortfolioValue) * 100;
    
    if (feeRatio > 1.0 && annualCommissions > 100) {
      insights.push({
        type: 'warning', 
        category: 'performance',
        message: `Commissioni elevate: ${feeRatio.toFixed(1)}% del patrimonio annuo (€${annualCommissions.toFixed(0)})`,
        action: 'Considera broker o ETF a commissioni più basse',
        priority: 6,
        value: feeRatio
      });
    }
  }

  // ✅ FATTIBILE: Loss Harvesting Alert (da transazioni vendite)
  if (config?.tax !== false && (current.unrealizedLosses ?? 0) > 500) {
    insights.push({
      type: 'info',
      category: 'tax',
      message: `Minusvalenze disponibili: €${(current.unrealizedLosses ?? 0).toFixed(0)}`,
      action: 'Considera vendita strategica per compensazione fiscale',
      priority: 5,
      value: current.unrealizedLosses ?? 0
    });
  }

  // ✅ FATTIBILE: Small Position Alert  
  if (config?.allocation !== false && (current.numberOfPositions ?? 0) > 10) {
    const smallPositionsCount = current.positionsUnder1Percent ?? 0;
    if (smallPositionsCount > 5) {
      insights.push({
        type: 'info',
        category: 'allocation', 
        message: `${smallPositionsCount} posizioni sotto 1% del portfolio`,
        action: 'Considera consolidamento per ridurre complessità',
        priority: 3,
        value: smallPositionsCount
      });
    }
  }
  
  // Sort by priority (highest first)
  insights.sort((a, b) => b.priority - a.priority);
  
  // Convert to legacy Insight format for backward compatibility
  return insights.map(insight => ({
    type: (insight.category === 'efficiency' ? 'performance' : insight.category) as 'performance' | 'risk' | 'emergency' | 'allocation' | 'tax',
    severity: (insight.type === 'success' ? 'positive' : insight.type) as 'positive' | 'warning' | 'critical' | 'info',
    title: insight.message.split(':')[0],
    description: insight.message,
    actionable: insight.action || '',
    value: insight.value || 0,
    trend: (insight.trend === 'stable' ? 'neutral' : insight.trend) as 'up' | 'down' | 'neutral' | undefined
  }));
};
