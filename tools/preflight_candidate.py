#!/usr/bin/env python3
"""Preflight PRIVATE literary candidates without publishing or copying prose.

This command never produces a web-ready work or authorizes distribution.
All source files and the candidate manifest must reside outside the
repository. Output is a content-free validation status only.
"""
from __future__ import annotations

import argparse
import itertools
import json
import re
from pathlib import Path
from typing import Any

if __package__:
    from .private_content import (
        ROOT, ContentError, canonical_schedules, require_keys,
        require_mapping, require_string, source_path, _passage_bytes,
    )
else:
    from private_content import (
        ROOT, ContentError, canonical_schedules, require_keys,
        require_mapping, require_string, source_path, _passage_bytes,
    )

MODE = "UNVERIFIED_PRIVATE_CANDIDATE"
SCHEDULE = "weekly-binary-eight-v1"
PERMUTATION = "fixed-fragments-four-v1"
IDENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,95}$")
SHA = re.compile(r"^[a-f0-9]{64}$")
MAX_FILE = 2_000_000
MAX_CANDIDATE = 64

def _private_location(path: Path) -> Path:
    """Require the *entire* source tree outside the public Git checkout."""
    try:
        resolved = path.resolve(strict=True)
        root = ROOT.resolve(strict=True)
    except OSError as exc:
        raise ContentError("Candidate file or directory does not exist") from exc
    if resolved == root or root in resolved.parents:
        raise ContentError("Candidate inputs inside the public repository are forbidden")
    return resolved

def _json_no_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, val in pairs:
        if key in result:
            raise ContentError("Duplicate JSON manifest key")
        result[key] = val
    return result

def _check_id(value: Any, label: str) -> str:
    text = require_string(value,label,ident=True)
    if not IDENT.fullmatch(text):
        raise ContentError(label+" has invalid identifier syntax")
    return text

def _source_ledger(items: Any, folder: Path) -> dict[str, str]:
    if not isinstance(items,list) or not (2<=len(items)<=MAX_CANDIDATE):
        raise ContentError("Invalid source inventory size")
    sources: dict[str,str]={}
    modules: dict[str,str]={}
    source_paths: set[str]=set()
    for item in items:
        row=require_mapping(item,"source")
        require_keys(row,{"id","sourceModule","file","sha256"},"source")
        ident=_check_id(row["id"],"source.id")
        module=_check_id(row["sourceModule"],"source.sourceModule")
        claimed=row["sha256"]
        if not isinstance(claimed,str) or not SHA.fullmatch(claimed):
            raise ContentError("Source SHA-256 must be lowercase hex")
        if ident in sources or row["file"] in source_paths:
            raise ContentError("Duplicate source ID or file")
        source=source_path(folder,row["file"])
        if source.stat().st_size > MAX_FILE:
            raise ContentError("Source is larger than approved private budget")
        # Strict exact-byte hash and strict UTF-8, with no textual payload emitted.
        _passage_bytes(source,claimed)
        if module in modules and modules[module]!=claimed:
            raise ContentError("Shared source-module identity has different source bytes")
        sources[ident]=claimed
        modules[module]=claimed
        source_paths.add(row["file"])
    return sources

