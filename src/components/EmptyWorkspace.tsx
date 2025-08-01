import React, { useState, useCallback, useRef } from 'react';
import { ICONS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../i18n';

interface EmptyWorkspaceProps {
    onFileDrop: (files: FileList) => void;
}

const EmptyWorkspace = ({ onFileDrop }: EmptyWorkspaceProps) => {
    const { state } = useAppContext();
    const { language } = state.uiState;
    const { t } = useTranslation(language);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFileDrop(event.target.files);
        }
    };
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files);
        }
    }, [onFileDrop]);

    const shortcuts = [
        { keys: t('shortcuts.ctrlZ'), desc: t('shortcutDesc.undo') },
        { keys: t('shortcuts.ctrlY'), desc: t('shortcutDesc.redo') },
        { keys: t('shortcuts.ctrlClick'), desc: t('shortcutDesc.multiSelect') },
        { keys: t('shortcuts.shiftClick'), desc: t('shortcutDesc.rangeSelect') },
        { keys: t('shortcuts.doubleClickTab'), desc: t('shortcutDesc.rename') },
        { keys: t('shortcuts.dragDropPages'), desc: t('shortcutDesc.dragPages') },
        { keys: t('shortcuts.dragDropTabs'), desc: t('shortcutDesc.dragTabs') },
        { keys: t('shortcuts.aiIcon'), desc: t('shortcutDesc.aiSuggest') },
        { keys: t('shortcuts.escape'), desc: t('shortcutDesc.closeModal') },
    ];

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-full w-full flex flex-col items-center justify-center p-8 transition-colors ${isDragOver ? 'bg-accent-500/10' : ''}`}
        >
            <div className={`w-full max-w-4xl h-full border-2 border-dashed ${isDragOver ? 'border-accent-500' : 'border-gray-300 dark:border-gray-600'} rounded-2xl flex flex-col items-center justify-center text-center p-8`}>
                <span className={`w-24 h-24 mb-4 text-gray-300 dark:text-gray-600 transition-colors ${isDragOver ? 'text-accent-500' : ''}`}>{ICONS.logo}</span>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('welcome.title')}</h2>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{t('welcome.subtitle')}</p>
                <div className="mt-8">
                    <button 
                        onClick={handleOpenClick}
                        className="px-8 py-4 bg-accent-600 text-accent-contrast font-semibold rounded-lg shadow-md hover:bg-accent-700 transition-all transform hover:scale-105"
                    >
                        {t('welcome.openFiles')}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".pdf" className="hidden" />
                    <p className="mt-4 text-gray-500">{t('welcome.orDrop')}</p>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 w-full max-w-lg">
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('welcome.shortcuts')}</h3>
                    <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-left">
                        {shortcuts.map(sc => (
                             <div key={sc.keys} className="flex items-baseline">
                                <dt className="w-1/2 font-mono text-sm text-gray-600 dark:text-gray-300 pr-2">{sc.keys}</dt>
                                <dd className="w-1/2 text-sm text-gray-500 dark:text-gray-400">{sc.desc}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default EmptyWorkspace;
