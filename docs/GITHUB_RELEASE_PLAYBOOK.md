# GitHub presentation and release playbook

**Project:** [fraware/POELIO](https://github.com/fraware/POELIO)
**Stage:** research preview. The public code and the two original demonstration texts are already public; the unpublished *La Relève* manuscript is not.

This file makes the repository's GitHub metadata and release decisions explicit. **Committing a README or a metadata suggestion does not update GitHub's About panel, topics, repository homepage, or Releases database.** Verify each of those separately through the GitHub interface/API.

## Recommended GitHub About panel

**Description**

> An open literary laboratory for constrained writing, interactive reading, human creativity, and privacy-first workshops.

**Website**

**Verified public homepage:** https://fraware.github.io/POELIO/. GitHub Pages is enabled and the SHA-guarded deployment workflow has published reviewed mainline builds. The [GitHub Pages guide](GITHUB_PAGES.md) documents the automated hosted-byte audit and the project's stricter, unmet HTTP-header requirements. Independent device testing remains pending.

**Actually configured topics:** `constrained-writing`, `creative-writing`, `digital-humanities`, `electronic-literature`, `formal-methods`. The extended list below is a proposal rather than the present GitHub metadata.

**Possible additional topics** (GitHub's lowercase, hyphenated repository topics)

```text
digital-humanities
electronic-literature
interactive-literature
creative-writing
constrained-writing
literary-studies
literary-interpretation
oulipo
formal-methods
writing-tools
education
typescript
privacy-first
```

These are discovery terms, **not** statements of official affiliation. The word `oulipo` describes the subject area only; the project is independent and makes no sponsorship claim. Retain GitHub Issues. GitHub Discussions are optional and should be enabled only if maintainer capacity exists.

To update metadata in GitHub, open the repository's **About → gear icon** for the description and website, and **Manage topics** in the About panel. Updating repository metadata requires an authorized maintainer; the source-only CI has no repository administration permissions.

## License classification

- **MIT:** implementation code, tooling, tests, technical diagrams and software documentation.
- **Separate literary permissions:** prose embedded in the two original public demonstration modules.
- **No public grant:** unpublished *La Relève*, fourteen private literary realizations, private catalogs, or research archives.

See [LICENSE](../LICENSE) and [LICENSE-CONTENT.md](../LICENSE-CONTENT.md). The GitHub license detector displaying "MIT" does not override the explicit literary carve-out.

## Published immutable research prerelease

**Verified GitHub release:** [`v0.2.0-rc.3`](https://github.com/fraware/POELIO/releases/tag/v0.2.0-rc.3)  
**Published:** 14 October 2026  
**Exact source commit:** `171c95bd91f0c79e2d8270b86e065f0609b8a9a9`  
**GitHub title:** `POELIO v0.2.0-rc.3 | Literary research preview`  
**Classification:** a **published prerelease**, not stable or production-certified. It has **zero additional attached assets**.  
**Release notes:** [rc.3](RELEASE_NOTES_v0.2.0-rc.3.md).

The root and `experience/` packages retain the base version `0.2.0-rc.3` and are **private npm packages**. They are not published to npm. The **live GitHub Pages site follows subsequently tested `main` commits**, while the tagged source archive is immutable. A matching package version does not imply that `main` equals the prerelease source commit.

### Verified checks and explicit human gates

- [x] Repository description, public Pages URL, and five configured GitHub discovery topics verified.
- [x] MIT software license and separate literary permissions documented.
- [x] Published rc.3 GitHub prerelease verified, with no additional uploaded assets.
- [x] Root and literary-app test, browser, privacy, model, source-pin, dependency and build-byte gates run on reviewed `main` commits; verify **exact SHA** before reusing a result.
- [x] CI-gated Pages workflow verifies the exact eight public files using served HTTPS SHA-256 digests.
- [x] Documentation links, index, versions and rights markers have a CI gate.
- [ ] Independent editorial critiques, novice usability observations, real NVDA/VoiceOver and zoom acceptance are **still outstanding**.
- [ ] Additional discovery topics and any production HTTP-host decisions require authorized human review.

For a **future** source prerelease, verify its tagged SHA, CI evidence, content permissions and venue effects. Attach no private manuscript, research dataset, reader responses or internal edition ZIP. Never rewrite an old tag to follow moving `main`.

## What is not ready for a final release

Independent editorial assessment of the prose, manual screen-reader/accessibility evaluation, a real-host HTTPS security audit, publication and research-venue decisions for unpublished work, and empirical workshop evidence. The GitHub prerelease is a **software research-preview artifact only**.

## Release automation

The narrowly scoped `.github/workflows/research-preview-release.yml` watches successful push-to-main completion of `Public source CI`. It creates the single `v0.2.0-rc.3` **prerelease** only if the completed commit still equals the current `main` head and the code/license/source-boundary checks pass. It never attaches private manuscripts or compiled private editions, and refuses to rewrite an existing release. This job has `contents:write` solely for Git tag/release creation; the main CI stays read-only. Verify the actual GitHub Release after the workflow runs. Failed creation must be reported rather than assumed successful.
