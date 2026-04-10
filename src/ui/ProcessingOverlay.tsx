import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ProcessingOverlayProps {
  loading: boolean;
  label?: string;
}

export function ProcessingOverlay({ loading, label = 'Neural Processing' }: ProcessingOverlayProps) {
  if (!loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#020202]/60 backdrop-blur-md rounded-[2rem] overflow-hidden"
    >
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Background Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10"
        />

        {/* Central Core Icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 rounded-full border-2 border-dashed border-accent/30 flex items-center justify-center"
          />
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(var(--accent), 0.4)',
                '0 0 50px rgba(var(--accent), 0.8)',
                '0 0 20px rgba(var(--accent), 0.4)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-4 rounded-full bg-accent flex items-center justify-center shadow-accent"
          >
            <Zap className="w-10 h-10 text-white fill-white" />
          </motion.div>
          
          {/* Orbital Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: -360 }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-10px] rounded-full border border-white/10 pointer-events-none"
            >
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent),1)]"
                style={{ opacity: 1 - i * 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] font-bold text-accent uppercase tracking-[0.5em]"
          >
            {label}
          </motion.p>
          <div className="flex items-center gap-1.5 h-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scaleY: [1, 2.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-[2px] h-full bg-accent rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hexagon Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
    </motion.div>
  );
}
