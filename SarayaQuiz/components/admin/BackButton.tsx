'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.back()}
      className="inline-block bg-white/20 backdrop-blur-2xl text-white px-4 py-2 rounded-2xl hover:bg-white/30 transition border border-white/40 shadow-xl drop-shadow-md"
    >
      ← Back
    </button>
  )
}
