import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, hashDeviceId, updateDeviceRecord } from '@/lib/quiz-rewards'

/**
 * POST /api/quiz/analytics/track
 * Track an analytics event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      event_type,
      event_data,
      quiz_post_id,
      attempt_id,
      question_id,
      rawDeviceId,
      account_id,
      session_id,
      platform,
      referrer,
      user_agent,
    } = body

    if (!event_type || !rawDeviceId) {
      return NextResponse.json(
        { error: 'event_type and rawDeviceId are required' },
        { status: 400 }
      )
    }

    const device_hash = hashDeviceId(rawDeviceId)

    // Track the event
    await trackEvent({
      event_type,
      event_data: event_data || {},
      quiz_post_id,
      attempt_id,
      question_id,
      device_hash,
      account_id,
      session_id,
      platform,
      referrer,
      user_agent,
    })

    // Update device record on certain events
    if (['quiz_start', 'login', 'page_view'].includes(event_type)) {
      await updateDeviceRecord(device_hash, account_id, {
        user_agent,
        platform,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking event:', error)
    // Don't return error - analytics failures shouldn't break the app
    return NextResponse.json({ success: false })
  }
}

/**
 * GET /api/quiz/analytics/track
 * Beacon-style tracking (for sendBeacon)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const event_type = searchParams.get('event_type')
    const rawDeviceId = searchParams.get('deviceId')
    const quiz_post_id = searchParams.get('quizId')
    const account_id = searchParams.get('account_id')
    const session_id = searchParams.get('session_id')

    if (!event_type || !rawDeviceId) {
      return new Response(null, { status: 204 })
    }

    const device_hash = hashDeviceId(rawDeviceId)

    await trackEvent({
      event_type,
      event_data: Object.fromEntries(searchParams.entries()),
      quiz_post_id: quiz_post_id || undefined,
      device_hash,
      account_id: account_id || undefined,
      session_id: session_id || undefined,
    })

    // Return 1x1 transparent pixel for img beacon
    return new Response(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    return new Response(null, { status: 204 })
  }
}
