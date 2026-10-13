# POELIO — Literature-first experience (public demonstration)

This is a **publication-safe** React/TypeScript/Vite prototype containing two distinct, six-stage literary episodes.

Its first text, *Le Registre des clefs*, is an original, small teaching fixture. It is **not** an edition, excerpt, adaptation, or public release of the unpublished *La Relève*. Two curated passages are associated with specific canonical schedule configurations. The other twelve configurations have mathematical solutions but **no authored prose**; the interface says so.

The second text, *Les Quatre Témoins*, consists of **four unchanging, attributed original fragments**. The separate permutation engine enumerates all 24 possible orders, including 12 meeting a deliberately declared ordering rule. No passage is silently generated. This is a different literary mechanism, not a new realization of the original weekly-schedule model.

## Run

Requires Node.js 22.12+ and npm.

\`\`\`bash
cd experience
npm install
npm run typecheck
npm test
npm run build
npm run preview
\`\`\`

Open the local URL printed by Vite. For browser regression tests, run \`npx playwright install chromium\` once and then \`npm run test:e2e\` after building.

The six stages in each episode are Read, Question, Explore, Compare, Invent, and Reflect. Switch to the second episode with the dedicated button in the first episode header. The experience includes an independent, print-ready 60-minute facilitator guide at `/facilitator.html` and a pilot protocol in `../docs/WORKSHOP_PILOT.md`. The reader sees French prose with optional English interface translation. Public-episode drafts stay in per-tab sessionStorage and are downloadable by explicit action. Refreshing the same tab preserves them; Reset or closing the tab clears session notes in ordinary browser behavior. Private reviewer notes remain memory-only and clear on refresh. No accounts, server state, API calls, AI inference, telemetry, or automated literary-quality scores are implemented.

## Evidence boundaries

The finite model is imported from the existing repository source. CI independently enumerates all 256 assignments and the 14 minimum repairs. This **does not replay Lean proofs** or establish claims about narrative meaning. Manuscript provenance for the synthetic fixture is represented by explicit source module IDs; a private-edition importer with cryptographic source integrity and rights verification is still a separate requirement.

## Release boundary

The React build uses an original, in-repository public fixture only. Never replace that fixture with private literary materials or use a public web host to serve a private edition. A separate private-only SHA-256 source importer exists in the repository, but the public React app never loads private catalogs. An independently reviewed editorial edition, complete accessibility audit, empirical workshop evaluation, and proven literary-learning outcomes are **not complete**.

The initial standalone mathematical explorer at the repository root is retained for backwards compatibility; this experience is the next milestone toward the product specification.

## Quality verification

The browser suite now includes axe-core checks of multiple stages in both episodes, the printable facilitator guide, keyboard focus after stage changes, and HTML language reconciliation across episode transitions. Run it after building:

    npx playwright install chromium
    npm run test:e2e

See ../docs/ACCESSIBILITY_ACCEPTANCE.md for the manual tests still needed and ../docs/EDITORIAL_QUALITY_GATE.md for the independent literary review criteria. Automated checking is not a claim of WCAG certification or artistic quality.

## First-reading reviewer packets and static companions

Only the already approved **public original teaching fixtures** are exposed through these direct URLs, relative to the local Vite preview address:

- `/?review=register` — pre-explanation first reading of Le Registre des clefs, followed by an optional private editorial critique and explicit local export.
- `/?review=permutation` — pre-explanation reading of Les Quatre Témoins using its reviewed original fragment order.
- `/?companion=register` — complete, written, static explanation of the minimum-repair mechanism and its second authored realization.
- `/?companion=permutation` — complete, written, static explanation of fragment permutations with a different fixed reading order.

Do **not** send a static companion before obtaining a first-reading response. These are source-derived editorial instruments, not a finished controlled experiment, publisher-approved prose, or a way to distribute the unpublished La Relève. The review pages record no server-side notes. Direct responses and exported files stay under the participant's control. See `../docs/EDITORIAL_REVIEW_PROTOCOL.md` and `../docs/STATIC_COMPARISON_PROTOCOL.md`.


## Offline workshop operation — PUBLIC materials only

After a production build, the generated service worker caches the two permitted HTML documents and the compiled, approved JS/CSS bundle. An unexpected file fails the strict release inventory. The cache contains only already-public teaching examples, never the unpublished La Relève manuscript, private catalogs, research packets, or participant writing.

Open the app once over HTTPS or localhost while connected. Subsequent visits to the main site, first-reading packets, static literary companions and /facilitator.html can work offline in compatible browsers. First-time offline visitors have no cache. Public-episode drafts remain in per-tab sessionStorage across refreshes; Reset clears them. Private reviewer notes remain memory-only. Explicitly export any work you wish to keep before closing the tab. Neither storage path sends data to a server or the offline cache.

The release build produces five permitted public assets, including sw.js. Run npm run test:offline for fail-closed build tests and npm run test:e2e for desktop/mobile disconnection tests. GitHub Actions attaches the approved PUBLIC static site as a reproducibility artifact. This is not a live website, a private distribution mechanism or real-time collaboration.

## Reproducible dependencies and reviewed literary catalog

The root and `experience/` dependencies now have committed npm v3 lockfiles. Use `npm ci` at the root and `npm ci --prefix experience` for the literary application; CI fails if either lock diverges from its declared package manifest. Dependency installation runs with `--ignore-scripts` to avoid executing lifecycle scripts. Public-release source files remain pinned by `approved-*.blobsha` and the strict output allowlist.

The reading journey, its reviewer packets and static companions resolve work content through `src/contentCatalog.ts`. The registry only accepts the two pinned original public fixtures, validates their distinct finite models and rejects self-declared rights metadata from foreign sources. It cannot import or publish `La Relève`. See [the public content contract](../docs/PUBLIC_CONTENT_CONTRACT.md) for the entry procedure and limitations.

## Repository-subpath deployment test

In addition to the ordinary root-origin build, POELIO runs a second publication-safe build with a Vite base of `/POELIO/`. This is the layout used by repository-scoped static hosts, including a possible GitHub Pages project URL. Links to the workshop guide derive from Vite's configured base, and the offline service worker registers and caches content only within that subpath.

Run `npm run build:subpath` followed by `npm run test:subpath` to reproduce the desktop/mobile browser checks. The normal `npm run build` and `npm run test:e2e` continue to test hosting at `/`. The second build rewrites `dist/` for testing; run the desired build variant last before copying assets to any static host.

**No deployment is enabled by these commands.** Neither variant contains unpublished La Relève prose or private catalogs; actual publication decisions and website deployment permissions are separate gates.

## Exact-byte release evidence

The release auditor validates the **already built** public app at root or under `/POELIO/`, refusing extra files, forged source pins, altered service-worker bytes, missing CSP/referrer policy or asset paths inconsistent with the deployment base.

Run `npm run test:release` for synthetic adversarial checks. Following a root build, use `npm run audit:root`; following a subpath build, use `npm run audit:subpath`. Both commands write deterministic JSON reports under ignored `release-audit/`, **outside** the public `dist/` bundle. The records contain SHA-256 of the exact five deployed files, the two already-public pinned literary source files and both npm lockfiles, plus cache version and deployment prefix. Reports carry `publicationStatus=TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE`; passing the auditor does not approve a public literary release.

GitHub Actions archives both reports separately from the approved public demo artifact. These manifests contain no private or unpublished literary content and do not establish human editorial, accessibility or legal acceptance.

## Browser security regression tests

The ordinary `npm run test:e2e` includes desktop/mobile `tests/privacy-boundaries.spec.ts`. The tests do not bypass the deployed Content Security Policy and check that editing, local export, and independent editorial reviews produce no unintended third-party or mutating HTTP requests. They also test per-work temporary writing, sessionStorage denial, empty cookies/IndexedDB/localStorage in tested paths, the four approved cached public assets and deliberate Reset deletion.

`sessionStorage` is not encrypted or guaranteed erased by closing a browser session. Shared workshop devices require explicit Reset and local download care. The CI dependency audit covers **production runtime dependencies** only, not the entire build toolchain. See `../docs/SECURITY_PRIVACY_ACCEPTANCE.md` for residual risks and exact acceptance boundaries.


## Full dependency security audit and HTTP-host acceptance

CI audits **all** locked root and literary-app npm packages (including developer tools) at severity high and critical. The production/runtime-only advisory audit is retained separately. Patched versions of Vite, Vitest, and Playwright are pinned in `package.json` and `package-lock.json`.

Run `npm run test:host-headers` to test the HTTPS response contract using synthetic fixtures. To validate a later *deployed* site, first produce a matching `release-audit/root.json` or `release-audit/subpath.json`, then run:

    node scripts/audit_host_headers.mjs https://example.org/POELIO/ release-audit/subpath.json

That command checks response-level CSP including `frame-ancestors`, browser-isolation and privacy headers, TLS/HSTS, Content-Type, nonredirected delivery, and exact SHA-256 identity of the five approved files. It requires a host capable of setting these headers. The current Vite preview only serves local test builds and does **not** establish production HTTP headers. No hosted site or production certificate has been configured.

See `../docs/HOSTING_RESPONSE_HEADERS.md` for explicit requirements and release boundaries.
