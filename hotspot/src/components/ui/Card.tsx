'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass'
  hover?: boolean
}

/**
 * Card Component
 * 
 * Versatile card container with multiple visual variants.
 * Supports hover effects for interactive cards.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-2xl overflow-hidden transition-all duration-300 ease-out',
          
          // Variant styles
          {
            'bg-surface-card border border-surface-border/60': 
              variant === 'default',
            'bg-surface-elevated border border-surface-border/60 shadow-lg shadow-black/10': 
              variant === 'elevated',
            'glass': 
              variant === 'glass',
          },
          
          // Hover effects
          hover && [
            'cursor-pointer',
            'hover:border-primary-500/40',
            'hover:shadow-xl hover:shadow-primary-500/5',
            'hover:-translate-y-0.5',
          ],
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
