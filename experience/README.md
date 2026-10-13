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

The six stages in each episode are Read, Question, Explore, Compare, Invent, and Reflect. Switch to the second episode with the dedicated button in the first episode header. The experience includes an independent, print-ready 60-minute facilitator guide at `/facilitator.html` and a pilot protocol in `../docs/WORKSHOP_PILOT.md`. The reader sees French prose with optional English interface translation. Drafts stay in React memory and are downloadable by explicit action. Refreshing or resetting clears them. No accounts, server state, API calls, AI inference, telemetry, or automated literary-quality scores are implemented.

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
