import { Noto_Color_Emoji } from 'next/font/google'

/** Google Noto Color Emoji — consistent 😉 (U+1F609) rendering across platforms */
export const chatWinkEmojiFont = Noto_Color_Emoji({
  weight: '400',
  subsets: ['emoji'],
  display: 'swap',
})
