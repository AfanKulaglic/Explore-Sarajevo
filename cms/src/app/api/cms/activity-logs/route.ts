import { NextRequest, NextResponse } from 'next/server';
import { sc } from '@/lib/db/supabase';
import { extractDeviceInfo, parseUserAgent } from '@/lib/activity-logger';

// GET - Fetch activity logs with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entity_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = sc
      .from('cms_activity_logs')
      .select(`
        *,
        user:cms_users(id, email, username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST - Create activity log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_email, action, entity_type, entity_id, entity_name, changes, metadata, device_hash, user_agent, ip_address } = body;

    if (!action || !entity_type) {
      return NextResponse.json(
        { error: 'Action and entity_type are required' },
        { status: 400 }
      );
    }

    // Extract device info from request if not provided
    const deviceInfo = extractDeviceInfo(request);
    const finalDeviceHash = device_hash || deviceInfo.deviceHash;
    const finalUserAgent = user_agent || deviceInfo.userAgent;
    const finalIpAddress = ip_address || deviceInfo.ip;
    
    // Parse user agent for readable device info
    const parsedDevice = parseUserAgent(finalUserAgent);

    const { data: log, error } = await sc
      .from('cms_activity_logs')
      .insert({
        user_id,
        user_email,
        action,
        entity_type,
        entity_id,
        entity_name,
        changes,
        metadata: {
          ...metadata,
          device: parsedDevice,
        },
        device_hash: finalDeviceHash,
        user_agent: finalUserAgent,
        ip_address: finalIpAddress,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
