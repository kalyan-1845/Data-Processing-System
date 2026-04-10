import { useState, useCallback } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { Combine, Trash2, ArrowUp, ArrowDown, Sparkles, Files } from 'lucide-react';
import { mergePdfs, getPdfInfo } from '@/services/pdfService';
import { saveAs } from 'file-saver';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';
import { motion, AnimatePresence } from 'framer-motion';

interface PdfFile {
  file: File;
  pageCount: number;
  id: string;
}

export function MergePdf() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const { showToast } = useToast();

  const handleFilesChange = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    const newPdfFiles: PdfFile[] = [];
    
    for (const file of files) {
      try {
        const info = await getPdfInfo(file);
        newPdfFiles.push({ 
          file, 
          pageCount: info.pageCount,
          id: `${file.name}-${Date.now()}-${Math.random()}`
        });
      } catch {
        newPdfFiles.push({ 
          file, 
          pageCount: 0,
          id: `${file.name}-${Date.now()}-${Math.random()}`
        });
      }
    }
    
    setPdfFiles((prev) => [...prev, ...newPdfFiles]);
    setResult(null);
    setDropzoneKey(k => k + 1);
  }, []);

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= pdfFiles.length) return;
    const newFiles = [...pdfFiles];
    const [moved] = newFiles.splice(from, 1);
    newFiles.splice(to, 0, moved);
    setPdfFiles(newFiles);
    setResult(null);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      showToast('warning', 'Please add at least 2 PDFs to merge');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const files = pdfFiles.map((p) => p.file);
      const merged = await mergePdfs(files, (p) => setProgress(p));
      setResult(merged);
      showToast('success', 'Neural merging complete!');
    } catch {
      showToast('error', 'Failed to merge PDFs');
    } finally {
      setLoading(false);
    }
  };

  const downloadMerged = () => {
    if (result) {
      saveAs(result, 'merged_document.pdf');
    }
  };

  const totalPages = pdfFiles.reduce((sum, p) => sum + p.pageCount, 0);
  const totalSize = pdfFiles.reduce((sum, p) => sum + p.file.size, 0);

  return (
    <ToolWrapper
      title="Neural PDF Merger"
      description="Seamlessly unify multiple document streams into a single cohesive payload"
      icon={Combine}
      loading={loading}
      accentColor="blue"
      main={
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Dropzone
              key={dropzoneKey}
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={handleFilesChange}
              multiple
              maxFiles={20}
              label="Drop multiple PDF files here"
              icon="pdf"
              value={[]}
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <label className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest flex items-center gap-2">
                <Files className="w-4 h-4 text-blue-500" />
                Input Stack ({pdfFiles.length})
              </label>
              {pdfFiles.length > 0 && (
                <button 
                  onClick={() => setPdfFiles([])}
                  className="text-[10px] font-bold text-red-500/60 uppercase hover:text-red-500 transition-colors tracking-tighter"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {pdfFiles.map((pdf, index) => (
                  <motion.div
                    key={pdf.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveFile(index, index - 1)}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-500 disabled:opacity-10 touch-manipulation"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveFile(index, index + 1)}
                        disabled={index === pdfFiles.length - 1}
                        className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-500 disabled:opacity-10 touch-manipulation"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-white/80 truncate mb-0.5">
                        {pdf.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {pdf.pageCount} Pages
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {(pdf.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {pdfFiles.length === 0 && (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stack Empty</p>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleMerge} 
            loading={loading} 
            disabled={pdfFiles.length < 2} 
            className="w-full h-14 rounded-2xl text-lg font-bold" 
            size="lg"
          >
            <Combine className="w-5 h-5 mr-2" />
            Initialize Neural Merge
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Unity Prediction"
            icon={Combine}
            content={
              pdfFiles.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-5 border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Source Nodes</p>
                      <p className="text-2xl font-black text-slate-700 dark:text-white/80">{pdfFiles.length}</p>
                      <p className="text-[10px] text-slate-500 font-bold">PDF Units</p>
                    </div>
                    <div className="glass rounded-2xl p-5 border-blue-500/10 text-center">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Total Pages</p>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalPages}</p>
                      <p className="text-[10px] text-blue-500/60 font-bold">In Target</p>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 border-white/5 bg-blue-500/5">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Target Payload</p>
                      <span className="text-[10px] font-black text-blue-500">{(totalSize / 1024).toFixed(1)} KB</span>
                    </div>
                    
                    <div className="space-y-2 opacity-60">
                      {pdfFiles.slice(0, 5).map((pdf, i) => (
                        <div key={pdf.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <p className="text-[10px] font-medium text-slate-500 dark:text-white/40 truncate">{pdf.file.name}</p>
                        </div>
                      ))}
                      {pdfFiles.length > 5 && (
                        <p className="text-[10px] font-bold text-slate-400 italic pl-3">+{pdfFiles.length - 5} more segments...</p>
                      )}
                    </div>
                  </div>

                  {totalSize > 100 * 1024 * 1024 && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed font-bold uppercase">
                        Heavy Payload: Optimization may take longer.
                      </p>
                    </div>
                  )}
                </div>
              ) : null
            }
            onDownload={downloadMerged}
            empty={!result}
            emptyText="Construct your input stack to see the unity prediction and final payload metrics."
          />

          {loading && (
            <div className="glass rounded-[2rem] p-6 animate-in bg-blue-500/5 border-blue-500/10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-white">Synthesizing...</p>
                </div>
                <p className="text-2xl font-black text-blue-500">{Math.round(progress)}%</p>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="glass rounded-[2rem] p-6">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Unity Logic
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-white/40 leading-relaxed font-medium">
              "Files are woven together in the exact order shown in the stack. Use the arrows to recompute the document hierarchy."
            </p>
          </div>
        </div>
      }
    />
   );
}
