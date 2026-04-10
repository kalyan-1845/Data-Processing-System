import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { FileStack, FileText, Package, Sparkles } from 'lucide-react';
import { splitPdfToMany, splitPdfByChunks, getPdfInfo } from '@/services/pdfService';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';
import { motion } from 'framer-motion';

export function SplitMany() {
  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<'individual' | 'chunks'>('individual');
  const [pagesPerChunk, setPagesPerChunk] = useState(5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  const { showToast } = useToast();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setProgress(0);
    if (newFiles.length > 0) {
      try {
        const info = await getPdfInfo(newFiles[0]);
        setPdfInfo({ pageCount: info.pageCount });
      } catch {
        setPdfInfo(null);
      }
    } else {
      setPdfInfo(null);
    }
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      showToast('warning', 'Please upload a PDF first');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      if (splitMode === 'individual') {
        await splitPdfToMany(files[0], (p) => setProgress(p));
        showToast('success', 'Neural split complete! ZIP archive generated.');
      } else {
        await splitPdfByChunks(files[0], pagesPerChunk, (p) => setProgress(p));
        showToast('success', `Chunked split complete! ZIP archive generated.`);
      }
    } catch {
      showToast('error', 'Failed to split PDF');
    } finally {
      setLoading(false);
    }
  };

  const estimatedFiles = pdfInfo
    ? splitMode === 'individual'
      ? pdfInfo.pageCount
      : Math.ceil(pdfInfo.pageCount / pagesPerChunk)
    : 0;

  return (
    <ToolWrapper
      title="Batch PDF Splitter"
      description="Deconstruct large documents into smaller, manageable neural nodes"
      icon={FileStack}
      loading={loading}
      accentColor="purple"
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
            <label className="block text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-6">
              Deconstruction Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'individual', label: 'Atomic Split', desc: 'Each page as separate PDF', icon: FileText },
                { id: 'chunks', label: 'Chunked Split', desc: 'N pages per PDF', icon: FileStack }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSplitMode(mode.id as any)}
                  className={`relative p-5 rounded-2xl border transition-all text-left group ${
                    splitMode === mode.id
                      ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/20'
                      : 'border-white/5 bg-white/50 dark:bg-white/5 hover:border-purple-500/30'
                  }`}
                >
                  <mode.icon className={`w-6 h-6 mb-3 transition-colors ${
                    splitMode === mode.id ? 'text-purple-500' : 'text-slate-400'
                  }`} />
                  <p className={`text-xs font-black uppercase tracking-tight mb-1 ${
                    splitMode === mode.id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-white/60'
                  }`}>{mode.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-white/30 font-medium leading-tight">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {splitMode === 'chunks' && (
            <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300 animate-in">
              <Slider
                label="Chunk Size"
                value={pagesPerChunk}
                onChange={(e) => setPagesPerChunk(Number(e.target.value))}
                min={1}
                max={50}
                step={1}
                showValue
              />
            </div>
          )}

          <Button onClick={handleSplit} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <FileStack className="w-5 h-5 mr-2" />
            Initialize Batch Split
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Batch Analytics"
            icon={Package}
            content={
              pdfInfo ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-5 border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Total Input</p>
                      <p className="text-2xl font-black text-slate-700 dark:text-white/80">{pdfInfo.pageCount}</p>
                      <p className="text-[10px] text-slate-500 font-bold">Pages</p>
                    </div>
                    <div className="glass rounded-2xl p-5 border-purple-500/10 text-center">
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Generated</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{estimatedFiles}</p>
                      <p className="text-[10px] text-purple-500/60 font-bold">Files</p>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5 border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">Payload Preview</p>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: Math.min(estimatedFiles, 15) }).map((_, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 bg-purple-500/5 dark:bg-white/5 rounded-xl text-[10px] font-bold text-purple-600 dark:text-white/50 border border-purple-500/10"
                        >
                          {splitMode === 'individual' ? `page_${i + 1}.pdf` : `batch_${i + 1}.pdf`}
                        </div>
                      ))}
                      {estimatedFiles > 15 && (
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 italic">
                          +{estimatedFiles - 15} more units...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            }
            empty={!pdfInfo}
            emptyText="Analytics will generate once a source document is uploaded."
          />

          {loading && (
            <div className="glass rounded-[2rem] p-6 animate-in bg-purple-500/5 border-purple-500/10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-white">Fragmenting...</p>
                </div>
                <p className="text-2xl font-black text-purple-500">{Math.round(progress)}%</p>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                />
              </div>
            </div>
          )}

          <div className="glass rounded-[2rem] p-6">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Efficiency Tip
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-white/40 leading-relaxed font-medium italic">
              "Splitting by chunks is ideal for long reports, while atomic splitting is perfect for extracting individual invoices or certificates."
            </p>
          </div>
        </div>
      }
    />
  );
}
  );
}
