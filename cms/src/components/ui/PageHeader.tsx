'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: string;
  className?: string;
}

export function PageHeader({ title, description, action, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div>
        {breadcrumb && (
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-[22px] font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-[14px] text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
