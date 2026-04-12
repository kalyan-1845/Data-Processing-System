import { motion } from 'framer-motion';
import { Sparkles, Tag, HelpCircle, List, ScanText, FileDown, ImageDown, Scissors, FileStack, Combine, Zap, ShieldCheck, Cpu, Database } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DashboardProps {
  onSelectModule: (module: any) => void;
}

const tools = [
  { id: 'summarizer', label: 'AI Summarizer', icon: Sparkles, desc: 'Neural text compression', iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600', hoverBg: 'from-violet-500/10' },
  { id: 'keywords', label: 'Keyword Engine', icon: Tag, desc: 'Entity & term extraction', iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', hoverBg: 'from-emerald-500/10' },
  { id: 'questions', label: 'Question Gen', icon: HelpCircle, desc: 'Automated study material', iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600', hoverBg: 'from-amber-500/10' },
  { id: 'bullets', label: 'Bullet Points', icon: List, desc: 'Structural transformation', iconBg: 'bg-gradient-to-br from-sky-500 to-sky-600', hoverBg: 'from-sky-500/10' },
  { id: 'ocr', label: 'OCR Extractor', icon: ScanText, desc: 'Image to neural text', iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600', hoverBg: 'from-orange-500/10' },
  { id: 'pdf-compress', label: 'PDF Optimizer', icon: FileDown, desc: 'Target size compression', iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600', hoverBg: 'from-rose-500/10' },
  { id: 'image-compress', label: 'Image Engine', icon: ImageDown, desc: 'Visual data reduction', iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', hoverBg: 'from-indigo-500/10' },
  { id: 'split-pdf', label: 'Page Extractor', icon: Scissors, desc: 'Precise range selection', iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600', hoverBg: 'from-pink-500/10' },
  { id: 'split-many', label: 'Batch Splitter', icon: FileStack, desc: 'Atomic decomposition', iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600', hoverBg: 'from-teal-500/10' },
  { id: 'merge-pdf', label: 'Neural Merger', icon: Combine, desc: 'Document unification', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', hoverBg: 'from-blue-500/10' },
];

export function Dashboard({ onSelectModule }: DashboardProps) {
  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl mb-8 shadow-2xl relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-accent/5 animate-pulse" />
          <Zap className="w-3.5 h-3.5 text-accent relative z-10" />
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] relative z-10">Neural Intelligence Core v1.0</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-6xl lg:text-8xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white leading-[0.95]"
        >
          Your Data, <br className="hidden sm:block" />
          <span 
            className="bg-clip-text text-transparent animate-gradient"
            style={{ 
              backgroundImage: 'linear-gradient(90deg, #a78bfa, #c084fc, #e879f9, #c084fc, #a78bfa)', 
              backgroundSize: '200% auto' 
            }}
          >
            Intelligently Refined.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-slate-500 dark:text-white/70 max-w-3xl mx-auto text-lg lg:text-2xl font-bold leading-relaxed px-4"
        >
          DocuShrink orchestrates neural AI architectures to transform, <br className="hidden lg:block" /> 
          compact, and extract intelligence from your documents seamlessly.
        </motion.p>
      </section>

      {/* Feature Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tools.map((tool, idx) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 * idx, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onSelectModule(tool.id)}
            className="group relative glass p-8 rounded-[2.5rem] text-left hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-white/10 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.hoverBg} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl",
               tool.iconBg
            )}>
              <tool.icon className="w-7 h-7 text-white" />
            </div>
            
            <h3 className="font-outfit font-black text-slate-800 dark:text-white text-xl mb-3 relative z-10 tracking-tight leading-none">
              {tool.label}
            </h3>
            <p className="text-slate-500 dark:text-white/50 text-xs font-bold uppercase tracking-tight relative z-10 leading-relaxed mb-8">
              {tool.desc}
            </p>
            
            <div className="absolute bottom-8 right-8 p-2 rounded-xl bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-4">
              <Zap className="w-4 h-4 text-accent" />
            </div>
          </motion.button>
        ))}
      </section>

      {/* Trust / Stats Section */}
      <section className="grid md:grid-cols-3 gap-12 pt-12 border-t border-slate-200/50 dark:border-white/5">
        {[
          { icon: ShieldCheck, label: 'Privacy Guaranteed', sub: '100% Neural Sovereignty', statBg: 'bg-emerald-500/10', statText: 'text-emerald-500', statRing: 'ring-emerald-500/20' },
          { icon: Cpu, label: 'Optimization Engine', sub: 'Low Latency Throughput', statBg: 'bg-violet-500/10', statText: 'text-violet-500', statRing: 'ring-violet-500/20' },
          { icon: Database, label: 'Payload Ready', sub: 'Enterprise-Grade Parsing', statBg: 'bg-blue-500/10', statText: 'text-blue-500', statRing: 'ring-blue-500/20' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 text-left"
          >
            <div className={`w-14 h-14 rounded-[1.25rem] ${item.statBg} flex items-center justify-center ${item.statText} ring-1 ${item.statRing}`}>
               <item.icon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight mb-0.5">{item.label}</h4>
              <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.1em]">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
