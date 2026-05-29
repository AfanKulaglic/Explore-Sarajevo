/**
 * Universal File Upload Configuration and Utilities
 * 
 * This module provides configuration and helper functions for the file upload system.
 * It handles validation, file type detection, and URL generation.
 */

// =============================================================================
// FILE TYPE CONFIGURATION
// =============================================================================

/**
 * Allowed file types organized by category
 * Each category has its own size limit and allowed MIME types
 */
export const FILE_CATEGORIES = {
  video: {
    label: 'Video',
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.ogg', '.mov'],
  },
  image: {
    label: 'Image',
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  },
  document: {
    label: 'Document',
    maxSize: 20 * 1024 * 1024, // 20MB
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
  },
} as const

export type FileCategory = keyof typeof FILE_CATEGORIES

// =============================================================================
// UPLOAD DIRECTORIES
// =============================================================================

/**
 * Directory structure for uploaded files
 * Files are organized by type for easier management
 */
export const UPLOAD_DIRECTORIES = {
  video: '/uploads/videos',
  image: '/uploads/images',
  document: '/uploads/documents',
} as const

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  category?: FileCategory
}

/**
 * Validates a file against allowed types and size limits
 * @param file - The file to validate
 * @param allowedCategories - Optional array of allowed categories (defaults to all)
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  file: File,
  allowedCategories?: FileCategory[]
): ValidationResult {
  const categories = allowedCategories || (Object.keys(FILE_CATEGORIES) as FileCategory[])
  
  // Find matching category based on MIME type
  let matchedCategory: FileCategory | undefined
  
  for (const category of categories) {
    const config = FILE_CATEGORIES[category]
    if ((config.mimeTypes as readonly string[]).includes(file.type)) {
      matchedCategory = category
      break
    }
  }
  
  // Check if file type is allowed
  if (!matchedCategory) {
    const allowedExtensions = categories
      .flatMap(cat => FILE_CATEGORIES[cat].extensions)
      .join(', ')
    return {
      valid: false,
      error: `File type not allowed. Accepted formats: ${allowedExtensions}`,
    }
  }
  
  // Check file size
  const maxSize = FILE_CATEGORIES[matchedCategory].maxSize
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File too large. Maximum size for ${FILE_CATEGORIES[matchedCategory].label} is ${maxSizeMB}MB`,
    }
  }
  
  return {
    valid: true,
    category: matchedCategory,
  }
}

/**
 * Detects the category of a file based on its MIME type
 * @param mimeType - The MIME type of the file
 * @returns The file category or undefined if not recognized
 */
export function detectFileCategory(mimeType: string): FileCategory | undefined {
  for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
    if ((config.mimeTypes as readonly string[]).includes(mimeType)) {
      return category as FileCategory
    }
  }
  return undefined
}

// =============================================================================
// URL UTILITIES
// =============================================================================

/**
 * Generates a unique filename to prevent collisions
 * @param originalName - The original filename
 * @returns A unique filename with timestamp prefix
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  const baseName = originalName
    .substring(0, originalName.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9]/g, '-') // Sanitize filename
    .substring(0, 50) // Limit length
  
  return `${timestamp}-${random}-${baseName}${extension}`
}

/**
 * Gets the public URL for an uploaded file
 * @param category - The file category
 * @param filename - The filename
 * @returns The public URL path
 */
export function getUploadUrl(category: FileCategory, filename: string): string {
  return `${UPLOAD_DIRECTORIES[category]}/${filename}`
}

/**
 * Checks if a URL is an uploaded file (vs external URL)
 * @param url - The URL to check
 * @returns True if the URL points to an uploaded file
 */
export function isUploadedFile(url: string): boolean {
  return url.startsWith('/uploads/')
}

/**
 * Extracts the filename from an upload URL
 * @param url - The upload URL
 * @returns The filename or null if not an upload URL
 */
export function getFilenameFromUrl(url: string): string | null {
  if (!isUploadedFile(url)) return null
  return url.substring(url.lastIndexOf('/') + 1)
}

// =============================================================================
// FORMAT UTILITIES
// =============================================================================

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Gets accepted file extensions string for input element
 * @param categories - Array of file categories
 * @returns Comma-separated extensions string
 */
export function getAcceptString(categories: FileCategory[]): string {
  return categories
    .flatMap(cat => FILE_CATEGORIES[cat].extensions)
    .join(',')
}
