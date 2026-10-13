# POELIO v0.2.0-rc.1 — Research preview

> **Proposed GitHub prerelease notes.** Publication of a GitHub Release requires a separate action; the presence of this file does not assert that a release is already live.

A literature-first, privacy-aware public research prototype. POELIO invites the reader to move through six stages: **Read → Question → Explore → Compare → Invent → Reflect**.

### What is included

- Two original teaching works, *Le Registre des clefs* and *Les Quatre Témoins*. The first demonstrates a formally inconsistent relay, with **two authored alternatives** among fourteen valid minimum repairs. The second reorders **four fixed authored fragments** across twenty-four permutations; no prose is generated.
- A bilingual French/English interface surrounding original French prose, independent first-reading packets, explanatory reading companions, and a print-ready facilitator guide.
- Private, per-tab drafts and voluntary local TXT export; no application analytics, account creation, server-side writing storage, or AI inference.
- Public-only offline reading and facilitator pages, tested for root and repository-subpath hosting.
- Executable finite-model tests, provenance checks, artifact and dependency audits, browser privacy regressions, keyboard and 320-pixel reflow tests.
- MIT-licensed application code, with a **separate literary rights notice** for authored prose.

### Quick start

```sh
git clone https://github.com/fraware/POELIO.git
cd POELIO/experience
npm ci
npm run build
npm run preview
```

The repository is not deployed by this release process. It is intended for local research and controlled demonstration.

### Explicit limitations

Independent literary editorial approval, manual screen-reader/WCAG acceptance, empirical educational validation, and hosting security-header verification have **not** been completed. Unpublished *La Relève* literature and private research data are not included or licensed. No official relationship with Oulipo is claimed.

This is a **prerelease candidate**, not a production or final literary-edition release. The normal GitHub source archives are not permission to redistribute reserved literary material apart from the limited public-demo terms in `LICENSE-CONTENT.md`.
