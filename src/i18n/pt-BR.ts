import { Translation } from '../types';

export const ptBR: Translation = {
  // Headers and Navigation
  appTitle: 'RePDF - Suíte Executiva PDF',
  
  // File operations
  files: {
    newFile: 'Novo Arquivo',
    unnamed: 'Sem nome',
    close: 'Fechar',
    export: 'Exportar',
    import: 'Importar PDFs',
    rename: 'Renomear'
  },
  
  // Page operations
  pages: {
    page: 'Página',
    of: 'de',
    selected: 'selecionada',
    selectedPlural: 'selecionadas',
    delete: 'Excluir página',
    deletePlural: 'Excluir',
    rotate: 'Girar',
    rotateLeft: 'Girar à esquerda',
    rotateRight: 'Girar à direita',
    preview: 'Visualização rápida',
    previewSelection: 'Visualizar seleção'
  },
  
  // Drag and drop
  dragDrop: {
    dropFilesHere: 'Solte arquivos PDF aqui ou',
    clickToSelect: 'clique para selecionar',
    supportedFormats: 'Formatos suportados: PDF',
    emptyDocument: 'Este documento está vazio. Arraste páginas de outros documentos para cá.',
    emptyFile: 'Arquivo vazio',
    emptyFileDescription: 'Este arquivo não possui páginas. Arraste páginas de outros documentos para adicionar conteúdo.',
    processing: 'Processando...'
  },
  
  // Context menu
  contextMenu: {
    copyPages: 'Copiar páginas',
    movePages: 'Mover páginas',
    createNewFile: 'Criar novo arquivo'
  },
  
  // Modals
  modals: {
    settings: 'Configurações',
    export: 'Exportar Documentos',
    quickPreview: 'Visualização Rápida'
  },
  
  // Settings
  settings: {
    theme: 'Tema',
    light: 'Claro',
    dark: 'Escuro',
    accentColor: 'Cor de Destaque',
    chooseColor: 'Escolha qualquer cor que gostar.',
    language: 'Idioma',
    portuguese: 'Português (Brasil)',
    english: 'Inglês',
    spanish: 'Espanhol'
  },
  
  // Export
  export: {
    filesToExport: 'Arquivos para Exportar',
    exportMode: 'Modo de Exportação',
    combine: 'Combinar',
    separate: 'Separar',
    advancedOptions: 'Opções Avançadas',
    password: 'Senha (Opcional)',
    passwordPlaceholder: 'Digite a senha para criptografar',
    autoSplit: 'Dividir arquivo combinado automaticamente',
    ifLargerThan: 'se maior que',
    mb: 'MB',
    exporting: 'Exportando...',
    exportButton: 'Exportar'
  },
  
  // AI
  ai: {
    provider: 'Provedor de IA',
    ollamaLocal: 'Ollama (Local)',
    geminiCloud: 'Gemini (Nuvem)',
    ollamaDescription: 'IA privada e offline. Instale em',
    geminiDescription: 'Configure a chave da API nas variáveis de ambiente.',
    analyzing: 'IA analisando...',
    suggests: 'IA sugere:',
    local: 'Local',
    cloud: 'Nuvem',
    clickToApply: 'Clique para aplicar • Digite manualmente para ignorar'
  },
  
  // Quick Preview
  quickPreview: {
    page: 'Página',
    of: 'de',
    zoomOut: 'Diminuir zoom (-)',
    zoomIn: 'Aumentar zoom (+)',
    resetZoom: 'Resetar zoom (0)',
    toggleThumbnails: 'Alternar miniaturas (T)',
    navigationHints: 'T: miniaturas • +/-: zoom • 0: resetar',
    clickThumbnail: 'Clique na miniatura para navegar • Pressione T para ocultar'
  },
  
  // Notifications
  notifications: {
    notifications: 'Notificações',
    exportStarted: 'Iniciando exportação...',
    exportSuccess: 'Exportação concluída com sucesso!',
    exportError: 'Falha na exportação',
    ocrStarted: 'Iniciando OCR...',
    ocrCompleted: 'OCR concluído',
    ocrError: 'Erro no OCR',
    fileImported: 'arquivo importado',
    filesImported: 'arquivos importados',
    pageDeleted: 'página excluída',
    pagesDeleted: 'páginas excluídas',
    pageRotated: 'página girada',
    pagesRotated: 'páginas giradas',
    noNewNotifications: 'Nenhuma notificação nova.',
    loading: 'Carregando',
    filesLoaded: 'Arquivos carregados com sucesso.',
    clearAll: 'Limpar tudo'
  },
  
  // Actions
  actions: {
    undo: 'Desfazer',
    redo: 'Refazer',
    selectAll: 'Selecionar Tudo',
    deselectAll: 'Desmarcar Tudo',
    copy: 'Copiar',
    cut: 'Recortar',
    paste: 'Colar',
    delete: 'Excluir',
    close: 'Fechar',
    cancel: 'Cancelar',
    save: 'Salvar',
    ok: 'OK',
    yes: 'Sim',
    no: 'Não',
    clear: 'Limpar'
  },
  
  // Confirmations
  confirmations: {
    deletePages: 'Excluir páginas?',
    deletePage: 'Excluir página?',
    deleteMultiplePages: 'Excluir {count} páginas?',
    thisActionCannotBeUndone: 'Esta ação não pode ser desfeita.',
    confirmDelete: 'Confirmar Exclusão'
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
    space: 'Espaço',
    ctrlClick: 'Ctrl/Cmd + Clique',
    shiftClick: 'Shift + Clique',
    doubleClickTab: 'Duplo Clique na Aba',
    dragDropPages: 'Arrastar e Soltar Páginas',
    dragDropTabs: 'Arrastar e Soltar Abas',
    aiIcon: 'Ícone IA'
  },
  
  // Status messages
  status: {
    loading: 'Carregando...',
    processing: 'Processando...',
    saving: 'Salvando...',
    ready: 'Pronto',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação'
  },
  
  // Error messages
  errors: {
    fileNotSupported: 'Formato de arquivo não suportado',
    fileTooBig: 'Arquivo muito grande',
    networkError: 'Erro de rede',
    unknownError: 'Erro desconhecido',
    cannotRender: 'Não foi possível renderizar a página',
    cannotExport: 'Não foi possível exportar o arquivo',
    cannotImport: 'Não foi possível importar o arquivo'
  },
  
  // Welcome screen
  welcome: {
    title: 'Bem-vindo ao RePDF',
    subtitle: 'Seu espaço de trabalho PDF privado e poderoso.',
    openFiles: 'Abrir Arquivos',
    orDrop: 'ou solte-os em qualquer lugar',
    shortcuts: 'Atalhos'
  },
  
  // Shortcut descriptions
  shortcutDesc: {
    undo: 'Desfazer última ação',
    redo: 'Refazer última ação',
    multiSelect: 'Selecionar múltiplas páginas',
    rangeSelect: 'Selecionar intervalo de páginas',
    rename: 'Renomear documento',
    dragPages: 'Reordenar ou mover para outro arquivo',
    dragTabs: 'Reordenar documentos para exportação',
    aiSuggest: 'Gerar nome inteligente',
    closeModal: 'Fechar modais e menus'
  }
};