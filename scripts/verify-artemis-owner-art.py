#!/usr/bin/env python3
"""Release gate for PR #28: fail closed unless authentic owner pixels are
committed to GitHub. No substituted images, snapshots, or silent fallbacks.
"""
import hashlib
import json
import struct
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
ASSETS=ROOT/'assets/artemis/synthesis'
ORIGINALS={
 'artemis_conjuring_transition.png','artemis_synthesis_focused.png',
 'ui_reading_frame_panel_mobile.png',
 *(f'avatar_artemis_{m}.png' for m in (
  'neutral','warm_welcome','focused_observation','thoughtful',
  'surprised','reassuring','confident','mystical'))
}
FACES={f'avatar_artemis_face_{m}.png' for m in (
 'neutral','warm_welcome','focused_observation','thoughtful',
 'surprised','reassuring','confident','mystical')}
MAGIC=bytes([137,80,78,71,13,10,26,10])

def validate_manifest(filename,expected):
    manifest=ASSETS/filename
    if not manifest.is_file():
        raise RuntimeError(f'Owner artwork manifest absent: {manifest.relative_to(ROOT)}')
    d=json.loads(manifest.read_text())
    entries=d.get('files',[])
    actual={Path(x['path']).name for x in entries}
    if len(entries)!=len(expected) or actual!=expected:
        raise RuntimeError(f'Unexpected artwork collection in {filename}; expected {len(expected)}')
    for row in entries:
        path=row['path']
        if path!='assets/artemis/synthesis/'+Path(path).name:
            raise RuntimeError(f'Untrusted artwork manifest path: {path}')
        full=ROOT/path
        if not full.is_file():
            raise RuntimeError(f'Missing required original asset in GitHub checkout: {path}')
        blob=full.read_bytes()
        if (len(blob)!=row['bytes'] or
            hashlib.sha256(blob).hexdigest()!=row['sha256'] or
            blob[:8]!=MAGIC or blob[12:16]!=b'IHDR'):
            raise RuntimeError(f'Original owner art checksum/PNG mismatch: {path}')
        w,h=struct.unpack('>II',blob[16:24])
        if (path.endswith('ui_reading_frame_panel_mobile.png') and
            (w,h)!=(1448,1086)):
            raise RuntimeError(f'Mobile frame geometry changed: {w}x{h}')
        if Path(path).name in FACES and (w,h)!=(512,512):
            raise RuntimeError(f'Face crop geometry changed: {path} {w}x{h}')
        if w<512 or h<512:
            raise RuntimeError(f'Unexpected downsampled owner artwork: {path}')
        print(f'OK {path} {w}x{h} {row["sha256"][:12]}')
    return len(entries)

def main():
    total=validate_manifest('asset-manifest.json',ORIGINALS)
    total+=validate_manifest('face-crops-manifest.json',FACES)
    desktop=ROOT/'assets/artemis/ui_reading_frame_panel.png'
    if not desktop.is_file() or desktop.read_bytes()[:8]!=MAGIC:
        raise RuntimeError('The original DESKTOP ui_reading_frame_panel.png is missing')
    print(f'Art sign-off gate PASS: {total} owner/derived PNGs and dedicated desktop frame')

if __name__=='__main__':
    try:
        main()
    except (RuntimeError,ValueError,KeyError,OSError) as e:
        raise SystemExit(f'ARTWORK NOT READY: {e}') from e
