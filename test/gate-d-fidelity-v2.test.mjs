import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK,BY_ID} from '../src/deck.mjs';
import {buildDemoReading} from '../src/demo-reading.mjs';
import {reviewDeckOrder,selectionReviewRequested} from '../preview/post-shuffle/ReviewEntry.mjs';
import {handoffAnchor} from '../preview/post-shuffle/SelectionHandoff.mjs';
import {renderReadingStage,renderReadingHandoff} from '../preview/post-shuffle/reading-stage.mjs';
import {ART_OVERLAY_LABELS,ART_OVERLAY_STYLES} from '../preview/post-shuffle/ArtOverlays.mjs';

const load=path=>readFile(new URL(path,import.meta.url),'utf8');
const picks=DECK.slice(0,3).map(card=>({id:card.id,orientation:'upright'}));
const demo=buildDemoReading({question:'What does tomorrow hold?',picks:picks.map(p=>({card:BY_ID.get(p.id),orientation:p.orientation})),spread:'insight',lens:'western',lang:'en',options:['','']});

test('Skip to Card Selection is seeded, 78-unique, and stays opt-in',async()=>{
 assert.deepEqual(reviewDeckOrder(213),reviewDeckOrder(213));
 assert.notDeepEqual(reviewDeckOrder(213),reviewDeckOrder(214));
 assert.equal(reviewDeckOrder(213).length,78);
 assert.equal(new Set(reviewDeckOrder(213)).size,78);
 assert.deepEqual(new Set(reviewDeckOrder(213)),new Set(DECK.map(card=>card.id)));
 assert.equal(selectionReviewRequested('?skip=selection&seed=213'),true);
 assert.equal(selectionReviewRequested('?skip=reveal'),false);
 assert.throws(()=>reviewDeckOrder(-1),RangeError);
 const gate=await load('../preview/gate-b/gate-b.mjs');
 const demoScene=await load('../preview/post-shuffle/demo.mjs');
 const engine=await load('../preview/post-shuffle/scene.mjs');
 const gateHtml=await load('../preview/gate-b/index.html');
 assert.match(gate,/enterSelectionReview\(\)/);
 assert.match(gate,/reviewDeckOrder\(visualSeed\)/);
 assert.match(gate,/skipToSelection:true/);
 assert.match(gateHtml,/id="skip-to-selection"/);
 assert.match(demoScene,/selectionReviewRequested\(location.search\)/);
 assert.match(engine,/Math\.max\(BEATS\.interactive,7\.15\)/);
});

test('final pick freezes camera, seals selection, and never manufactures offscreen ghosts',async()=>{
 const source=await load('../preview/post-shuffle/scene.mjs');
 const ghosts=await load('../preview/post-shuffle/SelectionHandoff.mjs');
 assert.match(source,/lockFrame=\{time:t,yaw,pitch,picks:choices\.map/);
 assert.match(source,/lockAt=performance\.now\(\);ready=false;step='selection-lock'/);
 assert.match(source,/canvas\.style\.pointerEvents='none'/);
 assert.match(source,/pickAnchors\.clear\(\)/);
 assert.match(source,/rendered\.find\(entry=>entry\.id===chosen\.id\)/);
 assert.match(source,/lockFrame\?\.time\?\?t/);
 assert.match(source,/picks:lockFrame\.picks/);
 assert.match(source,/selectionSnapshot:\(\)=>/);
 assert.match(ghosts,/if\(from\.skipFlyby\)continue/);
 const size={width:1280,height:720};
 const onScreen=handoffAnchor({corners:[{x:300,y:140},{x:360,y:140},{x:360,y:250},{x:300,y:250}]},size);
 assert.equal(onScreen.skipFlyby,undefined);
 const gone=handoffAnchor({corners:[{x:-900,y:-300},{x:-760,y:-300},{x:-760,y:-200},{x:-900,y:-200}]},size);
 assert.equal(gone.skipFlyby,true);
 assert.equal(handoffAnchor(null,size,1).skipFlyby,true);
 assert.ok(gone.x>=0&&gone.y>=0);
});

test('all four source-preserving finishes contain slow subtle foil above decoded RWS',async()=>{
 const overlay=await load('../preview/post-shuffle/ArtOverlays.mjs');
 const css=await load('../preview/post-shuffle/reading-fidelity-v2.css');
 const tableau=await load('../preview/post-shuffle/TarotTableau.mjs');
 assert.equal(ART_OVERLAY_STYLES.length,4);
 assert.deepEqual(Object.values(ART_OVERLAY_LABELS),[
  'Celestial Filigree','Constellation Foil','Arcane Lattice','Starlight Engraving'
 ]);
 for(const style of ART_OVERLAY_STYLES)assert.match(css,new RegExp('ps-overlay-'+style));
 assert.match(tableau,/foilLayer\.dataset\.foilFinish=activeStyle/);
 assert.match(tableau,/face\.append\(image,foilLayer,artifactNote\)/);
 assert.match(css,/ps-card-front \.ps-card-art-overlay::after/);
 assert.match(css,/artemis-foil-drift 13\.7s/);
 assert.match(css,/mix-blend-mode:screen/);
 assert.doesNotMatch(overlay,/hue-rotate/);
 assert.match(overlay,/clearRect\(0,0,width,height\)/);
});

test('summoning transition has no cheap intermediary text card or glyph',async()=>{
 const veil=renderReadingHandoff();
 assert.match(veil,/reading-handoff-backdrop/);
 assert.match(veil,/reading-handoff-card-lights/);
 assert.match(veil,/reading-handoff-portal/);
 assert.match(veil,/data-art-slot="transition"/);
 assert.doesNotMatch(veil,/THE CARDS ARE READY TO SPEAK/);
 assert.doesNotMatch(veil,/reading-handoff-aura/);
 const css=await load('../preview/post-shuffle/reading-fidelity-v2.css');
 assert.match(css,/@keyframes artemis-summon-chamber/);
 assert.match(css,/@keyframes artemis-summon-particles/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('tabletop card perspective, portrait hierarchy and integrated HUD are independently testable',async()=>{
 const html=renderReadingStage({choices:picks,cardsById:BY_ID,demo,question:'How should I proceed?'});
 assert.equal((html.match(/class="reading-art-card-visual" data-tabletop-tilt-deg="42"/g)||[]).length,3);
 assert.equal((html.match(/class="reading-actual-card-face/g)||[]).length,3);
 const css=await load('../preview/post-shuffle/reading-fidelity-v2.css');
 assert.match(css,/rotateX\(42deg\)/);
 assert.match(css,/reading-art-card-visual::before/);
 assert.match(css,/reading-art-table-surface/);
 assert.match(css,/reading-art-portrait img/);
 assert.match(css,/reading-art-panel/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/@media\(max-height:760px\)/);
 const gate=await load('../preview/gate-b/index.html');
 const solo=await load('../preview/post-shuffle/index.html');
 assert.match(gate,/reading-fidelity-v2\.css/);
 assert.match(solo,/reading-fidelity-v2\.css/);
});
