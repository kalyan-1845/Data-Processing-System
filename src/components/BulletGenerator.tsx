import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { List, Sparkles } from 'lucide-react';
import { generateBullets, extractTextFromPdf } from '@/services/aiService';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

export function BulletGenerator() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [bullets, setBullets] = useState<string[]>([]);
  const [count, setCount] = useState(5);
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
      const result = await generateBullets(inputText, count);
      setBullets(result.bullets);
      showToast('success', `Generated ${result.bullets.length} bullet points!`);
    } catch {
      showToast('error', 'Failed to generate bullet points');
    } finally {
      setLoading(false);
    }
  };

  const downloadBullets = () => {
    const content = bullets.map((b) => `• ${b}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bullet-points.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolWrapper
      title="Bullet Generator"
      description="Convert dense paragraphs into organized, high-impact key points"
      icon={List}
      loading={loading}
      accentColor="sky"
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
              className="w-full h-48 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-inter"
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Slider
              label="Point Density"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={3}
              max={15}
              step={1}
              showValue
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full h-14 rounded-2xl text-lg font-bold" size="lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Bullets
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Key Points"
            icon={List}
            content={
              bullets.length > 0 ? (
                <ul className="space-y-4">
                  {bullets.map((bullet, index) => (
                    <li
                      key={index}
                      className="group relative flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-sky-500/5 to-blue-500/5 border border-sky-500/10 transition-all hover:bg-sky-500/10"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                      </span>
                      <p className="text-slate-700 dark:text-white/80 font-medium leading-relaxed">
                        {bullet}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null
            }
            onDownload={downloadBullets}
            empty={bullets.length === 0}
            emptyText="Structural bullet points will be derived from your content."
          />

          <div className="glass rounded-[2rem] p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
               <Sparkles className="w-6 h-6 text-sky-500" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1">AI Structured</h4>
            <p className="text-[10px] text-slate-500 dark:text-white/40">Neural parsing preserves context</p>
          </div>
        </div>
      }
    />
  );
}
