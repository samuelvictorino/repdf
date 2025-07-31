import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Icon from './icons/Icon';

const FileTabsBar: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { loadedPdfDocuments, activeDocumentId } = state;
  const [closingTab, setClosingTab] = useState<string | null>(null);

  const handleTabClick = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: id });
  };

  const handleCloseTab = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setClosingTab(id);
    
    // Add a small delay for animation
    setTimeout(() => {
      dispatch({ type: 'REMOVE_PDF_DOCUMENT', payload: id });
      setClosingTab(null);
    }, 150);
  };

  const handleAddNewTab = () => {
    // This would trigger the file picker - for now just a placeholder
    console.log('Add new tab clicked');
  };

  if (loadedPdfDocuments.length === 0) {
    return null;
  }

  return (
    <nav className="bg-bg-tertiary border-b border-border px-6 py-0 flex items-center overflow-x-auto">
      <div className="flex items-center space-x-1">
        {loadedPdfDocuments.map((doc) => {
          const isActive = doc.id === activeDocumentId;
          const isClosing = closingTab === doc.id;
          
          return (
            <div
              key={doc.id}
              className={`
                relative flex items-center px-4 py-3 cursor-pointer transition-all duration-150 ease-in-out border-b-2
                ${isActive 
                  ? 'bg-bg-secondary border-primary-500 text-text-primary' 
                  : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }
                ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                group
              `}
              onClick={() => handleTabClick(doc.id)}
            >
              {/* File icon */}
              <Icon 
                name="document-text" 
                size="xs" 
                className={`mr-2 transition-colors ${isActive ? 'text-primary-500' : 'text-text-tertiary'}`} 
              />
              
              {/* File name */}
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                {doc.name}
              </span>
              
              {/* Page count */}
              <span className="ml-2 text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded-full">
                {doc.pageThumbnails.length}
              </span>
              
              {/* Close button */}
              <button
                className={`
                  ml-2 p-1 rounded-full transition-all duration-150
                  ${isActive 
                    ? 'opacity-100 hover:bg-error-100 hover:text-error-600' 
                    : 'opacity-0 group-hover:opacity-100 hover:bg-neutral-200 hover:text-neutral-700'
                  }
                  focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                `}
                onClick={(e) => handleCloseTab(doc.id, e)}
                title={`Fechar ${doc.name}`}
              >
                <Icon name="x-mark" size="xs" />
              </button>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full" />
              )}
            </div>
          );
        })}
        
        {/* Add new tab button */}
        <button
          className="ml-2 p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-150"
          onClick={handleAddNewTab}
          title="Adicionar arquivo"
        >
          <Icon name="plus" size="sm" />
        </button>
      </div>
    </nav>
  );
};

export default FileTabsBar;
