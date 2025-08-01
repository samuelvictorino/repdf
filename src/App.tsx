import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { loadPdfFromFiles, getPageAsBase64, extractTextFromPages, exportPdf } from './services/pdfService';
import { runClientOcr } from './services/geminiService';
import { aiService, canSuggestName, suggestFileName } from './services/aiService';
import { ICONS } from './constants';
import { useTranslation } from './i18n';
import PageGrid from './components/PageGrid';
import ModalManager from './components/ModalManager';
import { Notification, Theme, AccentColor, Language } from './types';
import EmptyWorkspace from './components/EmptyWorkspace';

const NotificationsPopover = ({ notifications, onClear, onClose, language }: { notifications: Notification[], onClear: () => void, onClose: () => void, language: string }) => {
    const { t } = useTranslation(language as any);
    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <span className="text-green-500">{ICONS.check}</span>;
            case 'error': return <span className="text-red-500">{ICONS.close}</span>;
            case 'info': return <span className="text-blue-500">{ICONS.logo}</span>;
        }
    };
    
    return (
        <div className="fixed top-16 right-4 z-50">
            <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-modal-show origin-top-right">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('notifications.notifications')}</h3>
                    <button onClick={onClear} className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 hover:underline transition-colors">{t('actions.clear')}</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-6">{t('notifications.noNewNotifications')}</p>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map(n => (
                                <li key={n.id} className="p-3 flex items-start space-x-3 hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:border-l-4 hover:border-accent-500 transition-all">
                                    <div className="w-5 h-5 flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
                                    <div>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{n.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const CloseConfirmationPopover = ({ fileId, x, y, onClose }: { fileId: string, x: number, y: number, onClose: () => void }) => {
  const { state, dispatch } = useAppContext();
  const { language } = state.uiState;
  const { t } = useTranslation(language);
  
  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_FILE', payload: fileId });
    onClose();
  };

  // Calculate safe positioning to keep popover within screen bounds
  const popoverWidth = 120;
  const popoverHeight = 50;
  const margin = 10;
  
  const safeX = Math.min(
    Math.max(margin, x - popoverWidth / 2), 
    window.innerWidth - popoverWidth - margin
  );
  
  const safeY = y + popoverHeight + margin > window.innerHeight 
    ? y - popoverHeight - margin 
    : y + margin;

  return (
    <div 
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-modal-show"
      style={{ left: safeX, top: safeY, width: popoverWidth }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        <button
          onClick={handleConfirm}
          className="w-full px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <span>{t('actions.close')}</span>
        </button>
      </div>
    </div>
  );
};

const AiSuggestionPopover = ({ fileId, x, y, loading, suggestion, error, provider, onApply }: { 
  fileId: string, 
  x: number, 
  y: number, 
  loading: boolean, 
  suggestion?: string, 
  error?: string,
  provider?: string,
  onApply: (name: string) => void 
}) => {
  const { state, dispatch } = useAppContext();
  const { language } = state.uiState;
  const { t } = useTranslation(language);
  
  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suggestion) {
      onApply(suggestion);
      dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: null });
    }
  };

  // Calculate safe positioning to keep popover within screen bounds
  const popoverWidth = 300; // max-w-xs equivalent
  const popoverHeight = 120; // approximate height
  const margin = 10;
  
  const safeX = Math.min(
    Math.max(margin, x - popoverWidth / 2), 
    window.innerWidth - popoverWidth - margin
  );
  
  const safeY = y + popoverHeight + margin > window.innerHeight 
    ? y - popoverHeight - margin // Show above if no space below
    : y + margin; // Show below as default

  return (
    <div 
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-modal-show w-72"
      style={{ left: safeX, top: safeY }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3">
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="w-4 h-4">{ICONS.spinner}</span>
            <span>{t('ai.analyzing')}</span>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {suggestion && !loading && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>{t('ai.suggests')}</span>
              {provider && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  {provider === 'ollama' ? `🤖 ${t('ai.local')}` : `☁️ ${t('ai.cloud')}`}
                </span>
              )}
            </div>
            <button
              onClick={handleApply}
              className="w-full text-left px-3 py-2 bg-accent-50 dark:bg-accent-900/30 hover:bg-accent-100 dark:hover:bg-accent-900/50 text-accent-700 dark:text-accent-300 rounded-md text-sm font-medium transition-colors border border-accent-200 dark:border-accent-700"
            >
              <span className="truncate">{suggestion}</span>
            </button>
            <div className="text-xs text-gray-400 text-center">{t('ai.clickToApply')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteConfirmationPopover = ({ x, y, pageCount, onConfirm, onCancel }: { 
  x: number, 
  y: number, 
  pageCount: number, 
  onConfirm: () => void, 
  onCancel: () => void 
}) => {
  const { state } = useAppContext();
  const { language } = state.uiState;
  const { t } = useTranslation(language);
  
  // Calculate safe positioning to keep popover within screen bounds
  const popoverWidth = 120;
  const popoverHeight = 50;
  const margin = 10;
  
  const safeX = Math.min(
    Math.max(margin, x - popoverWidth / 2), 
    window.innerWidth - popoverWidth - margin
  );
  
  const safeY = y + popoverHeight + margin > window.innerHeight 
    ? y - popoverHeight - margin 
    : y + margin;

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
  };

  return (
    <div 
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-modal-show"
      style={{ left: safeX, top: safeY, width: popoverWidth }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        <button
          onClick={handleConfirm}
          className="w-full px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center"
        >
          <span>{t('actions.delete')}</span>
        </button>
      </div>
    </div>
  );
};

const SettingsPopover = () => {
  const { state, dispatch } = useAppContext();
  const { theme, accentColor, language } = state.uiState;
  const { t } = useTranslation(language);

  const handleThemeChange = (newTheme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const handleAccentChange = (newAccent: AccentColor) => {
    dispatch({ type: 'SET_ACCENT_COLOR', payload: newAccent });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
  };

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-modal-show z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-md font-medium mb-2">{t('settings.theme')}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleThemeChange(Theme.LIGHT)} 
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                theme === Theme.LIGHT 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'
              }`}
            >
              {t('settings.light')}
            </button>
            <button 
              onClick={() => handleThemeChange(Theme.DARK)} 
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                theme === Theme.DARK 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'
              }`}
            >
              {t('settings.dark')}
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">{t('settings.accentColor')}</h3>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={accentColor.hex}
              onChange={(e) => handleAccentChange({ name: 'Custom', hex: e.target.value })}
              className="w-12 h-12 p-0 border-none rounded-md bg-transparent cursor-pointer"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">{t('settings.chooseColor')}</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">{t('settings.language')}</h3>
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => handleLanguageChange('pt-BR')} 
              className={`px-4 py-2 rounded-md text-sm font-semibold text-left transition-colors ${
                language === 'pt-BR' 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'
              }`}
            >
              {t('settings.portuguese')}
            </button>
            <button 
              onClick={() => handleLanguageChange('en')} 
              className={`px-4 py-2 rounded-md text-sm font-semibold text-left transition-colors ${
                language === 'en' 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'
              }`}
            >
              {t('settings.english')}
            </button>
            <button 
              onClick={() => handleLanguageChange('es')} 
              className={`px-4 py-2 rounded-md text-sm font-semibold text-left transition-colors ${
                language === 'es' 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'
              }`}
            >
              {t('settings.spanish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExportPopover = () => {
  const { state, dispatch } = useAppContext();
  const { files, pages, loadedDocs } = state.undoableState.present;
  const { language } = state.uiState;
  const { t } = useTranslation(language);
  
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({});
  const [combine, setCombine] = useState(false);
  const [password, setPassword] = useState('');
  const [split, setSplit] = useState(false);
  const [splitSize, setSplitSize] = useState(40);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSelectedFiles(files.reduce((acc, file) => ({...acc, [file.id]: true}), {}));
  }, [files]);

  const handleExport = async () => {
    setIsExporting(true);
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: t('notifications.exportStarted') } });
    try {
      const filesToExport = files.filter(f => selectedFiles[f.id]);
      await exportPdf(filesToExport, pages, loadedDocs, { combine, password, split, splitSizeMB: splitSize });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: t('notifications.exportSuccess') } });
      dispatch({ type: 'SET_EXPORT_POPOVER', payload: false });
    } catch (e: any) {
      console.error('Export error:', e);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: `${t('notifications.exportError')}: ${e.message}` } });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-modal-show z-50 max-h-96 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">{t('export.title')}</h3>
        
        <div>
          <h4 className="text-sm font-medium mb-2">{t('export.filesToExport')}</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.map(file => (
              <label key={file.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedFiles[file.id] || false}
                  onChange={(e) => setSelectedFiles({...selectedFiles, [file.id]: e.target.checked})}
                  className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                />
                <span className="truncate">{file.name}</span>
                <span className="text-gray-500">({file.pageIds.length} pages)</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">{t('export.exportMode')}</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setCombine(true)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                combine ? 'bg-accent-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30'
              }`}
            >
              {t('export.combine')}
            </button>
            <button
              onClick={() => setCombine(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !combine ? 'bg-accent-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30'
              }`}
            >
              {t('export.separate')}
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">{t('export.advancedOptions')}</h4>
          <div className="space-y-3">
            <input
              type="password"
              placeholder={t('export.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
            />
            
            {combine && (
              <div>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={split}
                    onChange={(e) => setSplit(e.target.checked)}
                    className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                  />
                  <span>Split large files (if larger than specified size)</span>
                </label>
                {split && (
                  <div className="flex items-center space-x-2 mt-2 pl-6">
                    <span className="text-sm">If larger than</span>
                    <input
                      type="number"
                      value={splitSize}
                      onChange={(e) => setSplitSize(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                      min="1"
                      max="200"
                    />
                    <span className="text-sm">MB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || Object.values(selectedFiles).every(v => !v)}
          className="w-full px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
        >
          {isExporting ? t('export.exporting') : t('export.exportButton')}
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { state, dispatch } = useAppContext();
  const { past, future } = state.undoableState;
  const { files } = state.undoableState.present;
  const { notifications, importLoading, language } = state.uiState;
  const hasFiles = files.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const { t } = useTranslation(language);

  const handleOpenClick = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(async (filesToLoad: FileList | null) => {
    if (filesToLoad && filesToLoad.length > 0) {
      dispatch({ type: 'SET_IMPORT_LOADING', payload: true });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `${t('notifications.loading')} ${filesToLoad.length} ${filesToLoad.length === 1 ? t('notifications.fileImported') : t('notifications.filesImported')}...` } });
      try {
        const { files, pages, loadedDocs } = await loadPdfFromFiles(Array.from(filesToLoad));
        dispatch({ type: 'ADD_FILES', payload: { files, pages, loadedDocs } });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: t('notifications.filesLoaded') } });
      } catch (error: any) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: error.message } });
        dispatch({ type: 'SET_IMPORT_LOADING', payload: false });
      }
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [dispatch]);
  
  const toggleNotifications = () => {
    if (!showNotifications) {
        dispatch({ type: 'MARK_NOTIFICATIONS_AS_READ' });
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 z-20">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-accent-600 dark:text-accent-400">
          <span className="w-8 h-8">{ICONS.logo}</span>
          <h1 className="text-xl font-bold tracking-tight">RePDF</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleOpenClick} disabled={importLoading} className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md bg-white dark:bg-gray-700 hover:bg-accent-50 dark:hover:bg-accent-900/30 hover:text-accent-600 dark:hover:text-accent-400 hover:scale-[1.02] transition-all disabled:opacity-50 border border-gray-200 dark:border-gray-600 hover:border-accent-300 dark:hover:border-accent-600">
            {importLoading ? <span className="w-5 h-5">{ICONS.spinner}</span> : <span className="w-5 h-5">{ICONS.open}</span>}
            <span>{importLoading ? t('status.loading') : t('files.import')}</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} multiple accept=".pdf" className="hidden" />
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                dispatch({type: 'SET_EXPORT_POPOVER', payload: !state.uiState.exportPopoverOpen});
              }} 
              disabled={!hasFiles}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md bg-white dark:bg-gray-700 hover:bg-accent-50 dark:hover:bg-accent-900/30 hover:text-accent-600 dark:hover:text-accent-400 hover:scale-[1.02] transition-all border border-gray-200 dark:border-gray-600 hover:border-accent-300 dark:hover:border-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-5 h-5">{ICONS.export}</span>
              <span>{t('files.export')}</span>
            </button>
            {state.uiState.exportPopoverOpen && <ExportPopover />}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
            onClick={() => dispatch({ type: 'UNDO' })} 
            disabled={past.length === 0} 
            className="p-2 rounded-md hover:bg-accent-50 dark:hover:bg-accent-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 hover:text-accent-600 dark:hover:text-accent-400 hover:scale-110 hover:shadow-lg transition-all duration-200"
            title={t('actions.undo')}
        >
            <span className="w-6 h-6">{ICONS.undo}</span>
        </button>
        <button 
            onClick={() => dispatch({ type: 'REDO' })} 
            disabled={future.length === 0} 
            className="p-2 rounded-md hover:bg-accent-50 dark:hover:bg-accent-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 hover:text-accent-600 dark:hover:text-accent-400 hover:scale-110 hover:shadow-lg transition-all duration-200"
            title={t('actions.redo')}
        >
            <span className="w-6 h-6">{ICONS.redo}</span>
        </button>
         <div className="relative">
            <button 
              onClick={toggleNotifications} 
              className="relative p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-accent-50 dark:hover:bg-accent-900/30 text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 hover:scale-105 hover:shadow-md transition-all duration-200 shadow-sm border-2 border-gray-200 dark:border-gray-600 hover:border-accent-300 dark:hover:border-accent-600 group"
              title={t('notifications.notifications')}
            >
                <span className="w-5 h-5 block">{ICONS.bell}</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white dark:ring-gray-700">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <span className="absolute inset-0 rounded-lg bg-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {showNotifications && <NotificationsPopover notifications={notifications} onClear={() => dispatch({type: 'CLEAR_NOTIFICATIONS'})} onClose={() => setShowNotifications(false)} language={language} />}
         </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              dispatch({type: 'SET_SETTINGS_POPOVER', payload: !state.uiState.settingsPopoverOpen});
            }} 
            className="relative p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-accent-50 dark:hover:bg-accent-900/30 text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 hover:scale-105 hover:shadow-md transition-all duration-200 shadow-sm border-2 border-gray-200 dark:border-gray-600 hover:border-accent-300 dark:hover:border-accent-600 group"
            title={t('settings.theme')}
          >
              <span className="w-5 h-5 block">{ICONS.settings}</span>
              <span className="absolute inset-0 rounded-lg bg-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {state.uiState.settingsPopoverOpen && <SettingsPopover />}
        </div>
      </div>
    </header>
  );
};


