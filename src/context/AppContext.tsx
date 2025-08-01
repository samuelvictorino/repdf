import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppState, Action, AppContextType, UndoableState, UIState, Theme, OutputFile } from '../types';
import { DEFAULT_ACCENT } from '../constants';
import { detectBrowserLanguage } from '../i18n';

const initialState: AppState = {
  undoableState: {
    past: [],
    present: {
      files: [],
      pages: {},
      loadedDocs: {},
      selectedPageIds: {},
      activeFileId: null,
    },
    future: [],
  },
  uiState: {
    theme: Theme.DARK, // Default to dark theme
    accentColor: DEFAULT_ACCENT,
    language: detectBrowserLanguage(), // Auto-detect browser language
    activeModal: null,
    notifications: [],
    isDragging: false,
    importLoading: false,
    contextualMenu: null,
    renameTargetId: null,
    draggedPageIds: null,
    confirmCloseInfo: null,
    aiSuggestionInfo: null,
    deleteConfirmationInfo: null,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  const { past, present, future } = state.undoableState;
  const { uiState } = state;

  switch (action.type) {
    // --- UNDOABLE ACTIONS ---
    case 'UNDO': {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        ...state,
        undoableState: {
          past: newPast,
          present: previous,
          future: [present, ...future],
        },
      };
    }
    case 'REDO': {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        ...state,
        undoableState: {
          past: [...past, present],
          present: next,
          future: newFuture,
        },
      };
    }
    case 'ADD_FILES': {
      const { files, pages, loadedDocs } = action.payload;
      const newPresent: UndoableState = {
        ...present,
        files: [...present.files, ...files],
        pages: { ...present.pages, ...pages },
        loadedDocs: { ...present.loadedDocs, ...loadedDocs },
        selectedPageIds: {
          ...present.selectedPageIds,
          ...files.reduce((acc, file) => ({...acc, [file.id]: [] }), {})
        },
        activeFileId: present.activeFileId ?? files[0]?.id,
      };
      return {
        ...state,
        undoableState: {
          past: [...past, present],
          present: newPresent,
          future: [],
        },
        uiState: { ...uiState, importLoading: false }
      };
    }
    case 'CREATE_EMPTY_FILE': {
        const untitledRegex = /^Untitled(?:-(\d+))?$/;
        let maxNum = 0;
        present.files.forEach(f => {
            const match = f.name.match(untitledRegex);
            if(match) {
                if (match[1]) {
                    maxNum = Math.max(maxNum, parseInt(match[1], 10));
                } else {
                    maxNum = Math.max(maxNum, 1);
                }
            }
        });
        const newName = maxNum > 0 ? `Untitled-${maxNum + 1}` : 'Untitled';

        const newFile: OutputFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            name: newName,
            pageIds: []
        };

        const newPresent: UndoableState = {
            ...present,
            files: [...present.files, newFile],
            selectedPageIds: {...present.selectedPageIds, [newFile.id]: [] },
            activeFileId: newFile.id
        };
        
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'RENAME_FILE': {
        const { fileId, newName } = action.payload;
        const newPresent: UndoableState = {
            ...present,
            files: present.files.map(f => f.id === fileId ? {...f, name: newName} : f)
        };
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'CLOSE_FILE': {
        const fileIdToClose = action.payload;
        const newFiles = present.files.filter(f => f.id !== fileIdToClose);
        const { [fileIdToClose]: _, ...newSelectedPageIds } = present.selectedPageIds;
        
        let newActiveFileId = present.activeFileId;
        if (newActiveFileId === fileIdToClose) {
            const closingIndex = present.files.findIndex(f => f.id === fileIdToClose);
            newActiveFileId = newFiles[closingIndex]?.id ?? newFiles[closingIndex - 1]?.id ?? null;
        }

        const newPresent: UndoableState = {
            ...present,
            files: newFiles,
            selectedPageIds: newSelectedPageIds,
            activeFileId: newActiveFileId
        };
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'DELETE_SELECTED_PAGES': {
        if (!present.activeFileId) return state;
        const activeFile = present.files.find(f => f.id === present.activeFileId);
        if (!activeFile) return state;

        const selectedIds = present.selectedPageIds[present.activeFileId] || [];
        if(selectedIds.length === 0) return state;

        const selectedIdSet = new Set(selectedIds);
        const newPageIds = activeFile.pageIds.filter(id => !selectedIdSet.has(id));
        const newFiles = present.files.map(f => f.id === present.activeFileId ? {...f, pageIds: newPageIds} : f);
        
        const newPresent: UndoableState = {
            ...present,
            files: newFiles,
            selectedPageIds: { ...present.selectedPageIds, [present.activeFileId]: [] }
        };
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'ROTATE_SELECTED_PAGES': {
        if (!present.activeFileId) return state;
        const selectedIds = present.selectedPageIds[present.activeFileId] || [];
        if(selectedIds.length === 0) return state;
        
        const newPages = { ...present.pages };
        selectedIds.forEach(id => {
            const page = newPages[id];
            if (page) {
                newPages[id] = { ...page, rotation: ((page.rotation + action.payload + 360) % 360) as (0|90|180|270) };
            }
        });

        const newPresent: UndoableState = { ...present, pages: newPages };
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'REORDER_PAGES': {
        const { fileId, dragIds, dropIndex } = action.payload;
        const file = present.files.find(f => f.id === fileId);
        if (!file) return state;
        
        const currentPageIds = file.pageIds;
        const remainingPages = currentPageIds.filter(id => !dragIds.includes(id));
        
        const reorderedDraggedPages = currentPageIds.filter(id => dragIds.includes(id));

        const newPageIds = [
            ...remainingPages.slice(0, dropIndex),
            ...reorderedDraggedPages,
            ...remainingPages.slice(dropIndex)
        ];

        const newFiles = present.files.map(f => f.id === fileId ? { ...f, pageIds: newPageIds } : f);
        const newPresent: UndoableState = { ...present, files: newFiles };
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'MOVE_PAGES_TO_FILE': {
        const { sourceFileId, targetFileId, pageIds, copy, dropIndex } = action.payload;
        const sourceFile = present.files.find(f => f.id === sourceFileId);
        const targetFile = present.files.find(f => f.id === targetFileId);

        if (!sourceFile || !targetFile) return state;
        
        let newPages = { ...present.pages };
        let newPageIdsToMove = pageIds;

        if (copy) {
            newPageIdsToMove = pageIds.map(id => {
                const newId = `page_${Date.now()}_${Math.random()}`;
                newPages[newId] = { ...newPages[id], id: newId };
                return newId;
            });
        }
        
        const targetPages = [...targetFile.pageIds];
        targetPages.splice(dropIndex, 0, ...newPageIdsToMove);

        let newSourcePageIds = sourceFile.pageIds;
        let newSelectedPageIds = { ...present.selectedPageIds };

        if (!copy) {
            newSourcePageIds = sourceFile.pageIds.filter(id => !pageIds.includes(id));
            newSelectedPageIds[sourceFileId] = [];
        }

        const newFiles = present.files.map(f => {
            if (f.id === sourceFileId) return { ...f, pageIds: newSourcePageIds };
            if (f.id === targetFileId) return { ...f, pageIds: targetPages };
            return f;
        });

        const newPresent: UndoableState = { ...present, files: newFiles, pages: newPages, selectedPageIds: newSelectedPageIds };
        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] }
        };
    }
    case 'MOVE_PAGES_TO_NEW_FILE': {
        const { sourceFileId, pageIds } = action.payload;
        const sourceFile = present.files.find(f => f.id === sourceFileId);
        if (!sourceFile) return state;

        const newFile: OutputFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            name: "Untitled",
            pageIds: pageIds
        };
        
        const newSourcePageIds = sourceFile.pageIds.filter(id => !pageIds.includes(id));
        const newFiles = present.files.map(f => 
            f.id === sourceFileId ? { ...f, pageIds: newSourcePageIds } : f
        );
        newFiles.push(newFile);
        
        const newSelectedPageIds = {
            ...present.selectedPageIds,
            [sourceFileId]: [],
            [newFile.id]: []
        };
        
        const newPresent: UndoableState = {
            ...present,
            files: newFiles,
            selectedPageIds: newSelectedPageIds,
            activeFileId: newFile.id
        };

        return {
            ...state,
            undoableState: { past: [...past, present], present: newPresent, future: [] },
            uiState: { ...uiState, renameTargetId: newFile.id }
        };
    }
     case 'START_OCR': {
        const { pageIds } = action.payload;
        const newPages = { ...present.pages };
        pageIds.forEach(id => {
            if (newPages[id]) newPages[id] = { ...newPages[id], isOcrProcessing: true };
        });
        const newPresent: UndoableState = { ...present, pages: newPages };
        return { ...state, undoableState: { past: [...past, present], present: newPresent, future: [] } };
    }
    case 'FINISH_OCR': {
        const { pageId, text, error } = action.payload;
        const newPages = { ...present.pages };
        if (newPages[pageId]) {
            newPages[pageId] = { ...newPages[pageId], isOcrProcessing: false, ocrText: text };
        }
        const newPresent: UndoableState = { ...present, pages: newPages };
        // Avoid creating an undo state for this, as it's a background process result
        return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
    }
    case 'SET_ACTIVE_FILE': {
        const newPresent: UndoableState = { ...present, activeFileId: action.payload };
        // Don't create undo state for just switching tabs
        return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
    }
    case 'REORDER_FILES': {
        const { startIndex, endIndex } = action.payload;
        const newFiles = [...present.files];
        const [removed] = newFiles.splice(startIndex, 1);
        newFiles.splice(endIndex, 0, removed);
        const newPresent: UndoableState = { ...present, files: newFiles };
        return { ...state, undoableState: { past: [...past, present], present: newPresent, future: [] } };
    }
    case 'TOGGLE_PAGE_SELECTION': {
        const { fileId, pageId, ctrl, shift } = action.payload;
        const currentSelection = present.selectedPageIds[fileId] || [];
        const file = present.files.find(f => f.id === fileId);
        if(!file) return state;

        if (shift) {
            const lastSelected = currentSelection[currentSelection.length - 1];
            if(lastSelected){
                const allIds = file.pageIds;
                const a = allIds.indexOf(lastSelected);
                const b = allIds.indexOf(pageId);
                const from = Math.min(a, b);
                const to = Math.max(a, b);
                const newSelection = [...currentSelection];
                for(let i=from; i<=to; i++){
                    if (!newSelection.includes(allIds[i])) {
                        newSelection.push(allIds[i]);
                    }
                }
                 const newPresent: UndoableState = {
                    ...present,
                    selectedPageIds: { ...present.selectedPageIds, [fileId]: newSelection },
                };
                return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
            }
        } 
        
        if (ctrl) {
            const pageIndex = currentSelection.indexOf(pageId);
            if (pageIndex !== -1) {
                // Remove from selection (preserve order)
                const newSelection = currentSelection.filter(id => id !== pageId);
                const newPresent: UndoableState = {
                    ...present,
                    selectedPageIds: { ...present.selectedPageIds, [fileId]: newSelection },
                };
                return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
            } else {
                // Add to selection (append to preserve order)
                const newSelection = [...currentSelection, pageId];
                const newPresent: UndoableState = {
                    ...present,
                    selectedPageIds: { ...present.selectedPageIds, [fileId]: newSelection },
                };
                return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
            }
        } else {
            // Single selection logic
            if (currentSelection.includes(pageId) && currentSelection.length === 1) {
                // Deselect if it's the only selected item
                const newPresent: UndoableState = {
                    ...present,
                    selectedPageIds: { ...present.selectedPageIds, [fileId]: [] },
                };
                return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
            } else {
                // Select only this page
                const newPresent: UndoableState = {
                    ...present,
                    selectedPageIds: { ...present.selectedPageIds, [fileId]: [pageId] },
                };
                return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
            }
        }
    }
     case 'SELECT_SINGLE_PAGE': {
        const { fileId, pageId } = action.payload;
        const newSelection = [pageId];
        const newPresent: UndoableState = {
            ...present,
            selectedPageIds: { ...present.selectedPageIds, [fileId]: newSelection }
        };
        return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
    }
    case 'DESELECT_ALL_PAGES': {
        const { fileId } = action.payload;
        const newPresent: UndoableState = {
            ...present,
            selectedPageIds: { ...present.selectedPageIds, [fileId]: [] },
        };
        return { ...state, undoableState: { ...state.undoableState, present: newPresent } };
    }
    // --- UI ACTIONS ---
    case 'SET_THEME':
      return { ...state, uiState: { ...uiState, theme: action.payload } };
    case 'SET_ACCENT_COLOR':
      return { ...state, uiState: { ...uiState, accentColor: action.payload } };
    case 'SET_LANGUAGE':
      return { ...state, uiState: { ...uiState, language: action.payload } };
    case 'SHOW_MODAL':
      return { ...state, uiState: { ...uiState, activeModal: action.payload.type, modalPayload: action.payload.modalPayload } };
    case 'HIDE_MODAL':
      return { ...state, uiState: { ...uiState, activeModal: null, modalPayload: undefined } };
    case 'SHOW_CONTEXTUAL_MENU':
        return { ...state, uiState: { ...uiState, contextualMenu: action.payload } };
    case 'HIDE_CONTEXTUAL_MENU':
        return { ...state, uiState: { ...uiState, contextualMenu: null } };
    case 'ADD_NOTIFICATION':
      const newNotification = { ...action.payload, id: `notif_${Date.now()}`, timestamp: Date.now(), read: false };
      return { ...state, uiState: { ...uiState, notifications: [newNotification, ...uiState.notifications].slice(0, 50) } };
    case 'DISMISS_NOTIFICATION':
      return { ...state, uiState: { ...uiState, notifications: uiState.notifications.filter(n => n.id !== action.payload) } };
    case 'CLEAR_NOTIFICATIONS':
        return { ...state, uiState: { ...uiState, notifications: [] } };
    case 'MARK_NOTIFICATIONS_AS_READ':
        return { ...state, uiState: { ...uiState, notifications: uiState.notifications.map(n => ({...n, read: true})) } };
    case 'SET_DRAGGING':
      return { ...state, uiState: { ...uiState, isDragging: action.payload } };
    case 'SET_DRAGGED_IDS':
      return { ...state, uiState: { ...uiState, draggedPageIds: action.payload } };
    case 'SET_IMPORT_LOADING':
      return { ...state, uiState: { ...uiState, importLoading: action.payload } };
    case 'SET_RENAME_TARGET':
      return { ...state, uiState: { ...uiState, renameTargetId: action.payload } };
    case 'SET_CONFIRM_CLOSE_INFO':
      return { ...state, uiState: { ...uiState, confirmCloseInfo: action.payload } };
    case 'SET_AI_SUGGESTION_INFO':
      return { ...state, uiState: { ...uiState, aiSuggestionInfo: action.payload } };
    case 'SET_DELETE_CONFIRMATION_INFO':
      return { ...state, uiState: { ...uiState, deleteConfirmationInfo: action.payload } };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const hideContextualMenu = useCallback(() => {
    if (state.uiState.contextualMenu) {
        dispatch({ type: 'HIDE_CONTEXTUAL_MENU' });
    }
    if (state.uiState.confirmCloseInfo) {
        dispatch({ type: 'SET_CONFIRM_CLOSE_INFO', payload: null });
    }
    if (state.uiState.aiSuggestionInfo) {
        dispatch({ type: 'SET_AI_SUGGESTION_INFO', payload: null });
    }
    if (state.uiState.deleteConfirmationInfo) {
        dispatch({ type: 'SET_DELETE_CONFIRMATION_INFO', payload: null });
    }
  }, [state.uiState.contextualMenu, state.uiState.confirmCloseInfo, state.uiState.aiSuggestionInfo, state.uiState.deleteConfirmationInfo]);

  React.useEffect(() => {
    window.addEventListener('click', hideContextualMenu);
    window.addEventListener('contextmenu', hideContextualMenu);
    return () => {
        window.removeEventListener('click', hideContextualMenu);
        window.removeEventListener('contextmenu', hideContextualMenu);
    }
  }, [hideContextualMenu]);


  const contextValue = { state, dispatch };
  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};