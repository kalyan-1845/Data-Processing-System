import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { Tag, Sparkles } from 'lucide-react';
import { extractKeywords, extractTextFromPdf } from '@/services/aiService';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

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
    <ToolWrapper
      title="Keyword Extractor"
      description="Identify core entities and concepts using neural indexing"
      icon={Tag}
      loading={loading}
      accentColor="emerald"
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
              className="w-full h-48 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-inter"
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Slider
              label="Entity Limit"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={5}
              max={30}
              step={1}
              showValue
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Extract Keywords
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Extracted Keywords"
            icon={Tag}
            content={
              keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="group relative px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 transition-all hover:bg-emerald-500/20"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{keyword.word}</span>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        Score: {keyword.score}% | Freq: {keyword.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null
            }
            onDownload={downloadKeywords}
            empty={keywords.length === 0}
            emptyText="Detected keywords will appear here as neural tags."
          />

          {keywords.length > 0 && (
            <div className="glass rounded-[2rem] p-6 animate-in">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-6">Neural Relevance Map</h4>
              <div className="space-y-4">
                {keywords.slice(0, 5).map((keyword, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-white/80">{keyword.word}</span>
                      <span className="text-emerald-500">{keyword.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${keyword.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
