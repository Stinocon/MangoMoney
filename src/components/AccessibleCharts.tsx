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
    diversificationScore: number;
  };
  previousData?: {
    totalValue: number;
    performance: number;
  };
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  portfolioData,
  previousData
}) => {
  const insights = generateInsights(portfolioData, previousData);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'positive': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return 'ℹ️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          <span className="text-2xl">📊</span>
          <p className="mt-2">Il tuo portfolio è equilibrato!</p>
          <p className="text-sm">Continua a monitorare regolarmente.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span aria-hidden="true">💡</span>
          Insight Automatici
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Analisi intelligente del tuo portfolio
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg ${getSeverityColor(insight.severity)}`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">
                {getSeverityIcon(insight.severity)}
              </span>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {insight.title}
                </h4>
                
                <p className="text-sm text-gray-700 mt-1">
                  {insight.description}
                </p>
                
                {insight.actionable && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                    <strong>Suggerimento:</strong> {insight.actionable}
                  </div>
                )}
                
                {insight.value !== undefined && (
                  <div className="mt-2 text-lg font-semibold">
                    {insight.type === 'performance' && `${insight.value > 0 ? '+' : ''}${insight.value.toFixed(1)}%`}
                    {insight.type === 'risk' && `${insight.value.toFixed(1)}/10`}
                    {insight.type === 'emergency' && `${insight.value.toFixed(1)} mesi`}
                    {insight.type === 'allocation' && `${insight.value.toFixed(1)}%`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ===== INSIGHTS GENERATION LOGIC =====
export const generateInsights = (
  current: SmartInsightsProps['portfolioData'],
  previous?: SmartInsightsProps['previousData']
): Insight[] => {
  const insights: Insight[] = [];

  // Performance insights
  if (previous && current.performance !== previous.performance) {
    const change = current.performance - previous.performance;
    
    if (change > 5) {
      insights.push({
        type: 'performance',
        severity: 'positive',
        title: 'Performance Eccellente',
        description: `Il tuo portfolio ha guadagnato ${change.toFixed(1)}% rispetto al periodo precedente`,
        actionable: 'Considera di ribilanciare per mantenere la diversificazione',
        value: change,
        trend: 'up'
      });
    } else if (change < -10) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        title: 'Performance in Calo',
        description: `Il portfolio ha perso ${Math.abs(change).toFixed(1)}% rispetto al periodo precedente`,
        actionable: 'Rivedi la strategia di investimento e considera la diversificazione',
        value: change,
        trend: 'down'
      });
    }
  }

  // Risk insights
  if (current.riskScore > 8) {
    insights.push({
      type: 'risk',
      severity: 'critical',
      title: 'Portfolio Ad Alto Rischio',
      description: 'Il livello di rischio del tuo portfolio è molto elevato',
      actionable: 'Considera di aggiungere asset più conservativi come obbligazioni o depositi',
      value: current.riskScore
    });
  } else if (current.riskScore > 6) {
    insights.push({
      type: 'risk',
      severity: 'warning',
      title: 'Rischio Moderato-Alto',
      description: 'Il portfolio presenta un rischio superiore alla media',
      actionable: 'Valuta di diversificare con asset meno volatili',
      value: current.riskScore
    });
  }

  // Emergency fund insights
  if (current.emergencyFundMonths < 3) {
    insights.push({
      type: 'emergency',
      severity: 'critical',
      title: 'Fondo di Emergenza Insufficiente',
      description: `Il fondo copre solo ${current.emergencyFundMonths.toFixed(1)} mesi di spese`,
      actionable: 'Aumenta la liquidità disponibile per raggiungere almeno 6 mesi di spese',
      value: current.emergencyFundMonths
    });
  } else if (current.emergencyFundMonths < 6) {
    insights.push({
      type: 'emergency',
      severity: 'warning',
      title: 'Fondo di Emergenza da Potenziare',
      description: `Il fondo copre ${current.emergencyFundMonths.toFixed(1)} mesi di spese`,
      actionable: 'Considera di aumentare la riserva fino a 6 mesi di spese',
      value: current.emergencyFundMonths
    });
  }

  // Diversification insights
  if (current.diversificationScore < 50) {
    insights.push({
      type: 'allocation',
      severity: 'warning',
      title: 'Diversificazione Limitata',
      description: 'Il portfolio è concentrato in poche categorie di asset',
      actionable: 'Diversifica investendo in settori e tipologie di asset differenti',
      value: current.diversificationScore
    });
  }

  // Positive insights
  if (current.emergencyFundMonths >= 6 && current.riskScore <= 6 && current.diversificationScore >= 70) {
    insights.push({
      type: 'allocation',
      severity: 'positive',
      title: 'Portfolio Equilibrato',
      description: 'Il tuo portfolio presenta un buon equilibrio tra rischio, liquidità e diversificazione',
      actionable: 'Continua a monitorare e ribilanciare periodicamente'
    });
  }

  return insights;
};
