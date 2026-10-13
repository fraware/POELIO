/**
 * Strict public-only offline shell builder.
 *
 * The release build is deliberately limited to two known HTML documents
 * and a single hashed JavaScript/CSS pair. Never auto-cache extra files.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DIST = join(projectDir, 'dist');
const ASSET_PATTERN = /^index-[a-zA-Z0-9_-]+\.(js|css)$/;
export const CACHE_PREFIX = 'poelio-approved-public-v1-';

function regularNames(folder) {
  return readdirSync(folder, { withFileTypes: true }).map(entry => {
    if (!entry.isFile()) throw new Error('Unsupported public asset: ' + entry.name);
    return entry.name;
  }).sort();
}

export function inspectBuild(dist = DEFAULT_DIST) {
  const top = readdirSync(dist, { withFileTypes: true });
  const names = top.map(x => x.name).sort();
  if (names.join('|') !== 'assets|facilitator.html|index.html' ||
      top.some(x => x.name === 'assets' ? !x.isDirectory() : !x.isFile())) {
    throw new Error('Unexpected root entries in public build: ' + names.join(', '));
  }
  const assets = regularNames(join(dist, 'assets'));
  if (assets.length !== 2 || assets.some(name => !ASSET_PATTERN.test(name)) ||
      assets.filter(name => name.endsWith('.js')).length !== 1 ||
      assets.filter(name => name.endsWith('.css')).length !== 1) {
    throw new Error('Unexpected public asset inventory: ' + assets.join(', '));
  }
  return ['index.html', 'facilitator.html', ...assets.map(x => 'assets/' + x)];
}

export function renderOfflineShell(dist = DEFAULT_DIST) {
  const inventory = inspectBuild(dist);
  const hash = createHash('sha256');
  for (const path of inventory) {
    const bytes = readFileSync(join(dist, path));
    hash.update(path + '\0' + bytes.byteLength + '\0');
    hash.update(bytes);
  }
  const cache = CACHE_PREFIX + hash.digest('hex').slice(0, 24);
  const allowed = inventory.map(path => './' + path);
  const worker = [
    '/* POELIO PUBLIC SHELL ONLY: never cache writing, manuscripts or telemetry. */',
    "'use strict';",
    'const CACHE = ' + JSON.stringify(cache) + ';',
    'const PREFIX = ' + JSON.stringify(CACHE_PREFIX) + ';',
    'const ASSETS = ' + JSON.stringify(allowed) + ';',
    'const BASE = new URL(self.registration.scope).pathname;',
    "const INDEX = new URL('./index.html', self.registration.scope).href;",
    "const GUIDE = new URL('./facilitator.html', self.registration.scope).href;",
    'const URLS = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));',
    "self.addEventListener('install', event => {",
    '  event.waitUntil((async () => {',
    '    const cache = await caches.open(CACHE);',
    '    await cache.addAll([...URLS]);',
    '    await self.skipWaiting();',
    '  })());',
    '});',
    "self.addEventListener('activate', event => {",
    '  event.waitUntil((async () => {',
    '    for (const key of await caches.keys()) {',
    '      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);',
    '    }',
    '    await self.clients.claim();',
    '  })());',
    '});',
    "self.addEventListener('fetch', event => {",
    '  const request = event.request;',
    "  if (request.method !== 'GET') return;",
    '  const url = new URL(request.url);',
    '  if (url.origin !== self.location.origin) return;',
    "  const isIndex = url.pathname === BASE || url.pathname === BASE + 'index.html';",
    "  const isGuide = url.pathname === BASE + 'facilitator.html';",
    "  if (request.mode === 'navigate' && (isIndex || isGuide)) {",
    '    event.respondWith((async () => {',
    '      const cache = await caches.open(CACHE);',
    '      // Serve the fully approved, versioned public reading shell before networking.',
    '      // Updates use an independently installed new worker with a new content hash.',
    '      const approved = await cache.match(isGuide ? GUIDE : INDEX);',
    '      return approved || fetch(request);',
    '    })());',
    '    return;',
    '  }',
    '  if (URLS.has(url.href)) {',
    '    event.respondWith((async () => {',
    '      const cache = await caches.open(CACHE);',
    '      // Only approved exact asset URLs reach this branch; ignore host Vary metadata.',
    '      return (await cache.match(url.href, {ignoreVary:true})) || fetch(request);',
    '    })());',
    '  }',
    '});'
  ].join('\n') + '\n';
  return { cache, inventory, worker };
}

function main() {
  const {inventory,worker,cache} = renderOfflineShell();
  writeFileSync(join(DEFAULT_DIST,'sw.js'),worker,{flag:'wx',mode:0o644});
  const names=readdirSync(DEFAULT_DIST).sort().join('|');
  if(names!=='assets|facilitator.html|index.html|sw.js'){
    throw new Error('Unexpected public files after adding worker');
  }
  console.log('Offline public shell verified:',inventory.length,'approved assets;',cache);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
