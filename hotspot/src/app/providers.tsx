'use client'

import type { ReactNode } from 'react'

/** Analytics wrapper removed; pass-through only. */
export function PostHogProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
