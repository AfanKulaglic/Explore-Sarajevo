/** Minimal shape for callers; PostHog is disabled (always null). */
export type PosthogClientLike = {
  capture: (event: string, props?: Record<string, unknown>) => void
}

/** PostHog client removed; analytics disabled. */
export function refreshPosthogViewportContext(): void {}

export function getPosthog(): PosthogClientLike | null {
  return null
}
