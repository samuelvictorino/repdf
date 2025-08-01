import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { PageInfo } from '../types';
import { ICONS } from '../constants';
import { usePdfPage } from '../hooks/usePdfPage';
import { useTranslation } from '../i18n';

const ShimmerPlaceholder = () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-600/50 to-transparent -translate-x-full animate-shimmer"></div>
    </div>
);

const AnnularMenu = ({ pageInfo }: { pageInfo: PageInfo }) => {
    const { state, dispatch } = useAppContext();
    const { activeFileId, pages } = state.undoableState.present;
    const selectedPages = state.undoableState.present.selectedPageIds[activeFileId!] || [];
    const isSelected = selectedPages.includes(pageInfo.id);
    const selectionCount = selectedPages.length;
    const activeFile = state.undoableState.present.files.find(f => f.id === activeFileId);
    
    const performActionOnSelection = (action: () => void) => {
        if(!activeFileId) return;
        if (!isSelected) {
            dispatch({ type: 'SELECT_SINGLE_PAGE', payload: { fileId: activeFileId, pageId: pageInfo.id } });
            setTimeout(action, 50); 
        } else {
            action();
        }
    };

    const handleRotate = (direction: 90 | -90) => {
        performActionOnSelection(() => dispatch({ type: 'ROTATE_SELECTED_PAGES', payload: direction }));
    };

    const handleDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top;
            
            const pagesToDelete = isSelected ? selectedPages : [pageInfo.id];
            
            dispatch({ 
                type: 'SET_DELETE_CONFIRMATION_INFO', 
                payload: {
                    x,
                    y,
                    pageCount: pagesToDelete.length,
                    onConfirm: () => {
                        performActionOnSelection(() => dispatch({ type: 'DELETE_SELECTED_PAGES' }));
                        dispatch({ type: 'SET_DELETE_CONFIRMATION_INFO', payload: null });
                    }
                }
            });
        } else {
            // Fallback para chamadas sem evento (como atalhos de teclado)
            performActionOnSelection(() => dispatch({ type: 'DELETE_SELECTED_PAGES' }));
        }
    };
    
    const handlePreview = () => {
        if (!activeFileId || !activeFile) return;

        const currentSelection = selectedPages;
        let pageIdsToPreview: string[];
        let startIndex: number;
        
        if (currentSelection.length >= 2) {
            pageIdsToPreview = currentSelection;
            const clickedPageIndexInSelection = pageIdsToPreview.indexOf(pageInfo.id);
            startIndex = clickedPageIndexInSelection !== -1 ? clickedPageIndexInSelection : 0;
        } else {
            pageIdsToPreview = activeFile.pageIds;
            startIndex = pageIdsToPreview.indexOf(pageInfo.id);
        }

        dispatch({
            type: 'SHOW_MODAL',
            payload: {
                type: 'quick-preview',
                modalPayload: { pageIds: pageIdsToPreview, startIndex: Math.max(0, startIndex) }
            }
        });
    };

    const getTooltip = (base: string, single: string) => {
        if (isSelected && selectionCount > 1) return `${base} ${selectionCount} pages`;
        return single;
    }

    const buttons = [
        { icon: ICONS.preview, action: handlePreview, position: '-translate-y-[140%]', tooltip: getTooltip("Preview selection", "Quick preview")},
        { icon: ICONS.rotateRight, action: () => handleRotate(90), position: 'translate-x-[115%] -translate-y-[70%] rotate-90', tooltip: getTooltip("Rotate", "Rotate right") },
        { icon: ICONS.delete, action: (e: React.MouseEvent) => handleDelete(e), position: 'translate-y-[140%]', tooltip: getTooltip("Delete", "Delete page") },
        { icon: ICONS.rotateLeft, action: () => handleRotate(-90), position: '-translate-x-[115%] -translate-y-[70%] -rotate-90', tooltip: getTooltip("Rotate", "Rotate left") },
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {buttons.map((btn, i) => (
                <button
                    key={i}
                    title={btn.tooltip}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        btn.action(e); 
                    }}
                    className={`absolute w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 flex items-center justify-center hover:bg-accent-50 dark:hover:bg-accent-900/50 hover:text-accent-600 dark:hover:text-accent-400 shadow-lg transform transition-all duration-200 hover:scale-110 ${btn.position} z-10`}
                >
                    <span className="w-5 h-5">{btn.icon}</span>
                </button>
            ))}
        </div>
    );
};


