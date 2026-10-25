import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  API_BASE_URL,
  getPopularManga,
  getLatestManga,
  searchManga,
  getMangaDetail,
  getMangaChapters,
  getChapterPages,
  fetchHomeData,
  fetchMangaFullDetail,
  fetchChapterFullData,
  toMangaCard,
} from './lib/api.ts';
import { makeCacheHeaders, CACHE_TTL } from './lib/cache.ts';
import { validateSlug, validatePage, validateQuery, isAllowedHost } from './lib/validation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(express.json());

  // API Route: GET /api/home (Consolidated home data)
  app.get('/api/home', async (_req: Request, res: Response) => {
    try {
      const data = await fetchHomeData();
      const headers = makeCacheHeaders(CACHE_TTL.HOME);
      res.set(headers);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('Error in /api/home:', err.message);
      return res.status(502).json({
        success: false,
        error: err.message || 'Gagal memuat data beranda dari sumber',
      });
    }
  });

  // API Route: GET /api/manga/popular?page=1
  app.get('/api/manga/popular', async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? validatePage(req.query.page) : 1;
      const data = await getPopularManga(page);
      const headers = makeCacheHeaders(CACHE_TTL.CATALOG);
      res.set(headers);
      return res.json(data);
    } catch (err: any) {
      console.error('Error in /api/manga/popular:', err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // API Route: GET /api/manga/latest?page=1
  app.get('/api/manga/latest', async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? validatePage(req.query.page) : 1;
      const data = await getLatestManga(page);
      const headers = makeCacheHeaders(CACHE_TTL.CATALOG);
      res.set(headers);
      return res.json(data);
    } catch (err: any) {
      console.error('Error in /api/manga/latest:', err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // API Route: GET /api/manga/search?q=...&page=...
  app.get('/api/manga/search', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? validateQuery(req.query.q) : '';
      const page = req.query.page ? validatePage(req.query.page) : 1;
      const data = await searchManga(q, page);
      const headers = makeCacheHeaders(CACHE_TTL.SEARCH);
      res.set(headers);
      return res.json(data);
    } catch (err: any) {
      console.error('Error in /api/manga/search:', err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // API Route: GET /api/manga/chapter/:chapterId/pages
  app.get('/api/manga/chapter/:chapterId/pages', async (req: Request, res: Response) => {
    try {
      const chapterId = req.params.chapterId;
      const data = await getChapterPages(chapterId);
      const headers = makeCacheHeaders(CACHE_TTL.CHAPTER);
      res.set(headers);
      return res.json(data);
    } catch (err: any) {
      console.error(`Error in /api/manga/chapter/${req.params.chapterId}/pages:`, err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // API Route: GET /api/manga/:mangaId/chapters
  app.get('/api/manga/:mangaId/chapters', async (req: Request, res: Response) => {
    try {
      const mangaId = req.params.mangaId;
      const data = await getMangaChapters(mangaId);
      const headers = makeCacheHeaders(CACHE_TTL.DETAIL);
      res.set(headers);
      return res.json(data);
    } catch (err: any) {
      console.error(`Error in /api/manga/${req.params.mangaId}/chapters:`, err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // API Route: GET /api/manga/:mangaId
  app.get('/api/manga/:mangaId', async (req: Request, res: Response) => {
    try {
      const mangaId = req.params.mangaId;
      const data = await fetchMangaFullDetail(mangaId);
      const headers = makeCacheHeaders(CACHE_TTL.DETAIL);
      res.set(headers);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error(`Error in /api/manga/${req.params.mangaId}:`, err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // Compatibility Route: GET /api/manga?q=...&page=...
  app.get('/api/manga', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? validateQuery(req.query.q) : undefined;
      const page = req.query.page ? validatePage(req.query.page) : 1;

      const raw = q ? await searchManga(q, page) : await getLatestManga(page);
      const cards = (raw.data?.mangas || []).map((m) => toMangaCard(m));

      const headers = makeCacheHeaders(CACHE_TTL.CATALOG);
      res.set(headers);
      return res.json({
        success: true,
        data: {
          manga: cards,
          hasNextPage: raw.data?.hasNextPage || false,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/manga:', err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // Compatibility Route: GET /api/chapter/:slug
  app.get('/api/chapter/:slug', async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const data = await fetchChapterFullData(slug);
      const headers = makeCacheHeaders(CACHE_TTL.CHAPTER);
      res.set(headers);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error(`Error in /api/chapter/${req.params.slug}:`, err.message);
      return res.status(502).json({ success: false, error: err.message });
    }
  });

  // Image Proxy: GET /api/manga/image?url=... and /api/image-proxy?url=...
  const handleImageProxy = async (req: Request, res: Response) => {
    try {
      const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
      if (!rawUrl || !isAllowedHost(rawUrl)) {
        return res.status(400).send('Invalid or forbidden image host');
      }

      // Forward to apis.louiv.me/api/manga/image
      const targetUrl = new URL('/api/manga/image', API_BASE_URL);
      targetUrl.searchParams.set('url', rawUrl);

      const imgRes = await fetch(targetUrl.toString());

      if (!imgRes.ok) {
        return res.status(imgRes.status).send('Upstream image error');
      }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

      const arrayBuffer = await imgRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      return res.status(500).send('Proxy error');
    }
  };

  app.get('/api/manga/image', handleImageProxy);
  app.get('/api/image-proxy', handleImageProxy);

  // Frontend integration: Vite middleware in dev, express.static in prod
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`iComic Server running on port ${PORT} (production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
