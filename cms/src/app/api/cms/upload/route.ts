import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db/supabase';

const DEFAULT_BUCKET = 'sarayaconnect-es';

// POST /api/cms/upload - Upload a file
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bucket = (formData.get('bucket') as string | null) || DEFAULT_BUCKET;
    const folder = (formData.get('folder') as string | null) || '';

    // Generate unique filename and build storage path
    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    console.log(`[Upload] ${bucket}/${filePath} (${file.size} bytes)`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Supabase error:', uploadError.message);
      return NextResponse.json({
        error: 'Failed to upload file',
        details: uploadError.message,
      }, { status: 500 });
    }

    console.log('[Upload] Success:', uploadData?.path);

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error('[Upload] Unexpected error:', error);
    return NextResponse.json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
