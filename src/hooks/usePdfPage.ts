import { useState, useEffect, useRef } from 'react';
import { LoadedPdfDocument, PageInfo } from '../types';

export const usePdfPage = (loadedDoc: LoadedPdfDocument, pageInfo: PageInfo, scale: number = 1) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let renderTask: any | null = null;
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || !loadedDoc || !pageInfo) return;

      setIsLoading(true);
      setError(null);

      try {
        const page = await loadedDoc.pdfDoc.getPage(pageInfo.sourcePageIndex + 1);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale, rotation: pageInfo.rotation });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;

        if (!isCancelled) {
          setIsLoading(false);
        }
      } catch (e: any) {
        if (e.name !== 'RenderingCancelledException') {
          setError(e);
        }
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [loadedDoc, pageInfo, scale]);

  return { canvasRef, isLoading, error };
};