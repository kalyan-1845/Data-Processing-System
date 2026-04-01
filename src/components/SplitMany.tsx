import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { FileStack, Download, FileText, Package } from 'lucide-react';
import { splitPdfToMany, splitPdfByChunks, getPdfInfo } from '@/services/pdfService';

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
        showToast('success', 'PDF split into individual pages! Download started.');
      } else {
        await splitPdfByChunks(files[0], pagesPerChunk, (p) => setProgress(p));
        showToast('success', `PDF split into chunks of ${pagesPerChunk} pages! Download started.`);
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
          <FileStack className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">One PDF → Many PDFs</h2>
          <p className="text-slate-500 dark:text-white/60">Split PDF into multiple files</p>
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

          {pdfInfo && (
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-500" />
              <span className="text-slate-700 dark:text-white/80">
                Total: {pdfInfo.pageCount} page{pdfInfo.pageCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-3">
              Split Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSplitMode('individual')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  splitMode === 'individual'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-slate-200 dark:border-white/10 hover:border-purple-300'
                }`}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 ${
                  splitMode === 'individual' ? 'text-purple-600' : 'text-slate-400'
                }`} />
                <p className={`text-sm font-medium ${
                  splitMode === 'individual' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-white/60'
                }`}>
                  One Page Each
                </p>
                <p className="text-xs text-slate-500 mt-1">Each page as separate PDF</p>
              </button>
              <button
                onClick={() => setSplitMode('chunks')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  splitMode === 'chunks'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-slate-200 dark:border-white/10 hover:border-purple-300'
                }`}
              >
                <FileStack className={`w-6 h-6 mx-auto mb-2 ${
                  splitMode === 'chunks' ? 'text-purple-600' : 'text-slate-400'
                }`} />
                <p className={`text-sm font-medium ${
                  splitMode === 'chunks' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-white/60'
                }`}>
                  Fixed Chunks
                </p>
                <p className="text-xs text-slate-500 mt-1">N pages per PDF</p>
              </button>
            </div>
          </div>

          {splitMode === 'chunks' && (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
              <Slider
                label="Pages per PDF"
                value={pagesPerChunk}
                onChange={(e) => setPagesPerChunk(Number(e.target.value))}
                min={1}
                max={20}
                step={1}
                showValue
              />
            </div>
          )}

          {loading && (
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-700 dark:text-purple-300">Processing...</span>
                <span className="text-purple-600 dark:text-purple-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSplit} loading={loading} className="w-full" size="lg">
            <FileStack className="w-5 h-5" />
            Split PDF
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Output Preview
            </h3>

            {pdfInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {estimatedFiles}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/60">Output PDFs</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-700 dark:text-white/80">
                      {splitMode === 'individual' ? 1 : pagesPerChunk}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/60">Pages per PDF</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/30 rounded-xl p-4">
                  <p className="text-sm text-slate-600 dark:text-white/60 mb-3">Generated files:</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {Array.from({ length: Math.min(estimatedFiles, 12) }).map((_, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-white dark:bg-white/5 rounded-lg text-xs text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/10"
                      >
                        {splitMode === 'individual'
                          ? `page_${i + 1}.pdf`
                          : `part_${i + 1}.pdf`}
                      </span>
                    ))}
                    {estimatedFiles > 12 && (
                      <span className="px-2 py-1 text-xs text-slate-500">
                        +{estimatedFiles - 12} more...
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/60">
                  <Download className="w-4 h-4" />
                  <span>Output will be downloaded as a ZIP file</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <div className="text-center">
                  <FileStack className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload a PDF to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
