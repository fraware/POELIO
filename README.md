# POELIO

**A laboratory for explorable literature.**  
*Plateforme Ouverte d’Exploration Littéraire et d’Interprétation des Œuvres.*

POELIO is an experimental environment for encountering literary works, investigating their compositional constraints, comparing formally admissible possibilities, and inventing new procedures. Its long-term ambition is to connect literary research, readers, writers, and physical workshops across generations and languages.

This repository is **an early-stage public codebase**, not a finished literary edition. Its first reference study is *La Relève*, an unpublished work with a finite constraint model. Only publication-safe code and documentation are held here.

## Initial implementation

- A deterministic, exhaustive finite-model engine for the eight-position, two-person scheduling construction.
- Regression tests for all 256 configurations, the impossibility of strict alternation plus recurrence, and the 14 labelled minimum repairs.
- A scoped product specification in [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) and explicit verification boundaries in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Private-edition code and complete unpublished literary realizations **are not included** in this initial public repository.

## Get started

Requirements: Node.js 22+ and npm.

```sh
npm install
npm test
npm run build:public
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Visit http://127.0.0.1:8765/ to use the publication-safe mathematical explorer.

The commands type-check the public TypeScript model, compile it, and exercise its mathematical invariants using Node's built-in test runner.

## Mathematical scope

A schedule is a binary sequence `x[0..7]`. We require `x[0] = x[7]`; strict alternation would also require `x[i] != x[i+1]` for every `i=0..6`. Those requirements conflict. Minimizing the number of repeated transitions subject to recurrence yields 14 labelled schedules.

The code independently enumerates this finite space. **The executable tests are not a new Lean proof.** Archived formal evidence for the original research artifact, where applicable, is separate from this software's regression tests. Nothing here purports to verify literary meaning or quality.

## Publication and confidentiality

The repository is public. Do **not** commit or deploy `catalog.json`, manuscript archives, private build directories, reading manuscripts, blinded-study materials, participant responses, or any other unreleased literary content.

A local/private edition built from separately authorized materials is a different distribution artifact and **must never be served on a publicly accessible host**. Git history is persistent: removing a sensitive file in a later commit does not make the original disclosure private.

We do not imply affiliation with, sponsorship by, or endorsement from the Oulipo.

## Design principles

Literature first; computational structure on demand. Verified finite facts, executable checks, editorial interpretation, and reader interpretation are different kinds of claims. Experimental constraint-breaking is a valid artistic choice. Authors control rights and release decisions for their work.

## Status

**Public foundation — not production-ready.** We have not established full accessibility conformance, literary outcomes through user studies, publication rights for the first literary episode, or a release-ready public edition.

No license grant is asserted until a license is selected and added explicitly.
