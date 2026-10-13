# Private candidate preflight and exact-byte release evidence

**Status:** automated technical gates. These checks do not constitute editorial approval, legal publication permission, human accessibility acceptance, or a production launch.

POELIO separates two activities: (A) local examination of **unpublished candidate prose outside the public Git checkout**, and (B) exact-byte verification of the existing, deliberately public original teaching fixtures in a static build.

## A. Private candidate intake

Run the CLI with the source files and a manifest stored away from the repository:

    python3 tools/preflight_candidate.py --manifest /private/poelio/candidate.json --source-dir /private/poelio/passages

The strict candidate manifest contains exactly these top-level fields:

- schemaVersion: integer 1
- mode: private-preflight
- work: id, title, author, edition, language (French)
- rights: one object with status UNVERIFIED_PRIVATE_CANDIDATE
- mechanism: id and scope
- sources: list of id, sourceModule, file, sha256
- arrangements: list of id, state, sourceIds

Only two model IDs are currently implemented. For weekly-binary-eight-v1, each state is a canonical 8-character A/B schedule with exactly one repeated transition and Monday recurrence. For fixed-fragments-four-v1, each state is an array that permutes exactly four uniquely identified source fragments; a candidate must contain four fragments. At least two distinct authored arrangements are needed. A mathematically admissible position is not treated as already-authored prose.

The validator independently checks referenced source SHA-256 bytes, strict UTF-8, symlink and traversal rejection, duplicate identities, consistency of shared source modules, complete source references, and supported finite states. Neither private source data nor complete manuscripts are copied to the public catalog. The output is only a JSON summary of validated source counts, states and explicit UNVERIFIED status — no prose, source paths, filenames, titles or private source digests. It does not write to disk.

A candidate may not claim public approval. For this reason the preflight accepts only the rights status UNVERIFIED_PRIVATE_CANDIDATE. This is not a rights-holder consent record or a substitution for a publication venue's prior-publication rules.

## B. Public build release-evidence audit

In the already-published, original teaching application:

    cd experience
    npm ci --ignore-scripts
    npm run test:release
    npm run build
    npm run audit:root
    npm run build:subpath
    npm run audit:subpath

The auditor verifies exactly eight regular public files (index and facilitator HTML, compiled JS/CSS, service worker, two locally hosted WOFF2 fonts, and their OFL notice), approved hashed asset names, deployment-base-specific HTML references, strict reader and guide security/referrer policies, exact service-worker bytes, the two originally reviewed public source pins, and npm dependency lock identities.

Both audits write deterministic technical reports **outside** the web root, under the ignored experience/release-audit directory. Each report contains the SHA-256 digest and length of eight public files, lockfiles and already-reviewed PUBLIC literary source files. These records are suitable for technical comparisons, **never for proving rights permission, authored meaning, or artistic quality**. The exact public code's two source hashes are intentional; private manuscript fingerprints must never be placed in these reports.

Each report declares publicationStatus = TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE. GitHub CI archives the two audit reports as technical evidence, separately from the public demo site archive.

## Limitations and later human acceptance

A maintainer with write access could deliberately change a verifier or a source pin. Independent source review and branch protection are needed for actual release governance. The auditor is not a substitute for independent editorial review, provenance and rights-holder verification, manual screen-reader tests, or a decision about the earlier blinded study. This milestone enables disciplined prehuman preparation; it does not initiate a literary publication.

No public deployment workflow, external upload, AI prose generation, manuscript distribution, or human recruitment is introduced.
