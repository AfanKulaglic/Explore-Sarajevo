// Activity logging utility with device tracking
// Use this to log user actions throughout the CMS

import { ACTION_TYPES, ActionType } from '@/lib/config/entities';
import crypto from 'crypto';

interface DeviceInfo {
  userAgent: string;
  ip?: string;
  deviceHash: string; // Anonymized device fingerprint
}

interface LogActivityParams {
  userId?: string;
  userEmail?: string;
  action: ActionType;
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  deviceInfo?: DeviceInfo;
}

/**
 * Generate an anonymized device hash from user agent and IP
 * This creates a consistent but non-reversible identifier for tracking
 */
export function generateDeviceHash(userAgent: string, ip: string = 'unknown'): string {
  // Create a hash from user agent + IP (anonymized)
  const data = `${userAgent}::${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Extract device info from request headers (server-side)
 */
export function extractDeviceInfo(request: Request): DeviceInfo {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
  
  return {
    userAgent,
    ip,
    deviceHash: generateDeviceHash(userAgent, ip),
  };
}

/**
 * Parse user agent to get device/browser info
 */
export function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';
  
  // Browser detection
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
  
  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  // Device type detection
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile';
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';
  
  return { browser, os, device };
}

/**
 * Log a user activity to the database (client-side call)
 * For server-side logging, use logActivityServer
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await fetch('/api/cms/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: params.userId,
        user_email: params.userEmail,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_name: params.entityName,
        changes: params.changes,
        metadata: params.metadata,
        device_hash: params.deviceInfo?.deviceHash,
        user_agent: params.deviceInfo?.userAgent,
        ip_address: params.deviceInfo?.ip,
      }),
    });
  } catch (error) {
    // Silently fail - we don't want logging failures to break the app
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get a human-readable action name
 */
export function getActionName(action: ActionType): string {
  return ACTION_TYPES[action]?.name || action;
}

/**
 * Get the color class for an action
 */
export function getActionColor(action: ActionType): string {
  return ACTION_TYPES[action]?.color || 'gray';
}
