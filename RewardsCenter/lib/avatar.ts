import { createAvatar } from '@dicebear/core'
import { 
  adventurer, 
  adventurerNeutral,
  avataaars,
  avataaarsNeutral,
  bigEars,
  bigEarsNeutral,
  bigSmile,
  bottts,
  botttsNeutral,
  croodles,
  croodlesNeutral,
  funEmoji,
  icons,
  identicon,
  initials,
  lorelei,
  loreleiNeutral,
  micah,
  miniavs,
  notionists,
  notionistsNeutral,
  openPeeps,
  personas,
  pixelArt,
  pixelArtNeutral,
  shapes,
  thumbs
} from '@dicebear/collection'

// Available avatar styles
export const avatarStyles = {
  adventurer: { name: 'Adventurer', style: adventurer, category: 'Characters' },
  adventurerNeutral: { name: 'Adventurer Neutral', style: adventurerNeutral, category: 'Characters' },
  avataaars: { name: 'Avataaars', style: avataaars, category: 'Characters' },
  avataaarsNeutral: { name: 'Avataaars Neutral', style: avataaarsNeutral, category: 'Characters' },
  bigEars: { name: 'Big Ears', style: bigEars, category: 'Characters' },
  bigEarsNeutral: { name: 'Big Ears Neutral', style: bigEarsNeutral, category: 'Characters' },
  bigSmile: { name: 'Big Smile', style: bigSmile, category: 'Characters' },
  bottts: { name: 'Robots', style: bottts, category: 'Robots' },
  botttsNeutral: { name: 'Robots Neutral', style: botttsNeutral, category: 'Robots' },
  croodles: { name: 'Croodles', style: croodles, category: 'Characters' },
  croodlesNeutral: { name: 'Croodles Neutral', style: croodlesNeutral, category: 'Characters' },
  funEmoji: { name: 'Fun Emoji', style: funEmoji, category: 'Fun' },
  lorelei: { name: 'Lorelei', style: lorelei, category: 'Characters' },
  loreleiNeutral: { name: 'Lorelei Neutral', style: loreleiNeutral, category: 'Characters' },
  micah: { name: 'Micah', style: micah, category: 'Characters' },
  miniavs: { name: 'Mini Avatars', style: miniavs, category: 'Characters' },
  notionists: { name: 'Notionists', style: notionists, category: 'Characters' },
  notionistsNeutral: { name: 'Notionists Neutral', style: notionistsNeutral, category: 'Characters' },
  openPeeps: { name: 'Open Peeps', style: openPeeps, category: 'Characters' },
  personas: { name: 'Personas', style: personas, category: 'Characters' },
  pixelArt: { name: 'Pixel Art', style: pixelArt, category: 'Pixel' },
  pixelArtNeutral: { name: 'Pixel Art Neutral', style: pixelArtNeutral, category: 'Pixel' },
  shapes: { name: 'Shapes', style: shapes, category: 'Abstract' },
  thumbs: { name: 'Thumbs', style: thumbs, category: 'Fun' },
  identicon: { name: 'Identicon', style: identicon, category: 'Abstract' },
  initials: { name: 'Initials', style: initials, category: 'Abstract' },
  icons: { name: 'Icons', style: icons, category: 'Abstract' },
} as const

export type AvatarStyleKey = keyof typeof avatarStyles

export interface AvatarConfig {
  style: AvatarStyleKey
  seed: string
  backgroundColor?: string
  flip?: boolean
  rotate?: number
  scale?: number
  radius?: number
  backgroundType?: 'solid' | 'gradientLinear'
  backgroundRotation?: number
}

export const defaultAvatarConfig: AvatarConfig = {
  style: 'adventurer',
  seed: '',
  backgroundColor: 'b6e3f4',
  flip: false,
  rotate: 0,
  scale: 100,
  radius: 50,
  backgroundType: 'solid',
}

// Background color presets
export const backgroundColors = [
  { name: 'Sky Blue', value: 'b6e3f4' },
  { name: 'Mint', value: 'c0aede' },
  { name: 'Lavender', value: 'd1d4f9' },
  { name: 'Peach', value: 'ffd5dc' },
  { name: 'Cream', value: 'ffdfbf' },
  { name: 'Sage', value: 'c9e4ca' },
  { name: 'Rose', value: 'f4c2c2' },
  { name: 'Gold', value: 'ffd700' },
  { name: 'Coral', value: 'ff7f50' },
  { name: 'Teal', value: '008080' },
  { name: 'Purple', value: '9370db' },
  { name: 'Forest', value: '228b22' },
  { name: 'Transparent', value: 'transparent' },
]

// Generate avatar SVG from config
export function generateAvatar(config: AvatarConfig): string {
  const styleInfo = avatarStyles[config.style]
  if (!styleInfo) {
    return ''
  }

  const avatar = createAvatar(styleInfo.style as any, {
    seed: config.seed || 'default',
    backgroundColor: config.backgroundColor === 'transparent' ? [] : [config.backgroundColor || 'b6e3f4'],
    flip: config.flip,
    rotate: config.rotate,
    scale: config.scale,
    radius: config.radius,
    backgroundType: config.backgroundType === 'gradientLinear' ? ['gradientLinear'] : ['solid'],
    backgroundRotation: [config.backgroundRotation || 0],
  })

  return avatar.toDataUri()
}

// Generate a random seed
export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Convert avatar config to URL-safe string
export function avatarConfigToString(config: AvatarConfig): string {
  return btoa(JSON.stringify(config))
}

// Parse avatar config from string
export function stringToAvatarConfig(str: string): AvatarConfig | null {
  try {
    return JSON.parse(atob(str))
  } catch {
    return null
  }
}

// Get avatar URL for storage (data URI or config string)
export function getAvatarUrl(config: AvatarConfig): string {
  return generateAvatar(config)
}
