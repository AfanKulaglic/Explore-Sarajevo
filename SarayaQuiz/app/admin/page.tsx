import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { CreateQuizButton } from '@/components/admin/CreateQuizButton'
import { QuizActions } from '@/components/admin/QuizActions'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { getQuizStatus } from '@/lib/quiz-schema'
import SignOutButton from '@/components/SignOutButton'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export default async function AdminPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/admin')
  }

  const adminEmailsStr = process.env.ADMIN_EMAILS || ''
  const adminEmails = adminEmailsStr
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = session.user?.email?.toLowerCase()
  if (!userEmail || !adminEmails.includes(userEmail)) {
    redirect('/auth/unauthorized')
  }

  // Use Supabase client instead of Prisma
  const supabase = createSupabaseServiceClient()
  
  const { data: quizzes, error } = await supabase
    .from('posts')
    .select(`
      *,
      questions:questions(count),
      attempts:attempts(count),
      score_entries:score_entries(count)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching quizzes:', error)
  }

  // Transform data to match Prisma structure
  const transformedQuizzes = (quizzes || []).map((quiz: any) => ({
    ...quiz,
    status: getQuizStatus(quiz),
    questions: quiz.questions || [],
    _count: {
      attempts: quiz.attempts?.[0]?.count || 0,
      score_entries: quiz.score_entries?.[0]?.count || 0,
    },
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quiz Admin</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Manage quizzes, questions, and attempts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/admin/stats"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm sm:text-base font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden xs:inline">Analytics</span>
            </Link>
            <CreateQuizButton />
            <SignOutButton />
          </div>
        </div>

        {transformedQuizzes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <p className="text-gray-800 mb-4">No quizzes yet</p>
              <CreateQuizButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {transformedQuizzes.map((quiz: any) => (
              <Card key={quiz.id} className="overflow-hidden">
                <CardContent className="p-3 sm:py-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      {/* Title and Status */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{quiz.title}</h2>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                            quiz.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </div>
                      
                      {quiz.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{quiz.description}</p>
                      )}
                      
                      {/* Stats - Mobile Grid */}
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">{quiz.questions.length} Q</span>
                        <span className="bg-blue-50 px-2 py-1 rounded">{quiz._count.attempts} attempts</span>
                        <span className="bg-green-50 px-2 py-1 rounded">{quiz._count.score_entries} scores</span>
                      </div>
                      
                      {quiz.status === 'PUBLISHED' && quiz.slug && (
                        <div className="mt-2 text-xs sm:text-sm text-blue-600 truncate">
                          /{quiz.slug}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Updated {new Date(quiz.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Actions - Full Width on Mobile */}
                    <div className="w-full sm:w-auto flex justify-end">
                      <QuizActions
                        quizId={quiz.id}
                        status={quiz.status}
                        slug={quiz.slug}
                        is_active={quiz.is_active || false}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
