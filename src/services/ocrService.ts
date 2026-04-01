import Tesseract from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  words: { text: string; confidence: number }[];
  paragraphs: string[];
}

export interface OcrProgress {
  status: string;
  progress: number;
}

// Perform OCR on an image
export async function performOcr(
  file: File,
  language: string = 'eng',
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  try {
    onProgress?.({ status: 'Loading OCR engine...', progress: 0 });
    
    const result = await Tesseract.recognize(file, language, {
      logger: (m) => {
        if (m.status && m.progress !== undefined) {
          let statusText = m.status;
          // Make status messages more user-friendly
          if (m.status === 'loading tesseract core') statusText = 'Loading OCR engine...';
          else if (m.status === 'initializing tesseract') statusText = 'Initializing...';
          else if (m.status === 'loading language traineddata') statusText = 'Loading language data...';
          else if (m.status === 'initializing api') statusText = 'Preparing...';
          else if (m.status === 'recognizing text') statusText = 'Recognizing text...';
          
          onProgress?.({
            status: statusText,
            progress: Math.round(m.progress * 100),
          });
        }
      },
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    // Extract words with confidence from the result
    interface WordData { text: string; confidence: number }
    const pageData = result.data as Tesseract.Page & { words?: WordData[] };
    const words = pageData.words?.map((word: WordData) => ({
      text: word.text,
      confidence: word.confidence,
    })) || [];

    // Split into paragraphs
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return {
      text: text.trim() || 'No text found in image. Try a clearer image or different language.',
      confidence,
      words,
      paragraphs,
    };
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('OCR processing failed. Please try again with a different image.');
  }
}

// Perform OCR on multiple images
export async function performBatchOcr(
  files: File[],
  language: string = 'eng',
  onProgress?: (fileIndex: number, progress: OcrProgress) => void
): Promise<OcrResult[]> {
  const results: OcrResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await performOcr(files[i], language, (progress) => {
      onProgress?.(i, progress);
    });
    results.push(result);
  }

  return results;
}

// Available languages for OCR
export const OCR_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
  { code: 'kor', name: 'Korean' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' },
];

// Preprocess image for better OCR results
export function preprocessImageForOcr(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
        const newGray = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
        
        data[i] = newGray;
        data[i + 1] = newGray;
        data[i + 2] = newGray;
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to preprocess image'));
          }
        },
        'image/png'
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
