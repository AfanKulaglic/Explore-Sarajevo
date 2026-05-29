/**
 * File Upload API Route
 * 
 * Handles file uploads for the admin panel and stores them in the public directory.
 * Supports videos, images, and documents with validation.
 * 
 * POST /api/upload - Upload a file
 * DELETE /api/upload - Delete a file
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import {
  FILE_CATEGORIES,
  FileCategory,
  generateUniqueFilename,
  getUploadUrl,
  detectFileCategory,
} from '@/lib/upload'

// =============================================================================
// CONFIGURATION
// =============================================================================

// Base directory for uploads (inside public folder)
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'public', 'uploads')

// Directory mapping for each file category
const CATEGORY_DIRS: Record<FileCategory, string> = {
  video: path.join(UPLOAD_BASE_DIR, 'videos'),
  image: path.join(UPLOAD_BASE_DIR, 'images'),
  document: path.join(UPLOAD_BASE_DIR, 'documents'),
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Ensures the upload directory exists
 * @param category - The file category
 */
async function ensureDirectoryExists(category: FileCategory): Promise<void> {
  const dir = CATEGORY_DIRS[category]
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

/**
 * Validates the uploaded file
 * @param file - The file to validate
 * @param allowedCategories - Optional array of allowed categories
 * @returns Validation result
 */
function validateUpload(
  file: File,
  allowedCategories?: FileCategory[]
): { valid: boolean; error?: string; category?: FileCategory } {
  const categories = allowedCategories || (Object.keys(FILE_CATEGORIES) as FileCategory[])
  
  // Detect file category from MIME type
  const category = detectFileCategory(file.type)
  
  if (!category || !categories.includes(category)) {
    const allowedExtensions = categories
      .flatMap(cat => FILE_CATEGORIES[cat].extensions)
      .join(', ')
    return {
      valid: false,
      error: `File type "${file.type}" not allowed. Accepted formats: ${allowedExtensions}`,
    }
  }
  
  // Check file size
  const maxSize = FILE_CATEGORIES[category].maxSize
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File too large. Maximum size for ${FILE_CATEGORIES[category].label} is ${maxSizeMB}MB`,
    }
  }
  
  return { valid: true, category }
}

// =============================================================================
// POST - Upload File
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const allowedCategoriesParam = formData.get('allowedCategories') as string | null
    
    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Parse allowed categories if provided
    let allowedCategories: FileCategory[] | undefined
    if (allowedCategoriesParam) {
      try {
        allowedCategories = JSON.parse(allowedCategoriesParam)
      } catch {
        // Ignore parse errors, use default (all categories)
      }
    }
    
    // Validate the file
    const validation = validateUpload(file, allowedCategories)
    if (!validation.valid || !validation.category) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }
    
    const category = validation.category
    
    // Ensure upload directory exists
    await ensureDirectoryExists(category)
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name)
    const filePath = path.join(CATEGORY_DIRS[category], uniqueFilename)
    
    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Generate public URL
    const publicUrl = getUploadUrl(category, uniqueFilename)
    
    // Return success response
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      category,
      size: file.size,
      mimeType: file.type,
    })
    
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// =============================================================================
// DELETE - Remove File
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { url } = body
    
    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No file URL provided' },
        { status: 400 }
      )
    }
    
    // Security check: only allow deleting files from uploads directory
    if (!url.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file URL' },
        { status: 400 }
      )
    }
    
    // Construct the file path
    const relativePath = url.replace(/^\//, '') // Remove leading slash
    const filePath = path.join(process.cwd(), 'public', relativePath)
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Delete the file
    await unlink(filePath)
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
    
  } catch (error) {
    console.error('[Upload API] Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
