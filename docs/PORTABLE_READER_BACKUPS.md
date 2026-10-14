# Portable reader backups (JSON v1)

**Status:** reader-owned, explicit local download and local import for the two publicly approved POELIO teaching works. This is a portable draft format, **not** a publication or authorship record, a collaborative store, an encrypted vault, or a promise of lifetime compatibility.

## For readers

Open an approved literary work and choose **Sauvegarder ou restaurer (JSON)** from the writing or reflection stage. The same action is also available under **Options → Sauvegarder ou restaurer** (in English: **Options → Back up or restore**). Closing the panel returns keyboard focus to the control used to open it.

- **Export JSON backup** downloads a `poelio-register-backup-v1.json` or `poelio-permutation-backup-v1.json` file. It contains the four reader-authored fields and the active formal arrangement. Keep it in a location under your control.
- **Restore from a JSON file** opens a local file picker. The application reads and validates the file inside the browser. Nothing is submitted to a server.
- **Merge without overwriting** copies imported answers **only into empty text fields**. It leaves every existing nonempty answer and the current model configuration unchanged.
- **Replace this work** explicitly asks for confirmation. On approval, it restores all four imported fields and the work-specific configuration. A cancellation leaves current content alone.
- A backup belongs to **one** work and to the **exact pinned source revision** of its public teaching text. A file for the other work, a different revision, a future incompatible schema, unknown fields or invalid arrangement is rejected before any state changes.

The existing human-readable `.txt` export remains available from the writing and reflection stages. A TXT document is meant for reading and archiving; it is **not** the machine-restorable backup.

Backups are **plain text JSON**. Anyone with access to a downloaded file may read its content. Protect and delete these files using your device's own facilities. POELIO does not delete exported files or drafts in other tabs. Duplicating a tab or opening a same-origin window with an opener can also copy the initial sessionStorage draft values. Drafts still reside in the current tab's `sessionStorage` with a memory-only fallback if storage is blocked; importing updates that same local session. There are no accounts, telemetry, cloud inference, or document uploads.

## Format contract

`experience/src/readerBackup.ts` contains the canonical types and the fail-closed parser. The following TypeScript excerpt shows the structure without including literary prose:

```ts
type ReaderBackupV1 = {
  format: 'poelio-reader-backup';
  version: 1;
  catalogVersion: 1;
  work: 'register' | 'permutation';
  sourceRevision: string; // Public catalog source identity + "#" + pinned Git blob SHA
  drafts: {
    initial: string;
    revised: string;
    rule: string;
    writing: string;
  };
  configuration:
    | {kind: 'register'; values: ['A'|'B','A'|'B','A'|'B','A'|'B',
                                  'A'|'B','A'|'B','A'|'B','A'|'B']}
    | {kind: 'permutation'; order: ['door'|'letter'|'question'|'bell',
                                    'door'|'letter'|'question'|'bell',
                                    'door'|'letter'|'question'|'bell',
                                    'door'|'letter'|'question'|'bell'];
       limited: boolean};
};
```

For the permutation branch, the parser checks **all four distinct fragment IDs** and their exact count, not just the tuple shape. The register branch checks **eight binary assignments**. Non-minimum schedules and arrangements that disagree with an enabled order rule are preserved as selected, since the existing interaction explicitly allows those current states. No imported configuration is automatically repaired.

The `sourceRevision` includes each source's reviewed Git blob ID, imported from the same `approved-*.blobsha` files used by the fixture-verification release gate. These IDs identify the bundled public prose; they are not a digital signature of the exported draft or proof that a reader authored it.

Limits: maximum JSON file size **512 KiB**; text field limits `initial` 100,000 characters, `revised` 100,000, `rule` 400 and `writing` 150,000. UTF-8 decoding rejects malformed bytes; file size is checked **before** reading the contents. Strict records and source identities reject unexpected keys or unsupported versions. Neither importing nor exporting installs executable code.

## Boundaries and acceptance

- Work-specific restoration does **not** modify the other work's answers or state. Existing version-1 session keys are unchanged.
- No additional browser persistence, service worker cache entry, IndexedDB database, localStorage item, response upload or new server is introduced.
- Importation is staged: a valid file alone never modifies the form. An explicit merge/replace action is mandatory; replace requires a further confirmation.
- The scope is reader-authored notes and a *reference* to an approved formal configuration. **No authored passages, private manuscripts, reader-study material, or unpublished La Relève text are part of the backup format.**
- Tests cover Unicode and multiline round-trips, malformed and oversized files, cross-work and cross-revision rejection, exact field/schema validation, non-overwriting merge, replace confirmation, session isolation, no outbound participant requests, storage-disabled operation, root/subpath builds, automated accessibility and mobile reflow.
- A technical green CI is not evidence of user-tested recoverability across every browser or future release. Any future backup version or migration needs a separately reviewed, explicit conversion plan; older unknown versions must **not** be silently imported.

## Implementation guide

Use `createReaderBackup(work,drafts,configuration)` and `serializeReaderBackup` for exports. Use `parseReaderBackup(text,expectedWork)` after a size-limited, strict UTF-8 file read. Use `mergeReaderDrafts(current,incoming)` only for a reader-selected, non-destructive merge. The UI is `PortableBackupPanel.tsx`; the two experiences remain responsible for their own state and model-specific restoration. These helpers perform no network or storage actions.

This architecture permits another application or authorized teaching experience to adopt the *format principles* and parser pattern without reusing POELIO's copyrighted demonstration prose. Any third-party app must define and review its own scope, source identity, rights and migration policy.
