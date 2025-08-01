
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// We replace `declare const Tesseract: any;` with a more specific declaration
// to solve the "Cannot find namespace 'Tesseract'" error. This provides TypeScript
// with the necessary type information for the Tesseract.js library loaded via CDN.
declare namespace Tesseract {
  interface Worker {
    recognize(
      image: string | HTMLCanvasElement
    ): Promise<{ data: { text: string } }>;
  }

  function createWorker(
    lang: string,
    oem: number,
    options: { logger: (m: any) => void }
  ): Promise<Worker>;
}


// --- Cloud AI Features (Gemini) ---

const API_KEY = process.env.API_KEY;
const useCloudAI = !!API_KEY;

let ai: GoogleGenAI | null = null;
if (useCloudAI) {
  ai = new GoogleGenAI({ apiKey: API_KEY! });
} else {
  console.warn("Gemini API key not found. Cloud AI features like filename suggestion will be disabled.");
}

export const canSuggestName = () => useCloudAI;

export const suggestFileName = async (textSample: string): Promise<string> => {
  if (!ai) throw new Error("API key not configured.");
  
  const prompt = `Based on the following text from a document, suggest a concise, snake_case filename (no extension, max 5 words). Text: "${textSample.substring(0, 2000)}"`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    const suggestedName = response.text.trim().replace(/`/g, '').replace(/\.pdf/g, '');
    return suggestedName;
  } catch (error) {
    console.error("Error suggesting file name:", error);
    throw new Error("Could not get a filename suggestion from the AI.");
  }
};


// --- Client-Side AI Features (Tesseract) ---

let ocrWorker: Tesseract.Worker | null = null;
let isWorkerLoading = false;

const initializeOcrWorker = async (dispatch: Function) => {
    if (ocrWorker || isWorkerLoading) return;
    isWorkerLoading = true;
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: 'Initializing OCR engine... (this may take a moment on first use)' } });

    const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m: any) => {
            if (m.status === 'recognizing text') {
                 // Optionally dispatch progress updates here
            }
        },
    });
    ocrWorker = worker;
    isWorkerLoading = false;
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'OCR engine ready.' } });
};


export const runClientOcr = async (
    imageData: string | HTMLCanvasElement,
    dispatch: Function
): Promise<string> => {
    if (!ocrWorker) {
        await initializeOcrWorker(dispatch);
    }
    
    if (!ocrWorker) {
        throw new Error("OCR worker could not be initialized.");
    }

    const { data: { text } } = await ocrWorker.recognize(imageData);
    return text;
};
