import { notFound } from 'next/navigation'
import { QuizTaker } from '@/components/quiz/QuizTaker'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase'
import { normalizeQuiz, isQuizLive } from '@/lib/quiz-schema'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = createSupabaseServiceClient()
  
  const { data: quiz, error } = await supabase
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

  if (error || !quiz || !isQuizLive(quiz)) {
    notFound()
  }

  const normalizedQuiz = normalizeQuiz(quiz)

  // Get logged in user info
  const supabaseAuth = await createSupabaseServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  const userInfo = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Player',
    email: user.email || ''
  } : null

  return <QuizTaker quiz={normalizedQuiz} user={userInfo} />
}
