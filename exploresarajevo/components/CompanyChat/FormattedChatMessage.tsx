'use client'

import React from 'react'

/**
 * Renders assistant text with basic formatting: **bold**, newlines, simple `- ` bullets.
 * Plain text only (no HTML injection from model).
 */
export function FormattedChatMessage({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-1.5 break-words text-[0.8125rem] leading-relaxed text-zinc-100">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-1" aria-hidden />

        if (trimmed.startsWith('- ')) {
          return (
            <p key={i} className="flex gap-2 pl-0.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" aria-hidden />
              <span className="min-w-0">
                <LineParts text={trimmed.slice(2)} />
              </span>
            </p>
          )
        }

        return (
          <p key={i} className="min-h-[1em]">
            <LineParts text={line} />
          </p>
        )
      })}
    </div>
  )
}

function LineParts({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={j} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={j}>{part}</span>
      })}
    </>
  )
}
