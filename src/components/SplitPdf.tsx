import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { Scissors, Download, FileText, Info } from 'lucide-react';
import { splitPdf, getPdfInfo, parsePageRange } from '@/services/pdfService';
import { saveAs } from 'file-saver';

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
      const fileName = files[0].name.replace('.pdf', `_pages_${pageRange.replace(/,/g, '-')}.pdf`);
      saveAs(result, fileName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
          <Scissors className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PDF Split & Extract</h2>
          <p className="text-slate-500 dark:text-white/60">Extract specific pages from PDF</p>
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
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <span className="text-slate-700 dark:text-white/80">
                Total: {pdfInfo.pageCount} page{pdfInfo.pageCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
              Page Range
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="e.g., 1-3, 5, 7-9"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#050505]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-white/60">
                Enter page numbers or ranges separated by commas. Examples: "1-5", "1,3,5", "1-3,5,7-9"
              </p>
            </div>
          </div>

          {pdfInfo && (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
              <p className="text-sm font-medium text-slate-700 dark:text-white/80 mb-3">Quick Select</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPageRange('1')}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors touch-manipulation"
                >
                  First Page
                </button>
                <button
                  onClick={() => setPageRange(String(pdfInfo.pageCount))}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors touch-manipulation"
                >
                  Last Page
                </button>
                <button
                  onClick={() => setPageRange(`1-${Math.ceil(pdfInfo.pageCount / 2)}`)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors touch-manipulation"
                >
                  First Half
                </button>
                <button
                  onClick={() => {
                    const evens = Array.from({ length: pdfInfo.pageCount }, (_, i) => i + 1)
                      .filter((n) => n % 2 === 0)
                      .join(',');
                    setPageRange(evens);
                  }}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors touch-manipulation"
                >
                  Even Pages
                </button>
                <button
                  onClick={() => {
                    const odds = Array.from({ length: pdfInfo.pageCount }, (_, i) => i + 1)
                      .filter((n) => n % 2 === 1)
                      .join(',');
                    setPageRange(odds);
                  }}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors touch-manipulation"
                >
                  Odd Pages
                </button>
              </div>
            </div>
          )}

          <Button onClick={handleSplit} loading={loading} className="w-full" size="lg">
            <Scissors className="w-5 h-5" />
            Extract Pages
          </Button>
        </div>

        <div className="space-y-4">
          {result ? (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-orange-600" />
                Extraction Result
              </h3>

              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-500 dark:text-white/60 mb-2">Extracted Pages</p>
                <div className="flex flex-wrap gap-2">
                  {extractedPages.map((page) => (
                    <span
                      key={page}
                      className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {extractedPages.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/60">Pages Extracted</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-700 dark:text-white/80">
                    {(result.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/60">New File Size</p>
                </div>
              </div>

              <Button onClick={downloadResult} className="w-full" size="lg">
                <Download className="w-5 h-5" />
                Download Extracted PDF
              </Button>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload a PDF and select pages to extract</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
