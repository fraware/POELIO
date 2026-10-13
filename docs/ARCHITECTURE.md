# Architecture and publication boundaries

## Scope of the public architecture

The root includes a text-free mathematical explorer and its deterministic tests. The React/Vite application in `experience/` implements two original six-stage literary demonstrations and a static facilitator guide. The unpublished *La Relève* edition is not distributed here and is not consumed by the public frontend. There are no accounts, prose-generating models or participant-data services.

## Model

Eight positions and two abstract assignments define 256 binary schedules. Recurrence fixes the final assignment equal to the first. Strict alternation across seven transitions contradicts recurrence. Exactly one repeated transition minimizes violated alternations; independent enumeration returns fourteen assignments.

The independent permutation engine in `experience/src/permutation.ts` enumerates all 24 permutations of four fixed literary fragments and its rule-restricted subset of 12. It reorders existing prose without modifying it. This differs from the scheduling model, which maps each of two demo schedules to an authored alternative text.

The TypeScript module `src/model.ts` is deterministic. Its regression tests establish properties of this finite implementation; no Lean proof is rerun by CI. No result purports to prove semantic or aesthetic properties of literature.

## Trust boundaries

1. `public/` and compiled TypeScript are safe to publish; they contain no manuscript.
2. The static build script copies only four allowlisted files to `dist/`.
3. Published repository content is never an authenticated place for an unpublished manuscript.
4. A private edition, if used, imports exact SHA-checked literary passages from a separately held research archive. Its output must be restricted to local or otherwise properly authorized access; copying it into a public branch would release the complete text.
5. Participant writing is not collected by the public explorer.

The tracked-filename guard checks common leakage paths, **not arbitrary strings or all possible secret data**. Code review remains necessary.

## Private content pipeline

The standalone Python importer in tools/private_content.py validates a strict manifest, independently enumerates the canonical schedules, checks exact UTF-8 source bytes against SHA-256 claims, rejects inconsistent source-module identities, and writes a private catalog outside the repository only. The master-archive adapter separately reconciles original reader and generated manifests; its output is not part of the Vite application or a public release. See docs/CONTENT_INTEGRITY.md for supported schema, execution instructions and limitations.

## Design intent

Each prototype episode combines authored prose, interpretive questions, constraint exploration, comparison, original composition, and reflection. A future fully editorialized episode will deepen these experiences. It must preserve provenance and distinguish executable findings from interpretation. The complete literary edition cannot be public until rights and study-integrity decisions are resolved.

No official affiliation with Oulipo is claimed. No software license has yet been selected.

## Single public literary work registry

`experience/src/contentCatalog.ts` is the only approved entry point for the reading components and independent reviewer packets. It validates each public work against explicitly pinned literary source identity, scoped publication metadata, the corresponding model validator and actual authored realizations or immutable fragments. The original sources live in `episode.ts` and `permutation.ts`; the registry does not copy the manuscript. The private Python content importer stays a separate command-line system and supplies no public browser material.

Root and literary-app npm lockfiles are committed separately; both CI jobs install with `npm ci`. This improves build reproducibility, subject to the configured Node/runtime and dependency registry availability. The static release continues to fail closed when unexpected files appear.

## Static deployment portability

The existing strict public asset builder supports a second verified Vite base (`/POELIO/`) for repository-scoped static hosting. The browser interface constructs workshop-guide links from the configured base, and the service worker uses its registration scope to find approved cache entries. The independent root and subpath browser suites exercise reading, comparison, reviewer packets, guide navigation, and offline fallbacks. No deployment action or public GitHub Pages service is configured by the CI workflow.
