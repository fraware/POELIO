# POELIO

**A literary atelier for exploring the possibilities of writing.**

POELIO brings together literature, creative constraints, and interactive reading. Each work begins as a text to encounter on its own terms. Readers then investigate a compositional rule, compare its effects, and write something of their own.

The project is open source, independent, and designed for readers, writers, educators, and researchers interested in the relationship between literary form and invention.

[Get started](#get-started) · [The reading experience](#the-reading-experience) · [Development](#development) · [Documentation](docs/INDEX.md)

## The reading experience

Each work unfolds through six connected movements.

1. **Read.** Begin with the literature, before its construction is explained.
2. **Question.** Record an initial impression or interpretation.
3. **Explore.** Experiment with the work's compositional constraints.
4. **Compare.** Examine actual passages or different arrangements of the same writing.
5. **Invent.** Create a rule and compose a literary response.
6. **Reflect.** Return to the first reading and consider what has changed.

The interface is available in French and English; the literary texts retain their original French.

### Two works to explore

**Le Registre des clefs** presents a story organized around an eight-position relay. Its rules produce a contradiction. Readers explore fourteen minimal ways to resolve it and compare the two literary realizations written for this demonstration. The other configurations have no accompanying prose.

**Les Quatre Témoins** explores narrative order. Four fixed, authored fragments admit twenty-four arrangements, twelve of which satisfy an additional ordering constraint. Readers change the sequence while every fragment's wording stays the same.

The two works introduce different techniques of constrained writing. In each, the software distinguishes what follows from a formal rule from what belongs to literary interpretation.

## Get started

Requires Node.js 22.12 or later and npm.

```bash
git clone https://github.com/fraware/POELIO.git
cd POELIO/experience
npm ci
npm run dev
```

Open the local URL displayed by Vite. To run a production build locally:

```bash
npm run build
npm run preview
```

The application is a static website. For GitHub Pages publication and hosting instructions, see [Deployment](docs/GITHUB_PAGES.md).

## Made for reading and writing

POELIO includes side-by-side comparison, keyboard-accessible navigation, local text export, and a printable facilitator guide for workshops. The public application supports offline reading in compatible browsers once the site has loaded successfully.

Writing stays in the reader's browser tab, with no account or application-side submission service. Drafts use session storage and are not a permanent backup; export anything worth keeping. POELIO does not use generative AI to write passages, score creative work, or analyze personal responses.

## Development

The repository keeps the literary experience and its underlying computational models distinct.

```text
experience/          Interactive literary application (React, TypeScript, Vite)
src/                 Finite compositional model
public/              Standalone mathematical explorer
tests/               Model and repository checks
docs/                Design, architecture, and research documentation
```

From the repository root, run the mathematical model tests:

```bash
npm ci
npm test
```

For application checks and browser tests:

```bash
cd experience
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The source includes unit tests, browser interaction checks, accessibility automation, and reproducible build tooling. For implementation details, see [Architecture](docs/ARCHITECTURE.md) and the [application README](experience/README.md).

## Contribute

Contributions to accessibility, interface design, translations, tests, documentation, and software engineering are welcome. Please read [Contributing](CONTRIBUTING.md) before opening a pull request. Report security issues according to [Security](SECURITY.md).

The software is distributed under the [MIT License](LICENSE). The authored literary passages included in the demonstrations have [separate reuse terms](LICENSE-CONTENT.md).

For academic use, cite the repository and the specific revision used; a [citation file](CITATION.cff) is included.

POELIO is an independent project, without institutional affiliation with Oulipo.
