'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { IconPicker } from '@/components/ui/IconPicker'
import { updateQuizMeta } from '@/app/actions/quiz-actions'
import { THEME_PRESETS } from '@/lib/theme'
import { Coins, Sparkles, Trophy, Users, Clock, Shield, Info } from 'lucide-react'

interface MetaEditorProps {
  quiz: {
    id: string
    title: string
    description: string | null
    theme: any
    icon?: string | null
    gradient?: string | null
    // Reward settings
    reward_coins?: number
    reward_xp?: number
    reward_tokens?: number
    first_time_multiplier?: number
    full_marks_multiplier?: number
    max_reward_attempts?: number | null // Max times account can earn rewards (null = 3 default)
    allow_anonymous?: boolean
    requires_account?: boolean
    max_attempts_per_device?: number | null
    cooldown_minutes?: number | null
  }
}

export function MetaEditor({ quiz }: MetaEditorProps) {
  const [title, setTitle] = useState(quiz.title)
  const [description, setDescription] = useState(quiz.description || '')
  const [icon, setIcon] = useState(quiz.icon || 'Brain')
  const [gradient, setGradient] = useState(quiz.gradient || 'from-purple-500 to-pink-500')
  const [selectedTheme, setSelectedTheme] = useState(
    typeof quiz.theme === 'object' && quiz.theme?.presetId
      ? quiz.theme.presetId
      : THEME_PRESETS[0].id
  )

  // Reward settings
  const [reward_coins, setRewardCoins] = useState(quiz.reward_coins ?? 10)
  const [reward_xp, setRewardXp] = useState(quiz.reward_xp ?? 5)
  const [reward_tokens, setRewardTokens] = useState(quiz.reward_tokens ?? 0)
  const [first_time_multiplier, setFirstTimeMultiplier] = useState(quiz.first_time_multiplier ?? 5.0)
  const [full_marks_multiplier, setFullMarksMultiplier] = useState(quiz.full_marks_multiplier ?? 2.0)
  const [max_reward_attempts, setMaxRewardAttempts] = useState<number | ''>(quiz.max_reward_attempts ?? 3)
  const [allow_anonymous, setAllowAnonymous] = useState(quiz.allow_anonymous ?? true)
  const [requires_account, setRequiresAccount] = useState(quiz.requires_account ?? false)
  const [max_attempts_per_device, setMaxAttemptsPerDevice] = useState<number | ''>(quiz.max_attempts_per_device ?? '')
  const [cooldown_minutes, setCooldownMinutes] = useState<number | ''>(quiz.cooldown_minutes ?? '')

  const [isSaving, setIsSaving] = useState(false)

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle)
    if (newTitle.trim()) {
      try {
        await updateQuizMeta(quiz.id, {
          title: newTitle,
          description,
          theme: { presetId: selectedTheme },
        })
      } catch (error) {
        console.error('Failed to save title:', error)
      }
    }
  }

  const handleDescriptionChange = async (newDescription: string) => {
    setDescription(newDescription)
    try {
      await updateQuizMeta(quiz.id, {
        title,
        description: newDescription,
        theme: { presetId: selectedTheme },
      })
    } catch (error) {
      console.error('Failed to save description:', error)
    }
  }

  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId)
    try {
      await updateQuizMeta(quiz.id, {
        title,
        description,
        theme: { presetId: themeId },
        icon,
        gradient,
      })
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const handleIconChange = async (newIcon: string, newGradient: string) => {
    setIcon(newIcon)
    setGradient(newGradient)
    try {
      await updateQuizMeta(quiz.id, {
        title,
        description,
        theme: { presetId: selectedTheme },
        icon: newIcon,
        gradient: newGradient,
      })
    } catch (error) {
      console.error('Failed to save icon:', error)
    }
  }

  const handleRewardsChange = async () => {
    setIsSaving(true)
    try {
      await updateQuizMeta(quiz.id, {
        reward_coins,
        reward_xp,
        reward_tokens,
        first_time_multiplier,
        full_marks_multiplier,
        max_reward_attempts: max_reward_attempts === '' ? 3 : max_reward_attempts,
        allow_anonymous,
        requires_account,
        max_attempts_per_device: max_attempts_per_device === '' ? null : max_attempts_per_device,
        cooldown_minutes: cooldown_minutes === '' ? null : cooldown_minutes,
      })
    } catch (error) {
      console.error('Failed to save reward settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate preview rewards based on new 3-attempt logic
  const maxAttempts = max_reward_attempts === '' ? 3 : max_reward_attempts
  const previewRewards = {
    // Attempt 1: First time multiplier applies
    firstTimeFullMarks: Math.round(reward_coins * first_time_multiplier * full_marks_multiplier),
    firstTimePartial: Math.round(reward_coins * first_time_multiplier),
    xpFirstTimeFullMarks: Math.round(reward_xp * first_time_multiplier * full_marks_multiplier),
    xpFirstTimePartial: Math.round(reward_xp * first_time_multiplier),
    // Attempts 2-3: Base rewards (no first time multiplier)
    repeatFullMarks: Math.round(reward_coins * full_marks_multiplier),
    repeatPartial: reward_coins,
    xpRepeatFullMarks: Math.round(reward_xp * full_marks_multiplier),
    xpRepeatPartial: reward_xp,
    // After max attempts: No rewards
    noRewards: 0,
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quiz Details</h2>
          
          <Input
            label="Title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter quiz title..."
          />
          
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter quiz description..."
            rows={3}
          />
          
          <IconPicker 
            value={icon}
            gradient={gradient}
            onChange={handleIconChange}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {THEME_PRESETS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative p-4 rounded-lg border-2 transition ${
                    selectedTheme === theme.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-full h-20 rounded mb-2" 
                    style={theme.previewStyle}
                  />
                  <p className="text-sm font-medium text-center text-gray-900">{theme.name}</p>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Reward Settings */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Reward Settings</h2>
          </div>
          
          {/* Base Rewards */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Coins
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <input
                  type="number"
                  min="0"
                  value={reward_coins}
                  onChange={(e) => setRewardCoins(parseInt(e.target.value) || 0)}
                  onBlur={handleRewardsChange}
                  className="pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base XP
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                <input
                  type="number"
                  min="0"
                  value={reward_xp}
                  onChange={(e) => setRewardXp(parseInt(e.target.value) || 0)}
                  onBlur={handleRewardsChange}
                  className="pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Tokens
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="number"
                  min="0"
                  value={reward_tokens}
                  onChange={(e) => setRewardTokens(parseInt(e.target.value) || 0)}
                  onBlur={handleRewardsChange}
                  className="pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usually 0 (tokens are earned separately)
              </p>
            </div>
          </div>

          {/* Multipliers */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Multipliers & Limits
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Time Multiplier
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={first_time_multiplier}
                    onChange={(e) => setFirstTimeMultiplier(parseFloat(e.target.value) || 1)}
                    onBlur={handleRewardsChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500 font-medium">×</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bonus for 1st completion
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfect Score Multiplier
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={full_marks_multiplier}
                    onChange={(e) => setFullMarksMultiplier(parseFloat(e.target.value) || 1)}
                    onBlur={handleRewardsChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500 font-medium">×</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bonus for 100% score
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Reward Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="3"
                  value={max_reward_attempts}
                  onChange={(e) => setMaxRewardAttempts(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                  onBlur={handleRewardsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Times an account can earn rewards
                </p>
              </div>
            </div>
          </div>

          {/* Reward Preview Table */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">Reward Preview (per attempt)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-amber-700">
                    <th className="pb-2">Attempt</th>
                    <th className="pb-2">Scenario</th>
                    <th className="pb-2 text-right">Multiplier</th>
                    <th className="pb-2 text-right">Coins</th>
                    <th className="pb-2 text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-amber-200">
                    <td className="py-2 font-medium text-green-700" rowSpan={2}>1st</td>
                    <td className="py-2">🎯 Perfect score</td>
                    <td className="py-2 text-right">{first_time_multiplier * full_marks_multiplier}×</td>
                    <td className="py-2 text-right font-semibold text-yellow-600">
                      {previewRewards.firstTimeFullMarks}
                    </td>
                    <td className="py-2 text-right font-semibold text-purple-600">
                      {previewRewards.xpFirstTimeFullMarks}
                    </td>
                  </tr>
                  <tr className="border-t border-amber-200">
                    <td className="py-2">✨ Partial score</td>
                    <td className="py-2 text-right">{first_time_multiplier}×</td>
                    <td className="py-2 text-right">{previewRewards.firstTimePartial}</td>
                    <td className="py-2 text-right">{previewRewards.xpFirstTimePartial}</td>
                  </tr>
                  <tr className="border-t border-amber-200 bg-amber-50/50">
                    <td className="py-2 text-blue-700" rowSpan={2}>2-{maxAttempts}</td>
                    <td className="py-2">🌟 Perfect score</td>
                    <td className="py-2 text-right">{full_marks_multiplier}×</td>
                    <td className="py-2 text-right">{previewRewards.repeatFullMarks}</td>
                    <td className="py-2 text-right">{previewRewards.xpRepeatFullMarks}</td>
                  </tr>
                  <tr className="border-t border-amber-200 bg-amber-50/50">
                    <td className="py-2">Partial score</td>
                    <td className="py-2 text-right">1×</td>
                    <td className="py-2 text-right">{previewRewards.repeatPartial}</td>
                    <td className="py-2 text-right">{previewRewards.xpRepeatPartial}</td>
                  </tr>
                  <tr className="border-t border-amber-200 bg-gray-100">
                    <td className="py-2 text-gray-500">{Number(maxAttempts) + 1}+</td>
                    <td className="py-2 text-gray-500">Any score</td>
                    <td className="py-2 text-right text-gray-500">0×</td>
                    <td className="py-2 text-right text-gray-400">0</td>
                    <td className="py-2 text-right text-gray-400">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              After {maxAttempts} completions, players can still play but won&apos;t earn rewards.
            </p>
          </div>

          {/* Access Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Access & Limits
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allow_anonymous}
                  onChange={(e) => {
                    setAllowAnonymous(e.target.checked)
                    setTimeout(handleRewardsChange, 0)
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allow anonymous play (without login)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requires_account}
                  onChange={(e) => {
                    setRequiresAccount(e.target.checked)
                    setTimeout(handleRewardsChange, 0)
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Require account to start (forces login before playing)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Max Attempts per Device
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={max_attempts_per_device}
                  onChange={(e) => setMaxAttemptsPerDevice(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                  onBlur={handleRewardsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for unlimited
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Cooldown (minutes)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="No cooldown"
                  value={cooldown_minutes}
                  onChange={(e) => setCooldownMinutes(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                  onBlur={handleRewardsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wait time between attempts
                </p>
              </div>
            </div>
          </div>

          {/* Save indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
