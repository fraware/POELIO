"""Synthetic archive fixtures for testing the La Relève private importer safely."""
from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from tools.import_la_releve_master import (
    PREFIX, DAYS, check_reader_headings, validate_master_archive
)
from tools.private_content import ContentError, canonical_schedules


def fabricated_archive(path: Path, *, sabotage: str = "") -> None:
    reader = []
    generated = []
    files: dict[str, bytes] = {}
    for index, (schedule, (edge, caregiver)) in enumerate(canonical_schedules().items(), start=1):
        text = "# La Relève\n\n" + "".join(
            f"## Jour {i} — {'Élise' if person == 'A' else 'Thomas'}\n\n"
            f"Une phrase inventée pour le test {index} et le jour {i}.\n\n"
            for i, person in enumerate(schedule)
        )
        data = text.encode("utf-8")
        name = f"reading_{index:02d}.md"
        modules = [f"B_{day}_{person}" for day, person in zip(DAYS, schedule)]
        modules.extend([f"K_{edge}_{caregiver}", f"L_{schedule[0]}"])
        entry = {
            "index": index, "file": name, "sha256": hashlib.sha256(data).hexdigest(),
            "schedule": list(schedule), "fault_edge": edge,
            "repeated_caregiver": caregiver,
            "K": f"K_{edge}_{caregiver}", "L": f"L_{schedule[0]}"
        }
        reader.append(entry)
        generated.append({**entry, "file": f"realization_{index:02d}.md", "modules": modules})
        files["reading/" + name] = data
    if sabotage == "hash":
        files["reading/reading_02.md"] = b"TAMPERED"
    elif sabotage == "module":
        generated[4]["modules"][0] = "B_wrong_B"
    elif sabotage == "reader-mapping":
        reader[0]["fault_edge"] = 5
    files["reading/manifest.json"] = json.dumps(reader).encode()
    files["generated/manifest.json"] = json.dumps(generated).encode()
    files["spec/la_releve_spec.json"] = json.dumps({"days": DAYS}).encode()
    with zipfile.ZipFile(path, "w") as z:
        for name, data in files.items():
            z.writestr(PREFIX + name, data)


class MasterArchiveTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="poelio-archive-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_synthetic_archive_yields_private_complete_catalog(self) -> None:
        source = self.root / "tmp"
        archive = self.root / "fabricated.zip"
        fabricated_archive(archive)
        catalog = validate_master_archive(archive, source)
        self.assertEqual(len(catalog["realizations"]), 14)
        self.assertEqual(catalog["rights"]["channel"], "private-local")
        self.assertEqual(len(catalog["realizations"][0]["passages"]), 1)
        self.assertTrue(catalog["realizations"][0]["passages"][0]["text"].startswith("# La Relève"))

    def test_reader_bytes_mutation_rejected(self) -> None:
        archive = self.root / "bad-hash.zip"
        fabricated_archive(archive, sabotage="hash")
        with self.assertRaisesRegex(ContentError, "SHA-256 mismatch"):
            validate_master_archive(archive, self.root / "tmp")

    def test_generated_module_mutation_rejected(self) -> None:
        archive = self.root / "bad-module.zip"
        fabricated_archive(archive, sabotage="module")
        with self.assertRaisesRegex(ContentError, "provenance mismatch"):
            validate_master_archive(archive, self.root / "tmp")

    def test_manifest_schedule_divergence_rejected(self) -> None:
        archive = self.root / "bad-mapping.zip"
        fabricated_archive(archive, sabotage="reader-mapping")
        with self.assertRaisesRegex(ContentError, "manifest disagreement"):
            validate_master_archive(archive, self.root / "tmp")

    def test_heading_check_rejects_wrong_person(self) -> None:
        text = "# La Relève\n\n" + "".join(
            "## Jour — Thomas\n\nContenu.\n\n" for _ in range(8)
        )
        with self.assertRaisesRegex(ContentError, "assigned caregiver"):
            check_reader_headings(text, "AAAAAAAA")


if __name__ == "__main__":
    unittest.main()
