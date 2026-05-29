/**
 * SarayaQuiz DB shape (schema: sarayaquiz).
 * Migrated: no posts.status — use published_at; order columns renamed.
 */

export type QuizPostRow = {
  id: string
  title: string
  description?: string | null
  slug?: string | null
  published_at?: string | null
  is_active?: boolean | null
  icon?: string | null
  gradient?: string | null
  theme?: unknown
  author_id?: string
  author_email?: string | null
  created_at?: string
  updated_at?: string
  /** @deprecated removed from DB — derived from published_at */
  status?: string
  questions?: QuestionRow[]
  [key: string]: unknown
}

export type QuestionRow = {
  id: string
  quiz_post_id: string
  text: string
  type?: string
  points?: number
  question_order?: number
  /** @deprecated use question_order */
  order?: number
  choices?: ChoiceRow[]
  [key: string]: unknown
}

export type ChoiceRow = {
  id: string
  question_id: string
  text: string
  is_correct?: boolean
  choice_order?: number
  /** @deprecated use choice_order */
  order?: number
  [key: string]: unknown
}

export function getQuizStatus(
  post: Record<string, unknown> | null | undefined
): 'PUBLISHED' | 'DRAFT' {
  return post?.published_at ? 'PUBLISHED' : 'DRAFT'
}

export function isQuizPublished(
  post: Record<string, unknown> | null | undefined
): boolean {
  return Boolean(post?.published_at)
}

export function isQuizLive(
  post: Record<string, unknown> | null | undefined
): boolean {
  if (!post) return false
  return Boolean(post.published_at) && post.is_active !== false
}

export function getQuestionOrder(q: QuestionRow): number {
  return q.question_order ?? q.order ?? 0
}

export function getChoiceOrder(c: ChoiceRow): number {
  return c.choice_order ?? c.order ?? 0
}

export function normalizeChoice(c: ChoiceRow): ChoiceRow & { order: number } {
  const order = getChoiceOrder(c)
  return { ...c, order, choice_order: c.choice_order ?? order }
}

export function normalizeQuestion(q: QuestionRow): QuestionRow & { order: number; choices: ReturnType<typeof normalizeChoice>[] } {
  const order = getQuestionOrder(q)
  const choices = (q.choices || []).map(normalizeChoice).sort((a, b) => a.order - b.order)
  return { ...q, order, question_order: q.question_order ?? order, choices }
}

export function normalizeQuiz<T extends QuizPostRow>(quiz: T): T & { status: 'PUBLISHED' | 'DRAFT'; questions: ReturnType<typeof normalizeQuestion>[] } {
  const questions = (quiz.questions || [])
    .map(normalizeQuestion)
    .sort((a, b) => a.order - b.order)
  return {
    ...quiz,
    status: getQuizStatus(quiz),
    questions,
  }
}
