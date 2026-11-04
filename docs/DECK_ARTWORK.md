# Illustration sources, licensing and deck policy

## Main deck: historical Rider–Waite–Smith (78/78 sourced)

- **Original illustrator:** Pamela Colman Smith (1878–1951).
- **First published:** 1909, Arthur Edward Waite / William Rider & Son.
- **Selected exact image set:** [Wikimedia Commons: Rider-Waite-Smith tarot deck (TaionWC)](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). That category lists the complete **78 Pam-A scans** (Major Arcana `RWS Tarot 00 Fool.jpg` through `RWS Tarot 21 World.jpg`; Minor Arcana `Wands01..14`, `Cups01..14`, `Swords01..14`, `Pents01..14`). One coherent scan series, not mixed modern redrawn editions.
- **Copyright status:** The original 1909 artwork is generally public-domain in the US and life-plus-70 jurisdictions (Smith died 1951). Carefully check licensing metadata for individual image files and countries of exploitation before publication. This repository's import script refuses files whose Commons metadata is not public domain.
- **Use:** The app uses the **actual scan images** as card faces. Glow and shine are separate CSS overlays; no change to underlying artwork, no vector illustration substitution, no AI-painted approximations, no rare/common classification.
- **Acquisition:** `npm run assets:sync` reads the Wikimedia Commons API for exact filenames, checks file-license metadata, fetches image thumbnails, and writes **78 JPEGs** to `assets/rws/`. Deployment can bundle and serve those locally for speed and reduced Wikimedia dependence. `npm run assets:audit` validates the asset pack.
- **Attribution:** Include artist, name and source in credits; provide each card's Wikimedia page/rights link in the gallery inspection view. Wikimedia Commons pages are the authority for per-file source and licensing.

## Optional deck found: The Chinese Tarot — license required

A real **78-card Chinese ink-and-watercolor** deck exists:

- **Title:** *The Chinese Tarot* / *Chinese Tarot Deck*
- **Illustrator:** **Jui Guoliang** (also romanized *Jui Guo Liang*)
- **Year:** **1989** (original; subsequent reissues)
- **Publisher / rights contact:** **U.S. Games Systems**
- **Official illustrated product listing:** https://www.usgamesinc.com/the-chinese-tarot.html
- **Independent description:** https://www.learntarot.com/chdesc.htm
- **Visual review:** https://benebellwen.com/2021/06/07/the-chinese-tarot-by-jui-guoliang/

It is not a recolored Rider–Waite–Smith deck; it is an illustrated Tarot interpretation in a Chinese artistic tradition. Some Major Arcana are culturally adapted, such as Heavenly Master, Confucius and Universe. Its upright/reversed meanings and archetypes need an **explicit mapping table** before it can share the Western deck's reading data. The current app provides a discoverable locked deck entry linking the official publisher, **without copying any images**.

### Required to enable in the product

1. Obtain **written digital/app reproduction rights** for all 78 original card illustrations covering target geographies, including China, languages, derivative presentation/foil and distribution mechanisms. Physical ownership of a deck does not convey reproduction rights.
2. Obtain approved clean per-card image files; do not scrape vendor previews, photos of a deck, or unlicensed PDFs.
3. Audit 78/78 artwork with stable IDs, file checksum, aspect ratio, and card-to-card semantic mapping (Heavenly Master / Hierophant; Confucius / Judgement; Universe / World, etc.).
4. Record contract, rights holder, permitted modifications, attribution, geographic and time limits in a private legal register. Do not commit nonpublic contracts.
5. Make the deck available for selection only after legal and visual acceptance gates pass.

### Alternative: commissioned Chinese deck

If rights are denied or costly, commission an **original 78-card art set** by professional illustrators using Chinese historical and mythological motifs. The style can carry the working title **Silk & Ink / 丝墨**, but **it must not be represented as an existing illustrated deck**. No cheap icon/vector/AI placeholder version should be available to users. Commissioning should specify full commercial rights, unique scene compositions, parity across 22 + 56 cards, and a consistent tarot symbolism mapping.

## Distribution / China caveat

The card scan source being public-domain does **not** imply Wikimedia Commons itself can be used reliably from mainland China. Local/first-party card hosting is required for launch; GitHub Pages may also be inaccessible in that region. Mainland deployment, data protection, accessibility and AI provider access require dedicated validation. This milestone does not claim mainland availability.
