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
 assert.match(markup,/id="reading-foil-alpha-boost"/);
 assert.match(markup,/feFuncA type="linear" slope="3.0"/);
 assert.match(css,/filter:url\(#reading-foil-alpha-boost\)/);
 for(const finish of ['celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'])
  assert.ok(css.includes('data-foil-finish="'+finish+'"'));
 assert.match(css,/rotateX\(42deg\)/);
});

test('Mobile preserves safe area, card geometry and short-viewport document scrolling',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/grid-template-rows:auto minmax\(500px,1fr\) auto auto/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(css,/@media\(max-width:720px\) and \(max-height:680px\)/);
 assert.match(css,/grid-template-rows:auto minmax\(270px,1fr\) auto auto/);
});
