# POELIO v0.2.0-rc.2 | Editorial research preview

> **Research prerelease.** A source snapshot of an independently runnable public teaching prototype, not a stable website, independent literary-edition approval, WCAG certification or a claim of educational effectiveness.

## Changes since rc.1

- A unified forest, ivory and copper editorial identity for the six-stage literary reader, independent mathematical companion and printable workshop guide.
- More deliberate literary typography, provenance details, comparisons, evidence presentation and reader reflection surfaces.
- Responsive two-level masthead controls, smaller-screen chapter navigation and clearer shared-device deletion affordance.
- Browser tests for design invariants, 320 CSS-pixel layout and tap-target minimums.
- No changes to the two approved public authored works, their source identities, mathematical procedures, rights terms or protected unpublished literary material.

## Reproduce locally

```sh
git clone https://github.com/fraware/POELIO.git
cd POELIO/experience
npm ci
npm run build
npm run preview
```

Use the Vite local preview URL. The GitHub Release is created only upon successful CI at the exact current main commit. No live website is deployed, and no private manuscripts or researcher records are attached.

## Boundaries

POELIO includes two original public demonstration works in the six-stage sequence Read → Question → Explore → Compare → Invent → Reflect. There are no accounts, AI prose generation or participant-upload services. Writing is session-scoped in the browser (not encrypted) with explicit local text export.

Independent literary editorial acceptance, manual screen-reader/WCAG review, empirical workshop evaluation and actual-host HTTP security checks are outstanding. Copyright permissions for unpublished *La Relève* have not been expanded. POELIO claims no Oulipo affiliation. The application code is MIT-licensed and public authored prose has separate rights under `LICENSE-CONTENT.md`.
