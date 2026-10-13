"""Adversarial tests for publication boundary and exact source-byte integrity."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import tempfile
import unittest
from pathlib import Path

from tools.private_content import (
    ContentError, MODEL_ID, canonical_schedules, output_is_outside_repository,
    source_path, validate_manifest, write_private_catalog,
)


def make_fixture(base: Path) -> dict:
    """Construct a fresh, synthetic two-variant episode with measured digests."""
    base.mkdir(parents=True, exist_ok=True)
    repairs = canonical_schedules()
    choices = [
        (s, e, p) for s, (e, p) in repairs.items()
        if (e, p) in ((0, "A"), (6, "B"))
    ]
    if len(choices) != 2:
        raise AssertionError("Synthetic repair selection is incorrect")
    common = "La salle conserve un carnet; nul narrateur n'en connaît toutes les pages.\n"
    (base / "common.txt").write_bytes(common.encode("utf-8"))
    readings = []
    for i, (schedule, edge, person) in enumerate(choices):
        name = f"authored-{i}.txt"
        text = f"Le témoin {i} découvre une phrase qu'il n'avait pas écrite.\n"
        (base / name).write_bytes(text.encode("utf-8"))
        readings.append({
            "id": f"demo-{i}",
            "schedule": schedule,
            "faultEdge": edge,
            "repeatedCaregiver": person,
            "passages": [
                {"id": "common", "sourceModule": "room-common", "file": "common.txt",
                 "sha256": hashlib.sha256(common.encode("utf-8")).hexdigest()},
                {"id": f"unique-{i}", "sourceModule": f"authored-{i}", "file": name,
                 "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest()},
            ],
        })
    return {
        "schemaVersion": 1,
        "work": {
            "id": "synthetic-work", "title": "An invented work",
            "author": "Synthetic tester", "language": "fr",
            "edition": "Test edition 1"
        },
        "rights": {"channel": "private-local",
                   "rightsHolder": "Synthetic tester",
                   "authorizationRef": "Test-only authorization, not permission to publish"},
        "constraintModel": {
            "id": MODEL_ID, "scope": "Eight binary positions and minimal recurrence repair"
        },
        "realizations": readings,
        "evidenceClaims": [{
            "id": "enumeration", "status": "EXECUTABLY_CHECKED",
            "scope": "Finite reference enumeration in tests",
            "statement": "There are 14 one-repetition repairs",
            "reference": "tests/test_private_content.py"
        }],
    }


class ContentGateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory(prefix="poelio-fixture-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.sources = self.root / "sources"
        self.manifest = make_fixture(self.sources)

    def validate(self, manifest=None) -> dict:
        return validate_manifest(self.manifest if manifest is None else manifest, self.sources)

    def assert_rejected(self, change, expected: str) -> None:
        m = copy.deepcopy(self.manifest)
        change(m)
        with self.assertRaisesRegex(ContentError, expected):
            self.validate(m)

    def test_positive_catalog_is_complete_and_contains_exact_prose(self) -> None:
        catalog = self.validate()
        self.assertEqual(len(catalog["realizations"]), 2)
        self.assertEqual(len(canonical_schedules()), 14)
        self.assertEqual(catalog["realizations"][0]["passages"][0]["text"],
                         (self.sources / "common.txt").read_text(encoding="utf-8"))
        self.assertEqual(catalog["rights"]["channel"], "private-local")

    def test_tampered_bytes_are_rejected(self) -> None:
        (self.sources / "authored-0.txt").write_text("Modified passage", encoding="utf-8")
        with self.assertRaisesRegex(ContentError, "SHA-256 mismatch"):
            self.validate()

    def test_mismatched_digest_is_rejected(self) -> None:
        self.assert_rejected(
            lambda m: m["realizations"][0]["passages"][0].update(sha256="f"*64),
            "SHA-256 mismatch"
        )

    def test_wrong_schedule_duplicate_and_edge_mismatch(self) -> None:
        self.assert_rejected(
            lambda m: m["realizations"][0].update(faultEdge=3),
            "Incorrect fault-edge"
        )
        self.assert_rejected(
            lambda m: m["realizations"][1].update(schedule=m["realizations"][0]["schedule"]),
            "Duplicate"
        )
        self.assert_rejected(
            lambda m: m["realizations"][0].update(schedule="ABABABAB"),
            "noncanonical"
        )

    def test_wrong_shared_module_rejected(self) -> None:
        self.assert_rejected(
            lambda m: m["realizations"][1]["passages"][0].update(
                sourceModule="room-common",
                file="authored-1.txt",
                sha256=m["realizations"][1]["passages"][1]["sha256"]
            ),
            "inconsistent source bytes"
        )

    def test_rights_are_strict_private_only(self) -> None:
        self.assert_rejected(lambda m: m["rights"].update(channel="public-demo"),
                             "private-local only")
        self.assert_rejected(lambda m: m["rights"].update(authorizationRef=""),
                             "nonempty")
        self.assert_rejected(lambda m: m["rights"].update(invented="yes"),
                             "keys differ")

    def test_no_unknown_model_or_proof_inference(self) -> None:
        self.assert_rejected(
            lambda m: m["constraintModel"].update(id="any-narrative"),
            "No validator registered"
        )
        self.assert_rejected(
            lambda m: m["evidenceClaims"][0].update(status="MACHINE_VERIFIED"),
            "Unknown evidence status"
        )

    def test_no_path_escape_or_symlinked_input(self) -> None:
        self.assert_rejected(
            lambda m: m["realizations"][0]["passages"][0].update(file="../elsewhere.txt"),
            "escapes"
        )
        self.assert_rejected(
            lambda m: m["realizations"][0]["passages"][0].update(file="/tmp/example.txt"),
            "escapes"
        )
        outside = self.root / "outside.txt"
        outside.write_text("No access", encoding="utf-8")
        (self.sources / "link.txt").symlink_to(outside)
        self.assert_rejected(
            lambda m: m["realizations"][0]["passages"][0].update(file="link.txt"),
            "Symlinked"
        )

    def test_private_output_rejected_inside_public_repo(self) -> None:
        public_repo = self.root / "repository"
        public_repo.mkdir()
        with self.assertRaisesRegex(ContentError, "inside public repository"):
            output_is_outside_repository(public_repo / "dist" / "catalog.json", public_repo)
        with self.assertRaisesRegex(ContentError, "inside public repository"):
            write_private_catalog(self.validate(), public_repo / "catalog.json", public_repo)

    def test_private_catalog_atomic_and_no_overwrite(self) -> None:
        public_repo = self.root / "repository"
        public_repo.mkdir()
        output = self.root / "private" / "catalog.json"
        output.parent.mkdir()
        write_private_catalog(self.validate(), output, public_repo)
        self.assertEqual(json.loads(output.read_text(encoding="utf-8"))["work"]["id"],
                         "synthetic-work")
        with self.assertRaisesRegex(ContentError, "overwrite"):
            write_private_catalog(self.validate(), output, public_repo)
        if os.name == "posix":
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)

    def test_no_invalid_utf8_or_empty_passage(self) -> None:
        p = self.sources / "common.txt"
        p.write_bytes(b"\xff\xfe")
        digest = hashlib.sha256(p.read_bytes()).hexdigest()
        self.assert_rejected(
            lambda m: [
                r["passages"][0].update(sha256=digest)
                for r in m["realizations"]
            ],
            "UTF-8"
        )

    def test_schema_does_not_accept_unknown_fields(self) -> None:
        self.assert_rejected(lambda m: m.update(debugMode="anything"),
                             "keys differ")


if __name__ == "__main__":
    unittest.main()
