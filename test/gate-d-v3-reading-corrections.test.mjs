import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK,BY_ID} from '../src/deck.mjs';
import {buildDemoReading} from '../src/demo-reading.mjs';
import {renderReadingStage} from '../preview/post-shuffle/reading-stage.mjs';

const load=path=>readFile(new URL(path,import.meta.url),'utf8');
const choices=DECK.slice(0,3).map((card,i)=>({id:card.id,orientation:i===1?'reversed':'upright'}));
const demo=buildDemoReading({
 question:'How should I proceed?',
 picks:choices.map(c=>({card:BY_ID.get(c.id),orientation:c.orientation})),
 spread:'insight',lens:'western',lang:'en',options:['','']
});

test('Artemis stage owns three intrinsic, card-local foil sockets alongside authentic RWS faces',()=>{
 const html=renderReadingStage({choices,cardsById:BY_ID,demo,chapter:-1,question:'How should I proceed?'});
 assert.equal((html.match(/class="reading-actual-card-face/g)||[]).length,3);
 assert.equal((html.match(/class="reading-art-card-foil ps-card-art-overlay"/g)||[]).length,3);
 assert.equal((html.match(/data-foil-finish="pending"/g)||[]).length,3);
 assert.equal((html.match(/class="reading-art-card-frame"/g)||[]).length,3);
 assert.equal((html.match(/data-tabletop-tilt-deg="42"/g)||[]).length,3);
 for(const choice of choices){
  assert.ok(html.includes('data-original-card-id="'+choice.id+'"'));
 }
 assert.equal((html.match(/class="reading-actual-card-face is-reversed"/g)||[]).length,1);
});

test('Gate C hands the exact three decoded face AND foil DOM nodes into Gate D',async()=>{
 const scene=await load('../preview/post-shuffle/scene.mjs');
 const tableau=await load('../preview/post-shuffle/TarotTableau.mjs');
 assert.match(scene,/const originalFaces=\[\.\.\.\(tableau\?\.element\?\.querySelectorAll\('\.ps-card-art'\)/);
 assert.match(scene,/const originalFoils=\[\.\.\.\(tableau\?\.element\?\.querySelectorAll\('\.ps-card-art-overlay'\)/);
 assert.match(scene,/originalFoils\.length!==3/);
 assert.match(scene,/originalFoils\.some\(layer=>!layer\.style\.backgroundImage\|\|!layer\.dataset\.foilFinish\)/);
 assert.match(scene,/for\(const layer of originalFoils\)layer\.remove\(\)/);
 assert.match(scene,/const foilSockets=\[\.\.\.world\.querySelectorAll\('\.reading-art-card-frame \.reading-art-card-foil'\)/);
 assert.match(scene,/foilSockets\[i\]\.replaceWith\(layer\)/);
 assert.match(scene,/sockets\[i\]\.replaceWith\(img\)/);
 assert.match(scene,/layer\.dataset\.carryover='original-foil'/);
 assert.match(scene,/img\.dataset\.carryover='original-rws'/);
 assert.match(tableau,/foilLayer\.style\.backgroundImage='url\("'\+overlayTiles\[activeStyle\]/);
});

test('Foil is clipped to each original face, with live slow gold-violet light and reduced-motion support',async()=>{
 const css=await load('../preview/post-shuffle/reading-fidelity-v2.css');
 assert.match(css,/\.scene-artemis-reading \.reading-art-card-frame\{isolation:isolate\}/);
 assert.match(css,/\.scene-artemis-reading \.reading-art-card-frame \.reading-art-card-foil\{/);
 assert.match(css,/position:absolute;inset:0;z-index:3;display:block/);
 assert.match(css,/background-repeat:no-repeat;background-size:102% 102%/);
 assert.match(css,/mix-blend-mode:screen/);
 assert.match(css,/animation:artemis-foil-engraving-breathe 12s/);
 assert.match(css,/\.reading-art-card-foil::after\{/);
 assert.match(css,/animation:artemis-foil-drift 15\.2s/);
 for(const style of ['celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'])
  assert.ok(css.includes('data-foil-finish="'+style+'"'));
 assert.match(css,/\.reading-art-card-frame \.reading-art-card-foil::after\{\s*animation:none!important/);
});

test('Desktop propped cards, tabletop rim contact, perspective and dual contact shadows are explicit',async()=>{
 const css=await load('../preview/post-shuffle/reading-fidelity-v2.css');
 assert.match(css,/transform:perspective\(750px\) rotateX\(42deg\)/);
 assert.match(css,/width:min\(990px,96%\);bottom:7%/);
 assert.match(css,/bottom:13\.2%;height:36%/);
 assert.match(css,/perspective\(1200px\) rotateX\(2deg\)/);
 assert.match(css,/rotateY\(7deg\) scale\(\.975\)/);
 assert.match(css,/rotateY\(-7deg\) scale\(\.975\)/);
 assert.match(css,/\.reading-art-card-visual::before/);
 assert.match(css,/\.reading-art-card-visual::after/);
 assert.match(css,/filter:blur\(4px\)/);
});

test('Mobile rebalances a bounded hero and safe-area footer without clipping question or changing 42-degree pitch',async()=>{
 const css=await load('../preview/post-shuffle/reading-fidelity-v2.css');
 assert.match(css,/grid-template-rows:clamp\(56px,7\.3dvh,68px\) clamp\(330px,51dvh,425px\) min-content min-content/);
 assert.match(css,/align-content:start/);
 assert.match(css,/padding-bottom:max\(18px,calc\(env\(safe-area-inset-bottom,0px\) \+ 12px\)\)/);
 assert.match(css,/width:96%;bottom:9\.5%;gap:clamp\(8px,2\.2vw,18px\)/);
 assert.match(css,/bottom:15\.5%;height:35%/);
 assert.match(css,/overflow-wrap:anywhere;white-space:normal/);
 assert.match(css,/\.reading-art-question/);
 assert.match(css,/\.reading-art-card-frame\{\s*transform:perspective\(600px\) rotateX\(42deg\)/);
 const html=renderReadingStage({choices,cardsById:BY_ID,demo,question:'A very long question that should wrap comfortably on narrow phone screens'});
 assert.match(html,/class="reading-art-footer"/);
 assert.match(html,/YOUR QUESTION/);
});
