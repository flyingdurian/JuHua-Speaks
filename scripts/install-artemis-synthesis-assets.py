#!/usr/bin/env python3
"""Install ORIGINAL owner-supplied Artemis binary PNGs without resizing.

Run inside the checked-out JuHua-Speaks repository:
    python scripts/install-artemis-synthesis-assets.py /path/to/Artemis_Synthesis_Remake_Owner_Assets.zip

The archive is delivered alongside PR #28 for the exact art in the user's
2026-11-11 directive. This only writes assets/artemis/synthesis/*.png after
verifying the included manifest hashes and disallows archive traversal.
"""
import hashlib
import json
import sys
from pathlib import Path
from zipfile import ZipFile

ROOT=Path(__file__).resolve().parent.parent
ASSET_DIR=ROOT/'assets/artemis/synthesis'
NAMES={
 'artemis_conjuring_transition.png','artemis_synthesis_focused.png',
 'ui_reading_frame_panel_mobile.png',
 'avatar_artemis_neutral.png','avatar_artemis_warm_welcome.png',
 'avatar_artemis_focused_observation.png','avatar_artemis_thoughtful.png',
 'avatar_artemis_surprised.png','avatar_artemis_reassuring.png',
 'avatar_artemis_confident.png','avatar_artemis_mystical.png'
}

def install(archive):
    with ZipFile(archive) as z:
        manifest_path='assets/artemis/synthesis/asset-manifest.json'
        manifest=json.loads(z.read(manifest_path))
        entries=manifest['files']
        actual={Path(item['path']).name for item in entries}
        if actual!=NAMES or len(entries)!=len(NAMES):
            raise ValueError('Owner asset manifest must include exactly 11 expected PNGs')
        blobs={}
        for item in entries:
            path=item['path']
            if path!='assets/artemis/synthesis/'+Path(path).name:
                raise ValueError('Archive contains unsafe or unexpected path: '+path)
            contents=z.read(path)
            if len(contents)!=item['bytes'] or hashlib.sha256(contents).hexdigest()!=item['sha256']:
                raise ValueError('Owner asset checksum mismatch: '+path)
            if not contents.startswith(b'\x89PNG\r\n\x1a\n'):
                raise ValueError('Asset is not a PNG: '+path)
            blobs[Path(path).name]=contents
        ASSET_DIR.mkdir(parents=True,exist_ok=True)
        for name,contents in blobs.items():
            (ASSET_DIR/name).write_bytes(contents)
            print('installed',name,len(contents),'bytes')
        (ASSET_DIR/'asset-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        print('All original Artemis assets installed and verified.')

if __name__=='__main__':
    if len(sys.argv)!=2:
        raise SystemExit('Usage: python scripts/install-artemis-synthesis-assets.py OWNER_ASSETS.zip')
    install(sys.argv[1])
