'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  updateQuestion,
  deleteQuestion,
  addChoice,
  updateChoice,
  deleteChoice,
} from '@/app/actions/quiz-actions'

interface QuestionEditorProps {
  question: {
    id: string
    text: string
    order: number
    choices: {
      id: string
      text: string
      order: number
      is_correct: boolean
    }[]
  }
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function QuestionEditor({
  question,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: QuestionEditorProps) {
  const [text, setText] = useState(question.text)
  const [choices, setChoices] = useState(question.choices)
  const [saving, setSaving] = useState(false)

  const handleSaveText = async () => {
    if (text === question.text) return
    
    setSaving(true)
    try {
      await updateQuestion(question.id, { text })
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!confirm('Delete this question?')) return
    
    try {
      await deleteQuestion(question.id)
      onDelete()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete question')
    }
  }

  const handleAddChoice = async () => {
    if (choices.length >= 6) {
      alert('Maximum 6 choices allowed')
      return
    }
    
    const result = await addChoice(question.id, 'New choice')
    if (result.success) {
      window.location.reload()
    }
  }

  const handleUpdateChoice = async (choice_id: string, newText: string) => {
    await updateChoice(choice_id, { text: newText })
  }

  const handleSetCorrect = async (choice_id: string) => {
    await updateChoice(choice_id, { is_correct: true })
    window.location.reload()
  }

  const handleDeleteChoice = async (choice_id: string) => {
    if (!confirm('Delete this choice?')) return
    
    await deleteChoice(choice_id)
    window.location.reload()
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Question {question.order + 1}</h3>
          <div className="flex gap-2">
            {canMoveUp && onMoveUp && (
              <Button size="sm" variant="ghost" onClick={onMoveUp}>
                ↑
              </Button>
            )}
            {canMoveDown && onMoveDown && (
              <Button size="sm" variant="ghost" onClick={onMoveDown}>
                ↓
              </Button>
            )}
            <Button size="sm" variant="danger" onClick={handleDeleteQuestion}>
              Delete
            </Button>
          </div>
        </div>
        
        <div>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSaveText}
            placeholder="Enter question text..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Choices (select the correct answer)
          </label>
          <div className="space-y-2">
            {choices
              .sort((a, b) => a.order - b.order)
              .map((choice, index) => (
                <div key={choice.id} className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-gray-900 w-6">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={choice.is_correct}
                    onChange={() => handleSetCorrect(choice.id)}
                    className="w-4 h-4"
                  />
                  <Input
                    value={choice.text}
                    onChange={(e) => {
                      const newChoices = [...choices]
                      const idx = newChoices.findIndex(c => c.id === choice.id)
                      if (idx !== -1) {
                        newChoices[idx] = { ...newChoices[idx], text: e.target.value }
                        setChoices(newChoices)
                      }
                    }}
                    onBlur={() => handleUpdateChoice(choice.id, choice.text)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteChoice(choice.id)}
                    disabled={choices.length <= 2}
                  >
                    ×
                  </Button>
                </div>
              ))}
          </div>
          {choices.length < 6 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddChoice}
              className="mt-2"
            >
              Add Choice
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
