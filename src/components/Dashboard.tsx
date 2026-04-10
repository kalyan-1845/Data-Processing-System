import { motion } from 'framer-motion';
import { Sparkles, Tag, HelpCircle, List, ScanText, FileDown, ImageDown, Scissors, FileStack, Combine, Zap, ShieldCheck, Cpu, Database } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DashboardProps {
  onSelectModule: (module: any) => void;
}

const tools = [
  { id: 'summarizer', label: 'AI Summarizer', icon: Sparkles, color: 'violet', desc: 'Neural text compression' },
  { id: 'keywords', label: 'Keyword Extractor', icon: Tag, color: 'emerald', desc: 'Entity & term extraction' },
  { id: 'questions', label: 'Question Gen', icon: HelpCircle, color: 'amber', desc: 'Automated study material' },
  { id: 'bullets', label: 'Bullet Points', icon: List, color: 'sky', desc: 'Structural transformation' },
  { id: 'ocr', label: 'OCR Extractor', icon: ScanText, color: 'orange', desc: 'Image to neural text' },
  { id: 'pdf-compress', label: 'PDF Compressor', icon: FileDown, color: 'rose', desc: 'Target size optimization' },
  { id: 'image-compress', label: 'Image Engine', icon: ImageDown, color: 'indigo', desc: 'Visual data reduction' },
  { id: 'split-pdf', label: 'PDF Splitter', icon: Scissors, color: 'pink', desc: 'Page range extraction' },
  { id: 'split-many', label: 'One → Many', icon: FileStack, color: 'teal', desc: 'Batch PDF decomposition' },
  { id: 'merge-pdf', label: 'PDF Merger', icon: Combine, color: 'blue', desc: 'Document unification' },
];

export function Dashboard({ onSelectModule }: DashboardProps) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 relative py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-xl mb-6 shadow-accent"
        >
          <Zap className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Neural Intelligence v1.0</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl lg:text-7xl font-extrabold font-outfit tracking-tighter text-slate-800 dark:text-white leading-[1.1]"
        >
          Your Data, <br className="lg:hidden" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-500">Intelligently Refined.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg lg:text-xl font-medium leading-relaxed"
        >
          DocuShrink combines neural AI with professional document tools to transform how you process, extract, and optimize information.
        </motion.p>

        {/* Floating Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] -z-10 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/30 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tools.map((tool, idx) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * idx }}
            onClick={() => onSelectModule(tool.id)}
            className="group relative glass p-6 rounded-[2rem] text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-white/10 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-${tool.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className={cn(
               "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110",
               `bg-gradient-to-br from-${tool.color}-500 to-${tool.color}-600 shadow-lg shadow-${tool.color}-500/20`
            )}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="font-outfit font-bold text-slate-800 dark:text-white text-lg mb-2 relative z-10">
              {tool.label}
            </h3>
            <p className="text-slate-500 dark:text-white/40 text-sm font-medium relative z-10 line-clamp-2 leading-relaxed">
              {tool.desc}
            </p>
            
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4">
              <Zap className="w-5 h-5 text-accent" />
            </div>
          </motion.button>
        ))}
      </section>

      {/* Trust / Stats Section */}
      <section className="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
             <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Privacy Guaranteed</h4>
            <p className="text-xs text-slate-500 dark:text-white/40">100% Local Processing</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
             <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Neural Core v1.0</h4>
            <p className="text-xs text-slate-500 dark:text-white/40">Optimized AI Architectures</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
             <Database className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Large Scale Ready</h4>
            <p className="text-xs text-slate-500 dark:text-white/40">High performance throughput</p>
          </div>
        </div>
      </section>
    </div>
  );
}
