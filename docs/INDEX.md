# Documentation

POELIO combines literary reading, constrained composition, and a small, verifiable computational model. The guides below describe the application, its editorial approach, and its implementation.

Start with the [project README](../README.md) or the [application guide](../experience/README.md).

## Strategy and reuse

- [Impact and reuse roadmap](IMPACT_REUSE_ROADMAP.md) — gated delivery plan, reusable interactions, workshop assets, evaluation criteria and priority GitHub issues.
- [Reusable ordering engine](INTERACTION_ENGINE.md) — immutable ID-based movement, bounded undo/redo, constraint rejection and synthetic tests.
- [Eight-day workspace](REGISTER_WORKSPACE.md) — editable binary assignments, finite-model diagnostics, undo/redo and publication boundaries.
- [Portable reader backups](PORTABLE_READER_BACKUPS.md) — strict JSON v1 export/import, local-only restoration, non-overwriting merge and source-revision checks.


## Reading and teaching

- [Site design system](SITE_DESIGN_SYSTEM.md) — architecture, typography and acceptance criteria for the public site.

- [Product design](PRODUCT_SPEC.md) — the six-stage reading and writing experience.
- [Editorial art direction](ART_DIRECTION.md) — typography, layout, and interaction principles.
- [Workshop guide](WORKSHOP_PILOT.md) — a proposed 60-minute facilitated session.
- [Reading review](EDITORIAL_REVIEW_PROTOCOL.md) — independent first-reading procedure.
- [Literary evaluation](EDITORIAL_QUALITY_GATE.md) — qualitative review criteria.
- [Static comparison](STATIC_COMPARISON_PROTOCOL.md) — comparison with a written explanation.

## Engineering

- [Architecture](ARCHITECTURE.md) — applications, content models, and data flow.
- [Literary content interface](PUBLIC_CONTENT_CONTRACT.md) — work registration, provenance, and finite-model validation.
- [Content integrity](CONTENT_INTEGRITY.md) — source identity and reproducibility.
- [Accessibility](ACCESSIBILITY_ACCEPTANCE.md) — browser checks and manual testing procedures.
- [Privacy and security](SECURITY_PRIVACY_ACCEPTANCE.md) — storage, threat model, and browser behavior.

## Build and release

- [GitHub Pages](GITHUB_PAGES.md) — deployment of the static reader.
- [Hosting requirements](HOSTING_RESPONSE_HEADERS.md) — response-header security expectations.
- [Release verification](RELEASE_AND_CANDIDATE_PREFLIGHT.md) — build and source checks.
- [Releases](GITHUB_RELEASE_PLAYBOOK.md) — repository publication procedures.
- [Release notes](RELEASE_NOTES_v0.2.0-rc.2.md) — latest published source prerelease.
- [Changelog](../CHANGELOG.md) — software history.

For contributing code or editorial improvements, read [Contributing](../CONTRIBUTING.md). The application code and literary material have separate terms described in [Copyright and permissions](../LICENSE-CONTENT.md).
