import { NextRequest, NextResponse } from 'next/server';
import { fetchChapterFullData } from '@/lib/api';
import { makeCacheHeaders, CACHE_TTL } from '@/lib/cache';
import { validateSlug } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: rawSlug } = await params;
    const slug = validateSlug(rawSlug);
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug chapter tidak valid' }, { status: 400 });
    }

    const data = await fetchChapterFullData(slug);
    const headers = makeCacheHeaders(CACHE_TTL.CHAPTER);
    return NextResponse.json({ success: true, data }, { status: 200, headers });
  } catch (err: any) {
    const status = err.message?.includes('404') ? 404 : 502;
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memuat chapter' },
      { status }
    );
  }
}
