import { NextRequest, NextResponse } from 'next/server';
import { searchManga, getLatestManga, toMangaCard } from '@/lib/api';
import { makeCacheHeaders, CACHE_TTL } from '@/lib/cache';
import { validateQuery, validatePage } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qParam = searchParams.get('q');
    const pageParam = searchParams.get('page');

    const q = qParam ? validateQuery(qParam) : undefined;
    const page = pageParam ? validatePage(pageParam) : 1;

    const raw = q ? await searchManga(q, page) : await getLatestManga(page);
    const cards = (raw.data?.mangas || []).map((m) => toMangaCard(m));

    const headers = makeCacheHeaders(CACHE_TTL.CATALOG);
    return NextResponse.json(
      {
        success: true,
        data: {
          manga: cards,
          hasNextPage: raw.data?.hasNextPage || false,
        },
      },
      { status: 200, headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memuat katalog' },
      { status: 502 }
    );
  }
}
