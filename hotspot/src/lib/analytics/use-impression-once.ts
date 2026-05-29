'use client'

import { useEffect, useRef, type RefObject } from 'react'

export function useImpressionOnce(
  onVisible: () => void,
  options?: { threshold?: number; rootMargin?: string; resetKey?: string | number }
): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null)
  const done = useRef(false)
  const cb = useRef(onVisible)

  useEffect(() => {
    cb.current = onVisible
  }, [onVisible])

  useEffect(() => {
    done.current = false
  }, [options?.resetKey])

  useEffect(() => {
    const el = ref.current
    if (!el || done.current) return

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e?.isIntersecting) return
        if (e.intersectionRatio < (options?.threshold ?? 0.35)) return
        done.current = true
        cb.current()
        obs.disconnect()
      },
      { threshold: options?.threshold ?? 0.35, rootMargin: options?.rootMargin ?? '0px' }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [options?.threshold, options?.rootMargin, options?.resetKey])

  return ref
}
