'use client'

import Link from 'next/link'
import { MetaEditor } from '@/components/admin/MetaEditor'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { PublishButton } from '@/components/admin/PublishButton'
import { AddQuestionButton } from '@/components/admin/AddQuestionButton'

interface QuizEditorClientProps {
  quiz: any
}

export function QuizEditorClient({ quiz }: QuizEditorClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-blue-600 hover:underline mb-2 block">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/quizzes/${quiz.id}/preview`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900 font-medium"
            >
              Preview
            </Link>
            <PublishButton quiz={quiz} />
          </div>
        </div>

        <div className="space-y-6">
          <MetaEditor quiz={quiz} />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Questions</h2>
              <AddQuestionButton quizId={quiz.id} />
            </div>

            {quiz.questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-800 mb-4">No questions yet</p>
                <AddQuestionButton quizId={quiz.id} />
              </div>
            ) : (
              <div className="space-y-4">
                {quiz.questions.map((question: any, index: number) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    onDelete={() => {}}
                    canMoveUp={index > 0}
                    canMoveDown={index < quiz.questions.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
