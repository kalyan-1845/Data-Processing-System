import { cn } from '@/utils/cn';
import { Upload, FileText, Image, X } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

interface DropzoneProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  label?: string;
  icon?: 'pdf' | 'image' | 'text';
  value?: File[]; // External control of files
  resetOnProcess?: boolean; // Reset after processing
}

export function Dropzone({
  accept,
  multiple = false,
  maxFiles = 10,
  onFilesChange,
  label = 'Drop files here or click to upload',
  icon = 'pdf',
  value,
}: DropzoneProps) {
  const [files, setFiles] = useState<File[]>(value || []);
  const [isDragActive, setIsDragActive] = useState(false);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setFiles(value);
    }
  }, [value]);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      
      const fileArray = Array.from(newFiles);
      let validFiles: File[];
      
      if (multiple) {
        // For multiple, add to existing but respect maxFiles
        const combined = [...files, ...fileArray];
        validFiles = combined.slice(0, maxFiles);
      } else {
        // For single, replace
        validFiles = fileArray.slice(0, 1);
      }
      
      setFiles(validFiles);
      onFilesChange(validFiles);
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    
    if (accept) {
      const acceptStr = Object.entries(accept)
        .flatMap(([mime, exts]) => [mime, ...exts])
        .join(',');
      input.accept = acceptStr;
    }
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFiles(target.files);
    };
    
    input.click();
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesChange([]);
  };

  const IconComponent = icon === 'pdf' ? FileText : icon === 'image' ? Image : Upload;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
          'bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50',
          'hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20',
          'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none',
          isDragActive
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 scale-[1.02]'
            : 'border-slate-300 dark:border-white/10'
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
            isDragActive
              ? 'bg-violet-100 dark:bg-violet-800 scale-110'
              : 'bg-slate-100 dark:bg-white/5'
          )}>
            <IconComponent className={cn(
              'w-7 h-7 transition-colors',
              isDragActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-white/50'
            )} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-white/80">{label}</p>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
              {multiple ? `Up to ${maxFiles} files` : 'Single file only'}
            </p>
          </div>
        </div>
      </div>
      
      <div aria-live="polite" className="sr-only">
        {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : ''}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-white/60">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
              aria-label="Clear all files"
            >
              Clear all
            </button>
          </div>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-700 dark:text-white/80 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-white/60">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
