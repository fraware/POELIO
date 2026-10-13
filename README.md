# POELIO

**A laboratory for explorable literature.**  
*Plateforme Ouverte d’Exploration Littéraire et d’Interprétation des Œuvres.*

POELIO is an experimental environment for encountering literary works, investigating their compositional constraints, comparing formally admissible possibilities, and inventing new procedures. Its long-term ambition is to connect literary research, readers, writers, and physical workshops across generations and languages.

This repository is **an early-stage public codebase**, not a finished literary edition. Its first reference study is *La Relève*, an unpublished work with a finite constraint model. Only publication-safe code and documentation are held here.

## Current implementation

- Two original bilingual-interface **six-stage literary experiences** in [`experience/`](experience/): *Le Registre des clefs* explores an inconsistent scheduling rule; *Les Quatre Témoins* explores permutations of four fixed, authored fragments. Neither uses the unpublished *La Relève* prose.
- A deterministic, exhaustive finite-model engine for the eight-position, two-person scheduling construction.
- Regression tests for all 256 configurations, the impossibility of strict alternation plus recurrence, and the 14 labelled minimum repairs.
- A scoped product specification in [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) and explicit verification boundaries in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- The scheduling episode has two authored alternatives and leaves twelve valid schedules without fictional prose. The permutation episode recombines four unchanged, prewritten fragments across 24 orders; it does not invent transitions.
- An accessible, printable **60-minute workshop guide** is included at `/facilitator.html` in the built experience, with an independent [pilot protocol](docs/WORKSHOP_PILOT.md).
- The unpublished literary realizations, original private catalog and blinded study material **are not included**.

## Get started

Requirements: Node.js 22+ and npm.

```sh
npm install
npm test
npm run build:public
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Visit http://127.0.0.1:8765/ to use the publication-safe mathematical explorer.

To run the **literature-first six-stage experience**:

```sh
cd experience
npm install
npm run typecheck
npm test
npm run build
npm run preview
```

See [experience/README.md](experience/README.md) for the browser test procedure and content-rights limitations.

The commands type-check the public TypeScript model, compile it, and exercise its mathematical invariants using Node's built-in test runner.

## Mathematical scope

A schedule is a binary sequence `x[0..7]`. We require `x[0] = x[7]`; strict alternation would also require `x[i] != x[i+1]` for every `i=0..6`. Those requirements conflict. Minimizing the number of repeated transitions subject to recurrence yields 14 labelled schedules.

The code independently enumerates this finite space. **The executable tests are not a new Lean proof.** Archived formal evidence for the original research artifact, where applicable, is separate from this software's regression tests. Nothing here purports to verify literary meaning or quality.

## Reviewer-ready literary validation

The public prototype contains two **unprimed first-reading packets** and two complete static interpretive companions. They derive the text directly from the approved public source fixtures, with no alternate manuscript copy, server-side note collection, or unpublished La Relève material.

After starting the React/Vite application, use the following URLs on its local host:

- `/?review=register` and `/?review=permutation` — first reading, personal notes and later editorial critique
- `/?companion=register` and `/?companion=permutation` — source-matched, fully written, noninteractive explanatory editions

See [independent editorial review protocol](docs/EDITORIAL_REVIEW_PROTOCOL.md) and [static comparison and evaluation protocol](docs/STATIC_COMPARISON_PROTOCOL.md). These are **ready-to-use evaluation instruments**, not human review results. Do not distribute the companions to a first-reading reviewer before their unprimed response.

## Literary quality and accessibility

The latest quality pass introduces automated axe-core accessibility checks and strict identity validation for shared authored source modules. The artistic meaning and quality of both public teaching episodes remain subject to independent editorial review. See [editorial quality gate](docs/EDITORIAL_QUALITY_GATE.md), [accessibility acceptance protocol](docs/ACCESSIBILITY_ACCEPTANCE.md), and the [workshop pilot](docs/WORKSHOP_PILOT.md).

Passing CI does **not** establish WCAG 2.2 AA conformance, literary value, or causal learning benefits. Manual screen-reader evaluation, editorial judgment, and appropriately designed reader studies remain outstanding.

## Private literary content integrity

The tested, private-only manuscript gate is documented in [docs/CONTENT_INTEGRITY.md](docs/CONTENT_INTEGRITY.md). It verifies source bytes, permissions assertions, supported schedules and module provenance, and never stages private catalogs inside the public checkout. A separate adapter validates the originally supplied La Relève master archive **locally** without bundling manuscripts into this repository. It does not grant publication rights or make the private edition available through the public website.

## Browser privacy and supply-chain regression gates

The public literary interface is tested for accidental network transmission of participant prose, absence of unexpected persistent browser stores, memory-only editorial notes, work-specific Reset, and in-memory composition when session storage is unavailable. The release workflow uses commit-pinned GitHub Actions and blocks known high-severity production dependency advisories. See [Security and privacy acceptance](docs/SECURITY_PRIVACY_ACCEPTANCE.md) for the precise test scope, residual risks and safeguards for shared workshop devices. This is not a claim of independent security certification.

## Publication and confidentiality

The repository is public. Do **not** commit or deploy `catalog.json`, manuscript archives, private build directories, reading manuscripts, blinded-study materials, participant responses, or any other unreleased literary content.

A local/private edition built from separately authorized materials is a different distribution artifact and **must never be served on a publicly accessible host**. Git history is persistent: removing a sensitive file in a later commit does not make the original disclosure private.

We do not imply affiliation with, sponsorship by, or endorsement from the Oulipo.

## Design principles

Literature first; computational structure on demand. Verified finite facts, executable checks, editorial interpretation, and reader interpretation are different kinds of claims. Experimental constraint-breaking is a valid artistic choice. Authors control rights and release decisions for their work.

## Status

**Research prototype — not production-ready.** A synthetic, release-safe literary experience exists alongside the original mathematical explorer. The complete *La Relève* edition, a reusable rights/SHA importer, full accessibility conformance, independent editorial approval, a full facilitator usability pilot, and evaluation of literary outcomes remain pending. Full literary publication rights are not established.

No license grant is asserted until a license is selected and added explicitly.
