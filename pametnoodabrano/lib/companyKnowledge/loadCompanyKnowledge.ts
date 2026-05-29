import { readFile } from 'fs/promises'
import path from 'path'

/** Max characters injected into the system prompt (~12k tokens upper safety). */
const KNOWLEDGE_CHAR_CAP = 48_000

let cached: { text: string; source: string } | null = null

/**
 * Loads company knowledge for the chatbot.
 * Resolution order:
 * 1. `public/docs/company-knowledge.pdf` — extracted text (server-only).
 * 2. `src/data/company-knowledge.txt` — default bundled knowledge.
 */
export async function loadCompanyKnowledge(): Promise<{ text: string; source: string }> {
  if (cached) return cached

  const root = process.cwd()

  const pdfPath = path.join(root, 'public', 'docs', 'company-knowledge.pdf')
  try {
    const buf = await readFile(pdfPath)
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: new Uint8Array(buf) })
    try {
      const result = await parser.getText()
      const text = result.text?.trim() ?? ''
      cached = { text: clamp(text), source: pdfPath }
      return cached
    } finally {
      await parser.destroy()
    }
  } catch {
    // no PDF or parse failed
  }

  const defaultTxt = path.join(root, 'src', 'data', 'company-knowledge.txt')
  try {
    const text = await readFile(defaultTxt, 'utf-8')
    cached = { text: clamp(text), source: defaultTxt }
    return cached
  } catch {
    cached = { text: '', source: 'none' }
    return cached
  }
}

function clamp(text: string): string {
  const t = text.trim()
  if (t.length <= KNOWLEDGE_CHAR_CAP) return t
  return `${t.slice(0, KNOWLEDGE_CHAR_CAP)}\n\n[…truncated for model context limit…]`
}
