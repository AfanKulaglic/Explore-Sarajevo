import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase'
import { QuizHomepageClient } from '@/components/quiz/QuizHomepageClient'
import { normalizeQuiz } from '@/lib/quiz-schema'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Check if user is authenticated (but don't require it)
  const supabaseAuth = await createSupabaseServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  // Don't redirect - allow anonymous access

  const supabase = createSupabaseServiceClient()
  
  const { data: quizzes, error: quizzesError } = await supabase
    .from('posts')
    .select('id, title, description, slug, icon, gradient, published_at, is_active')
    .not('published_at', 'is', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (quizzesError) {
    console.error('Failed to fetch quizzes:', quizzesError)
  }

  // Get stats
  const { data: allAttempts, error: attemptsError } = await supabase
    .from('attempts')
    .select('id, finished_at')

  if (attemptsError) {
    console.error('Failed to fetch attempts:', attemptsError)
  }

  // Calculate stats
  const activeQuizzes = quizzes?.length || 0
  const total_attempts = allAttempts?.length || 0
  
  // Completed today (attempts finished today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedToday = allAttempts?.filter((attempt: any) => 
    attempt.finished_at && new Date(attempt.finished_at) >= today
  ).length || 0

  return (
    <QuizHomepageClient 
      quizzes={(quizzes || []).map(normalizeQuiz)}
      stats={{
        activeQuizzes,
        playersOnline: total_attempts,
        completedToday
      }}
      user={user ? {
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split('@')[0]
      } : null}
    />
  )
}
