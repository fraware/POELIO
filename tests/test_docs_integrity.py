"""Synthetic-only checks for repository documentation link parsing."""
from __future__ import annotations
import tempfile
import unittest
from pathlib import Path
from tools.check_docs import local_target

class DocumentationLinkTests(unittest.TestCase):
    def test_relative_link_points_to_file_without_external_network(self):
        with tempfile.TemporaryDirectory() as name:
            root=Path(name)
            p=root/"docs"/"README.md"
            p.parent.mkdir()
            (root/"README.md").write_text("demo")
            self.assertEqual(local_target(p,"../README.md",root),root/"README.md")
    def test_external_urls_and_same_page_anchors_are_not_local_files(self):
        with tempfile.TemporaryDirectory() as name:
            p=Path(name)/"README.md"
            for link in ("https://github.com/example","#methods","mailto:example@example.org"):
                self.assertIsNone(local_target(p,link,Path(name)))

if __name__=="__main__":unittest.main()