const FileTabsBar = () => {
    const { state, dispatch } = useAppContext();
    const { files, activeFileId } = state.undoableState.present;
    const { renameTargetId, theme } = state.uiState;
    const [editingTabId, setEditingTabId] = useState<string|null>(null);
    const [tabName, setTabName] = useState('');
    const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
    const [dragOverPlus, setDragOverPlus] = useState(false);
    const hoverTimeoutRef = useRef<number | null>(null);
    const draggedItemIndex = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renameTargetId) {
            const targetFile = files.find(f => f.id === renameTargetId);
            if (targetFile) {
                setEditingTabId(renameTargetId);
                setTabName(targetFile.name);
                dispatch({ type: 'SET_RENAME_TARGET', payload: null });
            }
        }
    }, [renameTargetId, files, dispatch]);

    useEffect(() => {
        if (editingTabId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTabId]);

    const handleDoubleClick = async (fileId: string, currentName: string, event: React.MouseEvent) => {
        setEditingTabId(fileId);
        setTabName(currentName);
        
        // Initialize AI service and start suggestion in background if available
        const provider = await aiService.initialize();
        
        if (provider !== 'none') {
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: {
                fileId,
                x: rect.left + rect.width / 2,
                y: rect.bottom,
                loading: true
            }});
            
            try {
                // Find the document for this file
                const file = state.undoableState.present.files.find(f => f.id === fileId);
                const loadedDoc = file ? Object.values(state.undoableState.present.loadedDocs).find(doc => 
                    file.pageIds.some(pageId => state.undoableState.present.pages[pageId]?.sourceDocId === doc.id)
                ) : null;
                
                if (loadedDoc) {
                    const textSample = await extractTextFromPages(loadedDoc, 3);
                    if (textSample.trim()) {
                        const suggestion = await suggestFileName(textSample);
                        const currentProvider = aiService.getCurrentProvider();
                        
                        dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: {
                            fileId,
                            x: rect.left + rect.width / 2,
                            y: rect.bottom,
                            loading: false,
                            suggestion,
                            provider: currentProvider // Show which AI was used
                        }});
                    } else {
                        dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: {
                            fileId,
                            x: rect.left + rect.width / 2,
                            y: rect.bottom,
                            loading: false,
                            error: 'No text found for AI analysis'
                        }});
                    }
                }
            } catch (err: any) {
                dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: {
                    fileId,
                    x: rect.left + rect.width / 2,
                    y: rect.bottom,
                    loading: false,
                    error: err.message || 'AI suggestion failed'
                }});
            }
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTabName(e.target.value);
    };

    const handleNameSave = (fileId: string) => {
        if(tabName.trim()){
            dispatch({ type: 'RENAME_FILE', payload: { fileId, newName: tabName.trim() }});
        }
        setEditingTabId(null);
    };
    
    const handleDragLeave = () => {
        setDragOverTabId(null);
        setDragOverPlus(false);
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleDragOver = (e: React.DragEvent, targetFileId: string | 'plus') => {
        e.preventDefault();
        
        if (e.dataTransfer.types.includes('application/json')) {
            e.dataTransfer.dropEffect = 'move';
            if (targetFileId === 'plus') {
                setDragOverPlus(true);
            } else {
                setDragOverTabId(targetFileId);
                if (hoverTimeoutRef.current === null && targetFileId !== activeFileId) {
                    hoverTimeoutRef.current = window.setTimeout(() => {
                        dispatch({ type: 'SET_ACTIVE_FILE', payload: targetFileId });
                    }, 500);
                }
            }
        } else if (e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain').startsWith('file-tab-index:')) {
            e.dataTransfer.dropEffect = 'move';
            if (targetFileId !== 'plus') {
                setDragOverTabId(targetFileId);
            }
        }
    };

    const handleDropOnTab = (e: React.DragEvent, dropIndex: number, targetFileId: string) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent grid drop handler from firing
    
        // Always clear hover effects
        handleDragLeave();
    
        // Check for page drop first
        const pagePayload = e.dataTransfer.getData("application/json");
        if (pagePayload && pagePayload.startsWith('{')) {
            try {
                const { sourceFileId, pageIds } = JSON.parse(pagePayload);
                if (sourceFileId !== targetFileId) {
                    const targetFile = files.find(f => f.id === targetFileId);
                    // When dropping on a tab, append pages to the end.
                    const finalDropIndex = targetFile ? targetFile.pageIds.length : 0;
                    dispatch({ type: 'SHOW_CONTEXTUAL_MENU', payload: { x: e.clientX, y: e.clientY, sourceFileId, targetFileId, pageIds, dropIndex: finalDropIndex }});
                }
                // If sourceFileId === targetFileId, do nothing (it's a no-op).
            } catch (error) {
                console.error("Error handling page drop on tab:", error);
            }
            return;
        }
    
        // Handle tab reordering
        const tabPayload = e.dataTransfer.getData('text/plain');
        if (tabPayload.startsWith('file-tab-index:')) {
            const startIndex = parseInt(tabPayload.split(':')[1], 10);
            if (startIndex !== dropIndex) {
                dispatch({ type: 'REORDER_FILES', payload: { startIndex, endIndex: dropIndex } });
            }
        }
        
        draggedItemIndex.current = null;
    };
    
    const handlePlusDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const pageDragPayload = e.dataTransfer.getData("application/json");
        if (pageDragPayload && pageDragPayload.startsWith('{')) {
            try {
                const { sourceFileId, pageIds } = JSON.parse(pageDragPayload);
                dispatch({ type: 'MOVE_PAGES_TO_NEW_FILE', payload: { sourceFileId, pageIds } });
            } catch (error) {
                console.error("Error parsing page drop data on plus button:", error);
            }
        }
        handleDragLeave();
    };

    const handleTabDragStart = (e: React.DragEvent, index: number) => {
        draggedItemIndex.current = index;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', `file-tab-index:${index}`);
    };

    const handleTabDragEnd = () => {
        draggedItemIndex.current = null;
        handleDragLeave();
    };

    return (
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-1 flex items-center space-x-1 overflow-x-auto z-10">
            {files.map((file, index) => (
                <div key={file.id} 
                     draggable
                     onDragStart={(e) => handleTabDragStart(e, index)}
                     onDragOver={(e) => handleDragOver(e, file.id)}
                     onDrop={(e) => handleDropOnTab(e, index, file.id)}
                     onDragEnd={handleTabDragEnd}
                     onDragLeave={handleDragLeave}
                     onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', payload: file.id })}
                     onDoubleClick={(e) => handleDoubleClick(file.id, file.name, e)}
                     className={`flex items-center space-x-2 px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap text-sm transition-all duration-200 relative group ${activeFileId === file.id ? 'font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-accent-500 after:transform after:scale-x-100' : 'hover:bg-gray-200/70 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-accent-500 after:transform after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100'} ${dragOverTabId === file.id ? 'scale-105 ring-2 ring-accent-500' : ''}`} style={activeFileId === file.id ? { 
                       backgroundColor: theme === Theme.LIGHT ? 'var(--accent-tab-light-bg)' : 'var(--accent-tab-dark-bg)', 
                       color: theme === Theme.LIGHT ? 'var(--accent-tab-light-text)' : 'var(--accent-tab-dark-text)' 
                     } : {}}>
                    
                    {editingTabId === file.id ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={tabName}
                            onChange={handleNameChange}
                            onBlur={() => handleNameSave(file.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSave(file.id)}
                            className="bg-transparent focus:outline-none p-0 m-0 w-32"
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <span>{file.name}</span>
                    )}
                    <button onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      dispatch({ type: 'SET_CONFIRM_CLOSE_INFO', payload: { fileId: file.id, x: rect.left + rect.width / 2, y: rect.bottom } });
                    }} className="w-5 h-5 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-accent-600 dark:hover:text-accent-400 transition-colors" title="Close File">
                      <span className="w-4 h-4">{ICONS.close}</span>
                    </button>
                </div>
            ))}
             <button
                onClick={() => dispatch({type: 'CREATE_EMPTY_FILE'})}
                onDragOver={(e) => handleDragOver(e, 'plus')}
                onDrop={handlePlusDrop}
                onDragLeave={handleDragLeave}
                title="Create a new, empty document"
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-all duration-200 ${dragOverPlus ? 'scale-110 ring-2 ring-accent-500 bg-accent-100 dark:bg-accent-900' : ''}`}
            >
                <span className="w-5 h-5">{ICONS.plus}</span>
            </button>
        </div>
    );
};


const ViewControlsToolbar = () => {
    const { state, dispatch } = useAppContext();
    const { activeFileId, selectedPageIds, pages, loadedDocs, files } = state.undoableState.present;
    const selectionCount = activeFileId ? (selectedPageIds[activeFileId]?.length || 0) : 0;
    
    const handleOCR = useCallback(async () => {
        if (!activeFileId || selectionCount === 0) return;
        const pageIds = selectedPageIds[activeFileId]!;
        dispatch({ type: 'START_OCR', payload: { pageIds } });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Starting OCR for ${pageIds.length} page(s).` } });

        for (const pageId of pageIds) {
            try {
                const pageInfo = pages[pageId];
                const doc = loadedDocs[pageInfo.sourceDocId];
                const base64Image = await getPageAsBase64(doc, pageInfo);
                const text = await runClientOcr(base64Image, dispatch);
                dispatch({ type: 'FINISH_OCR', payload: { pageId, text } });
            } catch (error: any) {
                dispatch({ type: 'FINISH_OCR', payload: { pageId, error: true } });
                dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: `OCR failed for one page: ${error.message}` } });
            }
        }
    }, [activeFileId, selectionCount, selectedPageIds, pages, loadedDocs, dispatch]);

    const handlePreview = () => {
        const activeFile = files.find(f => f.id === activeFileId);
        if (!activeFile) return;

        const currentSelection = selectedPageIds[activeFileId] || [];
        let pageIdsToPreview: string[];
        let startIndex = 0;

        if (currentSelection.length >= 2) {
            pageIdsToPreview = currentSelection;
        } else {
            pageIdsToPreview = activeFile.pageIds;
        }

        if (pageIdsToPreview.length > 0) {
            dispatch({ type: 'SHOW_MODAL', payload: { type: 'quick-preview', modalPayload: { pageIds: pageIdsToPreview, startIndex } } });
        }
    };

    return (
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
                 <button disabled={!activeFileId} onClick={handlePreview} title="Quick Preview" className="flex items-center space-x-1 px-2 py-1 text-sm rounded-md hover:text-accent-600 dark:hover:text-accent-400 transition-colors disabled:opacity-50 disabled:hover:text-gray-500">
                    <span className="w-5 h-5">{ICONS.preview}</span><span>Preview</span>
                </button>
                <button disabled={selectionCount === 0} onClick={() => dispatch({ type: 'ROTATE_SELECTED_PAGES', payload: -90 })} title="Rotate Left" className="flex items-center space-x-1 px-2 py-1 text-sm rounded-md hover:text-accent-600 dark:hover:text-accent-400 transition-colors disabled:opacity-50 disabled:hover:text-gray-500">
                    <span className="w-5 h-5">{ICONS.rotateLeft}</span><span>Rotate Left</span>
                </button>
                 <button disabled={selectionCount === 0} onClick={() => dispatch({ type: 'ROTATE_SELECTED_PAGES', payload: 90 })} title="Rotate Right" className="flex items-center space-x-1 px-2 py-1 text-sm rounded-md hover:text-accent-600 dark:hover:text-accent-400 transition-colors disabled:opacity-50 disabled:hover:text-gray-500">
                    <span className="w-5 h-5">{ICONS.rotateRight}</span><span>Rotate Right</span>
                </button>
                <button disabled={selectionCount === 0} onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = rect.left + rect.width / 2;
                  const y = rect.top;
                  
                  dispatch({ 
                    type: 'SET_DELETE_CONFIRMATION_INFO', 
                    payload: {
                      x,
                      y,
                      pageCount: selectionCount,
                      onConfirm: () => {
                        dispatch({ type: 'DELETE_SELECTED_PAGES' });
                        dispatch({ type: 'SET_DELETE_CONFIRMATION_INFO', payload: null });
                      }
                    }
                  });
                }} title="Delete Selected Pages" className="flex items-center space-x-1 px-2 py-1 text-sm rounded-md hover:text-accent-600 dark:hover:text-accent-400 transition-colors disabled:opacity-50 disabled:hover:text-gray-500">
                    <span className="w-5 h-5">{ICONS.delete}</span><span>Delete</span>
                </button>
                <button disabled={selectionCount === 0} onClick={handleOCR} title="Make Searchable with OCR" className="flex items-center space-x-1 px-2 py-1 text-sm rounded-md hover:text-accent-600 dark:hover:text-accent-400 transition-colors disabled:opacity-50 disabled:hover:text-gray-500">
                    <span className="w-5 h-5">{ICONS.ocr}</span><span>Make Searchable (OCR)</span>
                </button>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Size:</span>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                            <button
                                key={size}
                                onClick={() => dispatch({ type: 'SET_THUMBNAIL_SCALE', payload: size })}
                                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                                    state.uiState.thumbnailScale === size 
                                        ? 'bg-accent-500 text-white shadow-sm' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    {selectionCount > 0 ? `${selectionCount} page(s) selected` : 'No pages selected'}
                </div>
            </div>
        </div>
    );
};

