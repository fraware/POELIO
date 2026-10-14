# Hosting the public POELIO teaching preview on GitHub Pages

**Public URL:** https://fraware.github.io/POELIO/

**Publication scope:** only the two original, approved teaching works. Unpublished literary archives and research materials are excluded.

## Publishing source

The GitHub Pages site is built and deployed by `.github/workflows/pages.yml`, not from the root of `main` or a general-purpose `docs/` folder. Deployment is strictly conditional on a successful **push-to-main** `Public source CI` completion for the exact SHA which still heads `main`.

The workflow uses the pinned Node 22/npm lockfile and `npm ci --ignore-scripts`, checks the whole dependency tree for high/critical known advisories, runs `build:subpath`, validates the exact `/POELIO/` eight-file public distribution using the deterministic release auditor, and uploads only `experience/dist`. GitHub's pinned Pages actions deploy that upload. No prose-generation endpoint, analytics service, database, account system, private candidate import or manuscript archive is shipped.

## Deployment and recovery

GitHub reports Pages enabled and a successful `Publish public reading preview` deployment for the current reviewed mainline SHA. CI and deployment success establish the GitHub publication workflow result; direct browser inspection of the served site and independent accessibility testing remain separate acceptance steps.

If deployment stops working, confirm the source is **GitHub Actions** under [Settings → Pages](https://github.com/fraware/POELIO/settings/pages), inspect the [publication workflow](https://github.com/fraware/POELIO/actions/workflows/pages.yml), and verify that `main` source CI completed successfully for the exact SHA being deployed. Avoid deploying a stale build manually.

## Repository metadata

GitHub currently lists the homepage URL `https://fraware.github.io/POELIO/` and the description “Open literary laboratory for constrained writing, interactive reading and privacy-first workshops”. Five discovery topics are configured: `constrained-writing`, `creative-writing`, `digital-humanities`, `electronic-literature` and `formal-methods`.

[Issue #20](https://github.com/fraware/POELIO/issues/20) tracks remaining administrator-managed metadata and live-site acceptance. Additional topics must reflect the repository's actual scope. POELIO is independent and claims no Oulipo endorsement.

## Technical acceptance and host limitations

The browser's shipped HTML meta Content Security Policy remains restrictive; approved static files are content-hash audited. Session drafts stay in browser-tab storage and are exported only on explicit action. GitHub Pages still receives routine HTTPS traffic metadata as a hosting provider.

**GitHub Pages cannot set project-specific security response headers.** Consequently it does not satisfy the complete server-response contract in `HOSTING_RESPONSE_HEADERS.md` (including response-level `frame-ancestors` and related policies), regardless of how robust the HTML meta CSP is. Do not claim the strict host-header audit passed on GitHub Pages or that this is a production-security-certified service. It is a public, low-risk **research teaching preview** with its specific hosting limitation documented. A later production deployment meeting that stricter header contract needs a configurable HTTP host or proxy.

Before wider institutional or workshop use, conduct independent literary editorial assessment, manual accessibility verification (including actual NVDA/VoiceOver), and venue-specific publication/research review. Neither the software license nor this public teaching deployment grants rights over any separate unpublished manuscript.
