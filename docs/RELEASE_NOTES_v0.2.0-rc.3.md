# POELIO v0.2.0-rc.3 | Literary research preview

> **Source prerelease, not stable certification.** This tag snapshots the two approved public teaching works and their technical verification. Independent literary judgment and human accessibility acceptance have not been performed.

## Reader-facing changes since rc.2

- Six literary stages **Read → Question → Explore → Compare → Invent → Reflect** across both public original teaching works. First reading presents the authored prose before explanatory material.
- *Le Registre des clefs*: direct, reversible editing of eight assignments, 256 possible configurations and 14 minimum-repair solutions with **exactly two authored literary realizations**. No prose is invented for the other twelve minimal repairs.
- *Les Quatre Témoins*: reorder the same four original attributed fragments by touch, pointer or accessible buttons, with undo/redo and an optional precedence condition admitting 12 of 24 orders.
- Shared comparison space, stacked on mobile; optional recall of a reader's first interpretation; explicit separation of calculated arrangements from authored passages and literary inference.
- Native six-stage chooser on mobile; unified reader-controlled writing spaces; optional TXT export and strict source-pinned, versioned JSON v1 backup/restore for each work.
- Independent source-derived first-reading packets, separate static comparators, a field kit with blank observation and permissions records, and prospective keyboard/NVDA/VoiceOver/zoom acceptance instructions.

## Technical evidence

- Exact original public-source and npm-lockfile identities, exhaustive finite-model checks, automated accessibility tests, desktop/mobile browser regressions, offline read tests, and strict eight-file release output audits at the root and `/POELIO/`.
- SHA-guarded, CI-gated GitHub Pages publication. The deployment workflow also verifies **the exact bytes actually served** against SHA-256 digests from its audited eight-file build. Check the conclusion of the Pages run for this tag's SHA before asserting that the live site serves this version.
- Release automation refuses to rewrite an existing tag and does not attach any manuscript, reader writing or internal study materials.

## Scope and limitations

The application code is MIT-licensed. The authored public teaching prose has **separate permissions** under `LICENSE-CONTENT.md`. These terms grant no rights over separate unpublished manuscripts. POELIO has no affiliation with Oulipo.

The app has no accounts, remote writing inference or analytics. Interactive drafts remain in tab-scoped `sessionStorage`, with memory fallback; independent first-reader notes remain in React memory. Local TXT and JSON downloads are voluntary and **unencrypted**.

GitHub Pages does **not** satisfy the complete production HTTP response-header contract, including enforceable response-level `frame-ancestors`. A valid automated scan does not establish real-device WCAG conformance or third-party editorial acceptance.

**Outstanding human steps:** independent close reading and editorial decision, novice-reader observations, actual NVDA/VoiceOver/zoom testing, appropriate participant consent and responsible facilitation. No results, endorsements, study findings or source rights for private works are claimed.

## Reproduce the release gates

```sh
git clone https://github.com/fraware/POELIO.git
cd POELIO
npm ci --ignore-scripts
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
cd experience
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build:subpath
npm run audit:subpath
```

Review the exact GitHub Actions `Public source CI`, `Publish public reading preview`, and `Research preview release` runs for this SHA. No prior prerelease tag is overwritten.
