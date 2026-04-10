import { useState } from 'react';
import { Dropzone } from '@/ui/Dropzone';
import { Button } from '@/ui/Button';
import { Slider } from '@/ui/Slider';
import { useToast } from '@/ui/Toast';
import { HelpCircle, Sparkles } from 'lucide-react';
import { generateQuestions, extractTextFromPdf } from '@/services/aiService';
import { ToolWrapper } from '@/ui/ToolWrapper';
import { OutputCard } from '@/ui/OutputCard';

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
    <ToolWrapper
      title="Question Generator"
      description="Automate study materials and knowledge checks from any content"
      icon={HelpCircle}
      loading={loading}
      accentColor="amber"
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
              placeholder="Paste your source text here..."
              className="w-full h-48 p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-inter"
            />
          </div>

          <div className="glass rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
            <Slider
              label="Quantity"
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
            Generate Questions
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <OutputCard
            title="Generated Questions"
            icon={HelpCircle}
            content={
              questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 transition-all hover:bg-amber-500/10"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/20">
                          {index + 1}
                        </span>
                        <p className="text-slate-700 dark:text-white/80 font-medium leading-relaxed pt-0.5">
                          {question}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null
            }
            onDownload={downloadQuestions}
            empty={questions.length === 0}
            emptyText="Neural questions for study and review will appear here."
          />

          <div className="glass rounded-[2rem] p-6">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">Neural Tip</h4>
            <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed italic">
              "Providing more context results in higher-quality, more specific questions suited for complex subjects."
            </p>
          </div>
        </div>
      }
    />
  );
}
