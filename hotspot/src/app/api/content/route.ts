/**
 * Content API Route
 * 
 * Handles reading and writing portal content data.
 * Uses a JSON file for persistence (can be replaced with Supabase later).
 * 
 * GET /api/content - Get current content
 * POST /api/content - Update content (partial or full)
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { PortalContent } from '@/types/content'

// =============================================================================
// CONFIGURATION
// =============================================================================

// Path to the content data file
const DATA_DIR = path.join(process.cwd(), 'data')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Ensures the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

/**
 * Gets the default content from the static file
 */
async function getDefaultContent(): Promise<PortalContent> {
  // Import the default content
  const { portalContent } = await import('@/data/content')
  return portalContent
}

/**
 * Reads the current content from the JSON file
 * Falls back to default content if file doesn't exist
 */
async function readContent(): Promise<PortalContent> {
  try {
    if (existsSync(CONTENT_FILE)) {
      const data = await readFile(CONTENT_FILE, 'utf-8')
      return JSON.parse(data) as PortalContent
    }
  } catch (error) {
    console.error('[Content API] Error reading content file:', error)
  }
  
  // Return default content if file doesn't exist or has errors
  return getDefaultContent()
}

/**
 * Writes content to the JSON file
 */
async function writeContent(content: PortalContent): Promise<void> {
  await ensureDataDir()
  await writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
}

/**
 * Deep merges two objects
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target } as T
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      const sourceVal = source[key]
      const targetVal = target[key as keyof T]
      
      if (
        typeof sourceVal === 'object' &&
        sourceVal !== null &&
        !Array.isArray(sourceVal) &&
        typeof targetVal === 'object' &&
        targetVal !== null &&
        !Array.isArray(targetVal)
      ) {
        // Recursively merge objects
        (result as Record<string, unknown>)[key] = deepMerge(
          targetVal as object,
          sourceVal as object
        )
      } else {
        // Direct assignment for primitives and arrays
        (result as Record<string, unknown>)[key] = sourceVal
      }
    }
  }
  
  return result
}

// =============================================================================
// GET - Read Content
// =============================================================================

export async function GET() {
  try {
    const content = await readContent()
    
    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error('[Content API] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read content' },
      { status: 500 }
    )
  }
}

// =============================================================================
// POST - Update Content
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, data, fullReplace = false } = body
    
    // Validate request
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      )
    }
    
    // Read current content
    const currentContent = await readContent()
    
    let updatedContent: PortalContent
    
    if (section) {
      // Update specific section
      const sectionKey = section as keyof PortalContent
      const currentSection = currentContent[sectionKey]
      updatedContent = {
        ...currentContent,
        [section]: fullReplace ? data : (
          Array.isArray(data) ? data : deepMerge(
            (currentSection && typeof currentSection === 'object' ? currentSection : {}) as object,
            data as object
          )
        ),
      }
    } else {
      // Update entire content
      updatedContent = fullReplace ? data : deepMerge(currentContent as object, data as object) as PortalContent
    }
    
    // Write updated content
    await writeContent(updatedContent)
    
    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent,
    })
  } catch (error) {
    console.error('[Content API] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    )
  }
}
