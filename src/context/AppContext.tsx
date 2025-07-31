import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { useNotifications } from '../hooks/useNotifications';
import { useUndoRedo } from '../hooks/useUndoRedo';

// Tipos de Estado
export interface PageThumbnail {
  id: string;
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
  // Outros metadados da página, se necessário
}

export interface LoadedPdfDocument {
  id: string;
  name: string;
  pdfDocument: PDFDocumentProxy; // A instância do PDF.js
  pageThumbnails: PageThumbnail[];
}

export interface AppState {
  loadedPdfDocuments: LoadedPdfDocument[];
  activeDocumentId: string | null;
}

// Ações do Reducer
type Action =
  | { type: 'ADD_PDF_DOCUMENT'; payload: LoadedPdfDocument }
  | { type: 'SET_ACTIVE_DOCUMENT'; payload: string | null }
  | { type: 'REMOVE_PDF_DOCUMENT'; payload: string }
  | { type: 'UPDATE_PAGE_SELECTION'; payload: { documentId: string; pageId: string; selected: boolean } }
  | { type: 'UPDATE_PAGE_ROTATION'; payload: { documentId: string; pageId: string; rotation: number } }
  | { type: 'DELETE_PAGES'; payload: { documentId: string; pageIds: string[] } }
  | { type: 'REORDER_PAGES'; payload: { documentId: string; pageIds: string[]; newIndex: number } }
  | { type: 'RESTORE_STATE'; payload: AppState };


const initialState: AppState = {
  loadedPdfDocuments: [],
  activeDocumentId: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_PDF_DOCUMENT':
      return {
        ...state,
        loadedPdfDocuments: [...state.loadedPdfDocuments, action.payload],
        activeDocumentId: state.activeDocumentId === null ? action.payload.id : state.activeDocumentId,
      };
    case 'SET_ACTIVE_DOCUMENT':
      return {
        ...state,
        activeDocumentId: action.payload,
      };
    case 'REMOVE_PDF_DOCUMENT':
      const filteredDocs = state.loadedPdfDocuments.filter(doc => doc.id !== action.payload);
      const newActiveDocumentId = state.activeDocumentId === action.payload
        ? (filteredDocs.length > 0 ? filteredDocs[0].id : null)
        : state.activeDocumentId;
      return {
        ...state,
        loadedPdfDocuments: filteredDocs,
        activeDocumentId: newActiveDocumentId,
      };
    case 'UPDATE_PAGE_SELECTION':
      return {
        ...state,
        loadedPdfDocuments: state.loadedPdfDocuments.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                pageThumbnails: doc.pageThumbnails.map(page =>
                  page.id === action.payload.pageId ? { ...page, selected: action.payload.selected } : page
                ),
              }
            : doc
        ),
      };
    case 'UPDATE_PAGE_ROTATION':
      return {
        ...state,
        loadedPdfDocuments: state.loadedPdfDocuments.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                pageThumbnails: doc.pageThumbnails.map(page =>
                  page.id === action.payload.pageId ? { ...page, rotation: action.payload.rotation } : page
                ),
              }
            : doc
        ),
      };
    case 'DELETE_PAGES':
      return {
        ...state,
        loadedPdfDocuments: state.loadedPdfDocuments.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                pageThumbnails: doc.pageThumbnails.filter(page => !action.payload.pageIds.includes(page.id)),
              }
            : doc
        ),
      };
    case 'REORDER_PAGES':
      return {
        ...state,
        loadedPdfDocuments: state.loadedPdfDocuments.map(doc => {
          if (doc.id === action.payload.documentId) {
            const pagesToMove = doc.pageThumbnails.filter(page => action.payload.pageIds.includes(page.id));
            const remainingPages = doc.pageThumbnails.filter(page => !action.payload.pageIds.includes(page.id));
            const newPages = [...remainingPages];
            newPages.splice(action.payload.newIndex, 0, ...pagesToMove);
            return { ...doc, pageThumbnails: newPages };
          }
          return doc;
        }),
      };
    case 'RESTORE_STATE':
      return action.payload;
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  notifications: ReturnType<typeof useNotifications>;
  undoRedo: {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const notifications = useNotifications();
  const undoRedoHistory = useUndoRedo(initialState);

  // Enhanced dispatch that manages undo/redo history
  const enhancedDispatch = React.useCallback((action: Action) => {
    // Actions that should be undoable
    const undoableActions = [
      'UPDATE_PAGE_ROTATION',
      'DELETE_PAGES',
      'REORDER_PAGES',
      'REMOVE_PDF_DOCUMENT'
    ];

    // Save current state to history before making changes for undoable actions
    if (undoableActions.includes(action.type)) {
      undoRedoHistory.set(state);
    }

    dispatch(action);
  }, [state, undoRedoHistory]);

  // Custom undo that restores previous state
  const handleUndo = React.useCallback(() => {
    if (undoRedoHistory.canUndo) {
      undoRedoHistory.undo();
      // Replace current state with the undo state
      dispatch({ type: 'RESTORE_STATE', payload: undoRedoHistory.state } as Action);
    }
  }, [undoRedoHistory]);

  // Custom redo that moves forward in history
  const handleRedo = React.useCallback(() => {
    if (undoRedoHistory.canRedo) {
      undoRedoHistory.redo();
      // Replace current state with the redo state
      dispatch({ type: 'RESTORE_STATE', payload: undoRedoHistory.state } as Action);
    }
  }, [undoRedoHistory]);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch: enhancedDispatch, 
      notifications,
      undoRedo: {
        canUndo: undoRedoHistory.canUndo,
        canRedo: undoRedoHistory.canRedo,
        undo: handleUndo,
        redo: handleRedo,
        clearHistory: undoRedoHistory.clearHistory,
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
