import { motion } from 'framer-motion';
import { Copy, Download, Share2, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { useToast } from './Toast';
import { cn } from '@/utils/cn';

interface OutputCardProps {
  title: string;
  icon?: any;
  content: string | React.ReactNode;
  onDownload?: () => void;
  className?: string;
  empty?: boolean;
  emptyText?: string;
}

export function OutputCard({
  title,
  icon: Icon = FileText,
  content,
  onDownload,
  className,
  empty,
  emptyText = 'Results will appear here...',
}: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    if (typeof content === 'string') {
      navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('success', 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && typeof content === 'string') {
      navigator.share({
        title: `DocuShrink - ${title}`,
        text: content,
      }).catch(() => {});
    } else {
      showToast('info', 'Sharing is not supported on this browser');
    }
  };

  return (
    <div className={cn(
      "glass rounded-[2rem] p-6 min-h-[400px] flex flex-col hover:shadow-2xl transition-all duration-500 relative overflow-hidden group border-white/10 dark:border-white/5 bg-white/5",
      className
    )}>
      {/* Decorative Gradient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-accent/10 transition-colors duration-700 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-outfit font-bold text-slate-800 dark:text-white tracking-tight">
            {title}
          </h3>
        </div>

        {!empty && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCopy} className="rounded-xl w-10 h-10 p-0">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            {onDownload && (
              <Button size="sm" variant="ghost" onClick={onDownload} className="rounded-xl w-10 h-10 p-0">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleShare} className="rounded-xl w-10 h-10 p-0">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10">
        {empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
              <Icon className="w-8 h-8 text-slate-300 dark:text-white/20" />
            </div>
            <p className="text-slate-400 dark:text-white/30 font-medium max-w-[200px] leading-relaxed">
              {emptyText}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-slate dark:prose-invert max-w-none h-full"
          >
            {typeof content === 'string' ? (
              <p className="text-slate-700 dark:text-white/80 whitespace-pre-wrap font-inter leading-relaxed text-sm lg:text-base">
                {content}
              </p>
            ) : (
              content
            )}
          </motion.div>
        )}
      </div>

      {/* Footer / Meta (Optional) */}
      {!empty && typeof content === 'string' && (
        <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
          <span>Processed by DocuShrink AI</span>
          <span>{content.length} characters</span>
        </div>
      )}
    </div>
  );
}