const ContextualMenu = () => {
    const { state, dispatch } = useAppContext();
    const { contextualMenu } = state.uiState;
    
    if (!contextualMenu) return null;

    const { x, y, sourceFileId, targetFileId, pageIds, dropIndex } = contextualMenu;

    const handleMove = (copy: boolean) => {
        dispatch({ type: 'MOVE_PAGES_TO_FILE', payload: { sourceFileId, targetFileId, pageIds, copy, dropIndex }});
        dispatch({ type: 'HIDE_CONTEXTUAL_MENU' });
    }

    return (
        <div 
            className="fixed z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 p-2 animate-modal-show flex flex-col space-y-1" 
            style={{ left: x, top: y }}
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={() => handleMove(true)} className="flex items-center space-x-2 text-left w-full px-3 py-1.5 rounded-md text-sm hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-700 dark:hover:text-accent-300 hover:border-l-4 hover:border-accent-500 transition-all">
                <span className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-accent-600 dark:group-hover:text-accent-400">{ICONS.copy}</span>
                <span>Copy {pageIds.length} page(s)</span>
            </button>
            <button onClick={() => handleMove(false)} className="flex items-center space-x-2 text-left w-full px-3 py-1.5 rounded-md text-sm hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-700 dark:hover:text-accent-300 hover:border-l-4 hover:border-accent-500 transition-all">
                 <span className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-accent-600 dark:group-hover:text-accent-400">{ICONS.move}</span>
                <span>Move {pageIds.length} page(s)</span>
            </button>
        </div>
    );
};

