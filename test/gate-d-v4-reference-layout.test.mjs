import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=path=>readFile(new URL(path,import.meta.url),'utf8');

test('The V4 corrective layer remains isolated and last-loaded in both entries',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 const gate=await source('../preview/gate-b/index.html');
 const solo=await source('../preview/post-shuffle/index.html');
 for(const html of [gate,solo]){
  assert.ok(html.indexOf('reading-fidelity-v2.css')>=0);
  assert.ok(html.indexOf('reading-polish-v4.css')>html.indexOf('reading-fidelity-v2.css'));
 }
 assert.match(css,/Gate D V4/);
 assert.doesNotMatch(css,/renderReadingStage|querySelector|addEventListener/);
});

test('One and only one tabletop: existing illustrated chamber, no nested synthetic plane',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 const markup=await source('../preview/post-shuffle/reading-stage.mjs');
 assert.match(css,/\.reading-art-table-surface\{display:none!important\}/);
 assert.match(markup,/artSlot\('background','reading-art-atmosphere'\)/);
 assert.doesNotMatch(css,/\.reading-art-table-surface::before\s*\{/);
 assert.doesNotMatch(css,/\.reading-art-table-surface::after\s*\{/);
});

test('Chest-up Artemis crop and readable full-height interpretation are explicit',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/\.reading-art-portrait img\{[\s\S]*?object-fit:cover;object-position:center top;/);
 assert.match(css,/\.reading-art-portrait\{[\s\S]*?overflow:hidden/);
 assert.match(css,/height:clamp\(230px,32dvh,280px\)/);
 assert.match(css,/max-height:none!important/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/reading-art-panel\{[\s\S]*?background:transparent!important/);
 assert.match(css,/overflow:visible!important/);
 assert.match(css,/\.reading-art-panel\{[\s\S]*?height:auto;min-height:202px/);
});

test('Original question is promoted into the header rather than relegated to footer',async()=>{
 const markup=await source('../preview/post-shuffle/reading-stage.mjs');
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 const start=markup.indexOf('reading-art-question-banner');
 const footer=markup.indexOf('class="reading-art-footer"');
 assert.ok(start>=0&&footer>start);
 assert.match(markup,/reading-art-question-label">YOUR QUESTION/);
 assert.match(markup,/class="reading-art-question"/);
 assert.match(markup,/esc\(question\)/);
 assert.match(css,/\.reading-art-question-banner\{/);
 const footerPart=markup.slice(footer,footer+260);
 assert.doesNotMatch(footerPart,/reading-art-question/);
});

test('Foil has a visible in-card second pass of the SAME selected background-image',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/\.reading-art-card-frame \.reading-art-card-foil\{/);
 assert.match(css,/opacity:1;visibility:visible/);
 assert.match(css,/mix-blend-mode:screen/);
 assert.match(css,/\.reading-art-card-foil::before\{/);
 assert.match(css,/background-image:inherit/);
 const markup=await source('../preview/post-shuffle/reading-stage.mjs');
 assert.doesNotMatch(markup,/<svg/i,'No shape-built/vector artwork in the reading stage');
 assert.match(css,/ps-moving-foil-lines/);
 assert.match(css,/ps-moving-foil-sheen/);
 assert.match(css,/ps-moving-foil-underlay/);
 assert.match(css,/filter:brightness\(2.1\) contrast\(1.18\)/);
 assert.match(css,/drop-shadow/);
 for(const finish of ['celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'])
  assert.ok(css.includes('data-foil-finish="'+finish+'"'));
 assert.match(css,/rotateX\(42deg\)/);
});

test('Mobile preserves safe area, card geometry and short-viewport document scrolling',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/grid-template-rows:auto minmax\(390px,1fr\) auto auto/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/height:clamp\(260px,35dvh,302px\)/);
 assert.match(css,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(css,/@media\(max-width:720px\) and \(max-height:680px\)/);
 assert.match(css,/grid-template-rows:auto minmax\(270px,1fr\) auto auto/);
});

test('Visible title removed while question and accessible reading heading remain',async()=>{
 const markup=await source('../preview/post-shuffle/reading-stage.mjs');
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.doesNotMatch(markup,/artSlot\('title','reading-art-title-art'\)/);
 assert.doesNotMatch(markup,/reading-art-subtitle">THREE CARDS/);
 assert.match(markup,/reading-art-screenreader-title/);
 assert.match(css,/clip:rect\(0,0,0,0\)/);
 assert.match(markup,/String\(i\+1\).padStart\(2,'0'\)\+'\. '\+roles\[i\]/);
});

test('Reveal sandbox has four styles, intensity slider, live texture updates and JSON export',async()=>{
 const tableau=await source('../preview/post-shuffle/TarotTableau.mjs');
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(tableau,/ps-foil-sandbox/);
 assert.match(tableau,/for\(const style of ART_OVERLAY_STYLES\)/);
 assert.match(tableau,/setFoilIntensity/);
 assert.match(tableau,/data-foil-intensity|dataset\.foilIntensity/);
 assert.match(tableau,/juhua-foil-config\.json/);
 assert.match(tableau,/JSON\.stringify\(foilConfig\(\)/);
 assert.match(css,/ps-foil-sandbox-body/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('Reading scroll indicator only appears when interpretation has hidden text',async()=>{
 const markup=await source('../preview/post-shuffle/reading-stage.mjs');
 const scene=await source('../preview/post-shuffle/scene.mjs');
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(markup,/class="reading-art-scroll-cue"/);
 assert.match(scene,/function updateReadingOverflowCue\(\)/);
 assert.match(scene,/panel\.dataset\.textOverflow=String\(more\)/);
 assert.match(scene,/mount\.addEventListener\('scroll',onReadingTextScroll,true\)/);
 assert.match(scene,/mount\.removeEventListener\('scroll',onReadingTextScroll,true\)/);
 assert.match(css,/\.reading-art-panel\[data-text-overflow="true"\] \.reading-art-scroll-cue/);
});

test('Style-V1 particle overlay is available without replacing the four original finishes',async()=>{
 const code=await source('../preview/post-shuffle/TarotTableau.mjs');
 assert.match(code,/FOIL_ANIM_V1='foil-anim-style-v1'/);
 assert.match(code,/SANDBOX_FOIL_STYLES=Object\.freeze\(\[FOIL_ANIM_V1,\.\.\.ART_OVERLAY_STYLES\]\)/);
 assert.match(code,/style\.id='foil-anim-style-v1'/);
 assert.match(code,/@keyframes foilDriftV1/);
 assert.match(code,/background-position: 80px 100px; filter: brightness\(1\.5\)/);
 assert.match(code,/background-position: 160px 200px; filter: brightness\(0\.7\)/);
 assert.match(code,/animation:foilDriftV1 10s linear infinite!important/);
 assert.match(code,/FOIL_V1_PARTICLES/);
 assert.match(code,/data:image\/svg\+xml;utf8,/);
 assert.match(code,/prefers-reduced-motion:reduce/);
});
test('Opaque Artemis has no artificial bottom fade and uses the real room artwork as foreground occlusion',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 const scene=await source('../preview/post-shuffle/scene.mjs');
 assert.match(css,/mask:none!important;-webkit-mask:none!important/);
 assert.match(css,/reading-art-hero::after/);
 assert.match(css,/--room-cover-size/);
 assert.match(css,/bg_artemis_reading_stage_main\.webp/);
 assert.match(css,/clip-path:inset\(var\(--table-occlusion-line\) 0 0 0\)/);
 assert.match(scene,/function updateArtemisTableOcclusion\(\)/);
 assert.match(scene,/image\.naturalWidth/);
 assert.match(scene,/hero\.dataset\.roomOcclusionSynced='true'/);
});
test('Premium reading CTA and redundant welcome text removal',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 const markup=await source('../preview/post-shuffle/reading-stage.mjs');
 assert.doesNotMatch(markup,/eyebrow:'WELCOME TO YOUR READING'/);
 assert.match(markup,/current\.eyebrow\?'<p class="reading-art-kicker">/);
 assert.match(css,/reading-art-control\.is-primary:hover:not\(:disabled\)/);
 assert.match(css,/reading-art-control\.is-secondary:hover:not\(:disabled\)/);
 assert.match(css,/reading-art-control:focus-visible/);
});
