'use client'

import { Bot, Send, X, Sparkles } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { FormattedChatMessage } from '@/components/CompanyChat/FormattedChatMessage'
import { SARAYA_OPEN_COMPANY_CHAT } from '@/lib/chat/openCompanyChat'

type Role = 'user' | 'assistant'
type Msg = { role: Role; content: string }

export function CompanyChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(SARAYA_OPEN_COMPANY_CHAT, onOpen)
    return () => window.removeEventListener(SARAYA_OPEN_COMPANY_CHAT, onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, loading])

  // Auto-focus textarea when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [open])

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
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      })
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string }

      if (!res.ok) { setError(data.error || 'Request failed.'); return }
      if (!data.reply) { setError('Empty response.'); return }
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  return (
    <>
      {/* ── FAB button ── */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed right-4 z-[90] flex flex-col items-end gap-2"
            style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            {/* Label tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md"
              style={{
                background: 'rgba(124,58,237,0.25)',
                border: '1px solid rgba(124,58,237,0.35)',
              }}
            >
              <Sparkles className="w-3 h-3 text-[#a78bfa]" />
              AI chat
            </motion.div>

            {/* FAB */}
            <div className="relative">
              {/* Pulsing ring */}
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(124,58,237,0.35)' }}
                aria-hidden
              />
              {/* Second slower ring */}
              <span
                className="absolute -inset-1.5 rounded-full opacity-20 animate-pulse"
                style={{ background: 'rgba(124,58,237,0.4)' }}
                aria-hidden
              />

              <button
                type="button"
                aria-label="Open company chat"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-transparent"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                  boxShadow: '0 0 24px rgba(124,58,237,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <Bot className="h-6 w-6" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close chat overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[89] backdrop-blur-sm"
              style={{ background: 'rgba(9,9,15,0.7)' }}
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed z-[91] flex flex-col overflow-hidden"
              style={{
                bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
                right: '1rem',
                width: 'min(calc(100vw - 2rem), 26rem)',
                maxHeight: 'min(calc(100dvh - 2rem), 38rem)',
                background: 'var(--bg-surface)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '1.25rem',
                boxShadow: '0 0 40px rgba(124,58,237,0.2), 0 24px 48px rgba(0,0,0,0.6)',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Company chat"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex shrink-0 items-center justify-between px-4 py-3"
                style={{
                  borderBottom: '1px solid rgba(124,58,237,0.2)',
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(15,15,26,0.95) 100%)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                  >
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">Saraya AI</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] text-[#a0a0b8] font-medium">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#a0a0b8] transition-all hover:text-white hover:scale-110"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={listRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4 space-y-3"
                style={{ WebkitOverflowScrolling: 'touch', background: 'var(--bg-base)' }}
              >
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center justify-center h-full py-8 text-center gap-3"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
                    >
                      <Sparkles className="w-6 h-6 text-[#a78bfa]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">Saraya AI Assistant</p>
                      <p className="text-[#5a5a72] text-xs leading-relaxed max-w-[220px]">
                        Ask about Saraya Solutions, our products, or how to reach us.
                      </p>
                    </div>
                    {/* Quick prompts */}
                    <div className="flex flex-col gap-1.5 w-full mt-2">
                      {[
                        'What is Saraya Solutions?',
                        'How can I contact you?',
                        'What products do you offer?',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                          className="text-left text-xs px-3 py-2 rounded-xl text-[#a0a0b8] hover:text-white transition-all"
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                    >
                      {m.role === 'assistant' && (
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mr-2 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                        >
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div
                        className="max-w-[82%] rounded-2xl px-3 py-2.5 text-[0.8125rem] leading-relaxed"
                        style={m.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                              color: 'white',
                              borderBottomRightRadius: '4px',
                            }
                          : {
                              background: 'var(--bg-raised)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)',
                              borderBottomLeftRadius: '4px',
                            }
                        }
                      >
                        {m.role === 'assistant'
                          ? <FormattedChatMessage text={m.content} />
                          : <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        }
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                    >
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div
                      className="flex items-center gap-1 px-3 py-2.5 rounded-2xl"
                      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderBottomLeftRadius: '4px' }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  className="shrink-0 px-4 py-2 text-xs text-red-400"
                  style={{ borderTop: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)' }}
                >
                  {error}
                </div>
              )}

              {/* Input */}
              <div
                className="flex shrink-0 items-end gap-2 p-3"
                style={{ borderTop: '1px solid rgba(124,58,237,0.15)', background: 'var(--bg-surface)' }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-all"
                  style={{
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border)',
                    minHeight: '2.5rem',
                    maxHeight: '6rem',
                    lineHeight: '1.5',
                  }}
                  placeholder="Message Saraya AI…"
                  value={input}
                  disabled={loading}
                  onChange={(e) => {
                    setInput(e.target.value)
                    // Auto-resize
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.6)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void send()
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  onClick={() => void send()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                    boxShadow: input.trim() ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                  }}
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
