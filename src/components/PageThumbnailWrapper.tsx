import React, { useEffect, useRef } from 'react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import type { PageThumbnail } from '../context/AppContext';

interface PageThumbnailWrapperProps {
  page: PageThumbnail;
  pdfDocument: PDFDocumentProxy;
  onClick: (pageId: string, ctrlKey: boolean, shiftKey: boolean) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, pageId: string) => void;
}

const PageThumbnailWrapper: React.FC<PageThumbnailWrapperProps> = ({
  page,
  pdfDocument,
  onClick,
  onDragStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;

      const pdfPage: PDFPageProxy = await pdfDocument.getPage(page.pageNumber);
      const viewport = pdfPage.getViewport({ scale: 0.5, rotation: page.rotation });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };
        await pdfPage.render(renderContext).promise;
      }
    };

    renderPage();
  }, [page, pdfDocument]);

  return (
    <div
      className={`
        relative group card cursor-pointer transition-all duration-200 p-3
        ${page.selected 
          ? 'ring-2 ring-primary-500 border-primary-200 bg-primary-50 dark:bg-primary-900/20 shadow-lg' 
          : 'border-border hover:border-primary-200 hover:shadow-md'
        }
        hover:scale-[1.02] active:scale-[0.98]
      `}
      onClick={(e) => onClick(page.id, e.ctrlKey || e.metaKey, e.shiftKey)}
      draggable
      onDragStart={(e) => {
        onDragStart(e, page.id);
        e.currentTarget.style.opacity = '0.6';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {/* Canvas */}
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto rounded-md shadow-sm" 
          style={{ 
            transform: `rotate(${page.rotation}deg)`,
            transition: 'transform 0.2s ease-in-out'
          }}
        />
        
        {/* Selection overlay */}
        {page.selected && (
          <div className="absolute inset-0 bg-primary-500/20 rounded-md" />
        )}
        
        {/* Selection indicator */}
        {page.selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path 
                d="M9.5 3.5L5 8L2.5 5.5" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Page info */}
      <div className="mt-3 text-center">
        <span className="text-sm font-medium text-text-primary">
          {page.pageNumber}
        </span>
        {page.rotation > 0 && (
          <span className="ml-2 text-xs text-text-tertiary bg-bg-tertiary px-2 py-1 rounded-full">
            {page.rotation}°
          </span>
        )}
      </div>
      
      {/* Hover actions */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-1">
          <button 
            className="w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Quick rotate action - would need to be implemented
              // TODO: Implement quick rotate functionality
            }}
            title="Girar 90°"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path 
                d="M8.5 3.5L6 6L8.5 8.5" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageThumbnailWrapper;
