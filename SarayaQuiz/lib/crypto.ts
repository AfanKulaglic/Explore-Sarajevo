import crypto from 'crypto'

/**
 * Hash a device ID with the secret pepper for privacy-safe storage
 */
export function hashDeviceId(deviceId: string): string {
  const pepper = process.env.DEVICE_ID_PEPPER || ''
  return crypto
    .createHash('sha256')
    .update(deviceId + pepper)
    .digest('hex')
}

/**
 * Hash an email with the secret pepper for analytics grouping
 */
export function hashEmail(email: string): string {
  const pepper = process.env.EMAIL_PEPPER || ''
  const normalized = email.toLowerCase().trim()
  return crypto
    .createHash('sha256')
    .update(normalized + pepper)
    .digest('hex')
}

/**
 * Get a short hash (first 8 characters) for display purposes
 */
export function shortHash(hash: string): string {
  return hash.substring(0, 8)
}
