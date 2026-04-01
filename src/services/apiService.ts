/**
 * API Service - Connects frontend to Flask backend
 * Falls back to client-side processing if backend is unavailable
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

// Check if backend is available
let backendAvailable: boolean | null = null;

export async function checkBackendStatus(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  
  return backendAvailable;
}

// ==================== AI ENDPOINTS ====================

export async function apiSummarize(text: string, ratio: number = 0.3): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ratio })
  });
  return response.json();
}

export async function apiExtractKeywords(text: string, numKeywords: number = 10): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ai/keywords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, num_keywords: numKeywords })
  });
  return response.json();
}

export async function apiGenerateQuestions(text: string, numQuestions: number = 5): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ai/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, num_questions: numQuestions })
  });
  return response.json();
}

export async function apiGenerateBullets(text: string, numBullets: number = 5): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ai/bullets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, num_bullets: numBullets })
  });
  return response.json();
}

// ==================== PDF ENDPOINTS ====================

export async function apiCompressPdf(file: File, quality: number = 50): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality.toString());
  
  const response = await fetch(`${API_BASE_URL}/pdf/compress`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Compression failed');
  }
  
  return response.blob();
}

export async function apiSplitPdf(file: File, pages: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pages', pages);
  
  const response = await fetch(`${API_BASE_URL}/pdf/split`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Split failed');
  }
  
  return response.blob();
}

export async function apiSplitMany(file: File, pagesPerFile: number = 1): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pages_per_file', pagesPerFile.toString());
  
  const response = await fetch(`${API_BASE_URL}/pdf/split-many`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Split failed');
  }
  
  return response.blob();
}

export async function apiMergePdfs(files: File[]): Promise<Blob> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/pdf/merge`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Merge failed');
  }
  
  return response.blob();
}

// ==================== IMAGE ENDPOINTS ====================

export async function apiCompressImage(
  file: File,
  quality: number = 80,
  maxWidth?: number,
  maxHeight?: number,
  format?: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality.toString());
  if (maxWidth) formData.append('max_width', maxWidth.toString());
  if (maxHeight) formData.append('max_height', maxHeight.toString());
  if (format) formData.append('format', format);
  
  const response = await fetch(`${API_BASE_URL}/image/compress`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Compression failed');
  }
  
  return response.blob();
}

// ==================== OCR ENDPOINTS ====================

export async function apiOcr(file: File, language: string = 'eng'): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  
  const response = await fetch(`${API_BASE_URL}/ocr`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

export async function apiGetOcrLanguages(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ocr/languages`);
  return response.json();
}

export default {
  checkBackendStatus,
  apiSummarize,
  apiExtractKeywords,
  apiGenerateQuestions,
  apiGenerateBullets,
  apiCompressPdf,
  apiSplitPdf,
  apiSplitMany,
  apiMergePdfs,
  apiCompressImage,
  apiOcr,
  apiGetOcrLanguages
};
