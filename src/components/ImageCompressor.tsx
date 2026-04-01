import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { ImageDown, Download, Eye, ArrowRight, Target, AlertCircle } from 'lucide-react';
import { compressImage, CompressionResult } from '@/services/imageService';
import { saveAs } from 'file-saver';

export function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetSize, setTargetSize] = useState<number>(100);
  const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('KB');
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);
    if (newFiles.length > 0) {
      const url = URL.createObjectURL(newFiles[0]);
      setPreview(url);
      
      // Auto-suggest target size (50% of original)
      const originalKB = newFiles[0].size / 1024;
      if (originalKB > 1024) {
        setSizeUnit('MB');
        setTargetSize(Math.round((originalKB / 1024) * 0.5 * 10) / 10);
      } else {
        setSizeUnit('KB');
        setTargetSize(Math.round(originalKB * 0.5));
      }
    } else {
      setPreview(null);
    }
  };

  const getTargetBytes = () => {
    return targetSize * (sizeUnit === 'MB' ? 1024 * 1024 : 1024);
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      showToast('warning', 'Please upload an image first');
      return;
    }

    const targetBytes = getTargetBytes();
    const originalSize = files[0].size;
    
    if (targetBytes >= originalSize) {
      showToast('warning', 'Target size must be smaller than original file');
      return;
    }

    setLoading(true);
    try {
      // Calculate initial quality based on target ratio
      const ratio = targetBytes / originalSize;
      let quality = Math.max(10, Math.min(95, Math.round(ratio * 100)));
      
      // Try to compress with iterative quality adjustment
      let compressed = await compressImage(files[0], { quality, format });
      
      // If result is too large, reduce quality
      let attempts = 0;
      while (compressed.compressedSize > targetBytes && quality > 10 && attempts < 5) {
        quality = Math.max(10, quality - 15);
        compressed = await compressImage(files[0], { quality, format });
        attempts++;
      }
      
      setResult(compressed);
      
      if (compressed.compressedSize <= targetBytes) {
        showToast('success', `Image compressed to target size! ${compressed.compressionRatio}% reduction`);
      } else {
        showToast('info', `Compressed ${compressed.compressionRatio}%. Exact target may not be achievable.`);
      }
    } catch {
      showToast('error', 'Failed to compress image');
    } finally {
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (result) {
      const originalName = files[0].name.split('.')[0];
      const fileName = `${originalName}_compressed.${format}`;
      saveAs(result.blob, fileName);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/30">
          <ImageDown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Image Compressor</h2>
          <p className="text-slate-500 dark:text-white/60">Reduce image to your target size</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <Dropzone
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              onFilesChange={handleFilesChange}
              label="Drop image here"
              icon="image"
            />
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-4">
            {/* Target Size Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Target File Size
              </label>
              
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetSize}
                  onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
                  min="1"
                  step={sizeUnit === 'MB' ? '0.1' : '10'}
                  className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-[#050505]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                />
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => {
                      if (sizeUnit === 'MB') {
                        setSizeUnit('KB');
                        setTargetSize(Math.round(targetSize * 1024));
                      }
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      sizeUnit === 'KB'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    KB
                  </button>
                  <button
                    onClick={() => {
                      if (sizeUnit === 'KB') {
                        setSizeUnit('MB');
                        setTargetSize(Math.round((targetSize / 1024) * 10) / 10);
                      }
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      sizeUnit === 'MB'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>

              {files[0] && (
                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 dark:text-white/60">
                    Target: {targetSize} {sizeUnit} ({Math.round((1 - getTargetBytes() / files[0].size) * 100)}% reduction from {formatSize(files[0].size)})
                  </p>
                </div>
              )}
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                Output Format
              </label>
              <div className="flex gap-2">
                {(['jpeg', 'png', 'webp'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                      format === f
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleCompress} loading={loading} className="w-full" size="lg">
            <ImageDown className="w-5 h-5" />
            Compress to Target Size
          </Button>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-white/80 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Comparison
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Original</p>
                    {preview && (
                      <img
                        src={preview}
                        alt="Original"
                        className="w-full h-32 object-contain rounded-lg bg-slate-100 dark:bg-black/60"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 mb-2">Compressed</p>
                    <img
                      src={result.dataUrl}
                      alt="Compressed"
                      className="w-full h-32 object-contain rounded-lg bg-slate-100 dark:bg-black/60"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-white/60">Original</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-white/80">
                      {formatSize(result.originalSize)}
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-emerald-500" />
                  <div className="text-center">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Compressed</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {formatSize(result.compressedSize)}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 text-center mb-4">
                  <p className="text-sm text-slate-500 dark:text-white/60 mb-1">Size Reduction</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {result.compressionRatio}%
                  </p>
                </div>

                {result.compressedSize > getTargetBytes() && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Exact target size not achievable without significant quality loss.
                    </p>
                  </div>
                )}

                <Button onClick={downloadCompressed} className="w-full" size="lg">
                  <Download className="w-5 h-5" />
                  Download Compressed Image
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-slate-400">
                <ImageDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload an image and set your target size</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
