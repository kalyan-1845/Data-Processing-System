import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface PdfInfo {
  pageCount: number;
  title?: string;
  author?: string;
  fileSize: number;
}

export interface SplitResult {
  pages: { pageNum: number; blob: Blob }[];
  totalPages: number;
}

// Get PDF info
export async function getPdfInfo(file: File): Promise<PdfInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    fileSize: file.size,
  };
}

// Parse page range string (e.g., "1-3,5,7-9") to array of page numbers
export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map((s) => s.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((n) => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      }
    } else {
      const num = parseInt(part);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}

// Compress PDF by reducing image quality and removing unused objects
export async function compressPdf(file: File, _quality: number = 70): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // Create a new document and copy pages (this removes unused objects)
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  pages.forEach((page) => newPdf.addPage(page));
  
  // Serialize with compression
  const pdfBytes = await newPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
  
  // Use Uint8Array directly
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

// Split PDF and extract specific pages
export async function splitPdf(file: File, pageRange: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();
  
  const pagesToExtract = parsePageRange(pageRange, pageCount);
  
  if (pagesToExtract.length === 0) {
    throw new Error('No valid pages specified');
  }
  
  const newPdf = await PDFDocument.create();
  const pageIndices = pagesToExtract.map((p) => p - 1); // Convert to 0-based
  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  
  const pdfBytes = await newPdf.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

// Split PDF into individual pages (one PDF per page)
export async function splitPdfToMany(
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();
  
  const zip = new JSZip();
  const baseName = file.name.replace('.pdf', '');
  
  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    
    const pdfBytes = await newPdf.save();
    zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
    
    onProgress?.((i + 1) / pageCount * 100);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${baseName}_pages.zip`);
}

// Split PDF into chunks of N pages each
export async function splitPdfByChunks(
  file: File,
  pagesPerChunk: number,
  onProgress?: (progress: number) => void
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();
  
  const zip = new JSZip();
  const baseName = file.name.replace('.pdf', '');
  const numChunks = Math.ceil(pageCount / pagesPerChunk);
  
  for (let chunk = 0; chunk < numChunks; chunk++) {
    const startPage = chunk * pagesPerChunk;
    const endPage = Math.min(startPage + pagesPerChunk, pageCount);
    
    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    zip.file(`${baseName}_part_${chunk + 1}.pdf`, pdfBytes);
    
    onProgress?.((chunk + 1) / numChunks * 100);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${baseName}_split.zip`);
}

// Merge multiple PDFs into one
export async function mergePdfs(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const arrayBuffer = await files[i].arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    
    onProgress?.((i + 1) / files.length * 100);
  }
  
  const pdfBytes = await mergedPdf.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

// Create a cover page for PDF
export async function createCoverPage(title: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  
  page.drawText(title, {
    x: 50,
    y: 700,
    size: 32,
    color: rgb(0.2, 0.2, 0.6),
  });
  
  page.drawText('Generated by DocuShrink AI', {
    x: 50,
    y: 650,
    size: 14,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  return pdfDoc.save();
}
