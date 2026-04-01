import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { FileDown, Download, FileText, Target, AlertCircle } from 'lucide-react';
import { compressPdf, getPdfInfo } from '@/services/pdfService';
import { saveAs } from 'file-saver';

export function PdfCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    ratio: number;
    blob: Blob;
  } | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  
  // Target size settings
  const [targetSize, setTargetSize] = useState<number>(500);
  const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('KB');
  const { showToast } = useToast();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);
    if (newFiles.length > 0) {
      try {
        const info = await getPdfInfo(newFiles[0]);
        setPdfInfo({ pageCount: info.pageCount });
        
        // Auto-suggest target size (50% of original)
        const originalKB = newFiles[0].size / 1024;
        if (originalKB > 1024) {
          setSizeUnit('MB');
          setTargetSize(Math.round((originalKB / 1024) * 0.5 * 10) / 10);
        } else {
          setSizeUnit('KB');
          setTargetSize(Math.round(originalKB * 0.5));
        }
      } catch {
        setPdfInfo(null);
      }
    } else {
      setPdfInfo(null);
    }
  };

  const getTargetBytes = () => {
    return targetSize * (sizeUnit === 'MB' ? 1024 * 1024 : 1024);
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      showToast('warning', 'Please upload a PDF first');
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
      // Calculate quality based on target size ratio
      const ratio = targetBytes / originalSize;
      const quality = Math.max(10, Math.min(90, Math.round(ratio * 100)));
      
      const compressed = await compressPdf(files[0], quality);
      const compressionRatio = Math.round((1 - compressed.size / files[0].size) * 100);
      
      setResult({
        originalSize: files[0].size,
        compressedSize: compressed.size,
        ratio: Math.max(0, compressionRatio),
        blob: compressed,
      });
      
      if (compressed.size <= targetBytes) {
        showToast('success', `PDF compressed to target size! ${Math.max(0, compressionRatio)}% reduction`);
      } else {
        showToast('info', `Compressed ${Math.max(0, compressionRatio)}%. Target size not fully achievable due to PDF content.`);
      }
    } catch {
      showToast('error', 'Failed to compress PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (result) {
      const fileName = files[0].name.replace('.pdf', '_compressed.pdf');
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
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-red-900/30">
          <FileDown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PDF Compressor</h2>
          <p className="text-slate-500 dark:text-white/60">Reduce PDF file size to your target</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <Dropzone
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={handleFilesChange}
              label="Drop PDF file here"
              icon="pdf"
            />
          </div>

          {pdfInfo && files[0] && (
            <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-slate-700 dark:text-white/80 font-medium">
                  Current File
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-500 dark:text-white/60">Pages:</div>
                <div className="text-slate-700 dark:text-white/80">{pdfInfo.pageCount}</div>
                <div className="text-slate-500 dark:text-white/60">Size:</div>
                <div className="text-slate-700 dark:text-white/80 font-semibold">{formatSize(files[0].size)}</div>
              </div>
            </div>
          )}

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              Target File Size
            </label>
            
            <div className="flex gap-2">
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
                min="1"
                step={sizeUnit === 'MB' ? '0.1' : '10'}
                className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-[#050505]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-semibold"
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
                      ? 'bg-red-500 text-white'
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
                      ? 'bg-red-500 text-white'
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

          <Button onClick={handleCompress} loading={loading} className="w-full" size="lg">
            <FileDown className="w-5 h-5" />
            Compress to Target Size
          </Button>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Compression Result</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-white/60 mb-1">Original</p>
                    <p className="text-xl font-bold text-slate-700 dark:text-white/80">
                      {formatSize(result.originalSize)}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Compressed</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {formatSize(result.compressedSize)}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-xl p-4 text-center mb-6">
                  <p className="text-sm text-slate-500 dark:text-white/60 mb-1">Size Reduction</p>
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">{result.ratio}%</p>
                </div>

                {result.compressedSize > getTargetBytes() && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      The exact target size couldn't be achieved. PDFs with text content have limited compression.
                    </p>
                  </div>
                )}

                <Button onClick={downloadCompressed} className="w-full" size="lg">
                  <Download className="w-5 h-5" />
                  Download Compressed PDF
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-slate-400">
                <FileDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload a PDF and set your target size</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
