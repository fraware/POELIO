# POELIO — Accessibility acceptance protocol

**Target:** WCAG 2.2 AA. **Status:** automated tests added; manual assistive-technology review outstanding.

## Automated verification

The Playwright suite at experience/tests/accessibility.spec.ts runs the pinned axe-core Playwright engine on the register's reading, formal exploration, comparison, and invention stages; on the permutation reading, constrained exploration, comparison, and reflection stages; and on the printable facilitator guide. The suite explicitly includes supported WCAG A/AA rules through 2.2.

Tests also check navigation focus, correct HTML language on return from one episode to another, and English-language interface switching while original French prose retains its source language.

Axe is injected only during testing with a CSP bypass. The built application keeps its original Content Security Policy. Passing these automated tests cannot establish full accessibility, nor does this repository claim certification.

## Manual verification required before public release

- [ ] Full keyboard-only journey through both six-stage episodes: Tab, Shift+Tab, Enter, Space, arrows, native selects; no focus traps and visible focus.
- [ ] NVDA + Chrome and VoiceOver + Safari on actual devices: heading structure, active stage, literary text pronunciation, interactive results, and downloads.
- [ ] Confirm document language switches between FR and EN for UI labels while French literary passages remain identified as French.
- [ ] Test at 320 CSS px, 200% and 400% zoom, landscape and portrait, text spacing overrides, high-contrast settings, and reduced motion.
- [ ] Verify color contrast on actual backgrounds, including focus indicators and controls, beyond checks performed by axe.
- [ ] Check side-by-side comparison reading order and intelligibility on a single-column narrow layout.
- [ ] Confirm reset confirmation, download initiation, and return from the second episode are operable and clearly announced.
- [ ] Print facilitator guide in grayscale on A4, review table page breaks, and ensure legible spacing.
- [ ] Check long user-authored text, diacritics, and bidirectional content for overflow and correct export.
- [ ] Include reviewers using assistive technologies before sign-off.

Accessibility is a condition of the literary encounter, not an ornamental compliance score. All blocking findings should be documented as reproducible issues with regression tests.

References: https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
