#!/usr/bin/env python3
"""Fail CI if sensitive or build-artifact filenames are tracked by Git."""
from __future__ import annotations
import fnmatch
import subprocess
from pathlib import PurePosixPath

FORBIDDEN = [
    "catalog.json", "**/catalog.json", "*.zip", "**/*.zip",
    "private-dist/**", "private-runtime/**", "dist/**", ".compiled/**",
    "node_modules/**", "**/reading_[0-9][0-9].md",
    "**/La_Releve*", "La_Releve*", ".env", ".env.*",
]
def main() -> None:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        check=True, capture_output=True
    )
    tracked = [path.decode("utf-8") for path in result.stdout.split(b"\x00") if path]
    rejected = []
    for path in tracked:
        if ".." in PurePosixPath(path).parts:
            rejected.append(path)
        elif any(fnmatch.fnmatchcase(path, pattern) for pattern in FORBIDDEN):
            rejected.append(path)
    if rejected:
        raise SystemExit("Prohibited tracked paths:\n" + "\n".join(rejected))
    print("Tracked filename guard passed (not a complete content-leak audit).")

if __name__ == "__main__":
    main()
