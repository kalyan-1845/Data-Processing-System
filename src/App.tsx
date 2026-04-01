import { useState, useEffect, useMemo } from 'react';
import { ToastProvider } from '@/ui/Toast';
import { Summarizer } from '@/components/Summarizer';
import { KeywordExtractor } from '@/components/KeywordExtractor';
import { QuestionGenerator } from '@/components/QuestionGenerator';
import { BulletGenerator } from '@/components/BulletGenerator';
import { OCR } from '@/components/OCR';
import { PdfCompressor } from '@/components/PdfCompressor';
import { ImageCompressor } from '@/components/ImageCompressor';
import { SplitPdf } from '@/components/SplitPdf';
import { SplitMany } from '@/components/SplitMany';
import { MergePdf } from '@/components/MergePdf';
import { Entrance } from '@/components/Entrance';
import { NeuralParticles } from '@/ui/particles';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  Tag,
  HelpCircle,
  List,
  ScanText,
  FileDown,
  ImageDown,
  Scissors,
  FileStack,
  Combine,
  Menu,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';

type Module =
  | 'summarizer'
  | 'keywords'
  | 'questions'
  | 'bullets'
  | 'ocr'
  | 'pdf-compress'
  | 'image-compress'
  | 'split-pdf'
  | 'split-many'
  | 'merge-pdf';

interface NavItem {
  id: Module;
  label: string;
  icon: any;
  category: 'ai' | 'document';
}

const navItems: NavItem[] = [
  { id: 'summarizer', label: 'AI Summarizer', icon: Sparkles, category: 'ai' },
  { id: 'keywords', label: 'Keyword Extractor', icon: Tag, category: 'ai' },
  { id: 'questions', label: 'Question Generator', icon: HelpCircle, category: 'ai' },
  { id: 'bullets', label: 'Bullet Generator', icon: List, category: 'ai' },
  { id: 'ocr', label: 'OCR Extractor', icon: ScanText, category: 'ai' },
  { id: 'pdf-compress', label: 'PDF Compressor', icon: FileDown, category: 'document' },
  { id: 'image-compress', label: 'Image Compressor', icon: ImageDown, category: 'document' },
  { id: 'split-pdf', label: 'Split & Extract', icon: Scissors, category: 'document' },
  { id: 'split-many', label: 'One → Many PDFs', icon: FileStack, category: 'document' },
  { id: 'merge-pdf', label: 'Merge PDFs', icon: Combine, category: 'document' },
];

const categoryColors: Record<string, string> = {
  ai: '139 92 246',      // Violet
  document: '16 185 129', // Emerald
  merge: '14 165 233',    // Sky
  ocr: '245 158 11',      // Amber
};

