import { LoadedPdfDocument, OutputFile, PageInfo } from '../types';

declare const pdfjsLib: any;
declare const PDFLib: any;

// Global window interface for PDF render task tracking
declare global {
  interface Window {
    activePdfRenderTasks?: Record<number, any>;
  }
}

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const loadPdfFromFiles = async (files: File[]): Promise<{ files: OutputFile[], pages: Record<string, PageInfo>, loadedDocs: Record<string, LoadedPdfDocument> }> => {
  const newFiles: OutputFile[] = [];
  const newPages: Record<string, PageInfo> = {};
  const newLoadedDocs: Record<string, LoadedPdfDocument> = {};

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const docId = `doc_${Date.now()}_${Math.random()}`;
      newLoadedDocs[docId] = { id: docId, pdfDoc, fileName: file.name };
      
      const fileId = `file_${Date.now()}_${Math.random()}`;
      const pageIds: string[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const pageId = `page_${Date.now()}_${Math.random()}`;
        
        newPages[pageId] = {
          id: pageId,
          sourceDocId: docId,
          sourcePageIndex: i - 1,
          width: viewport.width,
          height: viewport.height,
          rotation: page.rotate as (0|90|180|270),
        };
        pageIds.push(pageId);
      }

      newFiles.push({ id: fileId, name: file.name.replace(/\.pdf$/i, ''), pageIds });
    } catch (error) {
      console.error("Error loading PDF:", error);
      throw new Error(`Failed to load ${file.name}. It might be corrupted or password-protected.`);
    }
  }

  return { files: newFiles, pages: newPages, loadedDocs: newLoadedDocs };
};

export const renderPageToCanvas = (
  page: any, // PDFPageProxy
  canvas: HTMLCanvasElement
) => {
  const viewport = page.getViewport({ scale: 1 });
  const scale = Math.min(200 / viewport.width, 200 / viewport.height);
  const scaledViewport = page.getViewport({ scale, rotation: page.rotate });

  canvas.height = scaledViewport.height;
  canvas.width = scaledViewport.width;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');

  return page.render({ canvasContext: context, viewport: scaledViewport });
};

export const renderHighResPage = async (
    loadedDoc: LoadedPdfDocument,
    pageInfo: PageInfo,
    canvas: HTMLCanvasElement,
    scaleMultiplier: number = 1
): Promise<void> => {
    if(!canvas) return;
    const page = await loadedDoc.pdfDoc.getPage(pageInfo.sourcePageIndex + 1);
    
    // Render at a high resolution for clarity, with optional scale multiplier
    const targetWidth = 1200 * scaleMultiplier;
    const viewportUnrotated = page.getViewport({ scale: 1 });
    const scale = targetWidth / viewportUnrotated.width;
    const viewport = page.getViewport({ scale, rotation: pageInfo.rotation });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if(!context) throw new Error("Could not create canvas context");

    await page.render({ canvasContext: context, viewport }).promise;
};

export const extractTextFromPages = async (
  loadedDoc: LoadedPdfDocument,
  maxPages: number = 3
): Promise<string> => {
  const numPages = Math.min(loadedDoc.pdfDoc.numPages, maxPages);
  let extractedText = '';
  
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await loadedDoc.pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      
      if (pageText) {
        extractedText += pageText + '\n';
      }
    } catch (error) {
      console.warn(`Failed to extract text from page ${i}:`, error);
    }
  }
  
  return extractedText.trim();
};

export const getPageAsBase64 = async (
  loadedDoc: LoadedPdfDocument,
  pageInfo: PageInfo,
): Promise<string> => {
  const page = await loadedDoc.pdfDoc.getPage(pageInfo.sourcePageIndex + 1);
  
  // Render at a higher resolution for better OCR quality
  const targetWidth = 1024;
  const scale = targetWidth / page.getViewport({ scale: 1 }).width;
  const viewport = page.getViewport({ scale, rotation: pageInfo.rotation });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  if(!context) throw new Error("Could not create canvas context");

  await page.render({ canvasContext: context, viewport }).promise;
  
  // For Tesseract, we can pass the canvas directly, but base64 is also fine.
  return canvas.toDataURL('image/jpeg', 0.9);
};


