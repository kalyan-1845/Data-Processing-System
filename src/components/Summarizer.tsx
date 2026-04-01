import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { FileText, Copy, Download, Sparkles } from 'lucide-react';
import { summarizeText, extractTextFromPdf } from '@/services/aiService';

export function Summarizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [ratio, setRatio] = useState(30);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ original: number; summary: number; ratio: number } | null>(null);
  const { showToast } = useToast();

  const handleProcess = async () => {
    let inputText = text;

    if (files.length > 0 && !inputText) {
      setLoading(true);
      try {
        inputText = await extractTextFromPdf(files[0]);
        setText(inputText);
      } catch {
        showToast('error', 'Failed to extract text from PDF');
        setLoading(false);
        return;
      }
    }

    if (!inputText.trim()) {
      showToast('warning', 'Please enter text or upload a PDF');
      return;
    }

    setLoading(true);
    try {
      const result = await summarizeText(inputText, ratio / 100);
      setSummary(result.summary);
      setStats({
        original: result.originalLength,
        summary: result.summaryLength,
        ratio: result.compressionRatio,
      });
      showToast('success', 'Summary generated successfully!');
    } catch {
      showToast('error', 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    showToast('success', 'Copied to clipboard!');
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20 dark:shadow-violet-900/40 relative group overflow-hidden">
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-300" />
          <Sparkles className="w-7 h-7 text-white relative z-10 animate-float" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold font-outfit bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            AI Text Summarizer
          </h2>
          <p className="text-slate-500 dark:text-white/60 font-medium">Extract key points from documents</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300">
            <Dropzone
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={setFiles}
              label="Drop PDF file here"
              icon="pdf"
            />
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
               <div className="w-full border-t border-slate-200/50 dark:border-white/10"></div>
             </div>
             <div className="relative flex justify-center text-sm font-medium leading-6">
               <span className="bg-slate-50 dark:bg-[#050505] px-4 text-slate-400">OR</span>
             </div>
          </div>

          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-40 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>

          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300">
            <Slider
              label="Summary Length"
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              min={10}
              max={80}
              step={5}
              showValue
              unit="%"
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full" size="lg">
            <Sparkles className="w-5 h-5" />
            Generate Summary
          </Button>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 min-h-[300px] flex flex-col hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Summary Result
              </h3>
              {summary && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadSummary}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {summary ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-white/80 whitespace-pre-wrap">{summary}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                Summary will appear here
              </div>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-4 animate-in">
              <div className="glass rounded-3xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-violet-50/50 dark:bg-violet-900/10">
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.original}</p>
                <p className="text-xs text-slate-500 dark:text-white/60">Original chars</p>
              </div>
              <div className="glass rounded-3xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-indigo-50/50 dark:bg-indigo-900/10">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.summary}</p>
                <p className="text-xs text-slate-500 dark:text-white/60">Summary chars</p>
              </div>
              <div className="glass rounded-3xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-emerald-50/50 dark:bg-emerald-900/10">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.ratio}%</p>
                <p className="text-xs text-slate-500 dark:text-white/60">Compressed</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
