import { cn } from '@/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  unit?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, unit = '', value, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && <label className="text-sm font-medium text-slate-700 dark:text-white/80">{label}</label>}
            {showValue && (
              <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">
                {value}{unit}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            'w-full h-2 bg-slate-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer',
            'accent-violet-600',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-violet-600 [&::-webkit-slider-thumb]:to-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
