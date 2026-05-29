import { createSupabaseServiceClient } from '@/lib/supabase'

export type QuizWithQuestions = any

export interface QuizValidationError {
  field: string
  message: string
}

export function validateQuizForPublish(
  quiz: QuizWithQuestions
): QuizValidationError[] {
  const errors: QuizValidationError[] = []

  // Title is required
  if (!quiz.title || quiz.title.trim() === '') {
    errors.push({ field: 'title', message: 'Title is required' })
  }

  // Must have at least one question
  if (quiz.questions.length === 0) {
    errors.push({ field: 'questions', message: 'Quiz must have at least one question' })
  }

  // Validate each question
  quiz.questions.forEach((question: any, qIndex: number) => {
    // Each question must have between 2 and 6 choices (CAP = 6)
    if (question.choices.length < 2) {
      errors.push({
        field: `question-${qIndex}`,
        message: `Question ${qIndex + 1} must have at least 2 choices`,
      })
    }
    
    if (question.choices.length > 6) {
      errors.push({
        field: `question-${qIndex}`,
        message: `Question ${qIndex + 1} cannot have more than 6 choices (CAP = 6)`,
      })
    }

    // Each question must have exactly 1 correct choice
    const correctChoices = question.choices.filter((c: any) => c.is_correct)
    if (correctChoices.length !== 1) {
      errors.push({
        field: `question-${qIndex}`,
        message: `Question ${qIndex + 1} must have exactly 1 correct choice`,
      })
    }

    // Question text is required
    if (!question.text || question.text.trim() === '') {
      errors.push({
        field: `question-${qIndex}`,
        message: `Question ${qIndex + 1} text is required`,
      })
    }

    // Each choice must have text
    question.choices.forEach((choice: any, cIndex: number) => {
      if (!choice.text || choice.text.trim() === '') {
        errors.push({
          field: `question-${qIndex}-choice-${cIndex}`,
          message: `Question ${qIndex + 1}, Choice ${cIndex + 1} text is required`,
        })
      }
    })
  })

  return errors
}

export async function generateUniqueSlug(title: string, excludeQuizId?: string): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)

  let slug = base
  let counter = 1

  const supabase = createSupabaseServiceClient()

  // Check if slug exists (excluding current quiz if provided)
  let query = supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
  
  if (excludeQuizId) {
    query = query.neq('id', excludeQuizId)
  }
  
  let { data: existing } = await query.single()

  while (existing) {
    slug = `${base}-${counter}`
    counter++
    
    let checkQuery = supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
    
    if (excludeQuizId) {
      checkQuery = checkQuery.neq('id', excludeQuizId)
    }
    
    const result = await checkQuery.single()
    existing = result.data
  }

  return slug
}

export function calculateScore(
  questions: any[],
  answers: { question_id: string; choice_id: string | null }[]
): { score: number; max_score: number } {
  let score = 0
  let max_score = 0

  questions.forEach((question: any) => {
    max_score += question.points || 1

    const answer = answers.find((a: any) => a.question_id === question.id)
    if (!answer?.choice_id) return

    const selectedChoice = question.choices.find((c: any) => c.id === answer.choice_id)
    if (selectedChoice?.is_correct) {
      score += question.points || 1
    }
  })

  return { score, max_score }
}
