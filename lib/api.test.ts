import test from 'node:test';
import assert from 'node:assert/strict';
import { getImageProxyUrl, toMangaCard, API_BASE_URL } from './api.ts';

test('getImageProxyUrl returns unchanged if already proxied', () => {
  const proxied1 = 'https://apis.louiv.me/api/manga/image?url=https%3A%2F%2Fassets.shngm.id%2Fcover.jpg';
  assert.equal(getImageProxyUrl(proxied1), proxied1);

  const proxied2 = '/api/manga/image?url=https%3A%2F%2Fassets.shngm.id%2Fcover.jpg';
  assert.equal(getImageProxyUrl(proxied2), proxied2);

  const proxied3 = '/api/image-proxy?url=test';
  assert.equal(getImageProxyUrl(proxied3), proxied3);
});

test('getImageProxyUrl wraps original image URL without double-encoding', () => {
  const orig = 'https://assets.shngm.id/thumbnail/cover/05e8dbb20620.jpeg';
  const result = getImageProxyUrl(orig);
  assert.ok(result.startsWith(`${API_BASE_URL}/api/manga/image?url=`));
  assert.ok(result.includes('assets.shngm.id'));
});

test('getImageProxyUrl handles empty or invalid fallback', () => {
  assert.equal(getImageProxyUrl(''), '/og-image.png');
});

test('toMangaCard properly maps MangaItem to MangaCard', () => {
  const item = {
    title: 'Lookism',
    thumbnail: 'https://assets.shngm.id/thumbnail/cover/05e8dbb20620.jpeg',
    url: 'a1529ab1-5e71-43d6-bb77-754cb6338b67',
    mangaUrl: 'https://app.shinigami.asia/series/a1529ab1-5e71-43d6-bb77-754cb6338b67',
  };

  const card = toMangaCard(item, 'HOT');
  assert.equal(card.title, 'Lookism');
  assert.equal(card.slug, 'a1529ab1-5e71-43d6-bb77-754cb6338b67');
  assert.equal(card.badge, 'HOT');
  assert.ok(card.thumb.includes('assets.shngm.id'));
});
