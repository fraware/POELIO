# Public literary content contract — release gate v1

**Status:** implemented for two approved demonstration works. This contract is intentionally narrower than a generic publishing platform.

POELIO's central unit is an **explorable literary work**. The browser application receives authored prose, a specific compositional model, deliberately limited evidence claims and explicit publication provenance as a single validated object. Literary interpretation and participant writing remain outside computational proof.

## Single source of authored material

- `experience/src/episode.ts` is the existing, reviewed source for *Le Registre des clefs*: two distinct, authored realizations, fourteen minimum-repair schedules. Twelve schedules have **no prose**.
- `experience/src/permutation.ts` is the existing, reviewed source for *Les Quatre Témoins*: four immutable, attributed fragments, 24 orders, twelve satisfying a declared ordering rule. A permutation is a presentation order of *the same original writing*, not a newly authored realization.
- The editorial first-reading packets, noninteractive companions and six-stage reading interfaces all obtain their underlying source passages through `experience/src/contentCatalog.ts`. There is no duplicated manuscript copy.

## Runtime validation

`createPublicCatalog` accepts a fixed, versioned, explicit allowlist of public works. Each definition specifies:

| Field | Meaning |
|---|---|
| `schemaVersion` | Exact supported catalog schema; currently 1 |
| `slug`, `kind` | Identifies the work and its declared finite model |
| `title`, `language` | Reviewed title and original literary language |
| `release` | Channel, approved public-source identity and provenance claim |
| `fixture` **or** `fragments` | Reference to the actual reviewed authored source |
| `originalOrder`, `comparisonOrder` | For fragment permutation, two real, valid source arrangements |

The validator rejects unrecognized works, model drift, missing or unexpected fields, unapproved release channels, foreign source objects, unsupported reading orders, noncanonical schedules, duplicate works, and conflicting source-module identities. Each model has its own deterministic enumeration.

For the existing reviewed fixtures, it compares the **actual imported module/object identity** to the release allowlist, not just the text of a user-supplied `approved: true` field. Future works have to add their authored source, dedicated model validator, catalog registration, tests and a distinct reviewed source pin. A forged "public" rights record alone is insufficient.

The release source identifiers are linked to `experience/approved-demo.blobsha` and `experience/approved-permutation.blobsha`, enforced by the build script. These are change-control records. They **do not legally establish copyright permission or independent editorial approval**. Source hashes identify exactly which text was admitted, not its artistic quality.

## Epistemic discipline

- `EXECUTABLY_CHECKED` means finite enumeration or an executable test within its recorded scope.
- `COMPUTED_IN_SESSION` means a computation in the current interface.
- `EDITORIAL_INTERPRETATION` identifies human interpretation, not a theorem.
- `NOT_ESTABLISHED` explicitly records an evidential boundary.

The archived Lean evidence related to unpublished *La Relève* is a separate scientific record. No Lean proof is rerun by the browser. The compiler cannot establish a narrative's meaning, formal correctness of French semantics, or literary merit.

## Publication separation

No directory search, filesystem scan, runtime private-catalog import, network fetch, account, server-side API or user-supplied JSON is part of the browser content registry. The separate Python importer for unpublished material is **private-local only** and cannot be routed through the public React registry.

The public build still enforces its exact static-asset allowlist and a hash-pinned public-fixture check. The offline service worker caches only the release's reviewed public shell. Browser writing uses session-scoped storage and is never copied into release artifacts.

**An approval record in source code is a technical gate, not actual consent from a rights holder.** Channel-specific rights and editorial decisions remain mandatory before adding real literary editions.

## Acceptance before introducing a new work

1. Establish actual publication permission and the implications for journal submissions and previous blinded studies.
2. Identify and pin the original authored source; record version and attribution.
3. Supply a formally or executably specified model and a validator with an explicit scope.
4. Define exact mappings between states and *existing authored material*. Empty mapping is allowed and must stay empty in the UI.
5. Add negative tests for tampered or foreign sources, duplicated module IDs, unknown states, false rights declarations and release-output leakage.
6. Review the unprimed literary encounter and the complete six-stage editorial interpretation.
7. Verify the static build and offline cache with real browser testing; perform manual accessibility evaluation before broader release.

This is the platform's content architecture, not a pretext for accumulating more toy formal mechanisms.

## Prior-publication and candidate staging distinction

A private candidate that passes tools/preflight_candidate.py is never automatically eligible for the public contentCatalog.ts allowlist. The preflight always reports publicationAuthorized=false and publicCatalogEligible=false. It validates source bytes and a supported finite state family without exporting prose or a web-readable manifest. Any eventual public work addition still needs actual human rights and editorial decisions.

Exact deployed output is additionally assessed with experience/scripts/audit_release.mjs in both root and repository-subpath forms. Its manifests contain only reviewed public-source and build hashes; they are outside the public web root. Technical-success status is categorically distinct from a publication authorization. See docs/RELEASE_AND_CANDIDATE_PREFLIGHT.md.
