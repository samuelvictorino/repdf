import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PageThumbnailWrapper from './PageThumbnailWrapper';
import Icon from './icons/Icon';

const ActiveFileContentArea: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { loadedPdfDocuments, activeDocumentId } = state;

  const activeDocument = loadedPdfDocuments.find(doc => doc.id === activeDocumentId);

  const [draggedPageIds, setDraggedPageIds] = useState<string[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, pageId: string) => {
    const selectedPages = activeDocument?.pageThumbnails.filter(p => p.selected).map(p => p.id) || [];
    if (!selectedPages.includes(pageId)) {
      // If the dragged page is not selected, select only it
      dispatch({ type: 'UPDATE_PAGE_SELECTION', payload: { documentId: activeDocumentId!, pageId, selected: true } });
      setDraggedPageIds([pageId]);
    } else {
      setDraggedPageIds(selectedPages);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(selectedPages));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate drop position based on mouse position
    const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
    const index = afterElement ? 
      Array.from(e.currentTarget.children).indexOf(afterElement) : 
      activeDocument?.pageThumbnails.length || 0;
    
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragOverIndex !== null && activeDocumentId && activeDocument && draggedPageIds.length > 0) {
      // Calculate the actual insertion index, accounting for removed items
      let insertIndex = dragOverIndex;
      
      // If we're moving items within the same document, adjust for removed items
      const draggedIndices = draggedPageIds.map(id => 
        activeDocument.pageThumbnails.findIndex(p => p.id === id)
      ).filter(index => index !== -1).sort((a, b) => a - b);
      
      // Adjust insertion index if we're moving items before the drop position
      for (const draggedIndex of draggedIndices) {
        if (draggedIndex < insertIndex) {
          insertIndex--;
        }
      }
      
      dispatch({
        type: 'REORDER_PAGES',
        payload: {
          documentId: activeDocumentId,
          pageIds: draggedPageIds,
          newIndex: Math.max(0, insertIndex),
        },
      });
    }
    setDraggedPageIds([]);
    setDragOverIndex(null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear drag over index if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const getDragAfterElement = (container: Element, y: number) => {
    const draggableElements = [...container.querySelectorAll('[draggable="true"]:not(.opacity-50)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null as Element | null }).element;
  };

  const handlePageClick = (pageId: string, ctrlKey: boolean, shiftKey: boolean) => {
    if (!activeDocumentId) return;

    const currentPage = activeDocument?.pageThumbnails.find(p => p.id === pageId);
    if (!currentPage) return;

    if (ctrlKey) {
      dispatch({
        type: 'UPDATE_PAGE_SELECTION',
        payload: { documentId: activeDocumentId, pageId, selected: !currentPage.selected },
      });
    } else if (shiftKey) {
      // Implement shift-click selection logic
      const selectedPages = activeDocument?.pageThumbnails.filter(p => p.selected);
      if (selectedPages && selectedPages.length > 0 && activeDocument) {
        const lastSelectedPage = selectedPages[selectedPages.length - 1];
        const startIndex = activeDocument.pageThumbnails.findIndex(p => p.id === lastSelectedPage.id);
        const endIndex = activeDocument.pageThumbnails.findIndex(p => p.id === pageId);

        const [start, end] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];

        activeDocument.pageThumbnails.forEach((page, index) => {
          if (index >= start && index <= end) {
            dispatch({
              type: 'UPDATE_PAGE_SELECTION',
              payload: { documentId: activeDocumentId, pageId: page.id, selected: true },
            });
          } else if (!selectedPages.some(p => p.id === page.id)) {
            dispatch({
              type: 'UPDATE_PAGE_SELECTION',
              payload: { documentId: activeDocumentId, pageId: page.id, selected: false },
            });
          }
        });
      } else {
        dispatch({
          type: 'UPDATE_PAGE_SELECTION',
          payload: { documentId: activeDocumentId, pageId, selected: true },
        });
      }
    } else {
      // Single click: deselect all others, select this one
      activeDocument?.pageThumbnails.forEach(page => {
        dispatch({
          type: 'UPDATE_PAGE_SELECTION',
          payload: { documentId: activeDocumentId, pageId: page.id, selected: page.id === pageId },
        });
      });
    }
  };

  const handleDeleteSelected = () => {
    if (!activeDocumentId || !activeDocument) return;
    const selectedPageIds = activeDocument.pageThumbnails.filter(p => p.selected).map(p => p.id);
    if (selectedPageIds.length > 0) {
      dispatch({ type: 'DELETE_PAGES', payload: { documentId: activeDocumentId, pageIds: selectedPageIds } });
    }
  };

  const handleRotateSelected = () => {
    if (!activeDocumentId || !activeDocument) return;
    activeDocument.pageThumbnails.forEach(page => {
      if (page.selected) {
        const newRotation = (page.rotation + 90) % 360;
        dispatch({ type: 'UPDATE_PAGE_ROTATION', payload: { documentId: activeDocumentId, pageId: page.id, rotation: newRotation } });
      }
    });
  };

  if (!activeDocument) {
    return (
      <div className="card h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mb-6">
          <Icon name="document-text" size="xl" className="text-text-tertiary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Este contêiner de arquivo está vazio
        </h3>
        <p className="text-text-secondary mb-6 max-w-md">
          Arraste páginas para cá ou abra novos PDFs para começar a organizar seus documentos.
        </p>
        <button className="btn-primary">
          <Icon name="folder-open" size="sm" />
          Abrir Arquivos
        </button>
      </div>
    );
  }

  const selectedPages = activeDocument!.pageThumbnails.filter(p => p.selected);
  const selectedCount = selectedPages.length;

  return (
    <div className="card h-full flex flex-col">
      {/* Document Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="document-text" size="md" className="text-primary-500" />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{activeDocument!.name}</h2>
            <p className="text-sm text-text-secondary">
              {activeDocument!.pageThumbnails.length} página{activeDocument!.pageThumbnails.length !== 1 ? 's' : ''}
              {selectedCount > 0 && ` • ${selectedCount} selecionada${selectedCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            className="btn-secondary border-error-200 text-error-700 hover:bg-error-50 hover:border-error-300 disabled:opacity-50"
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0}
            title="Excluir páginas selecionadas"
          >
            <Icon name="trash" size="sm" />
            <span className="hidden sm:inline">Excluir</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handleRotateSelected}
            disabled={selectedCount === 0}
            title="Girar páginas selecionadas 90°"
          >
            <Icon name="arrow-clockwise" size="sm" />
            <span className="hidden sm:inline">Girar</span>  
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {activeDocument!.pageThumbnails.map((page, index) => (
            <React.Fragment key={page.id}>
              {dragOverIndex === index && (
                <div className="col-span-full h-1 bg-primary-500 rounded-full my-2 animate-pulse shadow-lg" />
              )}
              <PageThumbnailWrapper
                page={page}
                pdfDocument={activeDocument!.pdfDocument}
                onClick={handlePageClick}
                onDragStart={(e) => handleDragStart(e, page.id)}
              />
            </React.Fragment>
          ))}
          {dragOverIndex === activeDocument!.pageThumbnails.length && (
            <div className="col-span-full h-1 bg-primary-500 rounded-full my-2 animate-pulse shadow-lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveFileContentArea;
