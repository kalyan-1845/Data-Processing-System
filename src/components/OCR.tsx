import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';
import { ScanText, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { performOcr, OCR_LANGUAGES, OcrProgress } from '@/services/ocrService';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

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
    <ToolWrapper
      title="OCR Text Extractor"
      description="Convert images and scanned documents into editable neural text"
      icon={ScanText}
      loading={loading}
      accentColor="orange"
      main={
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Dropzone
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'] }}
              onFilesChange={handleFilesChange}
              label="Drop image here"
              icon="image"
            />
          </div>

          {preview && (
            <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Image Preview
              </h4>
              <div className="relative group overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-black/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">
              Neural Language Model
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-outfit font-bold"
            >
              {OCR_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <ScanText className="w-5 h-5 mr-2" />
            Extract Text
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Extracted Neural Text"
            icon={ScanText}
            content={
              text ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <pre className="text-sm text-slate-700 dark:text-white/80 whitespace-pre-wrap font-inter bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-white/5 max-h-96 overflow-y-auto leading-relaxed">
                      {text}
                    </pre>
                  </div>
                </div>
              ) : null
            }
            onDownload={downloadText}
            empty={!text}
            emptyText="AI-identified text from your image will appear here."
          />

          {loading && progress && (
            <div className="glass rounded-[2rem] p-6 animate-in bg-orange-500/5 border-orange-500/10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-white">{progress.status}</p>
                </div>
                <p className="text-2xl font-black text-orange-500">{progress.progress}%</p>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500"
                />
              </div>
            </div>
          )}

          {confidence > 0 && !loading && (
            <div className="glass rounded-[2rem] p-6 animate-in border-emerald-500/10 dark:border-emerald-500/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Accuracy</p>
                <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Verified</div>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white mb-4">{Math.round(confidence)}%</p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
