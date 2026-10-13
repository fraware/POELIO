# GitHub presentation and release playbook

**Project:** [fraware/POELIO](https://github.com/fraware/POELIO)
**Stage:** research preview. The public code and the two original demonstration texts are already public; the unpublished *La Relève* manuscript is not.

This file makes the repository's GitHub metadata and release decisions explicit. **Committing a README or a metadata suggestion does not update GitHub's About panel, topics, repository homepage, or Releases database.** Verify each of those separately through the GitHub interface/API.

## Recommended GitHub About panel

**Description**

> An open literary laboratory for constrained writing, interactive reading, human creativity, and privacy-first workshops.

**Website**

Keep empty until there is an actually deployed and reviewed website. The repository README is the canonical starting point in the meantime.

**Topics** (GitHub's lowercase, hyphenated repository topics)

\`\`\`text
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
\`\`\`

These are discovery terms, **not** statements of official affiliation. The word \`oulipo\` describes the subject area only; the project is independent and makes no sponsorship claim. Retain GitHub Issues. GitHub Discussions are optional and should be enabled only if maintainer capacity exists.

To update metadata in GitHub, open the repository's **About → gear icon** for the description and website, and **Manage topics** in the About panel. Updating repository metadata requires an authorized maintainer; the source-only CI has no repository administration permissions.

## License classification

- **MIT:** implementation code, tooling, tests, technical diagrams and software documentation.
- **Separate literary permissions:** prose embedded in the two original public demonstration modules.
- **No public grant:** unpublished *La Relève*, fourteen private literary realizations, private catalogs, or research archives.

See [LICENSE](../LICENSE) and [LICENSE-CONTENT.md](../LICENSE-CONTENT.md). The GitHub license detector displaying "MIT" does not override the explicit literary carve-out.

## Prerelease decision

**Current candidate source tag:** \`v0.2.0-rc.2\`  
**Display title:** \`POELIO v0.2.0-rc.2 · Literary research preview\`  
**GitHub classification:** **Pre-release**, not "latest stable" and not "production-ready".  
**Release notes:** [RELEASE_NOTES_v0.2.0-rc.2.md](RELEASE_NOTES_v0.2.0-rc.2.md)

The root and \`experience/\` package manifests intentionally use the same \`0.2.0-rc.2\` prerelease version and remain **private npm packages**. No npm publication is authorized.

Before creating a GitHub Release, verify the intended \`main\` SHA, the relevant successful root/subpath CI runs, the published license boundaries, and any issues with disclosure or prior publication. Release the **normal GitHub source archive only**; never attach a private edition, manuscript ZIP, generated \`catalog.json\`, or research record.

A Release or tag cannot turn a research preview into an editorially approved publication. Record the exact commit SHA and a link to the verified CI run in the release description. If GitHub does not expose a suitable release action through the connected integration, creation is an explicit maintainer action via **Releases → Draft a new release → Choose tag**. Do not label a release as published until GitHub confirms it.

## Checklist for maintainers

- [ ] Repository description and topics agree with this document.
- [ ] MIT license and literary-content notice appear prominently.
- [ ] All relative README/documentation links resolve.
- [ ] Both npm package and lockfile versions match the proposed tag.
- [ ] Root \`check\` and \`literary-experience\` CI jobs pass at the exact release commit.
- [ ] Mathematical enumeration, provenance, and build-allowlist tests pass.
- [ ] Privacy, offline reading, keyboard, reflow, and security regression tests pass.
- [ ] No private material is added to source archives or attachments.
- [ ] Proposed \`rc\` release clearly discloses unverified human and legal acceptance gates.
- [ ] A real deployment and its HTTP header audit are tracked as separate, later decisions.

## What is not ready for a final release

Independent editorial assessment of the prose, manual screen-reader/accessibility evaluation, a real-host HTTPS security audit, publication and research-venue decisions for unpublished work, and empirical workshop evidence. The GitHub prerelease is a **software research-preview artifact only**.

## Release automation

The narrowly scoped `.github/workflows/research-preview-release.yml` watches successful push-to-main completion of `Public source CI`. It creates the single `v0.2.0-rc.2` **prerelease** only if the completed commit still equals the current `main` head and the code/license/source-boundary checks pass. It never attaches private manuscripts or compiled private editions, and refuses to rewrite an existing release. This job has `contents:write` solely for Git tag/release creation; the main CI stays read-only. Verify the actual GitHub Release after the workflow runs. Failed creation must be reported rather than assumed successful.
