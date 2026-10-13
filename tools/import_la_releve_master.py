"""Validate the archived La Relève master and stage a catalog for LOCAL use only.

Requires the master archive supplied privately by its rights holder. The archive,
its passage bytes, and derived catalog must never be committed to public Git.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import tempfile
import zipfile
from pathlib import Path

try:
    from tools.private_content import (ContentError, MODEL_ID, MAX_PASSAGE_BYTES,
                                       canonical_schedules, validate_manifest,
                                       write_private_catalog)
except ModuleNotFoundError:
    from private_content import (ContentError, MODEL_ID, MAX_PASSAGE_BYTES,
                                 canonical_schedules, validate_manifest,
                                 write_private_catalog)

PREFIX = "La_Releve_v1_4_MASTER_COMPLETE/COMPLETE_WORKSPACE/"
DAYS = ("mon0", "tue", "wed", "thu", "fri", "sat", "sun", "mon1")
MAX_METADATA = 256_000


def archive_read(z: zipfile.ZipFile, relative: str, byte_limit: int) -> bytes:
    """Read a known archive member only, with a strict uncompressed size bound."""
    path = PREFIX + relative
    try:
        info = z.getinfo(path)
    except KeyError as exc:
        raise ContentError(f"Missing required master member: {relative}") from exc
    if info.is_dir() or info.file_size > byte_limit:
        raise ContentError(f"Unexpected archive member size/type: {relative}")
    data = z.read(info)
    if len(data) != info.file_size:
        raise ContentError(f"Archive member has inconsistent size: {relative}")
    return data


def read_json(z: zipfile.ZipFile, relative: str):
    try:
        return json.loads(archive_read(z, relative, MAX_METADATA))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ContentError(f"Invalid archive metadata JSON: {relative}") from exc


def check_reader_headings(text: str, schedule: str) -> None:
    """Check eight day headings and assignments without rewriting the literary text."""
    if not text.startswith("# La Relève\n"):
        raise ContentError("Unexpected reader edition top-level heading")
    headings = re.findall(r"^## ([^\n]+)\s*$", text, flags=re.MULTILINE)
    if len(headings) != 8:
        raise ContentError("Expected exactly eight reader day chapters")
    for day, label in enumerate(headings):
        caregiver = "Élise" if schedule[day] == "A" else "Thomas"
        if "— " + caregiver not in label:
            raise ContentError("Reader heading does not match assigned caregiver")


def validate_master_archive(archive: Path, temporary_source_directory: Path) -> dict:
    """Construct a private catalog from verified complete reader editions.

    This verifies textual identity and finite-model metadata; it does not prove
    the literary content's meaning or publication rights.
    """
    repairs = canonical_schedules()
    with zipfile.ZipFile(archive, "r") as z:
        reader = read_json(z, "reading/manifest.json")
        generated = read_json(z, "generated/manifest.json")
        spec = read_json(z, "spec/la_releve_spec.json")
        if not isinstance(reader, list) or not isinstance(generated, list) or len(reader) != 14 or len(generated) != 14:
            raise ContentError("Expected 14 reader and 14 generated records")
        if not isinstance(spec, dict) or spec.get("days") != list(DAYS):
            raise ContentError("Unexpected specification day labels")
        by_index = {g["index"]: g for g in generated if isinstance(g, dict) and "index" in g}
        if len(by_index) != 14:
            raise ContentError("Generated realization indices not unique")
        seen = set()
        realizations = []
        temporary_source_directory.mkdir(parents=True, exist_ok=True)
        for index, item in enumerate(reader, start=1):
            if not isinstance(item, dict) or item.get("index") != index:
                raise ContentError("Reader index/order mismatch")
            file_name = f"reading_{index:02d}.md"
            if item.get("file") != file_name:
                raise ContentError("Unexpected reader filename")
            g = by_index.get(index)
            if g is None or any(item.get(key) != g.get(key)
                                for key in ("schedule", "fault_edge", "repeated_caregiver", "K", "L")):
                raise ContentError("Reader/generated manifest disagreement")
            schedule = item.get("schedule")
            if not isinstance(schedule, list) or len(schedule) != 8 or not all(v in ("A","B") for v in schedule):
                raise ContentError("Invalid reader schedule")
            schedule_key = "".join(schedule)
            if schedule_key not in repairs or schedule_key in seen:
                raise ContentError("Noncanonical or duplicate schedule")
            edge, caregiver = repairs[schedule_key]
            if item["fault_edge"] != edge or item["repeated_caregiver"] != caregiver:
                raise ContentError("Fault-edge or caregiver metadata mismatch")
            if item["K"] != f"K_{edge}_{caregiver}" or item["L"] != f"L_{schedule_key[0]}":
                raise ContentError("K/L module identities mismatch")
            expected_modules = [f"B_{day}_{person}" for day, person in zip(DAYS, schedule)]
            expected_modules += [item["K"], item["L"]]
            if g.get("modules") != expected_modules:
                raise ContentError("Generated module provenance mismatch")
            data = archive_read(z, "reading/" + file_name, MAX_PASSAGE_BYTES)
            digest = hashlib.sha256(data).hexdigest()
            if digest != item.get("sha256"):
                raise ContentError("Master reader SHA-256 mismatch")
            try:
                text = data.decode("utf-8", "strict")
            except UnicodeDecodeError as exc:
                raise ContentError("Reader edition is not UTF-8") from exc
            check_reader_headings(text, schedule_key)
            (temporary_source_directory / file_name).write_bytes(data)
            realizations.append({
                "id": f"LR-{index:02d}",
                "schedule": schedule_key,
                "faultEdge": edge,
                "repeatedCaregiver": caregiver,
                "passages": [{
                    "id": f"complete-reader-{index:02d}",
                    "sourceModule": f"complete-reader-{index:02d}",
                    "file": file_name,
                    "sha256": digest
                }]
            })
            seen.add(schedule_key)
        if seen != set(repairs):
            raise ContentError("Incomplete canonical family in reader manifest")
    manifest = {
        "schemaVersion": 1,
        "work": {"id": "la-releve", "title": "La Relève",
                 "author": "Matéo Petel", "language": "fr",
                 "edition": "v1.4 complete reader realizations — unpublished"},
        "rights": {"channel": "private-local", "rightsHolder": "Author",
                   "authorizationRef": "Private source-archive inspection; no publication license"},
        "constraintModel": {"id": MODEL_ID,
                            "scope": "Eight-position binary minimum repair; 14 complete canonical realizations"},
        "realizations": realizations,
        "evidenceClaims": [
            {"id": "minimum-repair-enumeration", "status": "EXECUTABLY_CHECKED",
             "scope": "Independent exhaustive binary-model enumeration (256 states)",
             "statement": "Exactly fourteen recurrent single-repetition arrangements exist",
             "reference": "tools/private_content.py canonical_schedules"},
            {"id": "archival-formal-record", "status": "ARCHIVED_PROOF_RECORD",
             "scope": "Pinned finite scheduling and declared epistemic interfaces, not prose semantics",
             "statement": "Archived formal proof record, not rerun by the POELIO importer",
             "reference": "Lean 4.33.1, ac8bb6ce75d92c98482393fd6d90abe0c14a70a8"},
        ],
    }
    return validate_manifest(manifest, temporary_source_directory)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--private-output", type=Path, default=None)
    args = parser.parse_args()
    try:
        if not args.archive.is_file():
            raise ContentError("Master archive not found")
        with tempfile.TemporaryDirectory(prefix="poelio-archive-private-") as staging:
            catalog = validate_master_archive(args.archive, Path(staging))
        if args.private_output:
            write_private_catalog(catalog, args.private_output)
        print("Validated 14 canonical reader realizations and cross-checked archive metadata.")
        if args.private_output:
            print("Private local catalog written outside the public repository.")
    except (ContentError, OSError, zipfile.BadZipFile) as exc:
        parser.exit(2, f"Private archive import rejected: {exc}\n")


if __name__ == "__main__":
    main()
