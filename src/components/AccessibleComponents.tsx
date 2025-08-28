/**
 * Accessible UI Components for MangoMoney
 * 
 * @description
 * WCAG 2.1 AA compliant components with proper ARIA support,
 * keyboard navigation, and screen reader optimization.
 * 
 * @version 3.2.0
 * @compliance WCAG 2.1 AA, Mobile-first responsive
 */

import React, { useState, useRef, useEffect, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { Icon, ChevronIcon, CloseIcon, HelpIcon, TrendingIcon } from './IconSystem';

// ===== BUTTON COMPONENT =====
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn touch-target focus-visible';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Spinner 
          className="mr-2" 
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          aria-hidden="true"
        />
      )}
      {icon && !loading && (
        <span className="mr-2" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {loading && <span className="sr-only">Caricamento in corso...</span>}
    </button>
  );
};

// ===== INPUT COMPONENT =====
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  icon,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  
  return (
    <div className="form-group">
      <label 
        htmlFor={inputId} 
        className={`form-label ${required ? 'required' : ''}`}
      >
        {label}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}
        
        <input
          id={inputId}
          className={`form-control ${icon ? 'pl-10' : ''} ${error ? 'error' : ''} ${className}`}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
      </div>
      
      {helperText && (
        <div id={helperId} className="form-help">
          {helperText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// ===== CARD COMPONENT =====
interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'base' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  shadow = 'sm',
  className = ''
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    base: 'shadow',
    lg: 'shadow-lg'
  };

  return (
    <div className={`card ${shadowClasses[shadow]} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="card-header flex justify-between items-start">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className={`card-body ${paddingClasses[padding]}`}>
        {children}
      </div>
    </div>
  );
};

// ===== RESPONSIVE TABLE COMPONENT =====
interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => ReactNode;
}

interface ResponsiveTableProps {
  columns: TableColumn[];
  data: any[];
  caption?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  emptyMessage?: string;
  mobileBreakpoint?: boolean;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  caption,
  sortBy,
  sortDirection,
  onSort,
  emptyMessage = 'Nessun dato disponibile',
  mobileBreakpoint = true
}) => {
  const tableClass = mobileBreakpoint ? 'responsive-table responsive-table-mobile' : 'responsive-table';

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={tableClass}>
      <table role="table">
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width }}
                className={`text-${column.align || 'left'}`}
                aria-sort={
                  sortBy === column.key 
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : column.sortable ? 'none' : undefined
                }
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold text-secondary hover:text-primary focus-visible"
                    onClick={() => onSort?.(column.key)}
                    aria-label={`Ordina per ${column.label}`}
                  >
                    {column.label}
                    <SortIcon 
                      direction={sortBy === column.key ? sortDirection : undefined}
                      className="w-4 h-4"
                    />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => {
                const value = row[column.key];
                const content = column.render ? column.render(value, row) : value;
                
                return (
                  <td
                    key={column.key}
                    className={`text-${column.align || 'left'}`}
                    data-label={column.label} // For mobile stacked layout
                  >
                    {colIndex === 0 ? (
                      <th scope="row" className="font-medium">
                        {content}
                      </th>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ===== COLLAPSIBLE COMPONENT =====
interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
  icon?: ReactNode;
  onToggle?: (expanded: boolean) => void;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  children,
  defaultExpanded = false,
  badge,
  icon,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentId = `collapsible-${Math.random().toString(36).substr(2, 9)}`;

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus-visible rounded-t-lg"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-gray-400" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="font-medium text-primary">{title}</span>
          {badge && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        <ChevronIcon 
          direction={isExpanded ? 'up' : 'down'}
          className="w-5 h-5 text-gray-400"
          aria-hidden="true"
        />
      </button>
      
      <div
        id={contentId}
        className={`transition-all duration-200 ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
        aria-hidden={!isExpanded}
      >
        <div className="px-6 py-4 border-t border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===== MODAL COMPONENT =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-screen overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id={titleId} className="text-xl font-semibold text-primary">
            {title}
          </h2>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 focus-visible rounded"
            onClick={onClose}
            aria-label="Chiudi modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===== TOOLTIP COMPONENT =====
interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const triggerProps = {
    'aria-describedby': isVisible ? tooltipId : undefined,
    ...(trigger === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip
    }),
    ...(trigger === 'focus' && {
      onFocus: showTooltip,
      onBlur: hideTooltip
    }),
    ...(trigger === 'click' && {
      onClick: () => setIsVisible(!isVisible)
    })
  };

  return (
    <div className="relative inline-block">
      <div {...triggerProps}>
        {children}
      </div>
      
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-tooltip px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg ${
            placement === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
            placement === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
            placement === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
            'left-full ml-2 top-1/2 transform -translate-y-1/2'
          }`}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              placement === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
              placement === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
              placement === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' :
              'right-full -mr-1 top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// ===== SKELETON COMPONENT =====
interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  lines = 1
}) => {
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-label="Caricamento contenuto">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 rounded"
            style={{ 
              width: index === lines - 1 ? '75%' : width,
              height 
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
      aria-label="Caricamento contenuto"
      aria-hidden="true"
    />
  );
};

// ===== CONTEXTUAL HELP COMPONENT =====
interface ContextualHelpProps {
  term: string;
  children: ReactNode;
  explanation: string;
  learnMoreUrl?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  term,
  children,
  explanation,
  learnMoreUrl
}) => {
  return (
    <Tooltip
      content={
        <div className="max-w-xs">
          <div className="font-semibold mb-1">{term}</div>
          <div className="text-sm opacity-90">{explanation}</div>
          {learnMoreUrl && (
            <a 
              href={learnMoreUrl}
              className="text-blue-300 hover:text-blue-200 text-xs block mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scopri di più →
            </a>
          )}
        </div>
      }
      trigger="hover"
    >
      <button 
        type="button"
        className="inline-flex items-center gap-1 text-primary hover:text-primary-700 focus-visible"
        aria-label={`Spiegazione di ${term}`}
      >
        {children}
        <HelpIcon className="w-4 h-4" />
      </button>
    </Tooltip>
  );
};

// ===== METRIC CARD COMPONENT =====
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  primary?: boolean;
  icon?: ReactNode;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  size = 'md',
  primary = false,
  icon,
  description
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const valueClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-secondary';
    }
  };

  return (
    <Card 
      className={`${primary ? 'ring-2 ring-primary-200' : ''}`}
      padding="none"
    >
      <div className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <span className="text-primary" aria-hidden="true">
                  {icon}
                </span>
              )}
              <h3 className="text-sm font-medium text-secondary">{title}</h3>
            </div>
            
            <div className={`font-bold text-primary ${valueClasses[size]} mb-1`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {change && (
              <div className={`text-sm flex items-center gap-1 ${getTrendColor(trend)}`}>
                {trend && trend !== 'neutral' && (
                  <TrendIcon 
                    direction={trend} 
                    className="w-4 h-4" 
                    aria-hidden="true"
                  />
                )}
                <span>
                  {change.value > 0 ? '+' : ''}{change.value.toFixed(2)}% {change.period}
                </span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-tertiary mt-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ===== NAVIGATION COMPONENT =====
interface NavigationItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: ReactNode;
  badge?: string;
  onClick?: () => void;
}

interface NavigationProps {
  items: NavigationItem[];
  variant?: 'tabs' | 'pills' | 'sidebar';
  orientation?: 'horizontal' | 'vertical';
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  variant = 'tabs',
  orientation = 'horizontal'
}) => {
  const baseClasses = 'flex';
  const orientationClasses = orientation === 'horizontal' ? 'flex-row' : 'flex-col';
  const variantClasses = {
    tabs: 'border-b border-gray-200',
    pills: 'bg-gray-100 rounded-lg p-1',
    sidebar: 'space-y-1'
  };

  return (
    <nav 
      className={`${baseClasses} ${orientationClasses} ${variantClasses[variant]}`}
      role="navigation"
      aria-label="Navigazione principale"
    >
      {items.map((item, index) => {
        const Element = item.href ? 'a' : 'button';
        const elementProps = item.href 
          ? { href: item.href }
          : { type: 'button' as const, onClick: item.onClick };

        return (
          <Element
            key={index}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
              focus-visible rounded
              ${item.active 
                ? 'text-primary border-b-2 border-primary bg-primary-50' 
                : 'text-secondary hover:text-primary hover:bg-gray-50'
              }
              ${variant === 'pills' ? 'rounded-md' : ''}
            `}
            aria-current={item.active ? 'page' : undefined}
            {...elementProps}
          >
            {item.icon && (
              <span aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                {item.badge}
              </span>
            )}
          </Element>
        );
      })}
    </nav>
  );
};

// ===== ICON COMPONENTS =====
// Manteniamo solo Spinner che è custom (non disponibile in lucide-react)
export const Spinner: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Re-export delle icone dal sistema unificato per compatibilità
export { ChevronIcon, CloseIcon, HelpIcon } from './IconSystem';

// SortIcon sostituito con Icon system
export const SortIcon: React.FC<{ className?: string; direction?: 'asc' | 'desc' }> = ({ 
  className = '', 
  direction 
}) => {
  if (direction === 'asc') {
    return <Icon name="chevron-up" className={className} />;
  } else if (direction === 'desc') {
    return <Icon name="chevron-down" className={className} />;
  } else {
    return <Icon name="arrow-up-down" className={className} />;
  }
};

// TrendIcon sostituito con TrendingIcon dal sistema unificato
export const TrendIcon: React.FC<{ className?: string; direction?: 'up' | 'down' }> = ({ 
  className = '', 
  direction = 'up' 
}) => {
  return <TrendingIcon direction={direction} className={className} />;
};
