'use client'

import { MessageCircle, Send, X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { FormattedChatMessage } from '@/components/CompanyChat/FormattedChatMessage'
import { SARAYA_OPEN_COMPANY_CHAT } from '@/lib/chat/openCompanyChat'
import { chatWinkEmojiFont } from '@/components/CompanyChat/chatEmojiFont'

type Role = 'user' | 'assistant'

type Msg = { role: Role; content: string }

/** Saraya Solutions company chat — same API and prompts as sarayasolutions.com */
export function CompanyChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(SARAYA_OPEN_COMPANY_CHAT, onOpen)
    return () => window.removeEventListener(SARAYA_OPEN_COMPANY_CHAT, onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, loading])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setError(null)
    setInput('')
    const next: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch('/api/company-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string }

      if (!res.ok) {
        setError(data.error || 'Request failed.')
        return
      }
      if (!data.reply) {
        setError('Empty response.')
        return
      }
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const fabWrap = [
    'fixed right-5 z-[90] flex flex-col items-end gap-1.5',
    'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
    open ? 'pointer-events-none opacity-0' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className={fabWrap}>
        <span
          className="max-w-[10rem] rounded-md bg-black/55 px-1.5 py-0.5 text-right text-[11px] font-medium leading-tight tracking-tight text-white backdrop-blur-[2px] sm:max-w-none sm:text-xs"
          aria-hidden
        >
          AI chat{' '}
          <span className={`${chatWinkEmojiFont.className} text-base sm:text-lg leading-none`} title="Wink">
            😉
          </span>
        </span>
        <button
          type="button"
          aria-label="Open company chat"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-lg transition-colors hover:bg-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          <MessageCircle className="h-7 w-7" aria-hidden />
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close chat overlay"
            className="fixed inset-0 z-[89] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed bottom-5 right-5 z-[91] flex max-h-[min(100dvh-1.5rem,36rem)] w-[min(100vw-1.5rem,24rem)] flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Company chat"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-950/95 px-3 py-2.5">
              <span className="text-sm font-semibold text-white">Saraya</span>
              <button
                type="button"
                aria-label="Close chat"
                className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={listRef}
              className="min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-y-contain bg-zinc-950/95 px-3 py-3"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {messages.length === 0 && (
                <p className="text-sm leading-relaxed text-zinc-400">
                  Pitajte o Saraya Solutions, proizvodima ili kako nas kontaktirati. / Ask about our company,
                  products, or how to reach us.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'ml-5 rounded-xl bg-violet-600/25 px-3 py-2.5 text-zinc-100 shadow-sm ring-1 ring-violet-500/25'
                      : 'mr-3 rounded-xl bg-zinc-800/95 px-3 py-2.5 text-zinc-100 shadow-sm ring-1 ring-zinc-600/50'
                  }
                >
                  {m.role === 'assistant' ? (
                    <FormattedChatMessage text={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-[0.8125rem] leading-relaxed">{m.content}</p>
                  )}
                </div>
              ))}
              {loading && (
                <div className="mr-3 rounded-xl bg-zinc-800/95 px-3 py-2.5 text-sm text-zinc-400 ring-1 ring-zinc-600/50">
                  …
                </div>
              )}
            </div>

            {error && (
              <p className="shrink-0 border-t border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <div className="flex shrink-0 gap-2 border-t border-zinc-700 bg-zinc-950 p-2.5">
              <textarea
                rows={2}
                className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-violet-500/30 focus:ring-2"
                placeholder="Poruka… / Message…"
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
              />
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl bg-[#7c3aed] text-white transition-colors hover:bg-[#8b5cf6] disabled:opacity-50"
                disabled={loading}
                aria-label="Send"
                onClick={() => void send()}
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
