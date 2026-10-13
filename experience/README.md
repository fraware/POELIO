# POELIO — Literature-first experience (public demonstration)

This is a **publication-safe** six-stage React/TypeScript/Vite episode.

Its text, *Le Registre des clefs*, is an original, small teaching fixture. It is **not** an edition, excerpt, adaptation, or public release of the unpublished *La Relève*. Two curated passages are associated with specific canonical schedule configurations. The other twelve configurations have mathematical solutions but **no authored prose**; the interface says so.

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

The six stages are Read, Question, Explore, Compare, Invent, and Reflect. The reader sees French prose with optional English interface translation. Drafts stay in React memory and are downloadable by explicit action. Refreshing or resetting clears them. No accounts, server state, API calls, AI inference, telemetry, or automated literary-quality scores are implemented.

## Evidence boundaries

The finite model is imported from the existing repository source. CI independently enumerates all 256 assignments and the 14 minimum repairs. This **does not replay Lean proofs** or establish claims about narrative meaning. Manuscript provenance for the synthetic fixture is represented by explicit source module IDs; a private-edition importer with cryptographic source integrity and rights verification is still a separate requirement.

## Release boundary

The React build uses an original, in-repository public fixture only. Never replace that fixture with private literary materials or use a public web host to serve a private edition. Rights-controlled and SHA-checked content import, full accessibility audit, facilitator kit, and empirically tested learning outcomes are **not complete**.

The initial standalone mathematical explorer at the repository root is retained for backwards compatibility; this experience is the next milestone toward the product specification.
