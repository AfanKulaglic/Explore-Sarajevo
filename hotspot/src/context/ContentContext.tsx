'use client'

/**
 * Content Context
 * 
 * Provides centralized state management for portal content.
 * Fetches content from Supabase via the /api/portal endpoint.
 * Falls back to local default content if API fails.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { PortalContent } from '@/types/content'
import { portalContent as defaultContent } from '@/data/content'

// =============================================================================
// TYPES
// =============================================================================

interface ContentContextType {
  /** Current portal content */
  content: PortalContent
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Refresh content from server */
  refreshContent: () => Promise<void>
  /** Update a specific section of content */
  updateSection: <K extends keyof PortalContent>(
    section: K,
    data: PortalContent[K]
  ) => Promise<boolean>
  /** Update the entire content */
  updateContent: (data: Partial<PortalContent>) => Promise<boolean>
  /** Whether using Supabase (true) or local fallback (false) */
  isUsingSupabase: boolean
}

// =============================================================================
// CONTEXT
// =============================================================================

const ContentContext = createContext<ContentContextType | undefined>(undefined)

// =============================================================================
// PROVIDER
// =============================================================================

interface ContentProviderProps {
  children: ReactNode
  /** Initial content (for SSR) */
  initialContent?: PortalContent
}

export function ContentProvider({ children, initialContent }: ContentProviderProps) {
  const [content, setContent] = useState<PortalContent>(initialContent || defaultContent)
  const [isLoading, setIsLoading] = useState(!initialContent)
  const [error, setError] = useState<string | null>(null)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)

  /**
   * Fetches content from Supabase via /api/portal
   * Falls back to /api/content (local JSON) if that fails
   */
  const refreshContent = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try Supabase first
      const response = await fetch('/api/portal', {
        cache: 'no-store',
      })
      
      if (!response.ok) {
        throw new Error('Supabase API failed')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // Smart merge: Use Supabase data when available, fall back to defaults for empty arrays
        const supabaseData = result.data
        const mergedContent: PortalContent = {
          ...defaultContent,
          // Use Supabase data if arrays have content, otherwise use defaults
          global: supabaseData.global || defaultContent.global,
          heroVideos: (supabaseData.heroVideos?.length > 0) ? supabaseData.heroVideos : defaultContent.heroVideos,
          heroBanners: (supabaseData.heroBanners?.length > 0) ? supabaseData.heroBanners : defaultContent.heroBanners,
          chips: (supabaseData.chips?.length > 0) ? supabaseData.chips : defaultContent.chips,
          blockSets: (supabaseData.blockSets?.length > 0) ? supabaseData.blockSets : defaultContent.blockSets,
          newsCarousel: (supabaseData.newsCarousel?.length > 0) ? supabaseData.newsCarousel : defaultContent.newsCarousel,
          discovery: (supabaseData.discovery?.places?.length > 0) ? supabaseData.discovery : defaultContent.discovery,
          editorsPicks: (supabaseData.editorsPicks?.length > 0) ? supabaseData.editorsPicks : defaultContent.editorsPicks,
          playAndWin: supabaseData.playAndWin || defaultContent.playAndWin,
          games: supabaseData.games || defaultContent.games,
          footer: supabaseData.footer || defaultContent.footer,
          utilities: supabaseData.utilities || defaultContent.utilities,
        }
        setContent(mergedContent)
        setIsUsingSupabase(true)
        console.log('[ContentContext] Loaded from Supabase (merged with defaults)')
        return
      }
      throw new Error(result.error || 'Invalid response')
    } catch (supabaseErr) {
      console.warn('[ContentContext] Supabase failed, trying local fallback:', supabaseErr)
      
      // Fallback to local JSON API
      try {
        const fallbackResponse = await fetch('/api/content', {
          cache: 'no-store',
        })
        
        if (!fallbackResponse.ok) {
          throw new Error('Local API also failed')
        }
        
        const fallbackResult = await fallbackResponse.json()
        
        if (fallbackResult.success && fallbackResult.data) {
          setContent(fallbackResult.data)
          setIsUsingSupabase(false)
          return
        }
        throw new Error(fallbackResult.error || 'Invalid fallback response')
      } catch (fallbackErr) {
        const message = fallbackErr instanceof Error ? fallbackErr.message : 'Failed to load content'
        setError(message)
        console.error('[ContentContext] Both APIs failed:', fallbackErr)
        // Keep using default content
        setIsUsingSupabase(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Updates a specific section of content
   */
  const updateSection = useCallback(async <K extends keyof PortalContent>(
    section: K,
    data: PortalContent[K]
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          data,
          fullReplace: true, // Replace the entire section
        }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setContent(result.data)
        return true
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (err) {
      console.error('[ContentContext] Error updating section:', err)
      return false
    }
  }, [])

  /**
   * Updates the entire content
   */
  const updateContent = useCallback(async (data: Partial<PortalContent>): Promise<boolean> => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setContent(result.data)
        return true
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (err) {
      console.error('[ContentContext] Error updating content:', err)
      return false
    }
  }, [])

  // Load content on mount
  useEffect(() => {
    if (!initialContent) {
      refreshContent()
    }
  }, [initialContent, refreshContent])

  const value: ContentContextType = {
    content,
    isLoading,
    error,
    refreshContent,
    updateSection,
    updateContent,
    isUsingSupabase,
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access content context
 */
export function useContent(): ContentContextType {
  const context = useContext(ContentContext)
  
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  
  return context
}

/**
 * Hook to access a specific section of content
 */
export function useContentSection<K extends keyof PortalContent>(section: K): {
  data: PortalContent[K]
  isLoading: boolean
  update: (data: PortalContent[K]) => Promise<boolean>
} {
  const { content, isLoading, updateSection } = useContent()
  
  return {
    data: content[section] as PortalContent[K],
    isLoading,
    update: (data: PortalContent[K]) => updateSection(section, data),
  }
}
