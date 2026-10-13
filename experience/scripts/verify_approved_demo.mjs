/**
 * Check exact reviewed Git blob identities for both public prose fixtures.
 *
 * Change control for curated text, not licensing, security proof, or literary
 * evaluation. Updating a fixture and its pin requires human editorial review.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const fixtures = [
  ['../src/episode.ts', '../approved-demo.blobsha'],
  ['../src/permutation.ts', '../approved-permutation.blobsha']
];

for (const [source, reference] of fixtures) {
  const bytes = readFileSync(new URL(source, import.meta.url));
  const expected = readFileSync(new URL(reference, import.meta.url), 'utf8').trim();
  if (!/^[0-9a-f]{40}$/.test(expected)) {
    throw new Error('Malformed reviewed fixture identity for ' + source);
  }
  const actual = createHash('sha1')
    .update(Buffer.from('blob ' + bytes.byteLength + '\0', 'utf8'))
    .update(bytes).digest('hex');
  if (actual !== expected) {
    throw new Error('Public fixture changed: ' + source + '. Explicit review is necessary before distribution.');
  }
}
console.log('Both public literary fixtures match pinned source identities.');
