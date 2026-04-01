import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { ScanText, Copy, Download, Eye } from 'lucide-react';
import { performOcr, OCR_LANGUAGES, OcrProgress } from '@/services/ocrService';

export function OCR() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('eng');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const url = URL.createObjectURL(newFiles[0]);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      showToast('warning', 'Please upload an image first');
      return;
    }

    setLoading(true);
    setProgress({ status: 'initializing', progress: 0 });

    try {
      const result = await performOcr(files[0], language, (p) => setProgress(p));
      setText(result.text);
      setConfidence(result.confidence);
      showToast('success', `Text extracted with ${Math.round(result.confidence)}% confidence`);
    } catch {
      showToast('error', 'OCR processing failed');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Text copied to clipboard!');
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/20 dark:shadow-pink-900/40 relative group overflow-hidden">
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-300" />
          <ScanText className="w-7 h-7 text-white relative z-10 animate-float" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold font-outfit bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400">
            AI OCR Text Extractor
          </h2>
          <p className="text-slate-500 dark:text-white/60 font-medium">Extract text from images</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
            <Dropzone
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'] }}
              onFilesChange={handleFilesChange}
              label="Drop image here"
              icon="image"
            />
          </div>

          {preview && (
            <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
              <h4 className="text-sm font-medium text-slate-700 dark:text-white/80 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Image Preview
              </h4>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl shadow-inner border border-white/20 dark:border-white/5"
              />
            </div>
          )}

          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
              Recognition Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            >
              {OCR_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {progress && (
            <div className="glass rounded-3xl p-5 bg-pink-50/50 dark:bg-pink-900/10">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-pink-700 dark:text-pink-300 font-medium">{progress.status}</span>
                <span className="text-pink-600 dark:text-pink-400 font-bold">{progress.progress}%</span>
              </div>
              <div className="w-full h-2 bg-pink-200/50 dark:bg-pink-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleProcess} loading={loading} className="w-full" size="lg">
            <ScanText className="w-5 h-5" />
            Extract Text
          </Button>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 min-h-[300px] flex flex-col hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ScanText className="w-5 h-5 text-pink-600" />
                Extracted Text
              </h3>
              {text && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyText}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadText}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {text ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <pre className="text-sm text-slate-700 dark:text-white/80 whitespace-pre-wrap font-sans bg-slate-50 dark:bg-[#050505]/60 p-4 rounded-xl max-h-96 overflow-y-auto">
                  {text}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                Extracted text will appear here
              </div>
            )}
          </div>

          {confidence > 0 && (
            <div className="glass rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-pink-50/50 dark:bg-pink-900/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700 dark:text-white/80 font-medium">Recognition Confidence</span>
                <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {Math.round(confidence)}%
                </span>
              </div>
              <div className="w-full h-3 bg-pink-200/50 dark:bg-pink-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
