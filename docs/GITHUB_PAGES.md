# Hosting the public POELIO teaching preview on GitHub Pages

**Intended URL:** https://fraware.github.io/POELIO/

**Publication scope:** the two already-public original teaching works only. This is a research demonstration, not the unpublished *La Relève* edition.

## Publishing source

The GitHub Pages site is built and deployed by `.github/workflows/pages.yml`, not from the root of `main` or a general-purpose `docs/` folder. Deployment is strictly conditional on a successful **push-to-main** `Public source CI` completion for the exact SHA which still heads `main`.

The workflow uses the pinned Node 22/npm lockfile and `npm ci --ignore-scripts`, checks the whole dependency tree for high/critical known advisories, runs `build:subpath`, validates the exact `/POELIO/` eight-file public distribution using the deterministic release auditor, and uploads only `experience/dist`. GitHub's pinned Pages actions deploy that upload. No prose-generation endpoint, analytics service, database, account system, private candidate import or manuscript archive is shipped.

## Required GitHub administrator activation

A repository administrator must enable GitHub Pages and configure its publishing source. For a previously disabled Pages site:

1. Visit https://github.com/fraware/POELIO/settings/pages.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Use the existing `Publish public reading preview` workflow; no template workflow needs to be generated.
4. Push an approved new commit to `main` through a pull request to trigger fresh source CI and the deployment workflow. The last build cannot be considered live solely because its artifacts or workflow files exist.
5. Verify the workflow reports a successful `github-pages` deployment and open https://fraware.github.io/POELIO/ on mobile and desktop.

Do not mark the website deployed until the actual URL serves the reviewed application successfully.

## GitHub About metadata

The repository page's About panel is separately managed by an administrator. Recommended description:

> An open literary laboratory for constrained writing, interactive reading, human creativity, and privacy-first workshops.

The homepage URL is **https://fraware.github.io/POELIO/**, only once that URL actually works.

Topics:

```text
digital-humanities
electronic-literature
interactive-literature
creative-writing
constrained-writing
literary-studies
literary-interpretation
oulipo
formal-methods
writing-tools
education
typescript
privacy-first
```

The `oulipo` topic is descriptive; POELIO is **independent** and has no Oulipo endorsement. Until GitHub confirms these metadata changes, issue #20 remains open.

## Technical acceptance and host limitations

The browser's shipped HTML meta Content Security Policy remains restrictive; approved static files are content-hash audited. Session drafts stay in browser-tab storage and are exported only on explicit action. GitHub Pages still receives routine HTTPS traffic metadata as a hosting provider.

**GitHub Pages cannot set project-specific security response headers.** Consequently it does not satisfy the complete server-response contract in `HOSTING_RESPONSE_HEADERS.md` (including response-level `frame-ancestors` and related policies), regardless of how robust the HTML meta CSP is. Do not claim the strict host-header audit passed on GitHub Pages or that this is a production-security-certified service. It is a public, low-risk **research teaching preview** with its specific hosting limitation documented. A later production deployment meeting that stricter header contract needs a configurable HTTP host or proxy.

Before wider institutional or workshop use, conduct independent literary editorial assessment, manual accessibility verification (including actual NVDA/VoiceOver), and venue-specific publication/research review. No rights are granted to the unpublished *La Relève* manuscript by this deployment.
