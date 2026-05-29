'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, showCharCount, maxLength, id, value, ...props }, ref) => {
    const textareaId = id || props.name;
    const charCount = typeof value === 'string' ? value.length : 0;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-[13px] font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full px-3.5 py-2.5 border rounded-lg text-[14px] text-slate-900 min-h-[100px] resize-y',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            'hover:border-slate-300',
            'placeholder:text-slate-400',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-200 bg-white',
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p className="text-[12px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-[12px] text-slate-500">{helperText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className={cn(
              'text-[11px]',
              charCount > maxLength * 0.9 ? 'text-amber-600' : 'text-slate-400'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
