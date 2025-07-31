import { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import FileTabsBar from './components/FileTabsBar';
import ActiveFileContentArea from './components/ActiveFileContentArea';
import NotificationCenter from './components/NotificationCenter';
import { useAppContext } from './context/AppContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';

function App() {
  const { notifications, undoRedo } = useAppContext();
  const { resolvedTheme } = useTheme();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+z': undoRedo.undo,
    'ctrl+y': undoRedo.redo,
    'ctrl+shift+z': undoRedo.redo, // Alternative redo shortcut
  });

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
      <Header />
      <FileTabsBar />
      <main className="flex-grow p-6">
        <ActiveFileContentArea />
      </main>
      <NotificationCenter 
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
      />
    </div>
  );
}

export default App;