#!/usr/bin/env python3
"""Create a text-free static mathematical explorer, never a private literary edition."""
from __future__ import annotations
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
COMPILED = ROOT / ".compiled"
DIST = ROOT / "dist"
APPROVED = {
    "index.html": PUBLIC / "index.html",
    "style.css": PUBLIC / "style.css",
    "explorer.js": COMPILED / "explorer.js",
    "model.js": COMPILED / "model.js",
}

def main() -> None:
    subprocess.run(["tsc", "-p", "tsconfig.json"], cwd=ROOT, check=True)
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for name, source in APPROVED.items():
        if not source.is_file():
            raise FileNotFoundError(source)
        shutil.copyfile(source, DIST / name)
    if {p.name for p in DIST.iterdir()} != set(APPROVED):
        raise RuntimeError("Unexpected files in public distribution")
    print("Public mathematical explorer built; NO literary catalog included.")

if __name__ == "__main__":
    main()
