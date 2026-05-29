'use server'

import { calculateScore } from '@/lib/quiz-utils'
import { isQuizLive, normalizeQuiz } from '@/lib/quiz-schema'
import { hashDeviceId } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getOrCreateUserAccountId } from './user-actions'
import { updateDeviceRecord } from '@/lib/quiz-rewards'

export async function startQuiz(
  slug: string,
  player_name: string,
  deviceId: string,
  deviceMetadata?: { user_agent?: string; platform?: string; browser?: string; os?: string },
  guestEmail?: string | null
) {
  try {
    const supabase = createSupabaseServiceClient()
    
    const { data: quiz, error: quizError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .eq('is_active', true)
      .single()
    
    if (quizError || !quiz) {
      console.error('Quiz not found:', quizError)
      return { success: false, error: 'Quiz not found' }
    }
    
    // Get logged in user's email and account_id
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    
    let account_id: string | null = null
    let player_email: string | null = guestEmail || null
    
    if (user?.email) {
      player_email = user.email
      account_id = await getOrCreateUserAccountId(user.email, user.user_metadata?.name || player_name)
    } else if (guestEmail) {
      // For guests with email, create an account ID so their scores can be tracked
      account_id = await getOrCreateUserAccountId(guestEmail, player_name)
    }
    
    // Hash device ID for privacy
    const device_hash = hashDeviceId(deviceId)
    
    // Generate attempt ID
    const { nanoid } = await import('nanoid')
    const attempt_id = 'a' + nanoid(24)
    
    // Create attempt (score will be updated on submit)
    const { error: attemptError } = await supabase
      .from('attempts')
      .insert({
        id: attempt_id,
        quiz_post_id: quiz.id,
        device_hash,
        player_name,
        player_email,
        account_id,
        is_anonymous: !account_id,
        score: 0,
        max_score: 0,
        started_at: new Date().toISOString(),
        finished_at: null,
      })
    
    if (attemptError) {
      console.error('Attempt creation error:', attemptError)
      return { success: false, error: attemptError.message }
    }

    // Update or create device record with metadata
    try {
      await updateDeviceRecord(device_hash, account_id, deviceMetadata)
    } catch (e) {
      // Device tracking is non-critical, don't fail the quiz start
      console.error('Device record update failed:', e)
    }
    
    return {
      success: true,
      attempt_id,
    }
  } catch (error) {
    console.error('startQuiz error:', error)
    return { success: false, error: 'Failed to start quiz. Please try again.' }
  }
}

export async function submitQuiz(
  attempt_id: string,
  slug: string,
  answers: { question_id: string; choice_id: string | null }[],
  time_spent_seconds?: number
) {
  try {
    const supabase = createSupabaseServiceClient()
    
    const { data: quiz, error: quizError } = await supabase
      .from('posts')
      .select(`
        *,
        questions:questions(
          *,
          choices:choices(*)
        )
      `)
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .eq('is_active', true)
      .single()
    
    if (quizError || !quiz || !isQuizLive(quiz)) {
      console.error('Quiz not found:', quizError)
      return { success: false, error: 'Quiz not found' }
    }
    
    // Verify attempt exists and get account_id
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('id, account_id, quiz_post_id')
      .eq('id', attempt_id)
      .single()
    
    if (attemptError || !attempt) {
      console.error('Attempt not found:', attemptError)
      return { success: false, error: 'Attempt not found' }
    }
    
    const normalizedQuiz = normalizeQuiz(quiz)
    
    // Calculate score
    const { score, max_score } = calculateScore(normalizedQuiz.questions, answers)
    
    // Update attempt with score and finish time
    const { error: updateError } = await supabase
      .from('attempts')
      .update({
        score,
        max_score,
        finished_at: new Date().toISOString(),
        time_spent_seconds: time_spent_seconds || null,
        questions_answered: answers.length,
        correct_answers: score, // Assuming 1 point per correct answer
        completion_percentage: max_score > 0 ? (score / max_score) * 100 : 0,
      })
      .eq('id', attempt_id)
    
    if (updateError) {
      console.error('Update attempt error:', updateError)
      return { success: false, error: updateError.message }
    }
    
    // Create answers
    const { nanoid } = await import('nanoid')
    const answerRecords = answers.map(answer => ({
      id: 'ans' + nanoid(21),
      attempt_id: attempt_id,
      question_id: answer.question_id,
      choice_id: answer.choice_id,
    }))
    
    const { error: answersError } = await supabase
      .from('answers')
      .insert(answerRecords)
    
    if (answersError) {
      console.error('Insert answers error:', answersError)
      return { success: false, error: answersError.message }
    }
    
    // Count how many times this account has completed this quiz (for reward eligibility)
    let completionCount: number = 0
    if (attempt.account_id) {
      const { count } = await supabase
        .from('attempts')
        .select('id', { count: 'exact', head: true })
        .eq('quiz_post_id', attempt.quiz_post_id)
        .eq('account_id', attempt.account_id)
        .not('finished_at', 'is', null)
        .neq('id', attempt_id) // Exclude current attempt
      
      completionCount = count || 0
    }
    
    // Get max_reward_attempts from quiz config (default 3)
    const max_reward_attempts = quiz.max_reward_attempts ?? 3
    
    console.log('=== REWARD DEBUG ===')
    console.log('account_id:', attempt.account_id)
    console.log('quiz.max_reward_attempts from DB:', quiz.max_reward_attempts)
    console.log('max_reward_attempts (with fallback):', max_reward_attempts)
    console.log('completionCount (previous completions):', completionCount)
    console.log('currentAttemptNumber will be:', completionCount + 1)
    console.log('isEligibleForRewards will be:', (completionCount + 1) <= max_reward_attempts)
    console.log('===================')
    
    // Auto-save score for logged-in users (to ScoreEntry table)
    if (attempt.account_id) {
      // Get user's email from the attempt
      const { data: attemptDetails } = await supabase
        .from('attempts')
        .select('player_name, player_email, device_hash')
        .eq('id', attempt_id)
        .single()

      if (attemptDetails?.player_email) {
        // Check if score already saved for this attempt
        const { data: existingScore } = await supabase
          .from('score_entries')
          .select('id')
          .eq('attempt_id', attempt_id)
          .single()

        if (!existingScore) {
          const { hashEmail } = await import('@/lib/crypto')
          const email_hash = hashEmail(attemptDetails.player_email)
          const scoreId = 's' + nanoid(24)

          await supabase
            .from('score_entries')
            .insert({
              id: scoreId,
              quiz_post_id: attempt.quiz_post_id,
              attempt_id: attempt_id,
              device_hash: attemptDetails.device_hash,
              account_id: attempt.account_id,
              name: attemptDetails.player_name,
              email: attemptDetails.player_email,
              email_hash,
              score,
              max_score,
            })
        }
      }
    }
    
    // Record activity in central account system if user has account_id
    // This is the current completion number (completionCount was previous completions, +1 for this one)
    const currentAttemptNumber = completionCount + 1
    const isEligibleForRewards = currentAttemptNumber <= max_reward_attempts
    
    let streakMultiplier: number | undefined
    let streakDays: number | undefined
    
    if (attempt.account_id) {
      const { recordQuizCompletion } = await import('@/lib/central-account')
      const recordResult = await recordQuizCompletion(
        attempt.account_id,
        quiz.id,
        score,
        max_score,
        {
          reward_coins: quiz.reward_coins,
          reward_xp: quiz.reward_xp,
          reward_tokens: quiz.reward_tokens,
          first_time_multiplier: quiz.first_time_multiplier,
          full_marks_multiplier: quiz.full_marks_multiplier,
          max_reward_attempts,
        },
        currentAttemptNumber // Pass the attempt number (1 = first, 2 = second, etc.)
      )
      
      if (!recordResult.success) {
        console.error('Failed to record quiz completion:', recordResult.error)
        // Don't fail the whole operation if rewards fail
      } else {
        // Capture streak info for UI
        streakMultiplier = recordResult.streakMultiplier
        streakDays = recordResult.streakDays
      }
    }
    
    return {
      success: true,
      attempt_id,
      score,
      max_score,
      attemptNumber: currentAttemptNumber,
      isEligibleForRewards,
      max_reward_attempts, // Let UI know max
      streakMultiplier,
      streakDays,
    }
  } catch (error) {
    console.error('submitQuiz error:', error)
    return { success: false, error: 'Failed to submit quiz. Please try again.' }
  }
}

export async function saveScore(
  attempt_id: string,
  player_name: string,
  email: string
) {
  const supabase = createSupabaseServiceClient()
  
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attempt_id)
    .single()
  
  if (attemptError || !attempt) {
    return { success: false, error: 'Attempt not found' }
  }
  
  // Check if this attempt already has a saved score (attempt_id must be unique)
  const { data: existing } = await supabase
    .from('score_entries')
    .select('id')
    .eq('attempt_id', attempt_id)
    .single()
  
  if (existing) {
    return { success: false, error: 'Score already saved for this attempt' }
  }
  
  // Get account_id for this email
  const account_id = await getOrCreateUserAccountId(email, player_name)
  
  // Hash email for analytics/grouping
  const { hashEmail } = await import('@/lib/crypto')
  const email_hash = hashEmail(email)
  
  // Generate score entry ID
  const { nanoid } = await import('nanoid')
  const scoreId = 's' + nanoid(24)
  
  const { error } = await supabase
    .from('score_entries')
    .insert({
      id: scoreId,
      quiz_post_id: attempt.quiz_post_id,
      attempt_id: attempt.id,
      device_hash: attempt.device_hash,
      account_id,
      name: player_name,
      email,
      email_hash,
      score: attempt.score,
      max_score: attempt.max_score,
    })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath(`/admin/quizzes/${attempt.quiz_post_id}/scores`)
  return { success: true }
}
