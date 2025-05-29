import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
};

type KeyboardShortcutsConfig = {
  shortcuts: KeyboardShortcut[];
  isEnabled?: boolean;
};

/**
 * Hook for implementing keyboard navigation and shortcuts
 */
export const useKeyboardNavigation = (config: KeyboardShortcutsConfig) => {
  const { shortcuts, isEnabled = true } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, isEnabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutsList = () => {
    return shortcuts.map((shortcut) => {
      const modifiers = [
        shortcut.ctrlKey && 'Ctrl',
        shortcut.altKey && 'Alt',
        shortcut.shiftKey && 'Shift',
      ]
        .filter(Boolean)
        .join(' + ');

      const keyDisplay = shortcut.key.length === 1 
        ? shortcut.key.toUpperCase() 
        : shortcut.key;

      const shortcutText = modifiers
        ? `${modifiers} + ${keyDisplay}`
        : keyDisplay;

      return {
        shortcut: shortcutText,
        description: shortcut.description,
      };
    });
  };

  return { getShortcutsList };
};
