export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface AccentColor {
  name: string;
  hex: string;
}

export type Language = 'pt-BR' | 'en' | 'es';

export interface Translation {
  [key: string]: string | Translation;
}

export interface PageInfo {
  id: string; // Unique ID for this page instance
  sourceDocId: string; // ID of the original PDFDocument
  sourcePageIndex: number; // 0-based index in the original document
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  ocrText?: string;
  isOcrProcessing?: boolean;
}

export interface OutputFile {
  id: string; // Unique ID for this output file container
  name: string;
  pageIds: string[];
}

export interface LoadedPdfDocument {
  id: string; // Unique ID for the loaded source document
  pdfDoc: any; // PDFDocumentProxy from pdf.js
  fileName: string;
}

export interface UndoableState {
  files: OutputFile[];
  pages: Record<string, PageInfo>;
  loadedDocs: Record<string, LoadedPdfDocument>;
  selectedPageIds: Record<string, string[]>; // fileId -> ordered array of pageIds
  activeFileId: string | null;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
  read: boolean;
}

export type ModalType = 'export' | 'settings' | 'quick-preview' | 'ocr-progress' | null;

export type QuickPreviewPayload = {
    pageIds: string[];
    startIndex: number;
};

export type ContextualMenuState = {
  x: number;
  y: number;
  sourceFileId: string;
  targetFileId: string;
  pageIds: string[];
  dropIndex: number;
} | null;

export interface AiSuggestionInfo {
  fileId: string;
  x: number;
  y: number;
  loading: boolean;
  suggestion?: string;
  error?: string;
  provider?: string;
}

export interface DeleteConfirmationInfo {
  x: number;
  y: number;
  pageCount: number;
  onConfirm: () => void;
}

export interface UIState {
  theme: Theme;
  accentColor: AccentColor;
  language: Language;
  activeModal: ModalType;
  modalPayload?: QuickPreviewPayload | any;
  notifications: Notification[];
  isDragging: boolean;
  importLoading: boolean;
  contextualMenu: ContextualMenuState;
  renameTargetId: string | null;
  draggedPageIds: string[] | null;
  confirmCloseInfo: { fileId: string; x: number; y: number } | null;
  aiSuggestionInfo: AiSuggestionInfo | null;
  deleteConfirmationInfo: DeleteConfirmationInfo | null;
  thumbnailScale: 'small' | 'medium' | 'large';
  settingsPopoverOpen: boolean;
  exportPopoverOpen: boolean;
}

export interface AppState {
  undoableState: {
    past: UndoableState[];
    present: UndoableState;
    future: UndoableState[];
  };
  uiState: UIState;
}

export type Action =
  | { type: 'ADD_FILES'; payload: { files: OutputFile[], pages: Record<string, PageInfo>, loadedDocs: Record<string, LoadedPdfDocument> } }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'RENAME_FILE'; payload: { fileId: string; newName: string } }
  | { type: 'CLOSE_FILE'; payload: string }
  | { type: 'REORDER_FILES'; payload: { startIndex: number, endIndex: number } }
  | { type: 'CREATE_EMPTY_FILE' }
  | { type: 'TOGGLE_PAGE_SELECTION'; payload: { fileId: string; pageId: string; ctrl: boolean; shift: boolean } }
  | { type: 'SELECT_SINGLE_PAGE'; payload: { fileId: string, pageId: string } }
  | { type: 'DESELECT_ALL_PAGES'; payload: { fileId: string } }
  | { type: 'DELETE_SELECTED_PAGES' }
  | { type: 'ROTATE_SELECTED_PAGES'; payload: 90 | -90 }
  | { type: 'REORDER_PAGES'; payload: { fileId: string; dragIds: string[]; dropIndex: number } }
  | { type: 'MOVE_PAGES_TO_FILE'; payload: { sourceFileId: string; targetFileId: string; pageIds: string[]; copy: boolean, dropIndex: number } }
  | { type: 'MOVE_PAGES_TO_NEW_FILE'; payload: { sourceFileId: string; pageIds: string[] } }
  | { type: 'START_OCR'; payload: { pageIds: string[] } }
  | { type: 'FINISH_OCR'; payload: { pageId: string; text?: string; error?: boolean } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_ACCENT_COLOR'; payload: AccentColor }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SHOW_MODAL'; payload: { type: ModalType, modalPayload?: any } }
  | { type: 'HIDE_MODAL' }
  | { type: 'SHOW_CONTEXTUAL_MENU', payload: Omit<NonNullable<ContextualMenuState>, 'pageIds'> & { pageIds: string[] } }
  | { type: 'HIDE_CONTEXTUAL_MENU' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'MARK_NOTIFICATIONS_AS_READ' }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_DRAGGED_IDS'; payload: string[] | null }
  | { type: 'SET_IMPORT_LOADING'; payload: boolean }
  | { type: 'SET_RENAME_TARGET'; payload: string | null }
  | { type: 'SET_CONFIRM_CLOSE_INFO'; payload: { fileId: string; x: number; y: number } | null }
  | { type: 'SET_AI_SUGGESTION_INFO'; payload: AiSuggestionInfo | null }
  | { type: 'SET_DELETE_CONFIRMATION_INFO'; payload: DeleteConfirmationInfo | null }
  | { type: 'SET_THUMBNAIL_SCALE'; payload: 'small' | 'medium' | 'large' }
  | { type: 'SET_SETTINGS_POPOVER'; payload: boolean }
  | { type: 'SET_EXPORT_POPOVER'; payload: boolean };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}