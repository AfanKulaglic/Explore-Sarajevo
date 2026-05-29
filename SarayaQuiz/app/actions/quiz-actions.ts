'use server'

import { requireAdmin } from '@/lib/auth'
import { validateQuizForPublish, generateUniqueSlug } from '@/lib/quiz-utils'
import { getChoiceOrder, getQuestionOrder, normalizeQuiz } from '@/lib/quiz-schema'
import { revalidatePath } from 'next/cache'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function createQuiz(title: string) {
  const session = await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  // Generate a unique ID (cuid-like)
  const { nanoid } = await import('nanoid')
  const quizId = 'c' + nanoid(24)
  
  const { data: quiz, error } = await supabase
    .from('posts')
    .insert({
      id: quizId,
      title,
      author_id: session.user.id,
      author_email: session.user.email || undefined,
      theme: {},
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating quiz:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  return { success: true, quizId: quiz.id }
}

export async function updateQuizMeta(
  quizId: string,
  data: { 
    title?: string
    description?: string
    theme?: any
    icon?: string
    gradient?: string
    // Reward settings
    reward_coins?: number
    reward_xp?: number
    reward_tokens?: number
    first_time_multiplier?: number
    full_marks_multiplier?: number
    max_reward_attempts?: number
    allow_anonymous?: boolean
    requires_account?: boolean
    max_attempts_per_device?: number | null
    cooldown_minutes?: number | null
  }
) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  // If title is changing and quiz is published, regenerate slug
  let newSlug: string | undefined
  if (data.title) {
    const { data: currentQuiz } = await supabase
      .from('posts')
      .select('published_at, slug')
      .eq('id', quizId)
      .single()
    
    if (currentQuiz?.published_at) {
      newSlug = await generateUniqueSlug(data.title, quizId)
    }
  }
  
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  // Only include fields that are provided
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.theme !== undefined) updateData.theme = data.theme
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.gradient !== undefined) updateData.gradient = data.gradient
  
  // Reward settings
  if (data.reward_coins !== undefined) updateData.reward_coins = data.reward_coins
  if (data.reward_xp !== undefined) updateData.reward_xp = data.reward_xp
  if (data.reward_tokens !== undefined) updateData.reward_tokens = data.reward_tokens
  if (data.first_time_multiplier !== undefined) updateData.first_time_multiplier = data.first_time_multiplier
  if (data.full_marks_multiplier !== undefined) updateData.full_marks_multiplier = data.full_marks_multiplier
  if (data.max_reward_attempts !== undefined) updateData.max_reward_attempts = data.max_reward_attempts
  if (data.allow_anonymous !== undefined) updateData.allow_anonymous = data.allow_anonymous
  if (data.requires_account !== undefined) updateData.requires_account = data.requires_account
  if (data.max_attempts_per_device !== undefined) updateData.max_attempts_per_device = data.max_attempts_per_device
  if (data.cooldown_minutes !== undefined) updateData.cooldown_minutes = data.cooldown_minutes
  
  if (newSlug) {
    updateData.slug = newSlug
  }
  
  const { error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', quizId)
  
  if (error) {
    console.error('Error updating quiz:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  revalidatePath(`/admin/quizzes/${quizId}/edit`)
  revalidatePath('/')
  return { success: true }
}

export async function deleteQuiz(quizId: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', quizId)
  
  if (error) {
    console.error('Error deleting quiz:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function toggleQuizActive(quizId: string, is_active: boolean) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ is_active })
    .eq('id', quizId)
  
  if (error) {
    console.error('Error toggling active status:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function publishQuiz(quizId: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  // Fetch quiz with questions and choices
  const { data: quiz, error: quizError } = await supabase
    .from('posts')
    .select(`
      *,
      questions:questions(
        *,
        choices:choices(*)
      )
    `)
    .eq('id', quizId)
    .single()
  
  if (quizError || !quiz) {
    return { success: false, error: 'Quiz not found' }
  }

  const normalizedQuiz = normalizeQuiz(quiz)
  const errors = validateQuizForPublish(normalizedQuiz as any)
  if (errors.length > 0) {
    return { success: false, errors }
  }
  
  const slug = await generateUniqueSlug(quiz.title)
  
  const { error } = await supabase
    .from('posts')
    .update({
      slug,
      published_at: new Date().toISOString(),
      is_active: true,
    })
    .eq('id', quizId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  revalidatePath(`/admin/quizzes/${quizId}/edit`)
  revalidatePath('/')
  return { success: true, slug }
}

export async function unpublishQuiz(quizId: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ published_at: null, is_active: false })
    .eq('id', quizId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  revalidatePath(`/admin/quizzes/${quizId}/edit`)
  revalidatePath('/')
  return { success: true }
}

export async function addQuestion(quizId: string, text: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  // Get max order
  const { data: questions } = await supabase
    .from('questions')
    .select('question_order')
    .eq('quiz_post_id', quizId)
    .order('question_order', { ascending: false })
    .limit(1)
  
  const maxOrder =
    questions && questions.length > 0 ? getQuestionOrder(questions[0] as any) : -1
  
  // Generate a unique ID
  const { nanoid } = await import('nanoid')
  const question_id = 'q' + nanoid(24)
  
  const { data: question, error } = await supabase
    .from('questions')
    .insert({
      id: question_id,
      quiz_post_id: quizId,
      text,
      question_order: maxOrder + 1,
      type: 'MULTIPLE_CHOICE',
      points: 1,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${quizId}/edit`)
  return { success: true, question_id: question.id }
}

export async function updateQuestion(
  question_id: string,
  data: { text?: string; points?: number }
) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { data: question, error } = await supabase
    .from('questions')
    .update({
      text: data.text,
      points: data.points,
      updated_at: new Date().toISOString(),
    })
    .eq('id', question_id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${question.quiz_post_id}/edit`)
  return { success: true }
}

export async function deleteQuestion(question_id: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { data: question } = await supabase
    .from('questions')
    .select('quiz_post_id')
    .eq('id', question_id)
    .single()
  
  if (!question) {
    return { success: false, error: 'Question not found' }
  }
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', question_id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${question.quiz_post_id}/edit`)
  return { success: true }
}

export async function reorderQuestions(quizId: string, question_ids: string[]) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  for (let i = 0; i < question_ids.length; i++) {
    await supabase
      .from('questions')
      .update({ question_order: i })
      .eq('id', question_ids[i])
  }
  
  revalidatePath(`/admin/quizzes/${quizId}/edit`)
  return { success: true }
}

export async function addChoice(question_id: string, text: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { data: question } = await supabase
    .from('questions')
    .select('*, choices:choices(*)')
    .eq('id', question_id)
    .single()
  
  if (!question) {
    return { success: false, error: 'Question not found' }
  }
  
  // Enforce max 6 choices
  if (question.choices && question.choices.length >= 6) {
    return { success: false, error: 'Maximum 6 choices allowed' }
  }
  
  const maxOrder = question.choices && question.choices.length > 0
    ? Math.max(...question.choices.map((c: any) => getChoiceOrder(c)))
    : -1
  
  // Generate a unique ID
  const { nanoid } = await import('nanoid')
  const choice_id = 'ch' + nanoid(24)
  
  const { data: choice, error } = await supabase
    .from('choices')
    .insert({
      id: choice_id,
      question_id,
      text,
      choice_order: maxOrder + 1,
      is_correct: false,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${question.quiz_post_id}/edit`)
  return { success: true, choice_id: choice.id }
}

export async function updateChoice(
  choice_id: string,
  data: { text?: string; is_correct?: boolean }
) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { data: choice } = await supabase
    .from('choices')
    .select('*, question:questions!inner(*)')
    .eq('id', choice_id)
    .single()
  
  if (!choice) {
    return { success: false, error: 'Choice not found' }
  }
  
  // If marking as correct, unmark all other choices for this question
  if (data.is_correct === true) {
    await supabase
      .from('choices')
      .update({ is_correct: false })
      .eq('question_id', choice.question_id)
  }
  
  const { error } = await supabase
    .from('choices')
    .update({
      text: data.text,
      is_correct: data.is_correct,
      updated_at: new Date().toISOString(),
    })
    .eq('id', choice_id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${choice.question.quiz_post_id}/edit`)
  return { success: true }
}

export async function deleteChoice(choice_id: string) {
  await requireAdmin()
  const supabase = createSupabaseServiceClient()
  
  const { data: choice } = await supabase
    .from('choices')
    .select('*, question:questions!inner(*)')
    .eq('id', choice_id)
    .single()
  
  if (!choice) {
    return { success: false, error: 'Choice not found' }
  }
  
  const { error } = await supabase
    .from('choices')
    .delete()
    .eq('id', choice_id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${choice.question.quiz_post_id}/edit`)
  return { success: true }
}
