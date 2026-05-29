'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'new' | 'hot' | 'top'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full',
        {
          'bg-surface-elevated text-white/80': variant === 'default',
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white': variant === 'new',
          'bg-gradient-to-r from-orange-500 to-red-500 text-white': variant === 'hot',
          'bg-gradient-to-r from-primary-500 to-primary-600 text-white': variant === 'top',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
