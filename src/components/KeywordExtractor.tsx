import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { Tag, Copy, Download, Sparkles } from 'lucide-react';
import { extractKeywords, extractTextFromPdf } from '@/services/aiService';

interface Keyword {
  word: string;
  score: number;
  frequency: number;
}

export function KeywordExtractor() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
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
      const result = await extractKeywords(inputText, count);
      setKeywords(result.keywords);
      showToast('success', `Found ${result.keywords.length} keywords!`);
    } catch {
      showToast('error', 'Failed to extract keywords');
    } finally {
      setLoading(false);
    }
  };

  const copyKeywords = () => {
    const text = keywords.map((k) => k.word).join(', ');
    navigator.clipboard.writeText(text);
    showToast('success', 'Keywords copied!');
  };

  const downloadKeywords = () => {
    const content = keywords.map((k) => `${k.word} (score: ${k.score}, freq: ${k.frequency})`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 dark:shadow-emerald-900/40 relative group overflow-hidden">
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-300" />
          <Tag className="w-7 h-7 text-white relative z-10 animate-float" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold font-outfit bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
            AI Keyword Extractor
          </h2>
          <p className="text-slate-500 dark:text-white/60 font-medium">Extract important terms from documents</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
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

          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-40 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="glass rounded-3xl p-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
            <Slider
              label="Number of Keywords"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={5}
              max={30}
              step={1}
              showValue
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full" size="lg">
            <Sparkles className="w-5 h-5" />
            Extract Keywords
          </Button>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 min-h-[300px] flex flex-col hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                Extracted Keywords
              </h3>
              {keywords.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyKeywords}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadKeywords}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="group relative px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-700 transition-all hover:shadow-md"
                  >
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">{keyword.word}</span>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Score: {keyword.score} | Freq: {keyword.frequency}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                Keywords will appear here
              </div>
            )}
          </div>

          {keywords.length > 0 && (
            <div className="glass rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h4 className="text-sm font-medium text-slate-700 dark:text-white/80 mb-4">Top 5 Keywords</h4>
              <div className="space-y-2">
                {keywords.slice(0, 5).map((keyword, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-white/60 text-sm w-6">{index + 1}.</span>
                    <span className="flex-1 text-slate-700 dark:text-white/80">{keyword.word}</span>
                    <div className="w-24 h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${keyword.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8">{keyword.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
