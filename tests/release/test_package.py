"""Independent source, binary patch and full-history restore; no operational data."""
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts/release/package.py'
spec = importlib.util.spec_from_file_location('synapse_release', SCRIPT)
release = importlib.util.module_from_spec(spec); spec.loader.exec_module(release)


class ReleaseTests(unittest.TestCase):
    def test_full_restore_patch_and_stale_base_guard(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td) / 'repo'; root.mkdir()
            def git(*args):
                return subprocess.check_output(['git', '-C', str(root), *args], stderr=subprocess.DEVNULL)
            git('init', '-b', 'main'); git('config', 'user.name', 'local QA'); git('config', 'user.email', 'qa@example.invalid')
            (root / 'app.txt').write_text('Work original\n'); git('add', '.'); git('commit', '-m', 'work base')
            base = git('rev-parse', 'HEAD').decode().strip(); git('branch', 'work-ref')
            git('switch', '-c', 'work/test-handoff'); (root / 'app.txt').write_text('Work original\nnew docs\n')
            (root / 'asset.bin').write_bytes(bytes(range(256)))
            git('add', '.'); git('commit', '-m', 'feature'); head = git('rev-parse', 'HEAD').decode().strip()
            provenance = Path(td) / 'observed.json'; provenance.write_text(json.dumps({'shared_commit': base, 'published': {'commit': base, 'status': 'succeeded', 'version': 1}}))
            out = Path(td) / 'release'
            manifest = release.build_release(root, base, 'work-ref', provenance, out)
            self.assertEqual(manifest['commit'], head); self.assertEqual(manifest['source_file_count'], 2)
            restored = Path(td) / 'restored'
            subprocess.run(['git', 'clone', '--branch', 'work/test-handoff', str(out / 'SYNAPSE-full.bundle'), str(restored)], check=True, capture_output=True)
            self.assertEqual(subprocess.check_output(['git', '-C', str(restored), 'rev-parse', 'HEAD']).decode().strip(), head)
            self.assertEqual((restored / 'asset.bin').read_bytes(), bytes(range(256)))
            self.assertEqual(subprocess.check_output(['git', '-C', str(restored), 'rev-parse', 'HEAD^']).decode().strip(), base)
            git('switch', '-c', 'work/patch-check', base)
            git('apply', '--check', str(out / 'SYNAPSE-changes.patch')); git('apply', str(out / 'SYNAPSE-changes.patch'))
            self.assertEqual((root / 'asset.bin').read_bytes(), bytes(range(256)))
            with self.assertRaisesRegex(ValueError, 'not clean'):
                release.build_release(root, base, 'work-ref', provenance, Path(td) / 'dirty')
            # An old, clean handoff cannot silently package over a newer Work ref.
            git('reset', '--hard', base); git('clean', '-fd'); git('branch', '-f', 'work-ref', head)
            with self.assertRaises(ValueError):
                release.build_release(root, base, 'work-ref', provenance, Path(td) / 'stale')

    def test_forbidden_paths_and_preserved_examples(self):
        for name in ['.env.production', 'config/key.pem', '.dev.vars', 'node_modules/a.js', '.wrangler/state.db']:
            self.assertTrue(release.forbidden(name), name)
        for name in ['.env.example', '.env.template', 'docs/README.md', 'app/page.tsx']:
            self.assertFalse(release.forbidden(name), name)


if __name__ == '__main__': unittest.main()
