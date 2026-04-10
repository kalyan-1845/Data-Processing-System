import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { FileDown, Target, AlertCircle, FileText } from 'lucide-react';
import { compressPdf, getPdfInfo } from '@/services/pdfService';
import { saveAs } from 'file-saver';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

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
      
      showToast('success', 'PDF Successfully Optimized');
    } catch {
      showToast('error', 'Failed to compress PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (result) {
      const fileName = files[0].name.replace('.pdf', '_optimized.pdf');
      saveAs(result.blob, fileName);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolWrapper
      title="PDF Compressor"
      description="Intelligently reduce file size while maintaining document integrity"
      icon={FileDown}
      loading={loading}
      accentColor="rose"
      main={
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Dropzone
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={handleFilesChange}
              label="Drop PDF file here"
              icon="pdf"
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              Target File Size
            </label>
            
            <div className="flex gap-4">
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
                className="flex-1 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-xl font-bold font-outfit"
              />
              <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 p-1 bg-slate-100 dark:bg-white/5">
                {['KB', 'MB'].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => {
                      if (sizeUnit !== unit) {
                        setSizeUnit(unit as 'KB' | 'MB');
                        setTargetSize(unit === 'KB' ? Math.round(targetSize * 1024) : Math.round((targetSize / 1024) * 10) / 10);
                      }
                    }}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                      sizeUnit === unit
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'text-slate-500 dark:text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleCompress} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <FileDown className="w-5 h-5 mr-2" />
            Optimize Document
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Compression Engine"
            icon={FileDown}
            content={
              result ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-5 border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Original</p>
                      <p className="text-lg font-bold text-slate-700 dark:text-white/80">{formatSize(result.originalSize)}</p>
                    </div>
                    <div className="glass rounded-2xl p-5 border-emerald-500/10">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Optimized</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatSize(result.compressedSize)}</p>
                    </div>
                  </div>

                  <div className="relative h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-500/5 rounded-[2rem] animate-pulse" />
                    <div className="text-center relative z-10">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Efficiency Gain</p>
                      <p className="text-5xl font-black text-rose-500">{result.ratio}%</p>
                    </div>
                  </div>

                  {result.compressedSize > getTargetBytes() && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                        Target limit reached. Some elements were preserved to maintain readability.
                      </p>
                    </div>
                  )}
                </div>
              ) : null
            }
            onDownload={downloadCompressed}
            empty={!result}
            emptyText="Optimize your PDF to see compression metrics and download the result."
          />

          {pdfInfo && (
            <div className="glass rounded-[2rem] p-6 animate-in">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Input Analytics
              </h4>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-slate-700 dark:text-white/70">Page Count</span>
                <span className="text-lg font-black text-rose-500">{pdfInfo.pageCount}</span>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
  );
}
