# POELIO | Editorial art direction

**Status:** visual implementation contract for the public research prototype. Not an independent literary review or accessibility certification.

## The page comes first

POELIO is a reading room, not a control panel. The reader encounters actual prose before the constraints. The six movements remain **Lire → Questionner → Explorer → Comparer → Inventer → Revenir**. Mechanism and evidence support attention to literature; no interface may invent unwritten passages, score artistic merit, or reveal the unpublished *La Relève* manuscript.

## Palette and typography

| Role | Value | Intent |
|---|---|---|
| Forest | \`#193a31\` | Identity and primary controls |
| Dark ink | \`#102b24\` | Literary headings |
| Paper | \`#f8f6f0\` | Reading-room background |
| Page | \`#fffdfa\` | Manuscript surfaces |
| Copper | \`#a87245\` | Editorial rules and stage indicator |
| Sage | \`#e8eee5\` | Formal evidence and selected arrangements |

Georgia/Times serve literary titles and passages; the device's system sans-serif serves actions and annotations. There are no remote font files or design-image requests. The six-movement masthead [in the repository](assets/poelio-masthead.svg) and the application use a related, deliberately restrained forest-and-paper identity.

## Reader experience

Authored prose is typeset at a narrower measure than the surrounding controls, with ample whitespace, a source label, and a discreet manuscript boundary. Technical facts are presented in subdued evidence panels. The two-work comparison uses two balanced pages on large screens and one column on narrower screens. Reader text wraps without truncation.

At 320 CSS pixels, the stages scroll **inside** the navigation surface, not the whole page. Destructive shared-device clearing is explicit. The chapter footer gives a compact count without trapping the primary navigation buttons in wrapping text.

The independently runnable mathematics-only explorer is visually related, while remaining clearly labelled as a mathematical companion. The printable facilitator document uses the same editorial hierarchy and provides a grayscale-compatible print layout.

## Inclusive design and verification

Test visible focus, keyboard navigation, touch-target dimensions, 320px reflow, two-column reading order, reduced motion, high-contrast/forced-color behavior, and both French/English controls. Automated assertions live in \`experience/tests/editorial-design.spec.ts\` alongside accessibility and privacy tests.

These checks prevent mechanical regressions. **They cannot establish full WCAG 2.2 AA, successful screen-reader interaction, universal aesthetic appeal, or literary merit.** Those acceptance decisions require direct human assessment on relevant devices.

## Boundaries

No third-party analytics, cloud writing storage, third-party font requests, AI text generation, gamified writing score, additional literary mechanism or silent manuscript import is warranted by a design refresh. Original authored sources retain their exact pins. Website deployment and literary rights authorization are distinct release gates, and no official Oulipo relationship is claimed.

Design changes must be evaluated against the [product contract](PRODUCT_SPEC.md), [accessibility acceptance](ACCESSIBILITY_ACCEPTANCE.md) and [public content contract](PUBLIC_CONTENT_CONTRACT.md).
