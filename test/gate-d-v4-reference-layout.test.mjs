import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=path=>readFile(new URL(path,import.meta.url),'utf8');
test('The V4 layout is an isolated final-loaded CSS layer on both review entries',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 const gate=await source('../preview/gate-b/index.html');
 const solo=await source('../preview/post-shuffle/index.html');
 for(const html of [gate,solo]){
  const old=html.indexOf('reading-fidelity-v2.css');
  const next=html.indexOf('reading-polish-v4.css');
  assert.ok(old>=0&&next>old,'The corrective sheet must override—not rewrite—V3 baseline CSS');
 }
 assert.match(css,/Gate D V4/);
 assert.doesNotMatch(css,/renderReadingStage|querySelector|addEventListener/);
});
test('Table stage uses the existing source-art background and a visible foreground rim',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/\.reading-art-table-surface\{/);
 assert.match(css,/display:block!important;visibility:visible!important;opacity:1!important/);
 assert.match(css,/bg_artemis_reading_stage_main\.webp/);
 assert.match(css,/\.reading-art-table-surface::after\{/);
 assert.match(css,/border-bottom:3px solid rgba\(238,187,113,\.76\)/);
 assert.match(css,/transform-origin:center bottom/);
});
test('Portrait reverts from cover-cropping to transparent master aspect framing',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/\.reading-art-portrait img\{\s*object-fit:contain/);
 assert.match(css,/\.reading-art-portrait\{\s*top:-1%;width:min\(535px,57vw\)/);
 assert.match(css,/height:min\(460px,calc\(100% \+ 28px\)\)/);
 assert.match(css,/height:clamp\(310px,56dvh,455px\)/);
 assert.doesNotMatch(css,/object-fit:cover/);
});
test('Card scale/pitch/rim overlap recover the Final concept',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/width:clamp\(110px,9\.6vw,163px\)/);
 assert.match(css,/width:clamp\(88px,26\.5vw,123px\)/);
 assert.match(css,/bottom:3\.5%/);
 assert.match(css,/bottom:3%;/);
 assert.match(css,/rotateX\(42deg\)/);
 assert.match(css,/rotateY\(6deg\)/);
});
test('Tall mobile fills the viewport and restores full dialog HUD width with safe area',async()=>{
 const css=await source('../preview/post-shuffle/reading-polish-v4.css');
 assert.match(css,/height:100%;min-height:100dvh/);
 assert.match(css,/minmax\(0,1fr\) min-content min-content/);
 assert.match(css,/align-content:stretch;justify-items:stretch/);
 assert.match(css,/box-sizing:border-box;width:100%;min-width:0;max-width:none/);
 assert.match(css,/overflow-wrap:anywhere/);
 assert.match(css,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(css,/@media\(max-width:720px\) and \(max-height:680px\)/);
 const old=await source('../preview/post-shuffle/reading-fidelity-v2.css');
 assert.match(old,/grid-template-rows:clamp\(56px,7\.3dvh,68px\) clamp\(330px,51dvh,425px\) min-content min-content/);
 // V3 remains for reproducibility; V4 supersedes it only in the final cascade.
});
