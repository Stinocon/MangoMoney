import React from 'react';
import {
  // Navigation & Actions
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUpDown, X, Plus, Trash2, Edit, Check, Save,
  
  // UI & Feedback
  AlertCircle, AlertTriangle, CheckCircle, Info, HelpCircle,
  TrendingUp, TrendingDown, Lightbulb, Shield, Target,
  
  // Financial & Business
  DollarSign, CreditCard, Receipt, BarChart3, PieChart,
  Calculator, Home, Building, Wallet, PiggyBank,
  
  // Theme & Settings
  Moon, Sun, Settings, RefreshCw,
  
  // Status & Indicators
  Circle, Clock, Calendar, Star, Heart, Eye, EyeOff,
  
  // Data & Analytics
  Database, FileText, Download, Upload, Share2, Copy
} from 'lucide-react';

// ===== INTERFACE STANDARD UNIFICATA =====
export interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  variant?: string;
}

// ===== SISTEMA SIZE UNIFICATO =====
const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

// ===== MAPPATURA ICONE LUCIDE =====
const LUCIDE_ICONS: Record<string, React.ComponentType<any>> = {
  // Navigation & Actions
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-up-down': ArrowUpDown,
  'close': X,
  'plus': Plus,
  'trash': Trash2,
  'edit': Edit,
  'check': Check,
  'save': Save,
  
  // UI & Feedback
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  'info': Info,
  'help-circle': HelpCircle,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'lightbulb': Lightbulb,
  'shield': Shield,
  'target': Target,
  
  // Financial & Business
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  'receipt': Receipt,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  'calculator': Calculator,
  'home': Home,
  'building': Building,
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  
  // Theme & Settings
  'moon': Moon,
  'sun': Sun,
  'settings': Settings,
  'download': Download,
  'upload': Upload,
  'refresh-cw': RefreshCw,
  
  // Status & Indicators
  'circle': Circle,
  'clock': Clock,
  'calendar': Calendar,
  'star': Star,
  'heart': Heart,
  'eye': Eye,
  'eye-off': EyeOff,
  
  // Data & Analytics
  'database': Database,
  'file-text': FileText,
  'share-2': Share2,
  'copy': Copy
};

// ===== COMPONENTE SPINNER CUSTOM (non disponibile in lucide) =====
const CustomSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    className={`animate-spin ${className}`} 
    fill="none" 
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      strokeWidth="4"
      className="opacity-25"
    />
    <path 
      className="opacity-75"
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ===== COMPONENTE ICON UNIFICATO =====
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className = '', 
  direction,
  variant,
  ...props 
}) => {
  const sizeClass = sizeClasses[size];
  const baseClasses = `${sizeClass} ${className}`;
  
  // Handle direction variants for chevron icons
  const getDirectionalIcon = () => {
    if (name.startsWith('chevron-') && direction) {
      const directionalName = `chevron-${direction}`;
      const IconComponent = LUCIDE_ICONS[directionalName];
      if (IconComponent) {
        return <IconComponent className={baseClasses} {...props} />;
      }
    }
    return null;
  };
  
  // Handle trending icons with direction
  const getTrendingIcon = () => {
    if (name === 'trending' && direction) {
      const trendingName = `trending-${direction}`;
      const IconComponent = LUCIDE_ICONS[trendingName];
      if (IconComponent) {
        return <IconComponent className={baseClasses} {...props} />;
      }
    }
    return null;
  };
  
  // Try directional variants first
  const directionalIcon = getDirectionalIcon();
  if (directionalIcon) return directionalIcon;
  
  const trendingIcon = getTrendingIcon();
  if (trendingIcon) return trendingIcon;
  
  // Handle custom spinner
  if (name === 'spinner') {
    return <CustomSpinner className={baseClasses} />;
  }
  
  // Try lucide icon
  const LucideIcon = LUCIDE_ICONS[name];
  if (LucideIcon) {
    return <LucideIcon className={baseClasses} {...props} />;
  }
  
  // Fallback: circle with question mark
  console.warn(`Icon "${name}" not found in lucide-react or custom icons`);
  return (
    <div className={`${baseClasses} flex items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs font-bold`}>
      ?
    </div>
  );
};

// ===== EXPORT CONVENIENCE COMPONENTS =====
export const ChevronIcon: React.FC<Omit<IconProps, 'name'> & { direction: 'up' | 'down' | 'left' | 'right' }> = (props) => (
  <Icon name="chevron" {...props} />
);

export const TrendingIcon: React.FC<Omit<IconProps, 'name'> & { direction: 'up' | 'down' }> = (props) => (
  <Icon name="trending" {...props} />
);

export const CloseIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="close" {...props} />
);

export const HelpIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="help-circle" {...props} />
);

// ===== SMART INSIGHTS ICONS =====
export const SmartInsightsIcon: React.FC<{ 
  category: 'emergency' | 'swr' | 'debt' | 'size' | 'tax' | 'allocation';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ category, size = 'md', className = '' }) => {
  const iconMapping = {
    emergency: 'shield',
    swr: 'target',
    debt: 'credit-card',
    size: 'bar-chart-3',
    tax: 'receipt',
    allocation: 'pie-chart'
  };
  
  return <Icon name={iconMapping[category]} size={size} className={className} />;
};

// ===== SEVERITY ICONS =====
export const SeverityIcon: React.FC<{ 
  severity: 'critical' | 'warning' | 'positive' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ severity, size = 'md', className = '' }) => {
  const iconMapping = {
    critical: 'alert-circle',
    warning: 'alert-triangle',
    positive: 'check-circle',
    info: 'info'
  };
  
  return <Icon name={iconMapping[severity]} size={size} className={className} />;
};
