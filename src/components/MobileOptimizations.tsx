import React from 'react';

// Floating Action Button per mobile
interface FABProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  visible?: boolean;
}

export const FloatingActionButton: React.FC<FABProps> = ({ 
  onClick, icon, label, visible = true 
}) => {
  if (!visible) return null;
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-target"
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
};

// Swipe hint per tabelle
export const SwipeHint: React.FC = () => (
  <div className="block md:hidden text-xs text-gray-500 mb-2 flex items-center">
    <span>← Scorri per vedere altre colonne</span>
  </div>
);

// Progress bar per import
interface ProgressBarProps {
  progress: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => (
  <div className="w-full">
    {label && <div className="text-sm text-gray-700 mb-1">{label}</div>}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      />
    </div>
    <div className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% completato</div>
  </div>
);
