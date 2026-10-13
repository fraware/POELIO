# The POELIO library

*An editorial map of the project, from the first page to the technical evidence.*

The best starting point is the [main README](../README.md), followed by the **literary experience** in [\`experience/\`](../experience/README.md). The materials below separate literary intent, participation, content control, and machine evidence.

## I. The work

| Document | Question |
|---|---|
| [Product contract](PRODUCT_SPEC.md) | What literary encounter is POELIO trying to create? |
| [Editorial art direction](ART_DIRECTION.md) | How the literary interface is composed and tested |
| [Editorial quality gate](EDITORIAL_QUALITY_GATE.md) | What justifies calling a text artistically successful? |
| [Independent reading protocol](EDITORIAL_REVIEW_PROTOCOL.md) | How do we collect a reader's unprimed reaction? |
| [Static-comparison protocol](STATIC_COMPARISON_PROTOCOL.md) | How does an interactive literary experience compare to a complete static explanation? |
| [Workshop pilot](WORKSHOP_PILOT.md) | What could a 60-minute intergenerational session look like? |

## II. The system

| Document | Scope |
|---|---|
| [Architecture](ARCHITECTURE.md) | Model, reader, public/private isolation and data flows |
| [Public content contract](PUBLIC_CONTENT_CONTRACT.md) | Allowlisted original texts, provenance, and scope of release |
| [Content integrity](CONTENT_INTEGRITY.md) | Source hashes, private import gates, and formal state mapping |
| [Release and candidate preflight](RELEASE_AND_CANDIDATE_PREFLIGHT.md) | Synthetic preflight, exact-byte builds and explicit nonauthorization |
| [Hosting security contract](HOSTING_RESPONSE_HEADERS.md) | Strict HTTP response requirements and host limitations |
| [GitHub Pages deployment](GITHUB_PAGES.md) | CI-gated static publication, required Pages activation and repository metadata |

## III. Evidence and care

| Document | Boundary |
|---|---|
| [Accessibility acceptance](ACCESSIBILITY_ACCEPTANCE.md) | What automation checks, and what people still need to test |
| [Security and privacy](SECURITY_PRIVACY_ACCEPTANCE.md) | What stays local, and residual threats |
| [Release notes](RELEASE_NOTES_v0.2.0-rc.2.md) | Current research-preview candidate and explicit limitations |
| [Repository settings and release checklist](GITHUB_RELEASE_PLAYBOOK.md) | GitHub description, topics, release governance and explicit pending settings |
| [Changelog](../CHANGELOG.md) | Engineering milestones and their limits |
| [Permissions for literature](../LICENSE-CONTENT.md) | The boundary between MIT software and separately reserved prose |

## The governing rule

Literature precedes mechanism. A finite computation establishes only its stated formal property. A source reference establishes provenance, not authorship consent. An editorial reading establishes a perspective, not a theorem. A technically reproducible release is not itself a permission to publish.
