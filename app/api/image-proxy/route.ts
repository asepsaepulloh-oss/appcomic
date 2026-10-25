import { NextRequest, NextResponse } from 'next/server';
import { isAllowedHost } from '@/lib/validation';
import { API_BASE_URL } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');

    if (!rawUrl || !isAllowedHost(rawUrl)) {
      return new NextResponse('Invalid or forbidden image host', { status: 400 });
    }

    const targetUrl = new URL('/api/manga/image', API_BASE_URL);
    targetUrl.searchParams.set('url', rawUrl);

    const imgRes = await fetch(targetUrl.toString());

    if (!imgRes.ok) {
      return new NextResponse('Upstream image error', { status: imgRes.status });
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse('Proxy error', { status: 500 });
  }
}
