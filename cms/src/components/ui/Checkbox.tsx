'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const checkboxId = id || props.name;
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded',
              className
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="ml-2 block text-[13px] text-slate-700">
              {label}
            </label>
          )}
          {error && (
            <p className="ml-2 text-[12px] text-red-600">{error}</p>
          )}
        </div>
        {hint && (
          <p className="mt-1 ml-6 text-[11px] text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
