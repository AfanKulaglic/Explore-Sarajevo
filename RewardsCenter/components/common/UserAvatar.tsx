'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getAvatarSrc, avatarRequiresNativeImg } from '@/lib/avatar-url'
import { generateAvatar, defaultAvatarConfig } from '@/lib/avatar'

interface UserAvatarProps {
  src?: string | null
  name?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
}

export function UserAvatar({
  src,
  name = 'User',
  className = '',
  fill = false,
  width = 40,
  height = 40,
  sizes = '96px',
}: UserAvatarProps) {
  const generatedSrc = useMemo(
    () =>
      generateAvatar({
        ...defaultAvatarConfig,
        style: 'adventurer',
        seed: name,
      }),
    [name]
  )

  const storedSrc = useMemo(() => getAvatarSrc(src), [src])
  const [imgSrc, setImgSrc] = useState(() => storedSrc || generatedSrc)

  useEffect(() => {
    setImgSrc(storedSrc || generatedSrc)
  }, [storedSrc, generatedSrc])

  const handleError = () => {
    if (imgSrc !== generatedSrc) setImgSrc(generatedSrc)
  }

  if (avatarRequiresNativeImg(imgSrc)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={name}
          className={cn('absolute inset-0 h-full w-full object-cover', className)}
          onError={handleError}
        />
      )
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={name}
        width={width}
        height={height}
        className={className}
        onError={handleError}
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={name}
        fill
        sizes={sizes}
        className={className}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={name}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
}
