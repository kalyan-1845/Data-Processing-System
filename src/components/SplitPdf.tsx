import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { Scissors, FileText, Info, Sparkles } from 'lucide-react';
import { splitPdf, getPdfInfo, parsePageRange } from '@/services/pdfService';
import { saveAs } from 'file-saver';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

export function SplitPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageRange, setPageRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number } | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [extractedPages, setExtractedPages] = useState<number[]>([]);
  const { showToast } = useToast();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);
    setPageRange('');
    if (newFiles.length > 0) {
      try {
        const info = await getPdfInfo(newFiles[0]);
        setPdfInfo({ pageCount: info.pageCount });
        setPageRange(`1-${info.pageCount}`);
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

    if (!pageRange.trim()) {
      showToast('warning', 'Please specify page range');
      return;
    }

    setLoading(true);
    try {
      const blob = await splitPdf(files[0], pageRange);
      const pages = parsePageRange(pageRange, pdfInfo?.pageCount || 0);
      setResult(blob);
      setExtractedPages(pages);
      showToast('success', `Extracted ${pages.length} page(s) successfully!`);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to split PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (result) {
      const fileName = files[0].name.replace('.pdf', `_extracted.pdf`);
      saveAs(result, fileName);
    }
  };

  return (
    <ToolWrapper
      title="PDF Page Extractor"
      description="Precisely isolate and extract specific sections from your documents"
      icon={Scissors}
      loading={loading}
      accentColor="orange"
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
              <Scissors className="w-4 h-4 text-orange-500" />
              Extraction Range
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="e.g., 1-3, 5, 7-9"
              className="w-full p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-xl font-bold font-outfit"
            />
            
            <div className="flex items-start gap-3 mt-4 p-3 rounded-xl bg-slate-100/50 dark:bg-white/5">
              <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 dark:text-white/40 leading-relaxed font-bold uppercase tracking-tight">
                Neural Syntax: Use commas for separation and hyphens for ranges (e.g., "1-5, 8, 10-12")
              </p>
            </div>
          </div>

          {pdfInfo && (
            <div className="glass rounded-3xl p-6 animate-in">
              <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">Neural Quick Select</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'First Page', value: '1' },
                  { label: 'Last Page', value: String(pdfInfo.pageCount) },
                  { label: 'First Half', value: `1-${Math.ceil(pdfInfo.pageCount / 2)}` },
                  { label: 'Even Pages', value: 'evens' },
                  { label: 'Odd Pages', value: 'odds' },
                  { label: 'Clear', value: '' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (preset.value === 'evens') {
                        setPageRange(Array.from({ length: pdfInfo.pageCount }, (_, i) => i + 1).filter(n => n % 2 === 0).join(','));
                      } else if (preset.value === 'odds') {
                        setPageRange(Array.from({ length: pdfInfo.pageCount }, (_, i) => i + 1).filter(n => n % 2 === 1).join(','));
                      } else {
                        setPageRange(preset.value);
                      }
                    }}
                    className="px-4 py-2 text-[10px] font-black uppercase rounded-xl border border-white/5 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-orange-500 hover:text-white transition-all tracking-tighter"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSplit} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <Scissors className="w-5 h-5 mr-2" />
            Extract Neural Pages
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Extraction Result"
            icon={Scissors}
            content={
              result ? (
                <div className="space-y-6">
                  <div className="relative h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-orange-500/5 rounded-[2rem] animate-pulse" />
                    <div className="text-center relative z-10">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Extracted</p>
                      <p className="text-5xl font-black text-orange-500">{extractedPages.length}</p>
                      <p className="text-[10px] text-orange-600/60 dark:text-orange-400/40 font-bold mt-1">Total Pages</p>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5 border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-3">Page Map</p>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedPages.map((page) => (
                        <span
                          key={page}
                          className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black rounded-md"
                        >
                          {page}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5 border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">New Payload</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-white/80">
                      {(result.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : null
            }
            onDownload={downloadResult}
            empty={!result}
            emptyText="Define your extraction range and process to generate the isolated document."
          />

          {pdfInfo && (
            <div className="glass rounded-[2rem] p-6 animate-in">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Source Analytics
              </h4>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-slate-700 dark:text-white/70">Total Available</span>
                <span className="text-lg font-black text-orange-500">{pdfInfo.pageCount}</span>
              </div>
            </div>
          )}
        </div>
      }
    />
  );

