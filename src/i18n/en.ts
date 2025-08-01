import { Translation } from '../types';

export const en: Translation = {
  // Headers and Navigation
  appTitle: 'RePDF - Executive PDF Suite',
  
  // File operations
  files: {
    newFile: 'New File',
    unnamed: 'Untitled',
    close: 'Close',
    export: 'Export',
    import: 'Import PDFs',
    rename: 'Rename'
  },
  
  // Page operations
  pages: {
    page: 'Page',
    of: 'of',
    selected: 'selected',
    selectedPlural: 'selected',
    delete: 'Delete page',
    deletePlural: 'Delete',
    rotate: 'Rotate',
    rotateLeft: 'Rotate left',
    rotateRight: 'Rotate right',
    preview: 'Quick preview',
    previewSelection: 'Preview selection'
  },
  
  // Drag and drop
  dragDrop: {
    dropFilesHere: 'Drop PDF files here or',
    clickToSelect: 'click to select',
    supportedFormats: 'Supported formats: PDF',
    emptyDocument: 'This document is empty. Drag pages here from other documents.',
    processing: 'Processing...'
  },
  
  // Context menu
  contextMenu: {
    copyPages: 'Copy pages',
    movePages: 'Move pages',
    createNewFile: 'Create new file'
  },
  
  // Modals
  modals: {
    settings: 'Settings',
    export: 'Export Documents',
    quickPreview: 'Quick Preview'
  },
  
  // Settings
  settings: {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    accentColor: 'Accent Color',
    chooseColor: 'Choose any color you like.',
    language: 'Language',
    portuguese: 'Portuguese (Brazil)',
    english: 'English',
    spanish: 'Spanish'
  },
  
  // Export
  export: {
    filesToExport: 'Files to Export',
    exportMode: 'Export Mode',
    combine: 'Combine',
    separate: 'Separate',
    advancedOptions: 'Advanced Options',
    password: 'Password (Optional)',
    passwordPlaceholder: 'Enter password to encrypt',
    autoSplit: 'Auto-split combined file',
    ifLargerThan: 'if larger than',
    mb: 'MB',
    exporting: 'Exporting...',
    exportButton: 'Export'
  },
  
  // Notifications
  notifications: {
    notifications: 'Notifications',
    exportStarted: 'Starting export...',
    exportSuccess: 'Export completed successfully!',
    exportError: 'Export failed',
    ocrStarted: 'Starting OCR...',
    ocrCompleted: 'OCR completed',
    ocrError: 'OCR error',
    fileImported: 'file imported',
    filesImported: 'files imported',
    pageDeleted: 'page deleted',
    pagesDeleted: 'pages deleted',
    pageRotated: 'page rotated',
    pagesRotated: 'pages rotated'
  },
  
  // Actions
  actions: {
    undo: 'Undo',
    redo: 'Redo',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    delete: 'Delete',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    ok: 'OK',
    yes: 'Yes',
    no: 'No'
  },
  
  // Keyboard shortcuts
  shortcuts: {
    ctrlZ: 'Ctrl+Z',
    ctrlY: 'Ctrl+Y',
    ctrlA: 'Ctrl+A',
    ctrlC: 'Ctrl+C',
    ctrlV: 'Ctrl+V',
    delete: 'Delete',
    escape: 'Esc',
    enter: 'Enter',
    space: 'Space'
  },
  
  // Status messages
  status: {
    loading: 'Loading...',
    processing: 'Processing...',
    saving: 'Saving...',
    ready: 'Ready',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },
  
  // Error messages
  errors: {
    fileNotSupported: 'File format not supported',
    fileTooBig: 'File too large',
    networkError: 'Network error',
    unknownError: 'Unknown error',
    cannotRender: 'Cannot render page',
    cannotExport: 'Cannot export file',
    cannotImport: 'Cannot import file'
  }
};