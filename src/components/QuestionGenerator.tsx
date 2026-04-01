import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { HelpCircle, Copy, Download, Sparkles } from 'lucide-react';
import { generateQuestions, extractTextFromPdf } from '@/services/aiService';

export function QuestionGenerator() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
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
      const result = await generateQuestions(inputText, count);
      setQuestions(result.questions);
      showToast('success', `Generated ${result.questions.length} questions!`);
    } catch {
      showToast('error', 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const copyQuestions = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('success', 'Questions copied!');
  };

  const downloadQuestions = () => {
    const content = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Question Generator</h2>
          <p className="text-slate-500 dark:text-white/60">Generate study questions from content</p>
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
              className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-[#050505]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4">
            <Slider
              label="Number of Questions"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={3}
              max={15}
              step={1}
              showValue
            />
          </div>

          <Button onClick={handleProcess} loading={loading} className="w-full" size="lg">
            <Sparkles className="w-5 h-5" />
            Generate Questions
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-4 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                Generated Questions
              </h3>
              {questions.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyQuestions}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadQuestions}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </span>
                      <p className="text-slate-700 dark:text-white/80 pt-1">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                Questions will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
