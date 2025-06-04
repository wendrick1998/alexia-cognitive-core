
import { useEffect } from 'react';

interface ChatKeyboardShortcutsProps {
  onNewConversation: () => void;
  onActivateFocusMode: () => void;
  onDeactivateFocusMode: () => void;
  isFocusModeActive: boolean;
}

const ChatKeyboardShortcuts = ({
  onNewConversation,
  onActivateFocusMode,
  onDeactivateFocusMode,
  isFocusModeActive
}: ChatKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            onNewConversation();
            break;
          case 'f':
            e.preventDefault();
            onActivateFocusMode();
            break;
        }
      }
      
      if (e.key === 'Escape' && isFocusModeActive) {
        onDeactivateFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [isFocusModeActive, onDeactivateFocusMode, onActivateFocusMode, onNewConversation]);

  return null;
};

export default ChatKeyboardShortcuts;
