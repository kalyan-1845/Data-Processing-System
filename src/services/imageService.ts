// Image compression service using Canvas API

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  blob: Blob;
  dataUrl: string;
}

export interface CompressionOptions {
  quality: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// Load image from file
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Calculate new dimensions maintaining aspect ratio
function calculateDimensions(
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  if (!maxWidth && !maxHeight) {
    return { width, height };
  }

  let newWidth = width;
  let newHeight = height;

  if (maxWidth && width > maxWidth) {
    newWidth = maxWidth;
    newHeight = (height / width) * maxWidth;
  }

  if (maxHeight && newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = (width / height) * maxHeight;
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) };
}

// Compress single image
export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { quality, maxWidth, maxHeight, format = 'jpeg' } = options;
  
  const img = await loadImage(file);
  const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Convert to blob
  const mimeType = `image/${format}`;
  const qualityValue = quality / 100;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }
        
        const dataUrl = canvas.toDataURL(mimeType, qualityValue);
        
        resolve({
          originalSize: file.size,
          compressedSize: blob.size,
          compressionRatio: Math.round((1 - blob.size / file.size) * 100),
          blob,
          dataUrl,
        });
      },
      mimeType,
      qualityValue
    );
  });
}

// Compress multiple images
export async function compressImages(
  files: File[],
  options: CompressionOptions,
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options);
    results.push(result);
    onProgress?.(((i + 1) / files.length) * 100, i + 1, files.length);
  }
  
  return results;
}

// Get image dimensions
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.width, height: img.height };
}

// Convert image to different format
export async function convertImageFormat(
  file: File,
  targetFormat: 'jpeg' | 'png' | 'webp',
  quality: number = 90
): Promise<Blob> {
  const img = await loadImage(file);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // For JPEG, fill background with white (since JPEG doesn't support transparency)
  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  ctx.drawImage(img, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image'));
          return;
        }
        resolve(blob);
      },
      `image/${targetFormat}`,
      quality / 100
    );
  });
}

// Resize image to specific dimensions
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  maintainAspectRatio: boolean = true
): Promise<Blob> {
  const img = await loadImage(file);
  
  let width = targetWidth;
  let height = targetHeight;
  
  if (maintainAspectRatio) {
    const aspectRatio = img.width / img.height;
    if (targetWidth / targetHeight > aspectRatio) {
      width = targetHeight * aspectRatio;
    } else {
      height = targetWidth / aspectRatio;
    }
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to resize image'));
          return;
        }
        resolve(blob);
      },
      file.type || 'image/jpeg',
      0.9
    );
  });
}
