"""Synthetic-only adversarial tests for the private candidate intake gate."""
from __future__ import annotations
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path

from tools.preflight_candidate import (
    MODE,PERMUTATION,SCHEDULE,preflight_candidate,validate_private_paths,ContentError
)
from tools.private_content import canonical_schedules

ROOT=Path(__file__).resolve().parents[1]

class CandidatePreflightTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix="poelio-candidate-synthetic-")
        self.addCleanup(self.temp.cleanup)
        self.folder=Path(self.temp.name)
        self.source_dir=self.folder/"sources"
        self.source_dir.mkdir()
        self.sources=[]
        for idx in range(4):
            name=f"synthetic_{idx}.txt"
            payload=f"Fragment synthétique {idx}, pour les tests seulement.\n".encode("utf-8")
            (self.source_dir/name).write_bytes(payload)
            self.sources.append({
                "id":f"s{idx}",
                "sourceModule":f"synthetic-module-{idx}",
                "file":name,
                "sha256":hashlib.sha256(payload).hexdigest()
            })
        self.manifest={
            "schemaVersion":1,
            "mode":"private-preflight",
            "work":{
                "id":"test-only","title":"Œuvre synthétique","author":"Auteur fictif",
                "edition":"Version d’essai","language":"fr"
            },
            "rights":{"status":MODE},
            "mechanism":{"id":PERMUTATION,"scope":"Four fixed source fragments"},
            "sources":deepcopy(self.sources),
            "arrangements":[
                {"id":"a","state":["s0","s1","s2","s3"],
                 "sourceIds":["s0","s1","s2","s3"]},
                {"id":"b","state":["s2","s3","s0","s1"],
                 "sourceIds":["s0","s1","s2","s3"]}
            ],
        }
    def run_gate(self,manifest=None):
        return preflight_candidate(manifest or self.manifest,self.source_dir)

    def test_valid_private_permutation_has_no_prose_or_identifying_metadata_in_report(self):
        report=self.run_gate()
        self.assertEqual(report["modelStateCount"],24)
        self.assertEqual(report["reviewedArrangementCount"],2)
        self.assertFalse(report["publicationAuthorized"])
        self.assertFalse(report["publicCatalogEligible"])
        text=json.dumps(report,ensure_ascii=False)
        self.assertNotIn("Œuvre synthétique",text)
        self.assertNotIn("Fragment synthétique",text)
        self.assertNotIn("sha256",text.lower())
        self.assertNotIn("synthetic_",text)

    def test_schedule_preflight_only_accepts_canonical_repairs(self):
        manifest=deepcopy(self.manifest)
        manifest["mechanism"]={"id":SCHEDULE,"scope":"Eight-position recurrence"}
        states=list(canonical_schedules())
        manifest["arrangements"]=[
            {"id":"a","state":states[0],"sourceIds":["s0","s1"]},
            {"id":"b","state":states[1],"sourceIds":["s2","s3"]},
        ]
        report=self.run_gate(manifest)
        self.assertEqual(report["modelStateCount"],14)
        manifest["arrangements"][0]["state"]="ABABABAB"
        with self.assertRaisesRegex(ContentError,"canonical"):
            self.run_gate(manifest)

    def test_public_claim_and_unknown_mechanism_rejected(self):
        for rights in [
            {"status":"PUBLIC_APPROVED"},
            {"status":MODE,"channel":"public-demo"},
            {"status":"private-local"}
        ]:
            invalid=deepcopy(self.manifest)
            invalid["rights"]=rights
            with self.assertRaisesRegex(ContentError,"private-only"):
                self.run_gate(invalid)
        invalid=deepcopy(self.manifest)
        invalid["mechanism"]["id"]="novel-unverified-ai-writer"
        with self.assertRaisesRegex(ContentError,"No validated private preflight"):
            self.run_gate(invalid)

    def test_digest_corruption_and_invalid_utf8_rejected(self):
        bad=deepcopy(self.manifest)
        bad["sources"][0]["sha256"]="0"*64
        with self.assertRaisesRegex(ContentError,"SHA-256 mismatch"):
            self.run_gate(bad)
        raw=b"\xff\xfe\xfd"
        (self.source_dir/"synthetic_0.txt").write_bytes(raw)
        bad=deepcopy(self.manifest)
        bad["sources"][0]["sha256"]=hashlib.sha256(raw).hexdigest()
        with self.assertRaisesRegex(ContentError,"strict UTF-8"):
            self.run_gate(bad)

    def test_symlinks_and_traversal_blocked(self):
        bad=deepcopy(self.manifest)
        bad["sources"][0]["file"]="../outside.txt"
        with self.assertRaisesRegex(ContentError,"escapes"):
            self.run_gate(bad)
        link=self.source_dir/"linked.txt"
        try:link.symlink_to(self.source_dir/"synthetic_0.txt")
        except OSError:self.skipTest("Symlinks unavailable")
        bad=deepcopy(self.manifest)
        bad["sources"][0]["file"]="linked.txt"
        with self.assertRaisesRegex(ContentError,"Symlinked"):
            self.run_gate(bad)

    def test_unknown_sources_or_nonpermutations_rejected(self):
        for state,refs in [
            (["s0","s0","s2","s3"],["s0","s1","s2","s3"]),
            (["s0","s1","s2","else"],["s0","s1","s2","s3"]),
            (["s0","s1","s2"],["s0","s1","s2","s3"]),
        ]:
            bad=deepcopy(self.manifest)
            bad["arrangements"][0]["state"]=state
            bad["arrangements"][0]["sourceIds"]=refs
            with self.assertRaisesRegex(ContentError,"permutation"):
                self.run_gate(bad)

    def test_four_fragment_model_rejects_a_changing_source_inventory(self):
        extra=deepcopy(self.manifest)
        payload=b"Another synthetic text only.\n"
        (self.source_dir/"synthetic_4.txt").write_bytes(payload)
        extra["sources"].append({
            "id":"s4","sourceModule":"synthetic-module-4",
            "file":"synthetic_4.txt","sha256":hashlib.sha256(payload).hexdigest()
        })
        extra["arrangements"][1]["state"]=["s0","s1","s2","s4"]
        extra["arrangements"][1]["sourceIds"]=["s0","s1","s2","s4"]
        with self.assertRaisesRegex(ContentError,"exactly four fixed sources"):
            self.run_gate(extra)

    def test_module_collisions_duplicate_states_and_extra_manifest_fields_rejected(self):
        for change,error in [
            (lambda m:m["sources"][1].update(sourceModule="synthetic-module-0"),"module identity"),
            (lambda m:m["arrangements"][1].update(state=["s0","s1","s2","s3"]),"Duplicate formal state"),
            (lambda m:m.update(publicationGranted=True),"keys differ"),
        ]:
            bad=deepcopy(self.manifest)
            change(bad)
            with self.assertRaisesRegex(ContentError,error):
                self.run_gate(bad)

    def test_cli_reads_private_synthetic_input_and_emits_only_summary(self):
        manifest=self.folder/"input.json"
        manifest.write_text(json.dumps(self.manifest,ensure_ascii=False),encoding="utf-8")
        validate_private_paths(manifest,self.source_dir)
        cmd=[sys.executable,str(ROOT/"tools"/"preflight_candidate.py"),
             "--manifest",str(manifest),"--source-dir",str(self.source_dir)]
        out=subprocess.run(cmd,capture_output=True,text=True,check=True)
        result=json.loads(out.stdout)
        self.assertEqual(result["sourceCount"],4)
        self.assertNotIn("Œuvre synthétique",out.stdout)
        self.assertNotIn("Fragment synthétique",out.stdout)

    def test_duplicate_json_keys_rejected_by_cli(self):
        manifest=self.folder/"dup.json"
        original=json.dumps(self.manifest,ensure_ascii=False)
        manifest.write_text(original.replace('"schemaVersion": 1',
                                             '"schemaVersion": 1, "schemaVersion": 1',1),
                            encoding="utf-8")
        out=subprocess.run([sys.executable,str(ROOT/"tools"/"preflight_candidate.py"),
             "--manifest",str(manifest),"--source-dir",str(self.source_dir)],
             capture_output=True,text=True)
        self.assertEqual(out.returncode,2)
        self.assertIn("Duplicate JSON manifest key",out.stderr)

if __name__=="__main__":
    unittest.main()
