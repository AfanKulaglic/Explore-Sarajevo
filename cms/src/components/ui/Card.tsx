'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: 'default' | 'ghost' | 'elevated';
}

const Card: React.FC<CardProps> = ({ children, className, padding = 'md', hover = false, variant = 'default' }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };

  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    ghost: 'bg-transparent border-0',
    elevated: 'bg-white border border-slate-100 shadow-lg shadow-slate-200/50'
  };
  
  return (
    <div className={cn(
      'rounded-[var(--radius-lg)]',
      variants[variant],
      hover && 'hover:shadow-md hover:shadow-slate-200/60 transition-shadow duration-200 cursor-pointer',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, description, action, icon, className }) => {
  return (
    <div className={cn('flex items-start justify-between mb-5', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export { Card, CardHeader };
