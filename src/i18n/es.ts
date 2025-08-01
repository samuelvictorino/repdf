import { Translation } from '../types';

export const es: Translation = {
  // Headers and Navigation
  appTitle: 'RePDF - Suite Ejecutivo PDF',
  
  // File operations
  files: {
    newFile: 'Nuevo Archivo',
    unnamed: 'Sin título',
    close: 'Cerrar',
    export: 'Exportar',
    import: 'Importar PDFs',
    rename: 'Renombrar'
  },
  
  // Page operations
  pages: {
    page: 'Página',
    of: 'de',
    selected: 'seleccionada',
    selectedPlural: 'seleccionadas',
    delete: 'Eliminar página',
    deletePlural: 'Eliminar',
    rotate: 'Rotar',
    rotateLeft: 'Rotar a la izquierda',
    rotateRight: 'Rotar a la derecha',
    preview: 'Vista previa rápida',
    previewSelection: 'Vista previa de selección'
  },
  
  // Drag and drop
  dragDrop: {
    dropFilesHere: 'Suelta archivos PDF aquí o',
    clickToSelect: 'haz clic para seleccionar',
    supportedFormats: 'Formatos compatibles: PDF',
    emptyDocument: 'Este documento está vacío. Arrastra páginas aquí desde otros documentos.',
    processing: 'Procesando...'
  },
  
  // Context menu
  contextMenu: {
    copyPages: 'Copiar páginas',
    movePages: 'Mover páginas',
    createNewFile: 'Crear nuevo archivo'
  },
  
  // Modals
  modals: {
    settings: 'Configuración',
    export: 'Exportar Documentos',
    quickPreview: 'Vista Previa Rápida'
  },
  
  // Settings
  settings: {
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    accentColor: 'Color de Acento',
    chooseColor: 'Elige cualquier color que te guste.',
    language: 'Idioma',
    portuguese: 'Portugués (Brasil)',
    english: 'Inglés',
    spanish: 'Español'
  },
  
  // Export
  export: {
    filesToExport: 'Archivos para Exportar',
    exportMode: 'Modo de Exportación',
    combine: 'Combinar',
    separate: 'Separar',
    advancedOptions: 'Opciones Avanzadas',
    password: 'Contraseña (Opcional)',
    passwordPlaceholder: 'Ingresa contraseña para encriptar',
    autoSplit: 'Dividir archivo combinado automáticamente',
    ifLargerThan: 'si es mayor que',
    mb: 'MB',
    exporting: 'Exportando...',
    exportButton: 'Exportar'
  },
  
  // Notifications
  notifications: {
    notifications: 'Notificaciones',
    exportStarted: 'Iniciando exportación...',
    exportSuccess: '¡Exportación completada exitosamente!',
    exportError: 'Error en la exportación',
    ocrStarted: 'Iniciando OCR...',
    ocrCompleted: 'OCR completado',
    ocrError: 'Error de OCR',
    fileImported: 'archivo importado',
    filesImported: 'archivos importados',
    pageDeleted: 'página eliminada',
    pagesDeleted: 'páginas eliminadas',
    pageRotated: 'página rotada',
    pagesRotated: 'páginas rotadas',
    loading: 'Cargando',
    error: 'Error',
    success: 'Éxito',
    filesLoaded: 'Archivos cargados exitosamente',
    fileExported: 'Archivo exportado exitosamente',
    fileRenamed: 'Archivo renombrado exitosamente',
    fileClosed: 'Archivo cerrado',
    pageAdded: 'Página agregada',
    pagesAdded: 'Páginas agregadas',
    pageMoved: 'Página movida',
    pagesMoved: 'Páginas movidas',
    pageCopied: 'Página copiada',
    pagesCopied: 'Páginas copiadas'
  },
  
  // Actions
  actions: {
    undo: 'Deshacer',
    redo: 'Rehacer',
    selectAll: 'Seleccionar Todo',
    deselectAll: 'Deseleccionar Todo',
    copy: 'Copiar',
    cut: 'Cortar',
    paste: 'Pegar',
    delete: 'Eliminar',
    close: 'Cerrar',
    cancel: 'Cancelar',
    save: 'Guardar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No'
  },
  
  // Keyboard shortcuts
  shortcuts: {
    ctrlZ: 'Ctrl+Z',
    ctrlY: 'Ctrl+Y',
    ctrlA: 'Ctrl+A',
    ctrlC: 'Ctrl+C',
    ctrlV: 'Ctrl+V',
    delete: 'Supr',
    escape: 'Esc',
    enter: 'Enter',
    space: 'Espacio'
  },
  
  // Status messages
  status: {
    loading: 'Cargando...',
    processing: 'Procesando...',
    saving: 'Guardando...',
    ready: 'Listo',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información'
  },
  
  // Error messages
  errors: {
    fileNotSupported: 'Formato de archivo no compatible',
    fileTooBig: 'Archivo demasiado grande',
    networkError: 'Error de red',
    unknownError: 'Error desconocido',
    cannotRender: 'No se puede renderizar la página',
    cannotExport: 'No se puede exportar el archivo',
    cannotImport: 'No se puede importar el archivo'
  },

  // Confirmations
  confirmations: {
    deletePage: '¿Eliminar página?',
    deleteMultiplePages: '¿Eliminar {count} páginas?',
    closeFile: '¿Cerrar archivo?',
    thisActionCannotBeUndone: 'Esta acción no se puede deshacer',
    areYouSure: '¿Estás seguro?'
  },

  // AI Features
  ai: {
    suggestFileName: 'Sugerir nombre con IA',
    generating: 'Generando...',
    apply: 'Aplicar',
    regenerate: 'Regenerar',
    aiSuggestion: 'Sugerencia de IA',
    error: 'Error al generar sugerencia',
    offline: 'IA sin conexión disponible',
    cloud: 'IA en la nube disponible'
  },

  // Quick Preview
  quickPreview: {
    title: 'Vista Previa Rápida',
    of: 'de',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    resetZoom: 'Restablecer Zoom',
    close: 'Cerrar Vista Previa'
  },

  // Welcome/Empty State
  welcome: {
    title: 'Bienvenido a RePDF',
    subtitle: 'Suite Ejecutivo PDF',
    dragAndDrop: 'Arrastra y suelta archivos PDF aquí',
    or: 'o',
    clickToSelect: 'haz clic para seleccionar archivos',
    supportedFormats: 'Formatos soportados: PDF',
    features: {
      organize: 'Organizar',
      merge: 'Combinar',
      split: 'Dividir',
      rotate: 'Rotar',
      delete: 'Eliminar',
      export: 'Exportar'
    }
  },

  // Keyboard Shortcuts Descriptions
  shortcutDesc: {
    undo: 'Deshacer la última acción',
    redo: 'Rehacer la última acción deshecha',
    selectAll: 'Seleccionar todas las páginas',
    delete: 'Eliminar páginas seleccionadas',
    copy: 'Copiar páginas seleccionadas',
    paste: 'Pegar páginas copiadas'
  }
};