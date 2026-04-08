import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

function Pencil3D() {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <group ref={meshRef} scale={1.5} rotation={[0, 0, Math.PI / 4]}>
      {/* Main Body - Hexagonal yellow cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.0, 6]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Wood Tip - Conical */}
      <mesh position={[0, -1.25, 0]}>
        <coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>
      
      {/* Graphite Lead - Small conical point */}
      <mesh position={[0, -1.5, 0]}>
        <coneGeometry args={[0.06, 0.12, 6]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Eraser - Pink top */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 12]} />
        <meshStandardMaterial color="#f472b6" roughness={0.5} />
      </mesh>
      
      {/* Metal Ferrule - Silver connector */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.2, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      <ambientLight intensity={1.5} />
      <pointLight position={[2, 2, 2]} intensity={5} color="white" />
    </group>
  );
}

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
    try {
      localStorage.setItem('docushrink-module', activeModule);
    } catch(e) {}
  }, [activeModule]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      try { localStorage.setItem('docushrink-theme', 'dark'); } catch(e) {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('docushrink-theme', 'light'); } catch(e) {}
    }
  }, [darkMode]);

  const handleModuleChange = (module: Module) => {
    setActiveModule(module);
    setSidebarOpen(false);
    // Presentation Polish: Always reset scroll to top on module change
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const renderModule = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
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
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#020202] transition-colors duration-1000 lg:overflow-hidden">
      <MagneticBackground />
      <TechnicalHUD module={activeModule} />
      
      {/* Mobile Backdrop Overlay - High Priority */}
      <AnimatePresence>
        {sidebarOpen && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[900] lg:hidden pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Mobile Header - Elevated to Top Level Level Stacking */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[1000] bg-black/80 backdrop-blur-2xl border-b border-white/10 safe-top">
        <div className="flex items-center justify-between p-4 px-5">
          <button 
            onPointerDown={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
            className="p-4 -m-3 hover:bg-white/5 active:bg-white/10 rounded-2xl transition-all touch-manipulation relative z-[1001] flex items-center justify-center cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/20 blur-md group-hover:bg-accent/40 transition-all" />
              <img src="/pwa-192x192.png" alt="Logo" className="w-7 h-7 relative z-10 drop-shadow-[0_0_8px_rgba(var(--accent),0.6)]" />
            </div>
            <span className="font-bold font-outfit text-xl text-white tracking-[-0.03em]">DocuShrink</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }} 
            className="p-4 -m-3 hover:bg-white/5 active:bg-white/10 rounded-2xl transition-all touch-manipulation flex items-center justify-center cursor-pointer relative z-[1001]"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Sidebar - Elevated to Top Level Stacking */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-black/95 backdrop-blur-3xl border-r border-white/10 z-[1100] transition-all duration-500 ease-[0.16,1,0.3,1] shadow-2xl flex flex-col',
          'lg:inset-y-4 lg:left-4 lg:w-72 lg:rounded-3xl lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-accent/25 blur-lg animate-pulse" />
                <img src="/pwa-192x192.png" alt="Logo" className="w-9 h-9 relative z-10 drop-shadow-[0_0_12px_rgba(var(--accent),0.8)]" />
              </div>
              <div>
                <h1 className="font-extrabold font-outfit text-2xl text-white tracking-[-0.04em] leading-none">DocuShrink</h1>
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mt-1 opacity-80">Neural Core v1.0</p>
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
                    onPointerDown={(e) => { e.stopPropagation(); handleModuleChange(item.id); }}
                    onClick={(e) => { e.stopPropagation(); handleModuleChange(item.id); }}
                    className={cn(
                      'group relative w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 active:scale-[0.98] touch-manipulation',
                      activeModule === item.id ? 'text-white' : 'text-white/40 hover:text-white'
                    )}
                  >
                    {activeModule === item.id && (
                      <div className="absolute inset-0 z-0">
                        <motion.div 
                          layoutId="activeNav" 
                          className="absolute inset-0 bg-accent rounded-xl shadow-accent border border-white/10" 
                        />
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 pointer-events-none hidden lg:block">
                          <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                            <Pencil3D />
                          </Canvas>
                        </div>
                      </div>
                    )}
                    <item.icon className={cn('w-6 h-6 relative z-10', activeModule === item.id ? 'text-white' : '')} />
                    <span className="text-base font-medium relative z-10">{item.label}</span>
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
                    onPointerDown={(e) => { e.stopPropagation(); handleModuleChange(item.id); }}
                    onClick={(e) => { e.stopPropagation(); handleModuleChange(item.id); }}
                    className={cn(
                      'group relative w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 active:scale-[0.98] touch-manipulation',
                      activeModule === item.id ? 'text-white' : 'text-white/40 hover:text-white'
                    )}
                  >
                    {activeModule === item.id && (
                      <div className="absolute inset-0 z-0">
                        <motion.div 
                          layoutId="activeNav" 
                          className="absolute inset-0 bg-accent rounded-xl shadow-accent border border-white/10" 
                        />
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 pointer-events-none hidden lg:block">
                          <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                            <Pencil3D />
                          </Canvas>
                        </div>
                      </div>
                    )}
                    <item.icon className={cn('w-6 h-6 relative z-10', activeModule === item.id ? 'text-white' : '')} />
                    <span className="text-base font-medium relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <NeuralMonitor />
          </nav>

          <div className="p-4 border-t border-white/5 space-y-3">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }}
              className="w-full flex items-center justify-between px-4 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all touch-manipulation cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <span className="text-sm font-medium text-white/70">{darkMode ? 'Dark' : 'Light'}</span>
              </div>
              <div className={cn("w-10 h-5 rounded-full relative transition-colors", darkMode ? "bg-accent/50" : "bg-white/10")}>
                <motion.div animate={{ x: darkMode ? 22 : 2 }} className="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </button>
          </div>
        </div>
      </aside>

      <div className="relative z-10 w-full min-h-screen font-inter">
        <main className="lg:ml-80 pt-24 lg:pt-0 pb-12 transition-all relative z-0">
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
            exit={{ opacity: 0, scale: 1.5 }}
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

// version control incremental update 77

// version control incremental update 78

// version control incremental update 79

// version control incremental update 80
