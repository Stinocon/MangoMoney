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

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Card, Collapsible } from './AccessibleComponents';


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
  type: 'performance' | 'risk' | 'emergency' | 'allocation' | 'tax' | 'swr' | 'debt' | 'size';
  severity: 'positive' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  actionable?: string;
  value?: number;
  trend?: 'up' | 'down' | 'neutral';
  category?: 'emergency' | 'swr' | 'debt' | 'size' | 'tax' | 'allocation';
}

interface SmartInsightsProps {
  portfolioData: {
    totalValue: number;
    emergencyFundMonths: number;
    cashAccounts?: number;
    debtToAssetRatio?: number;
    unrealizedGains?: number;
    realEstateValue?: number;
    alternativeAssetsValue?: number;
    pensionFundsValue?: number;
  };
  previousData?: {
    totalValue: number;
    performance: number;
  };
  insightsConfig?: {
    emergency?: boolean;
    swr?: boolean;
    debt?: boolean;
    size?: boolean;
    tax?: boolean;
    allocation?: boolean;
  };
  darkMode?: boolean;
  userSettings?: {
    emergencyFundOptimalMonths?: number;
    emergencyFundAdequateMonths?: number;
    swrRate?: number;
    inflationRate?: number;
    monthlyExpenses?: number;
  };
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  portfolioData,
  previousData,
  insightsConfig,
  darkMode,
  userSettings
}) => {
  const insights = generateInsights(portfolioData, previousData, insightsConfig, userSettings);

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
                      {insight.type === 'swr' && `${insight.value.toFixed(0)}%`}
                      {insight.type === 'debt' && `${insight.value.toFixed(0)}%`}
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
  category: 'emergency' | 'swr' | 'debt' | 'size' | 'tax' | 'allocation';
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
    swr?: boolean;
    debt?: boolean;
    size?: boolean;
    tax?: boolean;
    allocation?: boolean;
  },
  settings?: {
    emergencyFundOptimalMonths?: number;
    emergencyFundAdequateMonths?: number;
    swrRate?: number;
    inflationRate?: number;
    monthlyExpenses?: number;
  }
): Insight[] => {
  const insights: SmartInsight[] = [];
  
  // ✅ INSIGHT 1: EMERGENCY FUND - Usa settings configurabili
  if (config?.emergency !== false && current.emergencyFundMonths >= 0) {
    const optimalMonths = settings?.emergencyFundOptimalMonths ?? 6;
    const adequateMonths = settings?.emergencyFundAdequateMonths ?? 3;
    const currentMonths = current.emergencyFundMonths;
    
    if (currentMonths < adequateMonths) {
      insights.push({
        type: 'critical',
        category: 'emergency',
        message: `Fondo emergenza insufficiente: ${currentMonths.toFixed(1)} mesi (minimo: ${adequateMonths})`,
        action: 'Incrementa liquidità designata per raggiungere almeno 3 mesi di spese',
        priority: 10,
        value: currentMonths
      });
    } else if (currentMonths < optimalMonths) {
      insights.push({
        type: 'warning', 
        category: 'emergency',
        message: `Fondo emergenza adeguato: ${currentMonths.toFixed(1)} mesi (obiettivo: ${optimalMonths})`,
        action: 'Considera di raggiungere 6 mesi per maggiore sicurezza',
        priority: 6,
        value: currentMonths
      });
    } else if (currentMonths <= optimalMonths * 2) {
      insights.push({
        type: 'success',
        category: 'emergency', 
        message: `Fondo emergenza ottimale: ${currentMonths.toFixed(1)} mesi di copertura`,
        action: 'Mantieni questo livello e aggiorna con inflazione',
        priority: 2,
        value: currentMonths
      });
    } else {
      insights.push({
        type: 'info',
        category: 'emergency',
        message: `Fondo emergenza sovradimensionato: ${currentMonths.toFixed(1)} mesi`,
        action: 'Considera di investire l\'eccesso per maggior rendimento',
        priority: 4,
        value: currentMonths
      });
    }
  }
  
  // ✅ INSIGHT 2: SWR SUSTAINABILITY  
  if (config?.swr !== false && (settings?.monthlyExpenses ?? 0) > 0) {
    const withdrawableAssets = (current.cashAccounts ?? 0) + (current.totalValue ?? 0) * 0.7; // Stima conservativa
    const swrRate = settings?.swrRate ?? 4.0;
    const inflationRate = settings?.inflationRate ?? 2.0;
    
    // Aggiustamento inflazione basato su ricerca
    const inflationAdjustment = Math.max(0, (inflationRate - 2.0) * 0.3);
    const adjustedSWR = Math.max(2.5, swrRate - inflationAdjustment);
    
    const monthlyWithdrawal = (withdrawableAssets * adjustedSWR / 100) / 12;
    const coverage = (monthlyWithdrawal / (settings?.monthlyExpenses ?? 1)) * 100;
    
    if (coverage < 80) {
      insights.push({
        type: 'critical',
        category: 'swr',
        message: `SWR insufficiente: copre ${coverage.toFixed(0)}% delle spese mensili`,
        action: 'Aumenta risparmio o riduci spese per indipendenza finanziaria',
        priority: 9,
        value: coverage
      });
    } else if (coverage < 100) {
      insights.push({
        type: 'warning',
        category: 'swr', 
        message: `SWR quasi sufficiente: copre ${coverage.toFixed(0)}% delle spese`,
        action: 'Ultimo sforzo per raggiungere l\'indipendenza finanziaria',
        priority: 7,
        value: coverage
      });
    } else {
      insights.push({
        type: 'success',
        category: 'swr',
        message: `SWR raggiunto: copre ${coverage.toFixed(0)}% delle spese mensili`,
        action: 'Hai raggiunto l\'indipendenza finanziaria teorica',
        priority: 1,
        value: coverage
      });
    }
    
    // Warning inflazione se rilevante
    if (inflationAdjustment > 0) {
      insights.push({
        type: 'warning',
        category: 'swr',
        message: `Inflazione elevata (${inflationRate.toFixed(1)}%) riduce SWR del ${inflationAdjustment.toFixed(1)}%`,
        action: 'Monitora inflazione e aggiusta strategia se necessario',
        priority: 5
      });
    }
  }
  
  // ✅ INSIGHT 3: DEBT-TO-ASSET RATIO
  if (config?.debt !== false && (current.debtToAssetRatio ?? 0) > 0) {
    const ratio = (current.debtToAssetRatio ?? 0) * 100;
    
    if (ratio > 70) {
      insights.push({
        type: 'critical',
        category: 'debt',
        message: `Debiti eccessivi: ${ratio.toFixed(0)}% del patrimonio`,
        action: 'Priorità assoluta: riduzione debiti prima di investire',
        priority: 10,
        value: ratio
      });
    } else if (ratio > 50) {
      insights.push({
        type: 'warning',
        category: 'debt', 
        message: `Debiti elevati: ${ratio.toFixed(0)}% del patrimonio`,
        action: 'Considera strategia di riduzione debiti accelerata',
        priority: 8,
        value: ratio
      });
    } else if (ratio > 30) {
      insights.push({
        type: 'info',
        category: 'debt',
        message: `Debiti moderati: ${ratio.toFixed(0)}% del patrimonio`,
        action: 'Bilancia tra riduzione debiti e investimenti',
        priority: 3,
        value: ratio
      });
    }
  }
  
  // ✅ INSIGHT 4: PORTFOLIO SIZE MATURITY
  if (config?.size !== false) {
    const totalValue = current.totalValue ?? 0;
    
    if (totalValue < 10000) {
      insights.push({
        type: 'info',
        category: 'size',
        message: 'Portfolio in fase iniziale: concentrati su risparmio costante',
        action: 'Priorità: emergency fund e risparmio regolare',
        priority: 3
      });
    } else if (totalValue < 100000) {
      insights.push({
        type: 'info', 
        category: 'size',
        message: 'Portfolio in crescita: SWR ancora prematuro',
        action: 'Continua accumulo prima di pensare a prelievi sistematici',
        priority: 2
      });
    } else if (totalValue > 1000000) {
      insights.push({
        type: 'success',
        category: 'size', 
        message: 'Portfolio maturo: considera consulenza professionale',
        action: 'Valuta strategie avanzate e ottimizzazione fiscale',
        priority: 1
      });
    }
  }
  
  // ✅ INSIGHT 5: TAX OPTIMIZATION  
  if (config?.tax !== false) {
    const currentMonth = new Date().getMonth() + 1;
    
    // Tax loss harvesting in dicembre
    if (currentMonth === 12 && (current.unrealizedGains ?? 0) > 0) {
      insights.push({
        type: 'info',
        category: 'tax',
        message: `Plusvalenze non realizzate: ${(current.unrealizedGains ?? 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`,
        action: 'Valuta loss harvesting entro 31 dicembre per ottimizzazione fiscale',
        priority: 6
      });
    }
    
    // Bollo conti deposito
    if ((current.cashAccounts ?? 0) > 5000) {
      insights.push({
        type: 'info',
        category: 'tax', 
        message: 'Liquidità >€5K: bollo 0.2% su conti deposito/titoli',
        action: 'Verifica applicazione bollo e considera ottimizzazioni',
        priority: 3
      });
    }
  }
  
  // ⚠️ WARNING GENERICI per sostitutire risk score fake
  const totalAssets = (current.totalValue ?? 0);
  const investmentsRatio = totalAssets > 0 ? ((current.totalValue ?? 0) - (current.cashAccounts ?? 0)) / totalAssets : 0;
  
  if (investmentsRatio > 0.95) {
    insights.push({
      type: 'warning',
      category: 'allocation',
      message: 'Concentrazione eccessiva in investimenti (>95%)',
      action: 'Mantieni almeno 5% in liquidità per flessibilità',
      priority: 7
    });
  } else if (investmentsRatio < 0.1 && totalAssets > 50000) {
    insights.push({
      type: 'info', 
      category: 'allocation',
      message: 'Portfolio molto liquido (<10% investito)',
      action: 'Considera investimenti per crescita long-term dopo emergency fund',
      priority: 4
    });
  }
  
  // Sort by priority (highest first)
  insights.sort((a, b) => b.priority - a.priority);
  
  // Convert to legacy format for compatibility
  return insights.map(insight => ({
    type: insight.category as 'performance' | 'risk' | 'emergency' | 'allocation' | 'tax',
    severity: (insight.type === 'success' ? 'positive' : 
              insight.type === 'critical' ? 'critical' :
              insight.type === 'warning' ? 'warning' : 'info') as 'positive' | 'warning' | 'critical' | 'info',
    title: insight.message.split(':')[0],
    description: insight.message,
    actionable: insight.action || '',
    value: insight.value || 0,
    trend: undefined
  }));
};
