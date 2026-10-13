# Architecture and publication boundaries

## Scope of the initial public commit

The repository contains a stand-alone, text-free mathematical explorer, exhaustive finite-model tests, and a static-site build. The accompanying *La Relève* literary edition is unpublished and is not distributed here. This open explorer is **not** the complete six-stage private literary experience.

## Model

Eight positions and two abstract assignments define 256 binary schedules. Recurrence fixes the final assignment equal to the first. Strict alternation across seven transitions contradicts recurrence. Exactly one repeated transition minimizes violated alternations; independent enumeration returns fourteen assignments.

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

A future episode will combine authored prose, interpretive questions, constraint exploration, passage comparison, original composition, and reflection. It must preserve provenance and distinguish executable findings from interpretation. The complete literary edition cannot be public until rights and study-integrity decisions are resolved.

No official affiliation with Oulipo is claimed. No software license has yet been selected.