const PageThumbnail = React.memo(({ pageInfo, isSelected, isDimmed, selectionIndex }: { pageInfo: PageInfo, isSelected: boolean, isDimmed: boolean, selectionIndex?: number }) => {
  const { state } = useAppContext();
  const { loadedDocs } = state.undoableState.present;
  const loadedDoc = loadedDocs[pageInfo.sourceDocId];
  const { canvasRef, isLoading } = usePdfPage(loadedDoc, pageInfo, 0.5);
  
  return (
    <div className={`relative aspect-square rounded-lg shadow-md transition-all duration-300 group ${isSelected ? 'ring-4 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900 ring-accent-500 scale-105' : 'bg-white dark:bg-gray-800'} ${isDimmed ? 'opacity-30' : ''}`}>
      <div className="w-full h-full rounded-md overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        {isLoading && <ShimmerPlaceholder />}
        <canvas ref={canvasRef} className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isSelected ? 'opacity-60' : ''}`} />
      </div>
      {pageInfo.isOcrProcessing && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <span className="w-8 h-8 text-white">{ICONS.spinner}</span>
        </div>
      )}
      {isSelected && selectionIndex !== undefined && (
        <div className="absolute top-1 left-1 bg-accent-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
          {selectionIndex + 1}
        </div>
      )}
      {!isDimmed && <AnnularMenu pageInfo={pageInfo} />}
      <div className="absolute bottom-1 right-1 bg-gray-800/70 text-white text-xs rounded-sm px-1.5 py-0.5 pointer-events-none">
        {state.undoableState.present.files.find(f => f.id === state.undoableState.present.activeFileId)?.pageIds.indexOf(pageInfo.id)! + 1}
      </div>
    </div>
  );
});

const DropIndicator = () => (
    <div className="w-full h-full p-1">
        <div className="w-full h-full rounded-lg bg-accent-500/20 ring-2 ring-accent-500 ring-inset animate-pulse" />
    </div>
);

interface PageGridProps {
    fileId: string;
    pages: PageInfo[];
}

const PageGrid = ({ fileId, pages }: PageGridProps) => {
  const { state, dispatch } = useAppContext();
  const { draggedPageIds, isDragging: isGloballyDragging, thumbnailScale } = state.uiState;
  const gridRef = useRef<HTMLDivElement>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const selectedPages = state.undoableState.present.selectedPageIds[fileId] || [];

  const handleSelection = (pageId: string, e: React.MouseEvent) => {
    dispatch({ type: 'TOGGLE_PAGE_SELECTION', payload: { fileId, pageId, ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey } });
  };
  
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    let idsToDrag: string[];
    if (selectedPages.includes(pageId)) {
        idsToDrag = selectedPages;
    } else {
        idsToDrag = [pageId]
        dispatch({ type: 'SELECT_SINGLE_PAGE', payload: { fileId, pageId }});
    }
    dispatch({ type: 'SET_DRAGGED_IDS', payload: idsToDrag });
    e.dataTransfer.effectAllowed = "copyMove";

    const dragPayload = JSON.stringify({ sourceFileId: fileId, pageIds: idsToDrag });
    e.dataTransfer.setData("application/json", dragPayload);
    
    const dragImageContainer = document.createElement('div');
    dragImageContainer.className = 'absolute -z-10';
    const dragImage = document.createElement('div');
    dragImage.className = 'relative w-32 h-44';
    
    const count = idsToDrag.length;
    for(let i=Math.min(count, 3) - 1; i >= 0; i--) {
        const ghostPage = document.createElement('div');
        ghostPage.className = 'absolute inset-0 bg-white dark:bg-gray-700 border-2 border-accent-400 rounded-lg shadow-2xl';
        ghostPage.style.transform = `translate(${i*6}px, ${i*6}px)`;
        dragImage.appendChild(ghostPage);
    }
    
    const label = document.createElement('div');
    label.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-600 text-white font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center';
    label.textContent = `${count}`;
    dragImage.appendChild(label);

    dragImageContainer.appendChild(dragImage)
    document.body.appendChild(dragImageContainer);
    e.dataTransfer.setDragImage(dragImageContainer, 20, 20);
    setTimeout(() => document.body.removeChild(dragImageContainer), 0);

    dispatch({ type: 'SET_DRAGGING', payload: true });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("application/json")) {
        e.dataTransfer.dropEffect = "none";
        return;
    } 
    e.dataTransfer.dropEffect = "move";

    const grid = gridRef.current;
    if (!grid || !draggedPageIds) return;
    
    const nonDraggingElements = Array.from(grid.children).filter(
      c => c.id && !c.id.includes('drop-indicator') && !draggedPageIds.includes((c as HTMLElement).dataset.pageId || '')
    ) as HTMLElement[];

    const positions = nonDraggingElements.map(el => {
        const rect = el.getBoundingClientRect();
        return { el, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    let closestIndex = -1;
    let smallestDistance = Infinity;
    
    for (let i = 0; i < positions.length; i++) {
        const dist = Math.sqrt(Math.pow(positions[i].x - e.clientX, 2) + Math.pow(positions[i].y - e.clientY, 2));
        if (dist < smallestDistance) {
            smallestDistance = dist;
            closestIndex = i;
        }
    }
    
    if (nonDraggingElements.length === 0) {
        setDropIndex(0);
        return;
    }

    if (closestIndex === -1) {
        setDropIndex(nonDraggingElements.length);
        return;
    }

    const closestElRect = positions[closestIndex].el.getBoundingClientRect();
    const isAfter = e.clientX > closestElRect.left + closestElRect.width / 2;
    
    const dropTargetId = positions[closestIndex].el.dataset.pageId!;
    const allPagesFiltered = pages.filter(p => !draggedPageIds!.includes(p.id));
    let finalDropIndex = allPagesFiltered.findIndex(p => p.id === dropTargetId);
    
    if (isAfter) {
        finalDropIndex++;
    }
    setDropIndex(finalDropIndex);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const payload = e.dataTransfer.getData("application/json");
    if (!payload || !payload.startsWith('{')) {
        handleDragEnd();
        return;
    }

    try {
        const { sourceFileId, pageIds } = JSON.parse(payload);
        const finalDropIndex = dropIndex !== null ? dropIndex : pages.length;

        if (sourceFileId === fileId) {
            if (finalDropIndex > -1) {
                dispatch({ type: 'REORDER_PAGES', payload: { fileId, dragIds: pageIds, dropIndex: finalDropIndex } });
            }
        } else {
            dispatch({ type: 'SHOW_CONTEXTUAL_MENU', payload: { x: e.clientX, y: e.clientY, sourceFileId, targetFileId: fileId, pageIds, dropIndex: finalDropIndex } });
        }
    } catch (error) {
        console.error("Error parsing drop data on page grid:", error);
    }
    
    handleDragEnd();
  };

  const handleDragEnd = () => {
    dispatch({ type: 'SET_DRAGGED_IDS', payload: null });
    setDropIndex(null);
    dispatch({ type: 'SET_DRAGGING', payload: false });
  };
  
  const { language } = state.uiState;
  const { t } = useTranslation(language);

  // Dynamic grid classes based on thumbnail scale
  const getGridClasses = () => {
    const base = "flex-grow p-4 md:p-8 grid gap-x-6 gap-y-8 auto-rows-min transition-all duration-500 ease-in-out";
    switch (thumbnailScale) {
      case 'small':
        return `${base} grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12`;
      case 'medium':
        return `${base} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8`;
      case 'large':
        return `${base} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`;
      default:
        return `${base} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8`;
    }
  };

  if (pages.length === 0) {
    return (
        <div 
            className={`flex-grow flex flex-col items-center justify-center p-8 text-center transition-colors ${
                dropIndex !== null ? 'bg-accent-50/50 dark:bg-accent-900/20' : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={() => setDropIndex(null)}
        >
            <div className={`max-w-md transition-all duration-200 ${
                dropIndex !== null ? 'scale-105' : 'scale-100'
            }`}>
                <div className={`w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600 transition-colors ${
                    dropIndex !== null ? 'text-accent-500 dark:text-accent-400' : ''
                }`}>
                    {ICONS.logo}
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('dragDrop.emptyFile')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('dragDrop.emptyFileDescription')}
                </p>
                {dropIndex !== null && (
                    <div className="mt-4 px-4 py-2 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg text-sm font-medium">
                        ✨ {t('dragDrop.processing')}
                    </div>
                )}
            </div>
        </div>
    );
  }

  let pageElements = pages.map((page) => {
    const isSelected = selectedPages.includes(page.id);
    const selectionIndex = isSelected ? selectedPages.indexOf(page.id) : undefined;
    const isBeingDragged = draggedPageIds?.includes(page.id) ?? false;
    return (
        <div
            id={`page-wrapper-${page.id}`}
            key={page.id}
            data-page-id={page.id}
            draggable
            onDragStart={(e) => handleDragStart(e, page.id)}
            onDragEnd={handleDragEnd}
            onClick={(e) => handleSelection(page.id, e)}
            className={`cursor-pointer transition-all duration-500 ease-in-out relative aspect-square ${isBeingDragged ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
        >
          <PageThumbnail pageInfo={page} isSelected={isSelected} isDimmed={isGloballyDragging && !isBeingDragged} selectionIndex={selectionIndex} />
        </div>
    );
  });
  
  if (dropIndex !== null && dropIndex > -1 && draggedPageIds) {
    const indicator = <div key="drop-indicator" id="drop-indicator" className="aspect-square"><DropIndicator /></div>;
    const remainingPages = pageElements.filter(el => !draggedPageIds.includes(el.key as string));
    
    let displayIndex = dropIndex;
    
    remainingPages.splice(displayIndex, 0, indicator);
    pageElements = remainingPages;
  }
  
  return (
    <div 
        ref={gridRef}
        className={getGridClasses()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setDropIndex(null)}
        onClick={(e) => { if(e.target === gridRef.current) dispatch({ type: 'DESELECT_ALL_PAGES', payload: { fileId } })}}
    >
      {pageElements}
    </div>
  );
};

export default PageGrid;