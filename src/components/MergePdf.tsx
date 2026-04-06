import { useState, useCallback } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { Combine, Download, FileText, GripVertical, Trash2 } from 'lucide-react';
import { mergePdfs, getPdfInfo } from '@/services/pdfService';
import { saveAs } from 'file-saver';

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
  const [dropzoneKey, setDropzoneKey] = useState(0); // Force reset dropzone
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
    // Reset dropzone to clear its internal state
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
      showToast('success', 'PDFs merged successfully!');
    } catch {
      showToast('error', 'Failed to merge PDFs');
    } finally {
      setLoading(false);
    }
  };

  const downloadMerged = () => {
    if (result) {
      saveAs(result, 'merged.pdf');
    }
  };

  const totalPages = pdfFiles.reduce((sum, p) => sum + p.pageCount, 0);
  const totalSize = pdfFiles.reduce((sum, p) => sum + p.file.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
          <Combine className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merge PDFs</h2>
          <p className="text-slate-500 dark:text-white/60">Combine multiple PDFs into one</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <Dropzone
              key={dropzoneKey}
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={handleFilesChange}
              multiple
              maxFiles={20}
              label="Drop PDF files here (multiple)"
              icon="pdf"
              value={[]}
            />
          </div>

          {pdfFiles.length > 0 && (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-white/80 mb-3">
                Files to merge ({pdfFiles.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pdfFiles.map((pdf, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#050505]/40 rounded-xl"
                  >
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveFile(index, index - 1); }}
                        disabled={index === 0}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                      >
                        <GripVertical className="w-5 h-5 text-slate-400 rotate-90" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveFile(index, index + 1); }}
                        disabled={index === pdfFiles.length - 1}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                      >
                        <GripVertical className="w-5 h-5 text-slate-400 -rotate-90" />
                      </button>
                    </div>
                    
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                    
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-slate-700 dark:text-white/80 truncate">
                        {pdf.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {pdf.pageCount} pages • {(pdf.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="p-3 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl touch-manipulation"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-700 dark:text-blue-300">Merging PDFs...</span>
                <span className="text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleMerge} loading={loading} disabled={pdfFiles.length < 2} className="w-full" size="lg">
            <Combine className="w-5 h-5" />
            Merge PDFs
          </Button>
        </div>

        <div className="space-y-4">
          {pdfFiles.length > 0 && (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Merge Preview</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pdfFiles.length}</p>
                  <p className="text-xs text-slate-500 dark:text-white/60">PDFs to merge</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalPages}</p>
                  <p className="text-xs text-slate-500 dark:text-white/60">Total pages</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#050505]/40 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-500 dark:text-white/60 mb-2">Merge Order:</p>
                <div className="flex flex-wrap gap-1">
                  {pdfFiles.map((pdf, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white dark:bg-white/5 rounded text-xs text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/10 flex items-center gap-1"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      {pdf.file.name.slice(0, 10)}...
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-slate-500 dark:text-white/60">
                Estimated size: {(totalSize / 1024).toFixed(1)} KB
              </div>
            </div>
          )}

          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Combine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">merged.pdf</p>
                  <p className="text-sm text-slate-500">{(result.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <Button onClick={downloadMerged} className="w-full" size="lg">
                <Download className="w-5 h-5" />
                Download Merged PDF
              </Button>
            </div>
          )}

          {pdfFiles.length === 0 && !result && (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Combine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload multiple PDFs to merge</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