function NeuralMonitor() {
  const bars = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    del: Math.random(),
    dur: 1 + Math.random()
  })), []);

  return (
    <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 overflow-hidden relative group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Neural Link</span>
        <span className="text-[9px] font-medium text-emerald-400 animate-pulse">ACTIVE</span>
      </div>
      <div className="h-8 flex items-end gap-[2px]">
        {bars.map((bar: { id: number, del: number, dur: number }) => (
          <motion.div
            key={bar.id}
            animate={{ 
              height: ["30%", "80%", "30%", "60%", "30%"]
            }}
            transition={{ duration: bar.dur, repeat: Infinity, ease: "easeInOut", delay: bar.del }}
            className="flex-1 bg-gradient-to-t from-violet-500/50 to-violet-400/80 rounded-t-sm"
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none" />
    </div>
  );
}

function MagneticBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const particles = useMemo(() => [...Array(40)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: 10 + Math.random() * 30,
    off: Math.random() * 0.03
  })), []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
      {particles.map((p: { id: number, x: number, y: number, s: number, off: number }) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px]"
          animate={{ x: [`${p.x}%`, `${(p.x + 5) % 100}%`, `${p.x}%`] }}
          transition={{ duration: p.s, repeat: Infinity, ease: "linear" }}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(${(mouse.x - window.innerWidth/2) * p.off}px, ${(mouse.y - window.innerHeight/2) * p.off}px)`
          }}
        />
      ))}
    </div>
  );
}

function TechnicalHUD({ module }: { module: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const messages = [
      `SYS_INIT::${module.toUpperCase()}`,
      `NEURAL_LINK_ESTABLISHED`,
      `DATA_ENCRYPTION_ACTIVE`,
      `LOCAL_SECURE_V2.4`,
      `LOAD_BUFFER_0x${Math.random().toString(16).slice(2,6)}`
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, messages[i]].slice(-3));
      i = (i + 1) % messages.length;
    }, 3000);
    return () => clearInterval(interval);
  }, [module]);

  return (
    <div className="fixed bottom-10 right-10 z-50 pointer-events-none opacity-20 hidden lg:block">
      <div className="font-mono text-[9px] text-white flex flex-col gap-1 items-end">
        {logs.map((log, idx) => (
          <motion.span 
            key={`${log}-${idx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {log}
          </motion.span>
        ))}
        <div className="w-24 h-px bg-white/20 mt-2" />
        <span>DOCUSHRINK_TERMINAL_READY</span>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeModule, setActiveModule] = useState<Module>(() => {
    const saved = localStorage.getItem('docushrink-module');
    return (saved as Module) || 'summarizer';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('docushrink-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const category = navItems.find(i => i.id === activeModule)?.category || 'ai';
    const color = categoryColors[category] || categoryColors.ai;
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${color}, 0.2)`);
  }, [activeModule]);

  useEffect(() => {
    localStorage.setItem('docushrink-module', activeModule);
  }, [activeModule]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('docushrink-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('docushrink-theme', 'light');
    }
  }, [darkMode]);

  const handleModuleChange = (module: Module) => {
    setActiveModule(module);
    setSidebarOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const renderModule = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
                key={`loader-${activeModule}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute inset-0 z-[30] flex items-center justify-center bg-[#020202]/80 backdrop-blur-2xl pointer-events-none rounded-[2rem]"
            >
                <div className="flex flex-col items-center gap-6">
                    <motion.div 
                        initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center shadow-accent ring-1 ring-white/20"
                    >
                        <motion.div animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <Zap className="w-10 h-10 text-white fill-white" />
                        </motion.div>
                    </motion.div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.5em]">Loading Module</span>
                        <h3 className="text-white font-outfit text-lg font-medium">
                          {navItems.find(i => i.id === activeModule)?.label}
                        </h3>
                    </div>
                </div>
            </motion.div>
          </AnimatePresence>

          {(() => {
            switch (activeModule) {
              case 'summarizer': return <Summarizer />;
              case 'keywords': return <KeywordExtractor />;
              case 'questions': return <QuestionGenerator />;
              case 'bullets': return <BulletGenerator />;
              case 'ocr': return <OCR />;
              case 'pdf-compress': return <PdfCompressor />;
              case 'image-compress': return <ImageCompressor />;
              case 'split-pdf': return <SplitPdf />;
              case 'split-many': return <SplitMany />;
              case 'merge-pdf': return <MergePdf />;
              default: return <Summarizer />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const aiItems = navItems.filter((item) => item.category === 'ai');
  const documentItems = navItems.filter((item) => item.category === 'document');

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#020202] transition-colors duration-1000">
      <MagneticBackground />
      <TechnicalHUD module={activeModule} />
      
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-[40] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full min-h-screen font-inter">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Menu className="w-6 h-6 text-white/80" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-outfit text-xl text-white tracking-tight">DocuShrink</span>
            </div>
            <button onClick={toggleDarkMode} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </header>

        <aside
          className={cn(
            'fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-black/90 backdrop-blur-3xl border-r border-white/10 z-[50] transition-all duration-500 ease-[0.16,1,0.3,1] shadow-2xl flex flex-col',
            'lg:inset-y-4 lg:left-4 lg:w-72 lg:rounded-3xl lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-accent ring-1 ring-white/20 transition-colors duration-1000">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold font-outfit text-xl text-white tracking-tight">DocuShrink</h1>
                  <p className="text-[11px] font-medium text-accent uppercase tracking-widest">Active Core</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-3">AI Engines</p>
                <div className="space-y-1">
                  {aiItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleModuleChange(item.id)}
                      className={cn(
                        'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
                        activeModule === item.id ? 'text-white' : 'text-white/40 hover:text-white'
                      )}
                    >
                      {activeModule === item.id && (
                        <motion.div layoutId="activeNav" className="absolute inset-0 bg-accent rounded-xl shadow-accent border border-white/10" />
                      )}
                      <item.icon className={cn('w-5 h-5 relative z-10', activeModule === item.id ? 'text-white' : '')} />
                      <span className="text-sm font-medium relative z-10">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-3">Storage Hub</p>
                <div className="space-y-1">
                  {documentItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleModuleChange(item.id)}
                      className={cn(
                        'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
                        activeModule === item.id ? 'text-white' : 'text-white/40 hover:text-white'
                      )}
                    >
                      {activeModule === item.id && (
                        <motion.div layoutId="activeNav" className="absolute inset-0 bg-accent rounded-xl shadow-accent border border-white/10" />
                      )}
                      <item.icon className={cn('w-5 h-5 relative z-10', activeModule === item.id ? 'text-white' : '')} />
                      <span className="text-sm font-medium relative z-10">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <NeuralMonitor />
            </nav>

            <div className="p-4 border-t border-white/5 space-y-3">
              <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span className="text-sm font-medium text-white/70">{darkMode ? 'Dark' : 'Light'}</span>
                </div>
                <div className={cn("w-10 h-5 rounded-full relative transition-colors", darkMode ? "bg-accent/50" : "bg-white/10")}>
                  <motion.div animate={{ x: darkMode ? 22 : 2 }} className="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-lg" />
                </div>
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:ml-80 pt-20 lg:pt-0 pb-12 transition-all">
          <div className="max-w-6xl mx-auto p-4 lg:p-10">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}

export function App() {
  const [entered, setEntered] = useState(false);
  const [phase, setPhase] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ToastProvider>
      <AnimatePresence>
        {!entered && (
          <motion.div
            key="entrance"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(30px)' }}
            transition={{ duration: 1.5, ease: 'easeIn' }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <Entrance 
              onComplete={() => setEntered(true)} 
              onPhaseChange={setPhase}
              onHoverChange={setIsHovered}
            />
            <NeuralParticles explosionPhase={phase === 4} isHovered={isHovered} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {entered && (
          <motion.div
            initial={{ clipPath: 'inset(50% 0 50% 0)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0 0% 0)', opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-0 bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ 
          opacity: entered ? 1 : 0, 
          scale: entered ? 1 : 0.9,
          y: entered ? 0 : 30
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      >
        <AppContent />
      </motion.div>
    </ToastProvider>
  );
}

// version control incremental update 30

// version control incremental update 31

// version control incremental update 32

// version control incremental update 33

// version control incremental update 34

// version control incremental update 35

// version control incremental update 36

// version control incremental update 37

// version control incremental update 38

// version control incremental update 39

// version control incremental update 40

// version control incremental update 41

// version control incremental update 42

// version control incremental update 43

// version control incremental update 44

// version control incremental update 45

// version control incremental update 46

// version control incremental update 47

// version control incremental update 48

// version control incremental update 49

// version control incremental update 50

// version control incremental update 51

// version control incremental update 52

// version control incremental update 53

// version control incremental update 54

// version control incremental update 55

// version control incremental update 56

// version control incremental update 57

// version control incremental update 58

// version control incremental update 59

// version control incremental update 60

// version control incremental update 61

// version control incremental update 62

// version control incremental update 63

// version control incremental update 64

// version control incremental update 65

// version control incremental update 66

// version control incremental update 67

// version control incremental update 68

// version control incremental update 69

// version control incremental update 70

// version control incremental update 71

// version control incremental update 72

// version control incremental update 73

// version control incremental update 74

// version control incremental update 75

// version control incremental update 76
