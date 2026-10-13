# Rights-controlled literary content: private-only pipeline

This documentation governs POELIO's content-integrity milestone. It preserves authored passages and formal provenance while reducing the risk of accidental publication. It does not establish that a declaration of ownership or permission is legally valid.

## Separate channels

The public React demonstration under experience/ uses its own original, curated teaching fixture, Le Registre des clefs. The public Vite build and GitHub Actions do not import an unpublished literary archive.

The private importer under tools/ validates independently supplied manuscripts and stages a catalog outside the Git checkout. Its result contains complete original prose and is sensitive. The tool has no public-mode flag, auto-deployment, upload, synchronization or website authentication facility.

A staged private catalog is an unencrypted local file. Public HTTP hosting, Git commits, Pages, Vercel, or unsolicited sharing may expose the text. Neither robots.txt nor noindex is an access-control mechanism.

## General edition manifest, schema version 1

The input is strict UTF-8 JSON with exactly these fields:

- schemaVersion: integer 1.
- work: id, title, author, language, edition.
- rights: channel = private-local, rightsHolder, authorizationRef.
- constraintModel: id = weekly-binary-eight-v1, scope.
- realizations: 2–14 records containing id, schedule (eight letters A/B), faultEdge (0–6), repeatedCaregiver (A/B), passages.
- evidenceClaims: records with id, status, scope, statement, reference. Status is one of EXECUTABLY_CHECKED, ARCHIVED_PROOF_RECORD, EDITORIAL_INTERPRETATION, NOT_ESTABLISHED.

Every passage has id, sourceModule, file and sha256. The digest is computed on exact source bytes before Unicode decoding or Markdown processing. Paths are relative to the supplied source directory. Symlinks and directory escapes are rejected.

The importer independently enumerates 256 binary schedules and their 14 canonical minimum repairs, rejecting duplicates, incorrect repair metadata, digest mismatches, inconsistent source-module identities, invalid text, unknown models and unknown evidence statuses.

This schema supports only the specific eight-position binary model. Further models need separately defined and tested validators.

## Reproduce locally

Python 3.10+ is required, without external dependencies.

    python3 -m unittest discover -s tests -p 'test_*.py' -v
    python3 tools/private_content.py --manifest /private/edition.json --source-dir /private/passages
    python3 tools/private_content.py --manifest /private/edition.json --source-dir /private/passages --private-output /private/derived/catalog.json

Create the private output directory ahead of time. Output within the repository or an existing destination is rejected. On POSIX hosts a new catalog has mode 0600; confirm the filesystem's real access controls when using shared drives or Windows.

For the separately supplied La Relève master archive:

    python3 tools/import_la_releve_master.py --archive /private/La_Releve_v1_4_MASTER_COMPLETE.zip
    python3 tools/import_la_releve_master.py --archive /private/La_Releve_v1_4_MASTER_COMPLETE.zip --private-output /private/derived/la-releve-catalog.json

The specialized archive adapter checks the reader-edition hashes, reader/generated schedule agreement, all fourteen K/L identities, expected B/K/L module labels and eight day/person headings. It does not load blinded-study or evaluation-packet material. It preserves each complete reader file as one authored passage. Chapter-level parsing and the future React private-edition adapter remain separate tasks.

The adapter records archival Lean evidence only. It does not rerun Lean. The computed digest proves source-byte identity, not legal authorization, narrative semantics or literary quality.

## Curated public fixture change control

The public experience includes only its original teaching fixture under experience/src/episode.ts. The public build checks its pinned Git-blob identity against experience/approved-demo.blobsha. This prevents accidental source edits from silently reaching a generated website. The identity pin is **not** evidence of a publication license, nor an absolute safeguard against a maintainer deliberately updating both files. Any proposed new public prose demands separate author/editor approval and a reviewed update of the fixture pin.

## Release and editorial review gates

Before publishing a literary episode, obtain and record rights-holder approval covering the specific distribution channel. Check authorship, quoted passages, annotations, the chosen edition, and consequences for the blinded study. These external approvals are NOT implemented by the importer; the authorizationRef field is a statement supplied by an operator, not authenticated legal evidence.

A new public episode needs a dedicated, independently reviewed publishing process and explicitly cleared material. Private source ZIPs, author manuscripts, blind-evaluation files, derived private catalogs, and complete manuscript hashes should not be placed in public CI, fixture data, issue comments, build output or Git history.

## Limitations

- The validator supports a narrow finite model, not general literary semantics.
- Source identity and source permissions are different questions.
- The browser application currently uses its embedded public fixture. Private catalogs are not loaded by the public experience.
- A repository policy cannot prevent deliberate changes by people with write permission. Set up protected branches, required reviews and release approval separately.
