// Server-side activity logging utility
// Use this in API routes to log user actions with device tracking

import { sc } from '@/lib/db/supabase';
import crypto from 'crypto';

export type ActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'upload' | 'reorder' | 'view';

interface DeviceInfo {
  userAgent: string;
  ip: string;
  deviceHash: string;
  browser: string;
  os: string;
  device: string;
}

interface LogActivityParams {
  request: Request;
  userId?: string;
  userEmail?: string;
  action: ActionType;
  entityType: string;
  entityId?: string | number;
  entityName?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Generate an anonymized device hash from user agent and IP
 */
function generateDeviceHash(userAgent: string, ip: string): string {
  const data = `${userAgent}::${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Parse user agent to get device/browser info
 */
function parseUserAgent(userAgent: string): {
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
 * Extract device info from request headers
 */
function extractDeviceInfo(request: Request): DeviceInfo {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
  const parsed = parseUserAgent(userAgent);
  
  return {
    userAgent,
    ip,
    deviceHash: generateDeviceHash(userAgent, ip),
    ...parsed,
  };
}

/**
 * Log activity directly to database (server-side)
 * Use this in API routes for reliable logging
 * 
 * @example
 * await logActivityServer({
 *   request,
 *   userId: user.id,
 *   userEmail: user.email,
 *   action: 'create',
 *   entityType: 'business',
 *   entityId: newBusiness.id,
 *   entityName: newBusiness.name,
 * });
 */
export async function logActivityServer(params: LogActivityParams): Promise<void> {
  try {
    const deviceInfo = extractDeviceInfo(params.request);
    
    await sc
      .from('cms_activity_logs')
      .insert({
        user_id: params.userId,
        user_email: params.userEmail,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId?.toString(),
        entity_name: params.entityName,
        changes: params.changes,
        metadata: {
          ...params.metadata,
          device: {
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            device: deviceInfo.device,
          },
        },
        device_hash: deviceInfo.deviceHash,
        user_agent: deviceInfo.userAgent,
        ip_address: deviceInfo.ip,
      });
  } catch (error) {
    // Silently fail - we don't want logging failures to break API operations
    console.error('Failed to log activity:', error);
  }
}

/**
 * Log login activity with device tracking
 */
export async function logLogin(request: Request, userId: string, userEmail: string): Promise<void> {
  await logActivityServer({
    request,
    userId,
    userEmail,
    action: 'login',
    entityType: 'session',
    entityName: 'User Login',
  });
}

/**
 * Log logout activity
 */
export async function logLogout(request: Request, userId: string, userEmail: string): Promise<void> {
  await logActivityServer({
    request,
    userId,
    userEmail,
    action: 'logout',
    entityType: 'session',
    entityName: 'User Logout',
  });
}
