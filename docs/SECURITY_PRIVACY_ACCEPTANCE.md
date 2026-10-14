# POELIO — Browser privacy and security acceptance

**Status:** automated regression coverage for the approved public teaching application. This is not a production security certification, independent penetration test, privacy impact assessment or new publication authorization.

## Trust boundaries

The public application exposes exactly two original literary demonstrations. Unpublished La Relève prose, private catalogs, blind-study materials and participant research records must remain outside the Git checkout, CI artifacts and offline website cache.

| Content | Location | Lifecycle |
|---|---|---|
| Approved public teaching prose | Compiled public JS and approved offline shell | Replaced by a reviewed public release |
| Interpretations and original writing in the two six-stage episodes | Per-tab sessionStorage, with React-memory fallback | Refresh-resilient in that tab; browser lifecycle dependent |
| Pre-reveal editorial review notes | React memory only | Cleared by page reload |
| Voluntary TXT export | Local browser download | Controlled by reader and operating system |
| Voluntary JSON v1 reader backup | Local browser download and optional in-browser import | Controlled by reader; strict source-revision and size checks, no network upload |
| Public release evidence | CI technical artifact, outside the website | Artifact retention policy |

**Browser sessionStorage is neither encryption nor guaranteed secure erasure.** Browser session restore, extensions, a shared device profile, malicious same-origin code and downloaded TXT files remain relevant threats. Reset clears the selected episode only. The separate “Effacer toutes mes réponses” / “Erase all my drafts” command confirms and removes all eight recognized draft fields across both public works in the current tab, then reloads to discard in-memory state. This is a shared-device handoff convenience, not secure deletion of exported files, other tabs, browser backups or restored sessions. When using shared devices, use Reset, remove exported files where appropriate and prefer a separate browsing profile. Same-origin code has technical access to session-scoped data; this must not be portrayed as an encrypted secret vault.

The optional JSON v1 backup holds the reader's four response fields plus the current configuration of one public work. It is **not encrypted** and imported files are never sent over the network. The reader chooses between filling empty fields without overwriting existing answers and a separately confirmed replacement. A successful export does not imply that the operating system retained the downloaded file. The imported backup must match the current work, pinned public literary source, schema and size constraints. See [Portable reader backups](PORTABLE_READER_BACKUPS.md).

The app itself has no accounts, analytics or participant-submission API. Requests for the static site still reach its hosting provider, which can observe normal request metadata such as IP addresses. External literary/scholarly links are opened only by deliberate user action and use referrer-suppressing link attributes.

## Browser regression scope

The Playwright security/privacy suite runs under the normal shipped Content Security Policy, without bypassing it, to verify:

- Editing all original creative response fields and exporting authored text produces no unsolicited third-party requests, mutating HTTP methods, or participant-text content in request URLs or bodies.
- Authored text does not appear in Cache Storage, public asset URLs, cookies, localStorage or IndexedDB in exercised routes.
- Private first-reading editorial notes stay in React memory, with no persistence on reload.
- The two works retain independent drafts, and Reset clears only the currently selected work's response storage.
- When browser sessionStorage is disabled, writing and explicit local export still function via in-memory state.

The existing browser checks cover root and /POELIO/ paths, offline caching, bilingual navigation, publication pins, automated accessibility rules and public-only output. **Passing these tests does not establish that every possible browsing environment or malicious extension is safe.**

## Supply-chain checks

GitHub Actions uses exact upstream v5 commit SHAs for checkout, setup-node and upload-artifact, verified against their GitHub tag references. The actions use a Node 24 runtime; the project's locked build remains on Node 22. Both npm projects have committed lockfiles and use npm ci with lifecycle scripts disabled. A CI advisory check rejects high-severity and critical known advisories in the literary application's production/runtime dependency set.

CI now performs a second advisory gate on the **entire** locked root and literary-app npm dependency trees, including build/test tooling, rejecting high and critical advisories. This led to patched upgrades of Vite, Vitest and Playwright. These advisory scans cannot detect unpublished vulnerabilities or replace independent security review. Pinning improves repeatability, not absolute security. A separate full dependency-tree security review and controlled upgrades remain before a production security claim.

## Explicitly open decisions

Human editorial acceptance, manual screen-reader accessibility checks, rights-holder approval and prior-publication assessment for any real work, participant-consent procedure for human research, hosted-site security headers and data-retention policy are **not complete**.

The current security gates support a narrowly scoped public teaching deployment on GitHub Pages. They do not establish production-host security certification, authorize private manuscript release, create user accounts or permit research-data collection. Read the release and candidate preflight and public content-contract documents before adding any literary material.

## Prospective host HTTP requirements

The separate `docs/HOSTING_RESPONSE_HEADERS.md` and `experience/scripts/audit_host_headers.mjs` define and synthetically test a strict HTTPS-response contract, including response-level CSP with `frame-ancestors`, HSTS, permissions, MIME and exact approved asset hashes. These checks have **not** yet been run against a deployed POELIO site. HTML meta CSP by itself does not establish production HTTP security headers.

## Release-candidate comparison and additional reflow tests

Deterministic release manifests can now be compared across builds of the same hosting variant; any change in pinned authored public source, npm dependency, compiled file or offline-cache identity is flagged for deliberate review, with no automatic authorization. The two builds produced by CI (`/` and `/POELIO/`) must also agree on pinned public sources and lockfile identities, while deployment-prefix-specific bytes may differ. An unsigned comparison record is not a trusted release signature. The browser suite additionally verifies 320 CSS-pixel reflow, keyboard entry and system forced-colors focus behavior; manual assistive-technology and actual high-zoom acceptance remain open.
