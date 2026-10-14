"""Synthetic-only checks for repository documentation link parsing."""
from __future__ import annotations
import tempfile
import unittest
from pathlib import Path
from tools.check_docs import local_target, check_readme_markdown, check_indexed_docs, check_escaped_code_markers

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

class PublicReadmeMarkupTests(unittest.TestCase):
    def check(self, text: str) -> list[str]:
        return check_readme_markdown(text, "README.md")

    def test_ordinary_markdown_and_fenced_commands_are_accepted(self):
        sample = "# POELIO\n\n## Development\n\n```bash\nnpm ci\n```\n"
        self.assertEqual(self.check(sample), [])

    def test_unbalanced_fence_is_rejected(self):
        findings = self.check("# POELIO\n\n## Run\n\n```bash\nnpm ci\n")
        self.assertTrue(any("unclosed" in issue for issue in findings))

    def test_unescaped_markup_and_header_structure_are_checked(self):
        findings = self.check("# POELIO\n\n### Skipped\n\n\\`\\`\\`bash\n")
        self.assertTrue(any("escaped Markdown" in issue for issue in findings))
        self.assertTrue(any("skipped Markdown" in issue for issue in findings))

    def test_table_column_mismatch_is_rejected(self):
        sample = "# POELIO\n\n| Topic | Example |\n|---|---|\n| Wrong |\n"
        self.assertTrue(any("column mismatch" in issue for issue in self.check(sample)))

    def test_image_and_irrelevant_manuscript_reference_are_rejected(self):
        sample = "# POELIO\n\n![banner](art.svg)\n\nLa Relève\n"
        findings = self.check(sample)
        self.assertTrue(any("image" in issue for issue in findings))
        self.assertTrue(any("manuscript" in issue for issue in findings))



class DocumentationInventoryTests(unittest.TestCase):
    def test_missing_index_entry_is_rejected_until_documented(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            docs = root / "docs"
            docs.mkdir()
            (docs / "INDEX.md").write_text("# Documentation\n\n- [One](ONE.md)\n", encoding="utf-8")
            (docs / "ONE.md").write_text("# One\n", encoding="utf-8")
            (docs / "TWO.md").write_text("# Two\n", encoding="utf-8")
            self.assertEqual(check_indexed_docs(root),
                             ["docs/INDEX.md: unindexed document TWO.md"])
            (docs / "INDEX.md").write_text(
                "# Documentation\n\n- [One](ONE.md)\n- [Two](TWO.md)\n", encoding="utf-8")
            self.assertEqual(check_indexed_docs(root), [])

    def test_markdown_code_escape_detection(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            path = root / "guide.md"
            tick = chr(96)
            path.write_text("# Guide\n\nUse " + tick + "npm ci" + tick + ".\n", encoding="utf-8")
            self.assertEqual(check_escaped_code_markers(root), [])
            path.write_text("# Guide\n\nUse " + chr(92) + tick + "npm ci" +
                            chr(92) + tick + ".\n", encoding="utf-8")
            findings = check_escaped_code_markers(root)
            self.assertEqual(len(findings), 1)
            self.assertIn("escaped Markdown code delimiter", findings[0])


if __name__=="__main__":unittest.main()
