import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { FileText, Sparkles } from 'lucide-react';
import { summarizeText, extractTextFromPdf } from '@/services/aiService';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

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
    <ToolWrapper
      title="AI Text Summarizer"
      description="Extract key points from documents using neural compression"
      icon={Sparkles}
      loading={loading}
      accentColor="violet"
      main={
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Dropzone
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={setFiles}
              label="Drop PDF file here"
              icon="pdf"
            />
          </div>

          <div className="relative flex justify-center py-2">
             <span className="bg-slate-50 dark:bg-[#020202] px-4 text-xs font-bold text-slate-400 tracking-widest uppercase">OR</span>
             <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-white/5 -z-10" />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-48 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-inter"
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Slider
              label="Compression Ratio"
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              min={10}
              max={80}
              step={5}
              showValue
              unit="%"
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Summary
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Summary Result"
            icon={FileText}
            content={summary}
            onDownload={downloadSummary}
            empty={!summary}
            emptyText="Your neural summary will appear here after processing."
          />

          {stats && (
            <div className="grid grid-cols-1 gap-4 animate-in">
              <div className="glass rounded-[2rem] p-6 flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Compression</p>
                  <p className="text-3xl font-black text-violet-500">{stats.ratio}%</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-white/5 border-t-violet-500 group-hover:rotate-180 transition-transform duration-700" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-[2rem] p-6">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Original</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-white/80">{stats.original}</p>
                </div>
                <div className="glass rounded-[2rem] p-6">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Summary</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-white/80">{stats.summary}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