export const exportPdf = async (
    outputFiles: OutputFile[],
    allPages: Record<string, PageInfo>,
    allLoadedDocs: Record<string, LoadedPdfDocument>,
    options: { combine: boolean; password?: string; split?: boolean; splitSizeMB?: number }
): Promise<void> => {
    if (outputFiles.length === 0) return;

    if (options.combine) {
        // Handle combined PDF export, with splitting logic
        const allPageIds = outputFiles.flatMap(f => f.pageIds);
        const baseName = outputFiles.length > 1 ? 'RePDF_Combined' : outputFiles[0].name;

        if (!options.split || !options.splitSizeMB || options.splitSizeMB <= 0) {
            // No splitting, combine all into one file
            const combinedPdfDoc = await PDFLib.PDFDocument.create();
            await addPagesToDoc(combinedPdfDoc, allPageIds, allPages, allLoadedDocs);
            await saveAndDownloadPdf(combinedPdfDoc, `${baseName}.pdf`, options.password);
        } else {
            // Splitting logic enabled
            const splitLimitBytes = options.splitSizeMB * 1024 * 1024;
            let partNumber = 1;
            let pagesForCurrentPart: string[] = [];

            for (const pageId of allPageIds) {
                pagesForCurrentPart.push(pageId);
                
                const tempDoc = await PDFLib.PDFDocument.create();
                await addPagesToDoc(tempDoc, pagesForCurrentPart, allPages, allLoadedDocs);
                const bytes = await tempDoc.save();

                if (bytes.length > splitLimitBytes && pagesForCurrentPart.length > 1) {
                    // Current part exceeds size, so save the previous state
                    const pagesForFinalPart = pagesForCurrentPart.slice(0, -1);
                    const finalPartDoc = await PDFLib.PDFDocument.create();
                    await addPagesToDoc(finalPartDoc, pagesForFinalPart, allPages, allLoadedDocs);

                    await saveAndDownloadPdf(finalPartDoc, `${baseName}_part${partNumber}.pdf`, options.password);
                    
                    partNumber++;
                    pagesForCurrentPart = [pageId]; // Start new part with current page
                }
            }
            
            // Save the last remaining part
            if (pagesForCurrentPart.length > 0) {
                const finalPartDoc = await PDFLib.PDFDocument.create();
                await addPagesToDoc(finalPartDoc, pagesForCurrentPart, allPages, allLoadedDocs);
                const finalName = partNumber > 1 ? `${baseName}_part${partNumber}.pdf` : `${baseName}.pdf`;
                await saveAndDownloadPdf(finalPartDoc, finalName, options.password);
            }
        }

    } else {
        // Handle separate file export
        for (const file of outputFiles) {
            const singlePdfDoc = await PDFLib.PDFDocument.create();
            await addPagesToDoc(singlePdfDoc, file.pageIds, allPages, allLoadedDocs);
            await saveAndDownloadPdf(singlePdfDoc, `${file.name}.pdf`, options.password);
        }
    }
};

const addPagesToDoc = async (
    pdfDoc: any, 
    pageIds: string[],
    allPages: Record<string, PageInfo>, 
    allLoadedDocs: Record<string, LoadedPdfDocument>
) => {
    // This uses a cache to avoid reloading the same source PDF multiple times
    const sourceDocCache: Record<string, any> = {};

    for (const pageId of pageIds) {
        const pageInfo = allPages[pageId];
        const sourceDocId = pageInfo.sourceDocId;
        
        if (!sourceDocCache[sourceDocId]) {
            const sourceLoadedDoc = allLoadedDocs[sourceDocId];
            if (!sourceLoadedDoc) continue;
            const sourcePdfBytes = await sourceLoadedDoc.pdfDoc.getData();
            sourceDocCache[sourceDocId] = await PDFLib.PDFDocument.load(sourcePdfBytes);
        }
        
        const pdfLibDoc = sourceDocCache[sourceDocId];
        const [copiedPage] = await pdfDoc.copyPages(pdfLibDoc, [pageInfo.sourcePageIndex]);
        
        const currentRotation = copiedPage.getRotation().angle;
        const additionalRotation = pageInfo.rotation - currentRotation;
        copiedPage.rotate(additionalRotation);
        
        // Embed OCR text if available
        if(pageInfo.ocrText) {
            // This is a simplified way to make text searchable. A more complex implementation
            // would involve transparent text layers. For now, we add it to metadata.
            pdfDoc.setTitle(pageInfo.ocrText.substring(0,100));
        }

        pdfDoc.addPage(copiedPage);
    }
};

const saveAndDownloadPdf = async (pdfDoc: any, fileName: string, password?: string) => {
    if (password) {
        await pdfDoc.encrypt({
            userPassword: password,
            ownerPassword: password,
            permissions: {
                printing: true,
                modifying: false,
                copying: true,
                annotating: true,
            }
        });
    }
    const pdfBytes = await pdfDoc.save();
    downloadBlob(pdfBytes, fileName, 'application/pdf');
};


const downloadBlob = (data: Uint8Array, fileName: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
};