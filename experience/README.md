# POELIO literary experience

The POELIO reader is a static, bilingual application for exploring literary constraints through reading, comparison, and original writing. It contains two authored demonstration works and follows a consistent six-stage journey: **Read → Question → Explore → Compare → Invent → Reflect**.

On narrow screens, the current stage appears above a native six-stage selector. On wider screens, all six stages appear as direct navigation buttons. The Previous/Next controls continue to work in either layout. Changing stages leaves the reader's writing and chosen formal configuration unchanged.

Built with React, TypeScript, and Vite. No account, backend, or generative writing service is needed. The [current-state overview](../docs/CURRENT_STATUS.md) separates software verification from unfinished independent human assessment.

The site opens with an introduction at `/`. The catalogue is at `/?view=works`, with workshop and project information at `/?view=atelier` and `/?view=about`. The works are available at `/?work=register` and `/?work=permutation`. The entire site uses locally distributed Source Sans 3 with its SIL OFL license.

## Run locally

Use Node.js 22.12 or later and npm. From the repository root:

```bash
cd experience
npm ci
npm run dev
```

Vite prints the local development URL. To inspect the production build:

```bash
npm run build
npm run preview
```

## What readers do

### Le Registre des clefs

Readers encounter a short literary work, propose an interpretation, and explore a finite scheduling constraint. There are fourteen minimal resolutions of the constraint and two authored texts available for comparison. The interface explicitly distinguishes the mathematical configurations from the passages that have been written.

### Les Quatre Témoins

Readers work with four authored narrative fragments. The interface explores all twenty-four possible orders and the twelve arrangements satisfying a specified precedence rule. Comparisons preserve every word of the source fragments.

Both works include optional writing prompts, a free composition stage, reflection, and local TXT export. Readers who have written an initial interpretation can reopen it deliberately within Explore and Compare; the note stays collapsed by default. At Compare, the interface states whether the explored configuration has an authored realization, and supplies a direct return to the unchanged exploration state. In the writing and reflection stages, readers can also open a locally managed, restorable JSON backup for that work and its selected formal configuration. The surrounding controls have French and English translations; the literary passages remain in French.

## Reading and workshop routes

The application also provides pages suited to first readings and facilitated discussion. These routes are relative to the application base URL:

| Route | Content |
|---|---|
| `/` | Project introduction |
| `/?view=works` | Work catalogue |
| `/?view=atelier` | Workshop orientation |
| `/?view=about` | Project method and permissions |
| `/?work=register` | Interactive six-stage experience for *Le Registre des clefs* |
| `/?work=permutation` | Interactive six-stage experience for *Les Quatre Témoins* |
| `/?review=register` | First reading of *Le Registre des clefs* |
| `/?review=permutation` | First reading of *Les Quatre Témoins* |
| `/?companion=register` | Written companion to *Le Registre des clefs* |
| `/?companion=permutation` | Written companion to *Les Quatre Témoins* |
| `/facilitator.html` | Printable workshop guide |

For an independent first reading, share the review route before the explanatory companion. The [reader field kit](../docs/INDEPENDENT_READER_FIELD_KIT.md) separates invitation, first-response, later revelation, novice observation and independent accessibility checks. No reader data is gathered automatically.

## Reader data

Drafts for the interactive works are held in per-tab `sessionStorage`, with an in-memory fallback in browsers that restrict storage. They survive some refreshes, but are not durable or encrypted. Local export is an explicit reader action. First-reading review notes stay in memory until the page is reloaded.

The application does not collect writing on a server, send it to a model, or install analytics. Ordinary static-site requests still pass through the chosen hosting provider. See [Privacy and security](../docs/SECURITY_PRIVACY_ACCEPTANCE.md).

## Test and build

From `experience/`:

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite exercises the literary journey, comparison, storage behavior, keyboard access, narrow-screen layout, and automated accessibility checks.

For a repository-scoped deployment such as GitHub Pages:

```bash
npm run build:subpath
npm run audit:subpath
npm run test:subpath
```

The application uses the `/POELIO/` base for this variant. Each build replaces `dist/`; build the intended deployment variant last. Publication is managed by [GitHub Pages deployment](../docs/GITHUB_PAGES.md).

## Code organization

| Path | Responsibility |
|---|---|
| `src/App.tsx` | First literary work and shared reader interface |
| `src/PermutationExperience.tsx` | Fragment-order experience |
| `src/JourneyControls.tsx` | Six-stage navigation |
| `src/contentCatalog.ts` | Literary work registration and source validation |
| `src/episode.ts`, `src/permutation.ts` | Authored content and compositional rules |
| `src/useSessionDraft.ts` | Local draft storage |
| `src/ReviewPackets.tsx` | Independent reading and companion pages |
| `src/styles.css` | Editorial layout and responsive design |
| `tests/` | Browser regression suite |
| `scripts/` | Build, offline, and release checks |

The finite mathematical model is shared with the repository root. Details of the content representation and its tested properties are in [Architecture](../docs/ARCHITECTURE.md).

## Contributing and permissions

See the repository's [contribution guidelines](../CONTRIBUTING.md). Application code is [MIT-licensed](../LICENSE); demonstration literature has [separate reuse terms](../LICENSE-CONTENT.md). The [documentation index](../docs/INDEX.md) contains architectural references, accessibility guidance, and workshop materials.
