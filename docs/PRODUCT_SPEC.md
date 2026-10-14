# POELIO — Product contract v0.1

**Status:** governing product contract. Public prototypes of two distinct mechanisms and a facilitator handout exist; no full artistic or research acceptance is claimed.
**Cultural working title:** L'Atelier des possibles.
**Institutional status:** independent, not affiliated with or endorsed by Oulipo.

## Purpose

POELIO is an environment for encountering literature, investigating compositional systems, comparing authored alternatives, and inventing literary possibilities. Its long-term purpose is to support both individual exploration and shared, intergenerational literary workshops.

The platform's basic reusable unit is an **explorable literary work**, with attributed source passages, a model of relevant compositional rules, evidence about formal properties, interpretive questions, and room for original writing.

## The proposed six-stage literary experience

1. **Read:** Encounter a strong, complete passage without immediate formal explanation.
2. **Question:** Develop an interpretation before the underlying constraints are revealed.
3. **Explore:** Manipulate well-defined formal assumptions and discover admissible structures.
4. **Compare:** Read different *existing, authored* passages in their original context. A model configuration must never silently synthesize a manuscript passage.
5. **Invent:** Produce an original constraint or text. Automated scoring and prose generation are excluded from the initial release.
6. **Reflect:** Compare initial and revised interpretations, with transparent historical and formal context.

A typical guided experience is targeted at 12–18 minutes, with optional longer reading.

## Present repository milestone

The repository now includes a separately runnable mathematical explorer and a six-stage public reading application with two original teaching episodes. *Le Registre des clefs* has two authored realizations tied to the fourteen-solution scheduling model; twelve mathematical schedules remain without authored prose. *Les Quatre Témoins* uses a separate 4! permutation model, combining the same four immutable authored fragments in different orders. Those computational arrangements are expressly distinguished from complete alternative texts composed by the author.

A print-ready facilitator guide is included, along with a prospective privacy-preserving workshop protocol. Neither episode has undergone independent literary editorial approval or empirical user evaluation. The unpublished *La Relève* material is not bundled.

The six-stage sequence, literary primacy, human authorship, and strict distinction between formal facts and interpretive claims remain mandatory; these prototypes do not complete the full product.

## Formal and interpretive evidence

- Exact finite-model enumeration is checked through executable tests over 256 schedules; the second mechanism exhaustively checks 24 unique permutations and its 12-rule subset.
- A machine-checked theorem belongs to a pinned proof source and toolchain; no Lean theorem is constructed or replayed by the public explorer.
- A reading of a passage is an interpretation, not a formal guarantee.
- Literary quality is never assigned an automated proof status.
- Out-of-domain rule changes must be labelled as speculative, recomputed and independently checked, or unsupported; they must never impersonate known authored realizations.

## Publication boundaries

Private literary manuscripts are excluded from the public branch, test fixtures, build artifacts and any website deployment. Distribution rights, attribution, archival provenance, and effects on blinded evaluation must be settled before a literary episode goes public.

The independent mathematical explorer uses its own explicit asset inventory. The literary GitHub Pages build is audited against exactly eight approved website files, including the facilitator guide, offline service worker, locally hosted font assets and license notice. No private manuscript or arbitrary repository file is copied into the public website.

## Editorial validation milestone

The next validation path retains the existing two original public demonstration works and six-stage literary journey. Source-derived, unprimed reading packets (`/?review=register` and `/?review=permutation`) and substantial noninteractive companions (`/?companion=register` and `/?companion=permutation`) now exist as independent review instruments. They do not introduce a new literary mechanism or reinterpret the existing Lean proof record.

The first-read materials prioritize actual prose before formal explanation, retain local control of notes, and disclose specific questions only on a subsequent editorial pass. The static companions make a legitimate alternative delivery possible without claiming that exposure time or educational outcomes are matched. Independent editorial reviews, physical workshops, and human-subject research approval have **not occurred**. Refer to `docs/EDITORIAL_REVIEW_PROTOCOL.md` and `docs/STATIC_COMPARISON_PROTOCOL.md` before using these materials.

## Offline continuity for in-person literary workshops

POELIO's publication-safe build now installs a versioned offline cache of its explicitly allowlisted public literary shell after an initial online visit (HTTPS or localhost). Browser tests check reading, companion and facilitator pages during simulated network loss. No unpublished manuscripts, private catalogs, research packets or reader-written work belong in that cache. Authored responses in the public six-stage episodes use session-scoped browser storage, separated by work, for accidental-refresh recovery; reviewer responses stay memory-only to protect unprimed reading confidentiality. This supports the six-stage literary and facilitator experience without adding a backend or changing the authored works.

## Quality gates for a future complete episode

- Reviewed opening passage and coherent guided narrative.
- Provenance checks for every displayed passage; source-byte integrity checks.
- Correct mapping from formal states to the corresponding *authored* realizations.
- Accurate distinction between formal facts and editorial interpretation.
- Keyboard, screen reader, mobile and reduced-motion accessibility checks.
- No participant-writing telemetry without explicit research consent.
- Independent editorial review and manuscript-rights clearance.
- Usability study with an adequate static comparison condition.

**No superiority claim about literary learning or artistic quality is presently established.**

## Shared literary journey controls

The six stages, French/English labels, keyboard focus transfer, and previous/next progression are implemented in one typed shared module (`experience/src/JourneyControls.tsx`). Both existing works use it. Their source passages, formal constructions, authored comparisons, and reader interpretations remain work-specific. Additional literary works must supply their own approved prose and rigorously scoped computation, not a newly improvised navigation system. Browser regression checks cover identical stage order and accessible focus in both works.

## Approved public literary content registry

The browser, first-reading editorial packets and noninteractive companions now use one versioned, strictly allowlisted content registry with separate validators for minimum-repair schedules and fixed-fragment permutations. Source identity is pinned, public release metadata is explicit, and absent authored text stays absent. The independent private importer remains disconnected. New works must undergo source approval, scoped model verification, provenance review and rights clearance before adding another registry entry. The two npm projects now use committed lockfiles and CI installs exactly those resolved dependency sets. See `docs/PUBLIC_CONTENT_CONTRACT.md` for the full acceptance contract.

## Deployment-path compatibility

Both origin-root (`/`) and repository-subpath (`/POELIO/`) hosting layouts have build configurations and separate desktop/mobile regression suites. Workshop links use the configured Vite base, and the approved public-only service worker scopes its cache to the deployment prefix. This protects accessibility to the reader and facilitator experience without authorizing a public deployment or changing any authored material.

## Candidate intake and release-evidence milestones

Two additional pre-publication tools exist without expanding the literary repertoire. A **private-only candidate preflight** validates source hashes, provenance and model-state mappings outside the public checkout. The **public release auditor** issues deterministic root/subpath reports containing verified public artifact checksums, dependency-lock identities, and exact build/CSP/cache checks. Both declare that they establish *technical* conditions only; neither grants publication authorization or validates literary merit.

The complete six-stage literary specification still governs future works. Candidates that pass these machine checks remain private until the original author approves distribution and the required editorial, accessibility and venue-specific publication gates are completed. See docs/RELEASE_AND_CANDIDATE_PREFLIGHT.md.
