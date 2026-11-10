import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {deckPose} from '../src/ritual-world/ShuffleChoreography.mjs';
import {ART_OVERLAY_STYLES,ART_OVERLAY_LABELS} from '../preview/post-shuffle/ArtOverlays.mjs';
import {nextArtOverlayStyle,FOIL_FINISHES,cardBrief} from '../preview/post-shuffle/TarotTableau.mjs';
import {HANDOFF_DURATION_MS,HANDOFF_SETTLE_MS,handoffAnchor,handoffFrames} from '../preview/post-shuffle/SelectionHandoff.mjs';

test('v3.4: suspended physical 78-card deck continues slow yaw',()=>{
 const cards=makeLandingCardEntities(DECK,2165840022);
 const a=deckPose(cards[0],24),b=deckPose(cards[0],37);
 assert.ok(Math.hypot(...a.attitude.normal.map((v,i)=>v-b.attitude.normal[i]))>.08);
 assert.ok(Math.hypot(...a.attitude.normal.map((v,i)=>v-b.attitude.normal[i]))<.45);
});
test('v3.4: four literal mystical art overlays, no chromatic hologram categories',()=>{
 assert.deepEqual(ART_OVERLAY_STYLES,[
  'celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'
 ]);
 assert.deepEqual(FOIL_FINISHES,ART_OVERLAY_STYLES);
 assert.equal(nextArtOverlayStyle('scroll-texture',1),'celestial-lattice');
 assert.equal(nextArtOverlayStyle('celestial-lattice',-1),'scroll-texture');
 for(const style of ART_OVERLAY_STYLES)assert.ok(ART_OVERLAY_LABELS[style]);
 assert.match(cardBrief('major-17'),/Hope/);
});
test('v3.4: selected-card handoff destinations use finite actual projected corners',()=>{
 const card={
  corners:[{x:210,y:180},{x:272,y:180},{x:272,y:286},{x:210,y:286}]
 };
 const from=handoffAnchor(card,{width:1280,height:720});
 assert.equal(from.x,210);assert.equal(from.y,180);
 assert.equal(from.width,62);assert.equal(from.height,106);
 const fallback=handoffAnchor(null,{width:1280,height:720},2);
 assert.ok(fallback.x>0&&fallback.y>0);
 const to={x:460,y:145,width:184,height:322};
 const f=handoffFrames(from,to);
 assert.equal(f.length,4);assert.ok(f.every(frame=>frame.transform.startsWith('translate(')));
 assert.equal(f[0].opacity,1);assert.equal(f.at(-1).opacity,0);
 assert.ok(HANDOFF_DURATION_MS>HANDOFF_SETTLE_MS,'tableau surfaces should appear before travelling ghosts disappear');
});
test('v3.4: no stage blink or second-deck resampling in three-pick transition',async()=>{
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const tableau=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const art=await readFile(new URL('../preview/post-shuffle/ArtOverlays.mjs',import.meta.url),'utf8');
 assert.match(scene,/pickAnchors\.set\(candidate\.id/);
 assert.match(scene,/createSelectionHandoff\(\{world,picks:lockFrame\.picks/);
 assert.match(scene,/lockFrame=\{time:t,yaw,pitch,picks:choices\.map/);
 assert.match(scene,/pickAnchors\.clear\(\)/);
 assert.match(scene,/tableau\.prepareHandoff\(\)/);
 assert.match(scene,/tableau\?\.finishHandoff\(\)/);
 assert.match(scene,/performance\.now\(\)-lockAt>=HANDOFF_SETTLE_MS/);
 assert.match(tableau,/prepareHandoff\(\)/);assert.match(tableau,/finishHandoff\(\)/);
 assert.match(css,/\.ps-tableau\.ps-handoff-prepared/);
 assert.match(css,/\.ps-handoff-card/);
 assert.match(css,/\.ps-vapor-cloud\.ps-vapor-near\{opacity:\.71/);
 assert.match(css,/\.ps-overlay-celestial-lattice/);
 assert.match(css,/\.ps-overlay-scroll-texture/);
 assert.match(art,/clearRect\(0,0,width,height\)/);
 assert.doesNotMatch(tableau,/ps-card-hologram ps-card-foil/);
 assert.match(tableau,/assets\/rws\//);
});
