'use client'

import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Type-safe icon lookup
const IconsMap = Icons as unknown as Record<string, LucideIcon>

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  icon?: string
  action?: {
    label: string
    href: string
  }
  className?: string
  align?: 'left' | 'center'
}

/**
 * SectionHeader Component
 * 
 * Consistent section header with optional badge, icon, and action link.
 * Supports left and center alignment.
 */
export function SectionHeader({
  badge,
  title,
  subtitle,
  icon,
  action,
  className,
  align = 'left'
}: SectionHeaderProps) {
  const IconComponent = icon ? IconsMap[icon] : null

  return (
    <div className={cn(
      'mb-6 sm:mb-8',
      align === 'center' && 'text-center',
      className
    )}>
      {/* Badge */}
      {badge && (
        <span className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 mb-3 sm:mb-4',
          'text-[10px] sm:text-xs font-semibold uppercase tracking-wider',
          'text-primary-400 bg-primary-500/10 rounded-full border border-primary-500/20'
        )}>
          {IconComponent && <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          {badge}
        </span>
      )}
      
      {/* Title and Action Row */}
      <div className={cn(
        'flex gap-4',
        align === 'center' ? 'flex-col items-center' : 'items-end justify-between'
      )}>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-1.5 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-white/50 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Action Link */}
        {action && (
          <a
            href={action.href}
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap group"
          >
            {action.label}
            <Icons.ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  )
}
