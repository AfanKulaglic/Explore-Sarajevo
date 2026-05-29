'use client'

import { useMemo } from 'react'
import { User } from 'lucide-react'
import { generateAvatar, defaultAvatarConfig, AvatarConfig } from '@/lib/avatar'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  onClick?: () => void
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
}

const iconSizeMap = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
}

export function Avatar({ src, name, size = 'md', className = '', onClick }: AvatarProps) {
  // Generate a fallback avatar based on name
  const fallbackAvatar = useMemo(() => {
    if (src) return null
    
    const config: AvatarConfig = {
      ...defaultAvatarConfig,
      seed: name || 'default',
      style: 'adventurer',
    }
    return generateAvatar(config)
  }, [name, src])

  const sizeClass = sizeMap[size]
  const iconSize = iconSizeMap[size]

  // Check if it's a data URI (avatar created with our system)
  const isDataUri = src?.startsWith('data:')
  // Check if it's a valid URL
  const isValidUrl = src?.startsWith('http') || src?.startsWith('/')

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`relative rounded-full overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0 ${sizeClass} ${className} ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-brand-500/50 transition-all' : ''}`}
    >
      {(src && (isDataUri || isValidUrl)) ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, show fallback
            const target = e.target as HTMLImageElement
            if (fallbackAvatar) {
              target.src = fallbackAvatar
            } else {
              target.style.display = 'none'
              target.parentElement?.classList.add('show-fallback')
            }
          }}
        />
      ) : fallbackAvatar ? (
        <img
          src={fallbackAvatar}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <User size={iconSize} className="text-white/40" />
      )}
    </Component>
  )
}

// Avatar with edit badge
interface AvatarEditableProps extends AvatarProps {
  onEdit?: () => void
}

export function AvatarEditable({ onEdit, ...props }: AvatarEditableProps) {
  return (
    <div className="relative inline-block">
      <Avatar {...props} />
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-600 border-2 border-slate-900 flex items-center justify-center hover:bg-brand-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3 h-3 text-white"
          >
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Avatar group for showing multiple users
interface AvatarGroupProps {
  users: Array<{ id: string; name?: string; avatarUrl?: string | null }>
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <Avatar
          key={user.id}
          src={user.avatarUrl}
          name={user.name}
          size={size}
          className="ring-2 ring-slate-900"
        />
      ))}
      {remaining > 0 && (
        <div className={`${sizeMap[size]} rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white ring-2 ring-slate-900`}>
          +{remaining}
        </div>
      )}
    </div>
  )
}

export default Avatar
