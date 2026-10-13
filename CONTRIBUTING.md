# Contributing to POELIO

*Protect the page, the author, and the reader.*

POELIO welcomes software fixes, accessibility improvements, translation corrections to interface text, formal-model tests, and careful documentation work. Its center is a literary encounter; additional mechanics are useful only insofar as they improve that encounter.

## Before contributing

Read the [product contract](docs/PRODUCT_SPEC.md), [software and literary permissions](LICENSE-CONTENT.md), and [architecture](docs/ARCHITECTURE.md). For changes affecting a work, consult the [public content contract](docs/PUBLIC_CONTENT_CONTRACT.md). Use a narrow pull request with the rationale, risks, evidence, and commands used to validate it.

**Never commit** unpublished manuscripts, private catalogs, ZIP research archives, participants' responses, hidden assessment material, personal data, credentials, or unapproved literary source passages. Git history preserves deleted content. Tests must use invented synthetic examples and remain within the existing public publication boundary.

## Development

Use Node.js **22.12+**, npm, Python 3, and Chromium for browser tests.

```sh
npm ci
npm test
npm run build:public

cd experience
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

GitHub Actions also checks both supported hosting bases, full dependency advisories, privacy and offline behavior, 320-pixel reflow, keyboard focus, and public release evidence. CI success is necessary for merging; it does not prove literary quality or full accessibility.

## Review standards

- Preserve authored prose byte-for-byte unless there is a separate rights-cleared editorial change.
- Do not substitute model-generated passages for unwritten realizations.
- Distinguish `FORMALLY_VERIFIED`, `EXECUTABLY_CHECKED`, `COMPUTED_IN_SESSION`, editorial interpretation, and unknown results.
- Add tests for the failing case, including an explicit rejection path for invalid or unapproved source data.
- Keep reader writing local, with no new telemetry, cloud storage, network inference, or silent data collection.
- Verify semantics and focus with keyboard usage, plus supported automated accessibility tools.
- Do not imply official affiliation with Oulipo.

For security-sensitive reports, follow [SECURITY.md](SECURITY.md), not a public issue. Project-maintainer approval is required before merging contributions.

## Rights of contributions

By contributing code, you indicate that you have the authority to license your contribution under MIT. **Literary text is handled separately** and must have a written source, attribution, and publication decision before inclusion; code contribution does not confer a literary publication license.

For design proposals, open a GitHub issue with a bounded use case and an explicit editorial purpose.
