import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractKomikuSlug,
  getKomikuImageProxyUrl,
  toKomikuMangaCard,
  KOMIKU_BASE_URL,
} from './komiku.ts';

test('extractKomikuSlug extracts last path segment correctly', () => {
  assert.equal(extractKomikuSlug('/detail-komik/kidnapped-dragons'), 'kidnapped-dragons');
  assert.equal(extractKomikuSlug('https://komiku.org/manga/solo-leveling/'), 'solo-leveling');
  assert.equal(extractKomikuSlug('reality-quest'), 'reality-quest');
  assert.equal(extractKomikuSlug(''), '');
});

test('getKomikuImageProxyUrl proxies original url and prevents double encoding', () => {
  const orig = 'https://img.komiku.org/upload/chapter1.webp';
  const proxied = getKomikuImageProxyUrl(orig);
  assert.equal(proxied, `${KOMIKU_BASE_URL}/image-proxy?url=${encodeURIComponent(orig)}`);

  // Idempotent: does not double proxy
  const doubleCall = getKomikuImageProxyUrl(proxied);
  assert.equal(doubleCall, proxied);

  // Fallback for null or empty
  assert.equal(getKomikuImageProxyUrl(''), '/og-image.png');
  assert.equal(getKomikuImageProxyUrl(null as any), '/og-image.png');
});

test('toKomikuMangaCard normalizes Komiku item to MangaCard', () => {
  const raw = {
    title: 'Kidnapped Dragons',
    thumbnail: 'https://thumbnail.komiku.org/img.jpg',
    apiDetailLink: '/detail-komik/kidnapped-dragons',
    type: 'Manhwa',
  };

  const card = toKomikuMangaCard(raw);
  assert.equal(card.title, 'Kidnapped Dragons');
  assert.equal(card.slug, 'kidnapped-dragons');
  assert.equal(card.type, 'Manhwa');
  assert.equal(card.source, 'komiku');
  assert.equal(card.badge, 'Komiku');
  assert.equal(card.thumb.includes('image-proxy?url='), true);
});
