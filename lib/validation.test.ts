import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSlug, validatePage, validateQuery, isAllowedHost, sanitizeUrl } from './validation.ts';

test('validateSlug accepts valid slugs', () => {
  assert.equal(validateSlug('lookism'), 'lookism');
  assert.equal(validateSlug('lookism-chapter-623'), 'lookism-chapter-623');
  assert.equal(validateSlug('solo_leveling_v2'), 'solo_leveling_v2');
});

test('validateSlug rejects malicious or invalid inputs', () => {
  assert.equal(validateSlug('../etc/passwd'), null);
  assert.equal(validateSlug('lookism/../../secret'), null);
  assert.equal(validateSlug('http://evil.com/payload'), null);
  assert.equal(validateSlug('<script>alert(1)</script>'), null);
  assert.equal(validateSlug(''), null);
  assert.equal(validateSlug(null), null);
  assert.equal(validateSlug(undefined), null);
  assert.equal(validateSlug(123), null);
});

test('validatePage clamps page numbers correctly', () => {
  assert.equal(validatePage(1), 1);
  assert.equal(validatePage('5'), 5);
  assert.equal(validatePage(0), 1);
  assert.equal(validatePage(-10), 1);
  assert.equal(validatePage(99999), 1000);
  assert.equal(validatePage('invalid'), 1);
});

test('validateQuery sanitizes search terms', () => {
  assert.equal(validateQuery('  lookism  '), 'lookism');
  assert.equal(validateQuery('a'.repeat(200)).length, 100);
  assert.equal(validateQuery(null), '');
});

test('isAllowedHost verifies permitted upstream domains', () => {
  assert.equal(isAllowedHost('https://apis.louiv.me/api/manga/popular'), true);
  assert.equal(isAllowedHost('https://assets.shngm.id/thumbnail/cover/test.jpg'), true);
  assert.equal(isAllowedHost('https://app.shinigami.asia/series/xyz'), true);
  assert.equal(isAllowedHost('https://komiku-rest-api-one.vercel.app/rekomendasi'), true);
  assert.equal(isAllowedHost('https://thumbnail.komiku.org/img/cover.jpg'), true);
  assert.equal(isAllowedHost('https://img.komiku.org/upload/chapter.webp'), true);
  assert.equal(isAllowedHost('https://evil.com/hack'), false);
  assert.equal(isAllowedHost('javascript:alert(1)'), false);
});

test('sanitizeUrl allows safe paths and valid hosts', () => {
  assert.equal(sanitizeUrl('/api/view/xyz'), '/api/view/xyz');
  assert.equal(sanitizeUrl('//evil.com/exploit'), null);
  assert.equal(sanitizeUrl('https://assets.shngm.id/cover.webp'), 'https://assets.shngm.id/cover.webp');
  assert.equal(sanitizeUrl('https://attacker.org/image.png'), null);
});
