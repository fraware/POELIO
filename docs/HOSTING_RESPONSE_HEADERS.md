# POELIO — Static host HTTP acceptance contract

**Status:** checked locally against synthetic server responses. No production host has been configured, audited or authorized. This document concerns the already-approved public literary teaching works only.

## Why HTTP headers matter

POELIO's HTML has a strict Content Security Policy via a meta tag. Several defenses require **HTTP response headers** and are not supplied by the meta tag, notably frame embedding restrictions (frame-ancestors), HSTS and some browser-isolation policies. A root build and a /POELIO/ build can be correct on disk while an actual host distributes files with weaker policies or substitutes other bytes.

The automated host verifier, experience/scripts/audit_host_headers.mjs, accepts an HTTPS base URL and the matching, already-produced technical release manifest. It retrieves all eight approved files from that host, rejects redirects and non-200 responses, verifies MIME types and checks their SHA-256 identities. It does not write any prose or browser responses to disk.

## Required response headers

Every approved HTML, JavaScript, CSS and service-worker response must include these policies (equivalent ordering of CSP directives is accepted):

| Header | Required policy |
|---|---|
| Content-Security-Policy | default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; worker-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none' |
| Referrer-Policy | no-referrer |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Cross-Origin-Opener-Policy | same-origin |
| Cross-Origin-Resource-Policy | same-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=() |
| Strict-Transport-Security | max-age of at least 31536000 seconds on real HTTPS hosts |
| Cache-Control | no-cache or no-store for HTML and service-worker responses |

Additionally, index.html and facilitator.html must be served as text/html, CSS as text/css, and JavaScript/worker files as text/javascript or application/javascript. The already-audited file sizes and SHA-256 digests must match the actual decoded response bodies. HTTPS is mandatory except for localhost/127.0.0.1 test environments.

Hosts with restrictive platform defaults or inability to set headers are **not** automatically approved. A service such as a basic repository-pages host might not support all required response headers; use a host with explicit header configuration and verify the deployed responses before launch. No assumption is made about what a platform actually serves.

## Reproducible synthetic check

    cd experience
    npm run test:host-headers

This runs positive and negative tests for a correct HTTPS fixture, wrong byte identity, a changed base path, HTTP downgrade, redirect responses, missing CSP/frame restrictions, missing HSTS, missing browser permissions and incorrect MIME metadata. The tests have no private literary text and no network requirement.

## Prospective real-host verification

1. Obtain separate and explicit authorization to deploy only the existing reviewed public teaching demos.
2. Build the intended root or repository-subpath variant, preserving the strict eight-file public allowlist.
3. Run npm run audit:root or npm run audit:subpath and retain the generated release-audit JSON **outside** the published website tree.
4. Configure all HTTP headers on the chosen hosting provider and serve exactly the audited files over HTTPS.
5. Execute the live audit against the actual host, e.g.:

       node scripts/audit_host_headers.mjs https://example.org/POELIO/ release-audit/subpath.json

6. Confirm an independently reviewed deployment decision, human accessibility checks and any other applicable publication requirements.

The live verifier emits a technical-only success report containing hashes of approved public assets. It does not establish editorial merit, authorship permissions, privacy compliance of the hosting provider, or a complete security certification. It explicitly records publicationAuthorized=false.

## Shared-device limitation

Public episode drafts are retained in per-tab sessionStorage to prevent accidental loss on refresh. Browser session restoration can preserve these drafts beyond the moment a facilitator expects. Reset deletes the active work's drafts, not every work on that browser profile. The private editorial review form is memory-only. Dedicated browser profiles, controlled exports and deliberate clearing are prudent for physical workshops. These facts are not resolved by HTTP headers.

**No deployment is performed by this repository workflow.**