def _arrangements(rows: Any, kind: str, sources: dict[str,str]) -> tuple[int,int]:
    if not isinstance(rows,list) or not (2<=len(rows)<=24):
        raise ContentError("Two or more authored arrangements are needed for review")
    seen_ids: set[str]=set()
    seen_states: set[str]=set()
    used: set[str]=set()
    canonical=canonical_schedules() if kind==SCHEDULE else None
    if kind==PERMUTATION and len(sources)!=4:
        raise ContentError("Permutation model requires exactly four fixed sources")
    universe=len(canonical) if canonical is not None else 24
    if len(rows)>universe:
        raise ContentError("More arrangements than finite model states")
    for row in rows:
        item=require_mapping(row,"arrangement")
        require_keys(item,{"id","state","sourceIds"},"arrangement")
        ident=_check_id(item["id"],"arrangement.id")
        if ident in seen_ids:
            raise ContentError("Duplicate arrangement ID")
        seen_ids.add(ident)
        state=item["state"]
        refs=item["sourceIds"]
        if not isinstance(refs,list) or not refs or any(
            not isinstance(x,str) or x not in sources for x in refs
        ):
            raise ContentError("Arrangement refers to unknown or absent source")
        if len(refs)!=len(set(refs)):
            raise ContentError("A literary arrangement contains duplicate source IDs")
        if kind==SCHEDULE:
            if not isinstance(state,str) or state not in canonical:
                raise ContentError("Schedule is not one of fourteen canonical minimum repairs")
            key=state
        else:
            if (not isinstance(state,list) or len(state)!=4 or
                any(not isinstance(x,str) for x in state) or
                len(refs)!=4 or set(refs)!=set(sources) or set(state)!=set(sources)):
                raise ContentError("Fragment arrangement is not a permutation of the same four sources")
            key="/".join(state)
        if key in seen_states:
            raise ContentError("Duplicate formal state")
        seen_states.add(key)
        used.update(refs)
    if set(sources)!=used:
        raise ContentError("Unreferenced source in candidate package")
    return len(rows),universe

def preflight_candidate(manifest: Any,source_directory: Path) -> dict[str,Any]:
    """Validate a candidate and return counts without a single prose byte."""
    _private_location(source_directory)
    if source_directory.is_symlink() or not source_directory.is_dir():
        raise ContentError("Private candidate source directory must be outside the repository")
    data=require_mapping(manifest,"manifest")
    require_keys(data,{"schemaVersion","mode","work","rights","mechanism","sources",
                       "arrangements"},"manifest")
    if type(data["schemaVersion"]) is not int or data["schemaVersion"]!=1:
        raise ContentError("Unsupported candidate schema")
    if data["mode"]!="private-preflight" or data["rights"]!={"status":MODE}:
        raise ContentError("Candidate channel must be unverified/private-only")
    work=require_mapping(data["work"],"work")
    require_keys(work,{"id","title","author","edition","language"},"work")
    _check_id(work["id"],"work.id")
    for key in ("title","author","edition"):
        require_string(work[key],"work."+key)
    if work["language"]!="fr":
        raise ContentError("Current candidate preflight expects French source literature")
    model=require_mapping(data["mechanism"],"mechanism")
    require_keys(model,{"id","scope"},"mechanism")
    if model["id"] not in (SCHEDULE,PERMUTATION):
        raise ContentError("No validated private preflight for the claimed mechanism")
    require_string(model["scope"],"mechanism.scope")
    ledger=_source_ledger(data["sources"],source_directory)
    count,universe=_arrangements(data["arrangements"],model["id"],ledger)
    return {
        "schemaVersion":1,
        "status":MODE,
        "publicationAuthorized":False,
        "publicCatalogEligible":False,
        "workModel":model["id"],
        "sourceCount":len(ledger),
        "reviewedArrangementCount":count,
        "modelStateCount":universe,
        "byteIntegrity":"VERIFIED_IN_PRIVATE_SESSION",
        "literaryMerit":"NOT_EVALUATED",
    }

def validate_private_paths(manifest: Path,source_dir: Path) -> None:
    _private_location(manifest)
    _private_location(source_dir)
    if manifest.is_symlink() or source_dir.is_symlink() or not source_dir.is_dir():
        raise ContentError("Symlinks and invalid source folders are forbidden")
    if manifest.stat().st_size>500_000:
        raise ContentError("Candidate manifest exceeds size limit")

def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--source-dir",type=Path,required=True)
    args=p.parse_args()
    try:
        validate_private_paths(args.manifest,args.source_dir)
        manifest=json.loads(args.manifest.read_text(encoding="utf-8"),
                            object_pairs_hook=_json_no_duplicates)
        result=preflight_candidate(manifest,args.source_dir)
        # No prose, manuscript identifiers, filenames, or unpublished source hashes.
        print(json.dumps(result,sort_keys=True))
    except (ContentError,OSError,UnicodeError,json.JSONDecodeError,TypeError,ValueError) as exc:
        p.exit(2,"Private candidate preflight rejected: "+str(exc)+"\n")

if __name__=="__main__":
    main()
