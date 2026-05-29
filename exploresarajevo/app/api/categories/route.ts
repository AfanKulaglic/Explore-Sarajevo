import { NextRequest, NextResponse } from 'next/server';

// Server-side API route to proxy category requests
// This avoids CORS issues since the client calls this local endpoint
// and this endpoint fetches from the CMS server-to-server

const CMS_URL = process.env.CMS_URL || 'https://cms.saraya.solutions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    
    const url = all === 'true' 
      ? `${CMS_URL}/api/explore/public/categories?all=true`
      : `${CMS_URL}/api/explore/public/categories`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300, tags: ['categories'] },
    });

    if (!res.ok) {
      console.error(`Failed to fetch categories from CMS: ${res.status}`);
      return NextResponse.json([], { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying categories request:', error);
    return NextResponse.json([], { status: 500 });
  }
}
