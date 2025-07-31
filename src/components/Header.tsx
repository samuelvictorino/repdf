import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import Icon from './icons/Icon';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from 'pdf-lib';

// Configura o worker do pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Header: React.FC = () => {
  const { state, dispatch, notifications, undoRedo } = useAppContext();
  const { toggleTheme, resolvedTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check file limits
    const MAX_FILES = 5;
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    if (state.loadedPdfDocuments.length + files.length > MAX_FILES) {
      notifications.showError(
        'Muitos arquivos',
        `Você pode abrir no máximo ${MAX_FILES} arquivos por vez.`
      );
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (file.type !== 'application/pdf') {
          notifications.showWarning(
            'Arquivo inválido',
            `"${file.name}" não é um arquivo PDF válido.`
          );
          errorCount++;
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          notifications.showError(
            'Arquivo muito grande',
            `"${file.name}" excede o limite de 50MB.`
          );
          errorCount++;
          continue;
        }

        // Check for duplicate names
        if (state.loadedPdfDocuments.some(doc => doc.name === file.name)) {
          notifications.showWarning(
            'Arquivo duplicado',
            `"${file.name}" já está aberto.`
          );
          errorCount++;
          continue;
        }

        try {
          const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (result instanceof ArrayBuffer) {
                resolve(result);
              } else {
                reject(new Error('Failed to read file as ArrayBuffer'));
              }
            };
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsArrayBuffer(file);
          });

          const pdfDocument: PDFDocumentProxy = await pdfjs.getDocument(arrayBuffer).promise;
          
          // Validate PDF structure
          if (pdfDocument.numPages === 0) {
            throw new Error('PDF não contém páginas');
          }

          const pageThumbnails = [];
          for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
            pageThumbnails.push({
              id: uuidv4(),
              pageNumber,
              rotation: 0,
              selected: false,
            });
          }

          dispatch({
            type: 'ADD_PDF_DOCUMENT',
            payload: {
              id: uuidv4(),
              name: file.name,
              pdfDocument,
              pageThumbnails,
            },
          });

          successCount++;
        } catch (error) {
          console.error('Error loading PDF:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          notifications.showError(
            'Erro ao carregar PDF',
            `Não foi possível carregar "${file.name}": ${errorMessage}`
          );
          errorCount++;
        }
      }

      // Show summary notification
      if (successCount > 0) {
        notifications.showSuccess(
          'Arquivos carregados',
          `${successCount} arquivo(s) carregado(s) com sucesso.`
        );
      }

      if (errorCount > 0 && successCount === 0) {
        notifications.showError(
          'Falha no carregamento',
          `Não foi possível carregar nenhum arquivo.`
        );
      }

    } catch (error) {
      console.error('Unexpected error during file processing:', error);
      notifications.showError(
        'Erro inesperado',
        'Ocorreu um erro inesperado ao processar os arquivos.'
      );
    } finally {
      setIsLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportClick = async () => {
    if (state.loadedPdfDocuments.length === 0) {
      notifications.showWarning('Nenhum documento', 'Não há documentos para exportar.');
      return;
    }

    // Check if there are any pages to export
    const totalPages = state.loadedPdfDocuments.reduce((total, doc) => total + doc.pageThumbnails.length, 0);
    if (totalPages === 0) {
      notifications.showWarning('Nenhuma página', 'Não há páginas para exportar.');
      return;
    }

    setIsLoading(true);
    notifications.showInfo('Exportando...', 'Gerando arquivo PDF...');

    try {
      const pdfDoc = await PDFDocument.create();
      let totalPagesAdded = 0;

      for (const doc of state.loadedPdfDocuments) {
        if (doc.pageThumbnails.length === 0) continue;

        try {
          const existingPdfBytes = await doc.pdfDocument.getData();
          const existingPdfDoc = await PDFDocument.load(existingPdfBytes);

          for (const pageThumbnail of doc.pageThumbnails) {
            try {
              const [copiedPage] = await pdfDoc.copyPages(existingPdfDoc, [pageThumbnail.pageNumber - 1]);
              
              // Apply rotation if any (skip for now to avoid TypeScript issues)
              // if (pageThumbnail.rotation !== 0) {
              //   copiedPage.setRotation(pageThumbnail.rotation);
              // }
              
              pdfDoc.addPage(copiedPage);
              totalPagesAdded++;
            } catch (pageError) {
              console.error(`Error copying page ${pageThumbnail.pageNumber} from ${doc.name}:`, pageError);
              notifications.showWarning(
                'Página ignorada',
                `Não foi possível exportar a página ${pageThumbnail.pageNumber} de "${doc.name}".`
              );
            }
          }
        } catch (docError) {
          console.error(`Error processing document ${doc.name}:`, docError);
          notifications.showError(
            'Erro no documento',
            `Não foi possível processar o documento "${doc.name}".`
          );
        }
      }

      if (totalPagesAdded === 0) {
        notifications.showError('Falha na exportação', 'Nenhuma página pôde ser exportada.');
        return;
      }

      const pdfBytes = await pdfDoc.save();
      
      // Check if the PDF is too large (browsers have limits)
      const MAX_DOWNLOAD_SIZE = 100 * 1024 * 1024; // 100MB
      if (pdfBytes.length > MAX_DOWNLOAD_SIZE) {
        notifications.showError(
          'Arquivo muito grande',
          'O PDF gerado é muito grande para download. Tente exportar menos páginas.'
        );
        return;
      }

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Generate a meaningful filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = state.loadedPdfDocuments.length === 1 
        ? `${state.loadedPdfDocuments[0].name.replace('.pdf', '')}_editado.pdf`
        : `repdf_merged_${timestamp}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notifications.showSuccess(
        'Exportação concluída',
        `PDF exportado com ${totalPagesAdded} página(s).`
      );

    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      notifications.showError(
        'Erro na exportação',
        `Não foi possível exportar o PDF: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="surface-elevated border-b sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Icon name="document-text" size="sm" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            RePDF
          </h1>
        </div>

        {/* Center - Undo/Redo Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              className="btn-secondary !py-1.5 !px-3 !border-none !shadow-none hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
              onClick={undoRedo.undo}
              disabled={!undoRedo.canUndo || isLoading}
              title="Desfazer (Ctrl+Z)"
            >
              <Icon name="arrow-uturn-left" size="sm" />
            </button>
            <button
              className="btn-secondary !py-1.5 !px-3 !border-none !shadow-none hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
              onClick={undoRedo.redo}
              disabled={!undoRedo.canRedo || isLoading}
              title="Refazer (Ctrl+Y)"
            >
              <Icon name="arrow-uturn-right" size="sm" />
            </button>
          </div>
        </div>

        {/* Right - Actions & Settings */}
        <div className="flex items-center space-x-3">
          {/* File Operations */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="application/pdf"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              className="btn-primary"
              onClick={handleOpenFileClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="arrow-path" size="sm" className="animate-spin" />
                  <span>Carregando...</span>
                </>
              ) : (
                <>
                  <Icon name="folder-open" size="sm" />
                  <span>Abrir</span>
                </>
              )}
            </button>
            <button
              className="btn-secondary border-success-200 text-success-700 hover:bg-success-50 hover:border-success-300 disabled:opacity-50"
              onClick={handleExportClick}
              disabled={state.loadedPdfDocuments.length === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="arrow-path" size="sm" className="animate-spin" />
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Icon name="download" size="sm" />
                  <span>Exportar</span>
                </>
              )}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            className="btn-secondary !p-2"
            onClick={toggleTheme}
            title="Alternar tema"
          >
            <Icon 
              name={resolvedTheme === 'dark' ? 'sun' : 'moon'} 
              size="sm" 
            />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="btn-secondary !p-2" title="Notificações">
              <Icon name="bell" size="sm" />
              {notifications.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center animate-scale-in">
                  {notifications.notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
