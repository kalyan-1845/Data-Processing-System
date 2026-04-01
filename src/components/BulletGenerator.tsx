import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { List, Copy, Download, Sparkles } from 'lucide-react';
import { generateBullets, extractTextFromPdf } from '@/services/aiService';

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

  const copyBullets = () => {
    const text = bullets.map((b) => `• ${b}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('success', 'Bullet points copied!');
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30">
          <List className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Bullet Generator</h2>
          <p className="text-slate-500 dark:text-white/60">Convert text to key bullet points</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <Dropzone
              accept={{ 'application/pdf': ['.pdf'] }}
              onFilesChange={setFiles}
              label="Drop PDF file here"
              icon="pdf"
            />
          </div>

          <div className="text-center text-slate-500 dark:text-white/60 text-sm">OR</div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-[#050505]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <Slider
              label="Number of Bullet Points"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={3}
              max={10}
              step={1}
              showValue
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full" size="lg">
            <Sparkles className="w-5 h-5" />
            Generate Bullets
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <List className="w-5 h-5 text-cyan-600" />
                Key Points
              </h3>
              {bullets.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyBullets}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadBullets}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {bullets.length > 0 ? (
              <ul className="space-y-3">
                {bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </span>
                    <p className="text-slate-700 dark:text-white/80">{bullet}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                Bullet points will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
