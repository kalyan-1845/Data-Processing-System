import { motion, AnimatePresence } from 'framer-motion';
import { ProcessingOverlay } from './ProcessingOverlay';
import { cn } from '@/utils/cn';

interface ToolWrapperProps {
  title: string;
  description: string;
  icon: any;
  loading?: boolean;
  accentColor?: string;
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
}

export function ToolWrapper({
  title,
  description,
  icon: Icon,
  loading = false,
  accentColor = 'violet',
  children,
  sidebar,
  main,
}: ToolWrapperProps) {
  return (
    <div className="relative space-y-8 min-h-[calc(100vh-12rem)] pb-12">
      {/* Tool Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in pt-4">
        <div className="flex items-center gap-6 group">
          <div className={cn(
            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:rotate-3",
            `bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-700`,
            "shadow-accent/40 dark:shadow-accent/20"
          )}>
            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-300" />
            <Icon className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
            
            {/* Neural Pulse Background */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-white/10 blur-xl pointer-events-none"
            />
          </div>
          <div className="space-y-1">
            <h2 className={cn(
              "text-3xl font-extrabold font-outfit tracking-tight",
              `text-slate-900 dark:text-white`
            )}>
              {title}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-accent animate-pulse shadow-accent`} />
              <p className="text-slate-500 dark:text-white/50 font-medium text-sm lg:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Optional: Tool Badge or Version */}
        <div className="hidden lg:block">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Secure Local Processing</span>
          </div>
        </div>
      </div>

      {/* Main Tool Interface */}
      <div className="relative">
        <AnimatePresence>
          {loading && <ProcessingOverlay loading={loading} label={`Processing by ${title}`} />}
        </AnimatePresence>

        {children || (
          <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1.5fr_1fr] gap-8 items-start">
            <div className="space-y-8 min-h-[500px]">
              {main}
            </div>
            <aside className="space-y-8 lg:sticky lg:top-24">
              {sidebar}
            </aside>
          </div>
        )}
      </div>

      {/* Neural Link Bottom HUD Element */}
      <div className="absolute -bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none opacity-50" />
    </div>
  );
}
