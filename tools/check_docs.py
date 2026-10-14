#!/usr/bin/env python3
"""Verify public documentation links, license boundaries and version coherence.

Pure stdlib; never opens or imports any unpublished literary source.
"""
from __future__ import annotations

import json
import re
import sys
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
    "docs/RELEASE_NOTES_v0.2.0-rc.1.md", "docs/RELEASE_NOTES_v0.2.0-rc.2.md",
    "docs/RELEASE_NOTES_v0.2.0-rc.3.md"
)

def local_target(document: Path, reference: str, root: Path = ROOT) -> Path | None:
    reference = reference.strip().split(" ", 1)[0].strip("<>")
    if not reference or reference.startswith(SKIP):
        return None
    stem = unquote(reference.split("#", 1)[0].split("?", 1)[0])
    if not stem:
        return None
    resolved = (document.parent / stem).resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError(f"link escapes repository: {reference}")
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
                target = local_target(document, ref, root)
            except ValueError as exc:
                failures.append(str(exc))
                continue
            if target is not None and not target.exists():
                failures.append(f"{document.relative_to(root)}: broken local link {ref}")
    return failures

def check_readme_markdown(text: str, name: str) -> list[str]:
    """Catch structural regressions in the two reader-facing Markdown files.

    This is a deliberately small structural linter, not a complete CommonMark
    parser or a replacement for reviewing GitHub-rendered Markdown.
    """
    errors: list[str] = []
    if re.search(r"(?i)la[\s_-]+rel[eè]ve", text):
        errors.append(f"{name}: unrelated manuscript reference in README")
    if re.search(r"!\[[^\]]*\]\([^)]*\)|<img\b", text, flags=re.I):
        errors.append(f"{name}: README uses an image instead of the text identity")
    if re.search(r"</?(?:details|summary|div|center|p|br)\b", text, flags=re.I):
        errors.append(f"{name}: unnecessary HTML layout in README")
    if "\\" + chr(96) in text:
        errors.append(f"{name}: escaped Markdown code delimiter")

    fence: tuple[str, int, int] | None = None
    headings: list[int] = []
    table_columns: int | None = None
    for lineno, line in enumerate(text.splitlines(), 1):
        marker = re.match(r"^ {0,3}(" + chr(96) + r"{3,}|~{3,})", line)
        if fence:
            if marker and marker.group(1)[0] == fence[0] and len(marker.group(1)) >= fence[1]:
                if not line[marker.end():].strip():
                    fence = None
            continue
        if marker:
            fence = (marker.group(1)[0], len(marker.group(1)), lineno)
            table_columns = None
            continue
        heading = re.match(r"^(#{1,6})\s+\S", line)
        if heading:
            headings.append(len(heading.group(1)))
        if line.lstrip().startswith("|"):
            columns = len(re.split(r"(?<!\\)\|", line.strip())) - 2
            if table_columns is not None and columns != table_columns:
                errors.append(f"{name}:{lineno}: Markdown table column mismatch")
            table_columns = columns
        else:
            table_columns = None
    if fence:
        errors.append(f"{name}:{fence[2]}: unclosed Markdown code fence")
    if headings.count(1) != 1:
        errors.append(f"{name}: expected exactly one top-level heading")
    for previous, current in zip(headings, headings[1:]):
        if current > previous + 1:
            errors.append(f"{name}: skipped Markdown heading level")
            break
    return errors

def check_repository() -> list[str]:
    problems = [f"Missing required document: {p}" for p in REQUIRED if not (ROOT / p).is_file()]
    problems.extend(check_links())
    for relative in ("README.md", "experience/README.md"):
        try:
            document = (ROOT / relative).read_text(encoding="utf-8")
            problems.extend(check_readme_markdown(document, relative))
        except OSError as exc:
            problems.append(f"{relative}: {exc}")
    for sub in (ROOT, ROOT / "experience"):
        try:
            pkg = json.loads((sub / "package.json").read_text(encoding="utf-8"))
            lock = json.loads((sub / "package-lock.json").read_text(encoding="utf-8"))
            for field in ("version", "name"):
                if pkg[field] != lock[field] or pkg[field] != lock["packages"][""][field]:
                    problems.append(f"{sub.name}: package and lockfile disagree on {field}")
            if pkg.get("version") != "0.2.0-rc.3" or pkg.get("license") != "MIT":
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
    except OSError as exc:
        problems.append(f"Invalid license or permissions document: {exc}")
    return problems

if __name__ == "__main__":
    findings = check_repository()
    for finding in findings:
        print("DOCUMENTATION FAIL:", finding, file=sys.stderr)
    if findings:
        raise SystemExit(1)
    print("Documentation verified: links, licensing, package versions and README structure.")
