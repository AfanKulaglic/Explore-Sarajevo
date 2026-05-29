'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { publishQuiz, unpublishQuiz } from '@/app/actions/quiz-actions'
import { useRouter } from 'next/navigation'

interface PublishButtonProps {
  quiz: {
    id: string
    status: string
    slug: string | null
  }
}

export function PublishButton({ quiz }: PublishButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePublish = async () => {
    setLoading(true)
    try {
      const result = await publishQuiz(quiz.id)
      if (result.success) {
        alert(`Quiz published! Link: /${result.slug}`)
        router.refresh()
      } else if (result.errors) {
        alert(`Cannot publish:\n${result.errors.map(e => `- ${e.message}`).join('\n')}`)
      } else {
        alert('Failed to publish quiz')
      }
    } catch (error) {
      console.error('Failed to publish:', error)
      alert('Failed to publish quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('Unpublish this quiz? The public link will no longer work.')) return
    
    setLoading(true)
    try {
      await unpublishQuiz(quiz.id)
      router.refresh()
    } catch (error) {
      console.error('Failed to unpublish:', error)
      alert('Failed to unpublish quiz')
    } finally {
      setLoading(false)
    }
  }

  if (quiz.status === 'PUBLISHED') {
    return (
      <Button variant="secondary" onClick={handleUnpublish} disabled={loading}>
        {loading ? 'Unpublishing...' : 'Unpublish'}
      </Button>
    )
  }

  return (
    <Button onClick={handlePublish} disabled={loading}>
      {loading ? 'Publishing...' : 'Publish Quiz'}
    </Button>
  )
}
