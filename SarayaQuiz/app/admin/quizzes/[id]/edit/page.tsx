import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { QuizEditorClient } from '@/components/admin/QuizEditorClient'
import { normalizeQuiz } from '@/lib/quiz-schema'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuizPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

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
    .eq('id', id)
    .single()

  if (error || !quiz) {
    notFound()
  }
  
  return <QuizEditorClient quiz={normalizeQuiz(quiz)} />
}
