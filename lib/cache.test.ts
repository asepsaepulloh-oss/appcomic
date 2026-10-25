import test from 'node:test';
import assert from 'node:assert/strict';
import { serverCache, makeCacheHeaders, CACHE_TTL } from './cache.ts';

test('serverCache stores and retrieves values within TTL', () => {
  serverCache.set('test_key', { foo: 'bar' }, 10);
  const val = serverCache.get<{ foo: string }>('test_key');
  assert.deepEqual(val, { foo: 'bar' });
});

test('serverCache returns null for expired keys', async () => {
  serverCache.set('expire_key', 'quick', 0.05); // 50ms
  assert.equal(serverCache.get('expire_key'), 'quick');
  
  await new Promise(r => setTimeout(r, 70));
  assert.equal(serverCache.get('expire_key'), null);
});

test('makeCacheHeaders produces valid cache-control string', () => {
  const headers = makeCacheHeaders(300);
  assert.equal(headers['Cache-Control'], 'public, s-maxage=300, stale-while-revalidate=150');
  assert.equal(headers['Content-Type'], 'application/json');
});

test('CACHE_TTL constants match requirement specification', () => {
  assert.equal(CACHE_TTL.HOME, 300);
  assert.equal(CACHE_TTL.CATALOG, 180);
  assert.equal(CACHE_TTL.DETAIL, 600);
  assert.equal(CACHE_TTL.CHAPTER, 1800);
});
