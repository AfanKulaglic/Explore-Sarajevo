'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
      icon: Info
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      icon: CheckCircle
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100',
      icon: AlertCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      icon: XCircle
    }
  };
  
  const style = styles[type];
  const Icon = style.icon;
  
  return (
    <div className={cn(
      'rounded-xl p-4 border',
      style.bg,
      style.border,
      className
    )}>
      <div className="flex gap-3">
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          style.iconBg
        )}>
          <Icon className={cn('h-4 w-4', style.text)} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <h3 className={cn('text-[13px] font-semibold', style.text)}>{title}</h3>
          )}
          <div className={cn('text-[13px]', style.text, title && 'mt-0.5')}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-lg p-1 hover:bg-white/50 transition-colors',
                style.text
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Alert };