const App = () => {
  const { state, dispatch } = useAppContext();
  const { activeFileId, files, pages } = state.undoableState.present;
  const { confirmCloseInfo, aiSuggestionInfo, deleteConfirmationInfo, theme, accentColor } = state.uiState;

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  
  // Apply accent color CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const hex = accentColor.hex;
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return;

    let r: number, g: number, b: number;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    
    // Generate color scale from 50 to 950
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    shades.forEach((shade, index) => {
        let factor;
        if (shade < 500) {
            // Lighter shades - mix with white
            factor = (500 - shade) / 450; // 0 to 1
            const mix = (c: number) => Math.round(c + (255 - c) * factor);
            root.style.setProperty(`--accent-color-${shade}`, `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`);
        } else if (shade === 500) {
            // Base color
            root.style.setProperty(`--accent-color-${shade}`, `rgb(${r}, ${g}, ${b})`);
        } else {
            // Darker shades - mix with black
            factor = (shade - 500) / 450; // 0 to 1
            const mix = (c: number) => Math.round(c * (1 - factor));
            root.style.setProperty(`--accent-color-${shade}`, `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`);
        }
    });

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    root.style.setProperty('--accent-color-contrast', luminance > 0.5 ? 'black' : 'white');
    root.style.setProperty('--accent-color-500', `${r}, ${g}, ${b}`);
    
    // Create intelligent tab contrast colors for both light and dark themes
    // For light theme: use lighter accent background with darker text
    // For dark theme: use darker accent background with lighter text
    const lightTabBg = Math.round(r + (255 - r) * 0.85); // Very light version (15% of the way from white)
    const lightTabBgG = Math.round(g + (255 - g) * 0.85);
    const lightTabBgB = Math.round(b + (255 - b) * 0.85);
    
    const darkTabBg = Math.round(r * 0.3); // Dark version (30% of original)
    const darkTabBgG = Math.round(g * 0.3);
    const darkTabBgB = Math.round(b * 0.3);
    
    root.style.setProperty('--accent-tab-light-bg', `rgb(${lightTabBg}, ${lightTabBgG}, ${lightTabBgB})`);
    root.style.setProperty('--accent-tab-dark-bg', `rgb(${darkTabBg}, ${darkTabBgG}, ${darkTabBgB})`);
    
    // Text colors for optimal contrast
    const lightTabTextLuminance = (0.299 * lightTabBg + 0.587 * lightTabBgG + 0.114 * lightTabBgB) / 255;
    const darkTabTextLuminance = (0.299 * darkTabBg + 0.587 * darkTabBgG + 0.114 * darkTabBgB) / 255;
    
    root.style.setProperty('--accent-tab-light-text', lightTabTextLuminance > 0.5 ? '#1a1a1a' : '#ffffff');
    root.style.setProperty('--accent-tab-dark-text', darkTabTextLuminance > 0.5 ? '#1a1a1a' : '#ffffff');
  }, [accentColor, theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key === 'Z') || e.key === 'y')) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const activeFile = files.find(f => f.id === activeFileId);
  const activeFilePages = activeFile ? activeFile.pageIds.map(id => pages[id]) : [];

  const handleFileDrop = useCallback(async (filesToLoad: FileList | null) => {
    if (filesToLoad && filesToLoad.length > 0) {
      dispatch({ type: 'SET_IMPORT_LOADING', payload: true });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Loading ${filesToLoad.length} file(s)...` } });
      try {
        const { files, pages, loadedDocs } = await loadPdfFromFiles(Array.from(filesToLoad));
        dispatch({ type: 'ADD_FILES', payload: { files, pages, loadedDocs } });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Files loaded successfully.' } });
      } catch (error: any) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: error.message } });
        dispatch({ type: 'SET_IMPORT_LOADING', payload: false });
      }
    }
  }, [dispatch]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col min-h-0">
        {files.length > 0 && <FileTabsBar />}
        {files.length > 0 && <ViewControlsToolbar />}
        <div className="flex-grow overflow-auto bg-gray-100/50 dark:bg-black/20">
            {activeFile ? (
                <PageGrid fileId={activeFile.id} pages={activeFilePages} />
            ) : (
                <EmptyWorkspace onFileDrop={handleFileDrop} />
            )}
        </div>
      </main>
      <ModalManager />
      <ContextualMenu />
      {confirmCloseInfo && (
        <CloseConfirmationPopover
          fileId={confirmCloseInfo.fileId}
          x={confirmCloseInfo.x}
          y={confirmCloseInfo.y}
          onClose={() => dispatch({ type: 'SET_CONFIRM_CLOSE_INFO', payload: null })}
        />
      )}
      {aiSuggestionInfo && (
        <AiSuggestionPopover
          fileId={aiSuggestionInfo.fileId}
          x={aiSuggestionInfo.x}
          y={aiSuggestionInfo.y}
          loading={aiSuggestionInfo.loading}
          suggestion={aiSuggestionInfo.suggestion}
          error={aiSuggestionInfo.error}
          provider={aiSuggestionInfo.provider}
          onApply={(name) => {
            dispatch({ type: 'RENAME_FILE', payload: { fileId: aiSuggestionInfo.fileId, newName: name } });
            dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: null });
          }}
        />
      )}
      {deleteConfirmationInfo && (
        <DeleteConfirmationPopover
          x={deleteConfirmationInfo.x}
          y={deleteConfirmationInfo.y}
          pageCount={deleteConfirmationInfo.pageCount}
          onConfirm={deleteConfirmationInfo.onConfirm}
          onCancel={() => dispatch({ type: 'SET_DELETE_CONFIRMATION_INFO', payload: null })}
        />
      )}
    </div>
  );
};

export default App;