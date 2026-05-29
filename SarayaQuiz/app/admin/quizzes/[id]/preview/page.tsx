import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getThemeStyle } from '@/lib/theme'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { BackButton } from '@/components/admin/BackButton'
import { normalizeQuiz } from '@/lib/quiz-schema'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PageProps) {
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
  
  const normalizedQuiz = normalizeQuiz(quiz)
  const themeStyle = getThemeStyle(normalizedQuiz.theme)

  return (
    <div className="min-h-screen" style={themeStyle}>
      <div className="min-h-screen bg-black bg-opacity-30">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-4">
            <BackButton />
          </div>

          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/40">
            <div className="text-center mb-8">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                PREVIEW MODE
              </span>
              <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">{normalizedQuiz.title}</h1>
              {normalizedQuiz.description && (
                <p className="text-white text-lg drop-shadow-md">{normalizedQuiz.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {normalizedQuiz.questions.map((question: any, qIndex: number) => (
              <div key={question.id} className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/40">
                <h2 className="text-xl font-semibold mb-4 text-white drop-shadow-md">
                  {qIndex + 1}. {question.text}
                </h2>
                <div className="space-y-3">
                  {question.choices.map((choice: any, cIndex: number) => (
                    <div
                      key={choice.id}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition cursor-pointer"
                    >
                      <span className="font-medium text-white mr-3">
                        {String.fromCharCode(65 + cIndex)}.
                      </span>
                      <span className="text-white">{choice.text}</span>
                      {choice.is_correct && (
                        <span className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {normalizedQuiz.questions.length === 0 && (
            <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-12 text-center border border-white/40">
              <p className="text-gray-800">No questions added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
