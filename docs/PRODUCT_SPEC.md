# POELIO — Product contract v0.1

**Status:** proposed product direction; public mathematical foundation implemented.
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

The published **model explorer** deliberately demonstrates only stage 3: an eight-position binary schedule with incompatible alternation and recurrence rules, and its fourteen labelled minimum-repair configurations. It has no literary manuscript, authorial comparison, workshop accounts, or AI generation.

This is not presented as completion of the full six-stage product.

## Formal and interpretive evidence

- Exact finite-model enumeration is checked through executable tests over 256 schedules.
- A machine-checked theorem belongs to a pinned proof source and toolchain; no Lean theorem is constructed or replayed by the public explorer.
- A reading of a passage is an interpretation, not a formal guarantee.
- Literary quality is never assigned an automated proof status.
- Out-of-domain rule changes must be labelled as speculative, recomputed and independently checked, or unsupported; they must never impersonate known authored realizations.

## Publication boundaries

Private literary manuscripts are excluded from the public branch, test fixtures, build artifacts and any website deployment. Distribution rights, attribution, archival provenance, and effects on blinded evaluation must be settled before a literary episode goes public.

The initial public build intentionally copies only \`index.html\`, \`style.css\`, \`explorer.js\` and \`model.js\`. An unlisted file cannot be deployed by the build script.

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
