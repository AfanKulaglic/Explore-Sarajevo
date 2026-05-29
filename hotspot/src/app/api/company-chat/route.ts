import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

import { loadCompanyKnowledge } from '@/lib/companyKnowledge/loadCompanyKnowledge'
import { getCachedWebKnowledgeDigest } from '@/lib/companyKnowledge/fetchWebKnowledge'

export const runtime = 'nodejs'

const RATE_WINDOW_MS = 60_000
const RATE_MAX = 20
const MAX_MESSAGES = 20
const MAX_MESSAGE_CHARS = 8000

type ChatRole = 'user' | 'assistant'

type IncomingMessage = { role: ChatRole; content: string }

const rateBucket = new Map<string, { count: number; resetAt: number }>()

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || 'unknown'
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

function allowRate(ip: string): boolean {
  const now = Date.now()
  const row = rateBucket.get(ip)
  if (!row || now > row.resetAt) {
    rateBucket.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (row.count >= RATE_MAX) return false
  row.count += 1
  return true
}

function sanitizeContent(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, MAX_MESSAGE_CHARS)
}

function parseMessages(body: unknown): IncomingMessage[] | null {
  if (!body || typeof body !== 'object') return null
  const msgs = (body as { messages?: unknown }).messages
  if (!Array.isArray(msgs) || msgs.length === 0) return null

  const out: IncomingMessage[] = []
  for (const m of msgs.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') continue
    const role = (m as { role?: unknown }).role
    const content = (m as { content?: unknown }).content
    if (role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string') continue
    const c = sanitizeContent(content)
    if (!c) continue
    out.push({ role, content: c })
  }
  return out.length ? out : null
}

const CANONICAL_CONTACT = `Official contact (for "how to reach you", email, or address questions use EXACTLY this; if anything elsewhere in the document disagrees, prefer this block):
- General: info@sarayasolutions.com
- Marketing: marketing@sarayasolutions.com
- Address: Terezija bb, Sarajevo 71000, Bosnia and Herzegovina`

const AI_SCOPE = `AI & products: Saraya works with AI across its offerings as described on sarayasolutions.com and in the company knowledge — e.g. AI chatbots, AI avatars, interactive displays, NLP/automation, and related digital experiences. If asked whether Saraya has AI products or works with AI, answer yes at a high level and cite concrete examples from the knowledge when you can. Do not claim there is "no information" about AI unless the knowledge truly contains nothing relevant.`

const LANGUAGE_RULES = `Language policy (strict):
- Saraya is a Bosnian company. For the **South Slavic / “Balkan” cluster that is mutually close to Bosnian** — including **Croatian, Serbian, Montenegrin**, or mixed regional wording — you must **always answer in standard Bosnian**, not Croatian, Serbian, or Montenegrin as separate norms.
- Use **ijekavian** forms typical of Bosnian (e.g. **“dio”** not **“deo”**, **“ljepota”** not **“lepota”**, **“vjerovati”** not **“verovati”**, **“djeca”** not **“deca”** where applicable). Prefer vocabulary and spelling consistent with Bosnian usage in Bosnia and Herzegovina.
- If the user writes in **English**, reply in **English**. If they write in **any other non–South-Slavic language** (e.g. Romanian, German, Turkish), reply in **that same language** so they can understand.
- Never switch to Croatian, Serbian, or Montenegrin norms when the user’s message could be any of those; **default to Bosnian (ijekavian)** for that whole family.`

function buildSystemPrompt(knowledgeText: string, knowledgeEmpty: boolean): string {
  const base = `You are Saraya Solutions' website assistant.

Rules:
- Only help with questions about Saraya Solutions, this website, its products/services, policies, and contact information.
- If the question is unrelated (general knowledge, coding homework, other companies, politics, medical/legal advice, etc.), reply briefly that you only answer company-related questions and offer to help with Saraya instead.
- Use the "Company knowledge" section below when it is relevant (including any live website excerpts, which are plain text extracted from HTML and may be incomplete for JavaScript-heavy pages). If the answer is not in that knowledge, say clearly that you do not have that information in the company materials — do not invent facts.
- Be concise, professional, and friendly. Prefer short paragraphs or bullet points when listing items.

${LANGUAGE_RULES}`

  if (knowledgeEmpty) {
    return `${base}

Company knowledge: (no document text is loaded on the server — tell the user politely that the knowledge base is not configured and suggest using the Contact page for specific questions.)

${CANONICAL_CONTACT}

${AI_SCOPE}`
  }

  return `${base}

Company knowledge:
---
${knowledgeText}
---

${CANONICAL_CONTACT}

${AI_SCOPE}`
}

export async function POST(req: NextRequest): Promise<Response> {
  const ip = clientIp(req)
  if (!allowRate(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: 'Chat is not configured.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const messages = parseMessages(body)
  if (!messages) {
    return NextResponse.json(
      { error: 'Provide a non-empty "messages" array with { role, content } objects.' },
      { status: 400 },
    )
  }

  const last = messages[messages.length - 1]
  if (last.role !== 'user') {
    return NextResponse.json({ error: 'Last message must be from the user.' }, { status: 400 })
  }

  try {
    const { text: fileKnowledge } = await loadCompanyKnowledge()
    let webDigest = ''
    if (process.env.CHATBOT_WEB_FETCH === '1') {
      try {
        webDigest = await getCachedWebKnowledgeDigest()
      } catch (e) {
        console.warn('[api/company-chat] web digest failed', e)
      }
    }
    const knowledgeText = [
      fileKnowledge.trim(),
      webDigest.trim()
        ? `---\nLive website excerpts (HTML → text; may be partial for JS-only pages):\n${webDigest.trim()}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n')
    const knowledgeEmpty = !knowledgeText.trim()
    const system = buildSystemPrompt(knowledgeText, knowledgeEmpty)

    const openai = new OpenAI({ apiKey })
    const model = process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini'

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.4,
      max_tokens: 800,
    })

    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json({ error: 'No reply from assistant.' }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (e) {
    console.error('[api/company-chat]', e)
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 })
  }
}
