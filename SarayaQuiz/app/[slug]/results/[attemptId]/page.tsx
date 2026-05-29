import { notFound } from 'next/navigation'
import { QuizResults } from '@/components/quiz/QuizResults'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { normalizeQuiz } from '@/lib/quiz-schema'

interface PageProps {
  params: Promise<{ slug: string; attemptId: string }>
}

export default async function ResultsPage({ params }: PageProps) {
  const { slug, attemptId } = await params

  const supabase = createSupabaseServiceClient()
  
  const { data: attempt, error } = await supabase
    .from('attempts')
    .select(`
      *,
      quizPost:posts(
        *,
        questions:questions(
          *,
          choices:choices(*)
        )
      ),
      answers:answers(
        *,
        question:questions(*),
        selectedChoice:choices(*)
      )
    `)
    .eq('id', attemptId)
    .single()

  if (error || !attempt || attempt.quizPost.slug !== slug) {
    notFound()
  }
  
  attempt.quizPost = normalizeQuiz(attempt.quizPost)

  return <QuizResults attempt={attempt} />
}
