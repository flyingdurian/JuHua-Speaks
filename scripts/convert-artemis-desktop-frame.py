#!/usr/bin/env python3
"""Convert the project's CANONICAL desktop reading frame WEBP to the requested
PNG filename. This preserves the same exact artwork across formats rather
than accidentally stretching the distinct mobile skin on desktop.
"""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
src=ROOT/'assets/artemis/ui_reading_frame_panel.webp'
dst=ROOT/'assets/artemis/ui_reading_frame_panel.png'
if not src.exists():
    raise SystemExit('Existing desktop artwork missing: '+str(src))
with Image.open(src) as im:
    im.convert('RGBA').save(dst,'PNG',optimize=True)
with Image.open(dst) as im:
    print('Desktop PNG generated:',dst.relative_to(ROOT),im.size,im.mode)
