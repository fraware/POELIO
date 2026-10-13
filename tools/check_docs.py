#!/usr/bin/env python3
"""Verify public documentation links, license boundaries and version coherence.

Pure stdlib; never opens or imports any unpublished literary source.
"""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
MARKDOWN_LINK = re.compile(r"!?\[[^\]]+\]\(([^)\n]+)\)")
HTML_LINK = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""")
SKIP = ("https:", "http:", "mailto:", "data:", "tel:", "#", "//")
IGNORE = {"node_modules", "dist", "private-dist", "private-runtime", ".git", ".compiled", "release-audit"}
REQUIRED = (
    "README.md", "LICENSE", "LICENSE-CONTENT.md", "CITATION.cff",
    "CHANGELOG.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "SECURITY.md",
    "docs/INDEX.md", "docs/GITHUB_RELEASE_PLAYBOOK.md",
    "docs/RELEASE_NOTES_v0.2.0-rc.1.md", "docs/assets/poelio-masthead.svg"
)

def local_target(document: Path, reference: str) -> Path | None:
    reference = reference.strip().split(" ", 1)[0].strip("<>")
    if not reference or reference.startswith(SKIP):
        return None
    stem = unquote(reference.split("#", 1)[0].split("?", 1)[0])
    if not stem:
        return None
    resolved = (document.parent / stem).resolve()
    if not resolved.is_relative_to(ROOT.resolve()):
        raise ValueError(f"link escapes repository: {document.relative_to(ROOT)} -> {reference}")
    return resolved

def check_links(root: Path = ROOT) -> list[str]:
    failures = []
    for document in root.rglob("*.md"):
        if any(part in IGNORE for part in document.relative_to(root).parts):
            continue
        text = document.read_text(encoding="utf-8")
        targets = MARKDOWN_LINK.findall(text) + HTML_LINK.findall(text)
        for ref in targets:
            try:
                target = local_target(document, ref)
            except ValueError as exc:
                failures.append(str(exc))
                continue
            if target is not None and not target.exists():
                failures.append(f"{document.relative_to(root)}: broken local link {ref}")
    return failures

def check_repository() -> list[str]:
    problems = [f"Missing required document: {p}" for p in REQUIRED if not (ROOT / p).is_file()]
    problems.extend(check_links())
    for sub in (ROOT, ROOT / "experience"):
        try:
            pkg = json.loads((sub / "package.json").read_text(encoding="utf-8"))
            lock = json.loads((sub / "package-lock.json").read_text(encoding="utf-8"))
            for field in ("version", "name"):
                if pkg[field] != lock[field] or pkg[field] != lock["packages"][""][field]:
                    problems.append(f"{sub.name}: package and lockfile disagree on {field}")
            if pkg.get("version") != "0.2.0-rc.1" or pkg.get("license") != "MIT":
                problems.append(f"{sub.name}: prerelease version or software license metadata inconsistent")
            if pkg.get("private") is not True:
                problems.append(f"{sub.name}: npm publication must remain disabled")
        except (KeyError, ValueError, OSError) as exc:
            problems.append(f"{sub.name}: malformed package metadata: {exc}")
    try:
        license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
        copyright_notice = (ROOT / "LICENSE-CONTENT.md").read_text(encoding="utf-8")
        if "MIT License" not in license_text or 'THE SOFTWARE IS PROVIDED "AS IS"' not in license_text:
            problems.append("Missing standard MIT software license terms")
        for term in ("episode.ts", "permutation.ts", "La Relève", "separately"):
            if term not in copyright_notice:
                problems.append(f"Literary license boundary missing {term}")
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        if "MIT" not in readme or "LICENSE-CONTENT.md" not in readme or "npm ci" not in readme:
            problems.append("README lacks rights separation or locked installation")
        if readme.count("<details") != readme.count("</details>"):
            problems.append("Unbalanced README collapsible sections")
        visual = ET.parse(ROOT / "docs/assets/poelio-masthead.svg").getroot()
        if not visual.tag.endswith("svg"):
            problems.append("Editorial masthead is not valid SVG")
        if any(element.tag.lower().endswith(("script", "foreignobject", "image")) for element in visual.iter()):
            problems.append("Editorial masthead must be self-contained static vector artwork")
    except (OSError, ET.ParseError) as exc:
        problems.append(f"Invalid license or editorial asset: {exc}")
    return problems

if __name__ == "__main__":
    findings = check_repository()
    for finding in findings:
        print("DOCUMENTATION FAIL:", finding, file=sys.stderr)
    if findings:
        raise SystemExit(1)
    print("Documentation verified: internal links, licenses, version pins and static artwork.")
