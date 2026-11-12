#!/usr/bin/env python3
"""Build an auditable offline source handoff. Never fetches, pushes or deploys."""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


def git(root, *args):
    p = subprocess.run(['git', '-C', str(root), *args], capture_output=True)
    if p.returncode:
        raise ValueError('Git operation failed: ' + ' '.join(args[:2]) + '\n' + p.stderr.decode(errors='replace'))
    return p.stdout


def forbidden(name):
    parts = Path(name).parts
    allowed = {'.env.example', '.env.template', '.dev.vars.example'}
    return any(p in {'.git', 'node_modules', '.wrangler', '.sites-runtime'} or
               ((p.startswith('.env') or p.startswith('.dev.vars')) and p not in allowed)
               for p in parts) or name.endswith(('.pem', '.key', '.p12', '.pfx'))


def build_release(root, base_ref, work_ref, provenance_path, out):
    root = Path(root).resolve()
    base = git(root, 'rev-parse', '--verify', base_ref + '^{commit}').decode().strip()
    head = git(root, 'rev-parse', 'HEAD').decode().strip()
    work = git(root, 'rev-parse', '--verify', work_ref + '^{commit}').decode().strip()
    branch = git(root, 'symbolic-ref', '--short', 'HEAD').decode().strip()
    if branch in {'main', 'master'}:
        raise ValueError('Package from an independent handoff branch, not main/master.')
    if git(root, 'status', '--porcelain'):
        raise ValueError('Commit or preserve local changes before packaging; working tree is not clean.')
    git(root, 'merge-base', '--is-ancestor', work, head)
    git(root, 'merge-base', '--is-ancestor', base, head)
    provenance = json.loads(Path(provenance_path).read_text())
    if provenance.get('shared_commit') != work:
        raise ValueError('Provenance shared_commit does not match the selected current Work ref.')
    published = provenance.get('published', {})
    if not re.fullmatch(r'[0-9a-f]{40}', published.get('commit', '')) or published.get('status') != 'succeeded':
        raise ValueError('Record a verified published commit and successful deployment in provenance.')
    git(root, 'cat-file', '-e', published['commit'] + '^{commit}')

    # All local branches/tags will be recoverable. Detect credential paths in their history.
    objects = git(root, 'rev-list', '--objects', '--all').decode().splitlines()
    candidates = {}
    for entry in objects:
        sha, _, name = entry.partition(' ')
        if name and forbidden(name):
            raise ValueError('Credential/runtime artifact in Git history; review before exporting: ' + name)
        if name.endswith(('.ts', '.tsx', '.js', '.mjs', '.json', '.txt', '.md', '.yaml', '.yml', '.toml')):
            candidates[sha] = name
    private_key = re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\r\n]+[A-Za-z0-9+/=]')
    # Batch object reads; only filenames, never matching values, are reported.
    reader = subprocess.Popen(['git', '-C', str(root), 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    try:
        for sha, name in candidates.items():
            reader.stdin.write((sha + '\n').encode()); reader.stdin.flush()
            header = reader.stdout.readline().split()
            if len(header) != 3:
                raise ValueError('Unable to inspect tracked object safely.')
            data = reader.stdout.read(int(header[2])); reader.stdout.read(1)
            if private_key.search(data):
                raise ValueError('Private-key block detected in history; not exported: ' + name)
    finally:
        reader.stdin.close(); reader.stdout.close(); reader.wait()

    out = Path(out).resolve()
    if out.exists() and any(out.iterdir()):
        raise ValueError('Use a new, empty output directory; existing releases are never overwritten.')
    out.mkdir(parents=True, exist_ok=True)
    source = out / 'SYNAPSE-source.zip'
    patch = out / 'SYNAPSE-changes.patch'
    bundle = out / 'SYNAPSE-full.bundle'
    git(root, 'archive', '--format=zip', '--prefix=SYNAPSE/', '--output=' + str(source), head)
    patch.write_bytes(git(root, 'diff', '--binary', base, head))
    if patch.stat().st_size:
        git(root, 'apply', '--reverse', '--check', str(patch))
    git(root, 'bundle', 'create', str(bundle), 'HEAD', '--branches', '--tags')
    git(root, 'bundle', 'verify', str(bundle))

    files = []
    with zipfile.ZipFile(source) as z:
        if z.testzip() is not None:
            raise ValueError('Corrupt source ZIP.')
        for entry in git(root, 'ls-tree', '-r', '-z', head).split(b'\0'):
            if not entry: continue
            meta, raw_name = entry.split(b'\t', 1)
            mode, kind, sha = meta.split()
            name = raw_name.decode()
            if kind != b'blob' or forbidden(name):
                raise ValueError('Unsupported or unsafe source entry: ' + name)
            data = z.read('SYNAPSE/' + name)
            digest = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
            if digest != sha.decode():
                raise ValueError('Archive does not match Git: ' + name)
            files.append(name)

    changed = git(root, 'diff', '--name-only', '-z', base, head).decode().strip('\0').split('\0')
    if changed == ['']: changed = []
    artifact_hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (source, patch, bundle)}
    manifest = {
        'format': 'synapse-source-handoff-v1',
        'created_at': datetime.now(ZoneInfo('Asia/Dubai')).isoformat(),
        'commit': head, 'base_commit': base, 'branch': branch,
        'observed_work_ref': work_ref, 'observed_work_commit': work,
        'published': published, 'provenance': provenance,
        'status': 'handoff-ready-for-review; not an approval or deployment',
        'source_file_count': len(files), 'changed_files': changed,
        'bundle_scope': 'HEAD plus all local branches/tags with reachable history; no prerequisite commits',
        'sha256': artifact_hashes,
        'excluded': ['live D1 data', 'R2 objects', 'runtime secrets', 'OAuth grants', 'DNS/TLS state', 'node_modules', 'generated build/state'],
        'operations': {'remote_push': False, 'production_deploy': False, 'live_database_change': False},
        'verification': {'source_git_blob_match': True, 'bundle_verify': True, 'patch_reverse_check': True},
        'limits': ['Git history checks detect forbidden credential paths and private key blocks, not every possible secret pattern.'],
    }
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    restore = f'''# بازیابی و اعمال تحویل SYNAPSE

Commit: `{head}`
Base: `{base}`
Branch: `{branch}`
Work observed: `{work}`
Published observed: v{published.get('version')} / `{published['commit']}`

این بسته سورس و تاریخچه است؛ داده و secret محیط عملیاتی داخل آن نیست.

## بازیابی مستقل، بدون Work یا ZIP قدیمی

```sh
git clone --branch {branch} SYNAPSE-full.bundle SYNAPSE-restored
cd SYNAPSE-restored
git rev-parse HEAD
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm build
```

SHA خروجی rev-parse باید با Commit بالا برابر باشد. آدرس origin در clone از
bundle مسیر محلی خواهد بود؛ قبل از fetch آینده، remote رسمی را فقط با اطلاعات
تأییدشده تنظیم و احراز هویت کنید. `.git/config` و token داخل bundle نیستند.

## اعمال Patch روی مخزن موجود با مبنای دقیق

```sh
git switch -c restore/synapse-{head[:12]} {base}
git apply --check /path/to/SYNAPSE-changes.patch
git apply /path/to/SYNAPSE-changes.patch
```

برای حفظ شناسه commit و تاریخچه، بازیابی bundle بهتر از apply patch است.
ZIP سورس، snapshot همان commit با پوشه SYNAPSE است؛ به‌تنهایی تاریخچه Git ندارد.
فایل manifest و SHA256SUMS را با ابزار sha256sum بررسی کنید.

## محدودیت عملیاتی

هیچ deploy، push، Migration اصلی یا تغییر دامنه در ساخت این خروجی انجام نشده.
برای انتقال مستقل، `docs/deployment/independent-hosting.md` را بخوانید. برنامه
فعلی Worker/D1/R2 و قابلیت‌های identity/connector میزبان دارد و روی هر هاست
استاتیک یا Node بدون سازگاری اجرا نمی‌شود. داده زنده و فایل‌های آپلودشده باید
در مأموریت جدا و با مجوز مالک backup/restore شوند.
'''
    (out / 'APPLY-AND-RESTORE-FA.md').write_text(restore)
    payload = [source, patch, bundle, out / 'manifest.json', out / 'APPLY-AND-RESTORE-FA.md']
    sums = ''.join(hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.name + '\n' for p in payload)
    (out / 'SHA256SUMS').write_text(sums)
    payload.append(out / 'SHA256SUMS')
    with zipfile.ZipFile(out / 'SYNAPSE-release.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for p in payload: z.write(p, p.name)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='.')
    parser.add_argument('--base', required=True)
    parser.add_argument('--work-ref', default='origin/main')
    parser.add_argument('--provenance', required=True)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    try:
        manifest = build_release(args.repo, args.base, args.work_ref, args.provenance, args.out)
        print(json.dumps({'commit': manifest['commit'], 'source_files': manifest['source_file_count'], 'out': str(Path(args.out).resolve())}))
    except (ValueError, OSError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        print('Release not created: ' + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
