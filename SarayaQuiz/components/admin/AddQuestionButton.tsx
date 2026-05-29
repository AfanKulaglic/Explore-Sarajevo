'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { addQuestion } from '@/app/actions/quiz-actions'
import { useRouter } from 'next/navigation'

interface AddQuestionButtonProps {
  quizId: string
}

export function AddQuestionButton({ quizId }: AddQuestionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    setLoading(true)
    try {
      await addQuestion(quizId, 'New question')
      router.refresh()
    } catch (error) {
      console.error('Failed to add question:', error)
      alert('Failed to add question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleAdd} disabled={loading}>
      {loading ? 'Adding...' : 'Add Question'}
    </Button>
  )
}
