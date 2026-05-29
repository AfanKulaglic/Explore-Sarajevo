'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Button Component
 * 
 * Reusable button with multiple variants and sizes.
 * Features smooth transitions and focus states for accessibility.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold rounded-xl',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.98]',
          
          // Variant styles
          {
            // Primary - solid purple with glow
            'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:from-primary-500 hover:to-primary-400':
              variant === 'primary',
            
            // Secondary - subtle background
            'bg-surface-elevated/80 text-white border border-surface-border/60 hover:bg-surface-border hover:border-surface-border':
              variant === 'secondary',
            
            // Ghost - transparent
            'bg-transparent text-white/80 hover:bg-white/10 hover:text-white':
              variant === 'ghost',
            
            // Outline - bordered
            'border border-surface-border/60 bg-transparent text-white/80 hover:bg-primary-500/10 hover:border-primary-500/50 hover:text-primary-300':
              variant === 'outline',
          },
          
          // Size styles
          {
            'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
            'px-5 py-2.5 text-sm gap-2': size === 'md',
            'px-6 py-3 text-base gap-2.5': size === 'lg',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
