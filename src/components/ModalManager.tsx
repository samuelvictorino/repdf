import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ICONS } from '../constants';
import { AccentColor, Theme, QuickPreviewPayload, PageInfo, Language } from '../types';
import { exportPdf, renderHighResPage, extractTextFromPages } from '../services/pdfService';
import { suggestFileName, canSuggestName } from '../services/geminiService';
import { useTranslation } from '../i18n';
import AIStatusIndicator from './AIStatusIndicator';

const DraggableResizableModal = ({ title, children, isFullScreen, onClose, initialSize = { width: 640, height: 400 } }: { title: string, children: React.ReactNode, isFullScreen?: boolean, onClose: () => void, initialSize?: {width: number, height: number} }) => {
    const { state } = useAppContext();
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - initialSize.width / 2, y: window.innerHeight / 2 - initialSize.height / 2 });
    const [size, setSize] = useState(initialSize);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartSize = useRef({ width: 0, height: 0});

    const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if((e.target as HTMLElement).closest('button, input')) return;
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };
    
    const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsResizing(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        resizeStartSize.current = size;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        }
        if (isResizing) {
            const dx = e.clientX - dragStartPos.current.x;
            const dy = e.clientY - dragStartPos.current.y;
            setSize({
                width: Math.max(400, resizeStartSize.current.width + dx),
                height: Math.max(300, resizeStartSize.current.height + dy)
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing]);
    
    if (isFullScreen) {
      return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-modal-show" 
                style={{ transform: `translate(${position.x}px, ${position.y}px)`, width: size.width, height: size.height }}
                onClick={e => e.stopPropagation()}
            >
                <div 
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-move"
                    onMouseDown={handleMouseDownDrag}
                >
                    <h2 className="text-lg font-semibold select-none">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors z-10">
                        <span className="w-6 h-6">{ICONS.close}</span>
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-auto">
                    {children}
                </div>
                <div 
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-gray-400 dark:text-gray-600"
                    onMouseDown={handleMouseDownResize}
                >
                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 20L20 12" /></svg>
                </div>
            </div>
        </div>
    );
};


const ModalManager = () => {
  const { state, dispatch } = useAppContext();
  const { activeModal, modalPayload, language } = state.uiState;
  const { t } = useTranslation(language);

  if (!activeModal) return null;

  const closeModal = () => dispatch({ type: 'HIDE_MODAL' });

  let modalContent: React.ReactNode;
  let modalTitle = "";
  let isFullScreen = false;
  let modalSize = { width: 500, height: 480 };

  switch (activeModal) {
    case 'settings':
      modalTitle = t('modals.settings');
      modalContent = <SettingsModal />;
      modalSize = { width: 480, height: 520 };
      break;
    case 'export':
        modalTitle = t('modals.export');
        modalContent = <ExportModal />;
        modalSize = { width: 500, height: 580 };
        break;
    case 'quick-preview':
        isFullScreen = true;
        modalContent = <QuickPreviewModal payload={modalPayload as QuickPreviewPayload} onClose={closeModal} />;
        break;
    default:
      return null;
  }
  
  return (
    <DraggableResizableModal title={modalTitle} isFullScreen={isFullScreen} onClose={closeModal} initialSize={modalSize}>
        {modalContent}
    </DraggableResizableModal>
  );
};

