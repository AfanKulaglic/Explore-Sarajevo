'use client'

import { useState } from 'react'
import { 
  Brain, Sparkles, Trophy, Zap, Flame, Target, Star, Lightbulb,
  Globe, Book, Rocket, Heart, Music, Camera, Coffee, Cpu,
  Glasses, Palette, Award, Gift, Crown, Diamond
} from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

const AVAILABLE_ICONS = [
  { name: 'Brain', component: Brain },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Trophy', component: Trophy },
  { name: 'Zap', component: Zap },
  { name: 'Flame', component: Flame },
  { name: 'Target', component: Target },
  { name: 'Star', component: Star },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'Globe', component: Globe },
  { name: 'Book', component: Book },
  { name: 'Rocket', component: Rocket },
  { name: 'Heart', component: Heart },
  { name: 'Music', component: Music },
  { name: 'Camera', component: Camera },
  { name: 'Coffee', component: Coffee },
  { name: 'Cpu', component: Cpu },
  { name: 'Glasses', component: Glasses },
  { name: 'Palette', component: Palette },
  { name: 'Award', component: Award },
  { name: 'Gift', component: Gift },
  { name: 'Crown', component: Crown },
  { name: 'Diamond', component: Diamond },
]

const AVAILABLE_GRADIENTS = [
  { name: 'Purple to Pink', value: 'from-purple-500 to-pink-500' },
  { name: 'Blue to Cyan', value: 'from-blue-500 to-cyan-500' },
  { name: 'Orange to Red', value: 'from-orange-500 to-red-500' },
  { name: 'Green to Emerald', value: 'from-green-500 to-emerald-500' },
  { name: 'Yellow to Orange', value: 'from-yellow-500 to-orange-500' },
  { name: 'Pink to Rose', value: 'from-pink-500 to-rose-500' },
  { name: 'Indigo to Purple', value: 'from-indigo-500 to-purple-500' },
  { name: 'Teal to Blue', value: 'from-teal-500 to-blue-500' },
]

interface IconPickerProps {
  value: string
  gradient: string
  onChange: (icon: string, gradient: string) => void
}

export function IconPicker({ value, gradient, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(value)
  const [selectedGradient, setSelectedGradient] = useState(gradient)

  const CurrentIcon = AVAILABLE_ICONS.find(i => i.name === value)?.component || Brain

  const handleSave = () => {
    onChange(selectedIcon, selectedGradient)
    setIsOpen(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Quiz Icon & Color
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <CurrentIcon className="w-6 h-6 text-white" />
        </div>
        <span className="text-gray-900">Click to change</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Select Icon & Gradient</h3>
          
          {/* Icon Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Choose Icon</h4>
            <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto">
              {AVAILABLE_ICONS.map((icon) => {
                const Icon = icon.component
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setSelectedIcon(icon.name)}
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedIcon === icon.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-gray-900 mx-auto" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gradient Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Choose Gradient</h4>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_GRADIENTS.map((grad) => (
                <button
                  key={grad.value}
                  type="button"
                  onClick={() => setSelectedGradient(grad.value)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedGradient === grad.value
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${grad.value} mb-2`} />
                  <div className="text-xs text-gray-900 text-center">{grad.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedGradient} flex items-center justify-center mx-auto`}>
              {(() => {
                const PreviewIcon = AVAILABLE_ICONS.find(i => i.name === selectedIcon)?.component || Brain
                return <PreviewIcon className="w-8 h-8 text-white" />
              })()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export { AVAILABLE_ICONS }
