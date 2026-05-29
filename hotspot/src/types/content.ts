import type { ContentTrackingSnapshot } from '@/lib/analytics/types'

export type Language = 'BA' | 'EN'

export interface HeroVideo {
  id: string
  // Primary video URL - will be randomly selected on page load
  videoFile: string
  // Secondary video URL - alternative video for random selection
  videoFileAlt?: string
  thumbnail: string
  titleBosnian: string
  titleEnglish: string
  subtitleBosnian?: string
  subtitleEnglish?: string
  buttonTextBosnian: string
  buttonTextEnglish: string
  buttonLink: string
  tracking?: ContentTrackingSnapshot
}

export interface HeroBanner {
  id: string
  imageFile: string
  titleBosnian: string
  titleEnglish: string
  subtitleBosnian: string
  subtitleEnglish: string
  buttonTextBosnian: string
  buttonTextEnglish: string
  buttonLink: string
  tracking?: ContentTrackingSnapshot
}

export interface BlockItem {
  id: string
  imageFile: string
  titleBosnian: string
  titleEnglish: string
  descriptionBosnian: string
  descriptionEnglish: string
  buttonTextBosnian: string
  buttonTextEnglish: string
  buttonLink: string
  tracking?: ContentTrackingSnapshot
}

// Alias for BlockItem used in admin components
export type Block = BlockItem

// A group of up to 6 blocks for the deals section
export interface BlockGroup {
  id: string
  name: string
  blocks: BlockItem[]
}

export interface BlockSet {
  id: string
  blocks: BlockItem[] // Legacy flat array (deprecated)
  groups?: BlockGroup[] // New grouped structure
  styling: {
    blockBackground: string
    titleColor: string
    descriptionColor: string
    buttonBackground: string
    buttonTextColor: string
  }
}

export interface ChipItem {
  id: string
  nameBosnian: string
  nameEnglish: string
  icon: string
  link: string
  tracking?: ContentTrackingSnapshot
}

// Alias for ChipItem used in admin components
export type Chip = ChipItem

export interface FooterIcon {
  id: string
  name: string
  url: string
  icon: string
}

export interface EditorsPickItem {
  id: string
  titleBosnian: string
  titleEnglish: string
  teaserBosnian?: string
  teaserEnglish?: string
  imageFile: string
  link: string
  tracking?: ContentTrackingSnapshot
}

export interface DiscoveryPlace {
  id: string
  nameBosnian: string
  nameEnglish: string
  categoryBosnian?: string
  categoryEnglish?: string
  imageFile: string
  link: string
  tracking?: ContentTrackingSnapshot
}

export interface PlayAndWinItem {
  titleBosnian?: string
  titleEnglish?: string
  subtitleBosnian?: string
  subtitleEnglish?: string
  imageFile: string
  link: string
  tracking?: ContentTrackingSnapshot
}

// Alias for backward compatibility
export type QuickFunItem = PlayAndWinItem

// New Game type for Play & Win section
export interface GameItem {
  id: string
  titleBosnian: string
  titleEnglish: string
  descriptionBosnian: string
  descriptionEnglish: string
  imageFile?: string
  icon: string // Lucide icon name
  color: string // Color theme: violet, amber, emerald, blue, rose, cyan
  difficulty: 'easy' | 'medium' | 'hard'
  players: string // e.g., "1", "1-4"
  link: string
  featured?: boolean
}

export interface UtilitiesConfig {
  city: string
  lat: number
  lon: number
  baseCurrency: string
  targetCurrencies: string[]
}

// =============================================================================
// NEWS CAROUSEL CTA TYPES
// =============================================================================

export interface NewsCtaChip {
  id: string
  labelBosnian: string
  labelEnglish: string
}

export interface NewsCtaCard {
  id: string
  // Icon or Image (one or the other)
  iconName?: string // Lucide icon name
  imageFile?: string // Uploaded image URL
  // Text content (64 char limit)
  textBosnian: string
  textEnglish: string
  // Chips
  chips: NewsCtaChip[]
  // Link
  link: string
  // Draft status - if true, card is not shown on public page
  isDraft?: boolean
  tracking?: ContentTrackingSnapshot
}

export interface PortalContent {
  global?: {
    backgroundColor: string
    primaryColor: string
    secondaryColor: string
  }
  heroVideos?: HeroVideo[]
  heroBanners?: HeroBanner[]
  blockSets?: BlockSet[]
  chips?: ChipItem[]
  footer?: {
    icons: FooterIcon[]
    styling: {
      footerBackground: string
      iconColor: string
      textColor: string
    }
  }
  editorsPicks?: EditorsPickItem[]
  discovery?: { places: DiscoveryPlace[] }
  playAndWin?: PlayAndWinItem
  games?: GameItem[]
  utilities?: UtilitiesConfig
  newsCarousel?: NewsCtaCard[] // New news carousel CTA cards
}
