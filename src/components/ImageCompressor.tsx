import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { ImageDown, Eye, Target, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { compressImage, CompressionResult } from '@/services/imageService';
import { saveAs } from 'file-saver';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

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
    
    setLoading(true);
    try {
      const ratio = targetBytes / originalSize;
      let quality = Math.max(10, Math.min(95, Math.round(ratio * 100)));
      
      let compressed = await compressImage(files[0], { quality, format });
      
      let attempts = 0;
      while (compressed.compressedSize > targetBytes && quality > 10 && attempts < 5) {
        quality = Math.max(10, quality - 15);
        compressed = await compressImage(files[0], { quality, format });
        attempts++;
      }
      
      setResult(compressed);
      showToast('success', 'Image Successfully Optimized');
    } catch {
      showToast('error', 'Failed to compress image');
    } finally {
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (result) {
      const originalName = files[0].name.split('.')[0];
      const fileName = `${originalName}_optimized.${format}`;
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
      title="Image Compressor"
      description="Neural image optimization with intelligent pixel retention"
      icon={ImageDown}
      loading={loading}
      accentColor="emerald"
      main={
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Dropzone
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              onFilesChange={handleFilesChange}
              label="Drop image here"
              icon="image"
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Target File Size
            </label>
            
            <div className="flex gap-4 mb-6">
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
                className="flex-1 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xl font-bold font-outfit"
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
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-500 dark:text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">
              Export Format
            </label>
            <div className="flex gap-2">
              {(['jpeg', 'png', 'webp'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border ${
                    format === f
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white/50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-500 dark:text-white/40 hover:bg-white/10'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleCompress} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <ImageDown className="w-5 h-5 mr-2" />
            Optimize Pixels
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Processing Result"
            icon={ImageDown}
            content={
              result ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest text-center">Source</p>
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                         <img src={preview!} alt="Original" className="w-full h-full object-cover" />
                         <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-[10px] font-bold text-white backdrop-blur-md">
                           {formatSize(result.originalSize)}
                         </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-center">Optimized</p>
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-500/20 bg-emerald-500/5">
                         <img src={result.dataUrl} alt="Compressed" className="w-full h-full object-cover" />
                         <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-emerald-500/80 text-[10px] font-bold text-white backdrop-blur-md">
                           {formatSize(result.compressedSize)}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-[2rem] p-6 text-center border-emerald-500/10 bg-emerald-500/5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Efficiency</p>
                    <p className="text-4xl font-black text-emerald-500">{result.compressionRatio}%</p>
                    <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/40 font-bold mt-1">Data Reduction</p>
                  </div>

                  {result.compressedSize > getTargetBytes() && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                        Target limit reached. Quality prioritised over file size.
                      </p>
                    </div>
                  )}
                </div>
              ) : null
            }
            onDownload={downloadCompressed}
            empty={!result}
            emptyText="Optimize your image to see the comparison and efficiency metrics."
          />

          <div className="glass rounded-[2rem] p-6">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">Neural Engine Status</h4>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-bold text-slate-700 dark:text-white/70 tracking-tight">Active & Ready</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-white/30 mt-3 leading-relaxed">
              Using iterative pixel optimization to ensure the best balance between quality and size.
            </p>
          </div>
        </div>
      }
    />
  );
}
