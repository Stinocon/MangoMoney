import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        (s.ctrlKey === undefined || s.ctrlKey === event.ctrlKey)
      );
      
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Hook shortcuts comuni
export const useCommonShortcuts = (
  onAdd: () => void,
  onSave: () => void,
  onEscape: () => void
) => {
  useKeyboardShortcuts([
    { key: 'n', ctrlKey: true, action: onAdd, description: 'Nuovo asset' },
    { key: 's', ctrlKey: true, action: onSave, description: 'Salva' },
    { key: 'Escape', action: onEscape, description: 'Chiudi modal' }
  ]);
};
