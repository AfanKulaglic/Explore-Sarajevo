export const THEME_PRESETS = [
  {
    id: 'solid-blue',
    name: 'Ocean Blue',
    type: 'solid',
    value: 'bg-blue-500',
    previewStyle: { backgroundColor: '#3b82f6' }, // blue-500
  },
  {
    id: 'solid-purple',
    name: 'Royal Purple',
    type: 'solid',
    value: 'bg-purple-600',
    previewStyle: { backgroundColor: '#9333ea' }, // purple-600
  },
  {
    id: 'solid-green',
    name: 'Forest Green',
    type: 'solid',
    value: 'bg-green-600',
    previewStyle: { backgroundColor: '#16a34a' }, // green-600
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset',
    type: 'gradient',
    value: 'bg-gradient-to-br from-orange-400 to-pink-600',
    previewStyle: { backgroundImage: 'linear-gradient(to bottom right, #fb923c, #db2777)' },
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Breeze',
    type: 'gradient',
    value: 'bg-gradient-to-br from-blue-400 to-cyan-300',
    previewStyle: { backgroundImage: 'linear-gradient(to bottom right, #60a5fa, #67e8f9)' },
  },
  {
    id: 'gradient-forest',
    name: 'Forest Dawn',
    type: 'gradient',
    value: 'bg-gradient-to-br from-green-400 to-blue-500',
    previewStyle: { backgroundImage: 'linear-gradient(to bottom right, #4ade80, #3b82f6)' },
  },
  {
    id: 'gradient-purple',
    name: 'Purple Haze',
    type: 'gradient',
    value: 'bg-gradient-to-br from-purple-400 to-pink-500',
    previewStyle: { backgroundImage: 'linear-gradient(to bottom right, #c084fc, #ec4899)' },
  },
  {
    id: 'gradient-fire',
    name: 'Fire',
    type: 'gradient',
    value: 'bg-gradient-to-br from-red-500 to-yellow-500',
    previewStyle: { backgroundImage: 'linear-gradient(to bottom right, #ef4444, #eab308)' },
  },
] as const

export function getThemeClass(theme: any): string {
  if (!theme) return THEME_PRESETS[0].value
  
  if (typeof theme === 'string') {
    const preset = THEME_PRESETS.find(p => p.id === theme)
    return preset?.value || THEME_PRESETS[0].value
  }
  
  if (theme.presetId) {
    const preset = THEME_PRESETS.find(p => p.id === theme.presetId)
    return preset?.value || THEME_PRESETS[0].value
  }
  
  if (theme.customClass) {
    return theme.customClass
  }
  
  return THEME_PRESETS[0].value
}

export function getThemeStyle(theme: any): React.CSSProperties {
  if (!theme) return THEME_PRESETS[0].previewStyle
  
  if (typeof theme === 'string') {
    const preset = THEME_PRESETS.find(p => p.id === theme)
    return preset?.previewStyle || THEME_PRESETS[0].previewStyle
  }
  
  if (theme.presetId) {
    const preset = THEME_PRESETS.find(p => p.id === theme.presetId)
    return preset?.previewStyle || THEME_PRESETS[0].previewStyle
  }
  
  return THEME_PRESETS[0].previewStyle
}
