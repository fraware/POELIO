/**
 * Reject accidental alterations of the only curated public literary fixture.
 *
 * This is a change-control check, not copyright clearance or an adversarial
 * security boundary. Updating the reviewed hash requires explicit code review.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const fixture = readFileSync(new URL('../src/episode.ts', import.meta.url));
const expected = readFileSync(new URL('../approved-demo.blobsha', import.meta.url), 'utf8').trim();
if (!/^[0-9a-f]{40}$/.test(expected)) {
  throw new Error('Malformed reviewed fixture identity');
}
const actual = createHash('sha1')
  .update(Buffer.from('blob ' + fixture.byteLength + '\0', 'utf8'))
  .update(fixture)
  .digest('hex');
if (actual !== expected) {
  throw new Error('Public episode source differs from the reviewed fixture. Do not build or publish until editorially approved.');
}
console.log('Public teaching fixture matches reviewed Git blob identity.');