const QuickPreviewModal = ({ payload, onClose }: { payload: QuickPreviewPayload, onClose: () => void }) => {
    const { state } = useAppContext();
    const { pages, loadedDocs } = state.undoableState.present;
    const { language } = state.uiState;
    const { t } = useTranslation(language);
    const [currentIndex, setCurrentIndex] = useState(payload.startIndex);
    const [isLoading, setIsLoading] = useState(true);
    const [magnifierStyle, setMagnifierStyle] = useState<React.CSSProperties>({ display: 'none' });
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [scale, setScale] = useState(1);
    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const thumbnailCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [isFading, setIsFading] = useState(false);
    const [thumbnailsLoaded, setThumbnailsLoaded] = useState<boolean[]>([]);

    const pageInfo = pages[payload.pageIds[currentIndex]];
    const loadedDoc = loadedDocs[pageInfo.sourceDocId];

    const navigate = (direction: number) => {
        setIsFading(true);
        setTimeout(() => {
            const newIndex = (currentIndex + direction + payload.pageIds.length) % payload.pageIds.length;
            setCurrentIndex(newIndex);
        }, 150);
    };

    const navigateToIndex = (index: number) => {
        if (index !== currentIndex) {
            setIsFading(true);
            setTimeout(() => {
                setCurrentIndex(index);
            }, 150);
        }
        // Keep thumbnails panel open for easier navigation
    };

    const handleZoom = (delta: number) => {
        const newScale = Math.max(0.5, Math.min(3, scale + delta));
        setScale(newScale);
        // Reset scroll position when zooming
        setScrollPosition({ x: 0, y: 0 });
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo(0, 0);
        }
    };

    const handleResetZoom = () => {
        setScale(1);
        setScrollPosition({ x: 0, y: 0 });
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo(0, 0);
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            setScrollPosition({
                x: scrollContainerRef.current.scrollLeft,
                y: scrollContainerRef.current.scrollTop
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') navigate(1);
            else if (e.key === 'ArrowLeft') navigate(-1);
            else if (e.key === 'Escape') onClose();
            else if (e.key === 't' || e.key === 'T') setShowThumbnails(!showThumbnails);
            else if (e.key === '=' || e.key === '+') handleZoom(0.2);
            else if (e.key === '-') handleZoom(-0.2);
            else if (e.key === '0') handleResetZoom();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, payload.pageIds.length, showThumbnails, scale]);

    // Load main page
    useEffect(() => {
        let isMounted = true;
        if (canvasRef.current && loadedDoc && pageInfo) {
            setIsLoading(true);
            renderHighResPage(loadedDoc, pageInfo, canvasRef.current, scale)
                .then(() => { 
                    if (isMounted) {
                        setIsLoading(false); 
                        setIsFading(false);
                    }
                })
                .catch((error) => {
                    console.error('Error loading main page:', error);
                    if (isMounted) {
                        setIsLoading(false);
                        setIsFading(false);
                    }
                });
        }
        return () => { isMounted = false; };
    }, [pageInfo, loadedDoc, scale]);

    // Initialize thumbnails array
    useEffect(() => {
        setThumbnailsLoaded(new Array(payload.pageIds.length).fill(false));
        thumbnailCanvasRefs.current = new Array(payload.pageIds.length).fill(null);
    }, [payload.pageIds.length]);

    // Load thumbnails when panel is shown
    useEffect(() => {
        if (showThumbnails) {
            payload.pageIds.forEach((pageId, index) => {
                const canvas = thumbnailCanvasRefs.current[index];
                const pageData = pages[pageId];
                const docData = loadedDocs[pageData.sourceDocId];
                
                if (canvas && pageData && docData && !thumbnailsLoaded[index]) {
                    renderHighResPage(docData, pageData, canvas, 0.3) // Scale down for thumbnail
                        .then(() => {
                            setThumbnailsLoaded(prev => {
                                const newState = [...prev];
                                newState[index] = true;
                                return newState;
                            });
                        })
                        .catch(console.error);
                }
            });
        }
    }, [showThumbnails, payload.pageIds, pages, loadedDocs, thumbnailsLoaded]);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const canvas = canvasRef.current;
        if (!canvas || isLoading) return;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const backgroundX = -(x / target.offsetWidth * canvas.width - 100);
        const backgroundY = -(y / target.offsetHeight * canvas.height - 100);

        setMagnifierStyle({
            display: 'block',
            top: `${e.clientY - 100}px`,
            left: `${e.clientX - 100}px`,
            backgroundImage: `url(${canvas.toDataURL()})`,
            backgroundPosition: `${backgroundX}px ${backgroundY}px`,
            backgroundSize: `${canvas.width}px ${canvas.height}px`,
        });
    };

    return (
        <>
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg z-50 flex flex-col animate-modal-show" onClick={onClose}>
            <header className="flex-shrink-0 flex items-center justify-between p-4 text-white">
                <div className="font-semibold">
                    {t('quickPreview.page')} {pages[payload.pageIds[currentIndex]].sourcePageIndex + 1}
                    <span className="text-gray-400 font-normal"> {t('quickPreview.of')} {loadedDoc.fileName}</span>
                </div>
                 <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-300">
                      {currentIndex + 1} / {payload.pageIds.length}
                    </span>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                        <span className="w-8 h-8">{ICONS.close}</span>
                    </button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-8 min-h-0 relative">
                {isLoading && <span className="w-12 h-12 text-white absolute">{ICONS.spinner}</span>}
                <div 
                    ref={scrollContainerRef}
                    className="overflow-auto max-w-full max-h-full scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                    onScroll={handleScroll}
                    style={{ 
                        maxWidth: scale > 1 ? '100%' : 'auto',
                        maxHeight: scale > 1 ? '100%' : 'auto'
                    }}
                >
                    <div 
                        className={`relative transition-opacity duration-150 ${isLoading || isFading ? 'opacity-0' : 'opacity-100'}`}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setMagnifierStyle({ display: 'none' })}
                        style={{
                            transform: scale !== 1 ? `scale(${scale})` : 'none',
                            transformOrigin: 'top left',
                            minWidth: scale > 1 ? 'max-content' : 'auto'
                        }}
                    >
                        <canvas ref={canvasRef} className="shadow-2xl rounded-md" />
                        {scale === 1 && (
                            <div className="absolute inset-0 grid grid-cols-2">
                                <div className="cursor-w-resize" onClick={(e) => { e.stopPropagation(); navigate(-1); }}></div>
                                <div className="cursor-e-resize" onClick={(e) => { e.stopPropagation(); navigate(1); }}></div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <footer className="flex-shrink-0 flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                         <span className="w-6 h-6 transform rotate-180">{ICONS.redo}</span>
                    </button>
                    <button onClick={() => navigate(1)} className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                         <span className="w-6 h-6">{ICONS.redo}</span>
                    </button>
                    
                    {/* Zoom Controls */}
                    <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-2">
                        <button onClick={() => handleZoom(-0.2)} className="text-white hover:text-accent-400 transition-colors" title={t('quickPreview.zoomOut')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="text-white text-sm min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => handleZoom(0.2)} className="text-white hover:text-accent-400 transition-colors" title={t('quickPreview.zoomIn')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button onClick={handleResetZoom} className="text-white hover:text-accent-400 transition-colors text-xs" title={t('quickPreview.resetZoom')}>
                            1:1
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        className={`p-3 rounded-full transition-colors ${
                            showThumbnails 
                                ? 'bg-accent-600 text-accent-contrast' 
                                : 'bg-black/30 text-white hover:bg-black/50'
                        }`}
                        title={t('quickPreview.toggleThumbnails')}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <span className="text-sm text-gray-300 hidden sm:block">{t('quickPreview.navigationHints')}</span>
                </div>
            </footer>
            
            {/* Elegant Thumbnail Carousel */}
            {showThumbnails && (
                <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 animate-modal-show">
                    <div className="flex items-center space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pb-2">
                        {payload.pageIds.map((pageId, index) => {
                            const pageData = pages[pageId];
                            const docData = loadedDocs[pageData.sourceDocId];
                            const isActive = index === currentIndex;
                            
                            return (
                                <div
                                    key={pageId}
                                    className={`flex-shrink-0 relative cursor-pointer group transition-all duration-200 ${
                                        isActive 
                                            ? 'ring-2 ring-accent-400 scale-110' 
                                            : 'hover:scale-105 hover:ring-1 hover:ring-white/50'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToIndex(index);
                                    }}
                                >
                                    <div className="w-20 h-28 bg-gray-800 rounded-md overflow-hidden relative">
                                        {!thumbnailsLoaded[index] && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="w-4 h-4 text-white/50">{ICONS.spinner}</span>
                                            </div>
                                        )}
                                        <canvas
                                            ref={el => thumbnailCanvasRefs.current[index] = el}
                                            className="w-full h-full object-contain"
                                            style={{ display: thumbnailsLoaded[index] ? 'block' : 'none' }}
                                        />
                                        {isActive && (
                                            <div className="absolute inset-0 bg-accent-500/20 rounded-md" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                                        {pageData.sourcePageIndex + 1}
                                    </div>
                                    {isActive && (
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-3 text-xs text-white/50">
                        {t('quickPreview.clickThumbnail')}
                    </div>
                </div>
            )}
        </div>
        <div 
            className="fixed pointer-events-none w-52 h-52 rounded-full border-4 border-accent-500 bg-white shadow-xl"
            style={magnifierStyle}
        ></div>
        </>
    );
};

// Theme and accent color handling moved to App.tsx for global application

const SettingsModal = () => {
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

    // Theme and accent color are now handled globally in App.tsx


    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-md font-medium mb-2">{t('settings.theme')}</h3>
                <div className="flex space-x-2">
                    <button onClick={() => handleThemeChange(Theme.LIGHT)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${theme === Theme.LIGHT ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('settings.light')}</button>
                    <button onClick={() => handleThemeChange(Theme.DARK)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${theme === Theme.DARK ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('settings.dark')}</button>
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
                        style={{'--webkit-appearance': 'none'} as React.CSSProperties}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('settings.chooseColor')}</span>
                </div>
            </div>
            <div>
                <h3 className="text-md font-medium mb-2">{t('settings.language')}</h3>
                <div className="flex flex-col space-y-2">
                    <button onClick={() => handleLanguageChange('pt-BR')} className={`px-4 py-2 rounded-md text-sm font-semibold text-left transition-colors ${language === 'pt-BR' ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('settings.portuguese')}</button>
                    <button onClick={() => handleLanguageChange('en')} className={`px-4 py-2 rounded-md text-sm font-semibold text-left transition-colors ${language === 'en' ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('settings.english')}</button>
                    <button onClick={() => handleLanguageChange('es')} className={`px-4 py-2 rounded-md text-sm font-semibold text-left transition-colors ${language === 'es' ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('settings.spanish')}</button>
                </div>
            </div>
            <div>
                <h3 className="text-md font-medium mb-2">{t('ai.provider')}</h3>
                <AIStatusIndicator />
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>{t('ai.ollamaLocal')}:</strong> {t('ai.ollamaDescription')} <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-accent-600 dark:text-accent-400 hover:underline">ollama.com</a></p>
                    <p className="mt-1"><strong>{t('ai.geminiCloud')}:</strong> {t('ai.geminiDescription')}</p>
                </div>
            </div>
        </div>
    );
};

const ExportModal = () => {
    const { state, dispatch } = useAppContext();
    const { files, pages, loadedDocs } = state.undoableState.present;
    const { language } = state.uiState;
    const { t } = useTranslation(language);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({});
    const [combine, setCombine] = useState(true);
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
        } catch (e: any) {
            console.error(e);
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: `${t('notifications.exportError')}: ${e.message}` } });
        } finally {
            setIsExporting(false);
            dispatch({ type: 'HIDE_MODAL' });
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-md font-medium mb-2">{t('export.filesToExport')}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2">
                    {files.map(file => (
                        <label key={file.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors">
                            <input type="checkbox" checked={selectedFiles[file.id] || false} onChange={e => setSelectedFiles({...selectedFiles, [file.id]: e.target.checked})} className="h-4 w-4 rounded text-accent-600 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 focus:ring-accent-500" />
                            <span>{file.name}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-md font-medium mb-2">{t('export.exportMode')}</h3>
                 <div className="flex space-x-2">
                    <button onClick={() => setCombine(true)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${combine ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('export.combine')}</button>
                    <button onClick={() => setCombine(false)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${!combine ? 'bg-accent-600 text-accent-contrast' : 'bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900/30 hover:text-accent-700 dark:hover:text-accent-300'}`}>{t('export.separate')}</button>
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-md font-medium mb-2 border-t pt-4 border-gray-200 dark:border-gray-700">{t('export.advancedOptions')}</h3>
                <div>
                    <label className="text-sm font-medium">{t('export.password')}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('export.passwordPlaceholder')} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:ring-2 focus:ring-accent-500 focus:border-transparent"/>
                </div>
                {combine && (
                    <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={split} onChange={e => setSplit(e.target.checked)} className="h-4 w-4 rounded text-accent-600 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 focus:ring-accent-500"/>
                            <span>{t('export.autoSplit')}</span>
                        </label>
                        {split && (
                            <div className="flex items-center space-x-2 mt-2 pl-6">
                                <span className="text-sm">{t('export.ifLargerThan')}</span>
                                <input type="number" value={splitSize} onChange={e => setSplitSize(Number(e.target.value))} className="w-20 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md border border-transparent focus:ring-2 focus:ring-accent-500 focus:border-transparent"/>
                                <span className="text-sm">{t('export.mb')}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-end pt-4">
                 <button onClick={handleExport} disabled={isExporting} className="px-6 py-2 rounded-md text-sm font-semibold bg-accent-600 text-accent-contrast hover:bg-accent-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center">
                    {isExporting && <span className="w-4 h-4 mr-2">{ICONS.spinner}</span>}
                    {isExporting ? t('export.exporting') : t('export.exportButton')}
                </button>
            </div>
        </div>
    );
};


export default ModalManager;