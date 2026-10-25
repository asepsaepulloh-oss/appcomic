import { NextResponse } from 'next/server';
import { fetchHomeData } from '@/lib/api';
import { makeCacheHeaders, CACHE_TTL } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchHomeData();
    const headers = makeCacheHeaders(CACHE_TTL.HOME);
    return NextResponse.json({ success: true, data }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memuat beranda' },
      { status: 502 }
    );
  }
}
