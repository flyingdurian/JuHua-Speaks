# Authentic Rider–Waite–Smith images

The deploy workflow downloads **78 original image scans** from the verified Wikimedia Commons *TaionWC* set into this directory. JPEGs are ignored in Git to avoid committing dozens of remote-sourced binaries before license/provenance validation. Run `npm run assets:sync` then `npm run assets:audit` when connected to the internet.

The app prefers these local files and only uses Wikimedia Commons as a **development fallback** when assets have not been synced. Do not replace the historical images with simplified drawings or newer recolorings. For sources, rights and the Chinese deck plan, see `docs/DECK_ARTWORK.md`.
