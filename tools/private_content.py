"""Private-only, fail-closed importer for authored literary editions.

This module does NOT authorize publication. It validates a supplied manifest and
exact source bytes, then optionally stages a local catalog OUTSIDE the repository.
The production/public Vite build never calls this importer.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tempfile
from pathlib import Path, PurePosixPath
from typing import Any, Mapping

SCHEMA_VERSION = 1
MODEL_ID = "weekly-binary-eight-v1"
MAX_PASSAGE_BYTES = 2_000_000
MAX_CATALOG_BYTES = 24_000_000
HEX256 = re.compile(r"^[a-f0-9]{64}$")
IDENT = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,95}$")
SHA256_KEY = "sha256"
ROOT = Path(__file__).resolve().parents[1]


class ContentError(ValueError):
    """The submitted edition is invalid or cannot be privately staged."""


def canonical_schedules() -> dict[str, tuple[int, str]]:
    """Enumerate all labelled one-repetition repairs independently."""
    solutions: dict[str, tuple[int, str]] = {}
    for value in range(256):
        schedule = "".join("B" if value & (1 << i) else "A" for i in range(8))
        if schedule[0] != schedule[7]:
            continue
        repeated = [i for i in range(7) if schedule[i] == schedule[i + 1]]
        if len(repeated) == 1:
            solutions[schedule] = (repeated[0], schedule[repeated[0]])
    if len(solutions) != 14:
        raise AssertionError("Exhaustive reference enumeration changed")
    return solutions


def require_mapping(obj: Any, label: str) -> Mapping[str, Any]:
    if not isinstance(obj, dict):
        raise ContentError(f"{label} must be an object")
    return obj


def require_string(obj: Any, label: str, *, ident: bool = False) -> str:
    if not isinstance(obj, str) or not obj.strip() or len(obj) > 2000:
        raise ContentError(f"{label} must be nonempty text")
    if ident and not IDENT.fullmatch(obj):
        raise ContentError(f"{label} has invalid identifier syntax")
    return obj


def require_keys(obj: Mapping[str, Any], keys: set[str], label: str) -> None:
    if set(obj) != keys:
        raise ContentError(f"{label} keys differ from the declared schema")


def source_path(base: Path, name: Any) -> Path:
    """Reject traversal, symlinks and files outside the supplied source directory."""
    if not isinstance(name, str) or len(name) > 240 or "\\" in name:
        raise ContentError("Invalid passage source path")
    p = PurePosixPath(name)
    if p.is_absolute() or not p.parts or any(part in ("", ".", "..") for part in p.parts):
        raise ContentError("Passage source escapes content directory")
    current = base
    for part in p.parts:
        current = current / part
        if current.is_symlink():
            raise ContentError("Symlinked source is forbidden")
    try:
        current.resolve(strict=True).relative_to(base.resolve(strict=True))
    except (ValueError, OSError) as exc:
        raise ContentError("Source path escapes content directory or is missing") from exc
    if not current.is_file():
        raise ContentError("Passage source must be a regular file")
    return current


def _passage_bytes(path: Path, claimed_hash: Any) -> str:
    if not isinstance(claimed_hash, str) or not HEX256.fullmatch(claimed_hash):
        raise ContentError("Invalid SHA-256 claim")
    if path.stat().st_size > MAX_PASSAGE_BYTES:
        raise ContentError("Passage exceeds byte budget")
    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != claimed_hash:
        raise ContentError("Passage SHA-256 mismatch")
    try:
        text = data.decode("utf-8", "strict")
    except UnicodeDecodeError as exc:
        raise ContentError("Passage is not strict UTF-8") from exc
    if not text.strip() or "\x00" in text:
        raise ContentError("Passage is empty or contains NUL")
    return text


def validate_manifest(manifest: Any, source_directory: Path) -> dict[str, Any]:
    """Validate source content and emit the private catalog in memory only.

    The only supported constraint model is the specific eight-position binary
    model. Other literary models need their own explicit, tested validators.
    """
    root = require_mapping(manifest, "manifest")
    require_keys(root, {"schemaVersion", "work", "rights", "constraintModel",
                        "realizations", "evidenceClaims"}, "manifest")
    if type(root["schemaVersion"]) is not int or root["schemaVersion"] != SCHEMA_VERSION:
        raise ContentError("Unsupported manifest schema version")
    work = require_mapping(root["work"], "work")
    require_keys(work, {"id", "title", "author", "language", "edition"}, "work")
    for key in ("id", "title", "author", "language", "edition"):
        require_string(work[key], f"work.{key}", ident=key == "id")
    rights = require_mapping(root["rights"], "rights")
    require_keys(rights, {"channel", "rightsHolder", "authorizationRef"}, "rights")
    if rights["channel"] != "private-local":
        raise ContentError("External catalog importer permits private-local only")
    require_string(rights["rightsHolder"], "rightsHolder")
    require_string(rights["authorizationRef"], "authorizationRef")
    # This is a recorded assertion, not a legal verification of authorship or consent.
    model = require_mapping(root["constraintModel"], "constraintModel")
    require_keys(model, {"id", "scope"}, "constraintModel")
    if model["id"] != MODEL_ID:
        raise ContentError("No validator registered for this constraint model")
    require_string(model["scope"], "constraintModel.scope")
    realizations = root["realizations"]
    if not isinstance(realizations, list) or not (2 <= len(realizations) <= 14):
        raise ContentError("An edition must include between 2 and 14 authored realizations")
    canonical = canonical_schedules()
    ids: set[str] = set()
    schedules: set[str] = set()
    global_modules: dict[str, str] = {}
    compiled: list[dict[str, Any]] = []
    for i, raw in enumerate(realizations):
        item = require_mapping(raw, f"realizations[{i}]")
        require_keys(item, {"id", "schedule", "faultEdge", "repeatedCaregiver", "passages"}, "realization")
        item_id = require_string(item["id"], "realization.id", ident=True)
        schedule = item["schedule"]
        if not isinstance(schedule, str) or schedule not in canonical:
            raise ContentError("Unrecognized or noncanonical schedule")
        if item_id in ids or schedule in schedules:
            raise ContentError("Duplicate realization ID or schedule")
        edge, person = canonical[schedule]
        if type(item["faultEdge"]) is not int or item["faultEdge"] != edge or item["repeatedCaregiver"] != person:
            raise ContentError("Incorrect fault-edge or caregiver metadata")
        passages = item["passages"]
        if not isinstance(passages, list) or not passages:
            raise ContentError("Realization has no passages")
        passage_ids: set[str] = set()
        result_passages = []
        for j, raw_passage in enumerate(passages):
            passage = require_mapping(raw_passage, f"passages[{j}]")
            require_keys(passage, {"id", "sourceModule", "file", SHA256_KEY}, "passage")
            passage_id = require_string(passage["id"], "passage.id", ident=True)
            module = require_string(passage["sourceModule"], "sourceModule", ident=True)
            if passage_id in passage_ids:
                raise ContentError("Duplicate passage ID within realization")
            passage_ids.add(passage_id)
            text = _passage_bytes(source_path(source_directory, passage["file"]), passage[SHA256_KEY])
            existing = global_modules.setdefault(module, passage[SHA256_KEY])
            if existing != passage[SHA256_KEY]:
                raise ContentError("Shared source-module ID maps to inconsistent source bytes")
            result_passages.append({"id": passage_id, "sourceModule": module, "text": text,
                                    "sha256": passage[SHA256_KEY]})
        compiled.append({"id": item_id, "schedule": list(schedule),
                         "faultEdge": edge, "repeatedCaregiver": person,
                         "passages": result_passages})
        ids.add(item_id)
        schedules.add(schedule)
    claims = root["evidenceClaims"]
    if not isinstance(claims, list):
        raise ContentError("Evidence claims must be an array")
    claim_ids: set[str] = set()
    for raw in claims:
        claim = require_mapping(raw, "evidence claim")
        require_keys(claim, {"id", "status", "scope", "statement", "reference"}, "evidence claim")
        cid = require_string(claim["id"], "evidence.id", ident=True)
        if cid in claim_ids:
            raise ContentError("Duplicate evidence claim")
        claim_ids.add(cid)
        if claim["status"] not in ("EXECUTABLY_CHECKED", "ARCHIVED_PROOF_RECORD",
                                   "EDITORIAL_INTERPRETATION", "NOT_ESTABLISHED"):
            raise ContentError("Unknown evidence status")
        for key in ("scope", "statement", "reference"):
            require_string(claim[key], f"evidence.{key}")
    catalog = {"schemaVersion": SCHEMA_VERSION, "work": dict(work),
               "rights": dict(rights), "constraintModel": dict(model),
               "realizations": compiled, "evidenceClaims": claims}
    size = len(json.dumps(catalog, ensure_ascii=False).encode("utf-8"))
    if size > MAX_CATALOG_BYTES:
        raise ContentError("Private catalog exceeds byte budget")
    return catalog


def output_is_outside_repository(path: Path, repository: Path = ROOT) -> None:
    """Private output paths must not be under the repository, including symlinks."""
    dest = path.expanduser().resolve(strict=False)
    repo = repository.resolve(strict=True)
    if dest == repo or repo in dest.parents:
        raise ContentError("Private catalog output inside public repository is forbidden")
    if path.is_symlink() or path.parent.is_symlink():
        raise ContentError("Symlinked output location is forbidden")


def write_private_catalog(catalog: Mapping[str, Any], destination: Path,
                          repository: Path = ROOT) -> None:
    """Atomically write a local private catalog; never touch the public build."""
    output_is_outside_repository(destination, repository)
    if destination.exists():
        raise ContentError("Refusing to overwrite an existing private catalog")
    if not destination.parent.is_dir():
        raise ContentError("Create the private destination directory explicitly")
    data = (json.dumps(catalog, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    fd, temporary = tempfile.mkstemp(prefix=".poelio-private-", dir=destination.parent)
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        output_is_outside_repository(destination, repository)
        os.replace(temporary, destination)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--private-output", type=Path, default=None)
    args = parser.parse_args()
    if not args.source_dir.resolve().is_dir():
        parser.error("Source directory must exist")
    try:
        manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
        catalog = validate_manifest(manifest, args.source_dir)
        if args.private_output is not None:
            write_private_catalog(catalog, args.private_output)
        print(f"Validated {len(catalog['realizations'])} realizations for private-local use.")
        if args.private_output is not None:
            print("Wrote an unpublished catalog OUTSIDE the repository.")
    except (ContentError, OSError, UnicodeError, json.JSONDecodeError) as exc:
        parser.exit(2, f"Import rejected: {exc}\n")


if __name__ == "__main__":
    main()
