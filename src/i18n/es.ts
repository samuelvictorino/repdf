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
    pagesRotated: 'páginas rotadas'
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
  }
};