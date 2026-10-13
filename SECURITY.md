# Security policy

## Supported status

POELIO is a **research preview**, not a production service. The maintained security baseline is the latest commit on `main`; no deployed website or customer-hosting environment is represented as supported. An old archived build or release candidate is not automatically patched.

The application uses no accounts, backend participant store, AI inference endpoint, or analytics integration. Public creative drafts live in per-tab browser session storage, with a memory-only fallback; **session storage is not encrypted or guaranteed erased**. Review notes are memory-only.

## Reporting a vulnerability

Please **do not publish exploit details, private content, tokens, or personal information in a public issue**. Use GitHub's [private vulnerability reporting / repository security page](https://github.com/fraware/POELIO/security) if the maintainer has enabled that feature. If private reporting is not available, contact the maintainer privately through a preexisting verified channel before sharing a reproducible disclosure.

A useful report includes the affected commit, clear reproduction steps with synthetic data, observed impact, and an expected safety boundary. Never attach unpublished *La Relève* manuscripts or real participant records.

## Existing automated gates

- Locked dependency installation and vulnerability audits, including development tools.
- SHA-pinned software source fixtures and fail-closed public static-asset inventory.
- Tests for unexpected network transmission, inappropriate browser persistence, shared-device handoff, and offline cache boundaries.
- Exact-byte release evidence and prospective hosted-header contract checks.
- Desktop/mobile browser regression suites.

These are **engineering checks**, not an independent penetration test. Live-host HTTP headers and manual accessibility acceptance remain to be verified before any broader deployment.

See [security and privacy acceptance](docs/SECURITY_PRIVACY_ACCEPTANCE.md) and [host security requirements](docs/HOSTING_RESPONSE_HEADERS.md).
