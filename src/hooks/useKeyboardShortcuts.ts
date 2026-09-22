import { useEffect, useCallback } from 'react';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver em input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    shortcuts.forEach(shortcut => {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : true;
      const altMatch = shortcut.alt ? event.altKey : true;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Shortcuts padrão do sistema
export const defaultShortcuts: Omit<Shortcut, 'action'>[] = [
  { key: 'k', ctrl: true, description: 'Command Palette' },
  { key: 'n', ctrl: true, description: 'Novo Projeto' },
  { key: 's', ctrl: true, description: 'Salvar' },
  { key: 'z', ctrl: true, description: 'Undo' },
  { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  { key: '/', ctrl: true, description: 'Buscar' },
  { key: 'Escape', description: 'Fechar/Cancelar' }
];
